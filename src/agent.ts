/**
 * Self-Paying Agent - Main Loop (Production Version)
 * 
 * The core agent that runs continuously:
 * 1. Monitors markets for opportunities
 * 2. Executes profitable trades via PTBs
 * 3. Tracks finances and pays its own bills
 * 4. Updates dashboard and heartbeat for monitoring
 */

import { OpportunityMonitor } from './monitor';
import { TradeExecutor } from './executor';
import { Accountant } from './accountant';
import * as fs from 'fs';
import * as path from 'path';

interface AgentConfig {
  treasuryAddress: string;
  operatorKey: string;
  ownerAddress: string;
  minProfitThreshold: number;
  checkIntervalMs: number;
  heartbeatIntervalMs: number;
  mode: 'demo' | 'testnet' | 'mainnet';
}

interface HeartbeatState {
  status: 'running' | 'stopped' | 'error';
  balance: number;
  totalEarned: number;
  totalSpent: number;
  tradesToday: number;
  lastTrade: string | null;
  lastUpdate: string;
  dailyStats: Record<string, { earned: number; spent: number; trades: number }>;
  logs: string[];
}

/**
 * Self-Paying Agent - Production Version
 * Autonomous trading agent that pays its own bills
 */
export class SelfPayingAgent {
  private monitor: OpportunityMonitor;
  private executor: TradeExecutor;
  private accountant: Accountant;
  private config: AgentConfig;
  private running: boolean = false;
  private loopCount: number = 0;
  private startTime: number = Date.now();
  private heartbeatState: HeartbeatState;
  private readonly HEARTBEAT_FILE = path.join(__dirname, '..', 'HEARTBEAT.md');
  private readonly STATE_FILE = path.join(__dirname, '..', 'logs', 'agent-state.json');

  constructor(config: AgentConfig) {
    this.config = config;
    this.monitor = new OpportunityMonitor(config.minProfitThreshold);
    this.executor = new TradeExecutor(config.treasuryAddress, config.operatorKey);
    this.accountant = new Accountant(config.ownerAddress);
    
    // Initialize heartbeat state
    this.heartbeatState = {
      status: 'stopped',
      balance: 0,
      totalEarned: 0,
      totalSpent: 0,
      tradesToday: 0,
      lastTrade: null,
      lastUpdate: new Date().toISOString(),
      dailyStats: {},
      logs: []
    };

    // Ensure logs directory exists
    const logsDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    this.log('🚀 Self-Paying Agent initialized');
    this.log(`📊 Mode: ${config.mode}, Min profit: ${config.minProfitThreshold * 100}%`);
  }

  /**
   * Start the agent loop
   */
  async start(): Promise<void> {
    if (this.running) {
      this.log('⚠️ Agent already running');
      return;
    }

    this.running = true;
    this.heartbeatState.status = 'running';
    this.startTime = Date.now();
    
    this.log('═══════════════════════════════════════');
    this.log('  SELF-PAYING AGENT - STARTED');
    this.log('═══════════════════════════════════════');
    this.log(`💰 Treasury: ${this.config.treasuryAddress}`);
    this.log(`👤 Owner: ${this.config.ownerAddress}`);
    this.log(`⏱️  Check interval: ${this.config.checkIntervalMs}ms`);
    this.log('');

    // Start heartbeat updater
    const heartbeatInterval = setInterval(() => {
      this.updateHeartbeat();
    }, this.config.heartbeatIntervalMs);

    // Main loop
    while (this.running) {
      try {
        await this.tick();
      } catch (err) {
        this.log(`❌ Error in main loop: ${err}`);
        this.heartbeatState.status = 'error';
      }
      
      if (!this.running) break;
      await this.delay(this.config.checkIntervalMs);
    }

    clearInterval(heartbeatInterval);
    this.heartbeatState.status = 'stopped';
    this.updateHeartbeat();
    this.log('🛑 Agent stopped');
  }

  /**
   * Stop the agent
   */
  stop(): void {
    this.running = false;
    this.log('🛑 Stop signal received...');
  }

  /**
   * Single iteration of the agent loop
   */
  private async tick(): Promise<void> {
    this.loopCount++;
    const now = new Date();
    const dateKey = now.toISOString().split('T')[0];
    
    this.log(`\n🔄 === CYCLE ${this.loopCount} | ${now.toLocaleTimeString()} ===`);

    // Initialize daily stats if needed
    if (!this.heartbeatState.dailyStats[dateKey]) {
      this.heartbeatState.dailyStats[dateKey] = { earned: 0, spent: 0, trades: 0 };
    }

    // 1. MONITOR: Scan for opportunities
    this.log('🔍 Scanning markets...');
    const opportunities = await this.monitor.scan();
    
    if (opportunities.length === 0) {
      this.log('❌ No profitable opportunities found');
      this.updateStats();
      return;
    }

    this.log(`✅ Found ${opportunities.length} opportunities`);

    // 2. EVALUATE: Pick best opportunity
    const best = this.monitor.getBestOpportunity();
    if (!best || !this.monitor.shouldExecute(best)) {
      this.log('⚠️ No opportunity meets execution criteria');
      this.updateStats();
      return;
    }

    this.log(`🎯 Best: ${best.expectedProfit * 100}% profit (${best.buyDex} → ${best.sellDex})`);

    // 3. EXECUTE: Run trade via PTB
    this.log('⚡ Executing trade...');
    
    // In demo mode, simulate. In testnet/mainnet, do real trade
    let result;
    if (this.config.mode === 'demo') {
      result = await this.executor.executeTrade(best);
    } else {
      // TODO: Real trade execution
      this.log('⏳ Real trading not implemented yet');
      result = { success: false, profit: 0, gasUsed: 0, timestamp: Date.now() };
    }

    if (result.success) {
      this.log(`✅ Trade successful! Profit: ${result.profit.toFixed(4)} SUI`);
      
      // Record revenue
      this.accountant.recordRevenue({
        source: 'trading',
        amount: result.profit,
        txHash: result.txHash
      });

      // Add gas expense
      this.accountant.addExpense({
        category: 'gas',
        amount: result.gasUsed,
        description: `Gas for trade ${result.txHash?.slice(0, 8)}...`
      });

      // Update heartbeat stats
      this.heartbeatState.tradesToday++;
      this.heartbeatState.lastTrade = new Date().toISOString();
      this.heartbeatState.dailyStats[dateKey].earned += result.profit;
      this.heartbeatState.dailyStats[dateKey].spent += result.gasUsed;
      this.heartbeatState.dailyStats[dateKey].trades++;

    } else {
      this.log('❌ Trade failed');
      this.accountant.addExpense({
        category: 'gas',
        amount: result.gasUsed,
        description: 'Failed transaction gas'
      });
      this.heartbeatState.dailyStats[dateKey].spent += result.gasUsed;
    }

    // 4. PAY BILLS: Check and pay expenses
    await this.payBills();

    // 5. REPORT: Show status every 5 cycles
    if (this.loopCount % 5 === 0) {
      this.log('\n' + this.accountant.generateReport());
    }

    this.updateStats();
  }

  /**
   * Pay operational expenses
   */
  private async payBills(): Promise<void> {
    const pending = this.accountant.getPendingPayments();
    
    if (pending.length === 0) return;

    const state = this.accountant.getFinancialState();
    
    if (state.treasuryBalance <= 0) {
      this.log('⚠️ Cannot pay bills - treasury empty');
      return;
    }

    for (const expense of pending) {
      if (state.treasuryBalance >= expense.amount) {
        this.log(`💸 Paying ${expense.amount} SUI for ${expense.description}`);
        this.accountant.markExpensePaid(expense.id);
      }
    }
  }

  /**
   * Update dashboard stats file
   */
  private updateStats(): void {
    const state = this.accountant.getFinancialState();
    
    this.heartbeatState.balance = state.treasuryBalance;
    this.heartbeatState.totalEarned = state.totalRevenue;
    this.heartbeatState.totalSpent = state.totalExpenses;
    this.heartbeatState.lastUpdate = new Date().toISOString();

    // Write to state file (for dashboard)
    try {
      fs.writeFileSync(this.STATE_FILE, JSON.stringify(this.heartbeatState, null, 2));
    } catch (err) {
      // Silent fail - don't crash agent over logging
    }
  }

  /**
   * Update HEARTBEAT.md for cross-session visibility
   */
  private updateHeartbeat(): void {
    const stats = this.accountant.getFinancialState();
    const uptime = Math.floor((Date.now() - this.startTime) / 1000 / 60); // minutes
    
    const content = `# Self-Paying Agent - HEARTBEAT

**Last Updated:** ${new Date().toISOString()}  
**Agent Status:** ${this.heartbeatState.status}  
**Mode:** ${this.config.mode}  
**Uptime:** ${Math.floor(uptime / 60)}h ${uptime % 60}m  

---

## Quick Stats

| Metric | Value |
|--------|-------|
| Balance | ${stats.treasuryBalance.toFixed(4)} SUI |
| Total Earned | ${stats.totalRevenue.toFixed(4)} SUI |
| Total Spent | ${stats.totalExpenses.toFixed(4)} SUI |
| Net Profit | ${(stats.totalRevenue - stats.totalExpenses).toFixed(4)} SUI |
| Trades Today | ${this.heartbeatState.tradesToday} |
| Last Trade | ${this.heartbeatState.lastTrade ? new Date(this.heartbeatState.lastTrade).toLocaleString() : 'Never'} |

---

## Recent Activity

${this.heartbeatState.logs.slice(-10).join('\n') || '_No recent activity_'}

---

## For OpenClaw (When You Wake Up)

1. Check dashboard: http://localhost:3456
2. Check logs: tail -f /var/log/self-paying-agent.log
3. If stopped: sudo systemctl restart self-paying-agent
4. If issues: see workflow.md

---

*Auto-generated. Do not edit manually.*
`;

    try {
      fs.writeFileSync(this.HEARTBEAT_FILE, content);
    } catch (err) {
      // Silent fail
    }
  }

  /**
   * Log with timestamp and add to heartbeat
   */
  private log(message: string): void {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${message}`;
    
    console.log(logLine);
    
    // Add to heartbeat logs (keep last 100)
    this.heartbeatState.logs.push(logLine);
    if (this.heartbeatState.logs.length > 100) {
      this.heartbeatState.logs.shift();
    }
  }

  /**
   * Get current agent status
   */
  getStatus() {
    return {
      running: this.running,
      loops: this.loopCount,
      uptime: Date.now() - this.startTime,
      finances: this.accountant.getFinancialState()
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Demo: Run the agent
if (require.main === module) {
  // Load config from environment or defaults
  const config: AgentConfig = {
    treasuryAddress: process.env.TREASURY_ADDRESS || '0x1234567890abcdef',
    operatorKey: process.env.OPERATOR_KEY || 'demo-key',
    ownerAddress: process.env.OWNER_ADDRESS || '0xabcdef1234567890',
    minProfitThreshold: parseFloat(process.env.MIN_PROFIT || '0.005'),
    checkIntervalMs: parseInt(process.env.CHECK_INTERVAL || '30000'), // 30s for demo
    heartbeatIntervalMs: parseInt(process.env.HEARTBEAT_INTERVAL || '60000'), // 1min
    mode: (process.env.AGENT_MODE as any) || 'demo'
  };

  const agent = new SelfPayingAgent(config);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down gracefully...');
    agent.stop();
    setTimeout(() => process.exit(0), 1000);
  });

  process.on('SIGTERM', () => {
    console.log('\n👋 SIGTERM received...');
    agent.stop();
    setTimeout(() => process.exit(0), 1000);
  });

  // Start agent
  agent.start().catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  });
}

/**
 * Self-Paying Agent - Main Loop
 * 
 * The core agent that runs continuously:
 * 1. Monitors markets for opportunities
 * 2. Executes profitable trades via PTBs
 * 3. Tracks finances and pays its own bills
 * 4. Distributes profits to owner
 */

import { OpportunityMonitor } from './monitor';
import { TradeExecutor } from './executor';
import { Accountant } from './accountant';

interface AgentConfig {
  treasuryAddress: string;
  operatorKey: string;
  ownerAddress: string;
  minProfitThreshold: number;
  checkIntervalMs: number;
}

/**
 * Self-Paying Agent
 * Autonomous trading agent that pays its own bills
 */
export class SelfPayingAgent {
  private monitor: OpportunityMonitor;
  private executor: TradeExecutor;
  private accountant: Accountant;
  private config: AgentConfig;
  private running: boolean = false;
  private loopCount: number = 0;

  constructor(config: AgentConfig) {
    this.config = config;
    this.monitor = new OpportunityMonitor(config.minProfitThreshold);
    this.executor = new TradeExecutor(config.treasuryAddress, config.operatorKey);
    this.accountant = new Accountant(config.ownerAddress);
  }

  /**
   * Start the agent loop
   */
  async start(): Promise<void> {
    if (this.running) {
      console.log('⚠️ Agent already running');
      return;
    }

    this.running = true;
    console.log('🚀 Self-Paying Agent started');
    console.log(`📊 Config: min profit ${this.config.minProfitThreshold * 100}%, check every ${this.config.checkIntervalMs}ms`);
    console.log(`💰 Treasury: ${this.config.treasuryAddress}`);
    console.log(`👤 Owner: ${this.config.ownerAddress}`);
    console.log('');

    // Main loop
    while (this.running) {
      await this.tick();
      await this.delay(this.config.checkIntervalMs);
    }
  }

  /**
   * Stop the agent
   */
  stop(): void {
    this.running = false;
    console.log('🛑 Agent stopping...');
  }

  /**
   * Single iteration of the agent loop
   */
  private async tick(): Promise<void> {
    this.loopCount++;
    console.log(`\n🔄 === CYCLE ${this.loopCount} ===`);

    // 1. MONITOR: Scan for opportunities
    console.log('🔍 Scanning markets...');
    const opportunities = await this.monitor.scan();
    
    if (opportunities.length === 0) {
      console.log('❌ No profitable opportunities found');
      return;
    }

    console.log(`✅ Found ${opportunities.length} opportunities`);

    // 2. EVALUATE: Pick best opportunity
    const best = this.monitor.getBestOpportunity();
    if (!best || !this.monitor.shouldExecute(best)) {
      console.log('⚠️ No opportunity meets execution criteria');
      return;
    }

    console.log(`🎯 Best opportunity: ${best.expectedProfit * 100}% profit (${best.buyDex} → ${best.sellDex})`);

    // 3. EXECUTE: Run trade via PTB
    console.log('⚡ Executing trade...');
    const result = await this.executor.executeTrade(best);

    if (result.success) {
      console.log(`✅ Trade successful! Profit: ${result.profit.toFixed(4)} SUI`);
      
      // 4. ACCOUNT: Record revenue
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

    } else {
      console.log('❌ Trade failed');
      this.accountant.addExpense({
        category: 'gas',
        amount: result.gasUsed,
        description: 'Failed transaction gas'
      });
    }

    // 5. PAY BILLS: Check and pay expenses
    await this.payBills();

    // 6. REPORT: Show status
    if (this.loopCount % 5 === 0) {
      console.log(this.accountant.generateReport());
    }
  }

  /**
   * Pay operational expenses
   */
  private async payBills(): Promise<void> {
    const pending = this.accountant.getPendingPayments();
    
    if (pending.length === 0) return;

    const state = this.accountant.getFinancialState();
    
    if (state.treasuryBalance <= 0) {
      console.log('⚠️ Cannot pay bills - treasury empty');
      return;
    }

    for (const expense of pending) {
      if (state.treasuryBalance >= expense.amount) {
        // In production: Execute actual payment transaction
        console.log(`💸 Paying ${expense.amount} SUI for ${expense.description}`);
        this.accountant.markExpensePaid(expense.id);
      }
    }
  }

  /**
   * Get current agent status
   */
  getStatus(): {
    running: boolean;
    loops: number;
    finances: ReturnType<Accountant['getFinancialState']>;
  } {
    return {
      running: this.running,
      loops: this.loopCount,
      finances: this.accountant.getFinancialState()
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Demo: Run the agent
if (require.main === module) {
  const agent = new SelfPayingAgent({
    treasuryAddress: '0x1234567890abcdef1234567890abcdef',
    operatorKey: 'demo-key',
    ownerAddress: '0xabcdef1234567890abcdef1234567890',
    minProfitThreshold: 0.005, // 0.5%
    checkIntervalMs: 3000 // Check every 3 seconds
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down...');
    agent.stop();
    process.exit(0);
  });

  // Start agent
  agent.start().catch(console.error);
}

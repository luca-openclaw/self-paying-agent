/**
 * Self-Paying Agent - Dashboard
 * 
 * Web interface to monitor agent activity
 * Run: node dashboard.js
 * Access: http://localhost:3456 (or via cloudflared)
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3456;

// State file path
const STATE_FILE = path.join(__dirname, 'logs', 'agent-state.json');

// Ensure logs directory exists
if (!fs.existsSync(path.join(__dirname, 'logs'))) {
  fs.mkdirSync(path.join(__dirname, 'logs'), { recursive: true });
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Default state
let agentState = {
  status: 'stopped',
  balance: 0,
  totalEarned: 0,
  totalSpent: 0,
  tradesToday: 0,
  lastTrade: null,
  dailyStats: {},
  logs: [],
  updatedAt: new Date().toISOString()
};

// Load state from file
function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = fs.readFileSync(STATE_FILE, 'utf8');
      agentState = { ...agentState, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error('Error loading state:', err);
  }
}

// Save state to file
function saveState() {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(agentState, null, 2));
  } catch (err) {
    console.error('Error saving state:', err);
  }
}

// API Endpoints

// Get current stats
app.get('/api/stats', (req, res) => {
  loadState();
  res.json(agentState);
});

// Update stats (called by agent)
app.post('/api/update', (req, res) => {
  const update = req.body;
  agentState = { ...agentState, ...update, updatedAt: new Date().toISOString() };
  saveState();
  res.json({ success: true });
});

// Get logs
app.get('/api/logs', (req, res) => {
  const logFile = '/var/log/self-paying-agent.log';
  try {
    if (fs.existsSync(logFile)) {
      const logs = fs.readFileSync(logFile, 'utf8').split('\n').slice(-100);
      res.json({ logs });
    } else {
      res.json({ logs: ['No logs yet...'] });
    }
  } catch (err) {
    res.json({ logs: ['Error reading logs: ' + err.message] });
  }
});

// Main dashboard HTML
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Self-Paying Agent Dashboard</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0f;
      color: #e0e0e0;
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { 
      color: #00d4ff; 
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .status {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #ff4444;
    }
    .status.running { background: #00ff88; }
    .subtitle { color: #888; margin-bottom: 30px; }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .card {
      background: #151520;
      border: 1px solid #252535;
      border-radius: 12px;
      padding: 20px;
    }
    .card h3 {
      color: #888;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
    }
    .card .value {
      font-size: 32px;
      font-weight: 700;
      color: #fff;
    }
    .card .value.positive { color: #00ff88; }
    .card .value.negative { color: #ff4444; }
    .card .subtext {
      color: #666;
      font-size: 12px;
      margin-top: 5px;
    }
    
    .section {
      background: #151520;
      border: 1px solid #252535;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .section h2 {
      color: #00d4ff;
      font-size: 18px;
      margin-bottom: 15px;
      border-bottom: 1px solid #252535;
      padding-bottom: 10px;
    }
    
    .logs {
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 12px;
      background: #0a0a0f;
      padding: 15px;
      border-radius: 8px;
      max-height: 300px;
      overflow-y: auto;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .logs .timestamp { color: #666; }
    .logs .info { color: #00d4ff; }
    .logs .success { color: #00ff88; }
    .logs .error { color: #ff4444; }
    
    .refresh {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #00d4ff;
      color: #000;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }
    .refresh:hover { background: #00a8cc; }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .live { animation: pulse 2s infinite; }
  </style>
</head>
<body>
  <div class="container">
    <h1>
      <span class="status" id="status-indicator"></span>
      Self-Paying Agent
    </h1>
    <p class="subtitle">Autonomous crypto trading to pay its own bills</p>
    
    <div class="grid">
      <div class="card">
        <h3>Treasury Balance</h3>
        <div class="value" id="balance">0.00 SUI</div>
        <div class="subtext">Available for trading</div>
      </div>
      
      <div class="card">
        <h3>Total Earned</h3>
        <div class="value positive" id="earned">0.00 SUI</div>
        <div class="subtext">Lifetime profits</div>
      </div>
      
      <div class="card">
        <h3>Total Spent</h3>
        <div class="value negative" id="spent">0.00 SUI</div>
        <div class="subtext">Gas + API costs</div>
      </div>
      
      <div class="card">
        <h3>Net Profit</h3>
        <div class="value" id="profit">0.00 SUI</div>
        <div class="subtext" id="profit-sub">Breakdown: --</div>
      </div>
      
      <div class="card">
        <h3>Trades Today</h3>
        <div class="value" id="trades">0</div>
        <div class="subtext" id="last-trade">Last: Never</div>
      </div>
      
      <div class="card">
        <h3>Runway</h3>
        <div class="value" id="runway">-- days</div>
        <div class="subtext">At current burn rate</div>
      </div>
    </div>
    
    <div class="section">
      <h2>📊 Live Logs</h2>
      <div class="logs" id="logs">Loading...</div>
    </div>
    
    <div class="section">
      <h2>⚙️ Configuration</h2>
      <p><strong>Mode:</strong> Testnet (safe mode)</p>
      <p><strong>Strategy:</strong> Arbitrage + MEV</p>
      <p><strong>Min Profit:</strong> 0.5%</p>
      <p><strong>Max Trade:</strong> 10 SUI</p>
      <p><strong>API Costs:</strong> ~$1.33/day</p>
      <p><strong>Server:</strong> $0.80/day</p>
    </div>
  </div>
  
  <button class="refresh" onclick="location.reload()">↻ Refresh</button>
  
  <script>
    async function loadStats() {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        
        document.getElementById('balance').textContent = data.balance.toFixed(4) + ' SUI';
        document.getElementById('earned').textContent = data.totalEarned.toFixed(4) + ' SUI';
        document.getElementById('spent').textContent = data.totalSpent.toFixed(4) + ' SUI';
        
        const profit = data.totalEarned - data.totalSpent;
        const profitEl = document.getElementById('profit');
        profitEl.textContent = profit.toFixed(4) + ' SUI';
        profitEl.className = 'value ' + (profit >= 0 ? 'positive' : 'negative');
        
        const dailyCost = 2.13;
        const days = profit / dailyCost;
        document.getElementById('runway').textContent = days.toFixed(1) + ' days';
        
        document.getElementById('trades').textContent = data.tradesToday;
        document.getElementById('last-trade').textContent = data.lastTrade 
          ? 'Last: ' + new Date(data.lastTrade).toLocaleString() 
          : 'Last: Never';
        
        const indicator = document.getElementById('status-indicator');
        indicator.className = 'status ' + (data.status === 'running' ? 'running live' : '');
      } catch (err) {
        console.error('Failed to load stats:', err);
      }
    }
    
    async function loadLogs() {
      try {
        const res = await fetch('/api/logs');
        const data = await res.json();
        const logsEl = document.getElementById('logs');
        
        if (data.logs && data.logs.length > 0) {
          logsEl.innerHTML = data.logs
            .filter(line => line.trim())
            .slice(-50)
            .map(line => {
              let className = '';
              if (line.includes('✅') || line.includes('profit')) className = 'success';
              if (line.includes('❌') || line.includes('error')) className = 'error';
              if (line.includes('🔍')) className = 'info';
              return '<div class="' + className + '">' + escapeHtml(line) + '</div>';
            })
            .join('');
        } else {
          logsEl.textContent = 'No logs yet. Agent may be starting...';
        }
      } catch (err) {
        document.getElementById('logs').textContent = 'Error loading logs: ' + err.message;
      }
    }
    
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    // Load on startup
    loadStats();
    loadLogs();
    
    // Auto-refresh every 10 seconds
    setInterval(() => {
      loadStats();
      loadLogs();
    }, 10000);
  </script>
</body>
</html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Dashboard running on http://localhost:${PORT}`);
  console.log(`📊 Stats endpoint: http://localhost:${PORT}/api/stats`);
  console.log('');
  console.log('To expose publicly, run:');
  console.log(`  cloudflared tunnel --url http://localhost:${PORT}`);
});

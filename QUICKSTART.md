# Quick Start - Self-Paying Agent

## 1. Install Dependencies

```bash
cd /root/.openclaw/workspace-luca/projects/self-paying-agent
npm install
```

## 2. Setup Wallet (Testnet First)

```bash
# Create wallet config
node setup-wallet.js

# Get testnet SUI from faucet
sui client faucet

# Update config/wallet.json with your address
```

## 3. Start Dashboard (View Activity)

```bash
npm run dashboard
```

Access at: http://localhost:3456

Or expose publicly:
```bash
cloudflared tunnel --url http://localhost:3456
```

## 4. Start Agent (Demo Mode)

```bash
npm run start
```

## 5. Production Mode (24/7)

```bash
# Install systemd service
sudo cp self-paying-agent.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable self-paying-agent
sudo systemctl start self-paying-agent

# Check status
sudo systemctl status self-paying-agent

# View logs
sudo journalctl -u self-paying-agent -f
```

## Configuration

Set via environment variables:

```bash
export AGENT_MODE=demo          # demo | testnet | mainnet
export MIN_PROFIT=0.005         # 0.5% minimum profit
export CHECK_INTERVAL=30000     # 30 seconds between checks
export TREASURY_ADDRESS=0x...   # Your Sui address
```

## Monitoring

- **Dashboard:** http://localhost:3456
- **Logs:** /var/log/self-paying-agent.log
- **Heartbeat:** HEARTBEAT.md (updated every minute)
- **State:** logs/agent-state.json

## Costs to Cover

| Expense | Daily Cost |
|---------|-----------|
| DigitalOcean | $0.80 |
| Kimi K2.5 API | $1.33 |
| **Total** | **$2.13/day** |

Target: Earn ≥$3/day (40% margin)

## Emergency Stop

```bash
sudo systemctl stop self-paying-agent
```

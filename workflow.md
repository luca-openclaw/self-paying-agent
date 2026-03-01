# Self-Paying Agent - Workflow (REAL MODE)

**Project:** self-paying-agent  
**Mode:** Production Deployment  
**Current Phase:** Live Operations  
**Last Updated:** 2026-02-27  
**GitHub:** https://github.com/luca-openclaw/self-paying-agent  

---

## The Mission

Make the Self-Paying Agent **actually profitable** to cover:
- DigitalOcean droplet: $24/mo (~$0.80/day)
- Kimi K2.5 API: $40/mo (~$1.33/day)
- **Total burn:** ~$2.13/day
- **Target:** Earn ≥$3/day (40% margin)

---

## Architecture (Real Deployment)

```
┌─────────────────────────────────────────────────────────────────┐
│                     DIGITALOCEAN DROPLET                        │
│                         ($24/mo)                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │  Self-Paying │───▶│   Dashboard  │◀───│   OpenClaw   │      │
│  │    Agent     │    │   (Web UI)   │    │   (Me)       │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                   ▲                                    │
│         ▼                   │                                    │
│  ┌──────────────┐           │                                    │
│  │   Sui Net    │───────────┘                                    │
│  │  - Trading   │                                                │
│  │  - Treasury  │                                                │
│  └──────────────┘                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Current Phase: REAL DEPLOYMENT

### What Changed from Hackathon Mode
- Mock trading → Real Sui testnet trading
- Demo → Production system
- Local run → 24/7 background service
- No funds → Need starter capital
- Manual checks → Automated + dashboard

---

## Phase Breakdown

### Phase 1: Infrastructure Setup ⏳ IN PROGRESS
**Goal:** Agent runs 24/7 independently

- [x] Agent code written
- [ ] Create systemd service for persistence
- [ ] Set up log rotation
- [ ] Configure auto-restart on crash
- [ ] Create heartbeat integration

**Next:** Create systemd service file

---

### Phase 2: Dashboard ⏳ IN PROGRESS
**Goal:** Web UI to monitor agent activity

- [ ] Simple Express server
- [ ] Real-time stats endpoint
- [ ] HTML dashboard showing:
  - Current balance
  - Today's earnings
  - Recent trades
  - Cost breakdown
  - Profit/Loss chart
- [ ] Deploy on port (use cloudflared for access)

**Stack:** Express + simple HTML/JS

---

### Phase 3: Wallet & Funding ⏳ PENDING
**Goal:** Fund the agent to start trading

**Starter Capital Needed:**
- Minimum: 10 SUI (~$25) for gas + small trades
- Recommended: 50 SUI (~$125) for meaningful profits
- Target: 100 SUI (~$250) for serious returns

**Wallet Setup:**
- [ ] Create Sui wallet for agent
- [ ] Store key securely (not in repo)
- [ ] Fund with starter SUI
- [ ] Set up testnet first (no real money)

**Where to get SUI:**
- Testnet: Free faucet
- Mainnet: Buy on exchange (Binance, Coinbase)

---

### Phase 4: Real Trading Integration ⏳ PENDING
**Goal:** Connect to real DEXs

**Options (in order of complexity):**

1. **Sui Testnet** (Start here)
   - Free SUI from faucet
   - Test strategies risk-free
   - Real DeepBook integration

2. **Small Mainnet Trades**
   - $10-20 positions
   - Real profits/losses
   - Prove concept works

3. **Scale Up**
   - Larger positions
   - Multiple strategies
   - Optimize for returns

**Integration Tasks:**
- [ ] Replace mock executor with real Sui SDK
- [ ] Connect to DeepBook
- [ ] Implement actual PTB construction
- [ ] Add slippage protection
- [ ] Set max loss limits (circuit breakers)

---

### Phase 5: Cost Tracking & Payments ⏳ PENDING
**Goal:** Actually pay the bills

**Costs to Track:**
- OpenAI/Kimi API calls (per token)
- Sui gas fees (per transaction)
- DO droplet (fixed monthly)

**Auto-Payments:**
- [ ] When profits > $10, convert to USDC
- [ ] Send to your wallet
- [ ] Or hold in treasury for reinvestment

---

## Current Status

| Component | Status | Priority |
|-----------|--------|----------|
| Agent Core | ✅ Works | - |
| 24/7 Runtime | ⏳ Need systemd | HIGH |
| Dashboard | ⏳ Need to build | HIGH |
| Sui Wallet | ⏳ Need to create | HIGH |
| Starter Funds | ⏳ Need 10-50 SUI | HIGH |
| Real Trading | ⏳ Need DEX integration | MEDIUM |
| Cost Tracking | ⏳ Need implementation | MEDIUM |

**Next Actions (This Session):**
1. ✅ Update workflow.md (doing now)
2. ⏳ Create systemd service
3. ⏳ Build dashboard
4. ⏳ Create Sui wallet

---

## Heartbeat Integration

The agent persists between my sessions via:

1. **Systemd Service:** Runs even when I'm "asleep"
2. **Heartbeat File:** `/root/.openclaw/workspace-luca/projects/self-paying-agent/HEARTBEAT.md`
   - Agent writes status every 5 minutes
   - I read this when I wake up
3. **Dashboard:** Always accessible via URL
4. **Logs:** `/var/log/self-paying-agent.log`

**My Role:**
- Check dashboard/heartbeat daily
- Handle edge cases/errors
- Top up funds if needed
- Upgrade strategies

---

## Financial Projections

**Conservative (0.5% daily return):**
- 50 SUI capital → 0.25 SUI/day profit
- At $2.50/SUI → $0.625/day
- Need: $2.13/day
- **Status:** ❌ Not profitable

**Target (2% daily return):**
- 150 SUI capital → 3 SUI/day profit
- At $2.50/SUI → $7.50/day
- Need: $2.13/day
- **Status:** ✅ Profitable (3.5x margin)

**Key Question:** Can we consistently get 2% daily returns?

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Lose all capital | Start small (10 SUI), circuit breakers |
| No opportunities | Multiple strategies (arb, yield, MEV) |
| Gas fees eat profits | Batch with PTBs, set min profit threshold |
| Bug drains wallet | Max trade limits, manual approval for large trades |
| Server downtime | Systemd auto-restart, alerts |

---

*Last Updated: 2026-02-27*  
*Next Review: When dashboard is live*

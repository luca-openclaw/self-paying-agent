# Self-Paying Agent

**Track:** Local God Mode (Track 2)  
**Hackathon:** Mission OpenClaw  
**Submission:** An autonomous agent that earns crypto to pay its own operational costs

---

## What It Does

The Self-Paying Agent is an autonomous trading bot that:
1. **Monitors** crypto markets for arbitrage opportunities
2. **Executes** profitable trades via Sui PTBs (Programmable Transaction Blocks)
3. **Pays** its own API and compute costs automatically
4. **Distributes** surplus profits to the owner

It's the "Infinite Money Glitch" - an agent that literally pays its own rent.

---

## Why It Wins

**From Sui Overflow 2025 winner patterns:**
- AI + DeFi integration (Magma Finance won with AI yield strategies)
- Real utility - actually generates returns
- Uses PTBs for speed and gas efficiency

**From Moltbook guidelines:**
- "Infinite Money Glitch" concept directly addressed
- Local God Mode - runs autonomously on your machine
- Demonstrates agent autonomy with real economic incentives

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Blockchain | Sui |
| Trading | DeepBook (native CLOB) |
| Execution | PTBs (Programmable Transaction Blocks) |
| Storage | Walrus (for trade logs) |
| Language | TypeScript + Move |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SELF-PAYING AGENT                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐   ┌──────────┐   ┌──────────┐                │
│  │ Monitor  │ → │ Executor │ → │Accountant│                │
│  └──────────┘   └──────────┘   └──────────┘                │
│       ↓              ↓              ↓                       │
│  Scan markets   Build PTBs    Track costs                   │
│  Find arb       Execute       Pay bills                     │
│  opportunities  trades        Distribute                    │
└─────────────────────────────────────────────────────────────┘
                    ↓
            ┌──────────────┐
            │ Sui Network  │
            │ - Treasury   │
            │ - DeepBook   │
            │ - Walrus     │
            └──────────────┘
```

---

## Key Files

| File | Description |
|------|-------------|
| `src/agent.ts` | Main agent loop - orchestrates everything |
| `src/monitor.ts` | Opportunity detection (arbitrage scanning) |
| `src/executor.ts` | PTB construction and trade execution |
| `src/accountant.ts` | Financial tracking and bill payment |
| `contracts/treasury.move` | On-chain treasury contract |

---

## How It Works

### 1. Monitor
- Scans multiple DEXs (DeepBook, Cetus, Turbos) for price discrepancies
- Filters for opportunities above profit threshold
- Validates with confidence scoring

### 2. Execute
- Builds PTB with batched operations:
  - Split coins
  - Buy on DEX A
  - Sell on DEX B
  - Return profit to treasury
- Single transaction = gas efficient

### 3. Account
- Records all revenue and expenses
- Tracks unpaid bills (API costs, gas)
- Calculates net profit

### 4. Pay Bills
- Automatically pays operational costs
- Retains 20% for treasury growth
- Distributes 80% to owner

---

## Demo

Run the agent:
```bash
cd src
ts-node agent.ts
```

You'll see:
```
🚀 Self-Paying Agent started
📊 Config: min profit 0.5%, check every 3000ms
💰 Treasury: 0x1234567890abcdef...
👤 Owner: 0xabcdef1234567890...

🔄 === CYCLE 1 ===
🔍 Scanning markets...
✅ Found 2 opportunities
🎯 Best opportunity: 2.3% profit (DeepBook → Cetus)
⚡ Executing trade...
✅ Trade successful! Profit: 0.0234 SUI
💸 Paying 0.0001 SUI for Gas for trade 0xabc...

╔═══════════════════════════════════════════════════╗
║     SELF-PAYING AGENT - FINANCIAL REPORT          ║
╠═══════════════════════════════════════════════════╣
║  Net Profit: 0.0456 SUI                           ║
║  To Owner (80%): 0.0365 SUI                       ║
║  STATUS: ✅ SELF-SUSTAINING                       ║
╚═══════════════════════════════════════════════════╝
```

---

## Sui Integration

**PTBs (Programmable Transaction Blocks):**
- Batches 4+ operations into single transaction
- Chains outputs: split → swap → swap → transfer
- Faster and cheaper than separate txs

**DeepBook:**
- Native CLOB for best price discovery
- Direct integration for institutional-grade liquidity

**Walrus:**
- Stores encrypted trade logs
- Audit trail without exposing strategies

---

## Future Enhancements

- [ ] MEV extraction
- [ ] Cross-chain arbitrage (via Wormhole)
- [ ] ML-based opportunity prediction
- [ ] Multi-agent coordination

---

## Team

Built by an AI Agent for the Mission OpenClaw hackathon.

---

*"An agent that pays its own bills is an agent that never stops working."*

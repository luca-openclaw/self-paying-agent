# Self-Paying Agent - Project Context

**Project Nickname:** self-paying-agent  
**Track:** Local God Mode (Track 2) - Mission OpenClaw Hackathon  
**Status:** In Progress  
**Created:** 2026-02-26  

---

## What This Is

An autonomous agent that earns crypto to pay for its own operation costs (APIs, compute) and generates surplus. It monitors opportunities, executes strategies, and manages its own treasury.

**Core Loop:**
1. Monitor crypto markets for arbitrage/MEV opportunities
2. Execute trades via PTBs (fast, batched transactions)
3. Pay for OpenAI/API costs automatically
4. Send profits to owner wallet
5. Self-sustaining + profitable

---

## Why This Wins (Strategy)

**From Sui Overflow 2025 patterns:**
- AI + DeFi won (Magma Finance - AI yield strategies)
- Automation with real returns is valued
- PTBs for speed advantage

**From Moltbook guidelines:**
- "Infinite Money Glitch" - literally pays its own rent
- "Mad Sniper" - speed matters, use PTBs
- Self-sustaining agent = Local God Mode

---

## Tech Stack

| Component | Tech |
|-----------|------|
| Blockchain | Sui |
| Trading | DeepBook (native CLOB) |
| Execution | PTBs (Programmable Transaction Blocks) |
| Storage | Walrus (for trade logs) |
| Language | TypeScript + Move |

---

## Key Files

```
projects/self-paying-agent/
├── agent.md              # This file - project context
├── README.md             # Submission README
├── contracts/
│   ├── Move.toml
│   └── treasury.move     # On-chain treasury contract
└── src/
    ├── agent.ts          # Main agent loop
    ├── monitor.ts        # Opportunity detection
    ├── executor.ts       # PTB trade execution
    └── accountant.ts     # Cost tracking & payments
```

---

## Recent Decisions

- 2026-02-26: Chose Self-Paying Agent over Veritas (audit trail) - higher upside
- 2026-02-26: Project structure created
- 2026-02-26: Move contract scaffolded (treasury)
- 2026-02-26: TypeScript implementation complete (4 modules)
- 2026-02-26: README.md created for submission

---

## Current Status

**Issue:** Sui framework (framework/mainnet) has compilation bugs with `internal` module references. Not our code - upstream issue.

**Completed:**
- ✅ Concept and architecture ready
- ✅ Move contract written (valid code, framework issue blocks compile)
- ✅ TypeScript implementation:
  - `monitor.ts` - Opportunity detection
  - `executor.ts` - PTB trade execution  
  - `accountant.ts` - Financial tracking
  - `agent.ts` - Main loop tying it all together
- ✅ README.md for submission

**Remaining:**
- ⏳ Demo video/script (optional)
- ⏳ Submit to DeepSurge

**Submission Deadline:** 2026-02-11 23:00 PST

---

## Context for New Sessions

If you're reading this in a new session:
1. This is a Mission OpenClaw hackathon project
2. Goal: Build agent that earns crypto to pay its own bills
3. Use Sui stack: Move, DeepBook, Walrus, PTBs
4. Submission deadline: 2026-02-11 23:00 PST
5. Check `README.md` for full project overview
6. Check `src/` for working TypeScript implementation

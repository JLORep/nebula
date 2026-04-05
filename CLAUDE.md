# FORGE — Agentic AI Orchestration Platform
# "Where tickets don't just get tracked. They get solved."
# v0.1.0 | GOTCHA count: 0 (but we brought 2,818 lessons with us)

@AGENTS.md

## WHAT IS FORGE?

An AI-powered project management and execution platform — Space Age Jira.
Enterprises use a Trello/Jira-style interface to define work. AI agents
plan, analyse, build, test, and deploy that work autonomously — with
human-in-the-loop safety guardrails at every step.

Target: Multi-billion-dollar enterprises who need to safely automate
business processes using agentic AI. Not copilot. Not chatbot. EXECUTION.

## CORE PHILOSOPHY (inherited from TrenchKings)

1. ONE source of truth per system — no scattered state
2. Honest failure > fake success — never hide errors behind mock data
3. Automate enforcement, don't rely on memory — lint/scan/validate
4. Defaults are lethal — every default must be intentional
5. Missing data != bad data — track source, not just value
6. Log once, silence until recovery — noise kills signal
7. Paper must match production — divergence = invisible bugs
8. Document constraints, not features — FORBIDDEN patterns > feature lists
9. Safety first, speed second — guardrails are features, not overhead
10. Build for production, not demos — if it can't deploy, it doesn't exist

## TECH STACK

- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript 5
- **Styling**: Tailwind CSS 4 + Framer Motion (Apple-grade UI)
- **State**: Zustand (proven pattern from TrenchKings)
- **Icons**: Lucide React
- **Backend**: Next.js API routes (MVP)
- **AI**: Bring-your-own-AI architecture (Claude API default)

## ARCHITECTURE PRINCIPLES

### From TrenchKings Battle Scars
- River pattern: ONE store owns each domain (boards, tasks, agents, execution)
- IPC is dumb executor — UI doesn't make AI decisions
- Validate before overwrite — check freshness before clobbering state
- In-memory processing — minimize serialize/deserialize overhead

### New for Forge
- Agent orchestration with explicit state machines (not ad-hoc)
- Every AI action has: intent, execution, result, audit trail
- Human approval gates at configurable trust boundaries
- Real-time streaming of agent work (SSE/WebSocket)
- Security-first: sandboxed execution, no arbitrary code eval

## PROJECT STRUCTURE

```
forge/
├── CLAUDE.md                    # This file — source of truth
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Dashboard
│   │   └── board/[id]/page.tsx  # Board detail view
│   ├── components/
│   │   ├── ui/                  # Design system primitives
│   │   ├── board/               # Board, columns, cards
│   │   ├── agent/               # Agent status, execution viewer
│   │   └── layout/              # App shell, sidebar, header
│   ├── lib/
│   │   ├── stores/              # Zustand stores (River pattern)
│   │   ├── types/               # TypeScript interfaces
│   │   ├── mock-data/           # Realistic mock data
│   │   └── utils/               # Shared utilities
│   └── styles/                  # Design tokens
├── public/                      # Static assets
└── package.json
```

## GOLDEN RULES (v1)

### A — Architecture
- A1: Components are dumb renderers. Logic lives in stores.
- A2: ONE store per domain. No cross-store mutations.
- A3: All AI operations go through the orchestrator, never direct.
- A4: Mock data uses the SAME types as real data.

### B — UI/UX
- B1: Apple-grade polish. Every animation has purpose.
- B2: Loading states are REAL feedback, not spinners.
- B3: Empty states teach. They don't just say "nothing here."
- B4: Dark mode is default. Light mode is supported.

### C — Safety
- C1: Every agent action has an audit trail.
- C2: Human approval gates are NOT optional at trust boundaries.
- C3: No arbitrary code execution without sandboxing.
- C4: Rate limiting on all AI operations.

### D — Code Quality
- D1: No `any` types. Ever.
- D2: No empty catch blocks.
- D3: No magic strings — use typed constants.
- D4: No commented-out code in commits.

## FORBIDDEN PATTERNS

```typescript
// WRONG: Direct AI calls from components
const result = await callClaude(prompt)

// RIGHT: Through orchestrator store
const result = await agentStore.executeTask(taskId)
```

```typescript
// WRONG: Untyped mock data
const boards = [{ name: "test", columns: [] }]

// RIGHT: Typed mock data matching production schema
const boards: Board[] = mockBoards
```

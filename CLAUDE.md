# NEBULA — Agentic AI Orchestration Platform
# "Where tickets don't just get tracked. They get solved."
# v0.2.0 | 69 source files | 12,354 LOC | 0 TypeScript errors

@AGENTS.md

## WHAT IS NEBULA?

An AI-powered project management and execution platform — Space Age Jira.
Enterprises use a Trello/Jira-style interface to define work. AI agents
plan, analyse, build, test, and deploy that work autonomously — with
human-in-the-loop safety guardrails at every step.

Target: Multi-billion-dollar enterprises who need to safely automate
business processes using agentic AI. Not copilot. Not chatbot. EXECUTION.

**Live demo**: https://nebula-beta-hazel.vercel.app
**Repository**: https://github.com/JLORep/nebula

## ORIGIN

Built by James + Claude on top of 2,818 documented GOTCHAs and battle-tested
patterns from TrenchKings (4,164 commits, 430k+ LOC crypto trading terminal).
Every architectural decision here was paid for in production incidents there.

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
- **State**: Zustand (proven River pattern from TrenchKings)
- **Icons**: Lucide React
- **UI Components**: Aceternity UI (TextGenerateEffect, Spotlight, Meteors, MovingBorder)
- **Backend**: Next.js API routes (MVP)
- **AI**: Bring-your-own-AI architecture (Claude API default)
- **Hosting**: Vercel (free tier)

## WHAT'S BUILT (v0.2.0)

### Pages (6 routes)

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Welcome hero (100vh) → Project cards → Sprint command → Metrics → Activity feed |
| `/board` | Board | Kanban board with drag-drop columns, task cards, detail panel, new task modal |
| `/roadmap` | Roadmap | Timeline view with epic cards, milestone markers, agile coach sidebar |
| `/agents` | Agents | Agent grid showing all AI agents across projects with status/activity |
| `/scanner` | Scanner | Nebula Scanner showcase — health ring, live terminal, 40-rule detector grid, violation feed |
| `/gates` | Gates | Approval gates dashboard — tasks grouped by gate type across all projects |

### Key Components

| Component | Path | Purpose |
|-----------|------|---------|
| `FloatingNav` | `layout/floating-nav.tsx` | Top nav bar with project selector, nav links, sim controls, theme toggle |
| `WelcomeHero` | `dashboard/welcome-hero.tsx` | Fullscreen 100vh intro with animated headline, live stats, CTA |
| `DashboardHero` | `dashboard/hero.tsx` | Sprint command section with progress bar, epic progress |
| `ProjectCards` | `dashboard/project-cards.tsx` | Grid of all 6 project cards with status/agent info |
| `MetricsGrid` | `dashboard/metrics-grid.tsx` | Key metrics: velocity, cost, token usage, security |
| `ActivityFeed` | `dashboard/activity-feed.tsx` | Real-time agent activity stream |
| `BoardView` | `board/board-view.tsx` | Full kanban board with columns and drag support |
| `TaskCard` | `board/task-card.tsx` | Individual task card with priority, assignee, labels |
| `AgentGrid` | `agents/agent-grid.tsx` | Agent status cards across all projects |
| `FlowPortal` | `flow/flow-portal.tsx` | New task creation modal (triggered by "+ New Flow" CTA) |

### Stores (Zustand — River Pattern)

| Store | Path | Domain |
|-------|------|--------|
| `board-store` | `stores/board-store.ts` | Projects, boards, columns, tasks, agents — main data store |
| `simulation-store` | `stores/simulation-store.ts` | Simulation engine: events, tick count, running state |
| `theme-store` | `stores/theme-store.ts` | Dark/light theme toggle |
| `roadmap-store` | `stores/roadmap-store.ts` | Roadmap epics, milestones, timeline state |
| `advisor-store` | `stores/advisor-store.ts` | AI advisor/coach panel state |

### Simulation System

The entire platform runs on simulated data for demo purposes:
- **6 projects**: Auth Service, Data Pipeline, Customer Portal, AI Agent Orchestration, Payment Processing, Cloud Infrastructure
- **10 AI agents**: Each with specialization, status, and activity
- **47+ tasks**: Spread across projects with realistic statuses, priorities, and approval gates
- **`useSimulation()` hook**: Drives live activity events across the platform
- **`SimControls`**: Play/pause/restart in the floating nav

### Nebula Scanner (Core Product)

Enterprise code compliance engine — not just a linter, a full remediation pipeline.

**The Loop**: Scan → Detect → Triage → Ticket → Agent Fix → Approval Gate

- **40 rules** across **8 categories**: Architecture (A1-A5), Type Safety (B1-B5), Data Layer (C1-C5), Security (D1-D5), Code Quality (E1-E5), Frontend (F1-F5), Infrastructure (G1-G5), Safety Gates (H1-H5)
- **Context-aware severity**: Test files downgraded, critical infrastructure upgraded
- **AI auto-remediation**: Violations → tickets → AI agent fix → approval gate → deploy
- **3-tier caching**: Memory (<1ms) → Redis/SQLite (~1-5ms) → Full parse (100-500ms)
- **Full documentation**: `docs/nebula-scanner.md` (comprehensive enterprise spec)
- **Scanner page**: Live terminal, health ring, detector grid, violation feed

### Design System

- **Glass morphism**: `glass-strong`, `glass-soft` utilities in globals.css
- **Gradient borders**: `.gradient-border` for accent-edged containers
- **Glow effects**: `.glow-accent`, `.glow-success`, `.glow-danger`
- **Animations**: `fadeSlideIn`, `pulse-glow`, `blink`, `meteor` keyframes
- **Spring configs**: `SPRING`, `SPRING_SNAPPY` in `lib/utils/motion.ts`
- **Color tokens**: `--accent` (violet), `--success`, `--warning`, `--danger`, `--info`, `--void`, `--nebula`
- **Dark mode default**: Light mode supported via theme store

## PROJECT STRUCTURE

```
forge/
├── CLAUDE.md                           # This file — source of truth
├── AGENTS.md                           # Next.js agent rules
├── docs/
│   ├── nebula-scanner.md               # Full scanner spec (40 rules, 8 categories)
│   ├── sniff.md                        # Original TrenchKings scanner reference
│   └── sniff-core.md                   # Original TrenchKings scanner core guide
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout (AppShell, FloatingNav, FlowPortal)
│   │   ├── page.tsx                    # Dashboard (WelcomeHero → Projects → Sprint → Metrics → Activity)
│   │   ├── globals.css                 # Design system (500+ lines of tokens, utilities, animations)
│   │   ├── board/page.tsx              # Kanban board
│   │   ├── roadmap/page.tsx            # Timeline roadmap
│   │   ├── agents/page.tsx             # Agent grid
│   │   ├── scanner/page.tsx            # Scanner showcase (680+ lines)
│   │   └── gates/page.tsx              # Approval gates dashboard
│   ├── components/
│   │   ├── ui/                         # Aceternity primitives (spotlight, meteors, text-generate, moving-border, etc.)
│   │   ├── board/                      # Board view, columns, task cards, task detail, filters, modals
│   │   ├── dashboard/                  # Welcome hero, sprint hero, metrics, activity, project cards
│   │   ├── agents/                     # Agent grid
│   │   ├── roadmap/                    # Timeline, epic cards, milestones, agile coach
│   │   ├── flow/                       # Flow portal (new task creation)
│   │   ├── layout/                     # FloatingNav, Sidebar, AppShell, SquadSidebar, AIAdvisor
│   │   └── agent/                      # Agent panel (detail view)
│   ├── lib/
│   │   ├── stores/                     # Zustand stores (board, simulation, theme, roadmap, advisor)
│   │   ├── types/index.ts              # All TypeScript interfaces (Project, Task, Agent, Column, etc.)
│   │   ├── hooks/use-simulation.ts     # Simulation engine hook
│   │   ├── mock-data/                  # 6 project datasets + agents + users + milestones + flow templates
│   │   └── utils/                      # cn, motion configs, simulation messages, terminal messages, agile coach
│   └── styles/                         # (Design tokens in globals.css)
├── public/
│   ├── nebula-1.jpg                    # Nebula background image
│   └── nebula-2.jpg                    # Nebula background image
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

```typescript
// WRONG: Safety gate downgrade
if (isUrgent) task.approvalGate = 'auto'  // was 'human_required'!

// RIGHT: Escalate, never downgrade
if (isUrgent) { task.approvalGate = 'human_required'; task.priority = 'critical' }
```

## NEXT UP

- [ ] Real API routes (replacing mock data with persistence)
- [ ] Claude API integration for agent execution
- [ ] WebSocket/SSE for real-time agent streaming
- [ ] Drag-and-drop task reordering on board
- [ ] Scanner integration: live scanning of actual project code
- [ ] Authentication + multi-tenant project isolation
- [ ] CI/CD pipeline with Nebula Scanner as PR gate

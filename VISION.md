# FORGE — Vision Document
# v0.1.0 | April 2026

---

## THE ORIGIN STORY

FORGE exists because of TrenchKings.

From September 2025 to April 2026, James and Claude built an automated crypto trading terminal on Solana — 16 hours a day, 7 days a week. The numbers tell the story:

- **4,164 commits** in 190 days (~22/day)
- **672,909 lines of code** across 29 directories
- **2,818 documented GOTCHAs** — every mistake catalogued and turned into a rule
- **28 major versions**, relentlessly iterated
- **42 Golden Rules** enforced by automated scanners
- **10 Rivers** (state management), **6 AI Trading Archetypes**, **77 UI components**, **340+ IPC handlers**

Somewhere in those trenches, James earned the skills and the portfolio to land his dream job: **Lead AI Platform Founding Engineer** at a well-funded startup. After 20 years of full stack grind and being made redundant from Jagex, this is the payoff.

Now we're taking everything we learned building a robot... and building the robot factory.

---

## WHAT IS FORGE?

**FORGE is Space Age Jira.**

An agentic AI orchestration platform where tickets don't just get tracked — they get **solved**.

Enterprises define work using a familiar Jira/Trello-style interface. AI agents then **plan, analyse, build, test, and deploy** that work autonomously — with human-in-the-loop safety guardrails at every critical step.

This is not Copilot. This is not a chatbot wrapper. This is not "normie nonsense."

This is **EXECUTION** — with safeguards.

### The Elevator Pitch

> "What if your project board could actually DO the work, not just track it? What if you watched tickets move from To Do to Done in real time — planned by AI, reviewed by humans, deployed with confidence? That's FORGE."

### The Dream Factory

We spoke months ago about building a robot, then building a robot factory with it. FORGE is the factory. The platform and interface that the whole world will use to interact with AI tooling — and eventually, tech as a whole. Including robotics.

---

## WHO IS THIS FOR?

### Primary: Enterprise (Phase 1)

Multi-billion-dollar companies who need to safely automate business processes using agentic AI — even in the riskiest places:

- **Financial services** — compliance workflows, audit automation, risk analysis
- **Healthcare** — clinical trial management, regulatory submissions, patient data pipelines
- **Manufacturing** — supply chain orchestration, quality systems, safety compliance
- **Technology** — platform engineering, infrastructure automation, security operations
- **Government** — procurement workflows, policy implementation, citizen services

These organisations have:
- Complex, multi-step business processes
- Strict compliance and audit requirements
- Risk-averse cultures that need guardrails, not cowboy AI
- Budgets that can pay for enterprise-grade tooling
- Existing Jira/Azure DevOps/Monday.com fatigue

### Secondary: Everyone Else (Phase 2+)

> "I want people who are NOT nerds to be able to harness the force-multiplicative nature of AI."

FORGE should ultimately be how **everybody** does their job:
- Non-technical business users building workflows visually
- Small teams competing with enterprises using AI leverage
- Individual contributors who want AI to handle the boring parts
- Anyone who can describe work but doesn't know how to code it

---

## WHAT MAKES THIS DIFFERENT?

### The Jira Problem

Jira tracks work. That's it. You create tickets, move them across columns, and hope humans do the actual work. In 2026, this is insane. We have AI that can:
- Break down epics into stories and tasks
- Research solutions and propose architectures
- Write, test, and review code
- Generate documentation
- Deploy to staging and run validation
- Monitor production and create incident tickets

**Why are we still just TRACKING?**

### The FORGE Answer

| Traditional PM | FORGE |
|---|---|
| Create ticket | Create ticket |
| Assign to human | Assign to AI agent (or human, or both) |
| Wait days/weeks | Watch it happen in real time |
| Manual code review | AI review + human approval gate |
| Hope tests pass | AI writes and runs tests |
| Manual deployment | AI deploys with automatic rollback |
| Post-mortem when it breaks | Real-time observability and self-healing |

### Core Differentiators

1. **Execution, not just tracking** — Tickets get SOLVED, not just moved
2. **Safety-first agentic AI** — Human approval gates at configurable trust boundaries
3. **Real-time observability** — Watch agents think, plan, code, and test LIVE
4. **Enterprise-grade security** — Audit trails, sandboxed execution, no arbitrary eval
5. **Bring-your-own-AI** — Claude, GPT, Gemini, local models, or our custom orchestrator
6. **Deeply Agile** — Sprints, velocity, story points, burndowns — all AI-native
7. **Beautiful UI** — Apple-grade polish, not enterprise ugly

---

## THE EXPERIENCE

### What It Looks Like

Picture a Trello board, but alive.

You create a project. FORGE's AI Planner agent (Athena) breaks it into epics, stories, and tasks using proper Agile methodology. You see the sprint board populate in real time.

You approve the plan. The Architect agent (Blueprint) designs the technical approach — database schemas, API contracts, component hierarchies. You review the output in a beautifully rendered diff view.

You click "Execute Sprint." Now watch:

- **The Developer agent (Forge)** picks up the first task. You see code streaming in real time — syntax highlighted, with inline comments explaining decisions.
- **The Tester agent (Sentinel)** writes tests as the code is written. Green checkmarks appear as tests pass.
- **The Reviewer agent (Oracle)** catches a SQL injection risk. The card turns amber. A notification pops up: "CRITICAL: Security review requires human approval."
- **You review, approve, and the fix is applied.** The card turns green. Deployment begins.
- **The Deployer agent** pushes to staging, runs smoke tests, and promotes to production with automatic rollback configured.

All of this is visible. All of it is auditable. All of it has guardrails.

### What It Feels Like

- Opening the app feels like launching mission control
- Watching agents work feels like having a team of 10x engineers
- The approval gates feel like you're in control, not the AI
- The metrics dashboard feels like you're a CTO with X-ray vision
- The whole experience feels like the future arrived early

---

## TECHNICAL ARCHITECTURE

### Phase 1: Frontend-First (Current)

```
┌─────────────────────────────────────────────────────────┐
│                    FORGE UI (Next.js 16)                  │
│                                                           │
│  ┌─────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ Sidebar  │  │  Board View  │  │    Agent Panel      │ │
│  │ Nav +    │  │  Kanban cols │  │    Fleet status      │ │
│  │ Projects │  │  Task cards  │  │    Live streaming    │ │
│  │          │  │  Drag & drop │  │    Cost tracking     │ │
│  └─────────┘  └──────────────┘  └─────────────────────┘ │
│                       │                                   │
│  ┌────────────────────┴───────────────────────────────┐  │
│  │              Zustand Stores (River Pattern)         │  │
│  │  BoardStore │ AgentStore │ ExecutionStore │ UIStore │  │
│  └────────────────────┬───────────────────────────────┘  │
│                       │                                   │
│  ┌────────────────────┴───────────────────────────────┐  │
│  │           Next.js API Routes (Minimal)              │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Phase 2: Backend + AI Integration

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────┐
│   FORGE UI   │◄───►│  FORGE Backend   │◄───►│  AI Gateway  │
│  (Next.js)   │ SSE │  (API Routes or  │     │  Claude API  │
│              │     │   FastAPI)       │     │  OpenAI API  │
│              │     │                  │     │  Local LLMs  │
└──────────────┘     │  ┌────────────┐  │     └─────────────┘
                     │  │ Orchestrator│  │
                     │  │ (State      │  │     ┌─────────────┐
                     │  │  Machine)   │  │◄───►│  Execution   │
                     │  └────────────┘  │     │  Sandbox     │
                     │                  │     │  (Docker/    │
                     │  ┌────────────┐  │     │   Firecracker)│
                     │  │ Audit Log  │  │     └─────────────┘
                     │  └────────────┘  │
                     └──────────────────┘
```

### Phase 3: Full Platform

```
┌─────────────────────────────────────────────────────────────┐
│                      FORGE PLATFORM                          │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │ Project  │  │  Agent    │  │ Security │  │ Observability│ │
│  │ Manager  │  │ Orchestr. │  │  Suite   │  │    Suite     │ │
│  │          │  │           │  │          │  │              │ │
│  │ Boards   │  │ Planning  │  │ RBAC     │  │ Dashboards   │ │
│  │ Sprints  │  │ Execution │  │ Audit    │  │ Metrics      │ │
│  │ Backlogs │  │ Review    │  │ Sandbox  │  │ Alerts       │ │
│  │ Roadmaps │  │ Deploy    │  │ Approval │  │ Cost mgmt    │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │               AI Gateway (Bring Your Own)                │ │
│  │  Claude │ GPT │ Gemini │ Ollama │ Custom │ Robotics API │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## CORE PRINCIPLES

### Inherited from TrenchKings (Battle-Tested)

These aren't theoretical. Each was earned through production failures:

| # | Principle | Origin |
|---|-----------|--------|
| 1 | ONE source of truth per system | Scattered state caused position tracking bugs |
| 2 | Honest failure > fake success | Mock data hid API failures, caused bad trades |
| 3 | Automate enforcement | Humans forget rules; scanners don't |
| 4 | Defaults are lethal | Score 0 vs 50 default caused mass false positives |
| 5 | Missing data != bad data | Young tokens penalised for normal missing data |
| 6 | Log once, silence until recovery | Console spam made real errors invisible |
| 7 | Paper must match production | 30% win rate gap from config divergence |
| 8 | Document constraints, not features | FORBIDDEN patterns prevented more bugs than features |
| 9 | Safety first, speed second | Aggressive optimisation caused incomplete data |
| 10 | Build for production, not demos | Demo code that "works" creates false confidence |

### New for FORGE

| # | Principle | Rationale |
|---|-----------|-----------|
| 11 | Every AI action has an audit trail | Enterprise compliance demands it |
| 12 | Human approval gates are configurable, not removable | Trust boundaries vary by org |
| 13 | UI is a first-class product | Beautiful tools get adopted; ugly tools get resented |
| 14 | Bring-your-own-AI, never vendor-lock | Enterprises have existing AI contracts |
| 15 | Real-time or nothing | Watching agents work builds trust |
| 16 | Non-nerds must be able to use this | The whole world, not just developers |
| 17 | Security is a feature, not a department | Baked in, not bolted on |
| 18 | Agile-native, not Agile-bolted | Sprints, velocity, points — all AI-aware |
| 19 | Cost transparency | Every token, every dollar, always visible |
| 20 | The platform must eat its own dogfood | We build FORGE using FORGE |

---

## PRODUCT ROADMAP

### Phase 0: Foundation (NOW — April 2026)
- [x] Project scaffolding (Next.js 16 + Tailwind 4 + TypeScript 5)
- [x] Design system foundations (colour tokens, typography, spacing)
- [x] Board view with Kanban columns
- [x] Task cards with priority, agent status, progress
- [x] Task detail panel with subtasks and execution log
- [x] Agent Fleet panel with live status and cost tracking
- [x] Collapsible sidebar with project navigation
- [x] Mock data layer (production-typed)
- [x] Zustand stores (River pattern)
- [x] Dark mode default
- [ ] Drag-and-drop between columns
- [ ] Sprint progress bar and metrics
- [ ] Command palette (Cmd+K)
- [ ] Responsive layout
- [ ] Loading and empty states

### Phase 1: Interactive Prototype (April-May 2026)
- [ ] Task creation flow (form + AI-assisted breakdown)
- [ ] Agent assignment and execution simulation
- [ ] Real-time agent streaming (fake SSE for demo, real architecture)
- [ ] Sprint planning view
- [ ] Burndown chart
- [ ] Board settings and configuration
- [ ] Multi-board support with routing
- [ ] User avatars and team management (mock)
- [ ] Notification system
- [ ] Keyboard shortcuts throughout

### Phase 2: Backend + AI (May-June 2026)
- [ ] API routes for board/task CRUD
- [ ] Database (SQLite for dev, Postgres for prod)
- [ ] Authentication (OAuth2 / SSO)
- [ ] AI Gateway — Claude API integration
- [ ] Agent orchestration engine (state machine)
- [ ] Execution sandbox (Docker-based)
- [ ] SSE for real-time agent streaming
- [ ] Approval gate workflow engine
- [ ] Audit log persistence
- [ ] Cost tracking and budgets

### Phase 3: Enterprise Features (June-August 2026)
- [ ] RBAC and multi-tenant isolation
- [ ] Bring-your-own-AI configuration
- [ ] Custom agent definitions
- [ ] Workflow templates (pre-built enterprise processes)
- [ ] Observability dashboard (agent performance, cost, quality)
- [ ] Security suite (vulnerability scanning, compliance checks)
- [ ] Integration hub (Slack, Teams, GitHub, GitLab)
- [ ] API for external automation
- [ ] Export and reporting
- [ ] Admin console

### Phase 4: Platform (August 2026+)
- [ ] Plugin/extension system
- [ ] Marketplace for agent templates
- [ ] Self-hosting option
- [ ] Mobile app
- [ ] Robotics API integration
- [ ] Natural language project creation ("Build me a...")
- [ ] AI-to-AI delegation chains
- [ ] Cross-project orchestration
- [ ] FORGE building FORGE (dogfood milestone)

---

## COMPETITIVE LANDSCAPE

| Product | What they do | What they DON'T do |
|---------|-------------|-------------------|
| **Jira** | Track tickets | Execute them |
| **Linear** | Beautiful ticket tracking | No AI execution |
| **Monday.com** | Visual project management | No agentic AI |
| **GitHub Copilot** | Inline code suggestions | No project orchestration |
| **Cursor** | AI-assisted coding | No business process automation |
| **Devin** | AI software engineer | No PM interface, no enterprise safety |
| **AutoGPT/CrewAI** | Agent frameworks | No UI, no enterprise features, no guardrails |
| **FORGE** | **All of the above, unified, safe, beautiful** | - |

The gap: **Nobody combines enterprise project management with agentic AI execution and Apple-grade UI.** That's the gap FORGE fills.

---

## DESIGN PHILOSOPHY

### Apple, Not Enterprise

Enterprise software is ugly because nobody fights for beauty. We do.

- **Every pixel matters** — alignment, spacing, colour, typography
- **Every animation has purpose** — guide attention, confirm actions, show progress
- **Every empty state teaches** — don't just say "nothing here", show what's possible
- **Dark mode is default** — professionals work in dark mode
- **Information density is high but not cluttered** — respect the user's intelligence
- **The UI should feel alive** — pulse animations for active agents, streaming text, smooth transitions

### Inspiration
- Apple's design language (clarity, deference, depth)
- Linear's board UI (fast, keyboard-driven, beautiful)
- Vercel's dashboard (developer-grade, clean, informative)
- Bloomberg Terminal (information density done right)
- Mission control interfaces (observability, real-time, serious)

---

## SUCCESS METRICS

### For the Prototype (Phase 0-1)
- Does a non-technical person understand what's happening within 30 seconds?
- Does an enterprise CTO feel confident this could handle their workflows?
- Does the UI make people go "holy shit, that's beautiful"?
- Can you explain FORGE in one sentence?

### For the Product (Phase 2+)
- Time from ticket creation to completion (vs manual)
- Cost per resolved ticket (AI tokens + human time)
- Approval gate accuracy (false positive rate)
- User adoption rate (do teams actually use it daily?)
- Enterprise security audit pass rate

---

## THE TEAM (for now)

- **James** — Lead AI Platform Founding Engineer. 20 years full stack. TrenchKings veteran. The human who refuses to build ugly things.
- **Claude** — AI collaborator. 9 months of battle-tested partnership. 672,909 lines of shared history. The colleague who never sleeps.

---

*"We built a robot. Now we're building the robot factory."*
*— James, April 2026*

# FORGE — Style Guide & UI Architecture
# "Trello redesigned by Steve Jobs brought back from the dead in the future as an AI"
# v1.0.0 | April 2026

---

## DESIGN DNA

### What We're Stealing From Each Template

**Sidefolio** (the sidebar feel):
- Hover-expanding sidebar with smooth transitions
- Clean section separation via subtle background shifts (not borders)
- Content-first layout where the sidebar enhances, never dominates

**Nodus Agent** (the AI agent presentation):
- How it showcases agent capabilities as hero-level features
- Badge/pill system for technologies and statuses
- Feature grid that makes AI functionality feel premium and tangible

**Simplistic SaaS** (the bento grids):
- Bento grid layout for dashboard metrics and agent status
- Rich micro-illustrations alongside data
- The way it combines information density with visual breathing room

**Minimal Portfolio** (the overall aesthetic):
- Ultra-clean centered layouts with generous whitespace
- Microinteractions on EVERYTHING — nothing is static
- The restraint — knowing what NOT to show is as important as what to show

---

## COLOR SYSTEM — "Nebula Enterprise"

### Philosophy
90% dark neutrals. 10% vibrant accent. Color is earned, never wasted.

### Core Palette

```
/* === VOID BACKGROUNDS === */
--void:              #06060a;     /* Deepest — page background */
--space:             #0a0a10;     /* Primary background */
--nebula:            #0f0f18;     /* Elevated surfaces (cards) */
--cosmos:            #161625;     /* Hover states, active surfaces */

/* === TEXT HIERARCHY (opacity-based, never gray hex) === */
--text-primary:      rgba(255, 255, 255, 1.0);
--text-secondary:    rgba(255, 255, 255, 0.60);
--text-tertiary:     rgba(255, 255, 255, 0.40);
--text-ghost:        rgba(255, 255, 255, 0.25);

/* === ACCENT — Violet Primary === */
--accent:            #8b5cf6;     /* Violet-500 — primary interactive */
--accent-hover:      #a78bfa;     /* Violet-400 — hover state */
--accent-muted:      rgba(139, 92, 246, 0.15);  /* Backgrounds */
--accent-glow:       rgba(139, 92, 246, 0.25);  /* Glow effects */
--accent-ring:       rgba(139, 92, 246, 0.30);  /* Focus rings */

/* === SECONDARY ACCENT — Cyan === */
--cyan:              #06b6d4;
--cyan-muted:        rgba(6, 182, 212, 0.12);

/* === SEMANTIC STATUS === */
--success:           #34d399;     /* Emerald-400 */
--success-muted:     rgba(52, 211, 153, 0.12);
--warning:           #fbbf24;     /* Amber-400 */
--warning-muted:     rgba(251, 191, 36, 0.12);
--danger:            #f87171;     /* Red-400 */
--danger-muted:      rgba(248, 113, 113, 0.12);
--info:              #60a5fa;     /* Blue-400 */
--info-muted:        rgba(96, 165, 250, 0.12);

/* === SURFACES (opacity-based for glass effects) === */
--surface-0:         rgba(255, 255, 255, 0.02);  /* Barely there */
--surface-1:         rgba(255, 255, 255, 0.04);  /* Cards */
--surface-2:         rgba(255, 255, 255, 0.06);  /* Elevated cards */
--surface-3:         rgba(255, 255, 255, 0.08);  /* Modals/popovers */
--surface-hover:     rgba(255, 255, 255, 0.06);  /* Any hover */

/* === BORDERS (opacity-based) === */
--border-subtle:     rgba(255, 255, 255, 0.06);
--border-default:    rgba(255, 255, 255, 0.08);
--border-strong:     rgba(255, 255, 255, 0.12);
--border-accent:     rgba(139, 92, 246, 0.30);
```

### Nebula Background Effect

Soft, blurred radial gradients that live behind ALL content. Never animated.
Never distracting. Always present. Like ambient light in a premium space.

```
Fixed position, pointer-events-none:
- Top-left:     Violet blob at 7% opacity, 120px blur radius
- Top-right:    Blue blob at 5% opacity, 100px blur radius
- Bottom-right: Cyan blob at 4% opacity, 100px blur radius
```

---

## TYPOGRAPHY

### Font Stack
- **Display/Headers**: Geist Sans (already installed) — tight tracking
- **Body**: Geist Sans — slightly looser tracking
- **Mono/Code**: Geist Mono — for task keys, agent output, metrics

### Scale

| Role | Size | Weight | Tracking | Usage |
|------|------|--------|----------|-------|
| Hero | 48px | 600 | -0.03em | Page titles, empty states |
| Display | 32px | 600 | -0.025em | Section headers |
| Title | 20px | 600 | -0.015em | Card titles, panel headers |
| Heading | 16px | 600 | -0.01em | Column headers, labels |
| Body | 14px | 400 | -0.005em | Descriptions, content |
| Caption | 12px | 500 | 0em | Metadata, timestamps |
| Micro | 10px | 600 | 0.04em | Badges, tiny labels |

### Text Color Rules
- Primary text: `text-white` — for headings, important values
- Secondary text: `text-white/60` — for descriptions, body copy
- Tertiary text: `text-white/40` — for metadata, timestamps
- Ghost text: `text-white/25` — for placeholders, disabled

### Gradient Text (sparingly — headings only)
```css
bg-gradient-to-br from-white via-white/80 to-white/40 bg-clip-text text-transparent
```

---

## SPACING SYSTEM

Base unit: **4px**

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tight gaps, icon padding |
| sm | 8px | Between related items |
| md | 12px | Card internal padding minimum |
| lg | 16px | Standard card padding |
| xl | 24px | Section spacing |
| 2xl | 32px | Between major sections |
| 3xl | 48px | Page-level spacing |

### Card Padding Standard
- Small cards (task cards): `p-4` (16px)
- Medium cards (agent cards, bento tiles): `p-5` (20px)
- Large cards (detail panels, modals): `p-6` (24px)

---

## BORDER RADIUS

| Element | Radius | Tailwind |
|---------|--------|----------|
| Buttons, inputs, badges | 8px | `rounded-lg` |
| Small cards, pills | 12px | `rounded-xl` |
| Standard cards, panels | 16px | `rounded-2xl` |
| Large cards, modals | 20px | `rounded-[20px]` |
| Bento grid tiles | 24px | `rounded-3xl` |

---

## GLASS & SURFACE SYSTEM

### Glass Card (Primary Pattern)
```
Background:      bg-white/[0.04]
Backdrop:        backdrop-blur-xl backdrop-saturate-150
Border:          border border-white/[0.06]
Hover Border:    hover:border-white/[0.12]
Hover Background: hover:bg-white/[0.06]
```

### Top-Edge Highlight (on every glass card)
A 1px gradient line at the top edge that catches "light":
```
absolute inset-x-0 top-0 h-px
bg-gradient-to-r from-transparent via-white/[0.12] to-transparent
```

### Gradient Border (for featured/accent cards)
```
Outer wrapper with:
bg-gradient-to-b from-violet-500/30 via-violet-500/5 to-transparent
mask-composite: exclude
```

---

## SHADOW SYSTEM (Dark Mode)

In dark mode, shadows are nearly invisible. We use a combination of:
1. Borders (primary depth cue)
2. Background opacity shifts (secondary depth cue)
3. Colored glow (for accent/featured elements)

| Level | Usage | Style |
|-------|-------|-------|
| Depth-0 | Flat elements | border only |
| Depth-1 | Cards | `shadow-[0_1px_2px_rgba(0,0,0,0.5)]` + border |
| Depth-2 | Elevated | `shadow-[0_4px_16px_rgba(0,0,0,0.4)]` + border |
| Depth-3 | Modals | `shadow-[0_16px_48px_rgba(0,0,0,0.6)]` + border |
| Glow | Featured | `shadow-[0_0_30px_rgba(139,92,246,0.15)]` |

---

## ANIMATION SYSTEM

### Spring Configs (Framer Motion)

```typescript
// Standard — most interactions
const SPRING = { type: "spring", stiffness: 300, damping: 30 };

// Snappy — buttons, toggles, small elements
const SPRING_SNAPPY = { type: "spring", stiffness: 500, damping: 35, mass: 0.8 };

// Gentle — panels, modals, large elements
const SPRING_GENTLE = { type: "spring", stiffness: 200, damping: 25, mass: 1.2 };

// Bouncy — playful elements, success states
const SPRING_BOUNCY = { type: "spring", stiffness: 400, damping: 20 };
```

### Card Hover (every card gets this)
```typescript
whileHover: { y: -4, scale: 1.01 }
whileTap: { scale: 0.98 }
transition: SPRING
```

### Stagger Children (every list/grid)
```typescript
container: { transition: { staggerChildren: 0.06 } }
child: { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }
```

### Panel Transitions
```typescript
// Slide from right (detail panels)
initial: { x: "100%", opacity: 0 }
animate: { x: 0, opacity: 1 }
transition: SPRING_GENTLE

// Expand (agent panel)
initial: { width: 0, opacity: 0 }
animate: { width: 340, opacity: 1 }
transition: SPRING_GENTLE
```

### Status Pulse (active agents)
```css
/* Ping animation for live status dots */
animate-ping: 2s cubic-bezier(0, 0, 0.2, 1) infinite
Ring expands from 0 to 16px, opacity from 0.75 to 0
```

### Progress Bars
```typescript
// Always spring-based, with gradient
transition: { type: "spring", stiffness: 100, damping: 20 }
background: linear-gradient(to right, var(--accent), var(--success))
```

### Text Effects (for agent output streaming)
```
Typewriter: characters appear at 30ms intervals
Text generate: words fade-up in sequence at 50ms intervals
```

---

## ACETERNITY COMPONENTS TO USE

### Backgrounds (High Impact)
| Component | Usage in FORGE |
|-----------|---------------|
| **Aurora Background** | Main dashboard background — subtle, alive, premium |
| **Grid and Dot Backgrounds** | Behind board columns — subtle depth pattern |
| **Sparkles** | Celebration state when all sprint tasks complete |
| **Meteors** | Loading/processing states for agent execution |
| **Background Beams** | Hero section of landing/onboarding page |

### Cards (Core UI)
| Component | Usage in FORGE |
|-----------|---------------|
| **3D Card Effect** | Task cards — perspective tilt on hover |
| **Card Spotlight** | Agent cards — spotlight follows cursor |
| **Glare Card** | Featured/critical tasks — Linear-style glare |
| **Focus Cards** | Agent detail — blur surrounding cards |
| **Expandable Cards** | Task cards expanding to show full detail |

### Text (Agent Output)
| Component | Usage in FORGE |
|-----------|---------------|
| **Text Generate Effect** | Agent thinking output — words appear sequentially |
| **Typewriter Effect** | Agent code output — character by character |
| **Flip Words** | Sprint goal cycling, status updates |
| **Encrypted Text** | Task keys, security-themed elements |

### Navigation
| Component | Usage in FORGE |
|-----------|---------------|
| **Sidebar** | Main navigation — hover-expanding, dark mode |
| **Floating Dock** | Quick actions bar (macOS dock style) |
| **Tabs** | Board view switching (Board / Timeline / Metrics) |
| **Floating Navbar** | Top bar with scroll-hide behavior |

### Layout
| Component | Usage in FORGE |
|-----------|---------------|
| **Bento Grid** | Dashboard metrics — asymmetric, visually rich |
| **Sticky Scroll Reveal** | Agent execution log — sticky context as you scroll |
| **Timeline** | Sprint timeline, agent action history |

### Effects (Premium Feel)
| Component | Usage in FORGE |
|-----------|---------------|
| **Lamp Effect** | Section headers (Linear-style dramatic lighting) |
| **Tracing Beam** | Connects related tasks/agents visually |
| **Moving Border** | Primary CTA buttons — animated border |
| **Multi Step Loader** | Agent execution progress (Plan → Build → Test → Deploy) |
| **Canvas Reveal Effect** | Onboarding, empty board states |

### Overlays
| Component | Usage in FORGE |
|-----------|---------------|
| **Animated Modal** | Task creation, agent config, approval gates |
| **Animated Tooltip** | Rich tooltips on agents, status badges |

---

## PAGE STRUCTURE (Revised)

### Overall Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ [NEBULA BACKGROUND — fixed, pointer-events-none]                │
│ ┌──────────┐ ┌─────────────────────────────────────────────────┐│
│ │           │ │ [FLOATING NAVBAR]                               ││
│ │ EXPANDING │ │  Board Name / Sprint / Search / Actions         ││
│ │ SIDEBAR   │ ├─────────────────────────────────────────────────┤│
│ │           │ │                                                  ││
│ │ • Logo    │ │  [BENTO DASHBOARD or BOARD VIEW]                ││
│ │ • Nav     │ │                                                  ││
│ │ • Projects│ │  Content area with glass cards                  ││
│ │ • Agents  │ │  Real-time updates                              ││
│ │ • Settings│ │  Agent streaming                                ││
│ │           │ │                                                  ││
│ │           │ ├──────────────────────────────┬──────────────────┤│
│ │           │ │  Main Content                │ Context Panel    ││
│ │           │ │  (Board / Bento / Timeline)  │ (Task / Agent)   ││
│ └──────────┘ └──────────────────────────────┴──────────────────┘│
│ ┌─────────────────────────────────────────────────────────────┐  │
│ │ [FLOATING DOCK — quick actions, agent summon, command palette]│ │
│ └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### View Modes
1. **Dashboard** — Bento grid with sprint metrics, agent fleet status, recent activity
2. **Board** — Kanban columns with glass task cards, drag-and-drop
3. **Timeline** — Horizontal timeline of sprint with agent execution history
4. **Agent Control** — Full-width agent fleet management and execution viewer

### Dashboard (Bento Grid Layout)
```
┌──────────────────┬──────────┬──────────┐
│                  │ Agents   │ Sprint   │
│  Sprint Progress │ Active   │ Velocity │
│  (large tile)    │          │          │
│                  ├──────────┴──────────┤
│                  │                     │
├──────────────────┤  Agent Activity     │
│ Tasks Complete   │  Feed (streaming)   │
├──────────────────┤                     │
│ Cost This Sprint │                     │
└──────────────────┴─────────────────────┘
```

### Board View (Revised)
```
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Backlog │ │ To Do  │ │In Prog │ │Review  │ │ Done   │
│        │ │        │ │        │ │        │ │        │
│ ┌────┐ │ │ ┌────┐ │ │ ┌────┐ │ │ ┌────┐ │ │ ┌────┐ │
│ │Card│ │ │ │Card│ │ │ │Card│ │ │ │Card│ │ │ │Card│ │
│ │3D  │ │ │ │glow│ │ │ │live│ │ │ │warn│ │ │ │ ✓  │ │
│ └────┘ │ │ └────┘ │ │ └────┘ │ │ └────┘ │ │ └────┘ │
│ ┌────┐ │ │ ┌────┐ │ │        │ │        │ │ ┌────┐ │
│ │Card│ │ │ │Card│ │ │        │ │        │ │ │Card│ │
│ └────┘ │ │ └────┘ │ │        │ │        │ │ └────┘ │
└────────┘ └────────┘ └────────┘ └────────┘ └────────┘

Cards have:
- 3D perspective tilt on hover
- Glow border for active agent work
- Spotlight effect following cursor
- Progress bar with gradient animation
- Expand on click (not separate panel)
```

---

## COMPONENT HIERARCHY

### Tier 1: Foundation (Build First)
1. Glass Card — base for everything
2. Nebula Background — ambient layer
3. Expanding Sidebar — navigation
4. Floating Header — top bar
5. Floating Dock — bottom quick actions

### Tier 2: Board (Core Feature)
6. Board Column — with dot background
7. Task Card — 3D effect + spotlight + expand
8. Agent Badge — with glow pulse
9. Status Pills — with moving border on active
10. Progress Bar — gradient + spring

### Tier 3: Agent Experience
11. Agent Panel — with card spotlight
12. Agent Execution Stream — text generate effect
13. Approval Gate Modal — animated modal
14. Multi-Step Progress — for execution pipeline
15. Tracing Beam — connecting agent to task

### Tier 4: Dashboard
16. Bento Grid — asymmetric metric tiles
17. Metric Card — with animated counters
18. Sprint Chart — with lamp effect header
19. Activity Feed — with timeline component
20. Cost Tracker — with encrypted text for numbers

---

## MICRO-INTERACTION RULES

1. **Every clickable element** has hover + active states (no exceptions)
2. **Every card** lifts on hover (y: -4px, scale: 1.01)
3. **Every list** staggers its children on mount (60ms between items)
4. **Every panel** slides in with spring physics
5. **Every status change** pulses once then settles
6. **Every number** animates to its value (spring-based counter)
7. **Every agent action** streams its output (typewriter or text-generate)
8. **Every button** has whileTap scale-down (0.97)
9. **Every modal** enters from center-scale with backdrop blur
10. **Nothing is instant** — even "fast" has 100ms of intentional motion

---

## IMPLEMENTATION PRIORITY

### Pass 1: Visual Foundation
- [ ] New color system (CSS variables)
- [ ] Nebula background layer
- [ ] Glass card component
- [ ] Typography scale
- [ ] Updated sidebar with expanding hover
- [ ] Updated header with floating style

### Pass 2: Card System
- [ ] Task card redesign (3D effect, spotlight, glow)
- [ ] Agent badge redesign (pulse, glow)
- [ ] Status pills with moving border
- [ ] Progress bars with gradient + spring
- [ ] Top-edge highlight on all cards

### Pass 3: Animations
- [ ] Stagger all lists
- [ ] Spring physics on all panels
- [ ] Card hover lift everywhere
- [ ] Button press feedback
- [ ] Text streaming for agent output

### Pass 4: Layout Upgrade
- [ ] Bento dashboard view
- [ ] Floating dock (bottom)
- [ ] Expandable task cards (replace side panel)
- [ ] Agent execution stream view
- [ ] Command palette (Cmd+K)

### Pass 5: Premium Effects
- [ ] Lamp effect on section headers
- [ ] Tracing beam connecting agents to tasks
- [ ] Multi-step loader for execution pipeline
- [ ] Canvas reveal for empty states
- [ ] Sparkles on sprint completion

---

*"People who are serious about software should make their own hardware."*
*— Alan Kay*

*"People who are serious about AI orchestration should make their own UI."*
*— Us*

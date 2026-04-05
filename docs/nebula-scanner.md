# Nebula Scanner — Enterprise Code Compliance & Remediation Engine

**Version**: 1.0.0 | **Codename**: Forge Sentinel
**Status**: Core Product — integrated into Nebula AI orchestration platform

---

## What Is Nebula Scanner?

Nebula Scanner is an enterprise-grade automated code compliance engine that continuously scans, detects, triages, and remediates violations across every project in your portfolio. Unlike traditional linters that dump warnings into a terminal, Nebula Scanner is deeply integrated into the AI orchestration layer — findings become tickets, AI agents fix them, and approval gates enforce human oversight on critical changes.

**The loop**: Scan → Detect → Triage → Ticket → Agent Fix → Human Review → Deploy

This is not a linter. This is an autonomous compliance workforce.

---

## Why This Exists

This system was born from 2,800+ production incidents documented across a 430,000 LOC codebase over 9 months. Every rule exists because something broke in production. Every detector exists because a pattern caused real damage. Every severity level was calibrated against actual blast radius.

### Lessons That Shaped The Architecture

1. **Linters find syntax. Scanners find architecture drift.** — The bugs that cost money aren't missing semicolons. They're a service bypassing the data layer, a store mutating another store's state, a safety gate downgraded to a warning.

2. **False positives destroy trust faster than missed bugs.** — We achieved <0.005% FP rate through AST-based detection, context-aware severity, and persistent FP learning. If developers learn to ignore the scanner, it's dead.

3. **Speed determines adoption.** — A 90-second scan gets skipped. A 2-second scan becomes habit. 3-tier caching (memory → persistent cache → full parse) turned 45s scans into 2s scans on repeat runs with 100-1500x speedups.

4. **Rules without enforcement are suggestions.** — Git hooks, CI gates, and approval workflows transform "you should fix this" into "you cannot ship this." Nebula Scanner integrates at every stage.

5. **The scanner must scan itself.** — Meta-analysis detects false positives in the scanner's own output, tracks detector bugs, and surfaces improvement suggestions. The system improves autonomously.

---

## Core Capabilities

### Detect — 30+ Specialized Detectors

Each detector is a domain expert. Not regex-on-files, but AST-aware, context-sensitive analysis engines that understand your code's structure, intent, and risk profile. Detectors run in parallel (8 workers default) and yield typed violation objects — not string warnings.

| Category | Detectors | What They Catch |
|----------|-----------|-----------------|
| **Architecture** | Service registry, dependency injection, initialization order, ownership boundaries | Services bypassing registries, circular dependencies, store cross-mutation |
| **Type Safety** | Format specifiers, type guards, dict validation, iteration safety | Runtime type errors, unsafe coercions, missing instanceof guards |
| **Data Layer** | Atomic operations, cache patterns, query optimization, TTL enforcement | Race conditions, N+1 queries, cache stampedes, missing TTLs |
| **Security** | SQL injection, session safety, path traversal, secrets detection | Injection vectors, unparameterized queries, hardcoded credentials |
| **Code Quality** | Logging standards, API contracts, fallback chains, dead code | Inconsistent logging, API drift, orphaned code, duplicate logic |
| **Frontend** | Component boundaries, state management, SSE vs polling, hook rules | Polling instead of streaming, logic in components, hook violations |
| **Infrastructure** | IPC contracts, deployment configs, CI/CD validation, env safety | Parameter mismatches, missing env vars, deployment gaps |
| **Safety Gates** | Approval enforcement, hard-block validation, threshold guards | Safety gates downgraded to warnings, missing approval checks |

---

### Detector Deep Dive

Every detector below was born from a real production incident. The "Why It Matters" isn't theoretical — it's a scar.

---

#### Category A: Architecture Detectors (5 Rules)

These catch structural drift — the slow erosion where clean boundaries degrade into spaghetti. Architecture bugs are the most expensive to fix late and the cheapest to catch early.

**A1 — Service Registry Enforcement** | CRITICAL
Ensures all services are accessed through a central registry, never imported directly. Direct imports create hidden coupling that makes refactoring impossible and testing a nightmare.

```typescript
// VIOLATION: Direct import creates invisible dependency
import { PaymentService } from '../services/payment-service'
const svc = new PaymentService()

// CORRECT: Registry-managed, testable, swappable
const svc = registry.resolve<PaymentService>('payment')
```

*Detection method*: AST import analysis. Identifies import paths targeting service directories and validates they route through the registry module. Allowlist for type-only imports.

**A2 — Dependency Injection Compliance** | HIGH
Validates that services receive dependencies through constructor injection or factory patterns, never by reaching into global state or importing singletons.

```typescript
// VIOLATION: Service reaches into global state
class OrderService {
  process() {
    const db = globalThis.database  // invisible dependency
  }
}

// CORRECT: Dependencies injected
class OrderService {
  constructor(private db: Database, private cache: CacheService) {}
}
```

*Detection method*: AST class analysis. Scans method bodies for global/singleton references. Cross-references constructor parameters against actual usage.

**A3 — Initialization Order** | HIGH
Services must initialize in a defined sequence (config → connections → caches → services → routes). Out-of-order initialization causes race conditions that only manifest under load.

```typescript
// VIOLATION: Service uses cache before cache is initialized
class ReportService {
  async init() {
    const data = await this.cache.get('reports')  // cache not ready yet
  }
}

// CORRECT: Explicit stage dependency
class ReportService {
  static initStage = 4  // runs after cache (stage 3)
  async init() {
    const data = await this.cache.get('reports')  // guaranteed ready
  }
}
```

*Detection method*: Builds initialization dependency graph from stage annotations. Detects usages of services that haven't been initialized at the current stage.

**A4 — Streaming Over Polling** | HIGH
Any `setInterval` or `setTimeout` loop used for data fetching is a violation. Real-time data must flow through SSE, WebSockets, or event streams. Polling wastes resources and creates stale data windows.

```typescript
// VIOLATION: Polling creates stale windows and hammers the server
setInterval(async () => {
  const data = await fetch('/api/metrics')
  setMetrics(data)
}, 5000)

// CORRECT: Server-sent events — instant, efficient
const source = new EventSource('/api/metrics/stream')
source.onmessage = (e) => setMetrics(JSON.parse(e.data))
```

*Detection method*: AST pattern matching for `setInterval`/`setTimeout` containing fetch/HTTP calls. Allowlist for legitimate timers (debounce, animation, cleanup).

**A5 — Ownership Boundaries** | HIGH
Every domain has ONE owner. The store pattern (River pattern in our architecture) means only one store may mutate a given slice of state. Cross-store mutation is how you get phantom bugs where state changes but nobody knows who changed it.

```typescript
// VIOLATION: UserStore mutating SessionStore's state
class UserStore {
  logout() {
    sessionStore.clearSession()  // NOT your state to touch
    this.user = null
  }
}

// CORRECT: Event-driven, each store owns its domain
class UserStore {
  logout() {
    this.user = null
    eventBus.emit('user:logout')  // SessionStore listens and clears itself
  }
}
```

*Detection method*: Cross-reference store imports with mutation calls. Flags any store method that calls `.set()`, `.update()`, or mutating methods on another store instance.

---

#### Category B: Type Safety Detectors (5 Rules)

These prevent the class of bugs where code works in development but explodes in production because real data doesn't match the happy path. Every one of these was a production crash.

**B1 — Format Specifier Safety** | CRITICAL
Catches format strings applied to wrong types. `f"{value:.2f}"` on a string crashes silently in some languages, throws in others. Template literals with arithmetic on unvalidated types.

```typescript
// VIOLATION: amount could be string from API response
const display = `$${amount.toFixed(2)}`  // TypeError if amount is string

// CORRECT: Validate before format
const safeAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0
const display = `$${safeAmount.toFixed(2)}`
```

*Detection method*: AST data flow analysis. Traces variable origin to external sources (API responses, user input, deserialized data) and verifies type narrowing before format operations.

**B2 — Collection Type Guards** | CRITICAL
Before iterating any value from an external source, verify it's actually iterable. `for...of` on `undefined` crashes. `.map()` on a string produces characters, not elements. `.forEach()` on `null` throws.

```typescript
// VIOLATION: API might return null, undefined, or wrong shape
const items = response.data.items
items.forEach(item => process(item))  // crashes if items is null

// CORRECT: Guard before iterate
const items = Array.isArray(response.data?.items) ? response.data.items : []
items.forEach(item => process(item))
```

*Detection method*: Identifies iteration methods (`.map`, `.forEach`, `for...of`, `.reduce`) and traces the iterated value back to its source. Flags if the source is external and no `Array.isArray()` or similar guard precedes it.

**B3 — Numeric Coercion Validation** | CRITICAL
Any time a value from an external source is used in arithmetic, it must be explicitly validated as numeric. Implicit coercion (`"12" * 2 = 24` but `"12px" * 2 = NaN`) causes silent corruption.

```typescript
// VIOLATION: quantity from form input, could be "abc"
const total = price * quantity  // NaN propagates silently

// CORRECT: Explicit validation at boundary
const qty = Number(quantity)
if (Number.isNaN(qty) || qty < 0) throw new ValidationError('Invalid quantity')
const total = price * qty
```

*Detection method*: Traces arithmetic operands to their source. Flags external-origin values used in `*`, `/`, `+` (non-string context), `-` without preceding `Number()`, `parseInt()`, or `parseFloat()` with `isNaN` guard.

**B4 — Property Access Guards** | HIGH
Accessing nested properties on external data without optional chaining or type narrowing. The classic `Cannot read properties of undefined (reading 'x')`.

```typescript
// VIOLATION: Any level could be undefined
const city = user.address.city

// CORRECT: Optional chaining + default
const city = user?.address?.city ?? 'Unknown'
```

*Detection method*: Identifies property access chains (3+ levels) on variables sourced from external data. Verifies optional chaining or preceding nullish checks.

**B5 — Exhaustive Switch/Union Handling** | HIGH
When switching on a discriminated union or enum, every case must be handled. Missing a case means new variants silently fall through.

```typescript
// VIOLATION: New status "suspended" falls to default silently
switch (user.status) {
  case 'active': return grant()
  case 'banned': return deny()
  default: return grant()  // suspended users get access!
}

// CORRECT: Exhaustive + never guard
switch (user.status) {
  case 'active': return grant()
  case 'banned': return deny()
  case 'suspended': return deny()
  default: {
    const _exhaustive: never = user.status  // compile error if case missed
    return deny()
  }
}
```

*Detection method*: Identifies `switch` statements on typed values. Cross-references cases against the type's union members. Flags missing members and unsafe `default` fallbacks.

---

#### Category C: Data Layer Detectors (5 Rules)

These catch the data access patterns that work fine with 10 users and melt your database at 10,000. Every performance incident we've seen traces back to one of these patterns.

**C1 — Atomic State Updates** | CRITICAL
When multiple fields must update together, they must update in a single atomic operation. Non-atomic multi-field updates create windows where state is partially updated — and anything reading during that window gets corrupt data.

```typescript
// VIOLATION: Two separate updates — reader can see balance without updated timestamp
await db.update('accounts', id, { balance: newBalance })
await db.update('accounts', id, { updatedAt: Date.now() })

// CORRECT: Single atomic update
await db.update('accounts', id, { balance: newBalance, updatedAt: Date.now() })
```

*Detection method*: Identifies sequential update/set calls targeting the same entity. Flags when multiple mutations to the same record aren't batched into a single operation.

**C2 — N+1 Query Detection** | HIGH
The most common performance killer. A loop that executes one query per iteration instead of batching. Works fine for 5 items, destroys your database at 5,000.

```typescript
// VIOLATION: 100 users = 100 queries
const users = await db.query('SELECT * FROM users WHERE org_id = ?', [orgId])
for (const user of users) {
  user.orders = await db.query('SELECT * FROM orders WHERE user_id = ?', [user.id])
}

// CORRECT: 2 queries regardless of user count
const users = await db.query('SELECT * FROM users WHERE org_id = ?', [orgId])
const userIds = users.map(u => u.id)
const orders = await db.query('SELECT * FROM orders WHERE user_id IN (?)', [userIds])
const ordersByUser = groupBy(orders, 'user_id')
users.forEach(u => { u.orders = ordersByUser[u.id] ?? [] })
```

*Detection method*: Identifies `for`/`.forEach`/`.map` loops containing `await` calls to database/HTTP methods. Suggests batch alternatives. Allowlist for intentionally serial operations (rate-limited APIs).

**C3 — Cache TTL Enforcement** | HIGH
Every cache entry must have a TTL. Cache entries without TTLs accumulate until memory exhaustion, and stale data serves silently forever.

```typescript
// VIOLATION: No TTL — this entry lives forever
cache.set(`user:${id}`, userData)

// CORRECT: Explicit TTL based on data volatility
cache.set(`user:${id}`, userData, { ttl: 300 })  // 5 minutes
```

*Detection method*: Identifies `cache.set`, `redis.set`, `.setex` calls. Flags any set operation missing a TTL/expiry parameter. Severity scales with the data's proximity to user-facing output.

**C4 — Query Optimization** | HIGH
Detects known anti-patterns: `SELECT *` on large tables, missing `LIMIT` on unbounded queries, `LIKE '%term%'` (full table scan), `ORDER BY` without index hints on large datasets.

```typescript
// VIOLATION: Full table scan, no limit, returns everything
const results = await db.query('SELECT * FROM audit_logs WHERE message LIKE ?', [`%${term}%`])

// CORRECT: Indexed column, projection, bounded
const results = await db.query(
  'SELECT id, message, created_at FROM audit_logs WHERE ts_vector @@ to_tsquery(?) LIMIT 50',
  [term]
)
```

*Detection method*: SQL/ORM query analysis. Parses query strings for anti-patterns. Cross-references table names against known large tables (configurable). Flags unbounded `SELECT` without `LIMIT`.

**C5 — Error Caching Prevention** | HIGH
Never cache error responses. If a downstream service returns a 500 and you cache it, every subsequent request gets the cached error — for the entire TTL duration. One transient failure becomes minutes of hard failure.

```typescript
// VIOLATION: Caches whatever the API returns, including errors
const data = await fetch('/api/pricing')
cache.set('pricing', await data.json(), { ttl: 300 })

// CORRECT: Only cache success
const res = await fetch('/api/pricing')
if (res.ok) {
  cache.set('pricing', await res.json(), { ttl: 300 })
}
```

*Detection method*: Identifies cache write operations and traces the value back to its source. Flags when the source is an HTTP/API call without a preceding success check (status code validation, try/catch with rethrow).

---

#### Category D: Security Detectors (5 Rules)

These are non-negotiable. Every violation in this category is a potential breach. Severity is CRITICAL by default, downgraded only in test files.

**D1 — SQL/NoSQL Injection** | CRITICAL
Any query constructed with string concatenation or template literals using external input. This is OWASP #1 for a reason — it's the most exploited vulnerability class in existence.

```typescript
// VIOLATION: Direct string interpolation — classic injection vector
const query = `SELECT * FROM users WHERE email = '${email}'`

// CORRECT: Parameterized query
const query = 'SELECT * FROM users WHERE email = ?'
const results = await db.query(query, [email])
```

*Detection method*: AST analysis of query construction. Identifies string concatenation/interpolation in arguments to database methods. Traces interpolated values to determine if they originate from external input. Allowlist for compile-time constants and validated identifiers (with explicit GOTCHA comment required).

**D2 — Hardcoded Secrets** | CRITICAL
API keys, passwords, tokens, and connection strings must never appear in source code. Even in "development" configs — because development configs get committed to git, git history is forever, and repository clones spread.

```typescript
// VIOLATION: Hardcoded in source — will end up in git history
const API_KEY = 'sk-prod-abc123def456'
const DB_URL = 'postgresql://admin:password@prod-db:5432/main'

// CORRECT: Environment variable with validation
const API_KEY = env.require('API_KEY')
const DB_URL = env.require('DATABASE_URL')
```

*Detection method*: Pattern matching against known secret formats (API key prefixes: `sk-`, `pk_`, `ghp_`, `AKIA`, etc.), high-entropy strings in assignments, and connection strings with embedded credentials. AST-aware to avoid flagging test fixtures and documentation strings.

**D3 — Session Security** | CRITICAL
Session tokens must be HttpOnly, Secure, SameSite=Strict in production. Session fixation (reusing session ID after auth change) must be prevented. Session data must never be serialized to client-readable storage.

```typescript
// VIOLATION: Session cookie accessible to JavaScript
res.cookie('session', token, { httpOnly: false })

// VIOLATION: Session ID not rotated after login
async function login(user, password) {
  if (await verify(user, password)) {
    req.session.userId = user.id  // same session ID as before auth!
  }
}

// CORRECT: Secure cookie + session rotation
res.cookie('session', token, { httpOnly: true, secure: true, sameSite: 'strict' })
await req.session.regenerate()  // new ID after auth state change
req.session.userId = user.id
```

*Detection method*: Identifies cookie-setting calls and validates security flags. Traces authentication flows and flags missing session regeneration after privilege changes.

**D4 — Path Traversal** | HIGH
User-supplied input used in file system operations without sanitization. `../../../etc/passwd` is the classic, but path traversal also enables overwriting application files, reading config, and escaping sandboxes.

```typescript
// VIOLATION: User controls the path
const filePath = path.join(uploadDir, req.params.filename)
const content = fs.readFileSync(filePath)

// CORRECT: Resolve and validate containment
const filePath = path.resolve(uploadDir, req.params.filename)
if (!filePath.startsWith(path.resolve(uploadDir))) {
  throw new SecurityError('Path traversal detected')
}
const content = fs.readFileSync(filePath)
```

*Detection method*: Identifies `fs.*`, `path.join`, `path.resolve` calls where any path segment traces back to external input (request params, query strings, headers). Flags missing containment check (resolved path must start with expected base directory).

**D5 — OWASP Dependency Check** | HIGH
Known vulnerable dependencies in `package.json` / `requirements.txt`. Not just checking versions — cross-referencing against CVE databases and flagging transitive vulnerabilities.

*Detection method*: Parses lockfiles, cross-references against vulnerability database. Severity based on CVSS score and exploitability. Differentiates direct vs transitive dependencies.

---

#### Category E: Code Quality Detectors (5 Rules)

These don't prevent crashes — they prevent the gradual decay that makes a codebase unmaintainable. Death by a thousand cuts.

**E1 — Logging Standards** | HIGH
All logging must use the unified logger with structured output. `console.log` in production code is a violation — it's unstructured, unsearchable, and has no severity levels.

```typescript
// VIOLATION: Unstructured, no level, no context
console.log('Payment failed', error)

// CORRECT: Structured, leveled, contextual
logger.error('Payment processing failed', {
  orderId: order.id,
  amount: order.total,
  error: error.message,
  stack: error.stack,
})
```

*Detection method*: Identifies `console.log`, `console.warn`, `console.error` in non-test files. Also flags logger calls missing structured context objects.

**E2 — API Contract Validation** | HIGH
API response shapes must match their TypeScript interfaces. When the backend adds a field, removes a field, or changes a type, the frontend must know immediately — not when a user hits a crash.

```typescript
// VIOLATION: Trusting the API response shape blindly
const user = await fetch('/api/user').then(r => r.json())
return <div>{user.profile.displayName}</div>  // crash if shape changed

// CORRECT: Runtime validation at the boundary
const raw = await fetch('/api/user').then(r => r.json())
const user = UserSchema.parse(raw)  // throws if shape doesn't match
return <div>{user.profile.displayName}</div>
```

*Detection method*: Identifies API fetch calls and traces the response to its first usage. Flags if no schema validation (Zod, io-ts, Yup, custom validator) sits between fetch and usage.

**E3 — Fallback Chain Integrity** | HIGH
When a system has fallback layers (primary → secondary → default), each layer must be tested independently. Common bug: the fallback itself throws, so you get a cascade failure instead of graceful degradation.

```typescript
// VIOLATION: Fallback can throw too
function getPrice(symbol: string) {
  try {
    return primaryAPI.getPrice(symbol)
  } catch {
    return secondaryAPI.getPrice(symbol)  // what if this also throws?
  }
}

// CORRECT: Each fallback layer is independently safe
function getPrice(symbol: string) {
  try { return primaryAPI.getPrice(symbol) }
  catch { /* primary failed */ }

  try { return secondaryAPI.getPrice(symbol) }
  catch { /* secondary failed */ }

  return DEFAULT_PRICES[symbol] ?? 0  // terminal default, cannot throw
}
```

*Detection method*: Identifies try/catch blocks where the catch body contains throwable operations without its own error handling. Flags fallback chains missing terminal safe defaults.

**E4 — Dead Code Detection** | MEDIUM
Exported functions/classes with zero import references anywhere in the codebase. Dead code isn't just clutter — it's a maintenance trap. Developers read it, try to understand it, sometimes even modify it, all for code that never executes.

*Detection method*: Builds full import graph across the codebase. Cross-references every export against all import statements. Accounts for dynamic imports, re-exports, and entry points. Flags exports with zero references.

**E5 — Duplicate Logic Detection** | MEDIUM
AST-based structural similarity analysis. Not string matching — two functions with different variable names but identical structure are caught. Duplication means bugs get fixed in one copy but not the other.

*Detection method*: Normalizes AST subtrees (strips identifiers, normalizes literals), hashes the structure, and identifies collisions. Configurable similarity threshold (default: 85%). Reports duplicate pairs with suggested extraction point.

---

#### Category F: Frontend Detectors (5 Rules)

These enforce the principle that components are dumb renderers. Logic lives in stores. Side effects are explicit. State flows one direction.

**F1 — Component Boundary Enforcement** | HIGH
Business logic — data transformation, validation, API calls, complex computation — must not live inside React components. Components render. Stores compute.

```tsx
// VIOLATION: Business logic in component
function OrderSummary({ items }) {
  const tax = items.reduce((sum, i) => sum + i.price * 0.08, 0)  // logic
  const total = items.reduce((sum, i) => sum + i.price, 0) + tax   // logic
  const formatted = new Intl.NumberFormat('en-US', { ... }).format(total)  // logic

  return <div>{formatted}</div>
}

// CORRECT: Store computes, component renders
function OrderSummary() {
  const formatted = useOrderStore(s => s.formattedTotal)
  return <div>{formatted}</div>
}
```

*Detection method*: AST analysis of React components (function components and hooks). Flags: array reduction/mapping for computation (not rendering), complex conditional logic (3+ branches), direct API/fetch calls, `new Date()` / `Intl` formatting. Allowlist for simple derived values.

**F2 — State Management Compliance** | HIGH
No direct `localStorage`, `sessionStorage`, or global state access from components. All persistence goes through the state management layer. This prevents the "where is this state coming from?" debugging nightmare.

```tsx
// VIOLATION: Component reaching into browser storage
function Settings() {
  const theme = localStorage.getItem('theme')
  // ...
}

// CORRECT: Through the store
function Settings() {
  const theme = useThemeStore(s => s.theme)
  // ...
}
```

*Detection method*: Identifies `localStorage.*`, `sessionStorage.*`, `document.cookie` access inside component files. Allowlist for designated state management files.

**F3 — Hook Rules** | CRITICAL
React hook rules violations that cause runtime crashes or silent bugs: conditional hooks, hooks in loops, hooks after early returns, stale closures in effects.

*Detection method*: AST control flow analysis within component functions. Identifies hook calls inside `if`, `for`, `while`, `switch`, or after `return` statements. Also detects missing dependency array entries in `useEffect`/`useMemo`/`useCallback` by comparing referenced variables against the dependency array.

**F4 — Circular Import Detection** | CRITICAL
Circular imports cause `undefined` at runtime — the classic "Cannot access 'X' before initialization". The module system resolves the cycle by returning a partially-initialized module, which means some exports are `undefined` when accessed.

*Detection method*: Builds the full import graph from AST `import`/`require` statements. Runs cycle detection (Tarjan's algorithm). Reports the shortest cycle path for each circular dependency found.

**F5 — Render Performance** | MEDIUM
Identifies patterns that cause unnecessary re-renders: objects/arrays created inline as props (new reference every render), missing `memo()` on expensive components, missing `useMemo`/`useCallback` for derived values passed as props.

*Detection method*: Identifies JSX prop expressions that create new references (object literals, array literals, arrow functions) on components that aren't wrapped in `memo()`. Flags components receiving 5+ props without memoization.

---

#### Category G: Infrastructure Detectors (5 Rules)

These catch the deployment, configuration, and environment issues that cause "works on my machine" and "works in staging, fails in production."

**G1 — Environment Variable Safety** | HIGH
Every `process.env.X` access must have a corresponding entry in `.env.example`. Every required env var must be validated at startup, not at first use (which could be hours into a production run).

```typescript
// VIOLATION: Crashes at 3am when this code path is first hit
function sendEmail(to: string) {
  const key = process.env.SENDGRID_API_KEY  // undefined in prod!
  // ...
}

// CORRECT: Validated at startup
const config = {
  sendgridKey: env.require('SENDGRID_API_KEY'),  // fails fast on boot
}
```

*Detection method*: Collects all `process.env.*` / `import.meta.env.*` references. Cross-references against `.env.example` entries. Flags missing entries. Also detects env access outside of config/bootstrap files (should be centralized).

**G2 — Hardcoded Configuration** | MEDIUM
Ports, hostnames, timeouts, retry counts, feature flags — anything that differs between environments must be externalized. Hardcoded values work until they don't, and then you're redeploying to change a timeout.

*Detection method*: Pattern matching for common hardcoded values: port numbers, `localhost`, IP addresses, timeout literals, URL strings. Allowlist for legitimate constants (HTTP status codes, math constants).

**G3 — CI/CD Pipeline Validation** | HIGH
Workflow files (GitHub Actions, GitLab CI, etc.) must include required steps: lint, test, build, security scan. Missing steps mean violations ship to production.

*Detection method*: Parses CI/CD workflow files. Validates presence of required job types against configurable policy. Flags missing jobs, jobs without failure handling, and deployment jobs without preceding test jobs.

**G4 — Docker / Container Safety** | MEDIUM
Dockerfile best practices: no `latest` tags (non-deterministic), no `root` user in production, no secrets in build args, multi-stage builds for production images.

*Detection method*: Parses Dockerfiles for known anti-patterns. Flags `FROM *:latest`, missing `USER` directive, `ARG` containing secret-like names, single-stage production builds.

**G5 — API Versioning Compliance** | HIGH
Breaking API changes must be versioned. Detects endpoint signature changes (added required params, removed fields, changed types) between the current branch and the base branch.

*Detection method*: Compares API route handler signatures (params, body schema, response shape) between git refs. Flags breaking changes without a version bump in the URL path.

---

#### Category H: Safety Gate Detectors (5 Rules)

These enforce the human-in-the-loop principle. In an AI-powered system, the most dangerous bug isn't a crash — it's an AI agent taking an irreversible action without human approval.

**H1 — Approval Gate Enforcement** | CRITICAL
Every agent action classified as "high risk" (deployments, data mutations, external API calls with side effects) must have an approval gate. An action without a gate is an action that can go wrong with no human checkpoint.

```typescript
// VIOLATION: Agent deploys directly — no human checkpoint
async function executeDeployment(agent: Agent, target: string) {
  await deploy(target)  // irreversible, no gate
}

// CORRECT: Gate enforced before irreversible action
async function executeDeployment(agent: Agent, target: string) {
  const approval = await gates.require('human_required', {
    action: 'deploy',
    target,
    agent: agent.id,
    reason: 'Production deployment requires human approval',
  })
  if (!approval.granted) return
  await deploy(target)
}
```

*Detection method*: Identifies functions tagged as agent actions. Traces execution path for irreversible operations (deploy, delete, external POST/PUT/PATCH). Flags paths that reach irreversible operations without a preceding `gates.require()` or `approval.check()` call.

**H2 — Gate Downgrade Detection** | CRITICAL
A safety gate must never be downgraded from `BLOCK` to `WARN` or from `human_required` to `auto`. This is the single most dangerous pattern in agentic systems — it's how guardrails silently disappear.

```typescript
// VIOLATION: Gate downgraded — agents now bypass human review
if (isUrgent) {
  task.approvalGate = 'auto'  // was 'human_required'!
}

// CORRECT: Escalate, never downgrade
if (isUrgent) {
  task.approvalGate = 'human_required'  // stays gated, gets priority
  task.priority = 'critical'
}
```

*Detection method*: Identifies assignments to approval gate fields. Validates the new value is equal to or stricter than the current value. Flags any assignment that reduces gate strictness (`human_required` → `team_review` → `auto`). Zero tolerance — this is always CRITICAL.

**H3 — Threshold Guard Validation** | HIGH
Safety thresholds (rate limits, cost caps, error budgets) must be enforced as hard blocks, not soft warnings. A warning that logs and continues is not a safety gate — it's a liability.

```typescript
// VIOLATION: Threshold exceeded but execution continues
if (agent.costUsd > costCap) {
  logger.warn('Cost cap exceeded')  // logs and continues!
}

// CORRECT: Hard block with explicit override path
if (agent.costUsd > costCap) {
  throw new SafetyGateError('Cost cap exceeded', {
    current: agent.costUsd,
    limit: costCap,
    override: 'human_required',  // explicit escalation, not silent continuation
  })
}
```

*Detection method*: Identifies conditional blocks that check threshold values (cost, rate, error count, time). Flags when the consequent block only contains logging without a throw, return, or gate call.

**H4 — Audit Trail Completeness** | HIGH
Every agent action must produce an audit record: who (agent ID), what (action type), when (timestamp), why (trigger), result (success/failure), and approval (who approved, gate type). Missing audit fields create compliance gaps.

*Detection method*: Identifies agent action functions. Validates that each action produces a structured log/record containing required audit fields. Flags missing fields.

**H5 — Rollback Path Validation** | HIGH
Every irreversible action must have a documented rollback procedure. Deployments need rollback. Data migrations need down migrations. External API calls with side effects need compensation transactions.

*Detection method*: Identifies irreversible action functions. Checks for corresponding rollback/compensate functions or documented rollback procedures in adjacent comments/docs. Flags actions with no rollback path.

---

### How Detectors Are Built

Every detector follows the same contract:

```
class MyDetector extends BaseDetector {
  // 1. Declare what files you scan
  static filePatterns = ['**/*.ts', '**/*.tsx']

  // 2. Declare what you exclude
  static excludePatterns = ['**/*.test.*', '**/*.spec.*', '**/node_modules/**']

  // 3. Implement detection methods (can have multiple)
  async _detect_my_pattern(ast: AST, filePath: string): Violation[] {
    // AST analysis, pattern matching, cross-reference checks
    // Return typed Violation objects with file, line, rule, message, confidence
  }

  // 4. Implement suggested fix (optional, enables auto-fix)
  async _suggest_fix(violation: Violation): Fix | null {
    // Return an AST-level transformation that resolves the violation
    // Must be safe, minimal, and verifiable (scanner re-runs on the fix)
  }
}
```

**Key architectural properties:**
- Detectors are stateless — they receive a file, return violations
- Detectors are composable — multiple detectors scan the same file in parallel
- Detectors are testable — each has a fixture suite of known-good and known-bad files
- Detectors are versioned — rule changes are tracked, so trend data accounts for rule evolution
- Detectors self-report confidence — 100% for AST-verified patterns, lower for heuristic matches

### Triage — Context-Aware Severity

Not all violations are equal. Severity is computed, not assigned.

| Level | Action | Trigger |
|-------|--------|---------|
| **CRITICAL** | Block deployment. Create urgent ticket. | SQL injection, safety gate bypass, data layer violation |
| **HIGH** | Auto-create ticket. Agent assigned within sprint. | Missing type guards, circular deps, ownership violations |
| **MEDIUM** | Batch into next sprint. Track trend. | Code hygiene, naming conventions, minor optimizations |
| **LOW** | Surface in dashboard. Optional fix. | Style, documentation gaps, whitespace |

**Context modifiers:**
- Test files: Downgraded 2 levels (violations in tests are lower risk)
- Critical infrastructure: Upgraded 1 level (violations in core services are higher risk)
- Archived/deprecated code: Downgraded 2-3 levels
- Frequency: Recurring violations across files get upgraded

### Remediate — AI Agent Auto-Fix

This is where Nebula Scanner diverges from every other tool. Findings don't sit in a backlog — they get fixed.

```
Violation detected
    → Severity assessed (context-aware)
    → Ticket created in Nebula board (typed, prioritized, linked to rule)
    → AI agent assigned based on violation category
    → Agent generates fix (AST-aware, not blind regex replacement)
    → Fix routed through approval gate:
        - AUTO: Agent commits directly (low-risk, high-confidence)
        - HUMAN_REQUIRED: Human reviews before merge (security, architecture)
        - TEAM_REVIEW: Peer review required (cross-cutting changes)
    → Metrics updated, health score recalculated
```

### Monitor — Continuous Compliance

Scanning isn't a one-time event. Nebula Scanner runs continuously.

| Trigger | Scope | Speed |
|---------|-------|-------|
| **Pre-commit hook** | Changed files only | 2-5s |
| **PR gate** | Full project scan | 10-30s |
| **Sprint boundary** | Portfolio-wide audit | 45-90s |
| **Continuous watch** | File-system events | <1s per change |
| **Scheduled** | Health score + trends | Background |

---

## Architecture

### Scanner Pipeline

```
Source Code
    → File Discovery (glob patterns, git diff, fs watch)
    → AST Parsing (language-specific, cached)
    → Detector Dispatch (parallel workers, max 8)
    → Violation Yield (typed dataclasses per detector)
    → Aggregation (deduplication, correlation, grouping)
    → Severity Classification (context-aware rules)
    → Output (dashboard, JSON, tickets, webhooks)
    → Storage (scan history, analytics, trend data)
```

### 3-Tier Caching

The reason repeat scans take 2s instead of 90s.

```
TIER 1: Memory Cache
  - Current session only
  - <1ms access
  - AST trees, compiled patterns, recent results
  - 1000 items, 5min TTL

TIER 2: Persistent Cache (Redis / SQLite)
  - Survives restarts
  - ~1ms access (Redis) / ~5ms (SQLite)
  - AST trees, violations, FP signatures
  - 24h TTL (AST), 7d TTL (violations)

TIER 3: Full Parse
  - Cache miss path
  - 100-500ms per file
  - Result populates Tier 1 + 2
```

### Detector Architecture

Every detector inherits from `BaseDetector` which provides:

```
BaseDetector
├── get_cached_ast()          # 3-tier AST caching
├── is_false_positive()       # Persistent FP lookup + learning
├── mark_false_positive()     # FP feedback loop
├── log_violation()           # Structured violation output
├── context_severity()        # Context-aware severity adjustment
└── [Domain detectors inherit and implement _detect_*() methods]
```

**Key design decisions:**
- Detectors yield typed violation objects (not strings)
- Each violation carries: file, line, rule, severity, suggested fix, confidence score
- Violations are deduplicated at the aggregator level
- FP learning persists across sessions — mark once, never see again

### Storage

```
violations.db          — All violations with full context
scan_history.db        — Every scan: timestamp, duration, file count, violation count
analytics.db           — Trends, health scores, team metrics
fp_signatures.db       — Learned false positive patterns
```

---

## Enterprise Policy Rules

Nebula Scanner ships with battle-tested default rules, but enterprises define their own. Rules are organized into policy categories that map to organizational concerns.

### Default Policy Categories

| Category | ID Range | Focus |
|----------|----------|-------|
| Architecture | A1-A5 | Service boundaries, dependency injection, initialization order, ownership |
| Type Safety | B1-B5 | Runtime type validation, format safety, iteration guards |
| Data Layer | C1-C5 | Atomic operations, query patterns, cache correctness, TTL enforcement |
| Security | D1-D5 | Injection prevention, session safety, secrets, path traversal, OWASP Top 10 |
| Code Quality | E1-E5 | Logging, API contracts, fallback chains, dead code, duplication |
| Frontend | F1-F5 | Component architecture, state management, streaming, hook rules |
| Infrastructure | G1-G5 | IPC contracts, deployment, CI/CD, environment configuration |
| Safety Gates | H1-H5 | Approval enforcement, hard-block validation, threshold compliance |

### Custom Rules

Enterprises add rules specific to their domain:

```yaml
# .nebula/policies/payment-rules.yaml
rules:
  - id: PAY-1
    name: "PCI-DSS: No raw card numbers in logs"
    severity: CRITICAL
    detector: security
    pattern: "log.*(card_number|pan|cvv)"
    scope: "src/payments/**"
    gate: human_required

  - id: PAY-2
    name: "Payment amounts must use Decimal, not float"
    severity: HIGH
    detector: type_safety
    pattern: "float\\(.*amount"
    scope: "src/payments/**"
    autofix: true
```

---

## Integration With Nebula Orchestration

This is the multiplier. The scanner doesn't exist in isolation — it's wired into the entire AI orchestration platform.

### Violation → Ticket Pipeline

```
Scanner detects violation
    ↓
Nebula creates task on the active board:
    - Title: "[SCAN] {rule_id}: {description}"
    - Priority: Mapped from severity (CRITICAL → critical, HIGH → high, etc.)
    - Labels: ["scanner", category, rule_id]
    - Approval gate: Based on severity + rule config
    - Epic: Linked to "Code Health" epic
    - Sprint: Current active sprint (HIGH+) or backlog (MEDIUM-)
    ↓
AI agent assigned based on violation category:
    - Architecture violations → Architect agent
    - Security violations → Security agent
    - Type safety → Developer agent
    - Frontend → Frontend agent
    ↓
Agent generates fix:
    - Reads violation context (file, line, rule, suggested fix)
    - Analyzes surrounding code (AST-aware)
    - Generates minimal, targeted fix
    - Runs scanner on fix to verify resolution
    ↓
Approval gate enforced:
    - AUTO: Commit + close ticket
    - HUMAN_REQUIRED: PR created, human notified
    - TEAM_REVIEW: PR created, team notified, 2+ approvals required
```

### Health Score Dashboard

Every project gets a compliance health score (0-100), computed from:

```
Health Score = 100 - (
    CRITICAL_violations * 10 +
    HIGH_violations * 3 +
    MEDIUM_violations * 1 +
    LOW_violations * 0.1
) / total_files * normalization_factor
```

Displayed on:
- Project cards (dashboard)
- Sprint progress views
- Portfolio-level executive dashboard
- Trend charts (is compliance improving or degrading?)

### Approval Gate Integration

Scanner severity maps directly to approval gates:

| Severity | Default Gate | Rationale |
|----------|-------------|-----------|
| CRITICAL | `human_required` | Security/architecture — human must verify |
| HIGH | `team_review` | Significant change — peer review needed |
| MEDIUM | `auto` | Low-risk fix — AI proceeds autonomously |
| LOW | `auto` | Trivial — auto-fix and close |

Enterprises override these defaults per category, per project, per team.

---

## Performance Benchmarks

Built for enterprise scale. These numbers are from a 430,000 LOC production codebase.

| Operation | Time | Notes |
|-----------|------|-------|
| Quick scan (changed files) | 2-5s | Incremental, cached, critical only |
| Category scan | 5-15s | Single category, all files |
| Full standards audit | 45-90s | All rules, all files |
| Health score query | <0.1s | Cached aggregation |
| Violation query | <0.1s | Indexed lookup |
| Trend analysis (30 days) | <0.5s | Pre-computed |
| Repeat full scan | 3-8s | 100-1500x faster via caching |

### Scale Characteristics

- **Files**: Tested to 2,000+ files per project
- **Projects**: Portfolio scanning across 6+ simultaneous projects
- **Rules**: 40+ rules with linear scaling (not exponential)
- **Detectors**: Parallel execution (8 workers default, configurable)
- **History**: 12 months of scan history with constant-time queries

---

## Scan Modes

| Mode | Use Case | Speed | Coverage |
|------|----------|-------|----------|
| **Quick** | Pre-commit, CI fast-check | 2-5s | Critical violations, changed files |
| **Standard** | PR review, daily check | 10-30s | All rules, project scope |
| **Deep** | Sprint boundary, release gate | 45-90s | All rules + analytics + trends |
| **Watch** | Continuous development | <1s/change | Real-time, file-system triggered |
| **Emergency** | Production incident triage | 2-5s | Security + safety gates only |
| **Discovery** | Code exploration | varies | Semantic search, pattern matching |
| **Ship** | Deployment readiness | 30-60s | Full audit + deployment checks |

---

## Meta-Analysis — The Scanner Scans Itself

A scanner that can't detect its own flaws is a liability.

**Self-monitoring capabilities:**
- **False positive detection**: Tracks violations that get marked as FP, identifies patterns, auto-suppresses known FPs
- **Detector bug tracking**: Monitors for detector crashes, timeouts, anomalous output
- **Improvement suggestions**: Surfaces gaps in coverage based on violation patterns
- **Confidence scoring**: Each violation carries a confidence score (0-100%) based on detection method and context

**FP learning loop:**
```
Violation flagged as FP by developer
    → FP signature extracted
    → Stored in persistent FP database
    → Future scans check FP database before reporting
    → After N confirmations, violation pattern permanently suppressed
    → Meta-analysis reports FP patterns to improve detectors
```

---

## CLI Reference

### Primary Commands

```bash
nebula scan                          # Standard project scan
nebula scan --quick                  # Quick (changed files, critical only)
nebula scan --deep                   # Deep (all rules + analytics)
nebula scan --category security      # Single category
nebula scan --file path/to/file.ts   # Single file
nebula scan --priority critical      # Filter by severity
nebula scan --autofix                # Generate fixes for violations
```

### Analytics

```bash
nebula health                        # Project health score (0-100)
nebula dashboard                     # Full compliance dashboard
nebula trends --days 30              # 30-day violation trends
nebula top-files --limit 20          # Top violating files
nebula report --export pdf           # Export compliance report
```

### Configuration

```bash
nebula init                          # Initialize scanner for project
nebula rules --list                  # List all active rules
nebula rules --add custom-rule.yaml  # Add custom policy rule
nebula rules --disable RULE_ID       # Disable a rule
nebula fp --show                     # Show learned false positives
nebula fp --clear                    # Clear FP database
```

### CI/CD Integration

```bash
nebula gate --pre-commit             # Install pre-commit hook
nebula gate --pr                     # Run as PR check (exit code = pass/fail)
nebula gate --deploy                 # Deployment readiness gate
```

---

## What Makes This Different

| Traditional Linter | Nebula Scanner |
|-------------------|----------------|
| Dumps warnings to terminal | Creates tickets on your board |
| Developer fixes manually | AI agent generates fix |
| Binary pass/fail | Context-aware severity (5 levels) |
| Runs when you remember | Runs continuously (hooks, CI, watch) |
| No memory across runs | Persistent caching, FP learning, trend tracking |
| One-size-fits-all rules | Enterprise-customizable policy rules |
| Finds syntax issues | Finds architectural drift |
| No accountability | Full audit trail with approval gates |
| Speed degrades with codebase | 3-tier caching maintains <5s quick scans |

---

## Provenance

This system was forged over 9 months across 4,164 commits and 2,800+ documented production incidents. Every rule has a story. Every detector has a scar. The architecture isn't theoretical — it was pressure-tested against a live, high-stakes production system handling real operations 24/7.

The patterns are universal. The lessons are transferable. The code is battle-proven.

Built to be the compliance backbone of enterprise AI orchestration.

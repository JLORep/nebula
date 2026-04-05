import type { AgentRole } from "@/lib/types";

// ============================================================================
// Terminal Messages — realistic AI agent terminal output
// Pure data + generators. No side effects.
// ============================================================================

export type TerminalLineType =
  | "thinking"   // ◐  Agent reasoning
  | "action"     // $  Agent doing work
  | "output"     // →  Sub-result / follow-up
  | "file"       // ▸  File read/write
  | "test_pass"  // ✓  Test passed
  | "test_fail"  // ✗  Test failed
  | "success"    // ✓  Generic success
  | "warning"    // ⚠  Warning
  | "complete"   // ★  Task completed
  | "approval"   // ⏳ Awaiting approval
  | "system";    // │  System message

export interface TerminalLine {
  id: string;
  timestamp: number;
  agentName: string;
  agentRole: AgentRole;
  type: TerminalLineType;
  content: string;
}

// ── Realistic file paths ────────────────────────────────────────────────────

const srcPaths = [
  "src/auth/providers/oauth2.ts",
  "src/auth/middleware/session.ts",
  "src/auth/handlers/callback.ts",
  "src/auth/guards/rbac.ts",
  "src/api/routes/auth.ts",
  "src/api/routes/users.ts",
  "src/lib/jwt/token-manager.ts",
  "src/lib/crypto/hash.ts",
  "src/lib/validation/schema.ts",
  "src/db/schema/users.sql",
  "src/db/migrations/003_permissions.sql",
  "src/middleware/rate-limit.ts",
  "src/middleware/cors.ts",
  "src/etl/pipeline/transform.ts",
  "src/etl/connectors/postgres.ts",
  "src/etl/validators/schema.ts",
  "src/components/auth/login-form.tsx",
  "src/components/portal/dashboard.tsx",
  "src/components/shared/data-table.tsx",
  "src/lib/streaming/ws-handler.ts",
  "src/lib/cache/redis-client.ts",
  "src/config/environment.ts",
];

const testPaths = [
  "tests/auth/login.test.ts",
  "tests/auth/oauth2.test.ts",
  "tests/auth/rbac.test.ts",
  "tests/integration/auth-flow.test.ts",
  "tests/integration/api-routes.test.ts",
  "tests/e2e/portal-login.spec.ts",
  "tests/unit/jwt-manager.test.ts",
  "tests/unit/validation.test.ts",
  "tests/etl/pipeline.test.ts",
  "tests/security/injection.test.ts",
];

const modules = [
  "auth module", "user permissions", "OAuth2 flow", "session management",
  "API gateway", "rate limiter", "JWT handler", "RBAC middleware",
  "data pipeline", "ETL connector", "query builder", "cache layer",
  "WebSocket handler", "event bus", "payment gateway", "notification service",
];

const vulnTypes = [
  "SQL injection risk in query builder",
  "XSS vulnerability in input sanitizer",
  "CORS misconfiguration in auth routes",
  "insecure direct object reference in /api/users",
  "missing rate limit on /api/auth/login",
  "weak password hashing algorithm detected",
  "JWT secret rotation not configured",
  "unvalidated redirect in OAuth callback",
];

// ── Helpers ─────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

// ── Message generators by role ──────────────────────────────────────────────

type LineData = { type: TerminalLineType; content: string };

function plannerLines(title: string): LineData[] {
  const pool: LineData[][] = [
    [
      { type: "thinking", content: `Decomposing "${title}" into subtasks...` },
      { type: "output", content: `identified ${randInt(3, 6)} work items · est. ${randInt(5, 13)} story points` },
    ],
    [
      { type: "action", content: `Analyzing sprint capacity and team velocity` },
      { type: "output", content: `velocity ${randInt(24, 38)} pts/sprint · ${randInt(55, 85)}% utilized` },
    ],
    [
      { type: "action", content: `Mapping dependencies for ${title}` },
      { type: "output", content: `${randInt(2, 5)} blocking deps identified · resolving priority order` },
    ],
    [
      { type: "thinking", content: `Evaluating 3 approaches for ${pick(modules)}` },
      { type: "output", content: `recommended: approach B — lower complexity, better test coverage` },
    ],
    [
      { type: "file", content: `Writing SPRINT-PLAN.md — ${randInt(40, 120)} lines` },
      { type: "success", content: `Sprint plan committed · ${randInt(3, 6)} tasks queued` },
    ],
  ];
  return pick(pool);
}

function architectLines(title: string): LineData[] {
  const path = pick(srcPaths);
  const pool: LineData[][] = [
    [
      { type: "file", content: `Reading ${path} (${randInt(80, 420)} lines)` },
      { type: "output", content: `analyzing dependency graph... ${randInt(8, 22)} modules loaded` },
    ],
    [
      { type: "thinking", content: `Designing schema for ${pick(modules)}` },
      { type: "output", content: `3 tables, ${randInt(12, 28)} columns, 2 foreign keys` },
    ],
    [
      { type: "action", content: `Evaluating API contract for ${title}` },
      { type: "output", content: `${randInt(4, 8)} endpoints · REST + WebSocket hybrid recommended` },
    ],
    [
      { type: "file", content: `Writing ARCHITECTURE.md — system boundary diagram` },
      { type: "success", content: `Architecture spec ready for review` },
    ],
    [
      { type: "warning", content: `Circular dependency detected: ${pick(modules)} ↔ ${pick(modules)}` },
      { type: "output", content: `proposing interface extraction to break cycle` },
    ],
  ];
  return pick(pool);
}

function developerLines(title: string): LineData[] {
  const path = pick(srcPaths);
  const pool: LineData[][] = [
    [
      { type: "file", content: `Reading ${path} (${randInt(80, 380)} lines)` },
      { type: "action", content: `Implementing ${title}` },
    ],
    [
      { type: "file", content: `Writing ${path} — ${randInt(40, 200)} lines` },
      { type: "success", content: `Build passed · compiled in ${(Math.random() * 3 + 0.8).toFixed(1)}s` },
    ],
    [
      { type: "action", content: `Refactoring ${pick(modules)}` },
      { type: "output", content: `extracted ${randInt(2, 5)} shared utilities · -${randInt(40, 180)} lines` },
    ],
    [
      { type: "action", content: `Fixing type error in ${path}:${randInt(12, 340)}` },
      { type: "success", content: `Type check passed · 0 errors` },
    ],
    [
      { type: "thinking", content: `Analyzing best approach for ${pick(modules)}...` },
      { type: "file", content: `Writing ${pick(srcPaths)} — ${randInt(60, 250)} lines` },
    ],
    [
      { type: "action", content: `Installing dependencies: ${pick(["zod", "jose", "ioredis", "pg", "ws", "bcrypt"])}` },
      { type: "success", content: `added ${randInt(1, 3)} packages · lockfile updated` },
    ],
  ];
  return pick(pool);
}

function testerLines(title: string): LineData[] {
  const testPath = pick(testPaths);
  const total = randInt(8, 32);
  const passed = total - randInt(0, 2);
  const ms = randInt(48, 2400);
  const pool: LineData[][] = [
    [
      { type: "action", content: `Running ${testPath}` },
      { type: passed === total ? "test_pass" : "test_fail", content: passed === total
        ? `PASS ${total}/${total} tests (${ms}ms)`
        : `FAIL ${passed}/${total} — ${total - passed} assertion${total - passed > 1 ? "s" : ""} failed` },
    ],
    [
      { type: "action", content: `Coverage report for ${pick(modules)}` },
      { type: "output", content: `statements ${(75 + Math.random() * 20).toFixed(1)}% · branches ${(68 + Math.random() * 25).toFixed(1)}% · functions ${(80 + Math.random() * 15).toFixed(1)}%` },
    ],
    [
      { type: "action", content: `Running accessibility audit on ${pick(["login page", "dashboard", "settings panel", "data table", "nav menu"])}` },
      { type: "success", content: `WCAG 2.2 AA compliant · ${randInt(0, 2)} minor warnings` },
    ],
    [
      { type: "action", content: `Load testing ${pick(modules)} — ${randInt(100, 500)} concurrent requests` },
      { type: "output", content: `p50: ${randInt(12, 45)}ms · p95: ${randInt(80, 220)}ms · p99: ${randInt(200, 800)}ms` },
    ],
    [
      { type: "action", content: `E2E test: ${pick(["login flow", "registration", "password reset", "OAuth callback", "session refresh"])}` },
      { type: "test_pass", content: `PASS all assertions · ${(Math.random() * 4 + 1).toFixed(1)}s` },
    ],
  ];
  return pick(pool);
}

function reviewerLines(title: string): LineData[] {
  const path = pick(srcPaths);
  const pool: LineData[][] = [
    [
      { type: "action", content: `Scanning ${pick(modules)} for vulnerabilities...` },
      { type: "output", content: `0 critical · ${randInt(0, 2)} medium · ${randInt(1, 4)} low` },
    ],
    [
      { type: "action", content: `Code review: ${path}` },
      { type: "output", content: `${randInt(2, 8)} comments · ${randInt(0, 2)} blocking` },
    ],
    [
      { type: "warning", content: pick(vulnTypes) },
      { type: "output", content: `flagged for manual review · blocking merge` },
    ],
    [
      { type: "action", content: `Static analysis on ${pick(modules)}` },
      { type: "success", content: `No issues found · complexity score: ${randInt(3, 18)}/25` },
    ],
    [
      { type: "action", content: `Checking compliance: SOC2 + GDPR requirements` },
      { type: "success", content: `All ${randInt(12, 24)} controls satisfied` },
    ],
  ];
  return pick(pool);
}

function deployerLines(title: string): LineData[] {
  const hash = Math.random().toString(36).slice(2, 9);
  const pool: LineData[][] = [
    [
      { type: "action", content: `Building Docker image...` },
      { type: "success", content: `pushed sha256:${hash} · ${randInt(120, 380)}MB` },
    ],
    [
      { type: "action", content: `Deploying to staging-v${randInt(2, 8)}.forge.dev` },
      { type: "success", content: `Health check: 200 OK (${randInt(8, 45)}ms) · ${randInt(2, 6)} replicas` },
    ],
    [
      { type: "action", content: `Running smoke tests on staging...` },
      { type: "test_pass", content: `PASS ${randInt(5, 12)}/${randInt(5, 12)} smoke tests` },
    ],
    [
      { type: "action", content: `Rolling out ${title} to production` },
      { type: "output", content: `canary: 10% → 50% → 100% · 0 errors in 30s window` },
    ],
    [
      { type: "action", content: `Configuring feature flags for ${pick(modules)}` },
      { type: "success", content: `flag "${pick(["enable_oauth2", "new_dashboard", "v2_api", "realtime_sync"])}" enabled for 100%` },
    ],
  ];
  return pick(pool);
}

const generators: Record<AgentRole, (title: string) => LineData[]> = {
  planner: plannerLines,
  architect: architectLines,
  developer: developerLines,
  tester: testerLines,
  reviewer: reviewerLines,
  deployer: deployerLines,
};

export function generateTerminalOutput(role: AgentRole, taskTitle: string): LineData[] {
  return generators[role](taskTitle);
}

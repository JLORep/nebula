import type { Project, Task, Theme, Epic, Sprint, Board } from "@/lib/types";
import { users } from "../users";
import { agents } from "../agents";
import { taskKey, buildColumns, dateOffset } from "../helpers";
import { authMilestones } from "../milestones";

// ============================================================================
// AUTH — Enterprise Authentication Platform
// OAuth2, RBAC, SSO (13 stories)
// ============================================================================

const PROJECT_ID = "proj-auth";
const KEY = "AUTH";

export const authThemes: Theme[] = [
  { id: "theme-auth-iam", projectId: PROJECT_ID, name: "Identity & Access Management", description: "Core identity infrastructure and access control systems", color: "#8b5cf6" },
  { id: "theme-auth-sso", projectId: PROJECT_ID, name: "Single Sign-On", description: "Enterprise SSO federation and provider integrations", color: "#06b6d4" },
  { id: "theme-auth-compliance", projectId: PROJECT_ID, name: "Security Compliance", description: "Audit logging, SOC2 controls, and compliance automation", color: "#f59e0b" },
];

export const authEpics: Epic[] = [
  { id: "epic-auth-rbac", projectId: PROJECT_ID, themeId: "theme-auth-iam", name: "RBAC Permission Engine", description: "Role-based access control with hierarchical permissions", status: "in_progress" },
  { id: "epic-auth-oauth", projectId: PROJECT_ID, themeId: "theme-auth-sso", name: "OAuth2 Provider Integration", description: "Multi-provider OAuth2 with PKCE and token rotation", status: "in_progress" },
  { id: "epic-auth-session", projectId: PROJECT_ID, themeId: "theme-auth-iam", name: "Session Management", description: "Distributed session handling with Redis backing", status: "open" },
  { id: "epic-auth-audit", projectId: PROJECT_ID, themeId: "theme-auth-compliance", name: "Audit Trail System", description: "Comprehensive audit logging for all auth events", status: "open" },
  { id: "epic-auth-mfa", projectId: PROJECT_ID, themeId: "theme-auth-sso", name: "Multi-Factor Authentication", description: "TOTP, WebAuthn, and SMS-based MFA", status: "open" },
];

export const authSprints: Sprint[] = [
  {
    id: "sprint-auth-7", name: "Sprint 7 — Auth & Permissions", startDate: "2026-03-31", endDate: "2026-04-14",
    goal: "Complete OAuth2 integration and RBAC system for enterprise SSO",
    velocity: 34, completedPoints: 13, totalPoints: 34, projectId: PROJECT_ID, number: 7, status: "active",
  },
  {
    id: "sprint-auth-8", name: "Sprint 8 — Session & MFA", startDate: "2026-04-14", endDate: "2026-04-28",
    goal: "Implement session management and multi-factor authentication",
    velocity: 0, completedPoints: 0, totalPoints: 29, projectId: PROJECT_ID, number: 8, status: "planning",
  },
];

export const authTasks: Task[] = [
  {
    id: "t-auth-1", key: taskKey(KEY, 101), title: "Design RBAC permission schema",
    description: "Design the database schema for role-based access control supporting hierarchical permissions, attribute-based extensions, and multi-tenant isolation.",
    status: "done", priority: "critical", issueType: "spike", assignee: users.sarah, agent: agents.athena,
    labels: ["architecture", "security"], storyPoints: 5, createdAt: dateOffset(-4), updatedAt: dateOffset(-2),
    subtasks: [
      { id: "st1", title: "Research existing RBAC patterns", completed: true },
      { id: "st2", title: "Define permission hierarchy", completed: true },
      { id: "st3", title: "Create migration scripts", completed: true },
    ],
    approvalGate: "human_required", executionLog: [], completionPercent: 100,
    projectId: PROJECT_ID, epicId: "epic-auth-rbac", themeId: "theme-auth-iam", sprintId: "sprint-auth-7",
    blockedBy: [], blocking: ["t-auth-4"],
  },
  {
    id: "t-auth-2", key: taskKey(KEY, 102), title: "Implement OAuth2 provider integration",
    description: "Build OAuth2 authentication flow supporting Google, Microsoft, and Okta SSO providers with PKCE and refresh token rotation.",
    status: "in_progress", priority: "critical", issueType: "story", assignee: users.marcus, agent: agents.forge,
    labels: ["auth", "integration"], storyPoints: 8, createdAt: dateOffset(-4), updatedAt: dateOffset(-1),
    subtasks: [
      { id: "st4", title: "OAuth2 callback handler", completed: false },
      { id: "st5", title: "Token rotation logic", completed: false },
      { id: "st6", title: "Provider config management", completed: true },
      { id: "st7", title: "Session persistence layer", completed: false },
    ],
    approvalGate: "team_review", executionLog: agents.forge.actions, completionPercent: 35,
    projectId: PROJECT_ID, epicId: "epic-auth-oauth", themeId: "theme-auth-sso", sprintId: "sprint-auth-7",
    blockedBy: [], blocking: ["t-auth-6"],
  },
  {
    id: "t-auth-3", key: taskKey(KEY, 103), title: "Security audit: Query builder module",
    description: "Review the query builder for SQL injection vulnerabilities, ensure all user inputs are parameterized, and validate ORM usage patterns.",
    status: "in_review", priority: "critical", issueType: "task", assignee: users.sarah, agent: agents.oracle,
    labels: ["security", "audit"], storyPoints: 3, createdAt: dateOffset(-3), updatedAt: dateOffset(-1),
    subtasks: [
      { id: "st8", title: "Static analysis scan", completed: true },
      { id: "st9", title: "Manual code review", completed: true },
      { id: "st10", title: "Fix identified vulnerabilities", completed: false },
    ],
    approvalGate: "human_required", executionLog: agents.oracle.actions, completionPercent: 70,
    projectId: PROJECT_ID, epicId: "epic-auth-rbac", themeId: "theme-auth-iam", sprintId: "sprint-auth-7",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-auth-4", key: taskKey(KEY, 104), title: "Build permission middleware",
    description: "Create Express middleware that enforces RBAC permissions on all API routes with caching and graceful degradation.",
    status: "todo", priority: "high", issueType: "story", assignee: users.marcus, agent: null,
    labels: ["backend", "security"], storyPoints: 5, createdAt: dateOffset(-4), updatedAt: dateOffset(-4),
    subtasks: [
      { id: "st11", title: "Middleware skeleton", completed: false },
      { id: "st12", title: "Permission cache layer", completed: false },
      { id: "st13", title: "Route protection decorator", completed: false },
    ],
    approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-auth-rbac", themeId: "theme-auth-iam", sprintId: "sprint-auth-7",
    blockedBy: ["t-auth-1"], blocking: [],
  },
  {
    id: "t-auth-5", key: taskKey(KEY, 105), title: "Design permissions UI components",
    description: "Build React components for the admin permissions panel: role editor, permission matrix, user assignment, and audit log viewer.",
    status: "todo", priority: "medium", issueType: "story", assignee: users.elena, agent: null,
    labels: ["frontend", "design"], storyPoints: 5, createdAt: dateOffset(-3), updatedAt: dateOffset(-3),
    subtasks: [
      { id: "st14", title: "Role editor component", completed: false },
      { id: "st15", title: "Permission matrix grid", completed: false },
      { id: "st16", title: "Audit log viewer", completed: false },
    ],
    approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-auth-rbac", themeId: "theme-auth-iam", sprintId: "sprint-auth-7",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-auth-6", key: taskKey(KEY, 106), title: "Write integration tests for auth flow",
    description: "Comprehensive integration test suite for the complete OAuth2 flow including edge cases: expired tokens, revoked access, multi-device sessions.",
    status: "backlog", priority: "high", issueType: "task", assignee: null, agent: null,
    labels: ["testing"], storyPoints: 5, createdAt: dateOffset(-2), updatedAt: dateOffset(-2),
    subtasks: [], approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-auth-oauth", themeId: "theme-auth-sso", sprintId: "sprint-auth-7",
    blockedBy: ["t-auth-2"], blocking: [],
  },
  {
    id: "t-auth-7", key: taskKey(KEY, 107), title: "Set up CI/CD pipeline for auth service",
    description: "Configure GitHub Actions workflow for the auth microservice: lint, test, build, deploy to staging with automatic rollback.",
    status: "backlog", priority: "medium", issueType: "task", assignee: users.alex, agent: null,
    labels: ["devops", "ci-cd"], storyPoints: 3, createdAt: dateOffset(-2), updatedAt: dateOffset(-2),
    subtasks: [], approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-auth-audit", themeId: "theme-auth-compliance", sprintId: "sprint-auth-7",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-auth-8", key: taskKey(KEY, 108), title: "Implement TOTP-based MFA",
    description: "Add Time-based One-Time Password support with QR code enrollment, backup codes, and recovery flow.",
    status: "backlog", priority: "high", issueType: "story", assignee: users.jordan, agent: null,
    labels: ["security", "auth"], storyPoints: 8, createdAt: dateOffset(-1), updatedAt: dateOffset(-1),
    subtasks: [], approvalGate: "human_required", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-auth-mfa", themeId: "theme-auth-sso", sprintId: "sprint-auth-8",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-auth-9", key: taskKey(KEY, 109), title: "Redis session store integration",
    description: "Replace in-memory session store with Redis-backed distributed sessions supporting clustering and TTL-based expiry.",
    status: "backlog", priority: "medium", issueType: "story", assignee: null, agent: null,
    labels: ["backend", "infrastructure"], storyPoints: 5, createdAt: dateOffset(-1), updatedAt: dateOffset(-1),
    subtasks: [], approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-auth-session", themeId: "theme-auth-iam", sprintId: "sprint-auth-8",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-auth-10", key: taskKey(KEY, 110), title: "WebAuthn passwordless login",
    description: "Implement FIDO2/WebAuthn for passwordless authentication with platform authenticator support.",
    status: "backlog", priority: "medium", issueType: "spike", assignee: users.jordan, agent: null,
    labels: ["security", "research"], storyPoints: 5, createdAt: dateOffset(-1), updatedAt: dateOffset(-1),
    subtasks: [], approvalGate: "human_required", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-auth-mfa", themeId: "theme-auth-sso", sprintId: "sprint-auth-8",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-auth-11", key: taskKey(KEY, 111), title: "Fix token refresh race condition",
    description: "Multiple concurrent requests can trigger parallel token refreshes. Implement mutex-style coordination.",
    status: "in_progress", priority: "high", issueType: "bug", assignee: users.marcus, agent: agents.forge,
    labels: ["bug", "auth"], storyPoints: 3, createdAt: dateOffset(-2), updatedAt: dateOffset(0),
    subtasks: [
      { id: "st17", title: "Reproduce race condition", completed: true },
      { id: "st18", title: "Implement refresh mutex", completed: false },
    ],
    approvalGate: "auto", executionLog: [], completionPercent: 40,
    projectId: PROJECT_ID, epicId: "epic-auth-oauth", themeId: "theme-auth-sso", sprintId: "sprint-auth-7",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-auth-12", key: taskKey(KEY, 112), title: "Audit event streaming pipeline",
    description: "Build real-time audit event pipeline using server-sent events for compliance dashboard.",
    status: "backlog", priority: "medium", issueType: "story", assignee: null, agent: null,
    labels: ["compliance", "streaming"], storyPoints: 5, createdAt: dateOffset(-1), updatedAt: dateOffset(-1),
    subtasks: [], approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-auth-audit", themeId: "theme-auth-compliance", sprintId: "sprint-auth-8",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-auth-13", key: taskKey(KEY, 113), title: "SOC2 compliance checklist automation",
    description: "Automate SOC2 Type II evidence collection for auth subsystem, generating compliance reports on demand.",
    status: "backlog", priority: "low", issueType: "story", assignee: users.jordan, agent: null,
    labels: ["compliance", "automation"], storyPoints: 3, createdAt: dateOffset(0), updatedAt: dateOffset(0),
    subtasks: [], approvalGate: "human_required", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-auth-audit", themeId: "theme-auth-compliance", sprintId: "sprint-auth-8",
    blockedBy: [], blocking: [],
  },
];

const activeSprint = authSprints[0];

export const authBoard: Board = {
  id: "board-auth",
  name: "Enterprise Auth Platform",
  description: "OAuth2 + RBAC system for enterprise SSO integration",
  columns: buildColumns(authTasks.filter((t) => t.sprintId === activeSprint.id)),
  agents: [agents.athena, agents.blueprint, agents.forge, agents.sentinel, agents.oracle],
  sprint: activeSprint,
  createdAt: dateOffset(-7),
  projectId: PROJECT_ID,
};

export const authProject: Project = {
  id: PROJECT_ID,
  key: KEY,
  name: "Enterprise Auth Platform",
  description: "OAuth2, RBAC, and enterprise SSO integration",
  color: "#8b5cf6",
  icon: "Shield",
  boards: [authBoard],
  themes: authThemes,
  epics: authEpics,
  sprints: authSprints,
  agents: [agents.athena, agents.blueprint, agents.forge, agents.sentinel, agents.oracle],
  members: [users.sarah, users.marcus, users.jordan, users.alex, users.elena],
  milestones: authMilestones,
};

import type { Project, Task, Theme, Epic, Sprint, Board } from "@/lib/types";
import { users } from "../users";
import { agents } from "../agents";
import { taskKey, buildColumns, dateOffset } from "../helpers";
import { paymentMilestones } from "../milestones";

// ============================================================================
// PAY — Payment Processing Platform
// Stripe, PCI compliance, reconciliation (9 stories)
// ============================================================================

const PROJECT_ID = "proj-payment";
const KEY = "PAY";

export const paymentThemes: Theme[] = [
  { id: "theme-pay-gateway", projectId: PROJECT_ID, name: "Payment Gateway", description: "Stripe integration and payment flow management", color: "#6366f1" },
  { id: "theme-pay-compliance", projectId: PROJECT_ID, name: "PCI Compliance", description: "PCI DSS Level 1 compliance and security controls", color: "#ef4444" },
  { id: "theme-pay-reconcile", projectId: PROJECT_ID, name: "Reconciliation", description: "Automated ledger reconciliation and reporting", color: "#10b981" },
];

export const paymentEpics: Epic[] = [
  { id: "epic-pay-stripe", projectId: PROJECT_ID, themeId: "theme-pay-gateway", name: "Stripe Integration v2", description: "Migrate to Stripe Payment Intents API with 3D Secure", status: "in_progress" },
  { id: "epic-pay-pci", projectId: PROJECT_ID, themeId: "theme-pay-compliance", name: "PCI DSS Audit", description: "Achieve PCI DSS Level 1 certification", status: "in_progress" },
  { id: "epic-pay-ledger", projectId: PROJECT_ID, themeId: "theme-pay-reconcile", name: "Automated Reconciliation", description: "Daily automated ledger reconciliation with exception handling", status: "open" },
];

export const paymentSprints: Sprint[] = [
  {
    id: "sprint-pay-5", name: "Sprint 5 — Stripe & PCI", startDate: "2026-03-31", endDate: "2026-04-14",
    goal: "Complete Stripe migration and pass PCI pre-audit",
    velocity: 26, completedPoints: 8, totalPoints: 26, projectId: PROJECT_ID, number: 5, status: "active",
  },
  {
    id: "sprint-pay-6", name: "Sprint 6 — Reconciliation", startDate: "2026-04-14", endDate: "2026-04-28",
    goal: "Deploy automated reconciliation and exception workflow",
    velocity: 0, completedPoints: 0, totalPoints: 21, projectId: PROJECT_ID, number: 6, status: "planning",
  },
];

export const paymentTasks: Task[] = [
  {
    id: "t-pay-1", key: taskKey(KEY, 501), title: "Migrate to Stripe Payment Intents API",
    description: "Replace legacy Charges API with Payment Intents for SCA/3D Secure compliance. Handle all payment states.",
    status: "in_progress", priority: "critical", issueType: "story", assignee: users.marcus, agent: agents.forge,
    labels: ["stripe", "migration"], storyPoints: 8, createdAt: dateOffset(-4), updatedAt: dateOffset(0),
    subtasks: [
      { id: "st-py1", title: "Payment Intent creation flow", completed: true },
      { id: "st-py2", title: "3D Secure challenge handling", completed: true },
      { id: "st-py3", title: "Webhook event processing", completed: false },
      { id: "st-py4", title: "Refund and dispute handling", completed: false },
    ],
    approvalGate: "human_required", executionLog: [], completionPercent: 50,
    projectId: PROJECT_ID, epicId: "epic-pay-stripe", themeId: "theme-pay-gateway", sprintId: "sprint-pay-5",
    blockedBy: [], blocking: ["t-pay-3"],
  },
  {
    id: "t-pay-2", key: taskKey(KEY, 502), title: "PCI DSS network segmentation",
    description: "Implement network segmentation for cardholder data environment. Configure firewall rules and access controls.",
    status: "done", priority: "critical", issueType: "task", assignee: users.jordan, agent: agents.cipher,
    labels: ["pci", "network"], storyPoints: 5, createdAt: dateOffset(-5), updatedAt: dateOffset(-2),
    subtasks: [
      { id: "st-py5", title: "Network topology design", completed: true },
      { id: "st-py6", title: "Firewall rule implementation", completed: true },
      { id: "st-py7", title: "Penetration test", completed: true },
    ],
    approvalGate: "human_required", executionLog: [], completionPercent: 100,
    projectId: PROJECT_ID, epicId: "epic-pay-pci", themeId: "theme-pay-compliance", sprintId: "sprint-pay-5",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-pay-3", key: taskKey(KEY, 503), title: "Stripe webhook idempotency",
    description: "Ensure all Stripe webhook handlers are idempotent. Implement event deduplication and ordering guarantees.",
    status: "todo", priority: "high", issueType: "story", assignee: users.marcus, agent: null,
    labels: ["stripe", "resilience"], storyPoints: 3, createdAt: dateOffset(-3), updatedAt: dateOffset(-3),
    subtasks: [], approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-pay-stripe", themeId: "theme-pay-gateway", sprintId: "sprint-pay-5",
    blockedBy: ["t-pay-1"], blocking: [],
  },
  {
    id: "t-pay-4", key: taskKey(KEY, 504), title: "Tokenisation for stored cards",
    description: "Implement Stripe Customer/PaymentMethod tokenisation for repeat customers. Never store raw card data.",
    status: "in_review", priority: "high", issueType: "story", assignee: users.jordan, agent: agents.cipher,
    labels: ["security", "tokenisation"], storyPoints: 3, createdAt: dateOffset(-3), updatedAt: dateOffset(0),
    subtasks: [
      { id: "st-py8", title: "Customer token creation", completed: true },
      { id: "st-py9", title: "Stored payment method UI", completed: true },
    ],
    approvalGate: "human_required", executionLog: agents.cipher.actions, completionPercent: 90,
    projectId: PROJECT_ID, epicId: "epic-pay-stripe", themeId: "theme-pay-gateway", sprintId: "sprint-pay-5",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-pay-5", key: taskKey(KEY, 505), title: "PCI audit log compliance",
    description: "Implement tamper-evident audit logging for all payment operations meeting PCI DSS Requirement 10.",
    status: "todo", priority: "high", issueType: "task", assignee: users.jordan, agent: null,
    labels: ["pci", "audit"], storyPoints: 3, createdAt: dateOffset(-2), updatedAt: dateOffset(-2),
    subtasks: [], approvalGate: "human_required", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-pay-pci", themeId: "theme-pay-compliance", sprintId: "sprint-pay-5",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-pay-6", key: taskKey(KEY, 506), title: "Fix decimal precision in currency conversion",
    description: "Currency conversion loses precision with floating-point arithmetic. Migrate to integer cents with BigInt.",
    status: "todo", priority: "critical", issueType: "bug", assignee: users.marcus, agent: null,
    labels: ["bug", "currency"], storyPoints: 2, createdAt: dateOffset(-1), updatedAt: dateOffset(-1),
    subtasks: [], approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-pay-stripe", themeId: "theme-pay-gateway", sprintId: "sprint-pay-5",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-pay-7", key: taskKey(KEY, 507), title: "Automated daily reconciliation",
    description: "Build nightly job that reconciles Stripe settlements against internal ledger, flags discrepancies.",
    status: "backlog", priority: "high", issueType: "story", assignee: users.kai, agent: null,
    labels: ["reconciliation", "automation"], storyPoints: 5, createdAt: dateOffset(-1), updatedAt: dateOffset(-1),
    subtasks: [], approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-pay-ledger", themeId: "theme-pay-reconcile", sprintId: "sprint-pay-6",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-pay-8", key: taskKey(KEY, 508), title: "Payment analytics dashboard",
    description: "Real-time dashboard showing transaction volume, success rates, average order value, and fraud indicators.",
    status: "backlog", priority: "medium", issueType: "story", assignee: users.elena, agent: null,
    labels: ["analytics", "frontend"], storyPoints: 5, createdAt: dateOffset(0), updatedAt: dateOffset(0),
    subtasks: [], approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-pay-ledger", themeId: "theme-pay-reconcile", sprintId: "sprint-pay-6",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-pay-9", key: taskKey(KEY, 509), title: "Subscription billing engine",
    description: "Implement recurring billing with Stripe Subscriptions. Handle upgrades, downgrades, proration, and cancellation.",
    status: "backlog", priority: "medium", issueType: "story", assignee: null, agent: null,
    labels: ["billing", "stripe"], storyPoints: 8, createdAt: dateOffset(0), updatedAt: dateOffset(0),
    subtasks: [], approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-pay-stripe", themeId: "theme-pay-gateway", sprintId: "sprint-pay-6",
    blockedBy: [], blocking: [],
  },
];

const activeSprint = paymentSprints[0];

export const paymentBoard: Board = {
  id: "board-payment",
  name: "Payment Processing Platform",
  description: "Stripe integration, PCI compliance, and financial reconciliation",
  columns: buildColumns(paymentTasks.filter((t) => t.sprintId === activeSprint.id)),
  agents: [agents.forge, agents.cipher],
  sprint: activeSprint,
  createdAt: dateOffset(-14),
  projectId: PROJECT_ID,
};

export const paymentProject: Project = {
  id: PROJECT_ID,
  key: KEY,
  name: "Payment Processing Platform",
  description: "Stripe integration with PCI DSS compliance",
  color: "#6366f1",
  icon: "CreditCard",
  boards: [paymentBoard],
  themes: paymentThemes,
  epics: paymentEpics,
  sprints: paymentSprints,
  agents: [agents.forge, agents.cipher],
  members: [users.marcus, users.jordan, users.kai, users.elena],
  milestones: paymentMilestones,
};

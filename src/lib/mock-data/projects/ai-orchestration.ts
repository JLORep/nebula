import type { Project, Task, Theme, Epic, Sprint, Board } from "@/lib/types";
import { users } from "../users";
import { agents } from "../agents";
import { taskKey, buildColumns, dateOffset } from "../helpers";
import { agentMilestones } from "../milestones";

// ============================================================================
// AGEN — AI Agent Orchestration
// Agent runtime, orchestration, safety (13 stories)
// ============================================================================

const PROJECT_ID = "proj-agent";
const KEY = "AGEN";

export const agentThemes: Theme[] = [
  { id: "theme-agen-runtime", projectId: PROJECT_ID, name: "Agent Runtime", description: "Core execution engine and task scheduling", color: "#8b5cf6" },
  { id: "theme-agen-safety", projectId: PROJECT_ID, name: "Safety & Guardrails", description: "Sandboxing, rate limiting, and approval gates", color: "#ef4444" },
  { id: "theme-agen-observe", projectId: PROJECT_ID, name: "Observability", description: "Agent monitoring, tracing, and cost tracking", color: "#06b6d4" },
];

export const agentEpics: Epic[] = [
  { id: "epic-agen-executor", projectId: PROJECT_ID, themeId: "theme-agen-runtime", name: "Task Executor Engine", description: "Stateful task execution with retry and rollback", status: "in_progress" },
  { id: "epic-agen-planning", projectId: PROJECT_ID, themeId: "theme-agen-runtime", name: "Planning & Decomposition", description: "Automatic task breakdown and dependency resolution", status: "in_progress" },
  { id: "epic-agen-sandbox", projectId: PROJECT_ID, themeId: "theme-agen-safety", name: "Sandbox Environment", description: "Isolated execution with resource limits", status: "in_progress" },
  { id: "epic-agen-approval", projectId: PROJECT_ID, themeId: "theme-agen-safety", name: "Approval Workflow", description: "Human-in-the-loop approval gates", status: "open" },
  { id: "epic-agen-trace", projectId: PROJECT_ID, themeId: "theme-agen-observe", name: "Distributed Tracing", description: "OpenTelemetry tracing for agent actions", status: "open" },
];

export const agentSprints: Sprint[] = [
  {
    id: "sprint-agen-3", name: "Sprint 3 — Executor & Sandbox", startDate: "2026-03-31", endDate: "2026-04-14",
    goal: "Ship MVP task executor with sandboxed code execution",
    velocity: 32, completedPoints: 11, totalPoints: 32, projectId: PROJECT_ID, number: 3, status: "active",
  },
  {
    id: "sprint-agen-4", name: "Sprint 4 — Approval & Tracing", startDate: "2026-04-14", endDate: "2026-04-28",
    goal: "Implement approval workflow and distributed tracing",
    velocity: 0, completedPoints: 0, totalPoints: 28, projectId: PROJECT_ID, number: 4, status: "planning",
  },
];

export const agentTasks: Task[] = [
  {
    id: "t-agen-1", key: taskKey(KEY, 401), title: "Design agent state machine",
    description: "Define formal state machine for agent lifecycle: idle -> planning -> executing -> review -> complete/failed with transition guards.",
    status: "done", priority: "critical", issueType: "spike", assignee: users.sarah, agent: agents.athena,
    labels: ["architecture", "design"], storyPoints: 3, createdAt: dateOffset(-5), updatedAt: dateOffset(-3),
    subtasks: [
      { id: "st-a1", title: "State diagram and transitions", completed: true },
      { id: "st-a2", title: "Guard conditions spec", completed: true },
      { id: "st-a3", title: "Error state handling", completed: true },
    ],
    approvalGate: "human_required", executionLog: [], completionPercent: 100,
    projectId: PROJECT_ID, epicId: "epic-agen-executor", themeId: "theme-agen-runtime", sprintId: "sprint-agen-3",
    blockedBy: [], blocking: ["t-agen-2"],
  },
  {
    id: "t-agen-2", key: taskKey(KEY, 402), title: "Implement task executor core",
    description: "Build the core task execution engine with state machine, retry logic (exponential backoff), and rollback on failure.",
    status: "in_progress", priority: "critical", issueType: "story", assignee: users.marcus, agent: agents.forge,
    labels: ["core", "executor"], storyPoints: 8, createdAt: dateOffset(-4), updatedAt: dateOffset(0),
    subtasks: [
      { id: "st-a4", title: "State machine implementation", completed: true },
      { id: "st-a5", title: "Retry with exponential backoff", completed: true },
      { id: "st-a6", title: "Rollback mechanism", completed: false },
      { id: "st-a7", title: "Event emission on transitions", completed: false },
    ],
    approvalGate: "team_review", executionLog: agents.forge.actions, completionPercent: 55,
    projectId: PROJECT_ID, epicId: "epic-agen-executor", themeId: "theme-agen-runtime", sprintId: "sprint-agen-3",
    blockedBy: ["t-agen-1"], blocking: ["t-agen-5", "t-agen-6"],
  },
  {
    id: "t-agen-3", key: taskKey(KEY, 403), title: "Build Docker-based sandbox",
    description: "Isolated execution environment using Docker containers with resource limits (CPU, memory, network, disk).",
    status: "in_progress", priority: "critical", issueType: "story", assignee: users.alex, agent: agents.nexus,
    labels: ["sandbox", "security"], storyPoints: 8, createdAt: dateOffset(-4), updatedAt: dateOffset(0),
    subtasks: [
      { id: "st-a8", title: "Container template with resource limits", completed: true },
      { id: "st-a9", title: "Network isolation rules", completed: true },
      { id: "st-a10", title: "File system sandboxing", completed: false },
      { id: "st-a11", title: "Cleanup and lifecycle management", completed: false },
    ],
    approvalGate: "human_required", executionLog: [], completionPercent: 50,
    projectId: PROJECT_ID, epicId: "epic-agen-sandbox", themeId: "theme-agen-safety", sprintId: "sprint-agen-3",
    blockedBy: [], blocking: ["t-agen-4"],
  },
  {
    id: "t-agen-4", key: taskKey(KEY, 404), title: "Sandbox escape prevention audit",
    description: "Security audit of sandbox implementation. Test for container escapes, privilege escalation, and resource exhaustion.",
    status: "todo", priority: "critical", issueType: "task", assignee: users.jordan, agent: agents.cipher,
    labels: ["security", "audit"], storyPoints: 3, createdAt: dateOffset(-3), updatedAt: dateOffset(-3),
    subtasks: [], approvalGate: "human_required", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-agen-sandbox", themeId: "theme-agen-safety", sprintId: "sprint-agen-3",
    blockedBy: ["t-agen-3"], blocking: [],
  },
  {
    id: "t-agen-5", key: taskKey(KEY, 405), title: "Task decomposition algorithm",
    description: "AI-powered automatic breakdown of complex tasks into executable subtasks with dependency graph.",
    status: "todo", priority: "high", issueType: "story", assignee: users.nadia, agent: null,
    labels: ["ai", "planning"], storyPoints: 5, createdAt: dateOffset(-2), updatedAt: dateOffset(-2),
    subtasks: [], approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-agen-planning", themeId: "theme-agen-runtime", sprintId: "sprint-agen-3",
    blockedBy: ["t-agen-2"], blocking: [],
  },
  {
    id: "t-agen-6", key: taskKey(KEY, 406), title: "Agent rate limiting middleware",
    description: "Token bucket rate limiter for AI API calls with per-agent and per-project quotas.",
    status: "todo", priority: "high", issueType: "story", assignee: users.ryan, agent: null,
    labels: ["safety", "middleware"], storyPoints: 3, createdAt: dateOffset(-2), updatedAt: dateOffset(-2),
    subtasks: [], approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-agen-sandbox", themeId: "theme-agen-safety", sprintId: "sprint-agen-3",
    blockedBy: ["t-agen-2"], blocking: [],
  },
  {
    id: "t-agen-7", key: taskKey(KEY, 407), title: "Fix agent memory leak in long-running tasks",
    description: "Agents accumulate action history in memory without pruning. Implement sliding window with persistence.",
    status: "in_review", priority: "high", issueType: "bug", assignee: users.marcus, agent: agents.oracle,
    labels: ["bug", "memory"], storyPoints: 2, createdAt: dateOffset(-2), updatedAt: dateOffset(0),
    subtasks: [
      { id: "st-a12", title: "Profile memory usage", completed: true },
      { id: "st-a13", title: "Implement sliding window", completed: true },
    ],
    approvalGate: "auto", executionLog: [], completionPercent: 90,
    projectId: PROJECT_ID, epicId: "epic-agen-executor", themeId: "theme-agen-runtime", sprintId: "sprint-agen-3",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-agen-8", key: taskKey(KEY, 408), title: "Human approval gate UI",
    description: "Build approval request interface with context display, diff viewer, approve/reject with comments.",
    status: "backlog", priority: "high", issueType: "story", assignee: users.elena, agent: null,
    labels: ["frontend", "approval"], storyPoints: 5, createdAt: dateOffset(-1), updatedAt: dateOffset(-1),
    subtasks: [], approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-agen-approval", themeId: "theme-agen-safety", sprintId: "sprint-agen-4",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-agen-9", key: taskKey(KEY, 409), title: "OpenTelemetry tracing integration",
    description: "Instrument agent actions with OpenTelemetry spans. Export to Jaeger for distributed trace visualization.",
    status: "backlog", priority: "medium", issueType: "story", assignee: users.alex, agent: null,
    labels: ["observability", "tracing"], storyPoints: 5, createdAt: dateOffset(-1), updatedAt: dateOffset(-1),
    subtasks: [], approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-agen-trace", themeId: "theme-agen-observe", sprintId: "sprint-agen-4",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-agen-10", key: taskKey(KEY, 410), title: "Cost tracking and budget alerts",
    description: "Real-time token usage tracking per agent/project with configurable budget thresholds and Slack alerts.",
    status: "backlog", priority: "medium", issueType: "story", assignee: users.nadia, agent: null,
    labels: ["cost", "monitoring"], storyPoints: 3, createdAt: dateOffset(0), updatedAt: dateOffset(0),
    subtasks: [], approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-agen-trace", themeId: "theme-agen-observe", sprintId: "sprint-agen-4",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-agen-11", key: taskKey(KEY, 411), title: "Multi-model routing engine",
    description: "Route tasks to appropriate AI models based on complexity, cost, and latency requirements.",
    status: "backlog", priority: "medium", issueType: "story", assignee: null, agent: null,
    labels: ["ai", "routing"], storyPoints: 5, createdAt: dateOffset(0), updatedAt: dateOffset(0),
    subtasks: [], approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-agen-executor", themeId: "theme-agen-runtime", sprintId: "sprint-agen-4",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-agen-12", key: taskKey(KEY, 412), title: "Agent collaboration protocol",
    description: "Enable agents to delegate subtasks to other agents with message passing and shared context.",
    status: "backlog", priority: "low", issueType: "spike", assignee: users.sarah, agent: null,
    labels: ["research", "collaboration"], storyPoints: 3, createdAt: dateOffset(0), updatedAt: dateOffset(0),
    subtasks: [], approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-agen-planning", themeId: "theme-agen-runtime", sprintId: "sprint-agen-4",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-agen-13", key: taskKey(KEY, 413), title: "Prompt injection detection",
    description: "Build input sanitization layer that detects and blocks prompt injection attempts before they reach agents.",
    status: "backlog", priority: "critical", issueType: "story", assignee: users.jordan, agent: null,
    labels: ["security", "ai"], storyPoints: 5, createdAt: dateOffset(0), updatedAt: dateOffset(0),
    subtasks: [], approvalGate: "human_required", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-agen-sandbox", themeId: "theme-agen-safety", sprintId: "sprint-agen-4",
    blockedBy: [], blocking: [],
  },
];

const activeSprint = agentSprints[0];

export const agentBoard: Board = {
  id: "board-agent",
  name: "AI Agent Orchestration",
  description: "Agent runtime, orchestration engine, and safety guardrails",
  columns: buildColumns(agentTasks.filter((t) => t.sprintId === activeSprint.id)),
  agents: [agents.athena, agents.forge, agents.oracle, agents.nexus, agents.cipher],
  sprint: activeSprint,
  createdAt: dateOffset(-14),
  projectId: PROJECT_ID,
};

export const agentProject: Project = {
  id: PROJECT_ID,
  key: KEY,
  name: "AI Agent Orchestration",
  description: "Agent runtime, safety guardrails, and observability",
  color: "#a855f7",
  icon: "Bot",
  boards: [agentBoard],
  themes: agentThemes,
  epics: agentEpics,
  sprints: agentSprints,
  agents: [agents.athena, agents.forge, agents.oracle, agents.nexus, agents.cipher],
  members: [users.sarah, users.marcus, users.jordan, users.alex, users.nadia, users.ryan, users.elena],
  milestones: agentMilestones,
};

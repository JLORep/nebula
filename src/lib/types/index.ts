// ============================================================================
// FLOW — Core Type Definitions
// Every type here is production-grade. Mock data uses these same types.
// ============================================================================

export type AgentStatus = "idle" | "thinking" | "executing" | "awaiting_approval" | "completed" | "failed";
export type TaskPriority = "critical" | "high" | "medium" | "low";
export type TaskStatus = "backlog" | "todo" | "in_progress" | "in_review" | "done";
export type AgentRole = "planner" | "architect" | "developer" | "tester" | "reviewer" | "deployer";
export type ApprovalGate = "auto" | "human_required" | "team_review";
export type IssueType = "story" | "bug" | "spike" | "task";
export type SprintStatus = "planning" | "active" | "completed";

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export interface AgentAction {
  id: string;
  timestamp: string;
  type: "plan" | "code" | "test" | "review" | "deploy" | "research" | "approval_request";
  description: string;
  status: AgentStatus;
  durationMs: number | null;
  output: string | null;
  requiresApproval: boolean;
  approvedBy: string | null;
}

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  avatar: string;
  model: string;
  currentAction: string | null;
  actions: AgentAction[];
  tokensUsed: number;
  costUsd: number;
}

export interface Task {
  id: string;
  key: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  issueType: IssueType;
  assignee: User | null;
  agent: Agent | null;
  labels: string[];
  storyPoints: number | null;
  createdAt: string;
  updatedAt: string;
  subtasks: Subtask[];
  approvalGate: ApprovalGate;
  executionLog: AgentAction[];
  completionPercent: number;
  projectId: string;
  epicId: string | null;
  themeId: string | null;
  sprintId: string | null;
  blockedBy: string[];
  blocking: string[];
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Column {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  limit: number | null;
}

export interface Board {
  id: string;
  name: string;
  description: string;
  columns: Column[];
  agents: Agent[];
  sprint: Sprint | null;
  createdAt: string;
  projectId: string;
}

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  goal: string;
  velocity: number;
  completedPoints: number;
  totalPoints: number;
  projectId: string;
  number: number;
  status: SprintStatus;
}

export interface Theme {
  id: string;
  projectId: string;
  name: string;
  description: string;
  color: string;
}

export interface Epic {
  id: string;
  projectId: string;
  themeId: string;
  name: string;
  description: string;
  status: "open" | "in_progress" | "done";
}

export interface Project {
  id: string;
  key: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  boards: Board[];
  themes: Theme[];
  epics: Epic[];
  sprints: Sprint[];
  agents: Agent[];
  members: User[];
  milestones: Milestone[];
}

export interface BoardMetrics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  agentsActive: number;
  avgCompletionTime: string;
  sprintProgress: number;
  totalCostUsd: number;
}

// ============================================================================
// Roadmap — Milestones, Coach Insights, Agile Glossary
// ============================================================================

export type MilestoneStatus = "upcoming" | "in_progress" | "achieved";

export interface Milestone {
  id: string;
  projectId: string;
  epicId: string;
  name: string;
  description: string;
  targetDate: string;
  status: MilestoneStatus;
  completionPercent: number;
}

export type CoachInsightSeverity = "info" | "success" | "warning" | "critical";

export interface CoachInsight {
  id: string;
  message: string;
  severity: CoachInsightSeverity;
  category: "velocity" | "blockers" | "scope" | "health" | "recommendation";
  actionable: boolean;
  action: string | null;
}

export interface AgileTerm {
  key: string;
  term: string;
  definition: string;
  example: string;
  tip: string;
}

// ============================================================================
// Flow Portal — Template categories for launching AI-powered workflows
// ============================================================================

export type FlowCategory =
  | "engineering"
  | "security"
  | "infrastructure"
  | "data"
  | "product"
  | "operations";

export interface FlowAgent {
  name: string;
  role: string;
  description: string;
}

export interface FlowTemplate {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: FlowCategory;
  icon: string;
  color: string;
  gradient: string;
  agents: FlowAgent[];
  tags: string[];
  estimatedSprints: number;
  complexity: "starter" | "standard" | "advanced" | "enterprise";
}

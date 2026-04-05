import type { Project, Task, Theme, Epic, Sprint, Board } from "@/lib/types";
import { users } from "../users";
import { agents } from "../agents";
import { taskKey, buildColumns, dateOffset } from "../helpers";
import { cloudMilestones } from "../milestones";

// ============================================================================
// CLOUD — Cloud Infrastructure Platform
// Kubernetes, Terraform, multi-cloud (9 stories)
// ============================================================================

const PROJECT_ID = "proj-cloud";
const KEY = "CLOUD";

export const cloudThemes: Theme[] = [
  { id: "theme-cloud-k8s", projectId: PROJECT_ID, name: "Kubernetes Platform", description: "EKS cluster management and service mesh", color: "#3b82f6" },
  { id: "theme-cloud-iac", projectId: PROJECT_ID, name: "Infrastructure as Code", description: "Terraform modules and GitOps workflows", color: "#8b5cf6" },
  { id: "theme-cloud-multi", projectId: PROJECT_ID, name: "Multi-Cloud Strategy", description: "Cross-cloud resilience and cost optimization", color: "#f59e0b" },
];

export const cloudEpics: Epic[] = [
  { id: "epic-cloud-eks", projectId: PROJECT_ID, themeId: "theme-cloud-k8s", name: "EKS Platform v2", description: "Upgrade to EKS 1.29 with Karpenter autoscaling", status: "in_progress" },
  { id: "epic-cloud-terraform", projectId: PROJECT_ID, themeId: "theme-cloud-iac", name: "Terraform Module Library", description: "Reusable Terraform modules for all infrastructure", status: "in_progress" },
  { id: "epic-cloud-mesh", projectId: PROJECT_ID, themeId: "theme-cloud-k8s", name: "Service Mesh", description: "Istio service mesh for traffic management and observability", status: "open" },
  { id: "epic-cloud-dr", projectId: PROJECT_ID, themeId: "theme-cloud-multi", name: "Disaster Recovery", description: "Cross-region failover with RTO < 15min", status: "open" },
];

export const cloudSprints: Sprint[] = [
  {
    id: "sprint-cloud-8", name: "Sprint 8 — EKS & Terraform", startDate: "2026-03-31", endDate: "2026-04-14",
    goal: "Complete EKS upgrade and ship core Terraform modules",
    velocity: 24, completedPoints: 5, totalPoints: 24, projectId: PROJECT_ID, number: 8, status: "active",
  },
  {
    id: "sprint-cloud-9", name: "Sprint 9 — Mesh & DR", startDate: "2026-04-14", endDate: "2026-04-28",
    goal: "Deploy Istio service mesh and implement DR failover",
    velocity: 0, completedPoints: 0, totalPoints: 22, projectId: PROJECT_ID, number: 9, status: "planning",
  },
];

export const cloudTasks: Task[] = [
  {
    id: "t-cloud-1", key: taskKey(KEY, 601), title: "Upgrade EKS cluster to 1.29",
    description: "Rolling upgrade of EKS cluster with zero-downtime migration. Update node groups, add-ons, and API compatibility.",
    status: "done", priority: "critical", issueType: "story", assignee: users.alex, agent: agents.nexus,
    labels: ["eks", "upgrade"], storyPoints: 5, createdAt: dateOffset(-5), updatedAt: dateOffset(-2),
    subtasks: [
      { id: "st-c1", title: "Control plane upgrade", completed: true },
      { id: "st-c2", title: "Node group rolling update", completed: true },
      { id: "st-c3", title: "Add-on compatibility check", completed: true },
    ],
    approvalGate: "human_required", executionLog: [], completionPercent: 100,
    projectId: PROJECT_ID, epicId: "epic-cloud-eks", themeId: "theme-cloud-k8s", sprintId: "sprint-cloud-8",
    blockedBy: [], blocking: ["t-cloud-2"],
  },
  {
    id: "t-cloud-2", key: taskKey(KEY, 602), title: "Implement Karpenter autoscaling",
    description: "Replace Cluster Autoscaler with Karpenter for faster, more efficient node provisioning. Configure NodePools and resource limits.",
    status: "in_progress", priority: "high", issueType: "story", assignee: users.alex, agent: agents.nexus,
    labels: ["eks", "autoscaling"], storyPoints: 5, createdAt: dateOffset(-3), updatedAt: dateOffset(0),
    subtasks: [
      { id: "st-c4", title: "Karpenter deployment", completed: true },
      { id: "st-c5", title: "NodePool configuration", completed: false },
      { id: "st-c6", title: "Spot instance integration", completed: false },
    ],
    approvalGate: "auto", executionLog: [], completionPercent: 35,
    projectId: PROJECT_ID, epicId: "epic-cloud-eks", themeId: "theme-cloud-k8s", sprintId: "sprint-cloud-8",
    blockedBy: ["t-cloud-1"], blocking: [],
  },
  {
    id: "t-cloud-3", key: taskKey(KEY, 603), title: "Terraform module: VPC & networking",
    description: "Reusable Terraform module for VPC, subnets, NAT gateways, and VPC peering with multi-AZ support.",
    status: "in_review", priority: "high", issueType: "story", assignee: users.ryan, agent: agents.atlas,
    labels: ["terraform", "networking"], storyPoints: 3, createdAt: dateOffset(-4), updatedAt: dateOffset(0),
    subtasks: [
      { id: "st-c7", title: "VPC module with variables", completed: true },
      { id: "st-c8", title: "Subnet calculation logic", completed: true },
      { id: "st-c9", title: "Documentation and examples", completed: true },
    ],
    approvalGate: "team_review", executionLog: [], completionPercent: 95,
    projectId: PROJECT_ID, epicId: "epic-cloud-terraform", themeId: "theme-cloud-iac", sprintId: "sprint-cloud-8",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-cloud-4", key: taskKey(KEY, 604), title: "Terraform module: EKS cluster",
    description: "Terraform module wrapping EKS cluster creation with IRSA, OIDC provider, and managed node groups.",
    status: "in_progress", priority: "high", issueType: "story", assignee: users.ryan, agent: null,
    labels: ["terraform", "eks"], storyPoints: 5, createdAt: dateOffset(-3), updatedAt: dateOffset(-1),
    subtasks: [
      { id: "st-c10", title: "Cluster module structure", completed: true },
      { id: "st-c11", title: "IRSA configuration", completed: false },
      { id: "st-c12", title: "Node group templates", completed: false },
    ],
    approvalGate: "team_review", executionLog: [], completionPercent: 40,
    projectId: PROJECT_ID, epicId: "epic-cloud-terraform", themeId: "theme-cloud-iac", sprintId: "sprint-cloud-8",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-cloud-5", key: taskKey(KEY, 605), title: "Fix PodDisruptionBudget blocking deployments",
    description: "Misconfigured PDBs preventing rolling deployments during low replica counts. Update min-available settings.",
    status: "todo", priority: "high", issueType: "bug", assignee: users.alex, agent: null,
    labels: ["bug", "k8s"], storyPoints: 2, createdAt: dateOffset(-2), updatedAt: dateOffset(-2),
    subtasks: [], approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-cloud-eks", themeId: "theme-cloud-k8s", sprintId: "sprint-cloud-8",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-cloud-6", key: taskKey(KEY, 606), title: "GitOps workflow with ArgoCD",
    description: "Deploy ArgoCD for GitOps-based continuous delivery. Configure app-of-apps pattern and sync policies.",
    status: "todo", priority: "medium", issueType: "story", assignee: users.alex, agent: null,
    labels: ["gitops", "argocd"], storyPoints: 5, createdAt: dateOffset(-2), updatedAt: dateOffset(-2),
    subtasks: [], approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-cloud-terraform", themeId: "theme-cloud-iac", sprintId: "sprint-cloud-8",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-cloud-7", key: taskKey(KEY, 607), title: "Istio service mesh deployment",
    description: "Install Istio with sidecar injection, mTLS, and traffic management policies.",
    status: "backlog", priority: "high", issueType: "story", assignee: users.ryan, agent: null,
    labels: ["istio", "mesh"], storyPoints: 5, createdAt: dateOffset(-1), updatedAt: dateOffset(-1),
    subtasks: [], approvalGate: "human_required", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-cloud-mesh", themeId: "theme-cloud-k8s", sprintId: "sprint-cloud-9",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-cloud-8", key: taskKey(KEY, 608), title: "Cross-region DR failover automation",
    description: "Automated failover to us-west-2 with Route 53 health checks, RDS read replica promotion, and EKS scaling.",
    status: "backlog", priority: "critical", issueType: "story", assignee: users.alex, agent: null,
    labels: ["dr", "automation"], storyPoints: 8, createdAt: dateOffset(0), updatedAt: dateOffset(0),
    subtasks: [], approvalGate: "human_required", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-cloud-dr", themeId: "theme-cloud-multi", sprintId: "sprint-cloud-9",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-cloud-9", key: taskKey(KEY, 609), title: "Cloud cost optimization report",
    description: "Automated weekly report identifying underutilized resources, RI recommendations, and spot instance opportunities.",
    status: "backlog", priority: "medium", issueType: "task", assignee: users.ryan, agent: null,
    labels: ["cost", "reporting"], storyPoints: 3, createdAt: dateOffset(0), updatedAt: dateOffset(0),
    subtasks: [], approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-cloud-dr", themeId: "theme-cloud-multi", sprintId: "sprint-cloud-9",
    blockedBy: [], blocking: [],
  },
];

const activeSprint = cloudSprints[0];

export const cloudBoard: Board = {
  id: "board-cloud",
  name: "Cloud Infrastructure Platform",
  description: "Kubernetes, Terraform, and multi-cloud infrastructure",
  columns: buildColumns(cloudTasks.filter((t) => t.sprintId === activeSprint.id)),
  agents: [agents.nexus, agents.atlas],
  sprint: activeSprint,
  createdAt: dateOffset(-21),
  projectId: PROJECT_ID,
};

export const cloudProject: Project = {
  id: PROJECT_ID,
  key: KEY,
  name: "Cloud Infrastructure Platform",
  description: "Kubernetes, Terraform, and multi-cloud resilience",
  color: "#3b82f6",
  icon: "Cloud",
  boards: [cloudBoard],
  themes: cloudThemes,
  epics: cloudEpics,
  sprints: cloudSprints,
  agents: [agents.nexus, agents.atlas],
  members: [users.alex, users.ryan],
  milestones: cloudMilestones,
};

import type { Project, Task, Theme, Epic, Sprint, Board } from "@/lib/types";
import { users } from "../users";
import { agents } from "../agents";
import { taskKey, buildColumns, dateOffset } from "../helpers";
import { portalMilestones } from "../milestones";

// ============================================================================
// PORT — Customer Portal Redesign
// UI overhaul, accessibility, responsive (11 stories)
// ============================================================================

const PROJECT_ID = "proj-portal";
const KEY = "PORT";

export const portalThemes: Theme[] = [
  { id: "theme-port-design", projectId: PROJECT_ID, name: "Design System", description: "Component library and design token standardization", color: "#ec4899" },
  { id: "theme-port-a11y", projectId: PROJECT_ID, name: "Accessibility", description: "WCAG 2.2 AA compliance across all portal pages", color: "#10b981" },
  { id: "theme-port-perf", projectId: PROJECT_ID, name: "Performance", description: "Core Web Vitals optimization and bundle reduction", color: "#f59e0b" },
];

export const portalEpics: Epic[] = [
  { id: "epic-port-components", projectId: PROJECT_ID, themeId: "theme-port-design", name: "Component Library v2", description: "Rebuild core components with accessibility-first approach", status: "in_progress" },
  { id: "epic-port-responsive", projectId: PROJECT_ID, themeId: "theme-port-design", name: "Responsive Overhaul", description: "Mobile-first redesign of all portal pages", status: "in_progress" },
  { id: "epic-port-wcag", projectId: PROJECT_ID, themeId: "theme-port-a11y", name: "WCAG 2.2 AA Audit", description: "Full accessibility audit and remediation", status: "in_progress" },
  { id: "epic-port-vitals", projectId: PROJECT_ID, themeId: "theme-port-perf", name: "Core Web Vitals", description: "LCP < 2.5s, FID < 100ms, CLS < 0.1", status: "open" },
];

export const portalSprints: Sprint[] = [
  {
    id: "sprint-port-6", name: "Sprint 6 — Components & A11y", startDate: "2026-03-31", endDate: "2026-04-14",
    goal: "Ship redesigned component library and pass WCAG audit on dashboard",
    velocity: 30, completedPoints: 10, totalPoints: 30, projectId: PROJECT_ID, number: 6, status: "active",
  },
  {
    id: "sprint-port-7", name: "Sprint 7 — Performance", startDate: "2026-04-14", endDate: "2026-04-28",
    goal: "Hit Core Web Vitals targets on all top-20 pages",
    velocity: 0, completedPoints: 0, totalPoints: 26, projectId: PROJECT_ID, number: 7, status: "planning",
  },
];

export const portalTasks: Task[] = [
  {
    id: "t-port-1", key: taskKey(KEY, 301), title: "Rebuild Button component with ARIA",
    description: "Rewrite Button component with full ARIA support, keyboard navigation, loading states, and variant system.",
    status: "done", priority: "high", issueType: "story", assignee: users.elena, agent: agents.atlas,
    labels: ["component", "a11y"], storyPoints: 3, createdAt: dateOffset(-4), updatedAt: dateOffset(-2),
    subtasks: [
      { id: "st-p1", title: "Button variants (primary, secondary, ghost, danger)", completed: true },
      { id: "st-p2", title: "ARIA attributes and focus ring", completed: true },
      { id: "st-p3", title: "Loading and disabled states", completed: true },
    ],
    approvalGate: "auto", executionLog: [], completionPercent: 100,
    projectId: PROJECT_ID, epicId: "epic-port-components", themeId: "theme-port-design", sprintId: "sprint-port-6",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-port-2", key: taskKey(KEY, 302), title: "Rebuild Modal & Dialog system",
    description: "Accessible modal with focus trap, escape key handling, backdrop click, and scroll lock.",
    status: "done", priority: "high", issueType: "story", assignee: users.elena, agent: agents.atlas,
    labels: ["component", "a11y"], storyPoints: 5, createdAt: dateOffset(-4), updatedAt: dateOffset(-1),
    subtasks: [
      { id: "st-p4", title: "Focus trap implementation", completed: true },
      { id: "st-p5", title: "Keyboard navigation (Esc, Tab)", completed: true },
      { id: "st-p6", title: "Scroll lock and backdrop", completed: true },
    ],
    approvalGate: "auto", executionLog: [], completionPercent: 100,
    projectId: PROJECT_ID, epicId: "epic-port-components", themeId: "theme-port-design", sprintId: "sprint-port-6",
    blockedBy: [], blocking: ["t-port-5"],
  },
  {
    id: "t-port-3", key: taskKey(KEY, 303), title: "WCAG audit — Dashboard page",
    description: "Run axe-core and manual audit on dashboard. Fix all Level A and AA violations.",
    status: "in_progress", priority: "critical", issueType: "task", assignee: users.olivia, agent: agents.prism,
    labels: ["a11y", "audit"], storyPoints: 5, createdAt: dateOffset(-3), updatedAt: dateOffset(0),
    subtasks: [
      { id: "st-p7", title: "Automated axe-core scan", completed: true },
      { id: "st-p8", title: "Color contrast fixes", completed: true },
      { id: "st-p9", title: "Screen reader testing", completed: false },
      { id: "st-p10", title: "Keyboard navigation audit", completed: false },
    ],
    approvalGate: "human_required", executionLog: agents.prism.actions, completionPercent: 55,
    projectId: PROJECT_ID, epicId: "epic-port-wcag", themeId: "theme-port-a11y", sprintId: "sprint-port-6",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-port-4", key: taskKey(KEY, 304), title: "Responsive navigation redesign",
    description: "Rebuild main navigation for mobile (hamburger menu, bottom nav) and tablet (collapsible sidebar).",
    status: "in_progress", priority: "high", issueType: "story", assignee: users.elena, agent: null,
    labels: ["responsive", "navigation"], storyPoints: 5, createdAt: dateOffset(-3), updatedAt: dateOffset(-1),
    subtasks: [
      { id: "st-p11", title: "Mobile hamburger menu", completed: true },
      { id: "st-p12", title: "Bottom tab navigation", completed: false },
      { id: "st-p13", title: "Tablet collapsible sidebar", completed: false },
    ],
    approvalGate: "auto", executionLog: [], completionPercent: 35,
    projectId: PROJECT_ID, epicId: "epic-port-responsive", themeId: "theme-port-design", sprintId: "sprint-port-6",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-port-5", key: taskKey(KEY, 305), title: "Build notification centre component",
    description: "Dropdown notification panel with read/unread states, grouping, and action buttons.",
    status: "todo", priority: "medium", issueType: "story", assignee: users.elena, agent: null,
    labels: ["component", "ux"], storyPoints: 3, createdAt: dateOffset(-2), updatedAt: dateOffset(-2),
    subtasks: [], approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-port-components", themeId: "theme-port-design", sprintId: "sprint-port-6",
    blockedBy: ["t-port-2"], blocking: [],
  },
  {
    id: "t-port-6", key: taskKey(KEY, 306), title: "Fix colour contrast on dark theme",
    description: "17 elements fail WCAG AA contrast ratio. Update colour tokens to meet 4.5:1 minimum.",
    status: "in_review", priority: "high", issueType: "bug", assignee: users.olivia, agent: agents.prism,
    labels: ["a11y", "bug"], storyPoints: 2, createdAt: dateOffset(-2), updatedAt: dateOffset(0),
    subtasks: [
      { id: "st-p14", title: "Audit failing elements", completed: true },
      { id: "st-p15", title: "Update colour tokens", completed: true },
    ],
    approvalGate: "auto", executionLog: [], completionPercent: 95,
    projectId: PROJECT_ID, epicId: "epic-port-wcag", themeId: "theme-port-a11y", sprintId: "sprint-port-6",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-port-7", key: taskKey(KEY, 307), title: "Data table component with sorting & filtering",
    description: "Accessible data table with column sorting, text filtering, pagination, and row selection.",
    status: "todo", priority: "medium", issueType: "story", assignee: null, agent: null,
    labels: ["component", "a11y"], storyPoints: 5, createdAt: dateOffset(-1), updatedAt: dateOffset(-1),
    subtasks: [], approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-port-components", themeId: "theme-port-design", sprintId: "sprint-port-6",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-port-8", key: taskKey(KEY, 308), title: "Bundle size reduction — code splitting",
    description: "Implement route-based code splitting and lazy loading. Target: 40% reduction in initial bundle.",
    status: "backlog", priority: "high", issueType: "story", assignee: users.ryan, agent: null,
    labels: ["performance", "bundle"], storyPoints: 5, createdAt: dateOffset(-1), updatedAt: dateOffset(-1),
    subtasks: [], approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-port-vitals", themeId: "theme-port-perf", sprintId: "sprint-port-7",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-port-9", key: taskKey(KEY, 309), title: "Image optimization pipeline",
    description: "Implement next/image optimization with WebP/AVIF, responsive srcset, and blur placeholders.",
    status: "backlog", priority: "medium", issueType: "story", assignee: users.ryan, agent: null,
    labels: ["performance", "images"], storyPoints: 3, createdAt: dateOffset(0), updatedAt: dateOffset(0),
    subtasks: [], approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-port-vitals", themeId: "theme-port-perf", sprintId: "sprint-port-7",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-port-10", key: taskKey(KEY, 310), title: "Form validation library upgrade",
    description: "Migrate from custom validation to react-hook-form + zod with accessible error messages.",
    status: "backlog", priority: "medium", issueType: "task", assignee: null, agent: null,
    labels: ["forms", "a11y"], storyPoints: 3, createdAt: dateOffset(0), updatedAt: dateOffset(0),
    subtasks: [], approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-port-components", themeId: "theme-port-design", sprintId: "sprint-port-7",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-port-11", key: taskKey(KEY, 311), title: "Skeleton loader system",
    description: "Replace spinner loading states with content-aware skeleton loaders across all portal pages.",
    status: "backlog", priority: "low", issueType: "story", assignee: users.elena, agent: null,
    labels: ["ux", "loading"], storyPoints: 2, createdAt: dateOffset(0), updatedAt: dateOffset(0),
    subtasks: [], approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-port-components", themeId: "theme-port-design", sprintId: "sprint-port-7",
    blockedBy: [], blocking: [],
  },
];

const activeSprint = portalSprints[0];

export const portalBoard: Board = {
  id: "board-portal",
  name: "Customer Portal Redesign",
  description: "Complete UI overhaul with accessibility compliance (WCAG 2.2 AA)",
  columns: buildColumns(portalTasks.filter((t) => t.sprintId === activeSprint.id)),
  agents: [agents.atlas, agents.prism],
  sprint: activeSprint,
  createdAt: dateOffset(-14),
  projectId: PROJECT_ID,
};

export const portalProject: Project = {
  id: PROJECT_ID,
  key: KEY,
  name: "Customer Portal Redesign",
  description: "UI overhaul with WCAG 2.2 AA compliance",
  color: "#ec4899",
  icon: "Layout",
  boards: [portalBoard],
  themes: portalThemes,
  epics: portalEpics,
  sprints: portalSprints,
  agents: [agents.atlas, agents.prism],
  members: [users.elena, users.olivia, users.ryan, users.priya],
  milestones: portalMilestones,
};

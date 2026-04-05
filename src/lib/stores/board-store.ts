"use client";

import { create } from "zustand";
import type { Board, Task, TaskStatus, Agent, AgentStatus, Project, IssueType, TaskPriority, ApprovalGate, User } from "@/lib/types";
import { mockBoard, mockBoards, mockProjects } from "@/lib/mock-data";
import { buildColumns } from "@/lib/mock-data/helpers";

// ============================================================================
// Board Store — THE source of truth for board state (River pattern)
// ============================================================================

interface CreateTaskInput {
  title: string;
  description: string;
  issueType: IssueType;
  priority: TaskPriority;
  status: TaskStatus;
  projectId: string;
  themeId: string | null;
  epicId: string | null;
  sprintId: string | null;
  assignee: User | null;
  storyPoints: number | null;
  approvalGate: ApprovalGate;
  labels: string[];
}

interface BoardState {
  // Data
  boards: Board[];
  activeBoard: Board | null;
  selectedTask: Task | null;
  agentPanelOpen: boolean;
  squadSidebarOpen: boolean;
  projects: Project[];
  activeProject: Project | null;
  newTaskModalOpen: boolean;

  // Filters
  activeSprintFilter: string | null;
  activeThemeFilter: string | null;
  activeEpicFilter: string | null;

  // Actions
  setActiveBoard: (boardId: string) => void;
  selectTask: (task: Task | null) => void;
  selectTaskById: (taskId: string) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  toggleAgentPanel: () => void;
  toggleSquadSidebar: () => void;
  updateAgentStatus: (agentId: string, status: AgentStatus, action?: string) => void;
  setActiveProject: (projectId: string) => void;
  setSprintFilter: (sprintId: string | null) => void;
  setThemeFilter: (themeId: string | null) => void;
  setEpicFilter: (epicId: string | null) => void;
  toggleNewTaskModal: () => void;
  createTask: (input: CreateTaskInput) => void;

  // Simulation actions
  advanceTask: (taskId: string) => { taskKey: string; title: string; newStatus: TaskStatus; pointsAdded: number } | null;
  updateTaskProgress: (taskId: string, increment: number) => { taskKey: string; title: string; newPercent: number; subtaskCompleted: string | null } | null;
  updateSprintPoints: (points: number) => void;
  addAgentTokens: (agentId: string, tokens: number, cost: number) => void;
}

let taskCounter = 900;

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: mockBoards,
  activeBoard: mockBoard,
  selectedTask: null,
  agentPanelOpen: false,
  squadSidebarOpen: false,
  projects: mockProjects,
  activeProject: mockProjects[0],
  newTaskModalOpen: false,
  activeSprintFilter: null,
  activeThemeFilter: null,
  activeEpicFilter: null,

  setActiveBoard: (boardId) => {
    const board = get().boards.find((b) => b.id === boardId) ?? null;
    set({ activeBoard: board, selectedTask: null });
  },

  selectTask: (task) => set({ selectedTask: task }),

  selectTaskById: (taskId) => {
    const { activeBoard } = get();
    if (!activeBoard) return;
    for (const col of activeBoard.columns) {
      const task = col.tasks.find((t) => t.id === taskId);
      if (task) { set({ selectedTask: task }); return; }
    }
  },

  moveTask: (taskId, newStatus) => {
    const { activeBoard } = get();
    if (!activeBoard) return;

    let movedTask: Task | null = null;

    const updatedColumns = activeBoard.columns.map((col) => ({
      ...col,
      tasks: col.tasks.filter((t) => {
        if (t.id === taskId) {
          movedTask = { ...t, status: newStatus, updatedAt: new Date().toISOString() };
          return false;
        }
        return true;
      }),
    }));

    if (movedTask) {
      const targetCol = updatedColumns.find((c) => c.id === newStatus);
      if (targetCol) {
        targetCol.tasks.push(movedTask);
      }
    }

    set({
      activeBoard: { ...activeBoard, columns: updatedColumns },
      selectedTask: movedTask ?? get().selectedTask,
    });
  },

  toggleAgentPanel: () => set((s) => ({ agentPanelOpen: !s.agentPanelOpen })),
  toggleSquadSidebar: () => set((s) => ({ squadSidebarOpen: !s.squadSidebarOpen })),

  updateAgentStatus: (agentId, status, action) => {
    const { activeBoard } = get();
    if (!activeBoard) return;

    const updatedAgents = activeBoard.agents.map((a) =>
      a.id === agentId ? { ...a, status, currentAction: action ?? a.currentAction } : a
    );

    set({ activeBoard: { ...activeBoard, agents: updatedAgents } });
  },

  setActiveProject: (projectId) => {
    const project = get().projects.find((p) => p.id === projectId) ?? null;
    if (!project) return;

    const board = project.boards[0] ?? null;
    set({
      activeProject: project,
      activeBoard: board,
      selectedTask: null,
      activeSprintFilter: null,
      activeThemeFilter: null,
      activeEpicFilter: null,
    });
  },

  setSprintFilter: (sprintId) => {
    const { activeProject } = get();
    if (!activeProject) return;

    set({ activeSprintFilter: sprintId });

    const board = activeProject.boards[0];
    if (!board) return;

    const projectAllTasks = getAllProjectTasks(activeProject);
    const filtered = sprintId
      ? projectAllTasks.filter((t) => t.sprintId === sprintId)
      : projectAllTasks.filter((t) => t.sprintId === (activeProject.sprints.find(s => s.status === "active")?.id ?? null));

    set({
      activeBoard: {
        ...board,
        columns: buildColumns(filtered),
        sprint: sprintId
          ? activeProject.sprints.find(s => s.id === sprintId) ?? board.sprint
          : board.sprint,
      },
    });
  },

  setThemeFilter: (themeId) => {
    set({ activeThemeFilter: themeId });
    rebuildFilteredBoard(get, set);
  },

  setEpicFilter: (epicId) => {
    set({ activeEpicFilter: epicId });
    rebuildFilteredBoard(get, set);
  },

  toggleNewTaskModal: () => set((s) => ({ newTaskModalOpen: !s.newTaskModalOpen })),

  // ── Simulation actions ───────────────────────────────────────────────────

  advanceTask: (taskId) => {
    const { activeBoard } = get();
    if (!activeBoard) return null;

    const statusOrder: TaskStatus[] = ["backlog", "todo", "in_progress", "in_review", "done"];

    // Find the task and its current column
    let foundTask: Task | null = null;
    for (const col of activeBoard.columns) {
      const t = col.tasks.find((task) => task.id === taskId);
      if (t) { foundTask = t; break; }
    }
    if (!foundTask) return null;

    const currentIdx = statusOrder.indexOf(foundTask.status);
    if (currentIdx === -1 || currentIdx >= statusOrder.length - 1) return null;

    const newStatus = statusOrder[currentIdx + 1];

    // Determine completion percent and subtask completion for this transition
    const percentMap: Record<TaskStatus, number> = {
      backlog: 0,
      todo: 5,
      in_progress: 15,
      in_review: 75,
      done: 100,
    };
    const newPercent = percentMap[newStatus];

    // Move the task
    const updatedColumns = activeBoard.columns.map((col) => ({
      ...col,
      tasks: col.tasks.filter((t) => t.id !== taskId),
    }));

    const updatedSubtasks = newStatus === "done"
      ? foundTask.subtasks.map((st) => ({ ...st, completed: true }))
      : foundTask.subtasks;

    const movedTask: Task = {
      ...foundTask,
      status: newStatus,
      completionPercent: newPercent,
      subtasks: updatedSubtasks,
      updatedAt: new Date().toISOString(),
    };

    const targetCol = updatedColumns.find((c) => c.id === newStatus);
    if (targetCol) targetCol.tasks.push(movedTask);

    // Sprint points if task moved to done
    let pointsAdded = 0;
    if (newStatus === "done" && foundTask.storyPoints) {
      pointsAdded = foundTask.storyPoints;
      if (activeBoard.sprint) {
        const newCompleted = Math.min(
          activeBoard.sprint.completedPoints + pointsAdded,
          activeBoard.sprint.totalPoints
        );
        set({
          activeBoard: {
            ...activeBoard,
            columns: updatedColumns,
            sprint: { ...activeBoard.sprint, completedPoints: newCompleted },
          },
        });
        return { taskKey: foundTask.key, title: foundTask.title, newStatus, pointsAdded };
      }
    }

    set({ activeBoard: { ...activeBoard, columns: updatedColumns } });
    return { taskKey: foundTask.key, title: foundTask.title, newStatus, pointsAdded };
  },

  updateTaskProgress: (taskId, increment) => {
    const { activeBoard } = get();
    if (!activeBoard) return null;

    let targetTask: Task | null = null;
    let targetColId: TaskStatus | null = null;

    for (const col of activeBoard.columns) {
      const t = col.tasks.find((task) => task.id === taskId);
      if (t) { targetTask = t; targetColId = col.id; break; }
    }
    if (!targetTask || !targetColId) return null;

    const newPercent = Math.min(targetTask.completionPercent + increment, 99);

    // Complete a subtask proportionally
    let subtaskCompleted: string | null = null;
    const incomplete = targetTask.subtasks.filter((st) => !st.completed);
    if (incomplete.length > 0) {
      const idx = Math.floor(Math.random() * incomplete.length);
      subtaskCompleted = incomplete[idx].title;
    }

    const updatedSubtasks = subtaskCompleted
      ? targetTask.subtasks.map((st) =>
          st.title === subtaskCompleted ? { ...st, completed: true } : st
        )
      : targetTask.subtasks;

    const updatedTask: Task = {
      ...targetTask,
      completionPercent: newPercent,
      subtasks: updatedSubtasks,
      updatedAt: new Date().toISOString(),
    };

    const updatedColumns = activeBoard.columns.map((col) => ({
      ...col,
      tasks: col.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
    }));

    set({ activeBoard: { ...activeBoard, columns: updatedColumns } });
    return { taskKey: targetTask.key, title: targetTask.title, newPercent, subtaskCompleted };
  },

  updateSprintPoints: (points) => {
    const { activeBoard } = get();
    if (!activeBoard?.sprint) return;

    const newCompleted = Math.min(
      activeBoard.sprint.completedPoints + points,
      activeBoard.sprint.totalPoints
    );

    set({
      activeBoard: {
        ...activeBoard,
        sprint: { ...activeBoard.sprint, completedPoints: newCompleted },
      },
    });
  },

  addAgentTokens: (agentId, tokens, cost) => {
    const { activeBoard } = get();
    if (!activeBoard) return;

    const updatedAgents = activeBoard.agents.map((a) =>
      a.id === agentId
        ? { ...a, tokensUsed: a.tokensUsed + tokens, costUsd: a.costUsd + cost }
        : a
    );

    set({ activeBoard: { ...activeBoard, agents: updatedAgents } });
  },

  createTask: (input) => {
    const { activeBoard, projects } = get();
    if (!activeBoard) return;

    const project = projects.find(p => p.id === input.projectId);
    if (!project) return;

    taskCounter++;
    const now = new Date().toISOString();
    const newTask: Task = {
      id: `t-new-${taskCounter}`,
      key: `${project.key}-${taskCounter}`,
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      issueType: input.issueType,
      assignee: input.assignee,
      agent: null,
      labels: input.labels,
      storyPoints: input.storyPoints,
      createdAt: now,
      updatedAt: now,
      subtasks: [],
      approvalGate: input.approvalGate,
      executionLog: [],
      completionPercent: 0,
      projectId: input.projectId,
      epicId: input.epicId,
      themeId: input.themeId,
      sprintId: input.sprintId,
      blockedBy: [],
      blocking: [],
    };

    // Add to the appropriate column
    const updatedColumns = activeBoard.columns.map((col) => {
      if (col.id === input.status) {
        return { ...col, tasks: [...col.tasks, newTask] };
      }
      return col;
    });

    set({
      activeBoard: { ...activeBoard, columns: updatedColumns },
    });
  },
}));

// ── Helpers ─────────────────────────────────────────────────────────────────

function getAllProjectTasks(project: Project): Task[] {
  return project.boards.flatMap((b) => b.columns.flatMap((c) => c.tasks));
}

function rebuildFilteredBoard(
  get: () => BoardState,
  set: (state: Partial<BoardState>) => void
) {
  const { activeProject, activeThemeFilter, activeEpicFilter, activeSprintFilter } = get();
  if (!activeProject) return;

  const board = activeProject.boards[0];
  if (!board) return;

  let tasks = getAllProjectTasks(activeProject);

  const sprintId = activeSprintFilter ?? activeProject.sprints.find(s => s.status === "active")?.id ?? null;
  if (sprintId) {
    tasks = tasks.filter((t) => t.sprintId === sprintId);
  }

  if (activeThemeFilter) {
    tasks = tasks.filter((t) => t.themeId === activeThemeFilter);
  }
  if (activeEpicFilter) {
    tasks = tasks.filter((t) => t.epicId === activeEpicFilter);
  }

  set({
    activeBoard: {
      ...board,
      columns: buildColumns(tasks),
    },
  });
}

"use client";

import { create } from "zustand";
import { useBoardStore } from "./board-store";
import { useAdvisorStore } from "./advisor-store";
import { useNebulaChatStore } from "./nebula-chat-store";
import { getActionMessage } from "@/lib/utils/simulation-messages";
import { generateTerminalOutput } from "@/lib/utils/terminal-messages";
import type { TerminalLine, TerminalLineType } from "@/lib/utils/terminal-messages";
import type { AgentStatus, TaskStatus } from "@/lib/types";

// ============================================================================
// Simulation Store — drives live mutations into board-store on a timer
// River pattern: simulation domain owns simulation state
// ============================================================================

// Re-export for consumers
export type { TerminalLine, TerminalLineType };

export interface SimEvent {
  id: string;
  timestamp: number;
  type: "task_moved" | "agent_status" | "subtask_done" | "task_completed" | "sprint_update" | "agent_assigned" | "token_update" | "approval_flow";
  icon: string;
  color: string;
  message: string;
  taskKey?: string;
}

interface SimulationState {
  running: boolean;
  events: SimEvent[];
  terminalLines: TerminalLine[];
  tickCount: number;

  start: () => void;
  stop: () => void;
  tick: () => void;
  terminalTick: () => void;
}

// Agent name → text color for nebula chat messages
const agentTextColorMap: Record<string, string> = {
  Athena: "text-cyan-400",
  Blueprint: "text-violet-400",
  Flow: "text-emerald-400",
  Sentinel: "text-blue-400",
  Oracle: "text-amber-400",
  Nexus: "text-teal-400",
  Cipher: "text-orange-400",
  Spark: "text-lime-400",
  Atlas: "text-indigo-400",
  Prism: "text-pink-400",
  Forge: "text-emerald-400",
};

const MAX_EVENTS = 30;
const MAX_TERMINAL_LINES = 50;

// Variable timing ranges (ms) — tuned to reduce re-render pressure
const MAIN_TICK_MIN = 6000;
const MAIN_TICK_MAX = 12000;
const TERM_TICK_MIN = 2500;
const TERM_TICK_MAX = 5000;

function randDelay(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min));
}

let mainTimeoutId: ReturnType<typeof setTimeout> | null = null;
let terminalTimeoutId: ReturnType<typeof setTimeout> | null = null;
let eventCounter = 0;
let terminalCounter = 0;

function scheduleMainTick() {
  mainTimeoutId = setTimeout(() => {
    const state = useSimulationStore.getState();
    if (!state.running) return;
    state.tick();
    scheduleMainTick();
  }, randDelay(MAIN_TICK_MIN, MAIN_TICK_MAX));
}

function scheduleTerminalTick() {
  terminalTimeoutId = setTimeout(() => {
    const state = useSimulationStore.getState();
    if (!state.running) return;
    state.terminalTick();
    scheduleTerminalTick();
  }, randDelay(TERM_TICK_MIN, TERM_TICK_MAX));
}

function makeEvent(
  type: SimEvent["type"],
  icon: string,
  color: string,
  message: string,
  taskKey?: string,
): SimEvent {
  eventCounter++;
  return {
    id: `sim-${eventCounter}-${Date.now()}`,
    timestamp: Date.now(),
    type,
    icon,
    color,
    message,
    taskKey,
  };
}

function makeTerminalLine(
  agentName: string,
  agentRole: string,
  type: TerminalLineType,
  content: string,
): TerminalLine {
  terminalCounter++;
  return {
    id: `term-${terminalCounter}-${Date.now()}`,
    timestamp: Date.now(),
    agentName,
    agentRole: agentRole as TerminalLine["agentRole"],
    type,
    content,
  };
}

// Weighted random picker
type ActionType = "advance" | "progress" | "agent_cycle" | "agent_assign" | "token_tick" | "approval";
const WEIGHTS: [ActionType, number][] = [
  ["advance", 30],
  ["progress", 25],
  ["agent_cycle", 20],
  ["agent_assign", 10],
  ["token_tick", 10],
  ["approval", 5],
];

function pickAction(): ActionType {
  const total = WEIGHTS.reduce((s, [, w]) => s + w, 0);
  let roll = Math.random() * total;
  for (const [action, weight] of WEIGHTS) {
    roll -= weight;
    if (roll <= 0) return action;
  }
  return "advance";
}

// Pending approval tracking (auto-resolve after 1-2 ticks)
const pendingApprovals = new Map<string, number>();

const statusLabels: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "To Do",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
};

export const useSimulationStore = create<SimulationState>((set, get) => ({
  running: false,
  events: [],
  terminalLines: [],
  tickCount: 0,

  start: () => {
    if (get().running) return;
    set({ running: true });
    scheduleMainTick();
    scheduleTerminalTick();
  },

  stop: () => {
    set({ running: false });
    if (mainTimeoutId) {
      clearTimeout(mainTimeoutId);
      mainTimeoutId = null;
    }
    if (terminalTimeoutId) {
      clearTimeout(terminalTimeoutId);
      terminalTimeoutId = null;
    }
  },

  // ── Terminal tick — fast cadence, generates rich log output ──────────────

  terminalTick: () => {
    const board = useBoardStore.getState();
    const activeBoard = board.activeBoard;
    if (!activeBoard) return;

    const agents = activeBoard.agents;
    const allTasks = activeBoard.columns.flatMap((c) => c.tasks);
    const nonDone = allTasks.filter((t) => t.status !== "done");

    const activeAgents = agents.filter(
      (a) => a.status === "executing" || a.status === "thinking",
    );

    if (activeAgents.length === 0) {
      // System idle message
      pushTerminalLine(set, get, makeTerminalLine(
        "system", "planner", "system",
        `Monitoring ${agents.length} agents · ${nonDone.length} tasks remaining · awaiting assignment`,
      ));
      return;
    }

    // Pick a random active agent and generate output for their role
    const agent = activeAgents[Math.floor(Math.random() * activeAgents.length)];
    const taskForContext = nonDone.length > 0
      ? nonDone[Math.floor(Math.random() * nonDone.length)]
      : null;
    const taskTitle = taskForContext?.title ?? "current task";

    const lines = generateTerminalOutput(agent.role, taskTitle);

    // Batch all lines into a single state update for perf
    const newLines = lines.map((l, i) => {
      const line = makeTerminalLine(agent.name, agent.role, l.type, l.content);
      if (i > 0) line.timestamp += 200;
      return line;
    });
    pushTerminalLines(set, get, newLines);
  },

  // ── Main tick — mutates board state ─────────────────────────────────────

  tick: () => {
    const board = useBoardStore.getState();
    const activeBoard = board.activeBoard;
    if (!activeBoard) return;

    const allTasks = activeBoard.columns.flatMap((c) => c.tasks);
    const nonDone = allTasks.filter((t) => t.status !== "done");
    const inProgress = allTasks.filter((t) => t.status === "in_progress" || t.status === "in_review");
    const agents = activeBoard.agents;

    // Auto-stop when all tasks done or sprint at 100%
    if (nonDone.length === 0) {
      pushTerminalLine(set, get, makeTerminalLine("system", "planner", "complete", "All tasks completed — sprint finished"));
      get().stop();
      return;
    }

    if (activeBoard.sprint) {
      const sprintPct = (activeBoard.sprint.completedPoints / activeBoard.sprint.totalPoints) * 100;
      if (sprintPct >= 100) {
        pushTerminalLine(set, get, makeTerminalLine("system", "planner", "complete", "Sprint target reached — 100% story points delivered"));
        get().stop();
        return;
      }
    }

    // Resolve pending approvals
    for (const [agentId, ticksLeft] of pendingApprovals.entries()) {
      if (ticksLeft <= 0) {
        board.updateAgentStatus(agentId, "idle", undefined);
        pendingApprovals.delete(agentId);
        pushEvent(set, get, makeEvent("approval_flow", "ShieldCheck", "var(--success)", "Approval granted — agent resumed"));
        const approvedAgent = agents.find((a) => a.id === agentId);
        if (approvedAgent) {
          pushTerminalLine(set, get, makeTerminalLine(approvedAgent.name, approvedAgent.role, "success", "Approval granted — resuming work"));
        }
      } else {
        pendingApprovals.set(agentId, ticksLeft - 1);
      }
    }

    const action = pickAction();
    const tickCount = get().tickCount + 1;
    set({ tickCount });

    // Push periodic advisor insights every ~5 ticks
    if (tickCount % 5 === 0 && activeBoard.sprint) {
      const pct = Math.round((activeBoard.sprint.completedPoints / activeBoard.sprint.totalPoints) * 100);
      const activeCount = agents.filter((a) => a.status === "executing" || a.status === "thinking").length;
      const idleCount = agents.filter((a) => a.status === "idle").length;
      const advisorInsights = [
        `Sprint progress at ${pct}% — ${activeBoard.sprint.completedPoints}/${activeBoard.sprint.totalPoints} points delivered.`,
        `${activeCount} agents active, ${idleCount} on standby. ${idleCount > 2 ? "Consider assigning idle agents to accelerate." : "Fleet operating at capacity."}`,
        `Throughput steady at ${(nonDone.length / Math.max(tickCount, 1) * 10).toFixed(1)} tasks/cycle. ${nonDone.length} tasks remaining.`,
      ];
      const insight = advisorInsights[Math.floor(Math.random() * advisorInsights.length)];
      useAdvisorStore.getState().pushMessage({
        type: tickCount % 10 === 0 ? "recommendation" : "insight",
        content: insight,
        action: null,
        taskKey: null,
      });
    }

    switch (action) {
      case "advance": {
        if (nonDone.length === 0) break;
        const task = nonDone[Math.floor(Math.random() * nonDone.length)];
        const result = board.advanceTask(task.id);
        if (result) {
          if (result.newStatus === "done") {
            const pointsMsg = result.pointsAdded > 0 ? ` — +${result.pointsAdded} pts` : "";
            pushEvent(set, get, makeEvent("task_completed", "CheckCircle2", "var(--success)", `Completed ${result.taskKey}: ${result.title}${pointsMsg}`, result.taskKey));
            pushTerminalLine(set, get, makeTerminalLine("system", "planner", "complete", `Completed ${result.taskKey}: ${result.title}${pointsMsg}`));
            useAdvisorStore.getState().pushMessage({
              type: "completion",
              content: `${result.taskKey} completed${result.pointsAdded > 0 ? ` — +${result.pointsAdded} story points delivered` : ""}. ${result.title}`,
              action: null,
              taskKey: result.taskKey,
            });
            // Push to nebula chat
            useNebulaChatStore.getState().pushMessage({
              sender: "system",
              content: `Completed ${result.taskKey}: ${result.title}${pointsMsg}`,
            });
          } else {
            pushEvent(set, get, makeEvent("task_moved", "ArrowRight", "var(--info)", `${result.taskKey} → ${statusLabels[result.newStatus]}`, result.taskKey));
          }

          const roleForStatus: Record<string, string> = {
            todo: "planner",
            in_progress: "developer",
            in_review: "reviewer",
          };
          const targetRole = roleForStatus[result.newStatus];
          if (targetRole) {
            const agent = agents.find((a) => a.role === targetRole && (a.status === "idle" || a.status === "completed"));
            if (agent) {
              board.updateAgentStatus(agent.id, "executing", getActionMessage(agent.role, result.title));
            }
          }
        }
        break;
      }

      case "progress": {
        if (inProgress.length === 0) break;
        const task = inProgress[Math.floor(Math.random() * inProgress.length)];
        const increment = 10 + Math.floor(Math.random() * 16);
        const result = board.updateTaskProgress(task.id, increment);
        if (result) {
          if (result.subtaskCompleted) {
            pushEvent(set, get, makeEvent("subtask_done", "ListChecks", "var(--accent)", `${result.taskKey}: completed "${result.subtaskCompleted}"`, result.taskKey));
          } else {
            pushEvent(set, get, makeEvent("subtask_done", "TrendingUp", "var(--accent)", `${result.taskKey} progress → ${result.newPercent}%`, result.taskKey));
          }
        }
        break;
      }

      case "agent_cycle": {
        if (agents.length === 0) break;
        const agent = agents[Math.floor(Math.random() * agents.length)];
        if (agent.status === "awaiting_approval") break;

        const cycle: Record<string, AgentStatus> = {
          idle: "thinking",
          thinking: "executing",
          executing: "completed",
          completed: "idle",
          failed: "idle",
        };

        const newStatus = cycle[agent.status] ?? "idle";
        const taskForMsg = nonDone.length > 0 ? nonDone[Math.floor(Math.random() * nonDone.length)] : null;
        const actionMsg = taskForMsg ? getActionMessage(agent.role, taskForMsg.title) : null;

        board.updateAgentStatus(agent.id, newStatus, newStatus === "idle" || newStatus === "completed" ? undefined : (actionMsg ?? undefined));

        // Push agent activity to nebula chat (~50% — only executing/thinking transitions)
        if ((newStatus === "executing" || newStatus === "thinking") && actionMsg) {
          useNebulaChatStore.getState().pushMessage({
            sender: "agent",
            agentName: agent.name,
            agentColor: agentTextColorMap[agent.name],
            content: actionMsg,
          });
        }

        const statusEmoji: Record<AgentStatus, string> = {
          idle: "Circle",
          thinking: "Brain",
          executing: "Zap",
          completed: "CheckCircle2",
          awaiting_approval: "ShieldAlert",
          failed: "XCircle",
        };

        pushEvent(set, get, makeEvent(
          "agent_status",
          statusEmoji[newStatus],
          newStatus === "executing" ? "var(--success)" : newStatus === "thinking" ? "var(--accent)" : "var(--foreground-muted)",
          `${agent.name} → ${newStatus}${actionMsg ? `: ${actionMsg}` : ""}`,
        ));
        break;
      }

      case "agent_assign": {
        const unassignedInProgress = inProgress.filter((t) => !t.agent);
        const idleAgents = agents.filter((a) => a.status === "idle" || a.status === "completed");
        if (unassignedInProgress.length === 0 || idleAgents.length === 0) break;

        const task = unassignedInProgress[Math.floor(Math.random() * unassignedInProgress.length)];
        const agent = idleAgents[Math.floor(Math.random() * idleAgents.length)];
        const msg = getActionMessage(agent.role, task.title);
        board.updateAgentStatus(agent.id, "executing", msg);

        pushEvent(set, get, makeEvent("agent_assigned", "UserPlus", "var(--info)", `${agent.name} assigned to ${task.key}`, task.key));
        pushTerminalLine(set, get, makeTerminalLine(agent.name, agent.role, "action", `Assigned to ${task.key}: ${task.title}`));
        break;
      }

      case "token_tick": {
        const activeAgents = agents.filter((a) => a.status === "executing" || a.status === "thinking");
        if (activeAgents.length === 0) break;

        const agent = activeAgents[Math.floor(Math.random() * activeAgents.length)];
        const tokens = 800 + Math.floor(Math.random() * 2200);
        const cost = tokens * 0.000015;
        board.addAgentTokens(agent.id, tokens, cost);

        pushEvent(set, get, makeEvent(
          "token_update",
          "Coins",
          "var(--warning)",
          `${agent.name}: +${(tokens / 1000).toFixed(1)}k tokens ($${cost.toFixed(3)})`,
        ));
        break;
      }

      case "approval": {
        const eligible = agents.filter((a) => a.status === "executing" && !pendingApprovals.has(a.id));
        if (eligible.length === 0) break;

        const agent = eligible[Math.floor(Math.random() * eligible.length)];
        board.updateAgentStatus(agent.id, "awaiting_approval", `Awaiting approval for ${agent.currentAction ?? "current action"}`);
        pendingApprovals.set(agent.id, 1 + Math.floor(Math.random() * 2));

        pushEvent(set, get, makeEvent("approval_flow", "ShieldAlert", "var(--warning)", `${agent.name} awaiting approval`));
        pushTerminalLine(set, get, makeTerminalLine(agent.name, agent.role, "approval", `Awaiting human approval — ${agent.currentAction ?? "action pending"}`));
        useAdvisorStore.getState().pushMessage({
          type: "alert",
          content: `${agent.name} requires human approval for: ${agent.currentAction ?? "current action"}. Review and approve to continue.`,
          action: "Review approval",
          taskKey: null,
        });
        // Push to nebula chat
        useNebulaChatStore.getState().pushMessage({
          sender: "agent",
          agentName: agent.name,
          agentColor: agentTextColorMap[agent.name],
          content: `Awaiting human approval \u2014 ${agent.currentAction ?? "action pending"}`,
        });
        break;
      }
    }
  },
}));

function pushEvent(
  set: (fn: (state: SimulationState) => Partial<SimulationState>) => void,
  get: () => SimulationState,
  event: SimEvent,
) {
  const events = get().events;
  const updated = [event, ...events].slice(0, MAX_EVENTS);
  set(() => ({ events: updated }));
}

function pushTerminalLine(
  set: (fn: (state: SimulationState) => Partial<SimulationState>) => void,
  get: () => SimulationState,
  line: TerminalLine,
) {
  const lines = get().terminalLines;
  const updated = [...lines, line].slice(-MAX_TERMINAL_LINES);
  set(() => ({ terminalLines: updated }));
}

function pushTerminalLines(
  set: (fn: (state: SimulationState) => Partial<SimulationState>) => void,
  get: () => SimulationState,
  newLines: TerminalLine[],
) {
  const lines = get().terminalLines;
  const updated = [...lines, ...newLines].slice(-MAX_TERMINAL_LINES);
  set(() => ({ terminalLines: updated }));
}

"use client";

import { memo, useState, useEffect, useRef, useMemo } from "react";
import { Bot, Shield, MoreHorizontal, CheckCircle2, Circle, Clock, Zap, Ban, Bug, Lightbulb, FileText, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Task, IssueType } from "@/lib/types";
import { useBoardStore } from "@/lib/stores/board-store";

const priorityConfig = {
  critical: {
    color: "bg-danger",
    glow: "shadow-[0_0_8px_rgba(248,113,113,0.3)]",
    label: "Critical",
    labelBg: "bg-danger/10 text-danger border-danger/20",
  },
  high: {
    color: "bg-warning",
    glow: "shadow-[0_0_8px_rgba(251,191,36,0.3)]",
    label: "High",
    labelBg: "bg-warning/10 text-warning border-warning/20",
  },
  medium: {
    color: "bg-info",
    glow: "shadow-[0_0_8px_rgba(96,165,250,0.2)]",
    label: "Medium",
    labelBg: "bg-info/10 text-info border-info/20",
  },
  low: {
    color: "bg-white/20",
    glow: "",
    label: "Low",
    labelBg: "bg-white/[0.04] text-white/30 border-white/[0.06]",
  },
} as const;

const issueTypeConfig: Record<IssueType, { icon: React.ElementType; color: string; bg: string }> = {
  story: { icon: Bookmark, color: "text-success", bg: "bg-success/10 border-success/20" },
  bug: { icon: Bug, color: "text-danger", bg: "bg-danger/10 border-danger/20" },
  spike: { icon: Lightbulb, color: "text-warning", bg: "bg-warning/10 border-warning/20" },
  task: { icon: FileText, color: "text-info", bg: "bg-info/10 border-info/20" },
};

const agentStatusConfig = {
  executing: { color: "text-success", bg: "bg-success/10 border-success/20", pulse: "bg-success" },
  thinking: { color: "text-accent", bg: "bg-accent/10 border-accent/20", pulse: "bg-accent" },
  awaiting_approval: { color: "text-warning", bg: "bg-warning/10 border-warning/20", pulse: null },
  completed: { color: "text-success/60", bg: "bg-success/5 border-success/10", pulse: null },
  failed: { color: "text-danger", bg: "bg-danger/10 border-danger/20", pulse: null },
  idle: { color: "text-white/30", bg: "bg-white/[0.03] border-white/[0.06]", pulse: null },
} as const;

export const TaskCard = memo(function TaskCard({ task }: { task: Task }) {
  const selectTask = useBoardStore((s) => s.selectTask);
  const selectedTaskId = useBoardStore((s) => s.selectedTask?.id ?? null);
  const activeProject = useBoardStore((s) => s.activeProject);
  const isSelected = selectedTaskId === task.id;

  const hasAgent = task.agent && (task.agent.status === "executing" || task.agent.status === "thinking");
  const completedSubtasks = useMemo(() => task.subtasks.filter((s) => s.completed).length, [task.subtasks]);
  const priority = priorityConfig[task.priority];
  const issueType = issueTypeConfig[task.issueType];
  const IssueIcon = issueType.icon;
  const isBlocked = task.blockedBy.length > 0;
  const epic = useMemo(() => activeProject?.epics.find(e => e.id === task.epicId), [activeProject?.epics, task.epicId]);

  // Track status changes for the "just moved" glow effect
  const prevStatusRef = useRef(task.status);
  const [justMoved, setJustMoved] = useState(false);

  useEffect(() => {
    if (prevStatusRef.current !== task.status) {
      prevStatusRef.current = task.status;
      setJustMoved(true);
      const timer = setTimeout(() => setJustMoved(false), 1800);
      return () => clearTimeout(timer);
    }
  }, [task.status]);

  return (
    <div
      onClick={() => selectTask(isSelected ? null : task)}
      className={cn(
        "group relative p-5 rounded-2xl cursor-pointer contain-paint",
        "bg-nebula/80 border",
        "transition-[background-color,border-color,box-shadow,transform,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "hover:-translate-y-1 hover:bg-cosmos/90 hover:border-white/[0.12] hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]",
        "active:scale-[0.98]",
        isSelected
          ? "border-accent/40 shadow-[0_0_30px_rgba(139,92,246,0.12)]"
          : "border-white/[0.06]",
        hasAgent && "border-accent/20",
        isBlocked && "opacity-75",
        justMoved && "ai-card-landed",
      )}
    >
      {/* AI agent cursor badge — appears when card just moved */}
      {justMoved && (
        <div className="absolute -top-2.5 -right-2.5 z-10 flex items-center gap-1 px-2 py-1 rounded-lg bg-accent/90 border border-accent/50 shadow-[0_4px_20px_rgba(139,92,246,0.4)] animate-[fadeSlideIn_0.3s_var(--ease-out-expo)_both]">
          <Bot className="w-3 h-3 text-white" />
          <span className="text-[9px] font-bold text-white tracking-wide">AI</span>
        </div>
      )}

      {/* Top edge highlight — CSS only */}
      <div className="absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Gradient border for active agent cards */}
      {hasAgent && <div className="absolute inset-0 rounded-2xl gradient-border pointer-events-none" />}

      {/* Priority bar */}
      <div className={cn(
        "absolute top-5 left-0 w-[3px] h-8 rounded-r-full",
        priority.color, priority.glow,
      )} />

      {/* Row 1: Key + Issue Type + Priority + Actions */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn("flex items-center justify-center w-5 h-5 rounded-md border", issueType.bg)}>
            <IssueIcon className={cn("w-3 h-3", issueType.color)} />
          </div>
          <span className="text-[11px] font-mono text-white/25 tracking-wider">{task.key}</span>
          <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-semibold border", priority.labelBg)}>
            {priority.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {isBlocked && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-danger/10 border border-danger/20">
              <Ban className="w-3 h-3 text-danger" />
            </div>
          )}
          {task.approvalGate === "human_required" && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-warning/10 border border-warning/20">
              <Shield className="w-3 h-3 text-warning" />
            </div>
          )}
          {task.storyPoints && (
            <span className="flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-lg bg-white/[0.04] border border-white/[0.04] text-[10px] font-bold text-white/30 font-mono">
              {task.storyPoints}
            </span>
          )}
          <button className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-white/[0.06] text-white/25 hover:text-white/50 transition-[color,background-color,opacity] duration-200">
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Epic breadcrumb */}
      {epic && (
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[10px] text-white/20 truncate">{epic.name}</span>
        </div>
      )}

      {/* Title */}
      <h4 className="text-[15px] font-semibold leading-[1.4] tracking-[-0.01em] text-white/90 mb-2">
        {task.title}
      </h4>

      {/* Description preview */}
      <p className="text-[12px] text-white/30 leading-[1.6] mb-4 line-clamp-2">
        {task.description}
      </p>

      {/* Labels */}
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {task.labels.map((label) => (
            <span
              key={label}
              className="px-2 py-0.5 rounded-md text-[10px] font-medium tracking-wide bg-white/[0.04] text-white/35 border border-white/[0.04]"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Subtask progress */}
      {task.subtasks.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-white/25 font-medium">Subtasks</span>
            <span className="text-[10px] font-mono text-white/25">
              {completedSubtasks}/{task.subtasks.length}
            </span>
          </div>
          <div className="w-full h-1 rounded-full bg-white/[0.04] overflow-hidden mb-2.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-cyan-400 transition-[width] duration-700 ease-out"
              style={{ width: `${(completedSubtasks / task.subtasks.length) * 100}%` }}
            />
          </div>
          <div className="space-y-1">
            {task.subtasks.slice(0, 3).map((sub) => (
              <div key={sub.id} className="flex items-center gap-2">
                {sub.completed ? (
                  <CheckCircle2 className="w-3 h-3 text-success/60 shrink-0" />
                ) : (
                  <Circle className="w-3 h-3 text-white/15 shrink-0" />
                )}
                <span className={cn(
                  "text-[11px] truncate",
                  sub.completed ? "line-through text-white/20" : "text-white/40"
                )}>
                  {sub.title}
                </span>
              </div>
            ))}
            {task.subtasks.length > 3 && (
              <span className="text-[10px] text-white/15 pl-5">
                +{task.subtasks.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Progress bar (when no subtasks) */}
      {task.completionPercent > 0 && task.completionPercent < 100 && task.subtasks.length === 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-white/25">Progress</span>
            <span className="text-[10px] font-mono text-white/25">{task.completionPercent}%</span>
          </div>
          <div className="w-full h-1 rounded-full bg-white/[0.04] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-cyan-400 transition-[width] duration-700 ease-out"
              style={{ width: `${task.completionPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Agent activity */}
      {task.agent && (task.agent.status === "executing" || task.agent.status === "thinking" || task.agent.status === "awaiting_approval") && (
        <div className={cn("p-3 rounded-xl border mb-4", agentStatusConfig[task.agent.status].bg)}>
          <div className="flex items-center gap-2 mb-1.5">
            {agentStatusConfig[task.agent.status].pulse ? (
              <span className={cn("inline-flex h-2 w-2 rounded-full shrink-0 animate-pulse-glow", agentStatusConfig[task.agent.status].pulse)} />
            ) : (
              <Zap className={cn("w-3 h-3 shrink-0", agentStatusConfig[task.agent.status].color)} />
            )}
            <span className={cn("text-[11px] font-semibold", agentStatusConfig[task.agent.status].color)}>
              {task.agent.name}
            </span>
            <span className="text-[10px] text-white/20">{task.agent.role}</span>
          </div>
          {task.agent.currentAction && (
            <p className="text-[11px] text-white/35 leading-relaxed font-mono truncate">
              {task.agent.currentAction}
            </p>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
        <div className="flex items-center gap-2">
          {task.assignee && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/[0.06] text-[9px] font-bold text-white/40 border border-white/[0.04]">
                {task.assignee.avatar}
              </div>
              <span className="text-[11px] text-white/30">{task.assignee.name.split(" ")[0]}</span>
            </div>
          )}
          {task.agent && !(task.agent.status === "executing" || task.agent.status === "thinking" || task.agent.status === "awaiting_approval") && (
            <div className={cn(
              "flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-medium border",
              agentStatusConfig[task.agent.status].bg,
              agentStatusConfig[task.agent.status].color,
            )}>
              <Bot className="w-3 h-3" />
              <span>{task.agent.name}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-white/15">
          <Clock className="w-3 h-3" />
          <span>{new Date(task.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
        </div>
      </div>
    </div>
  );
});

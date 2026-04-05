"use client";

import { motion } from "framer-motion";
import { X, Bot, Shield, CheckCircle2, Circle, Clock, ArrowRight, Ban, Bookmark, Bug, Lightbulb, FileText, Link2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Task, TaskStatus, IssueType } from "@/lib/types";
import { useBoardStore } from "@/lib/stores/board-store";
import { SPRING_GENTLE } from "@/lib/utils/motion";

const statusFlow: TaskStatus[] = ["backlog", "todo", "in_progress", "in_review", "done"];
const statusLabels: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "To Do",
  in_progress: "In Progress",
  in_review: "Review",
  done: "Done",
};

const issueTypeConfig: Record<IssueType, { icon: React.ElementType; label: string; color: string }> = {
  story: { icon: Bookmark, label: "Story", color: "text-success" },
  bug: { icon: Bug, label: "Bug", color: "text-danger" },
  spike: { icon: Lightbulb, label: "Spike", color: "text-warning" },
  task: { icon: FileText, label: "Task", color: "text-info" },
};

export function TaskDetailPanel({ task }: { task: Task }) {
  const { selectTask, moveTask, activeProject } = useBoardStore();
  const currentIdx = statusFlow.indexOf(task.status);

  const issueType = issueTypeConfig[task.issueType];
  const IssueIcon = issueType.icon;
  const epic = activeProject?.epics.find(e => e.id === task.epicId);
  const theme = activeProject?.themes.find(t => t.id === task.themeId);
  const sprint = activeProject?.sprints.find(s => s.id === task.sprintId);

  return (
    <>
    {/* Backdrop */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => selectTask(null)}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 gpu"
    />
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={SPRING_GENTLE}
      className="fixed top-0 right-0 bottom-0 w-full sm:w-[440px] z-50 overflow-y-auto
                 bg-modal/98 backdrop-blur-md border-l border-white/[0.08] gpu"
    >
      {/* Top edge highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent z-10" />

      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-lg border",
            task.issueType === "story" ? "bg-success/10 border-success/20" :
            task.issueType === "bug" ? "bg-danger/10 border-danger/20" :
            task.issueType === "spike" ? "bg-warning/10 border-warning/20" :
            "bg-info/10 border-info/20"
          )}>
            <IssueIcon className={cn("w-3 h-3", issueType.color)} />
            <span className={cn("text-[10px] font-medium", issueType.color)}>{issueType.label}</span>
          </div>
          <span className="text-[12px] font-mono text-white/25 tracking-wider">{task.key}</span>
          {task.approvalGate === "human_required" && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-warning-muted border border-warning/20 text-warning text-[10px] font-medium">
              <Shield className="w-3 h-3" /> Approval Required
            </span>
          )}
        </div>
        <button
          onClick={() => selectTask(null)}
          className="p-1.5 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/[0.06] hover:scale-110 active:scale-90 transition-[color,background-color,transform] duration-200 will-change-transform"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 space-y-6">
        {/* Title */}
        <h2 className="text-[20px] font-semibold leading-[1.3] tracking-[-0.02em] text-white/95">
          {task.title}
        </h2>

        {/* Epic / Theme breadcrumb */}
        {(theme || epic) && (
          <div className="flex items-center gap-2 flex-wrap">
            {theme && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.color }} />
                <span className="text-[11px] text-white/40">{theme.name}</span>
              </div>
            )}
            {epic && (
              <>
                {theme && <ArrowRight className="w-3 h-3 text-white/10" />}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                  <span className="text-[11px] text-white/40">{epic.name}</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Sprint info */}
        {sprint && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="relative flex h-1.5 w-1.5">
              <span className={cn(
                "absolute inline-flex h-full w-full rounded-full opacity-75",
                sprint.status === "active" ? "animate-ping-slow bg-success" : "bg-white/20"
              )} />
              <span className={cn(
                "relative inline-flex rounded-full h-1.5 w-1.5",
                sprint.status === "active" ? "bg-success" : "bg-white/20"
              )} />
            </span>
            <span className="text-[11px] text-white/40">{sprint.name}</span>
            <span className="text-[10px] font-mono text-white/20 ml-auto">
              {sprint.completedPoints}/{sprint.totalPoints} pts
            </span>
          </div>
        )}

        {/* Description */}
        <p className="text-[13px] text-white/45 leading-[1.7]">{task.description}</p>

        {/* Blocking relationships */}
        {(task.blockedBy.length > 0 || task.blocking.length > 0) && (
          <div className="space-y-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/20">Dependencies</span>
            {task.blockedBy.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-danger/5 border border-danger/10">
                <Ban className="w-3.5 h-3.5 text-danger/60 shrink-0" />
                <span className="text-[11px] text-danger/60">Blocked by</span>
                <div className="flex gap-1.5">
                  {task.blockedBy.map(id => (
                    <span key={id} className="px-2 py-0.5 rounded-md bg-danger/10 border border-danger/15 text-[10px] font-mono text-danger/50">
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {task.blocking.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-warning/5 border border-warning/10">
                <Link2 className="w-3.5 h-3.5 text-warning/60 shrink-0" />
                <span className="text-[11px] text-warning/60">Blocking</span>
                <div className="flex gap-1.5">
                  {task.blocking.map(id => (
                    <span key={id} className="px-2 py-0.5 rounded-md bg-warning/10 border border-warning/15 text-[10px] font-mono text-warning/50">
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status flow */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/20">Status</span>
          <div className="flex items-center gap-1">
            {statusFlow.map((status, idx) => (
              <div key={status} className="flex items-center gap-1">
                <button
                  onClick={() => moveTask(task.id, status)}
                  className={cn(
                    "px-2 py-1 rounded-lg text-[10px] font-medium border transition-[background-color,border-color,transform] duration-200 will-change-transform hover:scale-105 active:scale-95",
                    idx <= currentIdx
                      ? "bg-accent/10 text-accent border-accent/20"
                      : "bg-white/[0.02] text-white/25 border-white/[0.04] hover:bg-white/[0.04] hover:text-white/40"
                  )}
                >
                  {statusLabels[status]}
                </button>
                {idx < statusFlow.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-white/10" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Assignee & Agent */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/20">Assignee</span>
            {task.assignee ? (
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.06] text-[10px] font-bold text-white/40">
                  {task.assignee.avatar}
                </div>
                <span className="text-[13px] text-white/70">{task.assignee.name}</span>
              </div>
            ) : (
              <p className="text-[13px] text-white/20">Unassigned</p>
            )}
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/20">Agent</span>
            {task.agent ? (
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-accent/10 border border-accent/20">
                  <Bot className="w-4 h-4 text-accent" />
                </div>
                <span className="text-[13px] text-white/70">{task.agent.name}</span>
              </div>
            ) : (
              <p className="text-[13px] text-white/20">No agent</p>
            )}
          </div>
        </div>

        {/* Subtasks */}
        {task.subtasks.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/20">Subtasks</span>
              <span className="text-[11px] font-mono text-white/20">
                {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
              </span>
            </div>
            <div className="space-y-1">
              {task.subtasks.map((subtask, idx) => (
                <motion.div
                  key={subtask.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30, delay: idx * 0.05 }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/[0.03] transition-colors"
                >
                  {subtask.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-white/15 shrink-0" />
                  )}
                  <span className={cn(
                    "text-[13px]",
                    subtask.completed ? "line-through text-white/25" : "text-white/60"
                  )}>
                    {subtask.title}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Execution Log */}
        {task.executionLog.length > 0 && (
          <div className="space-y-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/20">Agent Activity</span>
            <div className="space-y-2.5">
              {task.executionLog.map((action, idx) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30, delay: idx * 0.08 }}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-white/60">{action.description}</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-lg text-[10px] font-medium border",
                      action.status === "completed" && "bg-success-muted text-success border-success/20",
                      action.status === "executing" && "bg-accent-muted text-accent border-accent/20",
                      action.status === "awaiting_approval" && "bg-warning-muted text-warning border-warning/20",
                      action.status === "failed" && "bg-danger-muted text-danger border-danger/20",
                    )}>
                      {action.status}
                    </span>
                  </div>
                  {action.output && (
                    <p className="text-[11px] text-white/30 font-mono leading-relaxed
                                  bg-white/[0.02] border border-white/[0.03] p-2.5 rounded-lg">
                      {action.output}
                    </p>
                  )}
                  {action.durationMs && (
                    <div className="flex items-center gap-1 text-[10px] text-white/20">
                      <Clock className="w-3 h-3" />
                      {(action.durationMs / 1000).toFixed(1)}s
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Labels */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/20">Labels</span>
          <div className="flex flex-wrap gap-2">
            {task.labels.map((label) => (
              <span key={label} className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.04] text-[11px] font-medium text-white/35">
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
    </>
  );
}

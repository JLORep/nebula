"use client";

import { motion } from "framer-motion";
import {
  X, Bot, Shield, CheckCircle2, Circle, Clock, ArrowRight,
  Ban, Bookmark, Bug, Lightbulb, FileText, Link2,
  Calendar, Tag, Zap, User, Target, Layers
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Task, TaskStatus, IssueType } from "@/lib/types";
import { useBoardStore } from "@/lib/stores/board-store";
import { SPRING } from "@/lib/utils/motion";

// ============================================================================
// TaskModal — Jira-style centered modal with two-column layout
// ============================================================================

const statusFlow: TaskStatus[] = ["backlog", "todo", "in_progress", "in_review", "done"];
const statusLabels: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "To Do",
  in_progress: "In Progress",
  in_review: "Review",
  done: "Done",
};

const statusColors: Record<TaskStatus, string> = {
  backlog: "bg-white/20",
  todo: "bg-info",
  in_progress: "bg-accent",
  in_review: "bg-warning",
  done: "bg-success",
};

const issueTypeConfig: Record<IssueType, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  story: { icon: Bookmark, label: "Story", color: "text-success", bg: "bg-success/10 border-success/20" },
  bug: { icon: Bug, label: "Bug", color: "text-danger", bg: "bg-danger/10 border-danger/20" },
  spike: { icon: Lightbulb, label: "Spike", color: "text-warning", bg: "bg-warning/10 border-warning/20" },
  task: { icon: FileText, label: "Task", color: "text-info", bg: "bg-info/10 border-info/20" },
};

const priorityConfig = {
  critical: { color: "text-danger", bg: "bg-danger/10 border-danger/20", dot: "bg-danger" },
  high: { color: "text-warning", bg: "bg-warning/10 border-warning/20", dot: "bg-warning" },
  medium: { color: "text-info", bg: "bg-info/10 border-info/20", dot: "bg-info" },
  low: { color: "text-white/40", bg: "bg-white/[0.04] border-white/[0.06]", dot: "bg-white/30" },
} as const;

const agentStatusConfig = {
  executing: { color: "text-success", bg: "bg-success/10 border-success/20", pulse: "bg-success" },
  thinking: { color: "text-accent", bg: "bg-accent/10 border-accent/20", pulse: "bg-accent" },
  awaiting_approval: { color: "text-warning", bg: "bg-warning/10 border-warning/20", pulse: null },
  completed: { color: "text-success/60", bg: "bg-success/5 border-success/10", pulse: null },
  failed: { color: "text-danger", bg: "bg-danger/10 border-danger/20", pulse: null },
  idle: { color: "text-white/30", bg: "bg-white/[0.03] border-white/[0.06]", pulse: null },
} as const;

function SidebarField({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className="w-4 h-4 text-white/15 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-medium uppercase tracking-[0.06em] text-white/25 mb-1">{label}</div>
        {children}
      </div>
    </div>
  );
}

export function TaskModal({ task }: { task: Task }) {
  const { selectTask, moveTask, activeProject } = useBoardStore();
  const currentIdx = statusFlow.indexOf(task.status);

  const issueType = issueTypeConfig[task.issueType];
  const IssueIcon = issueType.icon;
  const priority = priorityConfig[task.priority];
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 gpu"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={SPRING}
        className="fixed inset-4 sm:inset-8 md:inset-y-12 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-[960px] z-50 flex flex-col"
      >
        <div className="flex-1 flex flex-col rounded-2xl border border-white/[0.08] bg-modal/[0.99] backdrop-blur-md shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Top edge highlight */}
          <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent z-10" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg border shrink-0", issueType.bg)}>
                <IssueIcon className={cn("w-3.5 h-3.5", issueType.color)} />
                <span className={cn("text-[11px] font-semibold", issueType.color)}>{issueType.label}</span>
              </div>
              <span className="text-[13px] font-mono text-white/30 tracking-wider shrink-0">{task.key}</span>
              {task.approvalGate === "human_required" && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-warning/8 border border-warning/20 text-warning text-[11px] font-medium shrink-0">
                  <Shield className="w-3.5 h-3.5" /> Approval Required
                </span>
              )}
              {task.blockedBy.length > 0 && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-danger/8 border border-danger/20 text-danger/70 text-[11px] font-medium shrink-0">
                  <Ban className="w-3.5 h-3.5" /> Blocked
                </span>
              )}
            </div>
            <button
              onClick={() => selectTask(null)}
              className="p-2 rounded-xl text-white/25 hover:text-white/60 hover:bg-white/[0.06] hover:scale-110 active:scale-90 transition-[color,background-color,transform] duration-200 will-change-transform shrink-0 ml-4"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Two-column body */}
          <div className="flex-1 flex overflow-hidden">
            {/* ── Left: Main content ── */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 border-r border-white/[0.04]">
              {/* Title */}
              <h1 className="text-[22px] sm:text-[26px] font-bold leading-[1.25] tracking-[-0.025em] text-white/95">
                {task.title}
              </h1>

              {/* Description */}
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-white/20 mb-2">Description</h3>
                <p className="text-[14px] text-white/50 leading-[1.75]">{task.description}</p>
              </div>

              {/* Subtasks */}
              {task.subtasks.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-white/20">
                      Subtasks
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-accent to-cyan-400"
                          style={{ width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-white/25">
                        {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    {task.subtasks.map((subtask, idx) => (
                      <motion.div
                        key={subtask.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30, delay: idx * 0.04 }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.03] transition-colors group/sub"
                      >
                        {subtask.completed ? (
                          <CheckCircle2 className="w-[18px] h-[18px] text-success shrink-0" />
                        ) : (
                          <Circle className="w-[18px] h-[18px] text-white/15 group-hover/sub:text-white/25 shrink-0 transition-colors" />
                        )}
                        <span className={cn(
                          "text-[14px]",
                          subtask.completed ? "line-through text-white/25" : "text-white/65"
                        )}>
                          {subtask.title}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Agent Activity / Execution Log */}
              {(task.agent && (task.agent.status === "executing" || task.agent.status === "thinking" || task.agent.status === "awaiting_approval")) && (
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-white/20 mb-3">
                    Agent Activity
                  </h3>
                  <div className={cn("p-4 rounded-xl border", agentStatusConfig[task.agent.status].bg)}>
                    <div className="flex items-center gap-2.5 mb-2">
                      {agentStatusConfig[task.agent.status].pulse ? (
                        <span className={cn("inline-flex h-2.5 w-2.5 rounded-full shrink-0 animate-pulse-glow", agentStatusConfig[task.agent.status].pulse)} />
                      ) : (
                        <Zap className={cn("w-4 h-4 shrink-0", agentStatusConfig[task.agent.status].color)} />
                      )}
                      <span className={cn("text-[13px] font-semibold", agentStatusConfig[task.agent.status].color)}>
                        {task.agent.name}
                      </span>
                      <span className="text-[11px] text-white/25">{task.agent.role}</span>
                      <span className="text-[10px] font-mono text-white/15 ml-auto">{task.agent.model}</span>
                    </div>
                    {task.agent.currentAction && (
                      <p className="text-[12px] text-white/40 leading-relaxed font-mono pl-5">
                        {task.agent.currentAction}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Execution log entries */}
              {task.executionLog.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-white/20 mb-3">
                    Execution Log
                  </h3>
                  <div className="space-y-2.5">
                    {task.executionLog.map((action, idx) => (
                      <motion.div
                        key={action.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30, delay: idx * 0.06 }}
                        className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-medium text-white/60">{action.description}</span>
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-lg text-[10px] font-semibold border",
                            action.status === "completed" && "bg-success/10 text-success border-success/20",
                            action.status === "executing" && "bg-accent/10 text-accent border-accent/20",
                            action.status === "awaiting_approval" && "bg-warning/10 text-warning border-warning/20",
                            action.status === "failed" && "bg-danger/10 text-danger border-danger/20",
                          )}>
                            {action.status}
                          </span>
                        </div>
                        {action.output && (
                          <div className="text-[11px] text-white/30 font-mono leading-relaxed bg-white/[0.02] border border-white/[0.03] p-3 rounded-lg">
                            {action.output}
                          </div>
                        )}
                        {action.durationMs && (
                          <div className="flex items-center gap-1.5 text-[10px] text-white/20">
                            <Clock className="w-3 h-3" />
                            {(action.durationMs / 1000).toFixed(1)}s
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right: Sidebar ── */}
            <div className="w-[280px] sm:w-[300px] shrink-0 overflow-y-auto p-5 space-y-1 hidden sm:block">
              {/* Status */}
              <div className="mb-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-white/25 mb-2.5">Status</div>
                <div className="flex flex-wrap gap-1.5">
                  {statusFlow.map((status, idx) => (
                    <button
                      key={status}
                      onClick={() => moveTask(task.id, status)}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-[background-color,border-color,transform] duration-150 will-change-transform hover:scale-[1.04] active:scale-[0.96]",
                        idx <= currentIdx
                          ? "bg-accent/10 text-accent border-accent/25"
                          : "bg-white/[0.02] text-white/25 border-white/[0.04] hover:bg-white/[0.04] hover:text-white/40"
                      )}
                    >
                      <div className={cn("w-1.5 h-1.5 rounded-full", statusColors[status])} />
                      {statusLabels[status]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-white/[0.04] my-3" />

              {/* Details */}
              <SidebarField icon={Target} label="Priority">
                <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[12px] font-semibold", priority.bg)}>
                  <div className={cn("w-2 h-2 rounded-full", priority.dot)} />
                  <span className={priority.color}>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
                </div>
              </SidebarField>

              {sprint && (
                <SidebarField icon={Zap} label="Sprint">
                  <div className="flex items-center gap-2">
                    <span className={cn("inline-flex h-1.5 w-1.5 rounded-full", sprint.status === "active" ? "bg-success animate-pulse-glow" : "bg-white/20")} />
                    <span className="text-[12px] text-white/60">{sprint.name}</span>
                  </div>
                </SidebarField>
              )}

              {theme && (
                <SidebarField icon={Layers} label="Theme">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-md" style={{ backgroundColor: theme.color }} />
                    <span className="text-[12px] text-white/60">{theme.name}</span>
                  </div>
                </SidebarField>
              )}

              {epic && (
                <SidebarField icon={Target} label="Epic">
                  <span className="text-[12px] text-white/60">{epic.name}</span>
                </SidebarField>
              )}

              <SidebarField icon={User} label="Assignee">
                {task.assignee ? (
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.06] text-[10px] font-bold text-white/40">
                      {task.assignee.avatar}
                    </div>
                    <div>
                      <span className="text-[12px] text-white/70 block">{task.assignee.name}</span>
                      <span className="text-[10px] text-white/25">{task.assignee.role}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-[12px] text-white/20">Unassigned</span>
                )}
              </SidebarField>

              <SidebarField icon={Bot} label="Agent">
                {task.agent ? (
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-accent/10 border border-accent/20">
                      <Bot className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <span className="text-[12px] text-white/70 block">{task.agent.name}</span>
                      <span className="text-[10px] text-white/25">{task.agent.model}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-[12px] text-white/20">No agent</span>
                )}
              </SidebarField>

              {task.storyPoints && (
                <SidebarField icon={Zap} label="Story Points">
                  <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg bg-white/[0.04] border border-white/[0.04] text-[13px] font-bold text-white/50 font-mono">
                    {task.storyPoints}
                  </span>
                </SidebarField>
              )}

              {task.labels.length > 0 && (
                <SidebarField icon={Tag} label="Labels">
                  <div className="flex flex-wrap gap-1.5">
                    {task.labels.map((label) => (
                      <span key={label} className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.04] text-[11px] font-medium text-white/40">
                        {label}
                      </span>
                    ))}
                  </div>
                </SidebarField>
              )}

              <div className="h-px bg-white/[0.04] my-3" />

              {/* Dependencies */}
              {(task.blockedBy.length > 0 || task.blocking.length > 0) && (
                <>
                  <SidebarField icon={Ban} label="Dependencies">
                    <div className="space-y-2">
                      {task.blockedBy.length > 0 && (
                        <div>
                          <span className="text-[10px] text-danger/50 block mb-1">Blocked by</span>
                          <div className="flex flex-wrap gap-1.5">
                            {task.blockedBy.map(id => (
                              <span key={id} className="px-2 py-0.5 rounded-md bg-danger/8 border border-danger/15 text-[10px] font-mono text-danger/50">
                                {id}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {task.blocking.length > 0 && (
                        <div>
                          <span className="text-[10px] text-warning/50 block mb-1">Blocking</span>
                          <div className="flex flex-wrap gap-1.5">
                            {task.blocking.map(id => (
                              <span key={id} className="px-2 py-0.5 rounded-md bg-warning/8 border border-warning/15 text-[10px] font-mono text-warning/50">
                                {id}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </SidebarField>

                  <div className="h-px bg-white/[0.04] my-3" />
                </>
              )}

              {/* Dates */}
              <SidebarField icon={Calendar} label="Created">
                <span className="text-[12px] text-white/40 font-mono">
                  {new Date(task.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </SidebarField>
              <SidebarField icon={Clock} label="Updated">
                <span className="text-[12px] text-white/40 font-mono">
                  {new Date(task.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </SidebarField>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Target, Zap, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useBoardStore } from "@/lib/stores/board-store";
import type { Task, Epic } from "@/lib/types";

// ── Active epic card — shows the in-progress epic with live task breakdown ──

const EpicProgress = memo(function EpicProgress({
  epic,
  tasks,
  color,
}: {
  epic: Epic;
  tasks: Task[];
  color: string;
}) {
  const done = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress" || t.status === "in_review").length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const pointsDone = tasks.filter((t) => t.status === "done").reduce((s, t) => s + (t.storyPoints ?? 0), 0);
  const pointsTotal = tasks.reduce((s, t) => s + (t.storyPoints ?? 0), 0);

  // Active agent on this epic
  const activeAgent = tasks
    .map((t) => t.agent)
    .find((a) => a && (a.status === "executing" || a.status === "thinking"));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.6, type: "spring", stiffness: 200, damping: 25 }}
      className="relative w-full max-w-2xl rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm px-5 py-4 overflow-hidden"
    >
      {/* Accent top bar */}
      <div
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />

      {/* Row 1: Epic info + progress bar side-by-side */}
      <div className="flex items-center gap-4 mb-3">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg border shrink-0"
          style={{ backgroundColor: `${color}15`, borderColor: `${color}30` }}
        >
          <Target className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-white/25">EPIC</span>
            <div
              className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: `${color}15`, color }}
            >
              Active
            </div>
            <h3 className="text-[13px] font-semibold text-white/90 tracking-[-0.01em] truncate">{epic.name}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {inProgress > 0 && (
            <span className="flex items-center gap-1 text-[10px]" style={{ color }}>
              <Zap className="w-3 h-3" />
              {inProgress}
            </span>
          )}
          <span className="text-[10px] font-mono text-white/30">{pointsDone}/{pointsTotal} pts</span>
          <span className="text-[12px] font-bold font-mono" style={{ color }}>{pct}%</span>
        </div>
      </div>

      {/* Progress bar — full width, slim */}
      <div className="relative w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden mb-3">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}, ${color}cc, #06b6d4)`,
            boxShadow: `0 0 12px ${color}40`,
          }}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full opacity-30"
          style={{ width: `${pct}%` }}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
        </motion.div>
      </div>

      {/* Task rows — compact single-line */}
      <div className="space-y-0.5">
        {tasks.slice(0, 5).map((task) => {
          const isDone = task.status === "done";
          const isActive = task.status === "in_progress" || task.status === "in_review";
          const hasAgent = task.agent && (task.agent.status === "executing" || task.agent.status === "thinking");

          return (
            <div
              key={task.id}
              className={cn(
                "flex items-center gap-2 px-2 py-1 rounded-md transition-colors duration-300",
                isActive && "bg-white/[0.03]",
              )}
            >
              {isDone ? (
                <CheckCircle2 className="w-3 h-3 text-success/60 shrink-0" />
              ) : isActive ? (
                <span
                  className="inline-flex h-1.5 w-1.5 rounded-full shrink-0 animate-pulse-scale"
                  style={{ backgroundColor: color }}
                />
              ) : (
                <Circle className="w-3 h-3 text-white/10 shrink-0" />
              )}
              <span className="text-[9px] font-mono text-white/20 shrink-0">{task.key}</span>
              <span className={cn(
                "text-[11px] truncate flex-1 min-w-0",
                isDone ? "text-white/20 line-through" : isActive ? "text-white/65" : "text-white/30",
              )}>
                {task.title}
              </span>
              {hasAgent && (
                <span
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-semibold shrink-0 border"
                  style={{ backgroundColor: `${color}10`, borderColor: `${color}25`, color }}
                >
                  <Zap className="w-2.5 h-2.5" />
                  {task.agent?.name}
                </span>
              )}
              {isActive && task.completionPercent > 0 && (
                <div className="flex items-center gap-1 shrink-0">
                  <div className="w-10 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                      initial={false}
                      animate={{ width: `${task.completionPercent}%` }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-[8px] font-mono text-white/25">{task.completionPercent}%</span>
                </div>
              )}
            </div>
          );
        })}
        {tasks.length > 5 && (
          <span className="text-[9px] text-white/15 pl-2">+{tasks.length - 5} more</span>
        )}
      </div>

      {/* Agent footer — inline */}
      {activeAgent && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/[0.04]">
          <span
            className="inline-flex h-1.5 w-1.5 rounded-full shrink-0 animate-pulse-scale"
            style={{ backgroundColor: activeAgent.status === "executing" ? "var(--success)" : "var(--accent)" }}
          />
          <span className="text-[10px] font-semibold text-white/50">{activeAgent.name}</span>
          <span className="text-[9px] text-white/20">{activeAgent.role}</span>
          {activeAgent.currentAction && (
            <>
              <ArrowRight className="w-2.5 h-2.5 text-white/10 shrink-0" />
              <span className="text-[10px] text-white/25 truncate min-w-0">{activeAgent.currentAction}</span>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
});

// ── Main hero ───────────────────────────────────────────────────────────────

export function DashboardHero() {
  const activeProject = useBoardStore((s) => s.activeProject);
  const activeBoard = useBoardStore((s) => s.activeBoard);
  const sprint = activeBoard?.sprint;

  // Find the active epic (in_progress) and its tasks
  const activeEpic = activeProject?.epics.find((e) => e.status === "in_progress") ?? null;
  const allTasks = activeBoard?.columns.flatMap((c) => c.tasks) ?? [];
  const epicTasks = activeEpic
    ? allTasks.filter((t) => t.epicId === activeEpic.id)
    : [];

  // Active agent count for badge
  const activeAgentCount = (activeBoard?.agents ?? []).filter(
    (a) => a.status === "executing" || a.status === "thinking",
  ).length;

  // Sprint %
  const sprintPct = sprint
    ? Math.round((sprint.completedPoints / sprint.totalPoints) * 100)
    : 0;

  return (
    <div className="relative px-4 md:px-8 py-8 md:py-12">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6 max-w-4xl mx-auto">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-white/20 font-medium">
          Sprint Command
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      {/* Content */}
      <div className="flex flex-col items-center text-center max-w-4xl mx-auto w-full">
        {/* Sprint badge — live updating */}
        {sprint && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
            className="mb-4 md:mb-6"
          >
            <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/[0.08] bg-white/[0.03]">
              {activeProject && (
                <>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activeProject.color }} />
                  <span className="text-[11px] sm:text-[12px] font-mono text-white/40">{activeProject.key}</span>
                  <div className="w-px h-3 bg-white/10" />
                </>
              )}
              <span className="inline-flex h-2 w-2 rounded-full bg-success animate-pulse-glow" />
              <span className="text-[11px] sm:text-[12px] font-medium text-white/50">{sprint.name}</span>
              <div className="w-px h-3 bg-white/10" />
              <span className="text-[11px] sm:text-[12px] font-mono text-accent">
                {sprint.completedPoints}/{sprint.totalPoints} pts
              </span>
              <div className="w-px h-3 bg-white/10" />
              <span className="text-[11px] sm:text-[12px] font-mono font-bold" style={{ color: activeProject?.color }}>
                {sprintPct}%
              </span>
              {activeAgentCount > 0 && (
                <>
                  <div className="w-px h-3 bg-white/10" />
                  <span className="flex items-center gap-1 text-[11px] text-success/70">
                    <Zap className="w-3 h-3" />
                    {activeAgentCount}
                  </span>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Sprint progress bar */}
        {sprint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="max-w-md w-full mb-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] text-white/25 uppercase tracking-widest font-medium">Sprint Progress</span>
              <span className="text-[12px] sm:text-[13px] font-mono text-white/50">{sprintPct}%</span>
            </div>
            <div className="relative w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${activeProject?.color ?? "var(--accent)"}, #06b6d4)`,
                  boxShadow: `0 0 20px ${activeProject?.color ?? "var(--accent)"}50`,
                }}
                initial={false}
                animate={{ width: `${sprintPct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] sm:text-[11px] text-white/20">{sprint.startDate}</span>
              <span className="text-[10px] sm:text-[11px] text-white/20">{sprint.endDate}</span>
            </div>
          </motion.div>
        )}

        {/* Active Epic card */}
        {activeEpic && epicTasks.length > 0 && (
          <div className="w-full flex justify-center">
            <EpicProgress
              epic={activeEpic}
              tasks={epicTasks}
              color={activeProject?.color ?? "var(--accent)"}
            />
          </div>
        )}
      </div>
    </div>
  );
}

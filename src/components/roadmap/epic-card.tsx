"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Bot } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { SPRING } from "@/lib/utils/motion";
import { useRoadmapStore } from "@/lib/stores/roadmap-store";
import type { Epic, Task, Theme } from "@/lib/types";

interface EpicCardProps {
  epic: Epic;
  theme: Theme | undefined;
  tasks: Task[];
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-white/[0.06] text-white/40" },
  in_progress: { label: "Active", className: "bg-accent/10 text-accent" },
  done: { label: "Done", className: "bg-success/10 text-success" },
};

export const EpicCard = memo(function EpicCard({ epic, theme, tasks }: EpicCardProps) {
  const expanded = useRoadmapStore((s) => s.expandedEpicIds.includes(epic.id));
  const toggleEpic = useRoadmapStore((s) => s.toggleEpic);

  const epicTasks = tasks.filter((t) => t.epicId === epic.id);
  const doneTasks = epicTasks.filter((t) => t.status === "done").length;
  const totalPoints = epicTasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
  const donePoints = epicTasks.filter((t) => t.status === "done").reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
  const progress = epicTasks.length > 0 ? doneTasks / epicTasks.length : 0;
  const badge = STATUS_BADGE[epic.status];
  const themeColor = theme?.color ?? "#8b5cf6";

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.10] transition-[border-color] duration-200 overflow-hidden">
      {/* Collapsed header — always visible */}
      <button
        onClick={() => toggleEpic(epic.id)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left"
      >
        {/* Theme color dot */}
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: themeColor }} />

        {/* Name */}
        <span className="text-[12px] font-medium text-white/70 truncate flex-1">{epic.name}</span>

        {/* Status badge */}
        <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider shrink-0", badge.className)}>
          {badge.label}
        </span>

        {/* Task count */}
        <span className="text-[10px] font-mono text-white/25 shrink-0">{doneTasks}/{epicTasks.length}</span>

        {/* Mini progress bar */}
        <div className="w-12 h-1 rounded-full bg-white/[0.06] shrink-0 overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${progress * 100}%`, backgroundColor: themeColor }}
          />
        </div>

        {/* Chevron */}
        <ChevronRight className={cn(
          "w-3.5 h-3.5 text-white/20 transition-transform duration-200 shrink-0",
          expanded && "rotate-90"
        )} />
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={SPRING}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 border-t border-white/[0.04]">
              {/* Description */}
              <p className="text-[11px] text-white/35 leading-relaxed mt-2.5 mb-3">{epic.description}</p>

              {/* Points summary */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] text-white/25">
                  <span className="font-mono text-white/40">{donePoints}</span>/{totalPoints} pts
                </span>
                <div className="w-px h-3 bg-white/[0.06]" />
                <span className="text-[10px] text-white/25">{epicTasks.length} stories</span>
              </div>

              {/* Task list */}
              <div className="space-y-1.5">
                {epicTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.02]">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      task.status === "done" ? "bg-success" :
                      task.status === "in_progress" ? "bg-accent" :
                      task.status === "in_review" ? "bg-warning" : "bg-white/20"
                    )} />
                    <span className={cn(
                      "text-[11px] truncate flex-1",
                      task.status === "done" ? "text-white/30 line-through" : "text-white/50"
                    )}>
                      {task.title}
                    </span>
                    {task.storyPoints && (
                      <span className="text-[9px] font-mono text-white/20 shrink-0">{task.storyPoints}pt</span>
                    )}
                    {task.agent && (
                      <Bot className="w-3 h-3 text-accent/40 shrink-0" />
                    )}
                  </div>
                ))}
                {epicTasks.length === 0 && (
                  <span className="text-[10px] text-white/20">No stories assigned to this epic yet</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

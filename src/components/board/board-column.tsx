"use client";

import { memo } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Column } from "@/lib/types";
import { TaskCard } from "./task-card";

const columnColors: Record<string, string> = {
  backlog: "bg-white/30",
  todo: "bg-info",
  in_progress: "bg-accent",
  in_review: "bg-warning",
  done: "bg-success",
};

const columnGlow: Record<string, string> = {
  backlog: "",
  todo: "shadow-[0_0_6px_rgba(96,165,250,0.3)]",
  in_progress: "shadow-[0_0_6px_rgba(139,92,246,0.3)]",
  in_review: "shadow-[0_0_6px_rgba(251,191,36,0.3)]",
  done: "shadow-[0_0_6px_rgba(52,211,153,0.3)]",
};

export const BoardColumn = memo(function BoardColumn({ column, index }: { column: Column; index: number }) {
  return (
    <div
      className="flex flex-col flex-1 min-w-0 h-full animate-[fadeSlideIn_0.5s_var(--ease-out-expo)_both]"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-2 pb-4">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            "w-2 h-2 rounded-full",
            columnColors[column.id] ?? "bg-white/30",
            columnGlow[column.id] ?? "",
          )} />
          <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-white/70">{column.title}</h3>
          <span
            className="flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-lg
                         bg-white/[0.04] border border-white/[0.04]
                         text-[11px] font-bold font-mono text-white/25"
          >
            {column.tasks.length}
          </span>
          {column.limit && (
            <span className="text-[10px] text-white/15 font-mono">/ {column.limit}</span>
          )}
        </div>
        <button className="p-1.5 rounded-lg text-white/20 hover:text-white/50 hover:bg-white/[0.06] transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Tasks — AnimatePresence enables exit animations, layout group syncs cross-column moves */}
      <div className="flex-1 min-h-0 space-y-2.5 overflow-y-auto scrollbar-none px-1 pb-2">
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}

        {column.tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-dashed border-white/[0.06]
                            flex items-center justify-center mb-3">
              <Plus className="w-5 h-5 text-white/15" />
            </div>
            <p className="text-[12px] text-white/20 mb-1">No tasks yet</p>
            <button className="text-[12px] text-accent/60 hover:text-accent font-medium transition-colors">
              Add a task
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

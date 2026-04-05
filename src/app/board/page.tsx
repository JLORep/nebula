"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useBoardStore } from "@/lib/stores/board-store";
import { BoardColumn } from "@/components/board/board-column";
import { TaskModal } from "@/components/board/task-modal";
import { FilterBar } from "@/components/board/filter-bar";
import { ProjectSelector } from "@/components/board/project-selector";
import { Spotlight } from "@/components/ui/spotlight";
import { useSimulation } from "@/lib/hooks/use-simulation";
import { cn } from "@/lib/utils/cn";

const columnColors: Record<string, string> = {
  backlog: "bg-white/30",
  todo: "bg-info",
  in_progress: "bg-accent",
  in_review: "bg-warning",
  done: "bg-success",
};

const columnGlow: Record<string, string> = {
  todo: "shadow-[0_0_6px_rgba(96,165,250,0.3)]",
  in_progress: "shadow-[0_0_6px_rgba(139,92,246,0.3)]",
  in_review: "shadow-[0_0_6px_rgba(251,191,36,0.3)]",
  done: "shadow-[0_0_6px_rgba(52,211,153,0.3)]",
};

export default function BoardPage() {
  useSimulation();
  const activeBoard = useBoardStore((s) => s.activeBoard);
  const selectedTask = useBoardStore((s) => s.selectedTask);
  const activeProject = useBoardStore((s) => s.activeProject);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeCol, setActiveCol] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActiveCol((prev) => (prev === idx ? prev : idx));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToColumn = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  }, []);

  if (!activeBoard) {
    return (
      <main className="relative z-10 min-h-screen flex items-center justify-center pt-20">
        <p className="text-white/30 text-[15px]">Select a board to get started</p>
      </main>
    );
  }

  return (
    <main className="relative z-10 h-screen flex flex-col pt-20 sm:pt-24 overflow-hidden">
      {/* Spotlight — hidden on mobile for perf */}
      <div className="hidden md:block">
        <Spotlight className="-top-40 left-40 md:-top-20" fill="rgba(139, 92, 246, 0.08)" />
      </div>

      <div className="flex flex-col flex-1 min-h-0 px-5 sm:px-7 md:px-10">
        {/* Board header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="mb-4 sm:mb-6 shrink-0"
        >
          <div className="flex items-center gap-3 mb-1 sm:mb-2">
            <ProjectSelector />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-[-0.03em] text-white/95">
              {activeBoard.name}
            </h1>
          </div>
          <p className="text-[13px] sm:text-[15px] text-white/35">{activeBoard.description}</p>
          {activeBoard.sprint && (
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 sm:mt-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-accent animate-pulse-glow" />
                <span className="text-[12px] sm:text-[13px] text-white/50">{activeBoard.sprint.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 sm:w-32 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-cyan-400 transition-[width] duration-700 ease-out"
                    style={{ width: `${(activeBoard.sprint.completedPoints / activeBoard.sprint.totalPoints) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] sm:text-[12px] font-mono text-white/30">
                  {activeBoard.sprint.completedPoints}/{activeBoard.sprint.totalPoints} pts
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Filter bar */}
        <FilterBar />

        {/* Board container — fills remaining height */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 25 }}
          className="relative flex-1 min-h-0 flex flex-col rounded-2xl sm:rounded-3xl border border-white/[0.06] bg-white/[0.02] p-3 sm:p-5 mb-4 overflow-hidden"
        >
          {/* Ambient glows — hidden on mobile */}
          <div className="hidden md:block">
            <div className="absolute -top-20 left-1/4 w-[400px] h-[200px] bg-accent/[0.04] blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-20 right-1/4 w-[400px] h-[200px] bg-cyan-400/[0.03] blur-[80px] pointer-events-none" />
          </div>
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

          {/* Mobile column indicator pills */}
          {activeBoard.columns.length > 0 && (
            <div className="flex md:hidden items-center gap-1.5 pb-3 shrink-0 overflow-x-auto scrollbar-none">
              {activeBoard.columns.map((col, i) => (
                <button
                  key={col.id}
                  onClick={() => scrollToColumn(i)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap shrink-0 transition-all duration-200",
                    i === activeCol
                      ? "bg-white/[0.08] border border-white/[0.10] text-white/80"
                      : "border border-transparent text-white/30"
                  )}
                >
                  <span className={cn("w-2 h-2 rounded-full shrink-0", columnColors[col.id], i === activeCol && columnGlow[col.id])} />
                  <span>{col.title}</span>
                  <span className={cn("min-w-[18px] h-[18px] flex items-center justify-center rounded-md text-[10px] font-mono", i === activeCol ? "bg-white/[0.06] text-white/50" : "text-white/20")}>
                    {col.tasks.length}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Columns — LayoutGroup syncs card animations across columns */}
          <LayoutGroup>
            <div
              ref={scrollRef}
              className="flex flex-1 min-h-0 gap-0 md:gap-4 -mx-1 px-1 gpu-children scroll-snap-mandatory md:overflow-x-visible"
            >
              {activeBoard.columns.map((column, index) => (
                <BoardColumn key={column.id} column={column} index={index} />
              ))}
            </div>
          </LayoutGroup>
        </motion.div>
      </div>

      {/* Task detail modal */}
      <AnimatePresence>
        {selectedTask && <TaskModal task={selectedTask} />}
      </AnimatePresence>
    </main>
  );
}

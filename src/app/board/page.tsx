"use client";

import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useBoardStore } from "@/lib/stores/board-store";
import { BoardColumn } from "@/components/board/board-column";
import { TaskModal } from "@/components/board/task-modal";
import { FilterBar } from "@/components/board/filter-bar";
import { ProjectSelector } from "@/components/board/project-selector";
import { Spotlight } from "@/components/ui/spotlight";
import { useSimulation } from "@/lib/hooks/use-simulation";

export default function BoardPage() {
  useSimulation();
  const activeBoard = useBoardStore((s) => s.activeBoard);
  const selectedTask = useBoardStore((s) => s.selectedTask);
  const activeProject = useBoardStore((s) => s.activeProject);

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

          {/* Columns — LayoutGroup syncs card animations across columns */}
          <LayoutGroup>
            <div className="flex flex-1 min-h-0 gap-3 sm:gap-4 -mx-1 px-1 gpu-children">
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

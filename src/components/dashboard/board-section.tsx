"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useBoardStore } from "@/lib/stores/board-store";
import { BoardColumn } from "@/components/board/board-column";
import { TaskDetailPanel } from "@/components/board/task-detail-panel";
import { Kanban } from "lucide-react";

export function BoardSection() {
  const { activeBoard, selectedTask } = useBoardStore();

  if (!activeBoard) return null;

  return (
    <div className="px-4 md:px-8 py-4 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 25 }}
      >
        {/* Section divider */}
        <div className="flex items-center gap-3 mb-6 max-w-7xl mx-auto">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <div className="flex items-center gap-2">
            <Kanban className="w-3.5 h-3.5 text-white/20" />
            <span className="text-[11px] uppercase tracking-[0.15em] text-white/20 font-medium">Board</span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>

        {/* Board container with glass effect */}
        <div className="max-w-7xl mx-auto relative">
          <div className="relative rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 overflow-hidden">
            {/* Ambient glow in the card */}
            <div className="absolute -top-20 left-1/4 w-[400px] h-[200px] bg-accent/[0.04] blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-20 right-1/4 w-[400px] h-[200px] bg-cyan-400/[0.03] blur-[80px] pointer-events-none" />

            {/* Top edge highlight */}
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

            {/* Columns */}
            <div className="flex gap-5 overflow-x-auto pb-2">
              {activeBoard.columns.map((column, index) => (
                <BoardColumn key={column.id} column={column} index={index} />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Task detail slide-out */}
      <AnimatePresence>
        {selectedTask && <TaskDetailPanel task={selectedTask} />}
      </AnimatePresence>
    </div>
  );
}

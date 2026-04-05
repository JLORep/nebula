"use client";

import { AnimatePresence } from "framer-motion";
import { useBoardStore } from "@/lib/stores/board-store";
import { BoardColumn } from "./board-column";
import { AgentPanel } from "../agent/agent-panel";
import { TaskDetailPanel } from "./task-detail-panel";

export function BoardView() {
  const activeBoard = useBoardStore((s) => s.activeBoard);
  const agentPanelOpen = useBoardStore((s) => s.agentPanelOpen);
  const selectedTask = useBoardStore((s) => s.selectedTask);

  if (!activeBoard) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-white/30 text-[15px]">Select a board to get started</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Board columns */}
      <div className="flex-1 flex gap-5 p-8 overflow-x-auto">
        {activeBoard.columns.map((column, index) => (
          <BoardColumn key={column.id} column={column} index={index} />
        ))}
      </div>

      {/* Task detail slide-out */}
      <AnimatePresence>
        {selectedTask && <TaskDetailPanel task={selectedTask} />}
      </AnimatePresence>

      {/* Agent panel */}
      <AnimatePresence>
        {agentPanelOpen && <AgentPanel agents={activeBoard.agents} />}
      </AnimatePresence>
    </div>
  );
}

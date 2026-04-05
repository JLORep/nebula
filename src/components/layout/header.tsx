"use client";

import { Search, Bell, Bot, Plus, Command } from "lucide-react";
import { useBoardStore } from "@/lib/stores/board-store";

export function Header() {
  const { activeBoard, toggleAgentPanel, agentPanelOpen } = useBoardStore();

  return (
    <header className="relative flex items-center justify-between h-[72px] px-8 shrink-0
                        glass border-b border-white/[0.06]">
      {/* Top edge highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Left: Board info */}
      <div className="flex items-center gap-5">
        <div>
          <h1 className="text-xl font-semibold tracking-[-0.02em] text-white/95">
            {activeBoard?.name ?? "FLOW"}
          </h1>
          {activeBoard?.sprint && (
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[12px] text-white/40">{activeBoard.sprint.name}</span>
              <span className="text-[12px] text-white/20">&middot;</span>
              <div className="flex items-center gap-1.5">
                <div className="w-16 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-cyan-400 transition-[width] duration-1000 ease-out"
                    style={{ width: `${(activeBoard.sprint.completedPoints / activeBoard.sprint.totalPoints) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono text-white/30">
                  {activeBoard.sprint.completedPoints}/{activeBoard.sprint.totalPoints}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex items-center max-w-sm w-full mx-8">
        <div className="flex items-center w-full gap-2.5 px-4 py-2.5 rounded-xl
                        bg-white/[0.03] border border-white/[0.06]
                        hover:bg-white/[0.05] hover:border-white/[0.10]
                        focus-within:bg-white/[0.05] focus-within:border-accent/30
                        focus-within:shadow-[0_0_0_3px_rgba(139,92,246,0.1)]
                        transition-[background-color,border-color,box-shadow] duration-200">
          <Search className="w-4 h-4 text-white/25 shrink-0" />
          <input
            type="text"
            placeholder="Search tasks, agents, actions..."
            className="w-full bg-transparent text-[13px] text-white/80 outline-none placeholder:text-white/20"
          />
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
            <Command className="w-3 h-3 text-white/20" />
            <span className="text-[10px] font-mono text-white/20">K</span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* New Task button with glow */}
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl
                     bg-accent/90 text-white text-[13px] font-medium
                     shadow-[0_0_20px_rgba(139,92,246,0.25)]
                     hover:bg-accent hover:shadow-[0_0_30px_rgba(139,92,246,0.35)] hover:scale-[1.02]
                     active:scale-[0.97]
                     transition-[background-color,box-shadow,transform] duration-200 will-change-transform"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>

        {/* Agent toggle */}
        <button
          onClick={toggleAgentPanel}
          className={`relative flex items-center justify-center w-10 h-10 rounded-xl
                     hover:scale-105 active:scale-95
                     transition-[background-color,border-color,transform] duration-200 will-change-transform ${
                       agentPanelOpen
                         ? "bg-accent/15 border border-accent/30 text-accent glow-accent"
                         : "bg-white/[0.03] border border-white/[0.06] text-white/35 hover:text-white/60 hover:border-white/[0.12]"
                     }`}
          title="Toggle Agent Panel"
        >
          <Bot className="w-[18px] h-[18px]" />
        </button>

        {/* Notifications */}
        <button
          className="relative flex items-center justify-center w-10 h-10 rounded-xl
                     bg-white/[0.03] border border-white/[0.06] text-white/35
                     hover:text-white/60 hover:border-white/[0.12] hover:scale-105
                     active:scale-95
                     transition-[background-color,border-color,transform] duration-200 will-change-transform"
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-danger border-2 border-void shadow-[0_0_8px_rgba(248,113,113,0.4)]" />
        </button>

        {/* Avatar */}
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl
                     bg-gradient-to-br from-accent/40 to-cyan-400/30
                     text-white text-[12px] font-bold tracking-wide
                     border border-white/[0.08]
                     cursor-pointer hover:scale-105
                     transition-transform duration-200 will-change-transform"
        >
          JH
        </div>
      </div>
    </header>
  );
}

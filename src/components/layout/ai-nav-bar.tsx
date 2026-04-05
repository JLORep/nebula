"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowUp, Users, Plus, DollarSign, Zap } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useBoardStore } from "@/lib/stores/board-store";
import { MovingBorderButton } from "@/components/ui/moving-border";

// ============================================================================
// AI Nav Bar — the command center. Claude-style prompt bar, bold + vibrant.
// ============================================================================

const placeholders = [
  "Ask FLOW anything...",
  "Create a new task...",
  "Analyze sprint velocity...",
  "Find blocked tickets...",
  "Summarize agent activity...",
  "Plan next sprint...",
];

const CYCLE_INTERVAL = 3500;

export function AINavBar() {
  const [inputValue, setInputValue] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const toggleNewTaskModal = useBoardStore((s) => s.toggleNewTaskModal);
  const toggleSquadSidebar = useBoardStore((s) => s.toggleSquadSidebar);
  const squadSidebarOpen = useBoardStore((s) => s.squadSidebarOpen);
  const activeBoard = useBoardStore((s) => s.activeBoard);

  const agents = activeBoard?.agents ?? [];
  const activeAgentCount = agents.filter(
    (a) => a.status === "executing" || a.status === "thinking"
  ).length;
  const totalCost = agents.reduce((sum, a) => sum + a.costUsd, 0);

  // Cycle placeholder text
  useEffect(() => {
    if (isFocused || inputValue) return;
    const id = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % placeholders.length);
    }, CYCLE_INTERVAL);
    return () => clearInterval(id);
  }, [isFocused, inputValue]);

  // Auto-resize textarea
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  useEffect(() => { autoResize(); }, [inputValue, autoResize]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
    setInputValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasInput = inputValue.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 26, delay: 0.2 }}
      className="fixed bottom-5 inset-x-0 mx-auto max-w-[52rem] z-50 px-4"
    >
      {/* Ambient glow behind the bar */}
      <div className="absolute -inset-3 rounded-[28px] bg-accent/[0.04] blur-2xl pointer-events-none" />
      <div className="absolute inset-x-12 -bottom-2 h-8 rounded-full bg-accent/[0.06] blur-xl pointer-events-none" />

      <div
        className={cn(
          "relative flex flex-col rounded-[20px] border bg-void/85 backdrop-blur-xl shadow-[0_-12px_48px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.04)] gpu transition-all duration-300",
          isFocused
            ? "border-accent/25 shadow-[0_-12px_48px_rgba(0,0,0,0.3),0_0_48px_rgba(139,92,246,0.08),0_0_0_1px_rgba(139,92,246,0.15)]"
            : "border-white/[0.08]"
        )}
      >
        {/* Top edge highlight — brighter on focus */}
        <div className={cn(
          "absolute inset-x-0 top-0 h-px rounded-t-[20px] transition-opacity duration-300",
          "bg-gradient-to-r from-transparent via-accent/30 to-transparent",
          isFocused ? "opacity-100" : "opacity-50"
        )} />

        {/* Main input area */}
        <form onSubmit={handleSubmit} className="flex items-end gap-3 px-5 pt-4 pb-3">
          {/* Sparkles icon */}
          <div className={cn(
            "flex items-center justify-center w-9 h-9 rounded-xl shrink-0 mb-0.5 transition-all duration-300",
            isFocused
              ? "bg-accent/15 text-accent shadow-[0_0_16px_rgba(139,92,246,0.15)]"
              : "bg-white/[0.04] text-white/20"
          )}>
            <Sparkles className="w-[18px] h-[18px]" />
          </div>

          {/* Textarea */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder={placeholders[placeholderIdx]}
              rows={1}
              className="w-full bg-transparent text-[15px] leading-relaxed text-white/90 placeholder:text-white/25 outline-none resize-none min-h-[36px] max-h-[120px] py-1.5"
            />
          </div>

          {/* Send button */}
          <motion.button
            type="submit"
            disabled={!hasInput}
            whileHover={hasInput ? { scale: 1.08 } : undefined}
            whileTap={hasInput ? { scale: 0.92 } : undefined}
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl shrink-0 mb-0.5 transition-all duration-250",
              hasInput
                ? "bg-gradient-to-br from-accent to-[#7c3aed] text-white shadow-[0_0_20px_rgba(139,92,246,0.4),0_4px_12px_rgba(139,92,246,0.25)] hover:shadow-[0_0_28px_rgba(139,92,246,0.5),0_4px_16px_rgba(139,92,246,0.35)]"
                : "bg-white/[0.04] text-white/15 cursor-not-allowed"
            )}
          >
            <ArrowUp className="w-[18px] h-[18px]" strokeWidth={2.5} />
          </motion.button>
        </form>

        {/* Bottom toolbar — actions row */}
        <div className="flex items-center justify-between gap-2 px-5 pb-3.5 pt-0.5">
          <div className="flex items-center gap-2">
            {/* Squad toggle */}
            <button
              onClick={toggleSquadSidebar}
              className={cn(
                "relative flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-medium transition-all duration-200 shrink-0",
                squadSidebarOpen
                  ? "bg-accent/12 text-accent border border-accent/15"
                  : "text-white/35 hover:text-white/70 hover:bg-white/[0.06] border border-transparent"
              )}
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Squad</span>
              {activeAgentCount > 0 && (
                <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-success/15 text-success text-[10px] font-bold border border-success/20">
                  {activeAgentCount}
                </span>
              )}
            </button>

            {/* Sprint cost */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-mono text-white/20 border border-transparent">
              <DollarSign className="w-3.5 h-3.5" />
              <span>{totalCost.toFixed(2)}</span>
            </div>

            {/* Active agents indicator */}
            <AnimatePresence>
              {activeAgentCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-medium text-accent/60"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{activeAgentCount} agent{activeAgentCount !== 1 ? "s" : ""} working</span>
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* New Flow button */}
          <MovingBorderButton
            borderRadius="0.75rem"
            containerClassName="h-10"
            className="text-[12px] px-5"
            duration={2500}
            onClick={toggleNewTaskModal}
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span className="hidden sm:inline font-semibold">New Flow</span>
          </MovingBorderButton>
        </div>
      </div>
    </motion.div>
  );
}

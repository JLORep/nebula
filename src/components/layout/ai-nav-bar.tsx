"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowUp, Plus, DollarSign, Zap } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useBoardStore } from "@/lib/stores/board-store";
import { MovingBorderButton } from "@/components/ui/moving-border";

// ============================================================================
// AI Nav Bar — the command center. Bold, prominent, zero scrollbars.
// ============================================================================

const placeholders = [
  "Ask Nebula anything...",
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

  // Auto-resize textarea (no scrollbar — overflow hidden)
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
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
      className="fixed bottom-6 left-[340px] right-[340px] mx-auto max-w-[56rem] z-50 px-6"
    >
      {/* Ambient glow — stronger for prominence */}
      <div className="absolute -inset-4 rounded-[32px] bg-accent/[0.06] blur-3xl pointer-events-none" />
      <div className="absolute inset-x-8 -bottom-3 h-12 rounded-full bg-accent/[0.08] blur-2xl pointer-events-none" />

      <div
        className={cn(
          "relative flex flex-col rounded-[24px] border bg-void/90 backdrop-blur-2xl gpu transition-all duration-300",
          "shadow-[0_-16px_64px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.05)]",
          isFocused
            ? "border-accent/30 shadow-[0_-16px_64px_rgba(0,0,0,0.35),0_0_64px_rgba(139,92,246,0.12),0_0_0_1px_rgba(139,92,246,0.2)]"
            : "border-white/[0.08]"
        )}
      >
        {/* Top edge highlight — brighter on focus */}
        <div className={cn(
          "absolute inset-x-0 top-0 h-px rounded-t-[24px] transition-opacity duration-300",
          "bg-gradient-to-r from-transparent via-accent/40 to-transparent",
          isFocused ? "opacity-100" : "opacity-50"
        )} />

        {/* Side edge accents */}
        <div className="absolute inset-y-4 left-0 w-px bg-gradient-to-b from-transparent via-accent/10 to-transparent" />
        <div className="absolute inset-y-4 right-0 w-px bg-gradient-to-b from-transparent via-accent/10 to-transparent" />

        {/* Main input area */}
        <form onSubmit={handleSubmit} className="flex items-end gap-4 px-6 pt-5 pb-4">
          {/* Sparkles icon — bigger */}
          <div className={cn(
            "flex items-center justify-center w-11 h-11 rounded-2xl shrink-0 mb-0.5 transition-all duration-300",
            isFocused
              ? "bg-gradient-to-br from-accent/20 to-cyan-500/10 text-accent shadow-[0_0_20px_rgba(139,92,246,0.2)]"
              : "bg-white/[0.05] text-white/25"
          )}>
            <Sparkles className="w-5 h-5" />
          </div>

          {/* Textarea — no scrollbar */}
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
              className="w-full bg-transparent text-[16px] leading-relaxed text-white/90 placeholder:text-white/25 outline-none resize-none overflow-hidden min-h-[44px] max-h-[140px] py-2"
            />
          </div>

          {/* Send button — bigger */}
          <motion.button
            type="submit"
            disabled={!hasInput}
            whileHover={hasInput ? { scale: 1.08 } : undefined}
            whileTap={hasInput ? { scale: 0.92 } : undefined}
            className={cn(
              "flex items-center justify-center w-11 h-11 rounded-2xl shrink-0 mb-0.5 transition-all duration-250",
              hasInput
                ? "bg-gradient-to-br from-accent to-[#7c3aed] text-white shadow-[0_0_24px_rgba(139,92,246,0.45),0_4px_16px_rgba(139,92,246,0.3)] hover:shadow-[0_0_32px_rgba(139,92,246,0.55),0_4px_20px_rgba(139,92,246,0.4)]"
                : "bg-white/[0.04] text-white/15 cursor-not-allowed"
            )}
          >
            <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
          </motion.button>
        </form>

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between gap-3 px-6 pb-4 pt-0">
          <div className="flex items-center gap-3">
            {/* Sprint cost */}
            <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-mono text-white/25 bg-white/[0.03] border border-white/[0.04]">
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
                  className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-medium text-accent/70 bg-accent/[0.04] border border-accent/[0.06]"
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
            containerClassName="h-11"
            className="text-[13px] px-6"
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

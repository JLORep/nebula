"use client";

import { memo, useRef, useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, Minimize2, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useBoardStore } from "@/lib/stores/board-store";
import { useSimulationStore } from "@/lib/stores/simulation-store";
import type { TerminalLine, TerminalLineType } from "@/lib/stores/simulation-store";

// ============================================================================
// Agent Terminal — live scrolling AI agent output
// Inline mode (bento card) + fullscreen overlay mode
// ============================================================================

// ── Agent name colors ───────────────────────────────────────────────────────

const agentColors: Record<string, string> = {
  Athena: "text-cyan-400",
  Blueprint: "text-violet-400",
  Flow: "text-emerald-400",
  Sentinel: "text-blue-400",
  Oracle: "text-amber-400",
  Nexus: "text-teal-400",
  Cipher: "text-orange-400",
  Spark: "text-lime-400",
  Atlas: "text-indigo-400",
  Prism: "text-pink-400",
  system: "text-white/25",
};

// ── Line type config ────────────────────────────────────────────────────────

const lineTypeConfig: Record<TerminalLineType, { prefix: string; color: string }> = {
  thinking:  { prefix: "◐", color: "text-accent/80" },
  action:    { prefix: "$", color: "text-white/50" },
  output:    { prefix: "→", color: "text-white/35" },
  file:      { prefix: "▸", color: "text-cyan-400/70" },
  test_pass: { prefix: "✓", color: "text-success" },
  test_fail: { prefix: "✗", color: "text-danger" },
  success:   { prefix: "✓", color: "text-success" },
  warning:   { prefix: "⚠", color: "text-warning" },
  complete:  { prefix: "★", color: "text-success" },
  approval:  { prefix: "⏳", color: "text-warning" },
  system:    { prefix: "│", color: "text-white/20" },
};

// ── Time formatter ──────────────────────────────────────────────────────────

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// ── Terminal line component ─────────────────────────────────────────────────

const TermLine = memo(function TermLine({
  line,
  isLatest,
  large,
}: {
  line: TerminalLine;
  isLatest: boolean;
  large?: boolean;
}) {
  const typeConf = lineTypeConfig[line.type];
  const nameColor = agentColors[line.agentName] ?? "text-white/40";
  const isSystemLine = line.agentName === "system";

  return (
    <div className={cn(
      "flex items-start gap-0 py-[1px]",
      large ? "leading-[22px]" : "leading-[18px]",
      isLatest && "terminal-line-new",
    )}>
      {/* Timestamp */}
      <span className={cn("text-white/15 shrink-0", large ? "w-[76px]" : "w-[62px]")}>
        {formatTime(line.timestamp)}
      </span>

      {/* Prefix icon */}
      <span className={cn("shrink-0 w-[14px] text-center", typeConf.color)}>
        {typeConf.prefix}
      </span>

      {/* Agent name */}
      {!isSystemLine ? (
        <span className={cn("shrink-0 font-semibold truncate", nameColor, large ? "w-[90px]" : "w-[72px]")}>
          {line.agentName}
        </span>
      ) : (
        <span className={cn("shrink-0 text-white/20", large ? "w-[90px]" : "w-[72px]")}>
          system
        </span>
      )}

      {/* Content */}
      <span className={cn("min-w-0", typeConf.color, large ? "" : "truncate")}>
        {line.content}
      </span>

      {/* Blinking cursor on latest line */}
      {isLatest && (
        <span className="animate-blink text-accent/70 ml-0.5 shrink-0">▊</span>
      )}
    </div>
  );
});

// ── Status bar ──────────────────────────────────────────────────────────────

const StatusBar = memo(function StatusBar({ large }: { large?: boolean }) {
  const activeBoard = useBoardStore((s) => s.activeBoard);
  const agents = activeBoard?.agents ?? [];
  const activeCount = agents.filter(
    (a) => a.status === "executing" || a.status === "thinking",
  ).length;
  const totalTokens = agents.reduce((sum, a) => sum + a.tokensUsed, 0);
  const totalCost = agents.reduce((sum, a) => sum + a.costUsd, 0);
  const sprint = activeBoard?.sprint;
  const sprintPct = sprint
    ? Math.round((sprint.completedPoints / sprint.totalPoints) * 100)
    : 0;

  return (
    <div className={cn(
      "flex items-center gap-3 pt-2 mt-auto border-t border-white/[0.04] font-mono",
      large ? "text-[11px]" : "text-[10px]",
    )}>
      <span className="flex items-center gap-1.5">
        <span className={cn(
          "inline-flex h-1.5 w-1.5 rounded-full",
          activeCount > 0 ? "bg-success animate-pulse" : "bg-white/20",
        )} />
        <span className="text-white/30">{activeCount} active</span>
      </span>
      <span className="text-white/10">·</span>
      <span className="text-white/30">{(totalTokens / 1000).toFixed(1)}k tokens</span>
      <span className="text-white/10">·</span>
      <span className="text-white/30">${totalCost.toFixed(2)}</span>
      {sprint && (
        <>
          <span className="text-white/10">·</span>
          <span className="text-accent/50">Sprint {sprintPct}%</span>
        </>
      )}
    </div>
  );
});

// ── Terminal body (shared between inline and fullscreen) ────────────────────

// Limit rendered lines for perf — inline shows fewer, fullscreen shows more
const INLINE_MAX_LINES = 25;
const FULLSCREEN_MAX_LINES = 50;

function TerminalBody({ large }: { large?: boolean }) {
  const terminalLines = useSimulationStore((s) => s.terminalLines);
  const scrollRef = useRef<HTMLDivElement>(null);

  const maxLines = large ? FULLSCREEN_MAX_LINES : INLINE_MAX_LINES;
  const visibleLines = terminalLines.length > maxLines
    ? terminalLines.slice(-maxLines)
    : terminalLines;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalLines.length]);

  return (
    <>
      <div
        ref={scrollRef}
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden font-mono scrollbar-none pr-1 gpu",
          large ? "text-[12px]" : "text-[10px]",
        )}
      >
        {visibleLines.length > 0 ? (
          visibleLines.map((line, idx) => (
            <TermLine
              key={line.id}
              line={line}
              isLatest={idx === visibleLines.length - 1}
              large={large}
            />
          ))
        ) : (
          <div className={cn("text-white/20", large ? "leading-[22px]" : "leading-[18px]")}>
            <span className="text-white/15">$</span> Initializing agent orchestrator...
            <span className="animate-blink text-accent/50 ml-0.5">▊</span>
          </div>
        )}
      </div>
      <StatusBar large={large} />
    </>
  );
}

// ── Fullscreen overlay ──────────────────────────────────────────────────────

function FullscreenTerminal({ onClose }: { onClose: () => void }) {
  const running = useSimulationStore((s) => s.running);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-void/90 backdrop-blur-md"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Terminal window */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full max-w-5xl h-[85vh] flex flex-col rounded-2xl border border-white/[0.08] bg-nebula/95 backdrop-blur-xl shadow-[0_32px_100px_rgba(0,0,0,0.6)] overflow-hidden"
      >
        {/* Top edge glow */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06] shrink-0">
          <div className="flex gap-1.5">
            <button
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-danger/60 hover:bg-danger transition-colors group flex items-center justify-center"
            >
              <X className="w-1.5 h-1.5 text-danger/0 group-hover:text-danger-foreground transition-colors" />
            </button>
            <div className="w-3 h-3 rounded-full bg-warning/60" />
            <div className="w-3 h-3 rounded-full bg-success/60" />
          </div>
          <span className="text-[12px] font-mono text-white/30 ml-2">agent-orchestrator v1.0 — forge</span>
          {running && (
            <span className="flex items-center gap-1.5 ml-auto">
              <span className="inline-flex h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-mono text-success/60">LIVE</span>
            </span>
          )}
          <button
            onClick={onClose}
            className="ml-2 p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors"
            title="Exit fullscreen (Esc)"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Terminal body */}
        <div className="flex-1 flex flex-col px-5 py-3 min-h-0">
          <TerminalBody large />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main exported component (inline bento card mode) ────────────────────────

export const AgentTerminal = memo(function AgentTerminal() {
  const running = useSimulationStore((s) => s.running);
  const [expanded, setExpanded] = useState(false);

  const handleClose = useCallback(() => setExpanded(false), []);

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header — traffic lights + session name + live badge + expand */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-danger/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
          </div>
          <span className="text-[10px] font-mono text-white/20 ml-2">agent-orchestrator v1.0</span>
          {running && (
            <span className="flex items-center gap-1 ml-auto mr-1">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[9px] font-mono text-success/50">LIVE</span>
            </span>
          )}
          <button
            onClick={() => setExpanded(true)}
            className={cn(
              "p-1 rounded-md text-white/20 hover:text-white/50 hover:bg-white/[0.06] transition-colors",
              !running && "ml-auto",
            )}
            title="Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Inline terminal body */}
        <TerminalBody />
      </div>

      {/* Fullscreen overlay — portaled to document.body to escape overflow/contain-paint */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {expanded && <FullscreenTerminal onClose={handleClose} />}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
});

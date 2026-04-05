"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Bot, Zap, Cpu, DollarSign, Pause, Activity } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Spotlight } from "@/components/ui/spotlight";
import { ProjectSelector } from "@/components/board/project-selector";
import { useBoardStore } from "@/lib/stores/board-store";
import { useSimulation } from "@/lib/hooks/use-simulation";
import { FleetSummary, AgentGrid } from "@/components/agents/agent-grid";
import { MetricsGrid } from "@/components/dashboard/metrics-grid";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { SPRING } from "@/lib/utils/motion";

export default function AgentsPage() {
  useSimulation();

  const activeBoard = useBoardStore((s) => s.activeBoard);
  const agents = activeBoard?.agents ?? [];
  const activeCount = agents.filter(
    (a) => a.status === "executing" || a.status === "thinking" || a.status === "awaiting_approval",
  ).length;
  const totalCost = agents.reduce((sum, a) => sum + a.costUsd, 0);
  const totalTokens = agents.reduce((sum, a) => sum + a.tokensUsed, 0);

  return (
    <main className="relative z-10 min-h-screen pt-20 sm:pt-24">
      <div className="hidden md:block">
        <Spotlight className="-top-40 left-40 md:-top-20" fill="rgba(139, 92, 246, 0.08)" />
      </div>

      <div className="px-5 sm:px-7 md:px-10 pb-12">
        {/* ── Header ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="mb-6 shrink-0"
        >
          <div className="flex items-center gap-3 mb-2">
            <ProjectSelector />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-[-0.03em] text-white/95">
              Agent Fleet
            </h1>
          </div>

          {/* Live stats row */}
          <div className="flex flex-wrap items-center gap-4 mt-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-success animate-pulse-glow" />
              <span className="text-[12px] sm:text-[13px] text-white/50">{activeCount} agents active</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-cyan-400/50" />
              <span className="text-[11px] sm:text-[12px] font-mono text-white/30">
                {(totalTokens / 1000).toFixed(1)}k tokens
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400/50" />
              <span className="text-[11px] sm:text-[12px] font-mono text-white/30">
                ${totalCost.toFixed(2)} spent
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Fleet Stats Ribbon ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.08 }}
          className="mb-6"
        >
          <FleetSummary agents={agents} />
        </motion.div>

        {/* ── Live Activity ──────────────────────────────────────────── */}
        <ActivityFeed />

        {/* ── Mission Control ────────────────────────────────────────── */}
        <MetricsGrid />

        {/* ── Agent Grid ─────────────────────────────────────────────── */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
            <div className="flex items-center gap-2">
              <Bot className="w-3.5 h-3.5 text-white/20" />
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-white/20 font-medium">Agent Fleet</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          </div>

          <AgentGrid agents={agents} />

          {agents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-4">
                <Zap className="w-6 h-6 text-white/15" />
              </div>
              <h3 className="text-[15px] font-semibold text-white/40 mb-1">No agents deployed</h3>
              <p className="text-[12px] text-white/20 max-w-sm">
                Select a project and start a sprint to deploy AI agents. They&apos;ll appear here as they begin working.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

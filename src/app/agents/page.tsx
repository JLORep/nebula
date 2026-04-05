"use client";

import { Bot, Zap } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";
import { Meteors } from "@/components/ui/meteors";
import { FleetSummary, AgentGrid } from "@/components/agents/agent-grid";
import { useBoardStore } from "@/lib/stores/board-store";
import { useSimulation } from "@/lib/hooks/use-simulation";

export default function AgentsPage() {
  useSimulation();

  const activeBoard = useBoardStore((s) => s.activeBoard);
  const agents = activeBoard?.agents ?? [];
  const activeCount = agents.filter(
    (a) => a.status === "executing" || a.status === "thinking" || a.status === "awaiting_approval",
  ).length;
  const totalCost = agents.reduce((sum, a) => sum + a.costUsd, 0);

  return (
    <main className="relative z-10 min-h-screen">
      {/* Hero section */}
      <div className="relative min-h-[32vh] flex flex-col items-center justify-center overflow-hidden px-4 pt-20">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(139, 92, 246, 0.15)" />
        <div className="hidden md:block">
          <Spotlight className="-top-40 right-60 md:-top-20" fill="rgba(6, 182, 212, 0.08)" />
        </div>
        <Meteors number={4} className="z-0 hidden sm:block" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] mb-5 animate-[fadeSlideIn_0.5s_var(--ease-out-expo)_both]">
            <span className="inline-flex h-2 w-2 rounded-full bg-success animate-pulse-glow" />
            <span className="text-[12px] font-medium text-white/50">{activeCount} active</span>
            <div className="w-px h-3 bg-white/10" />
            <span className="text-[12px] font-mono text-accent">${totalCost.toFixed(2)}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-[-0.04em] leading-[1.1] text-white/95 mb-3 animate-[fadeSlideIn_0.5s_var(--ease-out-expo)_100ms_both]">
            Agent Fleet
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-white/35 font-light max-w-xl leading-relaxed animate-[fadeSlideIn_0.5s_var(--ease-out-expo)_200ms_both]">
            AI agents autonomously executing your sprint
          </p>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-void to-transparent" />
      </div>

      {/* Fleet summary */}
      <div className="px-4 md:px-8 -mt-6 relative z-10 max-w-7xl mx-auto">
        <FleetSummary agents={agents} />
      </div>

      {/* Agent grid section */}
      <div className="px-4 md:px-8 py-8 pb-16 max-w-7xl mx-auto">
        {/* Section divider */}
        <div className="flex items-center gap-3 mb-6 animate-[fadeSlideIn_0.5s_var(--ease-out-expo)_300ms_both]">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <div className="flex items-center gap-2">
            <Bot className="w-3.5 h-3.5 text-white/20" />
            <span className="text-[11px] uppercase tracking-[0.15em] text-white/20 font-medium">Agent Fleet</span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>

        <AgentGrid agents={agents} />

        {/* Empty state */}
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
    </main>
  );
}

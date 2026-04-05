"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bot, Cpu, DollarSign, Zap, Pause, Brain, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Agent, AgentStatus } from "@/lib/types";
import { useBoardStore } from "@/lib/stores/board-store";
import { SPRING_GENTLE, staggerContainer } from "@/lib/utils/motion";

const statusConfig: Record<AgentStatus, { color: string; bg: string; icon: typeof Bot; label: string; pulse?: boolean }> = {
  idle: { color: "text-white/30", bg: "bg-white/[0.03]", icon: Pause, label: "Standby" },
  thinking: { color: "text-accent", bg: "bg-accent-muted", icon: Brain, label: "Thinking", pulse: true },
  executing: { color: "text-success", bg: "bg-success-muted", icon: Zap, label: "Executing", pulse: true },
  awaiting_approval: { color: "text-warning", bg: "bg-warning-muted", icon: AlertTriangle, label: "Needs Approval" },
  completed: { color: "text-success", bg: "bg-success-muted", icon: CheckCircle2, label: "Done" },
  failed: { color: "text-danger", bg: "bg-danger-muted", icon: AlertTriangle, label: "Failed" },
};

const roleLabels: Record<string, string> = {
  planner: "Planner",
  architect: "Architect",
  developer: "Developer",
  tester: "Tester",
  reviewer: "Reviewer",
  deployer: "Deployer",
};

function AgentCard({ agent }: { agent: Agent }) {
  const config = statusConfig[agent.status];
  const isActive = agent.status === "executing" || agent.status === "thinking";

  return (
    <div
      className={cn(
        "relative group p-4 rounded-2xl cursor-pointer contain-paint",
        "bg-white/[0.03]",
        "border transition-[border-color,background-color,box-shadow,transform] duration-300 will-change-transform",
        "hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.98]",
        isActive
          ? "border-accent/20 shadow-[0_0_20px_rgba(139,92,246,0.08)]"
          : "border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05]"
      )}
    >
      {isActive && <div className="absolute inset-0 rounded-2xl gradient-border pointer-events-none" />}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center justify-center w-9 h-9 rounded-xl text-[11px] font-bold border",
            isActive ? "bg-accent/10 text-accent border-accent/20" : "bg-white/[0.04] text-white/30 border-white/[0.06]"
          )}>
            {agent.avatar}
          </div>
          <div>
            <h4 className="text-[13px] font-semibold text-white/90">{agent.name}</h4>
            <p className="text-[10px] text-white/30">{roleLabels[agent.role]}</p>
          </div>
        </div>
        <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium", config.bg, config.color)}>
          {config.pulse ? (
            <span className={cn("inline-flex h-1.5 w-1.5 rounded-full animate-pulse-glow",
                agent.status === "executing" ? "bg-success" : "bg-accent")} />
          ) : (
            <config.icon className="w-3 h-3" />
          )}
          <span>{config.label}</span>
        </div>
      </div>

      {agent.currentAction && (
        <div className="px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] mb-3">
          <p className="text-[11px] text-white/45 leading-relaxed">{agent.currentAction}</p>
        </div>
      )}

      <div className="flex items-center gap-4 text-[10px] text-white/25">
        <span className="flex items-center gap-1">
          <Cpu className="w-3 h-3" />
          {(agent.tokensUsed / 1000).toFixed(1)}k
        </span>
        <span className="flex items-center gap-1">
          <DollarSign className="w-3 h-3" />
          ${agent.costUsd.toFixed(2)}
        </span>
        <span className="text-white/15 font-mono text-[9px]">{agent.model.split("-").slice(-2).join("-")}</span>
      </div>
    </div>
  );
}

export function AgentPanel({ agents }: { agents: Agent[] }) {
  const { toggleAgentPanel } = useBoardStore();
  const activeAgents = agents.filter((a) => a.status !== "idle");
  const idleAgents = agents.filter((a) => a.status === "idle");
  const totalCost = agents.reduce((sum, a) => sum + a.costUsd, 0);
  const totalTokens = agents.reduce((sum, a) => sum + a.tokensUsed, 0);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={toggleAgentPanel}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 gpu"
      />

      {/* Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={SPRING_GENTLE}
        className="fixed top-0 right-0 bottom-0 w-full sm:w-[380px] z-50 border-l border-white/[0.08] bg-modal/98 backdrop-blur-md overflow-hidden gpu"
      >
        {/* Top edge highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent z-10" />

        <div className="h-full overflow-y-auto p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-accent/10 border border-accent/20">
                <Bot className="w-4 h-4 text-accent" />
              </div>
              <h3 className="text-[14px] font-semibold text-white/90">Agent Fleet</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-muted border border-accent/20 text-accent text-[10px] font-bold">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-accent animate-pulse-glow" />
                {activeAgents.length} active
              </span>
              <button
                onClick={toggleAgentPanel}
                className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-[10px] text-white/25 mb-1">Sprint Cost</p>
              <p className="text-[18px] font-bold text-white/90 font-mono">${totalCost.toFixed(2)}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-[10px] text-white/25 mb-1">Tokens</p>
              <p className="text-[18px] font-bold text-white/90 font-mono">{(totalTokens / 1000).toFixed(0)}k</p>
            </div>
          </div>

          {/* Active agents */}
          {activeAgents.length > 0 && (
            <div className="space-y-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/20">Working</span>
              <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-2.5">
                {activeAgents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </motion.div>
            </div>
          )}

          {/* Idle agents */}
          {idleAgents.length > 0 && (
            <div className="space-y-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/20">Standby</span>
              <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-2.5">
                {idleAgents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Users, Cpu, DollarSign, Zap, Pause, Brain, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useBoardStore } from "@/lib/stores/board-store";
import { SPRING_GENTLE } from "@/lib/utils/motion";
import type { Agent, AgentStatus } from "@/lib/types";

// ============================================================================
// Squad Sidebar — collapsible agent roster (left side)
// Collapsed: 56px avatar strip | Expanded: 280px full roster
// ============================================================================

const statusConfig: Record<AgentStatus, { dot: string; label: string }> = {
  idle: { dot: "bg-white/20", label: "Standby" },
  thinking: { dot: "bg-accent", label: "Thinking" },
  executing: { dot: "bg-success", label: "Executing" },
  awaiting_approval: { dot: "bg-warning", label: "Approval" },
  completed: { dot: "bg-success", label: "Done" },
  failed: { dot: "bg-danger", label: "Failed" },
};

const roleLabels: Record<string, string> = {
  planner: "Planner",
  architect: "Architect",
  developer: "Developer",
  tester: "Tester",
  reviewer: "Reviewer",
  deployer: "Deployer",
};

const agentBgColors: Record<string, string> = {
  Athena: "bg-cyan-400/20",
  Blueprint: "bg-violet-400/20",
  Flow: "bg-emerald-400/20",
  Sentinel: "bg-blue-400/20",
  Oracle: "bg-amber-400/20",
  Nexus: "bg-teal-400/20",
  Cipher: "bg-orange-400/20",
  Spark: "bg-lime-400/20",
  Atlas: "bg-indigo-400/20",
  Prism: "bg-pink-400/20",
};

const agentTextColors: Record<string, string> = {
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
};

function AgentAvatar({ agent, expanded }: { agent: Agent; expanded: boolean }) {
  const config = statusConfig[agent.status];
  const bgColor = agentBgColors[agent.name] ?? "bg-white/[0.06]";
  const textColor = agentTextColors[agent.name] ?? "text-white/40";
  const isActive = agent.status === "executing" || agent.status === "thinking";

  return (
    <div
      className={cn(
        "relative group/agent",
        expanded ? "flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors duration-150" : "flex items-center justify-center"
      )}
    >
      {/* Avatar circle */}
      <div className={cn(
        "relative flex items-center justify-center shrink-0 rounded-xl text-[10px] font-bold",
        expanded ? "w-8 h-8" : "w-9 h-9",
        bgColor,
        textColor,
      )}>
        {agent.avatar}
        {/* Status dot */}
        <span className={cn(
          "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-void",
          config.dot,
          isActive && "animate-pulse"
        )} />
      </div>

      {/* Expanded info */}
      {expanded && (
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn("text-[12px] font-semibold truncate", textColor)}>{agent.name}</span>
            <span className={cn(
              "text-[9px] font-medium px-1.5 py-0.5 rounded-md",
              isActive ? "bg-success/10 text-success" : "bg-white/[0.04] text-white/25"
            )}>
              {config.label}
            </span>
          </div>
          <p className="text-[10px] text-white/25 truncate">
            {agent.currentAction ?? roleLabels[agent.role]}
          </p>
        </div>
      )}

      {/* Tooltip for collapsed mode */}
      {!expanded && (
        <div className="absolute left-full ml-2 px-2.5 py-1.5 rounded-lg bg-void/95 border border-white/[0.08] backdrop-blur-md shadow-lg opacity-0 group-hover/agent:opacity-100 transition-opacity duration-150 pointer-events-none z-50 whitespace-nowrap">
          <p className={cn("text-[11px] font-semibold", textColor)}>{agent.name}</p>
          <p className="text-[9px] text-white/30">{config.label}</p>
        </div>
      )}
    </div>
  );
}

export function SquadSidebar() {
  const squadSidebarOpen = useBoardStore((s) => s.squadSidebarOpen);
  const activeBoard = useBoardStore((s) => s.activeBoard);

  const agents = activeBoard?.agents ?? [];
  const activeAgents = agents.filter((a) => a.status !== "idle" && a.status !== "completed");
  const idleAgents = agents.filter((a) => a.status === "idle" || a.status === "completed");
  const totalCost = agents.reduce((sum, a) => sum + a.costUsd, 0);
  const totalTokens = agents.reduce((sum, a) => sum + a.tokensUsed, 0);

  return (
    <motion.aside
      initial={false}
      animate={{ width: squadSidebarOpen ? 280 : 56 }}
      transition={SPRING_GENTLE}
      className="fixed left-0 top-0 bottom-[120px] z-40 flex flex-col border-r border-white/[0.06] bg-void/80 backdrop-blur-md overflow-hidden gpu"
    >
      {/* Top edge highlight */}
      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-accent/10 via-transparent to-transparent" />

      {/* Header */}
      <div className={cn(
        "flex items-center gap-2.5 px-3 pt-20 pb-3 shrink-0",
        !squadSidebarOpen && "justify-center"
      )}>
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-accent/10 shrink-0">
          <Users className="w-4 h-4 text-accent" />
        </div>
        <AnimatePresence>
          {squadSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 min-w-0"
            >
              <span className="text-[13px] font-semibold text-white/80 whitespace-nowrap">Squad</span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent-muted text-accent text-[10px] font-bold shrink-0">
                {agents.length}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Agent list */}
      <div className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden",
        squadSidebarOpen ? "px-2 space-y-0.5" : "px-2 space-y-2 py-2"
      )}>
        {/* Active agents first */}
        {activeAgents.length > 0 && squadSidebarOpen && (
          <div className="px-1 pt-1 pb-1.5">
            <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-white/15">Working</span>
          </div>
        )}
        {activeAgents.map((agent) => (
          <AgentAvatar key={agent.id} agent={agent} expanded={squadSidebarOpen} />
        ))}

        {/* Idle agents */}
        {idleAgents.length > 0 && squadSidebarOpen && (
          <div className="px-1 pt-3 pb-1.5">
            <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-white/15">Standby</span>
          </div>
        )}
        {idleAgents.map((agent) => (
          <AgentAvatar key={agent.id} agent={agent} expanded={squadSidebarOpen} />
        ))}
      </div>

      {/* Stats footer (expanded only) */}
      <AnimatePresence>
        {squadSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="shrink-0 px-3 py-3 border-t border-white/[0.06]"
          >
            <div className="flex items-center justify-between text-[10px] text-white/25 font-mono">
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                ${totalCost.toFixed(2)}
              </span>
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                {(totalTokens / 1000).toFixed(0)}k
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}

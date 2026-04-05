"use client";

import { memo, useMemo } from "react";
import { Cpu, DollarSign, Zap, Pause, Brain, AlertTriangle, CheckCircle2, Bot, Activity } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Agent, AgentStatus, AgentAction } from "@/lib/types";

// ============================================================================
// Agent Fleet Grid — mission control for the AI fleet
// ============================================================================

// ── Status config (mirrors agent-panel.tsx) ─────────────────────────────────

const statusConfig: Record<AgentStatus, { color: string; bg: string; icon: typeof Bot; label: string; pulse?: boolean }> = {
  idle: { color: "text-white/30", bg: "bg-white/[0.03]", icon: Pause, label: "Standby" },
  thinking: { color: "text-accent", bg: "bg-accent-muted", icon: Brain, label: "Thinking", pulse: true },
  executing: { color: "text-success", bg: "bg-success-muted", icon: Zap, label: "Executing", pulse: true },
  awaiting_approval: { color: "text-warning", bg: "bg-warning-muted", icon: AlertTriangle, label: "Needs Approval" },
  completed: { color: "text-success", bg: "bg-success-muted", icon: CheckCircle2, label: "Done" },
  failed: { color: "text-danger", bg: "bg-danger-muted", icon: AlertTriangle, label: "Failed" },
};

// ── Role labels ─────────────────────────────────────────────────────────────

const roleLabels: Record<string, string> = {
  planner: "Planner",
  architect: "Architect",
  developer: "Developer",
  tester: "Tester",
  reviewer: "Reviewer",
  deployer: "Deployer",
};

// ── Agent colors (mirrors agent-terminal.tsx) ───────────────────────────────

const agentColors: Record<string, { text: string; bg: string; border: string; gradient: string }> = {
  Athena:    { text: "text-cyan-400",    bg: "bg-cyan-400/10",    border: "border-cyan-400/20",    gradient: "from-cyan-500/80 to-cyan-400/40" },
  Blueprint: { text: "text-violet-400",  bg: "bg-violet-400/10",  border: "border-violet-400/20",  gradient: "from-violet-500/80 to-violet-400/40" },
  Flow:      { text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", gradient: "from-emerald-500/80 to-emerald-400/40" },
  Sentinel:  { text: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/20",    gradient: "from-blue-500/80 to-blue-400/40" },
  Oracle:    { text: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/20",   gradient: "from-amber-500/80 to-amber-400/40" },
  Nexus:     { text: "text-teal-400",    bg: "bg-teal-400/10",    border: "border-teal-400/20",    gradient: "from-teal-500/80 to-teal-400/40" },
  Cipher:    { text: "text-orange-400",  bg: "bg-orange-400/10",  border: "border-orange-400/20",  gradient: "from-orange-500/80 to-orange-400/40" },
  Spark:     { text: "text-lime-400",    bg: "bg-lime-400/10",    border: "border-lime-400/20",    gradient: "from-lime-500/80 to-lime-400/40" },
  Atlas:     { text: "text-indigo-400",  bg: "bg-indigo-400/10",  border: "border-indigo-400/20",  gradient: "from-indigo-500/80 to-indigo-400/40" },
  Prism:     { text: "text-pink-400",    bg: "bg-pink-400/10",    border: "border-pink-400/20",    gradient: "from-pink-500/80 to-pink-400/40" },
};

const defaultColor = { text: "text-white/40", bg: "bg-white/[0.04]", border: "border-white/[0.06]", gradient: "from-accent/80 to-accent/40" };

// ── Action type config for timeline dots ────────────────────────────────────

const actionTypeConfig: Record<string, { dot: string; label: string }> = {
  plan:             { dot: "bg-violet-400", label: "plan" },
  code:             { dot: "bg-emerald-400", label: "code" },
  test:             { dot: "bg-cyan-400", label: "test" },
  review:           { dot: "bg-amber-400", label: "review" },
  deploy:           { dot: "bg-teal-400", label: "deploy" },
  research:         { dot: "bg-blue-400", label: "research" },
  approval_request: { dot: "bg-orange-400", label: "approval" },
};

// ── Fleet summary stats ─────────────────────────────────────────────────────

interface FleetSummaryProps {
  agents: Agent[];
}

export function FleetSummary({ agents }: FleetSummaryProps) {
  const totalTokens = agents.reduce((sum, a) => sum + a.tokensUsed, 0);
  const totalCost = agents.reduce((sum, a) => sum + a.costUsd, 0);
  const activeCount = agents.filter((a) => a.status === "executing" || a.status === "thinking" || a.status === "awaiting_approval").length;
  const idleCount = agents.filter((a) => a.status === "idle").length;

  const stats = [
    { label: "Total Tokens", value: `${(totalTokens / 1000).toFixed(1)}k`, icon: Cpu, accent: "text-cyan-400" },
    { label: "Sprint Cost", value: `$${totalCost.toFixed(2)}`, icon: DollarSign, accent: "text-emerald-400" },
    { label: "Active Agents", value: `${activeCount}`, icon: Zap, accent: "text-accent" },
    { label: "Idle", value: `${idleCount}`, icon: Pause, accent: "text-white/30" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat, idx) => (
        <div
          key={stat.label}
          className="relative p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden animate-[fadeSlideIn_0.5s_var(--ease-out-expo)_both]"
          style={{ animationDelay: `${idx * 60}ms` }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <div className="flex items-center gap-2 mb-2">
            <stat.icon className={cn("w-3.5 h-3.5", stat.accent)} />
            <span className="text-[10px] text-white/25 uppercase tracking-wider font-medium">{stat.label}</span>
          </div>
          <p className="text-2xl font-bold text-white/90 font-mono tracking-tight">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

// ── Action timeline (last 3 actions) ────────────────────────────────────────

function ActionTimeline({ actions, agentColor }: { actions: AgentAction[]; agentColor: string }) {
  const recent = actions.slice(-3);
  if (recent.length === 0) return null;

  return (
    <div className="space-y-1">
      {recent.map((action, idx) => {
        const conf = actionTypeConfig[action.type] ?? { dot: "bg-white/20", label: action.type };
        const isCurrent = idx === recent.length - 1;

        return (
          <div key={action.id} className="flex items-center gap-2">
            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", conf.dot, isCurrent && "animate-pulse")} />
            <span className={cn(
              "text-[10px] font-mono truncate",
              isCurrent ? "text-white/50" : "text-white/20",
            )}>
              {conf.label}
            </span>
            {isCurrent && (
              <span className={cn("text-[8px] font-bold uppercase tracking-wider shrink-0", agentColor)}>NOW</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Agent fleet card ────────────────────────────────────────────────────────

const AgentFleetCard = memo(function AgentFleetCard({ agent, index }: { agent: Agent; index: number }) {
  const config = statusConfig[agent.status];
  const colors = agentColors[agent.name] ?? defaultColor;
  const isActive = agent.status === "executing" || agent.status === "thinking" || agent.status === "awaiting_approval";

  return (
    <div
      className={cn(
        "relative group flex flex-col p-5 rounded-2xl cursor-default contain-paint",
        "bg-nebula/60 border",
        "transition-[border-color,background-color,box-shadow,transform] duration-300 will-change-transform",
        "hover:-translate-y-0.5 hover:bg-cosmos/80",
        isActive
          ? "border-white/[0.10] shadow-[0_0_24px_rgba(139,92,246,0.06)]"
          : "border-white/[0.06] hover:border-white/[0.10]",
        "animate-[fadeSlideIn_0.5s_var(--ease-out-expo)_both]",
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Top accent gradient bar */}
      <div className={cn("absolute inset-x-0 top-0 h-[2px] rounded-t-2xl bg-gradient-to-r", colors.gradient)} />

      {/* Active glow border */}
      {isActive && <div className="absolute inset-0 rounded-2xl gradient-border pointer-events-none" />}

      {/* Header: avatar + name + role + status badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl text-[11px] font-bold border",
            colors.bg, colors.text, colors.border,
          )}>
            {agent.avatar}
          </div>
          <div>
            <h4 className={cn("text-[14px] font-semibold text-white/90")}>{agent.name}</h4>
            <p className="text-[10px] text-white/30">{roleLabels[agent.role] ?? agent.role}</p>
          </div>
        </div>
        <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium", config.bg, config.color)}>
          {config.pulse ? (
            <span className={cn(
              "inline-flex h-1.5 w-1.5 rounded-full animate-pulse-glow",
              agent.status === "executing" ? "bg-success" : agent.status === "awaiting_approval" ? "bg-warning" : "bg-accent",
            )} />
          ) : (
            <config.icon className="w-3 h-3" />
          )}
          <span>{config.label}</span>
        </div>
      </div>

      {/* Current action — glass sub-panel */}
      {agent.currentAction && (
        <div className="px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] mb-4">
          <p className="text-[11px] font-mono text-white/45 leading-relaxed line-clamp-2">
            &quot;{agent.currentAction}&quot;
          </p>
        </div>
      )}

      {/* Action timeline */}
      {agent.actions.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-3 h-3 text-white/15" />
            <span className="text-[9px] uppercase tracking-[0.1em] text-white/15 font-medium">History</span>
          </div>
          <ActionTimeline actions={agent.actions} agentColor={colors.text} />
        </div>
      )}

      {/* Stats footer */}
      <div className="mt-auto pt-3 border-t border-white/[0.04] flex items-center gap-4 text-[10px] text-white/25">
        <span className="flex items-center gap-1">
          <Cpu className="w-3 h-3" />
          {(agent.tokensUsed / 1000).toFixed(1)}k
        </span>
        <span className="flex items-center gap-1">
          <DollarSign className="w-3 h-3" />
          ${agent.costUsd.toFixed(2)}
        </span>
        <span className="text-white/15 font-mono text-[9px] ml-auto">
          {agent.model.split("-").slice(-2).join("-")}
        </span>
      </div>
    </div>
  );
});

// ── Agent grid — sorted: active first, idle last ────────────────────────────

interface AgentGridProps {
  agents: Agent[];
}

export function AgentGrid({ agents }: AgentGridProps) {
  const sorted = useMemo(() => {
    const priority: Record<AgentStatus, number> = {
      executing: 0,
      thinking: 1,
      awaiting_approval: 2,
      completed: 3,
      failed: 4,
      idle: 5,
    };
    return [...agents].sort((a, b) => priority[a.status] - priority[b.status]);
  }, [agents]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sorted.map((agent, idx) => (
        <AgentFleetCard key={agent.id} agent={agent} index={idx} />
      ))}
    </div>
  );
}

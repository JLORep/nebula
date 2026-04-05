"use client";

import { memo } from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
  Shield,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Terminal,
  Activity,
} from "lucide-react";
import { useBoardStore } from "@/lib/stores/board-store";
import { cn } from "@/lib/utils/cn";
import { AgentTerminal } from "@/components/dashboard/agent-terminal";

// ── Sprint Velocity Sparkline ────────────────────────────────────────────────
const SprintVelocity = memo(function SprintVelocity() {
  const bars = [18, 24, 21, 28, 32, 27, 34];
  const labels = ["S1", "S2", "S3", "S4", "S5", "S6", "S7"];
  const maxVal = Math.max(...bars);

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex items-end gap-1.5 h-20">
        {bars.map((val, idx) => (
          <div
            key={idx}
            className={cn(
              "flex-1 rounded-t-sm transition-[height] duration-700 ease-out",
              idx === bars.length - 1
                ? "bg-gradient-to-t from-accent to-accent/60"
                : "bg-white/[0.08]"
            )}
            style={{ height: `${(val / maxVal) * 100}%` }}
          />
        ))}
      </div>
      <div className="flex gap-1.5 mt-2">
        {labels.map((label, idx) => (
          <span
            key={idx}
            className={cn(
              "flex-1 text-center text-[9px] font-mono",
              idx === labels.length - 1 ? "text-accent/60" : "text-white/15"
            )}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
});

// ── Security Status ──────────────────────────────────────────────────────────
const SecurityStatus = memo(function SecurityStatus() {
  const activeBoard = useBoardStore((s) => s.activeBoard);
  const blockedAgent = activeBoard?.agents.find(a => a.status === "awaiting_approval");

  return (
    <div className="flex flex-col gap-3 h-full">
      {blockedAgent ? (
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-warning/10">
              <AlertTriangle className="w-3.5 h-3.5 text-warning" />
            </div>
            <span className="text-[12px] font-semibold text-warning">Action Required</span>
          </div>
          <p className="text-[11px] text-white/40 leading-relaxed">
            {blockedAgent.currentAction}
          </p>
          <div className="flex gap-2 mt-3">
            <button className="px-3 py-1.5 rounded-lg bg-success/10 border border-success/20 text-[11px] font-medium text-success hover:bg-success/20 transition-colors">
              Approve
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-danger/10 border border-danger/20 text-[11px] font-medium text-danger hover:bg-danger/20 transition-colors">
              Reject
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-success/10 mb-2">
            <Shield className="w-5 h-5 text-success" />
          </div>
          <span className="text-[12px] text-success/70">All Clear</span>
          <span className="text-[10px] text-white/20 mt-0.5">No pending approvals</span>
        </div>
      )}
    </div>
  );
});

// ── Cost Tracker ─────────────────────────────────────────────────────────────
const CostTracker = memo(function CostTracker() {
  const activeBoard = useBoardStore((s) => s.activeBoard);
  const totalCost = activeBoard?.agents.reduce((sum, a) => sum + a.costUsd, 0) ?? 0;
  const totalTokens = activeBoard?.agents.reduce((sum, a) => sum + a.tokensUsed, 0) ?? 0;

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="text-3xl font-bold tracking-[-0.03em] text-white/90">
          <span className="text-white/30 text-lg mr-0.5">$</span>
          {totalCost.toFixed(2)}
        </div>
        <div className="text-[11px] text-white/25 mt-1">Sprint cost so far</div>
      </div>
      <div className="flex items-center gap-4 mt-auto">
        <div>
          <div className="text-[18px] font-semibold text-white/70 font-mono">
            {(totalTokens / 1000).toFixed(0)}k
          </div>
          <div className="text-[10px] text-white/20">Tokens</div>
        </div>
        <div className="w-px h-8 bg-white/[0.06]" />
        <div>
          <div className="text-[18px] font-semibold text-white/70 font-mono">
            {activeBoard?.agents.length ?? 0}
          </div>
          <div className="text-[10px] text-white/20">Agents</div>
        </div>
      </div>
    </div>
  );
});

// ── Task Status Rings ────────────────────────────────────────────────────────
const TaskStatusRings = memo(function TaskStatusRings() {
  const activeBoard = useBoardStore((s) => s.activeBoard);
  const columns = activeBoard?.columns ?? [];

  const statuses = [
    { label: "Done", count: columns.find(c => c.id === "done")?.tasks.length ?? 0, color: "var(--success)" },
    { label: "In Progress", count: columns.find(c => c.id === "in_progress")?.tasks.length ?? 0, color: "var(--accent)" },
    { label: "Review", count: columns.find(c => c.id === "in_review")?.tasks.length ?? 0, color: "var(--warning)" },
    { label: "To Do", count: columns.find(c => c.id === "todo")?.tasks.length ?? 0, color: "var(--info)" },
    { label: "Backlog", count: columns.find(c => c.id === "backlog")?.tasks.length ?? 0, color: "rgba(255,255,255,0.2)" },
  ];

  const total = statuses.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="flex items-center gap-5 h-full">
      <div className="relative w-20 h-20 shrink-0">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          {(() => {
            let offset = 0;
            return statuses.map((s, idx) => {
              const pct = total > 0 ? (s.count / total) * 100 : 0;
              const el = (
                <circle
                  key={idx}
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={`${pct} ${100 - pct}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += pct;
              return el;
            });
          })()}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-white/80">{total}</span>
          <span className="text-[8px] text-white/20 uppercase tracking-wider">Tasks</span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {statuses.filter(s => s.count > 0).map((s, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-[11px] text-white/40">{s.label}</span>
            <span className="text-[11px] font-mono text-white/60 ml-auto">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

// ── Main Grid ────────────────────────────────────────────────────────────────
export function MetricsGrid() {
  const items = [
    {
      title: "Agent Orchestrator",
      description: "Live AI agent activity",
      header: <AgentTerminal />,
      icon: <Terminal className="w-4 h-4 text-accent" />,
      className: "md:col-span-2",
    },
    {
      title: "Security Gate",
      description: "Approval queue",
      header: <SecurityStatus />,
      icon: <Shield className="w-4 h-4 text-warning" />,
      className: "md:col-span-1",
    },
    {
      title: "Task Distribution",
      description: "Current sprint breakdown",
      header: <TaskStatusRings />,
      icon: <Activity className="w-4 h-4 text-cyan-400" />,
      className: "md:col-span-1",
    },
    {
      title: "Sprint Velocity",
      description: "Story points per sprint",
      header: <SprintVelocity />,
      icon: <TrendingUp className="w-4 h-4 text-success" />,
      className: "md:col-span-1",
    },
    {
      title: "Cost Intelligence",
      description: "Token usage & spend",
      header: <CostTracker />,
      icon: <DollarSign className="w-4 h-4 text-accent" />,
      className: "md:col-span-1",
    },
  ];

  return (
    <div className="py-4 pb-8">
      <div className="animate-[fadeSlideIn_0.5s_var(--ease-out-expo)_300ms_both]">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-white/20 font-medium">Mission Control</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>

        <BentoGrid>
          {items.map((item, idx) => (
            <BentoGridItem
              key={idx}
              title={item.title}
              description={item.description}
              header={item.header}
              icon={item.icon}
              className={item.className}
            />
          ))}
        </BentoGrid>
      </div>
    </div>
  );
}

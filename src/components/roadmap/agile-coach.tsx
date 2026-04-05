"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Info,
  AlertOctagon,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { SPRING_GENTLE } from "@/lib/utils/motion";
import { useBoardStore } from "@/lib/stores/board-store";
import { computeSprintHealth, generateInsights, computeBurndown } from "@/lib/utils/agile-coach";
import { AgileGlossary } from "./agile-glossary";
import type { CoachInsightSeverity } from "@/lib/types";

// ── Sprint Health Gauge (SVG radial) ─────────────────────────────────────────
const HealthGauge = memo(function HealthGauge({ score }: { score: number }) {
  const color = score >= 70 ? "var(--success)" : score >= 40 ? "var(--warning)" : "var(--danger)";
  const label = score >= 70 ? "Healthy" : score >= 40 ? "At Risk" : "Critical";
  const circumference = 2 * Math.PI * 42;
  const filled = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {/* Background ring */}
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
          {/* Score ring */}
          <circle
            cx="50" cy="50" r="42" fill="none"
            stroke={color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference - filled}`}
            className="transition-[stroke-dasharray] duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white/90">{score}</span>
          <span className="text-[9px] uppercase tracking-wider text-white/30">{label}</span>
        </div>
      </div>
    </div>
  );
});

// ── Velocity Sparkline ───────────────────────────────────────────────────────
const VelocitySparkline = memo(function VelocitySparkline() {
  const bars = [18, 24, 21, 28, 32, 27, 34];
  const labels = ["S1", "S2", "S3", "S4", "S5", "S6", "S7"];
  const maxVal = Math.max(...bars);

  return (
    <div className="flex flex-col h-full justify-between">
      <span className="text-[10px] text-white/25 uppercase tracking-wider font-medium mb-2">Velocity Trend</span>
      <div className="flex items-end gap-1.5 h-16">
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
      <div className="flex gap-1.5 mt-1.5">
        {labels.map((label, idx) => (
          <span
            key={idx}
            className={cn(
              "flex-1 text-center text-[8px] font-mono",
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

// ── Mini Burndown Chart ──────────────────────────────────────────────────────
const BurndownChart = memo(function BurndownChart({ data }: { data: { day: number; ideal: number; actual: number }[] }) {
  if (data.length === 0) return null;

  const maxVal = data[0].ideal;
  const maxDay = data.length - 1;
  const w = 200;
  const h = 80;
  const pad = 4;

  const toX = (d: number) => pad + (d / maxDay) * (w - pad * 2);
  const toY = (v: number) => pad + (1 - v / maxVal) * (h - pad * 2);

  // Ideal line
  const idealPath = `M ${toX(0)} ${toY(data[0].ideal)} L ${toX(maxDay)} ${toY(0)}`;

  // Actual line (only up to current day)
  const actualPoints = data.filter((d) => d.actual >= 0);
  const actualPath = actualPoints.length > 1
    ? actualPoints.map((d, i) => `${i === 0 ? "M" : "L"} ${toX(d.day)} ${toY(d.actual)}`).join(" ")
    : "";

  return (
    <div>
      <span className="text-[10px] text-white/25 uppercase tracking-wider font-medium block mb-2">Burndown</span>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((pct) => (
          <line key={pct} x1={pad} y1={toY(maxVal * pct)} x2={w - pad} y2={toY(maxVal * pct)} stroke="rgba(255,255,255,0.04)" />
        ))}
        {/* Ideal */}
        <path d={idealPath} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeDasharray="4 3" />
        {/* Actual */}
        {actualPath && (
          <path d={actualPath} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {/* Current point */}
        {actualPoints.length > 0 && (
          <circle
            cx={toX(actualPoints[actualPoints.length - 1].day)}
            cy={toY(actualPoints[actualPoints.length - 1].actual)}
            r="3" fill="var(--accent)" className="animate-pulse-glow"
          />
        )}
      </svg>
    </div>
  );
});

// ── Coaching Insights ────────────────────────────────────────────────────────
const SEVERITY_CONFIG: Record<CoachInsightSeverity, { icon: typeof Info; color: string; bg: string }> = {
  info: { icon: Info, color: "text-blue-400", bg: "bg-blue-400/10" },
  success: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  critical: { icon: AlertOctagon, color: "text-danger", bg: "bg-danger/10" },
};

// ── Main Agile Coach Component ───────────────────────────────────────────────
export function AgileCoach() {
  const activeProject = useBoardStore((s) => s.activeProject);

  const activeSprint = activeProject?.sprints.find((s) => s.status === "active");
  const allTasks = useMemo(
    () => activeProject?.boards.flatMap((b) => b.columns.flatMap((c) => c.tasks)) ?? [],
    [activeProject]
  );

  const health = useMemo(
    () => (activeSprint ? computeSprintHealth(activeSprint, allTasks) : 50),
    [activeSprint, allTasks]
  );

  const insights = useMemo(
    () => (activeProject ? generateInsights(activeProject, allTasks) : []),
    [activeProject, allTasks]
  );

  const burndown = useMemo(
    () => (activeSprint ? computeBurndown(activeSprint, allTasks) : []),
    [activeSprint, allTasks]
  );

  if (!activeProject) return null;

  return (
    <div className="px-4 md:px-8 py-4 pb-16">
      {/* Section divider */}
      <div className="flex items-center gap-3 mb-6 max-w-7xl mx-auto">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-white/20 font-medium">AI Scrum Master</span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, ...SPRING_GENTLE }}
        className="max-w-7xl mx-auto"
      >
        {/* BentoGrid-style layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {/* Sprint Health Dashboard — span 2 */}
          <div className="md:col-span-2 rounded-2xl border border-white/[0.06] bg-nebula/80 p-5 relative overflow-hidden">
            <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-accent" />
              <span className="text-[14px] font-semibold text-white/90">Sprint Health</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Gauge */}
              <HealthGauge score={health} />

              {/* Velocity */}
              <VelocitySparkline />

              {/* Burndown */}
              <BurndownChart data={burndown} />
            </div>
          </div>

          {/* Coaching Insights — span 1 */}
          <div className="md:col-span-1 rounded-2xl border border-white/[0.06] bg-nebula/80 p-5 relative overflow-hidden">
            <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-warning" />
              <span className="text-[14px] font-semibold text-white/90">Coaching Insights</span>
            </div>

            <div className="space-y-2.5 max-h-[280px] overflow-y-auto scrollbar-thin">
              {insights.map((insight) => {
                const config = SEVERITY_CONFIG[insight.severity];
                const Icon = config.icon;
                return (
                  <div key={insight.id} className="flex items-start gap-2.5 p-2 rounded-lg bg-white/[0.02]">
                    <div className={cn("flex items-center justify-center w-5 h-5 rounded-md shrink-0 mt-0.5", config.bg)}>
                      <Icon className={cn("w-3 h-3", config.color)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-white/50 leading-relaxed">{insight.message}</p>
                      {insight.actionable && insight.action && (
                        <p className="text-[10px] text-accent/50 mt-1 leading-relaxed">
                          → {insight.action}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              {insights.length === 0 && (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-6 h-6 text-success/40 mx-auto mb-2" />
                  <span className="text-[11px] text-white/25">All clear — sprint is on track</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Agile Glossary */}
        <div className="rounded-2xl border border-white/[0.06] bg-nebula/80 p-5 relative overflow-hidden">
          <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
          <AgileGlossary />
        </div>
      </motion.div>
    </div>
  );
}

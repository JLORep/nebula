"use client";

import { useMemo, memo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Bot,
  FileCode,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
  Activity,
  Layers,
  Search,
  GitPullRequest,
  Terminal,
  Eye,
  ChevronRight,
} from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";
import { Meteors } from "@/components/ui/meteors";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { cn } from "@/lib/utils/cn";
import { useBoardStore } from "@/lib/stores/board-store";
import { useSimulation } from "@/lib/hooks/use-simulation";
import { SPRING } from "@/lib/utils/motion";
import type { Project, Task } from "@/lib/types";

// ── Simulated scanner data ───────────────────────────────────────────────────

interface ScanViolation {
  id: string;
  ruleId: string;
  ruleName: string;
  category: ScanCategory;
  severity: "critical" | "high" | "medium" | "low";
  file: string;
  line: number;
  message: string;
  projectKey: string;
  projectColor: string;
  status: "open" | "fixing" | "in_review" | "resolved";
  agentName: string | null;
  confidence: number;
}

type ScanCategory =
  | "architecture"
  | "type_safety"
  | "data_layer"
  | "security"
  | "code_quality"
  | "frontend"
  | "infrastructure"
  | "safety_gates";

const CATEGORY_META: Record<
  ScanCategory,
  { label: string; color: string; icon: typeof Shield }
> = {
  architecture: { label: "Architecture", color: "#8b5cf6", icon: Layers },
  type_safety: { label: "Type Safety", color: "#f59e0b", icon: ShieldAlert },
  data_layer: { label: "Data Layer", color: "#06b6d4", icon: Activity },
  security: { label: "Security", color: "#ef4444", icon: ShieldCheck },
  code_quality: { label: "Code Quality", color: "#34d399", icon: FileCode },
  frontend: { label: "Frontend", color: "#a78bfa", icon: Eye },
  infrastructure: { label: "Infrastructure", color: "#60a5fa", icon: Terminal },
  safety_gates: { label: "Safety Gates", color: "#fbbf24", icon: Shield },
};

const SEVERITY_CONFIG = {
  critical: { label: "Critical", color: "text-danger", bg: "bg-danger/10", border: "border-danger/20" },
  high: { label: "High", color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" },
  medium: { label: "Medium", color: "text-white/40", bg: "bg-white/[0.04]", border: "border-white/[0.08]" },
  low: { label: "Low", color: "text-white/25", bg: "bg-white/[0.02]", border: "border-white/[0.06]" },
};

function generateViolations(projects: Project[]): ScanViolation[] {
  const violations: ScanViolation[] = [];
  const agentNames = ["Sentinel", "Oracle", "Forge", "Athena", "Blueprint"];

  const templates: Array<{
    ruleId: string;
    ruleName: string;
    category: ScanCategory;
    severity: ScanViolation["severity"];
    message: string;
    file: string;
  }> = [
    { ruleId: "SEC-1", ruleName: "SQL Injection Risk", category: "security", severity: "critical", message: "Unparameterized query detected in user-facing endpoint", file: "src/api/users/query.ts" },
    { ruleId: "SEC-2", ruleName: "Hardcoded Secret", category: "security", severity: "critical", message: "API key found in source — must use vault", file: "src/config/integrations.ts" },
    { ruleId: "ARCH-1", ruleName: "Store Cross-Mutation", category: "architecture", severity: "critical", message: "UserStore directly mutates SessionStore state", file: "src/stores/user-store.ts" },
    { ruleId: "ARCH-3", ruleName: "Circular Dependency", category: "architecture", severity: "high", message: "Circular import chain: auth → session → auth", file: "src/modules/auth/index.ts" },
    { ruleId: "TYPE-1", ruleName: "Missing Type Guard", category: "type_safety", severity: "high", message: "API response accessed without instanceof check", file: "src/api/payments/handler.ts" },
    { ruleId: "TYPE-2", ruleName: "Unsafe Coercion", category: "type_safety", severity: "high", message: "parseFloat on unvalidated user input", file: "src/utils/currency.ts" },
    { ruleId: "DATA-1", ruleName: "N+1 Query", category: "data_layer", severity: "high", message: "Loop executes individual queries — use batch", file: "src/services/reports.ts" },
    { ruleId: "DATA-3", ruleName: "Missing TTL", category: "data_layer", severity: "medium", message: "Cache entry set without TTL — risks stale data", file: "src/cache/session-cache.ts" },
    { ruleId: "GATE-1", ruleName: "Safety Gate Bypass", category: "safety_gates", severity: "critical", message: "Approval gate downgraded from BLOCK to WARN", file: "src/agents/executor.ts" },
    { ruleId: "GATE-2", ruleName: "Missing Approval Check", category: "safety_gates", severity: "high", message: "Deployment action has no approval gate configured", file: "src/agents/deployer.ts" },
    { ruleId: "FE-1", ruleName: "Logic in Component", category: "frontend", severity: "medium", message: "Business logic in React component — extract to store", file: "src/components/dashboard/chart.tsx" },
    { ruleId: "FE-3", ruleName: "Polling Instead of SSE", category: "frontend", severity: "high", message: "setInterval polling — use SSE for real-time data", file: "src/hooks/use-metrics.ts" },
    { ruleId: "QUAL-1", ruleName: "Duplicate Logic", category: "code_quality", severity: "medium", message: "Date formatting duplicated in 4 files — extract utility", file: "src/utils/format.ts" },
    { ruleId: "QUAL-2", ruleName: "Dead Export", category: "code_quality", severity: "low", message: "Exported function has zero import references", file: "src/lib/legacy/helpers.ts" },
    { ruleId: "INFRA-1", ruleName: "Missing Env Var", category: "infrastructure", severity: "high", message: "DATABASE_URL referenced but not in .env.example", file: "src/db/connection.ts" },
    { ruleId: "INFRA-2", ruleName: "Hardcoded Port", category: "infrastructure", severity: "medium", message: "Port 3000 hardcoded — use environment variable", file: "src/server.ts" },
  ];

  let idx = 0;
  for (const project of projects) {
    const count = Math.min(templates.length, 5 + Math.floor(idx * 1.5));
    for (let i = 0; i < count && i < templates.length; i++) {
      const t = templates[(idx * 3 + i) % templates.length];
      const isActive = t.severity === "critical" || t.severity === "high";
      const statuses: ScanViolation["status"][] = ["open", "fixing", "in_review", "resolved"];
      const status = isActive
        ? statuses[Math.floor((idx + i) * 7.3) % 3] as ScanViolation["status"]
        : i % 3 === 0 ? "resolved" : "open";

      violations.push({
        id: `v-${project.key}-${i}`,
        ruleId: t.ruleId,
        ruleName: t.ruleName,
        category: t.category,
        severity: t.severity,
        file: t.file,
        line: 42 + i * 17,
        message: t.message,
        projectKey: project.key,
        projectColor: project.color,
        status,
        agentName: status === "fixing" || status === "in_review" ? agentNames[i % agentNames.length] : null,
        confidence: 85 + (i * 3) % 15,
      });
    }
    idx++;
  }

  return violations;
}

// ── Health score ring ────────────────────────────────────────────────────────

function HealthRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const grade =
    score >= 90 ? "A" : score >= 80 ? "B+" : score >= 70 ? "B" : score >= 60 ? "C" : "D";
  const color =
    score >= 80 ? "var(--success)" : score >= 60 ? "var(--warning)" : "var(--danger)";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...SPRING, delay: 0.3 }}
      className="relative"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={6}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
          style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white tracking-tight">{score}</span>
        <span className="text-[11px] font-mono text-white/30">{grade}</span>
      </div>
    </motion.div>
  );
}

// ── Stat pill ────────────────────────────────────────────────────────────────

function ScanStat({
  label,
  value,
  icon: Icon,
  color,
  delay,
}: {
  label: string;
  value: string | number;
  icon: typeof Shield;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.02]"
    >
      <Icon className="w-4 h-4 shrink-0" style={{ color }} />
      <div>
        <span className="text-lg font-bold text-white">{value}</span>
        <p className="text-[10px] text-white/25 uppercase tracking-[0.08em]">{label}</p>
      </div>
    </motion.div>
  );
}

// ── Violation row ────────────────────────────────────────────────────────────

const ViolationRow = memo(function ViolationRow({
  v,
  index,
}: {
  v: ScanViolation;
  index: number;
}) {
  const sev = SEVERITY_CONFIG[v.severity];
  const cat = CATEGORY_META[v.category];
  const CatIcon = cat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay: Math.min(index * 0.025, 0.5) }}
      className={cn(
        "group flex items-center gap-3 px-4 py-3 rounded-xl border transition-[background-color,border-color] duration-200",
        v.status === "fixing"
          ? "bg-accent/[0.03] border-accent/15"
          : v.severity === "critical" && v.status === "open"
            ? "bg-danger/[0.03] border-danger/15"
            : "bg-white/[0.015] border-white/[0.06] hover:bg-white/[0.03] hover:border-white/[0.10]",
      )}
    >
      {/* Category icon */}
      <div
        className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0 border"
        style={{ backgroundColor: `${cat.color}15`, borderColor: `${cat.color}25` }}
      >
        <CatIcon className="w-3.5 h-3.5" style={{ color: cat.color }} />
      </div>

      {/* Project dot + rule */}
      <div className="flex items-center gap-1.5 shrink-0 min-w-[80px]">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: v.projectColor }} />
        <span className="text-[10px] font-mono text-white/30">{v.ruleId}</span>
      </div>

      {/* Message */}
      <div className="min-w-0 flex-1">
        <span className={cn(
          "text-[12px] truncate block",
          v.status === "resolved" ? "text-white/20 line-through" : "text-white/65",
        )}>
          {v.message}
        </span>
        <span className="text-[10px] text-white/15 font-mono">{v.file}:{v.line}</span>
      </div>

      {/* Status */}
      <div className="flex items-center gap-1.5 shrink-0">
        {v.status === "resolved" ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-success/50" />
        ) : v.status === "fixing" ? (
          <Zap className="w-3.5 h-3.5 text-accent animate-pulse" />
        ) : v.status === "in_review" ? (
          <GitPullRequest className="w-3.5 h-3.5 text-info/60" />
        ) : (
          <Clock className="w-3.5 h-3.5 text-white/15" />
        )}
        <span className={cn(
          "text-[10px] font-medium",
          v.status === "resolved" ? "text-success/40" :
          v.status === "fixing" ? "text-accent" :
          v.status === "in_review" ? "text-info/60" : "text-white/20",
        )}>
          {v.status === "fixing" ? "Agent Fixing" : v.status === "in_review" ? "In Review" : v.status === "resolved" ? "Resolved" : "Open"}
        </span>
      </div>

      {/* Agent badge */}
      {v.agentName && (
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent/10 border border-accent/20 shrink-0">
          <Bot className="w-3 h-3 text-accent" />
          <span className="text-[9px] font-semibold text-accent">{v.agentName}</span>
        </div>
      )}

      {/* Severity */}
      <span className={cn(
        "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 border",
        sev.bg, sev.border, sev.color,
      )}>
        {v.severity}
      </span>

      {/* Confidence */}
      <span className="text-[9px] font-mono text-white/15 shrink-0 w-8 text-right">{v.confidence}%</span>

      <ChevronRight className="w-3.5 h-3.5 text-white/10 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
});

// ── Pipeline step ────────────────────────────────────────────────────────────

function PipelineStep({
  icon: Icon,
  label,
  description,
  color,
  delay,
  active,
}: {
  icon: typeof Shield;
  label: string;
  description: string;
  color: string;
  delay: number;
  active?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay }}
      className={cn(
        "relative flex flex-col items-center text-center px-3 py-4 rounded-xl border",
        active
          ? "bg-accent/[0.05] border-accent/20"
          : "bg-white/[0.02] border-white/[0.06]",
      )}
    >
      <div
        className="flex items-center justify-center w-10 h-10 rounded-xl mb-2 border"
        style={{ backgroundColor: `${color}15`, borderColor: `${color}25` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <span className="text-[12px] font-semibold text-white/80 mb-0.5">{label}</span>
      <span className="text-[10px] text-white/25 leading-relaxed">{description}</span>
      {active && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-40" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-accent" />
        </span>
      )}
    </motion.div>
  );
}

// ── Detector rules data ──────────────────────────────────────────────────────

interface DetectorRule {
  id: string;
  name: string;
  severity: "critical" | "high" | "medium";
  description: string;
}

const DETECTOR_RULES: Record<ScanCategory, DetectorRule[]> = {
  architecture: [
    { id: "A1", name: "Store Boundary Violations", severity: "critical", description: "One store directly mutates another store's state" },
    { id: "A2", name: "Circular Dependency Chains", severity: "critical", description: "Import cycle causes undefined at runtime" },
    { id: "A3", name: "Orchestrator Bypass", severity: "critical", description: "AI operations called directly instead of through orchestrator" },
    { id: "A4", name: "Layer Skipping", severity: "high", description: "Component talks directly to data layer, skipping service" },
    { id: "A5", name: "Ownership Violations", severity: "high", description: "Module modifies files it doesn't own" },
  ],
  type_safety: [
    { id: "B1", name: "Implicit Any", severity: "critical", description: "Untyped variables propagate through the codebase" },
    { id: "B2", name: "Missing Type Guards", severity: "high", description: "API response accessed without runtime validation" },
    { id: "B3", name: "Unsafe Coercion", severity: "high", description: "parseFloat/parseInt on unvalidated external input" },
    { id: "B4", name: "Property Access Guards", severity: "high", description: "Deep property access without optional chaining" },
    { id: "B5", name: "Exhaustive Switch", severity: "high", description: "Switch on union type missing case handlers" },
  ],
  data_layer: [
    { id: "C1", name: "Atomic State Updates", severity: "critical", description: "Multi-field updates that aren't batched atomically" },
    { id: "C2", name: "N+1 Query Detection", severity: "high", description: "Loop executing individual queries instead of batch" },
    { id: "C3", name: "Cache TTL Enforcement", severity: "high", description: "Cache entries set without TTL — stale data forever" },
    { id: "C4", name: "Query Optimization", severity: "high", description: "SELECT *, missing LIMIT, full table scans" },
    { id: "C5", name: "Error Caching Prevention", severity: "high", description: "Caching error responses poisons cache for TTL duration" },
  ],
  security: [
    { id: "D1", name: "SQL/NoSQL Injection", severity: "critical", description: "Query built with string interpolation of external input" },
    { id: "D2", name: "Hardcoded Secrets", severity: "critical", description: "API keys, passwords, or tokens in source code" },
    { id: "D3", name: "Session Security", severity: "critical", description: "Missing HttpOnly, Secure, or SameSite flags" },
    { id: "D4", name: "Path Traversal", severity: "high", description: "User input in file paths without containment check" },
    { id: "D5", name: "Vulnerable Dependencies", severity: "high", description: "Known CVEs in direct or transitive dependencies" },
  ],
  code_quality: [
    { id: "E1", name: "Logging Standards", severity: "high", description: "console.log in production — use structured logger" },
    { id: "E2", name: "API Contract Validation", severity: "high", description: "API responses used without schema validation" },
    { id: "E3", name: "Fallback Chain Integrity", severity: "high", description: "Fallback handler can throw, cascading failure" },
    { id: "E4", name: "Dead Code Detection", severity: "medium", description: "Exported symbols with zero import references" },
    { id: "E5", name: "Duplicate Logic", severity: "medium", description: "AST-similar functions that should be extracted" },
  ],
  frontend: [
    { id: "F1", name: "Component Boundaries", severity: "high", description: "Business logic in components — extract to store" },
    { id: "F2", name: "State Management Compliance", severity: "high", description: "Direct localStorage/sessionStorage from components" },
    { id: "F3", name: "Hook Rules", severity: "critical", description: "Conditional hooks, stale closures, missing deps" },
    { id: "F4", name: "Circular Imports", severity: "critical", description: "Import cycle causes undefined at initialization" },
    { id: "F5", name: "Render Performance", severity: "medium", description: "Inline objects as props causing unnecessary re-renders" },
  ],
  infrastructure: [
    { id: "G1", name: "Environment Variable Safety", severity: "high", description: "process.env access without startup validation" },
    { id: "G2", name: "Hardcoded Configuration", severity: "medium", description: "Ports, hostnames, timeouts that differ per environment" },
    { id: "G3", name: "CI/CD Validation", severity: "high", description: "Pipeline missing required steps: lint, test, scan" },
    { id: "G4", name: "Container Safety", severity: "medium", description: "Dockerfile anti-patterns: latest tags, root user" },
    { id: "G5", name: "API Versioning", severity: "high", description: "Breaking API changes without version bump" },
  ],
  safety_gates: [
    { id: "H1", name: "Approval Gate Enforcement", severity: "critical", description: "High-risk agent action without approval gate" },
    { id: "H2", name: "Gate Downgrade Detection", severity: "critical", description: "Safety gate strictness reduced — guardrails disappearing" },
    { id: "H3", name: "Threshold Guard Validation", severity: "high", description: "Cost/rate limit exceeded but execution continues" },
    { id: "H4", name: "Audit Trail Completeness", severity: "high", description: "Agent action missing required audit fields" },
    { id: "H5", name: "Rollback Path Validation", severity: "high", description: "Irreversible action without documented rollback" },
  ],
};

// ── Detector category card ──────────────────────────────────────────────────

function DetectorCard({ category, delay }: { category: ScanCategory; delay: number }) {
  const [expanded, setExpanded] = useState(false);
  const meta = CATEGORY_META[category];
  const rules = DETECTOR_RULES[category];
  const CatIcon = meta.icon;
  const critCount = rules.filter((r) => r.severity === "critical").length;
  const highCount = rules.filter((r) => r.severity === "high").length;

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay }}
      onClick={() => setExpanded(!expanded)}
      className={cn(
        "w-full text-left rounded-xl border transition-[border-color,background-color] duration-200",
        expanded
          ? "bg-white/[0.03] border-white/[0.12]"
          : "bg-white/[0.015] border-white/[0.06] hover:bg-white/[0.03] hover:border-white/[0.10]",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 border"
          style={{ backgroundColor: `${meta.color}15`, borderColor: `${meta.color}25` }}
        >
          <CatIcon className="w-4 h-4" style={{ color: meta.color }} />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[13px] font-semibold text-white/80 block">{meta.label}</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-mono text-white/20">{rules.length} rules</span>
            {critCount > 0 && (
              <span className="text-[9px] font-bold text-danger/70 bg-danger/10 px-1 rounded">
                {critCount} CRIT
              </span>
            )}
            {highCount > 0 && (
              <span className="text-[9px] font-bold text-warning/70 bg-warning/10 px-1 rounded">
                {highCount} HIGH
              </span>
            )}
          </div>
        </div>
        <ChevronRight
          className={cn(
            "w-3.5 h-3.5 text-white/15 transition-transform duration-200",
            expanded && "rotate-90",
          )}
        />
      </div>

      {/* Expanded rules */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pt-0 space-y-1.5 border-t border-white/[0.04]">
              {rules.map((rule) => {
                const sev = SEVERITY_CONFIG[rule.severity];
                return (
                  <div key={rule.id} className="flex items-start gap-2 py-1.5">
                    <span
                      className={cn(
                        "text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded shrink-0 mt-0.5 border",
                        sev.bg, sev.border, sev.color,
                      )}
                    >
                      {rule.severity === "critical" ? "CRIT" : rule.severity === "high" ? "HIGH" : "MED"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-medium text-white/60 block">
                        {rule.id} — {rule.name}
                      </span>
                      <span className="text-[10px] text-white/25 leading-relaxed block">
                        {rule.description}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ── Category breakdown bar ───────────────────────────────────────────────────

function CategoryBar({
  violations,
}: {
  violations: ScanViolation[];
}) {
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const v of violations) {
      map[v.category] = (map[v.category] ?? 0) + 1;
    }
    return Object.entries(map)
      .map(([cat, count]) => ({
        category: cat as ScanCategory,
        count,
        meta: CATEGORY_META[cat as ScanCategory],
      }))
      .sort((a, b) => b.count - a.count);
  }, [violations]);

  const total = violations.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.4 }}
      className="space-y-2"
    >
      {counts.map((c) => {
        const pct = total > 0 ? Math.round((c.count / total) * 100) : 0;
        return (
          <div key={c.category} className="flex items-center gap-3">
            <span className="text-[11px] text-white/40 w-24 truncate">{c.meta.label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: c.meta.color }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.8 }}
              />
            </div>
            <span className="text-[10px] font-mono text-white/25 w-8 text-right">{c.count}</span>
          </div>
        );
      })}
    </motion.div>
  );
}

// ── Live terminal ────────────────────────────────────────────────────────────

function ScanTerminal() {
  const [lines, setLines] = useState<string[]>([]);
  const termRef = useRef<HTMLDivElement>(null);

  const scanLines = [
    "$ nebula scan --deep",
    "",
    "Nebula Scanner v1.0.0 — Forge Sentinel",
    "Scanning 6 projects, 2,847 files...",
    "",
    "  [DETECT] AST parsing .................... 2,847 files cached",
    "  [DETECT] 30 detectors dispatched (8 workers)",
    "",
    "  [!!] SEC-1  SQL Injection Risk         src/api/users/query.ts:42",
    "  [!!] GATE-1 Safety Gate Bypass         src/agents/executor.ts:118",
    "  [!!] ARCH-1 Store Cross-Mutation       src/stores/user-store.ts:67",
    "  [!]  TYPE-1 Missing Type Guard         src/api/payments/handler.ts:93",
    "  [!]  DATA-1 N+1 Query                  src/services/reports.ts:156",
    "  [!]  FE-3   Polling Instead of SSE     src/hooks/use-metrics.ts:22",
    "  [~]  QUAL-1 Duplicate Logic            src/utils/format.ts:44",
    "  [.]  QUAL-2 Dead Export                src/lib/legacy/helpers.ts:8",
    "",
    "  Violations: 3 critical, 8 high, 12 medium, 4 low",
    "  Health Score: 82/100 (B+)",
    "  Scan time: 3.2s (cached)",
    "",
    "  [TRIAGE] 3 critical → tickets created (human_required)",
    "  [TRIAGE] 8 high → tickets created (team_review)",
    "  [ASSIGN] Sentinel agent → SEC-1, SEC-2",
    "  [ASSIGN] Forge agent → ARCH-1, ARCH-3",
    "  [ASSIGN] Oracle agent → TYPE-1, TYPE-2",
    "",
    "  Scan complete. 11 tickets created. 3 agents assigned.",
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < scanLines.length) {
        const line = scanLines[i];
        i++;
        setLines((prev) => [...prev, line]);
        if (termRef.current) {
          termRef.current.scrollTop = termRef.current.scrollHeight;
        }
      } else {
        clearInterval(interval);
      }
    }, 120);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay: 0.4 }}
      className="rounded-2xl border border-white/[0.08] bg-void/80 overflow-hidden"
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-danger/60" />
          <div className="w-3 h-3 rounded-full bg-warning/60" />
          <div className="w-3 h-3 rounded-full bg-success/60" />
        </div>
        <span className="text-[11px] font-mono text-white/25 ml-2">nebula-scanner</span>
      </div>
      {/* Output */}
      <div ref={termRef} className="p-4 h-[320px] overflow-y-auto scrollbar-none font-mono text-[11px] leading-[1.7]">
        {lines.map((line, i) => (
          <div
            key={i}
            className={cn(
              "terminal-line-new",
              line.includes("[!!]") && "text-danger/80",
              line.includes("[!]") && !line.includes("[!!]") && "text-warning/70",
              line.includes("[~]") && "text-white/30",
              line.includes("[.]") && "text-white/20",
              line.includes("[DETECT]") && "text-accent/60",
              line.includes("[TRIAGE]") && "text-info/60",
              line.includes("[ASSIGN]") && "text-success/60",
              line.includes("Health Score") && "text-success/80 font-semibold",
              line.startsWith("$") && "text-white/50",
              line.startsWith("Nebula") && "text-accent/80 font-semibold",
              !line.includes("[") && !line.startsWith("$") && !line.startsWith("Nebula") && !line.includes("Violations") && !line.includes("Health") && !line.includes("Scan") && "text-white/20",
            )}
          >
            {line || "\u00A0"}
          </div>
        ))}
        <span className="inline-block w-2 h-4 bg-accent/60 animate-blink ml-0.5" />
      </div>
    </motion.div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function ScannerPage() {
  useSimulation();

  const projects = useBoardStore((s) => s.projects);
  const violations = useMemo(() => generateViolations(projects), [projects]);

  const criticalCount = violations.filter((v) => v.severity === "critical").length;
  const highCount = violations.filter((v) => v.severity === "high").length;
  const fixingCount = violations.filter((v) => v.status === "fixing").length;
  const resolvedCount = violations.filter((v) => v.status === "resolved").length;
  const totalFiles = 2847;
  const healthScore = 82;

  const openViolations = violations.filter((v) => v.status !== "resolved");

  return (
    <main className="relative z-10 min-h-screen">
      {/* ── Hero ── */}
      <div className="relative min-h-[40vh] flex flex-col items-center justify-center overflow-hidden px-4 pt-20">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(139, 92, 246, 0.15)" />
        <div className="hidden md:block">
          <Spotlight className="-top-40 right-60 md:-top-20" fill="rgba(6, 182, 212, 0.08)" />
        </div>
        <Meteors number={4} className="z-0 hidden sm:block" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl w-full">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.1 }}
            className="mb-5"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5">
              <Shield className="w-3.5 h-3.5 text-accent" />
              <span className="text-[12px] font-semibold tracking-[0.08em] text-accent uppercase">
                Forge Sentinel
              </span>
              <div className="w-px h-3 bg-white/10" />
              <span className="text-[12px] font-mono text-white/30">
                {criticalCount} critical
              </span>
            </div>
          </motion.div>

          {/* Title */}
          <TextGenerateEffect
            words="Nebula Scanner"
            className="text-3xl sm:text-5xl md:text-7xl tracking-[-0.04em] leading-[1.1] mb-3"
            duration={0.4}
          />

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="text-sm sm:text-lg md:text-xl font-medium leading-relaxed mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white/80 via-accent to-cyan-400"
          >
            Detect. Triage. Remediate. Autonomously.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="text-white/30 text-sm max-w-lg leading-relaxed"
          >
            Enterprise code compliance that doesn&apos;t just find problems — it creates
            tickets, assigns AI agents, and fixes them through your approval gates.
          </motion.p>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-void to-transparent" />
      </div>

      {/* ── Pipeline visualization ── */}
      <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <span className="text-[11px] uppercase tracking-[0.15em] text-white/20 font-medium">The Loop</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <PipelineStep icon={Search} label="Scan" description="AST-aware detection across every file" color="#8b5cf6" delay={0.2} active />
          <PipelineStep icon={AlertTriangle} label="Detect" description="30+ specialized detectors in parallel" color="#f59e0b" delay={0.25} active />
          <PipelineStep icon={Layers} label="Triage" description="Context-aware severity classification" color="#06b6d4" delay={0.3} />
          <PipelineStep icon={FileCode} label="Ticket" description="Auto-create on your Nebula board" color="#60a5fa" delay={0.35} />
          <PipelineStep icon={Bot} label="Fix" description="AI agent generates targeted repair" color="#34d399" delay={0.4} />
          <PipelineStep icon={ShieldCheck} label="Gate" description="Approval gate enforces human review" color="#f87171" delay={0.45} />
        </div>

        {/* Arrow connector for md+ */}
        <div className="hidden md:flex items-center justify-center gap-0 mt-2 px-8">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-1 flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-white/10" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Detector Grid ── */}
      <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <span className="text-[11px] uppercase tracking-[0.15em] text-white/20 font-medium">
            40 Rules &middot; 8 Categories
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(Object.keys(DETECTOR_RULES) as ScanCategory[]).map((cat, i) => (
            <DetectorCard key={cat} category={cat} delay={0.1 + i * 0.04} />
          ))}
        </div>
      </div>

      {/* ── Health + Terminal split ── */}
      <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
          {/* Left: Health score + stats */}
          <div className="flex flex-col items-center gap-4">
            <HealthRing score={healthScore} />

            <div className="w-full space-y-2">
              <ScanStat label="Critical" value={criticalCount} icon={ShieldAlert} color="var(--danger)" delay={0.3} />
              <ScanStat label="High" value={highCount} icon={AlertTriangle} color="var(--warning)" delay={0.35} />
              <ScanStat label="Agents Fixing" value={fixingCount} icon={Bot} color="var(--accent)" delay={0.4} />
              <ScanStat label="Resolved" value={resolvedCount} icon={CheckCircle2} color="var(--success)" delay={0.45} />
              <ScanStat label="Files Scanned" value={totalFiles.toLocaleString()} icon={FileCode} color="var(--cyan)" delay={0.5} />
            </div>

            {/* Category breakdown */}
            <div className="w-full mt-2">
              <span className="text-[10px] uppercase tracking-[0.12em] text-white/20 font-medium mb-2 block">
                By Category
              </span>
              <CategoryBar violations={violations} />
            </div>
          </div>

          {/* Right: Live terminal */}
          <ScanTerminal />
        </div>
      </div>

      {/* ── Violation feed ── */}
      <div className="px-4 md:px-8 py-8 pb-16 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-white/20" />
            <span className="text-[11px] uppercase tracking-[0.15em] text-white/20 font-medium">
              Live Findings — {openViolations.length} open across {projects.length} projects
            </span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>

        <div className="space-y-1.5">
          {openViolations.map((v, i) => (
            <ViolationRow key={v.id} v={v} index={i} />
          ))}
        </div>
      </div>
    </main>
  );
}

"use client";

import { useMemo, memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  Zap,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Bot,
  Filter,
} from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";
import { Meteors } from "@/components/ui/meteors";
import { cn } from "@/lib/utils/cn";
import { useBoardStore } from "@/lib/stores/board-store";
import { useSimulation } from "@/lib/hooks/use-simulation";
import type { Task, ApprovalGate, Project } from "@/lib/types";
import { SPRING } from "@/lib/utils/motion";

// ── Types ────────────────────────────────────────────────────────────────────

type GateFilter = "all" | ApprovalGate;

interface GateTask extends Task {
  projectName: string;
  projectKey: string;
  projectColor: string;
}

// ── Gate config ──────────────────────────────────────────────────────────────

const GATE_CONFIG: Record<
  ApprovalGate,
  { label: string; description: string; icon: typeof ShieldCheck; color: string; bgColor: string; borderColor: string }
> = {
  auto: {
    label: "Auto-Approve",
    description: "AI proceeds autonomously — no human checkpoint",
    icon: Zap,
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success/20",
  },
  human_required: {
    label: "Human Required",
    description: "Must be approved by a designated human before AI can proceed",
    icon: ShieldAlert,
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/20",
  },
  team_review: {
    label: "Team Review",
    description: "Requires peer review and team sign-off before proceeding",
    icon: Users,
    color: "text-info",
    bgColor: "bg-info/10",
    borderColor: "border-info/20",
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function getGateTasks(projects: Project[], activeBoard: ReturnType<typeof useBoardStore.getState>["activeBoard"]): GateTask[] {
  const tasks: GateTask[] = [];

  for (const project of projects) {
    const board = project.boards[0];
    if (!board) continue;

    // For active project, use live board data
    const isActive = activeBoard?.projectId === project.id;
    const columns = isActive ? (activeBoard?.columns ?? board.columns) : board.columns;

    for (const col of columns) {
      for (const task of col.tasks) {
        tasks.push({
          ...task,
          projectName: project.name,
          projectKey: project.key,
          projectColor: project.color,
        });
      }
    }
  }

  return tasks;
}

function statusLabel(status: Task["status"]): string {
  const map: Record<Task["status"], string> = {
    backlog: "Backlog",
    todo: "To Do",
    in_progress: "In Progress",
    in_review: "In Review",
    done: "Done",
  };
  return map[status];
}

// ── Summary stat card ────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  delay,
}: {
  label: string;
  value: number;
  icon: typeof ShieldCheck;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay }}
      className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm"
    >
      <div className={cn("flex items-center justify-center w-10 h-10 rounded-xl", color === "success" && "bg-success/10", color === "warning" && "bg-warning/10", color === "info" && "bg-info/10", color === "accent" && "bg-accent/10")}>
        <Icon className={cn("w-5 h-5", color === "success" && "text-success", color === "warning" && "text-warning", color === "info" && "text-info", color === "accent" && "text-accent")} />
      </div>
      <div>
        <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
        <p className="text-[11px] text-white/30 uppercase tracking-[0.08em] font-medium">{label}</p>
      </div>
    </motion.div>
  );
}

// ── Gate task row ────────────────────────────────────────────────────────────

const GateTaskRow = memo(function GateTaskRow({
  task,
  index,
}: {
  task: GateTask;
  index: number;
}) {
  const gate = GATE_CONFIG[task.approvalGate];
  const GateIcon = gate.icon;
  const hasAgent = task.agent && (task.agent.status === "executing" || task.agent.status === "thinking");
  const isAwaitingApproval = task.agent?.status === "awaiting_approval";
  const isDone = task.status === "done";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay: Math.min(index * 0.03, 0.6) }}
      className={cn(
        "group flex items-center gap-3 px-4 py-3 rounded-xl border transition-[background-color,border-color] duration-200",
        isAwaitingApproval
          ? "bg-warning/[0.04] border-warning/20"
          : "bg-white/[0.015] border-white/[0.06] hover:bg-white/[0.03] hover:border-white/[0.10]",
      )}
    >
      {/* Gate type badge */}
      <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg shrink-0", gate.bgColor, "border", gate.borderColor)}>
        <GateIcon className={cn("w-4 h-4", gate.color)} />
      </div>

      {/* Project dot + key */}
      <div className="flex items-center gap-1.5 shrink-0 min-w-[70px]">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: task.projectColor }} />
        <span className="text-[10px] font-mono text-white/25">{task.key}</span>
      </div>

      {/* Task title */}
      <div className="min-w-0 flex-1">
        <span className={cn(
          "text-[13px] truncate block",
          isDone ? "text-white/25 line-through" : "text-white/70",
        )}>
          {task.title}
        </span>
      </div>

      {/* Status */}
      <div className="flex items-center gap-1.5 shrink-0">
        {isDone ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-success/50" />
        ) : isAwaitingApproval ? (
          <AlertTriangle className="w-3.5 h-3.5 text-warning animate-pulse" />
        ) : task.status === "in_progress" || task.status === "in_review" ? (
          <Clock className="w-3.5 h-3.5 text-accent/50" />
        ) : null}
        <span className={cn(
          "text-[10px] font-medium",
          isDone ? "text-success/40" : isAwaitingApproval ? "text-warning" : "text-white/25",
        )}>
          {isAwaitingApproval ? "Awaiting Approval" : statusLabel(task.status)}
        </span>
      </div>

      {/* Agent badge */}
      {hasAgent && (
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent/10 border border-accent/20 shrink-0">
          <Bot className="w-3 h-3 text-accent" />
          <span className="text-[9px] font-semibold text-accent">{task.agent?.name}</span>
        </div>
      )}

      {/* Priority */}
      <span className={cn(
        "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0",
        task.priority === "critical" && "text-danger bg-danger/10",
        task.priority === "high" && "text-warning bg-warning/10",
        task.priority === "medium" && "text-white/30 bg-white/[0.04]",
        task.priority === "low" && "text-white/20 bg-white/[0.02]",
      )}>
        {task.priority}
      </span>

      <ChevronRight className="w-3.5 h-3.5 text-white/10 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
});

// ── Filter pills ─────────────────────────────────────────────────────────────

function GateFilterPills({
  active,
  onChange,
  counts,
}: {
  active: GateFilter;
  onChange: (f: GateFilter) => void;
  counts: Record<GateFilter, number>;
}) {
  const filters: { key: GateFilter; label: string; color: string }[] = [
    { key: "all", label: "All Gates", color: "text-white/60" },
    { key: "human_required", label: "Human Required", color: "text-warning" },
    { key: "team_review", label: "Team Review", color: "text-info" },
    { key: "auto", label: "Auto-Approve", color: "text-success" },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Filter className="w-3.5 h-3.5 text-white/20 shrink-0" />
      {filters.map((f) => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all duration-200",
            active === f.key
              ? "bg-white/[0.08] border-white/[0.12] text-white/80"
              : "bg-white/[0.02] border-white/[0.06] text-white/30 hover:text-white/50 hover:bg-white/[0.04]",
          )}
        >
          <span>{f.label}</span>
          <span className={cn("text-[10px] font-mono", active === f.key ? f.color : "text-white/20")}>
            {counts[f.key]}
          </span>
        </button>
      ))}
    </div>
  );
}

// ── Gate section — groups tasks by gate type ─────────────────────────────────

function GateSection({
  gate,
  tasks,
  startIndex,
}: {
  gate: ApprovalGate;
  tasks: GateTask[];
  startIndex: number;
}) {
  const config = GATE_CONFIG[gate];
  const GateIcon = config.icon;
  const awaitingCount = tasks.filter((t) => t.agent?.status === "awaiting_approval").length;

  if (tasks.length === 0) return null;

  return (
    <div className="mb-8">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("flex items-center justify-center w-7 h-7 rounded-lg", config.bgColor, "border", config.borderColor)}>
          <GateIcon className={cn("w-3.5 h-3.5", config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] font-semibold text-white/80">{config.label}</h3>
            <span className="text-[11px] font-mono text-white/20">{tasks.length}</span>
            {awaitingCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/10 border border-warning/20 text-[10px] font-semibold text-warning animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                {awaitingCount} awaiting
              </span>
            )}
          </div>
          <p className="text-[11px] text-white/20">{config.description}</p>
        </div>
      </div>

      {/* Task rows */}
      <div className="space-y-1.5">
        {tasks.map((task, idx) => (
          <GateTaskRow key={task.id} task={task} index={startIndex + idx} />
        ))}
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function GatesPage() {
  useSimulation();

  const projects = useBoardStore((s) => s.projects);
  const activeBoard = useBoardStore((s) => s.activeBoard);
  const [filter, setFilter] = useState<GateFilter>("all");

  const allTasks = useMemo(() => getGateTasks(projects, activeBoard), [projects, activeBoard]);

  const counts = useMemo(() => {
    const c: Record<GateFilter, number> = { all: allTasks.length, auto: 0, human_required: 0, team_review: 0 };
    for (const t of allTasks) c[t.approvalGate]++;
    return c;
  }, [allTasks]);

  const filteredTasks = useMemo(
    () => filter === "all" ? allTasks : allTasks.filter((t) => t.approvalGate === filter),
    [allTasks, filter],
  );

  // Group by gate type
  const humanTasks = filteredTasks.filter((t) => t.approvalGate === "human_required");
  const teamTasks = filteredTasks.filter((t) => t.approvalGate === "team_review");
  const autoTasks = filteredTasks.filter((t) => t.approvalGate === "auto");

  // Stats
  const awaitingApproval = allTasks.filter((t) => t.agent?.status === "awaiting_approval").length;
  const activeWithGate = allTasks.filter(
    (t) => t.approvalGate !== "auto" && (t.status === "in_progress" || t.status === "in_review"),
  ).length;

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
            {awaitingApproval > 0 ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-warning animate-pulse" />
                <span className="text-[12px] font-semibold text-warning">{awaitingApproval} awaiting approval</span>
              </>
            ) : (
              <>
                <span className="inline-flex h-2 w-2 rounded-full bg-success animate-pulse-glow" />
                <span className="text-[12px] font-medium text-white/50">All clear</span>
              </>
            )}
            <div className="w-px h-3 bg-white/10" />
            <span className="text-[12px] font-mono text-accent">{allTasks.length} tasks</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-[-0.04em] leading-[1.1] text-white/95 mb-3 animate-[fadeSlideIn_0.5s_var(--ease-out-expo)_100ms_both]">
            Approval Gates
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-white/35 font-light max-w-xl leading-relaxed animate-[fadeSlideIn_0.5s_var(--ease-out-expo)_200ms_both]">
            Human-in-the-loop safety guardrails across every project
          </p>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-void to-transparent" />
      </div>

      {/* Summary stats */}
      <div className="px-4 md:px-8 -mt-6 relative z-10 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Human Required" value={counts.human_required} icon={ShieldAlert} color="warning" delay={0.1} />
          <StatCard label="Team Review" value={counts.team_review} icon={Users} color="info" delay={0.15} />
          <StatCard label="Auto-Approve" value={counts.auto} icon={Zap} color="success" delay={0.2} />
          <StatCard label="Active Gated" value={activeWithGate} icon={ShieldCheck} color="accent" delay={0.25} />
        </div>
      </div>

      {/* Gate list section */}
      <div className="px-4 md:px-8 py-8 pb-16 max-w-5xl mx-auto">
        {/* Section divider */}
        <div className="flex items-center gap-3 mb-6 animate-[fadeSlideIn_0.5s_var(--ease-out-expo)_300ms_both]">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-white/20" />
            <span className="text-[11px] uppercase tracking-[0.15em] text-white/20 font-medium">Gate Registry</span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>

        {/* Filters */}
        <div className="mb-6">
          <GateFilterPills active={filter} onChange={setFilter} counts={counts} />
        </div>

        {/* Grouped gate sections */}
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {filter === "all" ? (
              <>
                <GateSection gate="human_required" tasks={humanTasks} startIndex={0} />
                <GateSection gate="team_review" tasks={teamTasks} startIndex={humanTasks.length} />
                <GateSection gate="auto" tasks={autoTasks} startIndex={humanTasks.length + teamTasks.length} />
              </>
            ) : (
              <GateSection gate={filter} tasks={filteredTasks} startIndex={0} />
            )}

            {filteredTasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-4">
                  <ShieldCheck className="w-6 h-6 text-white/15" />
                </div>
                <h3 className="text-[15px] font-semibold text-white/40 mb-1">No tasks with this gate type</h3>
                <p className="text-[12px] text-white/20 max-w-sm">
                  Try selecting a different filter to see tasks across your projects.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}

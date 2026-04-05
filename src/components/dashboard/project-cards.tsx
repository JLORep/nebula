"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import {
  Shield, Database, Layout, Bot, CreditCard, Cloud,
  ArrowRight, Users, Zap, CheckCircle2, Circle,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useBoardStore } from "@/lib/stores/board-store";
import type { Project, Task } from "@/lib/types";
import Link from "next/link";

const iconMap: Record<string, React.ElementType> = {
  Shield, Database, Layout, Bot, CreditCard, Cloud,
};

// ── Live task row — shows an in-progress task with agent badge ──────────────

const LiveTaskRow = memo(function LiveTaskRow({
  task,
  projectColor,
  onClickTask,
}: {
  task: Task;
  projectColor: string;
  onClickTask: (task: Task) => void;
}) {
  const hasActiveAgent = task.agent && (task.agent.status === "executing" || task.agent.status === "thinking");

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClickTask(task); }}
      className={cn(
        "flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-left",
        "bg-white/[0.02] border border-white/[0.04]",
        "hover:bg-white/[0.05] hover:border-white/[0.08]",
        "transition-[background-color,border-color] duration-200",
      )}
    >
      {/* Status dot */}
      {task.status === "done" ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-success/60 shrink-0" />
      ) : task.status === "in_progress" || task.status === "in_review" ? (
        <span
          className="inline-flex h-2 w-2 rounded-full shrink-0 animate-pulse-glow"
          style={{ backgroundColor: projectColor }}
        />
      ) : (
        <Circle className="w-3.5 h-3.5 text-white/15 shrink-0" />
      )}

      {/* Task info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-white/20">{task.key}</span>
          <span className="text-[11px] text-white/60 truncate">{task.title}</span>
        </div>
      </div>

      {/* Agent badge */}
      {hasActiveAgent && (
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-accent/10 border border-accent/20 shrink-0">
          <Zap className="w-2.5 h-2.5 text-accent" />
          <span className="text-[9px] font-semibold text-accent">{task.agent?.name}</span>
        </div>
      )}

      {/* Progress */}
      {task.completionPercent > 0 && task.completionPercent < 100 && (
        <span className="text-[10px] font-mono text-white/25 shrink-0">{task.completionPercent}%</span>
      )}

      <ArrowRight className="w-3 h-3 text-white/10 shrink-0 opacity-0 group-hover/task:opacity-100 transition-opacity" />
    </button>
  );
});

// ── Progress bar (reads live board data for active project) ─────────────────

function ProjectProgress({ project, isActive }: { project: Project; isActive: boolean }) {
  const activeBoard = useBoardStore((s) => s.activeBoard);

  // For the active project, use live board data; for others, use static
  const board = isActive ? activeBoard : project.boards[0];
  if (!board) return null;

  const sprint = board.sprint;
  const pct = sprint
    ? Math.round((sprint.completedPoints / sprint.totalPoints) * 100)
    : 0;
  const done = board.columns.find((c) => c.id === "done")?.tasks.length ?? 0;
  const total = board.columns.flatMap((c) => c.tasks).length;

  return (
    <div className="pt-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] text-white/20">
          {sprint ? `${sprint.name}` : "Sprint progress"}
        </span>
        <span className="text-[10px] font-mono text-white/30">
          {sprint ? `${sprint.completedPoints}/${sprint.totalPoints} pts` : `${pct}%`}
        </span>
      </div>
      <div className="w-full h-1 rounded-full bg-white/[0.04] overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: project.color }}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[9px] text-white/15">{done}/{total} tasks done</span>
        <span className="text-[9px] font-mono text-white/15">{pct}%</span>
      </div>
    </div>
  );
}

// ── Project card ────────────────────────────────────────────────────────────

const ProjectCard = memo(function ProjectCard({ project, index }: { project: Project; index: number }) {
  const router = useRouter();
  const { setActiveProject, selectTaskById, activeProject, activeBoard } = useBoardStore();
  const Icon = iconMap[project.icon] ?? Bot;
  const isActive = activeProject?.id === project.id;

  // For active project, derive stats from live board state
  const board = isActive ? activeBoard : project.boards[0];
  const activeSprint = isActive
    ? activeBoard?.sprint
    : project.sprints.find((s) => s.status === "active");
  const agents = isActive ? (activeBoard?.agents ?? project.agents) : project.agents;
  const activeAgents = agents.filter((a) => a.status === "executing" || a.status === "thinking").length;
  const totalTasks = board?.columns.flatMap((c) => c.tasks).length ?? 0;

  // Get in-progress and in-review tasks for the active project (live data)
  const liveTasks: Task[] = isActive
    ? (activeBoard?.columns ?? [])
        .filter((c) => c.id === "in_progress" || c.id === "in_review")
        .flatMap((c) => c.tasks)
        .slice(0, 3)
    : [];

  function handleTaskClick(task: Task) {
    setActiveProject(project.id);
    // Delay to let board state settle after project switch, then select by ID and navigate
    setTimeout(() => {
      selectTaskById(task.id);
      router.push("/board");
    }, 50);
  }

  function handleCardClick() {
    setActiveProject(project.id);
  }

  return (
    <div
      className="animate-[fadeSlideIn_0.5s_var(--ease-out-expo)_both]"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <Link
        href="/board"
        onClick={handleCardClick}
        className={cn(
          "group flex flex-col h-full p-5 rounded-2xl cursor-pointer relative",
          "bg-nebula/60 border",
          "transition-[transform,background-color,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform",
          "hover:-translate-y-1 hover:bg-cosmos/80 hover:border-white/[0.10] hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]",
          isActive
            ? "border-white/[0.10] shadow-[0_0_20px_rgba(0,0,0,0.15)]"
            : "border-white/[0.06]",
        )}
      >
        {/* Active project indicator — top gradient line */}
        {isActive && (
          <div
            className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl"
            style={{ background: `linear-gradient(90deg, transparent, ${project.color}, transparent)` }}
          />
        )}

        {/* Top edge highlight */}
        <div className="absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl border"
              style={{ backgroundColor: `${project.color}15`, borderColor: `${project.color}30` }}
            >
              <Icon className="w-5 h-5" style={{ color: project.color }} />
            </div>
            {isActive && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.04]">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[9px] font-mono text-white/30 uppercase tracking-wider">Active</span>
              </div>
            )}
          </div>
          <span className="text-[10px] font-mono text-white/20 tracking-wider">{project.key}</span>
        </div>

        {/* Name */}
        <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-white/90 mb-1 group-hover:text-white transition-colors">
          {project.name}
        </h3>
        <p className="text-[11px] text-white/30 leading-relaxed mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-3 mb-3">
          {activeSprint && (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex h-1.5 w-1.5 rounded-full animate-pulse-glow" style={{ backgroundColor: project.color }} />
              <span className="text-[10px] text-white/30">S{activeSprint.number}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-[10px] text-white/25">
            <span className="font-mono">{totalTasks}</span> tasks
          </div>
          {activeAgents > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-success/60">
              <Bot className="w-3 h-3" />
              <span className="font-mono">{activeAgents}</span> active
            </div>
          )}
          <div className="flex items-center gap-1 text-[10px] text-white/20 ml-auto">
            <Users className="w-3 h-3" />
            <span>{project.members.length}</span>
          </div>
        </div>

        {/* Live tasks — only for active project */}
        {isActive && liveTasks.length > 0 && (
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] text-white/20 uppercase tracking-wider font-medium">In Flight</span>
              <div className="h-px flex-1 bg-white/[0.04]" />
            </div>
            {liveTasks.map((task) => (
              <LiveTaskRow
                key={task.id}
                task={task}
                projectColor={project.color}
                onClickTask={handleTaskClick}
              />
            ))}
          </div>
        )}

        {/* Progress */}
        <div className="mt-auto">
          <ProjectProgress project={project} isActive={isActive} />
        </div>

        {/* CTA */}
        <div className="flex items-center gap-1 mt-3 text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: project.color }}>
          Open board <ArrowRight className="w-3 h-3" />
        </div>
      </Link>
    </div>
  );
});

export function ProjectCards() {
  const { projects } = useBoardStore();

  return (
    <div className="px-4 md:px-8 py-6 pb-12">
      <div className="animate-[fadeSlideIn_0.6s_var(--ease-out-expo)_both]" style={{ animationDelay: "300ms" }}>
        <div className="flex items-center gap-3 mb-6 max-w-7xl mx-auto">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-white/20 font-medium">Active Projects</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
          {projects.map((project, idx) => (
            <ProjectCard key={project.id} project={project} index={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}

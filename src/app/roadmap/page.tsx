"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Map, Target, Layers, Flag, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Spotlight } from "@/components/ui/spotlight";
import { ProjectSelector } from "@/components/board/project-selector";
import { useBoardStore } from "@/lib/stores/board-store";
import { Timeline } from "@/components/roadmap/timeline";
import { AgileCoach } from "@/components/roadmap/agile-coach";
import { SPRING } from "@/lib/utils/motion";

export default function RoadmapPage() {
  const activeProject = useBoardStore((s) => s.activeProject);
  const activeSprint = activeProject?.sprints.find((s) => s.status === "active");

  const allTasks = useMemo(
    () => activeProject?.boards.flatMap((b) => b.columns.flatMap((c) => c.tasks)) ?? [],
    [activeProject]
  );

  const totalEpics = activeProject?.epics.length ?? 0;
  const activeEpics = activeProject?.epics.filter((e) => e.status === "in_progress").length ?? 0;
  const totalMilestones = activeProject?.milestones.length ?? 0;
  const achievedMilestones = activeProject?.milestones.filter((m) => m.status === "achieved").length ?? 0;
  const totalThemes = activeProject?.themes.length ?? 0;
  const doneTasks = allTasks.filter((t) => t.status === "done").length;
  const totalPoints = allTasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
  const donePoints = allTasks.filter((t) => t.status === "done").reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);

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
              Roadmap
            </h1>
          </div>

          {/* Sprint + progress row */}
          {activeSprint && (
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-accent animate-pulse-glow" />
                <span className="text-[12px] sm:text-[13px] text-white/50">{activeSprint.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-28 sm:w-36 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-cyan-400 transition-[width] duration-700 ease-out"
                    style={{ width: `${(activeSprint.completedPoints / activeSprint.totalPoints) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] sm:text-[12px] font-mono text-white/30">
                  {activeSprint.completedPoints}/{activeSprint.totalPoints} pts
                </span>
              </div>
              <span className="text-[11px] text-white/20 hidden sm:inline">
                {activeSprint.startDate} — {activeSprint.endDate}
              </span>
            </div>
          )}
        </motion.div>

        {/* ── Stats ribbon ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.08 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
        >
          {[
            { icon: Layers, label: "Themes", value: totalThemes, color: "text-violet-400", bg: "bg-violet-400/10" },
            { icon: Target, label: "Epics", value: `${activeEpics}/${totalEpics} active`, color: "text-cyan-400", bg: "bg-cyan-400/10" },
            { icon: Flag, label: "Milestones", value: `${achievedMilestones}/${totalMilestones}`, color: "text-amber-400", bg: "bg-amber-400/10" },
            { icon: TrendingUp, label: "Delivered", value: `${donePoints}/${totalPoints} pts`, color: "text-emerald-400", bg: "bg-emerald-400/10" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02]"
            >
              <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg shrink-0", stat.bg)}>
                <stat.icon className={cn("w-4 h-4", stat.color)} />
              </div>
              <div>
                <span className="text-[14px] font-semibold text-white/85 block leading-tight">{stat.value}</span>
                <span className="text-[10px] text-white/25 uppercase tracking-wider">{stat.label}</span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Theme pills ──────────────────────────────────────────────── */}
        {activeProject && activeProject.themes.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12 }}
            className="flex flex-wrap items-center gap-2 mb-6"
          >
            <span className="text-[10px] uppercase tracking-[0.12em] text-white/20 font-medium mr-1">Themes</span>
            {activeProject.themes.map((theme) => (
              <div
                key={theme.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: theme.color }} />
                <span className="text-[11px] font-medium text-white/45">{theme.name}</span>
                <span className="text-[9px] font-mono text-white/15">
                  {activeProject.epics.filter((e) => e.themeId === theme.id).length} epics
                </span>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── Strategic Timeline ───────────────────────────────────────── */}
        <Timeline />

        {/* ── AI Scrum Master ──────────────────────────────────────────── */}
        <AgileCoach />
      </div>
    </main>
  );
}

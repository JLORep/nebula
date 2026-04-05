"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { useBoardStore } from "@/lib/stores/board-store";
import { EpicCard } from "./epic-card";
import { MilestoneMarker } from "./milestone-marker";
import { SPRING_GENTLE } from "@/lib/utils/motion";

export function Timeline() {
  const activeProject = useBoardStore((s) => s.activeProject);

  if (!activeProject) return null;

  const allTasks = activeProject.boards.flatMap((b) => b.columns.flatMap((c) => c.tasks));
  const sprints = activeProject.sprints;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, ...SPRING_GENTLE }}
      className="relative rounded-2xl sm:rounded-3xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-6 overflow-hidden mb-6"
    >
      {/* Ambient glows */}
      <div className="hidden md:block">
        <div className="absolute -top-20 left-1/4 w-[400px] h-[200px] bg-accent/[0.04] blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-20 right-1/4 w-[400px] h-[200px] bg-cyan-400/[0.03] blur-[80px] pointer-events-none" />
      </div>
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* Section label */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-px flex-1 bg-gradient-to-r from-white/[0.06] to-transparent" />
        <span className="text-[10px] uppercase tracking-[0.15em] text-white/20 font-medium">Strategic Timeline</span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/[0.06]" />
      </div>

      {/* Timeline track line */}
      <div className="relative mb-5">
        <div className="absolute top-[10px] left-0 right-0 h-0.5 rounded-full z-0">
          <div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${activeProject.color}, #06b6d4, rgba(255,255,255,0.06))`,
            }}
          />
        </div>

        {/* Sprint phase nodes — flex evenly */}
        <div className="relative z-10 flex">
          {sprints.map((sprint, idx) => {
            const isActive = sprint.status === "active";
            const isCompleted = sprint.status === "completed";
            return (
              <div key={sprint.id} className="flex-1" style={{ minWidth: 0 }}>
                <div className="flex items-center gap-2.5 mb-1">
                  {/* Phase node */}
                  <div className="relative shrink-0">
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2",
                        isCompleted && "bg-success/20 border-success",
                        !isCompleted && !isActive && "bg-white/[0.04] border-white/[0.12]",
                      )}
                      style={isActive ? { backgroundColor: `${activeProject.color}20`, borderColor: activeProject.color } : undefined}
                    >
                      {isActive && (
                        <div className="absolute inset-0 rounded-full animate-pulse-glow" style={{ backgroundColor: `${activeProject.color}30` }} />
                      )}
                    </div>
                  </div>
                  <span className={cn(
                    "text-[13px] font-semibold",
                    isActive ? "text-white/90" : isCompleted ? "text-success/70" : "text-white/35"
                  )}>
                    S{sprint.number}
                  </span>
                  {isActive && (
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-accent/10 text-accent">
                      Active
                    </span>
                  )}
                  {sprint.status === "planning" && (
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-white/[0.06] text-white/30">
                      Planning
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sprint columns — flex like board */}
      <div className="flex gap-4">
        {sprints.map((sprint) => {
          const isActive = sprint.status === "active";
          const sprintEpics = activeProject.epics.filter((e) => {
            const epicTasks = allTasks.filter((t) => t.epicId === e.id && t.sprintId === sprint.id);
            return epicTasks.length > 0;
          });
          const sprintMilestones = activeProject.milestones.filter((m) => {
            const epic = activeProject.epics.find((e) => e.id === m.epicId);
            if (!epic) return false;
            const epicTasks = allTasks.filter((t) => t.epicId === epic.id && t.sprintId === sprint.id);
            return epicTasks.length > 0;
          });
          const sprintTasks = allTasks.filter((t) => t.sprintId === sprint.id);
          const doneTasks = sprintTasks.filter((t) => t.status === "done").length;
          const totalPts = sprintTasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
          const donePts = sprintTasks.filter((t) => t.status === "done").reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);

          return (
            <div key={sprint.id} className="flex-1 min-w-0">
              {/* Sprint card */}
              <div className={cn(
                "rounded-xl border p-3.5 space-y-3 transition-colors",
                isActive
                  ? "border-accent/15 bg-accent/[0.03]"
                  : "border-white/[0.06] bg-white/[0.02]"
              )}>
                {/* Sprint header */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] font-semibold text-white/60 truncate">{sprint.name}</span>
                    <span className="text-[10px] font-mono text-white/25 shrink-0">{sprint.completedPoints}/{sprint.totalPoints} pts</span>
                  </div>
                  <span className="text-[10px] text-white/20 block mb-2">{sprint.startDate} — {sprint.endDate}</span>

                  {/* Sprint progress */}
                  <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-[width] duration-700"
                      style={{
                        width: sprint.totalPoints > 0 ? `${(sprint.completedPoints / sprint.totalPoints) * 100}%` : "0%",
                        background: `linear-gradient(90deg, ${activeProject.color}, #06b6d4)`,
                      }}
                    />
                  </div>

                  {/* Mini stats */}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-white/20">
                      <span className="text-white/35 font-mono">{doneTasks}</span>/{sprintTasks.length} tasks
                    </span>
                    <span className="text-[10px] text-white/20">
                      <span className="text-white/35 font-mono">{donePts}</span>/{totalPts} pts
                    </span>
                  </div>
                </div>

                {/* Milestones */}
                {sprintMilestones.length > 0 && (
                  <div className="space-y-0.5 pt-1 border-t border-white/[0.04]">
                    <span className="text-[9px] uppercase tracking-[0.1em] text-white/15 font-semibold block mb-1">Milestones</span>
                    {sprintMilestones.map((ms) => {
                      const epic = activeProject.epics.find((e) => e.id === ms.epicId);
                      const theme = epic ? activeProject.themes.find((t) => t.id === epic.themeId) : undefined;
                      return (
                        <MilestoneMarker key={ms.id} milestone={ms} themeColor={theme?.color ?? activeProject.color} />
                      );
                    })}
                  </div>
                )}

                {/* Epics */}
                <div className="space-y-2 pt-1 border-t border-white/[0.04]">
                  <span className="text-[9px] uppercase tracking-[0.1em] text-white/15 font-semibold block">Epics</span>
                  {sprintEpics.map((epic) => {
                    const theme = activeProject.themes.find((t) => t.id === epic.themeId);
                    const epicTasks = allTasks.filter((t) => t.epicId === epic.id && t.sprintId === sprint.id);
                    return (
                      <EpicCard key={epic.id} epic={epic} theme={theme} tasks={epicTasks} />
                    );
                  })}
                  {sprintEpics.length === 0 && (
                    <div className="text-[11px] text-white/15 text-center py-4">No epics assigned</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

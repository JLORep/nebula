"use client";

import { motion } from "framer-motion";
import { useBoardStore } from "@/lib/stores/board-store";
import { EpicCard } from "./epic-card";
import { MilestoneMarker } from "./milestone-marker";
import { SPRING_GENTLE } from "@/lib/utils/motion";

export function Timeline() {
  const activeProject = useBoardStore((s) => s.activeProject);
  const activeBoard = useBoardStore((s) => s.activeBoard);

  if (!activeProject) return null;

  const allTasks = activeProject.boards.flatMap((b) => b.columns.flatMap((c) => c.tasks));
  const sprints = activeProject.sprints;
  const activeSprint = sprints.find((s) => s.status === "active");

  return (
    <div className="px-4 md:px-8 py-4">
      {/* Section divider */}
      <div className="flex items-center gap-3 mb-6 max-w-7xl mx-auto">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-white/20 font-medium">Strategic Timeline</span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      {/* Glass container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, ...SPRING_GENTLE }}
        className="relative rounded-2xl sm:rounded-3xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-6 overflow-hidden max-w-7xl mx-auto"
      >
        {/* Ambient glows */}
        <div className="hidden md:block">
          <div className="absolute -top-20 left-1/4 w-[400px] h-[200px] bg-accent/[0.04] blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-20 right-1/4 w-[400px] h-[200px] bg-cyan-400/[0.03] blur-[80px] pointer-events-none" />
        </div>
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

        {/* Theme lanes */}
        <div className="flex flex-wrap gap-2 mb-5">
          {activeProject.themes.map((theme) => (
            <div key={theme.id} className="flex items-center gap-2 px-2.5 py-1 rounded-lg border border-white/[0.06] bg-white/[0.02]">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.color }} />
              <span className="text-[10px] font-medium text-white/40">{theme.name}</span>
            </div>
          ))}
        </div>

        {/* Timeline track */}
        <div className="relative overflow-x-auto pb-4 -mx-1 px-1">
          {/* SVG timeline line */}
          <div className="absolute top-[22px] left-0 right-0 h-0.5 rounded-full z-0">
            <div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${activeProject.color}, #06b6d4, rgba(255,255,255,0.08))`,
              }}
            />
          </div>

          {/* Sprint phases */}
          <div className="relative z-10 flex gap-4 sm:gap-6 min-w-max">
            {sprints.map((sprint) => {
              const isActive = sprint.status === "active";
              const isCompleted = sprint.status === "completed";
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

              return (
                <div key={sprint.id} className="flex flex-col items-start w-[280px] sm:w-[320px] shrink-0">
                  {/* Phase node */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                      <div
                        className={`w-5 h-5 rounded-full border-2 ${
                          isCompleted
                            ? "bg-success/20 border-success"
                            : isActive
                              ? "border-accent"
                              : "bg-white/[0.04] border-white/[0.12]"
                        }`}
                        style={isActive ? { backgroundColor: `${activeProject.color}20`, borderColor: activeProject.color } : undefined}
                      >
                        {isActive && (
                          <div className="absolute inset-0 rounded-full animate-pulse-glow" style={{ backgroundColor: `${activeProject.color}30` }} />
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[13px] font-semibold ${isActive ? "text-white/90" : isCompleted ? "text-success/70" : "text-white/35"}`}>
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
                      <span className="text-[10px] text-white/20">
                        {sprint.startDate} — {sprint.endDate}
                      </span>
                    </div>
                  </div>

                  {/* Sprint card */}
                  <div className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-2">
                    {/* Sprint header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-medium text-white/50 truncate">{sprint.name}</span>
                      <span className="text-[10px] font-mono text-white/25">{sprint.completedPoints}/{sprint.totalPoints} pts</span>
                    </div>

                    {/* Sprint progress */}
                    <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden mb-3">
                      <div
                        className="h-full rounded-full transition-[width] duration-700"
                        style={{
                          width: sprint.totalPoints > 0 ? `${(sprint.completedPoints / sprint.totalPoints) * 100}%` : "0%",
                          background: `linear-gradient(90deg, ${activeProject.color}, #06b6d4)`,
                        }}
                      />
                    </div>

                    {/* Milestones */}
                    {sprintMilestones.length > 0 && (
                      <div className="space-y-0.5 mb-2">
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
                    <div className="space-y-2">
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
        </div>
      </motion.div>
    </div>
  );
}

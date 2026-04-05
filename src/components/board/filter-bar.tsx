"use client";

import { memo } from "react";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useBoardStore } from "@/lib/stores/board-store";

export const FilterBar = memo(function FilterBar() {
  const activeProject = useBoardStore((s) => s.activeProject);
  const activeSprintFilter = useBoardStore((s) => s.activeSprintFilter);
  const activeThemeFilter = useBoardStore((s) => s.activeThemeFilter);
  const activeEpicFilter = useBoardStore((s) => s.activeEpicFilter);
  const setSprintFilter = useBoardStore((s) => s.setSprintFilter);
  const setThemeFilter = useBoardStore((s) => s.setThemeFilter);
  const setEpicFilter = useBoardStore((s) => s.setEpicFilter);

  if (!activeProject) return null;

  const activeSprint = activeProject.sprints.find((s) => s.status === "active");
  const hasActiveFilters = activeThemeFilter || activeEpicFilter || activeSprintFilter;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-6">
      <div className="flex items-center gap-1.5 text-white/25 mr-1">
        <Filter className="w-3.5 h-3.5" />
        <span className="text-[11px] font-medium uppercase tracking-wider">Filters</span>
      </div>

      {/* Sprint pills */}
      {activeProject.sprints.map((sprint) => {
        const isActive = activeSprintFilter
          ? activeSprintFilter === sprint.id
          : sprint.id === activeSprint?.id;
        return (
          <button
            key={sprint.id}
            onClick={() => setSprintFilter(isActive && activeSprintFilter ? null : sprint.id)}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors duration-200",
              isActive
                ? "bg-accent/10 text-accent border-accent/20"
                : "bg-white/[0.02] text-white/30 border-white/[0.04] hover:bg-white/[0.04] hover:text-white/50"
            )}
          >
            S{sprint.number}
            {sprint.status === "active" && (
              <span className="ml-1.5 inline-flex h-1.5 w-1.5 rounded-full bg-success" />
            )}
          </button>
        );
      })}

      <div className="w-px h-4 bg-white/[0.06] mx-1" />

      {/* Theme pills */}
      {activeProject.themes.map((theme) => {
        const isActive = activeThemeFilter === theme.id;
        return (
          <button
            key={theme.id}
            onClick={() => setThemeFilter(isActive ? null : theme.id)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors duration-200",
              isActive
                ? "text-white/80 border-white/20"
                : "bg-white/[0.02] text-white/30 border-white/[0.04] hover:bg-white/[0.04] hover:text-white/50"
            )}
            style={isActive ? { backgroundColor: `${theme.color}15`, borderColor: `${theme.color}40` } : undefined}
          >
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: theme.color }} />
            {theme.name}
          </button>
        );
      })}

      {/* Epic dropdown as pills (compact) */}
      {activeProject.epics.filter(e => !activeThemeFilter || e.themeId === activeThemeFilter).length > 0 && (
        <>
          <div className="w-px h-4 bg-white/[0.06] mx-1" />
          <select
            value={activeEpicFilter ?? ""}
            onChange={(e) => setEpicFilter(e.target.value || null)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium border bg-white/[0.02] text-white/30 border-white/[0.04] hover:bg-white/[0.04] hover:text-white/50 transition-colors duration-200 cursor-pointer appearance-none pr-6 focus:outline-none focus:border-accent/30"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.25)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
          >
            <option value="">All Epics</option>
            {activeProject.epics
              .filter(e => !activeThemeFilter || e.themeId === activeThemeFilter)
              .map((epic) => (
                <option key={epic.id} value={epic.id}>{epic.name}</option>
              ))}
          </select>
        </>
      )}

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={() => {
            setSprintFilter(null);
            setThemeFilter(null);
            setEpicFilter(null);
          }}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-white/25 hover:text-white/50 hover:bg-white/[0.04] transition-colors duration-200"
        >
          <X className="w-3 h-3" />
          Clear
        </button>
      )}
    </div>
  );
});

"use client";

import { create } from "zustand";

// ============================================================================
// Roadmap Store — THE source of truth for roadmap UI state (River pattern)
// ============================================================================

interface RoadmapState {
  expandedEpicIds: string[];
  coachPanelOpen: boolean;
  activeGlossaryTerm: string | null;

  toggleEpic: (epicId: string) => void;
  toggleCoachPanel: () => void;
  setGlossaryTerm: (key: string | null) => void;
}

export const useRoadmapStore = create<RoadmapState>((set) => ({
  expandedEpicIds: [],
  coachPanelOpen: true,
  activeGlossaryTerm: null,

  toggleEpic: (epicId) =>
    set((s) => ({
      expandedEpicIds: s.expandedEpicIds.includes(epicId)
        ? s.expandedEpicIds.filter((id) => id !== epicId)
        : [...s.expandedEpicIds, epicId],
    })),

  toggleCoachPanel: () => set((s) => ({ coachPanelOpen: !s.coachPanelOpen })),

  setGlossaryTerm: (key) => set({ activeGlossaryTerm: key }),
}));

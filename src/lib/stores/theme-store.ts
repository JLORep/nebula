"use client";

import { create } from "zustand";

// ============================================================================
// Theme Store — THE source of truth for app theme (River pattern)
// Persists to localStorage. No SSR flash via inline script in layout.
// ============================================================================

type Theme = "dark" | "light";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "dark",

  setTheme: (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("flow-theme", theme); } catch {}
    set({ theme });
  },

  toggleTheme: () => {
    set((s) => {
      const next = s.theme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("flow-theme", next); } catch {}
      return { theme: next };
    });
  },
}));

/** Call once on mount to hydrate theme from localStorage */
export function hydrateTheme() {
  try {
    const stored = localStorage.getItem("flow-theme") as Theme | null;
    if (stored === "light" || stored === "dark") {
      document.documentElement.setAttribute("data-theme", stored);
      useThemeStore.setState({ theme: stored });
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  } catch {
    document.documentElement.setAttribute("data-theme", "dark");
  }
}

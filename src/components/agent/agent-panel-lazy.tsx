"use client";

import { useBoardStore } from "@/lib/stores/board-store";
import { AgentPanel } from "./agent-panel";

/**
 * Lazy wrapper — reads activeBoard.agents only when the panel is actually open.
 * Prevents AppShell from re-rendering on every board tick.
 */
export function AgentPanelLazy() {
  const agents = useBoardStore((s) => s.activeBoard?.agents ?? []);
  return <AgentPanel agents={agents} />;
}

"use client";

import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { NebulaBackground } from "@/components/ui/nebula-background";
import { FloatingNav } from "@/components/layout/floating-nav";
import { AINavBar } from "@/components/layout/ai-nav-bar";
import { AIAdvisor } from "@/components/layout/ai-advisor";
import { SquadSidebar } from "@/components/layout/squad-sidebar";
import { AgentPanelLazy } from "@/components/agent/agent-panel-lazy";
import { FlowPortal } from "@/components/flow/flow-portal";
import { useBoardStore } from "@/lib/stores/board-store";
import { hydrateTheme } from "@/lib/stores/theme-store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const agentPanelOpen = useBoardStore((s) => s.agentPanelOpen);
  const newTaskModalOpen = useBoardStore((s) => s.newTaskModalOpen);

  useEffect(() => { hydrateTheme(); }, []);

  return (
    <>
      <NebulaBackground />
      <FloatingNav />
      <SquadSidebar />
      {children}
      <AINavBar />
      <AIAdvisor />
      <AnimatePresence>
        {agentPanelOpen && <AgentPanelLazy />}
      </AnimatePresence>
      <AnimatePresence>
        {newTaskModalOpen && <FlowPortal />}
      </AnimatePresence>
    </>
  );
}

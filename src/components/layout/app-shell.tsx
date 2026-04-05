"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { NebulaBackground } from "@/components/ui/nebula-background";
import { FloatingNav } from "@/components/layout/floating-nav";
import { AINavBar } from "@/components/layout/ai-nav-bar";
import { AIAdvisor } from "@/components/layout/ai-advisor";
import { NebulaChat } from "@/components/layout/nebula-chat";
import { AgentPanelLazy } from "@/components/agent/agent-panel-lazy";
import { FlowPortal } from "@/components/flow/flow-portal";
import { useBoardStore } from "@/lib/stores/board-store";
import { hydrateTheme } from "@/lib/stores/theme-store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const agentPanelOpen = useBoardStore((s) => s.agentPanelOpen);
  const newTaskModalOpen = useBoardStore((s) => s.newTaskModalOpen);
  const pathname = usePathname();
  const isDashboard = pathname === "/";

  useEffect(() => { hydrateTheme(); }, []);

  return (
    <>
      <NebulaBackground />
      <FloatingNav />
      <NebulaChat />
      {children}
      {isDashboard && <AINavBar />}
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

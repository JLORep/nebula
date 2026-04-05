"use client";

import { WelcomeHero } from "@/components/dashboard/welcome-hero";
import { DashboardHero } from "@/components/dashboard/hero";
import { MetricsGrid } from "@/components/dashboard/metrics-grid";
import { ProjectCards } from "@/components/dashboard/project-cards";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { useSimulation } from "@/lib/hooks/use-simulation";

export default function Home() {
  useSimulation();

  return (
    <main className="relative z-10 min-h-screen">
      <WelcomeHero />
      <ProjectCards />
      <DashboardHero />
      <MetricsGrid />
      <ActivityFeed />
    </main>
  );
}

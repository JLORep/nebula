"use client";

import { RoadmapHero } from "@/components/roadmap/roadmap-hero";
import { Timeline } from "@/components/roadmap/timeline";
import { AgileCoach } from "@/components/roadmap/agile-coach";

export default function RoadmapPage() {
  return (
    <main className="relative z-10 min-h-screen pt-20 sm:pt-24 pb-8 sm:pb-12">
      <RoadmapHero />
      <Timeline />
      <AgileCoach />
    </main>
  );
}

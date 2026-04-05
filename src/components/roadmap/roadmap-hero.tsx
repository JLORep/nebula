"use client";

import { motion } from "framer-motion";
import { Spotlight } from "@/components/ui/spotlight";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Meteors } from "@/components/ui/meteors";
import { useBoardStore } from "@/lib/stores/board-store";

export function RoadmapHero() {
  const activeProject = useBoardStore((s) => s.activeProject);
  const activeSprint = activeProject?.sprints.find((s) => s.status === "active");

  return (
    <div className="relative min-h-[35vh] md:min-h-[40vh] flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Spotlight */}
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(139, 92, 246, 0.15)" />
      <div className="hidden md:block">
        <Spotlight className="-top-40 right-60 md:-top-20" fill="rgba(6, 182, 212, 0.08)" />
      </div>

      {/* Meteors */}
      <Meteors number={3} className="z-0 hidden sm:block" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl w-full">
        {/* Project badge */}
        {activeProject && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
            className="mb-4 md:mb-6"
          >
            <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/[0.08] bg-white/[0.03]">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activeProject.color }} />
              <span className="text-[11px] sm:text-[12px] font-mono text-white/40">{activeProject.key}</span>
              {activeSprint && (
                <>
                  <div className="w-px h-3 bg-white/10" />
                  <span className="inline-flex h-2 w-2 rounded-full bg-success animate-pulse-glow" />
                  <span className="text-[11px] sm:text-[12px] font-medium text-white/50">{activeSprint.name}</span>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Headline */}
        <TextGenerateEffect
          words={`${activeProject?.name ?? "FLOW"} Roadmap`}
          className="text-3xl sm:text-5xl md:text-7xl tracking-[-0.04em] leading-[1.1] mb-3 md:mb-4"
          duration={0.4}
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-sm sm:text-lg md:text-xl text-white/35 font-light max-w-2xl leading-relaxed"
        >
          Strategic timeline — themes, epics, and milestones
        </motion.p>

        {/* Sprint progress bar */}
        {activeSprint && activeProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.4 }}
            className="mt-6 md:mt-8 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] text-white/25 uppercase tracking-widest font-medium">Sprint Progress</span>
              <span className="text-[12px] sm:text-[13px] font-mono text-white/50">
                {Math.round((activeSprint.completedPoints / activeSprint.totalPoints) * 100)}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-1000 ease-out"
                style={{
                  width: `${(activeSprint.completedPoints / activeSprint.totalPoints) * 100}%`,
                  background: `linear-gradient(90deg, ${activeProject.color}, #06b6d4)`,
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] sm:text-[11px] text-white/20">{activeSprint.startDate}</span>
              <span className="text-[10px] sm:text-[11px] text-white/20">{activeSprint.endDate}</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-24 md:h-32 bg-gradient-to-t from-void to-transparent" />
    </div>
  );
}

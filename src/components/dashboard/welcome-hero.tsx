"use client";

import { motion } from "framer-motion";
import { Sparkles, ChevronDown, Plus } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Meteors } from "@/components/ui/meteors";
import { MovingBorderButton } from "@/components/ui/moving-border";
import { useBoardStore } from "@/lib/stores/board-store";
import { SPRING } from "@/lib/utils/motion";

// ── Stat counter pill ────────────────────────────────────────────────────────

function StatPill({
  value,
  label,
  delay,
}: {
  value: number;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay }}
      className="flex flex-col items-center gap-1 px-6 py-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm min-w-[100px]"
    >
      <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
        {value}
      </span>
      <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.12em] text-white/30 font-medium">
        {label}
      </span>
    </motion.div>
  );
}

// ── Welcome hero — fullscreen intro section ──────────────────────────────────

export function WelcomeHero() {
  const projects = useBoardStore((s) => s.projects);
  const activeBoard = useBoardStore((s) => s.activeBoard);
  const toggleNewTaskModal = useBoardStore((s) => s.toggleNewTaskModal);

  const totalAgents = activeBoard?.agents.length ?? 0;
  const totalTasks =
    activeBoard?.columns.reduce((sum, col) => sum + col.tasks.length, 0) ?? 0;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4">
      {/* ── Background ambience ── */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="rgba(139, 92, 246, 0.15)"
      />
      <div className="hidden md:block">
        <Spotlight
          className="-top-40 right-60 md:-top-20"
          fill="rgba(6, 182, 212, 0.08)"
        />
      </div>
      <Meteors number={4} className="z-0 hidden sm:block" />

      {/* ── Content stack ── */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl w-full">
        {/* 1. Badge pill */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.1 }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="text-[12px] font-semibold tracking-[0.08em] text-accent uppercase">
              Nebula
            </span>
            <span className="text-[10px] font-mono text-white/25">v0.1</span>
          </div>
        </motion.div>

        {/* 2. Headline */}
        <TextGenerateEffect
          words="Welcome to Nebula"
          className="text-5xl sm:text-7xl md:text-8xl tracking-[-0.04em] leading-[1.05] mb-4"
          duration={0.4}
        />

        {/* 3. Tagline — gradient text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="text-lg sm:text-xl md:text-2xl font-medium leading-relaxed mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white/80 via-accent to-cyan-400"
        >
          Where tickets don&apos;t just get tracked. They get solved.
        </motion.p>

        {/* 4. Blurb */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.5 }}
          className="text-white/35 text-sm sm:text-base max-w-xl leading-relaxed mb-8"
        >
          AI agents plan, analyse, build, test, and deploy your work —
          autonomously across every project in your portfolio.
        </motion.p>

        {/* 5. Live stat counters */}
        <div className="flex items-center gap-3 sm:gap-4 mb-8">
          <StatPill value={projects.length} label="Projects" delay={1.5} />
          <StatPill value={totalAgents} label="Agents" delay={1.6} />
          <StatPill value={totalTasks} label="Tasks" delay={1.7} />
        </div>

        {/* 6. CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 1.8 }}
        >
          <MovingBorderButton
            onClick={toggleNewTaskModal}
            containerClassName="px-6"
          >
            <Plus className="w-4 h-4" />
            New Flow
          </MovingBorderButton>
        </motion.div>
      </div>

      {/* 7. Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.0, duration: 0.5 }}
        className="absolute bottom-8 inset-x-0 flex justify-center"
      >
        <ChevronDown className="w-6 h-6 text-white/15 animate-bounce" />
      </motion.div>

      {/* Bottom fade into dashboard */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-void to-transparent pointer-events-none" />
    </div>
  );
}

"use client";
import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";
import React from "react";

// Deterministic pseudo-random from index to avoid SSR/client hydration mismatch
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

export const Meteors = ({ number, className }: { number?: number; className?: string }) => {
  const meteorCount = number || 5;
  const meteors = new Array(meteorCount).fill(true);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
      {meteors.map((_, idx) => {
        const position = idx * (1200 / meteorCount) - 600;
        const delay = seededRandom(idx) * 8;
        const duration = Math.floor(seededRandom(idx + 100) * 6 + 4);
        return (
          <span
            key={"meteor" + idx}
            className={cn(
              "animate-meteor-effect absolute h-0.5 w-0.5 rotate-[215deg] rounded-[9999px] bg-violet-400 shadow-[0_0_0_1px_#ffffff10] will-change-transform",
              className
            )}
            style={{
              top: "-40px",
              left: position + "px",
              animationDelay: delay + "s",
              animationDuration: duration + "s",
            }}
          />
        );
      })}
    </motion.div>
  );
};

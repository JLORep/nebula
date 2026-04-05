"use client";
import React, { useRef, useCallback } from "react";
import { motion, useAnimationFrame, useMotionTemplate, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils/cn";

export function MovingBorderButton({
  borderRadius = "1.5rem",
  children,
  containerClassName,
  borderClassName,
  duration,
  className,
  ...otherProps
}: {
  borderRadius?: string;
  children: React.ReactNode;
  containerClassName?: string;
  borderClassName?: string;
  duration?: number;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "relative h-11 overflow-hidden bg-transparent p-[1px] group/btn",
        "hover:scale-[1.04] active:scale-[0.97] transition-transform duration-200 will-change-transform",
        containerClassName,
      )}
      style={{ borderRadius }}
      {...otherProps}
    >
      {/* Animated moving border */}
      <div className="absolute inset-0" style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}>
        <MovingBorder duration={duration} rx="30%" ry="30%">
          <div className={cn(
            "h-24 w-24 bg-[radial-gradient(var(--accent)_30%,#06b6d4_60%,transparent_70%)] opacity-[0.9]",
            borderClassName,
          )} />
        </MovingBorder>
      </div>
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
        style={{
          borderRadius: `calc(${borderRadius} * 0.96)`,
          boxShadow: "0 0 24px rgba(139, 92, 246, 0.35), 0 0 48px rgba(6, 182, 212, 0.15)",
        }}
      />
      {/* Inner content */}
      <div
        className={cn(
          "relative flex h-full w-full items-center justify-center gap-2",
          "bg-gradient-to-r from-accent/90 via-accent/80 to-[#7c3aed]/90",
          "text-[13px] font-semibold text-white antialiased",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]",
          className,
        )}
        style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
      >
        {children}
      </div>
    </button>
  );
}

const MovingBorder = ({
  children,
  duration = 3000,
  rx,
  ry,
  ...otherProps
}: {
  children: React.ReactNode;
  duration?: number;
  rx?: string;
  ry?: string;
  [key: string]: unknown;
}) => {
  const pathRef = useRef<SVGRectElement>(null);
  const progress = useMotionValue<number>(0);
  const lastUpdate = useRef(0);

  // Throttle to ~20fps — border animation doesn't need high fidelity
  const onFrame = useCallback((time: number) => {
    if (time - lastUpdate.current < 50) return;
    lastUpdate.current = time;
    const length = pathRef.current?.getTotalLength();
    if (length) {
      const pxPerMillisecond = length / duration;
      progress.set((time * pxPerMillisecond) % length);
    }
  }, [duration, progress]);

  useAnimationFrame(onFrame);

  const x = useTransform(progress, (val) => pathRef.current?.getPointAtLength(val).x ?? 0);
  const y = useTransform(progress, (val) => pathRef.current?.getPointAtLength(val).y ?? 0);
  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

  return (
    <>
      <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="absolute h-full w-full" width="100%" height="100%" {...otherProps}>
        <rect fill="none" width="100%" height="100%" rx={rx} ry={ry} ref={pathRef} />
      </svg>
      <motion.div style={{ position: "absolute", top: 0, left: 0, display: "inline-block", transform, willChange: "transform" }}>
        {children}
      </motion.div>
    </>
  );
};

"use client";

import { memo, useMemo, useRef, useEffect } from "react";
import {
  CheckCircle2,
  ArrowRight,
  ListChecks,
  TrendingUp,
  Brain,
  Zap,
  Circle,
  UserPlus,
  Coins,
  ShieldAlert,
  ShieldCheck,
  XCircle,
  Activity,
} from "lucide-react";
import { useSimulationStore } from "@/lib/stores/simulation-store";
import type { SimEvent } from "@/lib/stores/simulation-store";
import { cn } from "@/lib/utils/cn";

// ============================================================================
// Activity Feed — rolling event stream from the simulation engine
// ============================================================================

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  CheckCircle2,
  ArrowRight,
  ListChecks,
  TrendingUp,
  Brain,
  Zap,
  Circle,
  UserPlus,
  Coins,
  ShieldAlert,
  ShieldCheck,
  XCircle,
};

function timeAgo(timestamp: number): string {
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 3) return "just now";
  if (diff < 60) return `${diff}s`;
  return `${Math.floor(diff / 60)}m`;
}

const FeedItem = memo(function FeedItem({ event }: { event: SimEvent }) {
  const IconComponent = ICON_MAP[event.icon] ?? Circle;

  return (
    <div className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-white/[0.02] transition-colors animate-[fadeSlideIn_0.3s_ease-out]">
      <div
        className="mt-0.5 flex items-center justify-center w-5 h-5 rounded-full shrink-0"
        style={{ backgroundColor: `color-mix(in srgb, ${event.color} 15%, transparent)`, color: event.color }}
      >
        <IconComponent className="w-3 h-3" />
      </div>
      <span className="flex-1 text-[12px] text-white/50 leading-relaxed min-w-0 truncate">
        {event.message}
      </span>
      <span className="text-[10px] font-mono text-white/20 shrink-0 mt-0.5">
        {timeAgo(event.timestamp)}
      </span>
    </div>
  );
});

export function ActivityFeed() {
  const events = useSimulationStore((s) => s.events);
  const running = useSimulationStore((s) => s.running);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep scroll at top (newest first)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [events.length]);

  return (
    <div className="pb-8">
      <div>
        {/* Section divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-white/20 font-medium">Live Activity</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>

        {/* Feed container — glass style matching bento cards */}
        <div className={cn(
          "rounded-2xl p-4 sm:p-5 border border-white/[0.06]",
          "bg-nebula/80",
          "overflow-hidden relative",
        )}>
          <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-accent" />
            <span className="text-[14px] font-semibold text-white/90">Agent Activity</span>
            {running && (
              <span className="flex items-center gap-1.5 ml-auto">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[10px] text-success/60 font-mono">LIVE</span>
              </span>
            )}
          </div>

          {/* Scrolling feed */}
          <div
            ref={scrollRef}
            className="max-h-[320px] overflow-y-auto scrollbar-thin space-y-0.5"
          >
            {events.length > 0 ? (
              events.map((event) => (
                <FeedItem key={event.id} event={event} />
              ))
            ) : (
              <div className="flex items-center justify-center py-8">
                <span className="text-[12px] text-white/20">Awaiting agent activity...</span>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

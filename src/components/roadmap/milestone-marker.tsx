"use client";

import { memo } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Milestone } from "@/lib/types";

interface MilestoneMarkerProps {
  milestone: Milestone;
  themeColor: string;
}

export const MilestoneMarker = memo(function MilestoneMarker({ milestone, themeColor }: MilestoneMarkerProps) {
  const isAchieved = milestone.status === "achieved";
  const isActive = milestone.status === "in_progress";

  return (
    <div className="flex items-center gap-2.5 py-1.5">
      {/* Diamond marker */}
      <div className="relative flex items-center justify-center shrink-0">
        <div
          className={cn(
            "w-5 h-5 rotate-45 rounded-sm border",
            isAchieved && "bg-success/20 border-success/40",
            isActive && "border-white/30",
            !isAchieved && !isActive && "bg-white/[0.04] border-white/[0.08]"
          )}
          style={isActive ? { backgroundColor: `${themeColor}20`, borderColor: `${themeColor}60` } : undefined}
        >
          {isActive && (
            <div
              className="absolute inset-0 rounded-sm rotate-0 animate-pulse-glow"
              style={{ backgroundColor: `${themeColor}15` }}
            />
          )}
        </div>
        {isAchieved && (
          <Check className="absolute w-3 h-3 text-success -rotate-0" />
        )}
      </div>

      {/* Label */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-[12px] font-medium truncate",
            isAchieved ? "text-success/70" : isActive ? "text-white/80" : "text-white/35"
          )}>
            {milestone.name}
          </span>
          {milestone.completionPercent > 0 && milestone.completionPercent < 100 && (
            <span className="text-[10px] font-mono text-white/25">{milestone.completionPercent}%</span>
          )}
        </div>
        <span className="text-[10px] text-white/20">{milestone.targetDate}</span>
      </div>
    </div>
  );
});

"use client";
import { cn } from "@/lib/utils/cn";
import React from "react";

export const BentoGrid = ({ className, children }: { className?: string; children?: React.ReactNode }) => {
  return (
    <div className={cn(
      "grid grid-cols-1 gap-3",
      "sm:grid-cols-2 md:grid-cols-3",
      "md:auto-rows-[18rem]",
      className
    )}>
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "group/bento row-span-1 flex flex-col justify-between space-y-4 rounded-2xl p-4 sm:p-5",
        "bg-nebula/80 border border-white/[0.06]",
        "hover:border-white/[0.14] hover:bg-cosmos/90",
        "transition-[background-color,border-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer overflow-hidden relative contain-paint",
        className
      )}
    >
      <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/bento:opacity-100 transition-opacity duration-300" />
      {header}
      <div className="transition duration-200 group-hover/bento:translate-x-2">
        {icon}
        <div className="mt-2 mb-1 text-[14px] sm:text-[15px] font-semibold tracking-[-0.01em] text-white/90">
          {title}
        </div>
        <div className="text-[12px] sm:text-[13px] font-normal text-white/40 leading-relaxed">
          {description}
        </div>
      </div>
    </div>
  );
};

"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// ============================================================================
// SelectMenu — Sexy dropdown with icons, colors, and spring animations
// ============================================================================

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  description?: string;
}

interface SelectMenuProps {
  options: SelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function SelectMenu({ options, value, onChange, placeholder = "Select...", label, className }: SelectMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      {label && (
        <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-white/25 mb-1.5">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left",
          "bg-white/[0.03] border border-white/[0.06]",
          "hover:bg-white/[0.05] hover:border-white/[0.10]",
          "focus:outline-none focus:border-accent/30 focus:bg-white/[0.04]",
          "transition-[background-color,border-color] duration-150",
          open && "border-accent/30 bg-white/[0.04]"
        )}
      >
        {selected ? (
          <>
            {selected.icon && <span className="shrink-0">{selected.icon}</span>}
            {selected.color && !selected.icon && (
              <div className="w-3 h-3 rounded-md shrink-0" style={{ backgroundColor: selected.color }} />
            )}
            <span className="text-[13px] text-white/80 flex-1 truncate">{selected.label}</span>
          </>
        ) : (
          <span className="text-[13px] text-white/25 flex-1">{placeholder}</span>
        )}
        <ChevronDown className={cn(
          "w-3.5 h-3.5 text-white/20 shrink-0 transition-transform duration-200",
          open && "rotate-180"
        )} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
            className="absolute z-50 left-0 right-0 mt-1.5 rounded-xl border border-white/[0.08] bg-nebula/[0.99] backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            <div className="p-1 max-h-[240px] overflow-y-auto scrollbar-thin">
              {options.map((option) => {
                const isSelected = value === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => { onChange(option.value); setOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors duration-100",
                      isSelected
                        ? "bg-accent/10"
                        : "hover:bg-white/[0.04]"
                    )}
                  >
                    {option.icon && <span className="shrink-0">{option.icon}</span>}
                    {option.color && !option.icon && (
                      <div className="w-3 h-3 rounded-md shrink-0" style={{ backgroundColor: option.color }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className={cn(
                        "text-[13px] block truncate",
                        isSelected ? "text-accent font-medium" : "text-white/70"
                      )}>
                        {option.label}
                      </span>
                      {option.description && (
                        <span className="text-[10px] text-white/25 block truncate mt-0.5">
                          {option.description}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-accent shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

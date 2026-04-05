"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useBoardStore } from "@/lib/stores/board-store";

export function ProjectSelector() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const projects = useBoardStore((s) => s.projects);
  const activeProject = useBoardStore((s) => s.activeProject);
  const setActiveProject = useBoardStore((s) => s.setActiveProject);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!activeProject) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all duration-200 border",
          open
            ? "bg-white/[0.08] border-white/[0.1] text-white/80"
            : "bg-white/[0.03] border-white/[0.06] text-white/50 hover:text-white/80 hover:bg-white/[0.06]"
        )}
      >
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: activeProject.color }} />
        <span className="max-w-[140px] truncate">{activeProject.name}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform text-white/30", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            className="absolute top-full left-0 mt-2 w-72 rounded-xl border border-white/[0.08] bg-nebula/98 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden z-50"
          >
            <div className="px-3 pt-2.5 pb-1.5">
              <span className="text-[9px] uppercase tracking-[0.12em] text-white/20 font-semibold">Switch project</span>
            </div>
            <div className="p-1.5 pt-0">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => { setActiveProject(project.id); setOpen(false); }}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-colors duration-150 text-left",
                    project.id === activeProject.id
                      ? "bg-white/[0.06]"
                      : "hover:bg-white/[0.04]"
                  )}
                >
                  <div
                    className="w-3 h-3 rounded-md shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold text-white/80 truncate">{project.name}</span>
                      <span className="text-[10px] font-mono text-white/20 shrink-0">{project.key}</span>
                    </div>
                    <span className="text-[10px] text-white/25 truncate block">{project.description}</span>
                  </div>
                  {project.id === activeProject.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

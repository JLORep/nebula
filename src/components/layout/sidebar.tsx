"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Kanban,
  Bot,
  Shield,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useBoardStore } from "@/lib/stores/board-store";
import { SPRING } from "@/lib/utils/motion";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Kanban, label: "Boards", href: "/boards", active: true },
  { icon: Bot, label: "Agents", href: "/agents" },
  { icon: Shield, label: "Scanner", href: "/scanner" },
  { icon: ShieldCheck, label: "Gates", href: "/gates" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { boards, activeBoard, setActiveBoard } = useBoardStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 68 : 260 }}
      transition={SPRING}
      className="relative flex flex-col h-full shrink-0 overflow-hidden
                 glass-strong"
    >
      {/* Top edge highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent z-10" />

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-[72px] shrink-0">
        <div
          className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-accent/20 glow-accent
                     hover:scale-105 active:scale-95 transition-transform duration-200 will-change-transform"
        >
          <Zap className="w-[18px] h-[18px] text-accent" />
          <div className="absolute inset-0 rounded-xl gradient-border" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={SPRING}
              className="flex flex-col"
            >
              <span className="text-[15px] font-semibold tracking-[-0.02em] text-white/95">NEBULA</span>
              <span className="text-[10px] text-white/30 font-mono tracking-wider">v0.1.0</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {navItems.map((item, idx) => (
          <button
            key={item.label}
            className={cn(
              "relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] font-medium",
              "transition-[color,transform] duration-200 will-change-transform",
              "hover:translate-x-0.5 active:scale-[0.97]",
              "animate-[fadeSlideIn_0.4s_var(--ease-out-expo)_both]",
              item.active
                ? "text-white/95"
                : "text-white/40 hover:text-white/70"
            )}
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            {item.active && (
              <div className="absolute inset-0 rounded-xl bg-white/[0.06] border border-white/[0.08]" />
            )}
            <item.icon className="relative w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span className="relative">{item.label}</span>}
          </button>
        ))}

        {/* Project list */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={SPRING}
              className="pt-6"
            >
              <div className="px-3 pb-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/25">
                  Projects
                </span>
              </div>
              {boards.map((board, idx) => (
                <button
                  key={board.id}
                  onClick={() => setActiveBoard(board.id)}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-2 rounded-xl text-[13px]",
                    "transition-[color,transform] duration-200 will-change-transform",
                    "hover:translate-x-0.5 active:scale-[0.97]",
                    "animate-[fadeSlideIn_0.4s_var(--ease-out-expo)_both]",
                    activeBoard?.id === board.id
                      ? "text-accent font-medium"
                      : "text-white/35 hover:text-white/60"
                  )}
                  style={{ animationDelay: `${300 + idx * 50}ms` }}
                >
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full shrink-0 transition-[background-color,box-shadow] duration-300",
                      activeBoard?.id === board.id
                        ? "bg-accent shadow-[0_0_8px_rgba(139,92,246,0.4)]"
                        : "bg-white/10"
                    )}
                  />
                  <span className="truncate">{board.name}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-12 border-t border-white/[0.06] text-white/25 hover:text-white/50 hover:bg-white/[0.04] active:scale-95 transition-[color,background-color,transform] duration-200"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </motion.aside>
  );
}

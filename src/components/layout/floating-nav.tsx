"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Zap, LayoutDashboard, Kanban, Map, Bot, Shield, ShieldCheck, Bell, Sun, Moon, Play, Pause, RotateCcw, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useThemeStore } from "@/lib/stores/theme-store";
import { useSimulationStore } from "@/lib/stores/simulation-store";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Kanban, label: "Board", href: "/board" },
  { icon: Map, label: "Roadmap", href: "/roadmap" },
  { icon: Bot, label: "Agents", href: "/agents" },
  { icon: Shield, label: "Scanner", href: "/scanner" },
  { icon: ShieldCheck, label: "Gates", href: "/gates" },
];

function SimControls() {
  const running = useSimulationStore((s) => s.running);
  const start = useSimulationStore((s) => s.start);
  const stop = useSimulationStore((s) => s.stop);

  return (
    <div className="flex items-center gap-0.5 px-1 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
      <button
        onClick={running ? stop : start}
        className="flex items-center justify-center w-7 h-7 rounded-md text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-colors duration-150"
        title={running ? "Pause simulation" : "Play simulation"}
      >
        {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
      </button>
      <button
        onClick={() => {
          stop();
          useSimulationStore.setState({ events: [], tickCount: 0 });
          setTimeout(start, 50);
        }}
        className="flex items-center justify-center w-7 h-7 rounded-md text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-colors duration-150"
        title="Restart simulation"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
      {running && (
        <span className="flex items-center gap-1 px-1">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[9px] font-mono text-white/25">SIM</span>
        </span>
      )}
    </div>
  );
}

export function FloatingNav() {
  const [visible, setVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useMotionValueEvent(scrollY, "change", (current) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (current < 100) {
      setVisible(true);
    } else if (current > prev) {
      setVisible(false);
    } else {
      setVisible(true);
    }
  });

  return (
    <AnimatePresence mode="wait">
      <motion.nav
        initial={{ opacity: 1, y: -100 }}
        animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 28, mass: 1 }}
        className="fixed top-4 inset-x-0 mx-auto z-50 max-w-5xl px-4"
      >
        <div className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-void/80 backdrop-blur-md px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] gpu">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-accent/20">
              <Zap className="w-4 h-4 text-accent" />
              <div className="absolute inset-0 rounded-xl bg-accent/10 animate-pulse-glow" />
            </div>
            <span className="text-[15px] font-bold tracking-[-0.03em] text-white/90">NEBULA</span>
          </Link>

          {/* Hamburger button — mobile only */}
          <button
            className="md:hidden p-2 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-colors duration-200"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Center nav items — desktop only */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[13px] font-medium transition-colors duration-200",
                    isActive
                      ? "text-white/90"
                      : "text-white/40 hover:text-white/80 hover:bg-white/[0.06]"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-xl bg-white/[0.08] border border-white/[0.06]"
                      transition={{ type: "spring", stiffness: 280, damping: 30 }}
                    />
                  )}
                  <item.icon className="relative w-4 h-4" />
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <SimControls />

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button className="relative p-2 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors duration-200">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger" />
            </button>
          </div>
        </div>

        {/* Mobile menu overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="md:hidden mt-2 overflow-hidden rounded-2xl border border-white/[0.08] bg-void/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
            >
              <div className="flex flex-col py-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-5 py-3 text-[14px] font-medium transition-colors duration-200",
                        isActive
                          ? "text-white/90 bg-white/[0.08]"
                          : "text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
                      )}
                    >
                      <item.icon className="w-4.5 h-4.5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </AnimatePresence>
  );
}

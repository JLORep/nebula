"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, TrendingUp, ShieldAlert, Lightbulb, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAdvisorStore } from "@/lib/stores/advisor-store";
import type { AdvisorMessageType } from "@/lib/stores/advisor-store";
import { SPRING_GENTLE } from "@/lib/utils/motion";

// ============================================================================
// AI Advisor — collapsible chat bubble (bottom-right, Facebook Messenger style)
// Collapsed: floating circle button | Expanded: glass chat panel
// ============================================================================

const messageTypeConfig: Record<AdvisorMessageType, { icon: typeof Bot; color: string; bg: string }> = {
  insight: { icon: TrendingUp, color: "text-accent", bg: "bg-accent/10" },
  alert: { icon: ShieldAlert, color: "text-warning", bg: "bg-warning/10" },
  recommendation: { icon: Lightbulb, color: "text-cyan-400", bg: "bg-cyan-400/10" },
  completion: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  system: { icon: Info, color: "text-white/30", bg: "bg-white/[0.04]" },
};

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function AdvisorMessage({ msg }: { msg: { id: string; timestamp: number; type: AdvisorMessageType; content: string; action: string | null } }) {
  const config = messageTypeConfig[msg.type];
  const Icon = config.icon;

  return (
    <div className="flex gap-2.5 animate-[fadeSlideIn_0.3s_ease-out_forwards]">
      <div className={cn("flex items-center justify-center w-7 h-7 rounded-lg shrink-0 mt-0.5", config.bg)}>
        <Icon className={cn("w-3.5 h-3.5", config.color)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] text-white/70 leading-relaxed">{msg.content}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[9px] text-white/20 font-mono">{formatTime(msg.timestamp)}</span>
          {msg.action && (
            <button className="text-[10px] text-accent/70 hover:text-accent transition-colors duration-150">
              {msg.action}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function AIAdvisor() {
  const isOpen = useAdvisorStore((s) => s.isOpen);
  const messages = useAdvisorStore((s) => s.messages);
  const unreadCount = useAdvisorStore((s) => s.unreadCount);
  const toggle = useAdvisorStore((s) => s.toggle);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isOpen, messages.length]);

  return (
    <>
      {/* Expanded chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={SPRING_GENTLE}
            className="fixed bottom-[130px] right-4 w-[360px] h-[480px] z-50 flex flex-col rounded-2xl border border-white/[0.08] bg-modal/98 backdrop-blur-md shadow-[0_8px_40px_rgba(0,0,0,0.4)] overflow-hidden gpu"
          >
            {/* Top edge highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent z-10" />

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-cyan-500 shadow-[0_0_12px_rgba(139,92,246,0.3)]">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h3 className="text-[13px] font-semibold text-white/90">FLOW Advisor</h3>
                  <p className="text-[9px] text-white/25">Live sprint intelligence</p>
                </div>
              </div>
              <button
                onClick={toggle}
                className="p-1.5 rounded-lg text-white/25 hover:text-white/50 hover:bg-white/[0.06] transition-colors duration-150"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
              {messages.map((msg) => (
                <AdvisorMessage key={msg.id} msg={msg} />
              ))}
            </div>

            {/* Footer hint */}
            <div className="shrink-0 px-4 py-2.5 border-t border-white/[0.06]">
              <p className="text-[10px] text-white/15 text-center">
                Insights auto-generated from agent activity
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating bubble button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.5 }}
        onClick={toggle}
        className={cn(
          "fixed bottom-[130px] right-4 z-50 flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200",
          "shadow-[0_4px_20px_rgba(139,92,246,0.3)]",
          isOpen
            ? "bg-white/[0.06] border border-white/[0.08] scale-0 pointer-events-none"
            : "bg-gradient-to-br from-accent to-cyan-500 hover:shadow-[0_4px_28px_rgba(139,92,246,0.5)] hover:scale-105 active:scale-95"
        )}
      >
        <Bot className="w-5 h-5 text-white" />
        {/* Notification badge */}
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-white text-[9px] font-bold shadow-[0_2px_8px_rgba(239,68,68,0.4)]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        {/* Pulse ring when there are unread messages */}
        {unreadCount > 0 && !isOpen && (
          <span className="absolute inset-0 rounded-full bg-accent/30 animate-ping" />
        )}
      </motion.button>
    </>
  );
}

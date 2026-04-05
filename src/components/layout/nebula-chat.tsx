"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useNebulaChatStore } from "@/lib/stores/nebula-chat-store";
import { useBoardStore } from "@/lib/stores/board-store";
import { SPRING_GENTLE } from "@/lib/utils/motion";
import type { ChatSender } from "@/lib/stores/nebula-chat-store";
import type { AgentStatus } from "@/lib/types";

// ============================================================================
// Nebula Chat — left-side docked DM panel with Nebula AI
// Symmetrical with AIAdvisor on the right
// ============================================================================

const agentBgColors: Record<string, string> = {
  Athena: "bg-cyan-400/20",
  Blueprint: "bg-violet-400/20",
  Flow: "bg-emerald-400/20",
  Sentinel: "bg-blue-400/20",
  Oracle: "bg-amber-400/20",
  Nexus: "bg-teal-400/20",
  Cipher: "bg-orange-400/20",
  Spark: "bg-lime-400/20",
  Atlas: "bg-indigo-400/20",
  Prism: "bg-pink-400/20",
  Forge: "bg-emerald-400/20",
};

const agentTextColors: Record<string, string> = {
  Athena: "text-cyan-400",
  Blueprint: "text-violet-400",
  Flow: "text-emerald-400",
  Sentinel: "text-blue-400",
  Oracle: "text-amber-400",
  Nexus: "text-teal-400",
  Cipher: "text-orange-400",
  Spark: "text-lime-400",
  Atlas: "text-indigo-400",
  Prism: "text-pink-400",
  Forge: "text-emerald-400",
};

const statusConfig: Record<AgentStatus, { dot: string }> = {
  idle: { dot: "bg-white/20" },
  thinking: { dot: "bg-accent" },
  executing: { dot: "bg-success" },
  awaiting_approval: { dot: "bg-warning" },
  completed: { dot: "bg-success" },
  failed: { dot: "bg-danger" },
};

const placeholders = [
  "Message Nebula AI...",
  "Ask about sprint progress...",
  "Query agent activity...",
  "Request a task summary...",
  "Ask about blockers...",
];

const CYCLE_INTERVAL = 3500;

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function MessageBubble({ msg }: { msg: { sender: ChatSender; agentName?: string; agentColor?: string; content: string; timestamp: number } }) {
  if (msg.sender === "user") {
    return (
      <div className="flex justify-end animate-[fadeSlideIn_0.3s_ease-out_forwards]">
        <div className="max-w-[85%] px-3 py-2 rounded-2xl rounded-br-md bg-white/[0.08] border border-white/[0.06]">
          <p className="text-[12px] text-white/80 leading-relaxed">{msg.content}</p>
          <span className="block text-[9px] text-white/20 font-mono mt-1 text-right">{formatTime(msg.timestamp)}</span>
        </div>
      </div>
    );
  }

  if (msg.sender === "nebula") {
    return (
      <div className="flex gap-2.5 animate-[fadeSlideIn_0.3s_ease-out_forwards]">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0 mt-0.5 bg-gradient-to-br from-accent to-cyan-500 shadow-[0_0_8px_rgba(139,92,246,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] text-white/70 leading-relaxed">{msg.content}</p>
          <span className="text-[9px] text-white/20 font-mono mt-1 block">{formatTime(msg.timestamp)}</span>
        </div>
      </div>
    );
  }

  if (msg.sender === "agent") {
    const textColor = msg.agentColor ?? "text-white/60";
    return (
      <div className="flex gap-2.5 animate-[fadeSlideIn_0.3s_ease-out_forwards]">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0 mt-0.5 bg-white/[0.04]">
          <span className={cn("text-[9px] font-bold", textColor)}>{(msg.agentName ?? "A")[0]}</span>
        </div>
        <div className="min-w-0 flex-1">
          <span className={cn("text-[10px] font-semibold", textColor)}>{msg.agentName}</span>
          <p className="text-[12px] text-white/60 leading-relaxed">{msg.content}</p>
          <span className="text-[9px] text-white/20 font-mono mt-1 block">{formatTime(msg.timestamp)}</span>
        </div>
      </div>
    );
  }

  // system
  return (
    <div className="animate-[fadeSlideIn_0.3s_ease-out_forwards]">
      <p className="text-[11px] text-white/25 italic leading-relaxed text-center px-4">{msg.content}</p>
      <span className="block text-[9px] text-white/15 font-mono mt-0.5 text-center">{formatTime(msg.timestamp)}</span>
    </div>
  );
}

export function NebulaChat() {
  const isOpen = useNebulaChatStore((s) => s.isOpen);
  const messages = useNebulaChatStore((s) => s.messages);
  const unreadCount = useNebulaChatStore((s) => s.unreadCount);
  const toggle = useNebulaChatStore((s) => s.toggle);
  const pushMessage = useNebulaChatStore((s) => s.pushMessage);

  const activeBoard = useBoardStore((s) => s.activeBoard);
  const agents = activeBoard?.agents ?? [];
  const activeAgentCount = agents.filter((a) => a.status === "executing" || a.status === "thinking").length;

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isOpen, messages.length]);

  // Cycle placeholders
  useEffect(() => {
    if (inputValue) return;
    const id = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % placeholders.length);
    }, CYCLE_INTERVAL);
    return () => clearInterval(id);
  }, [inputValue]);

  // Auto-resize textarea
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 100)}px`;
  }, []);

  useEffect(() => { autoResize(); }, [inputValue, autoResize]);

  const handleSubmit = () => {
    if (!inputValue.trim()) return;
    pushMessage({ sender: "user", content: inputValue.trim() });
    setInputValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Simulated response
    setTimeout(() => {
      pushMessage({
        sender: "nebula",
        content: "Processing your request across the agent fleet. I\u2019ll have an update shortly.",
      });
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasInput = inputValue.trim().length > 0;

  return (
    <>
      {/* Docked panel */}
      <motion.div
        initial={false}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={SPRING_GENTLE}
        className="fixed left-0 top-[72px] bottom-0 w-[340px] z-40 flex flex-col bg-void/90 backdrop-blur-xl border-r border-white/[0.08] gpu"
      >
        {/* Top edge highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent z-10" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-cyan-500 shadow-[0_0_12px_rgba(139,92,246,0.3)]">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h3 className="text-[13px] font-semibold text-white/90">Nebula AI</h3>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                <p className="text-[9px] text-white/25">Online</p>
              </div>
            </div>
          </div>
          <button
            onClick={toggle}
            className="p-1.5 rounded-lg text-white/25 hover:text-white/50 hover:bg-white/[0.06] transition-colors duration-150"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Agent Roster Strip */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] shrink-0 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 shrink-0">
            {agents.slice(0, 8).map((agent) => {
              const bgColor = agentBgColors[agent.name] ?? "bg-white/[0.06]";
              const textColor = agentTextColors[agent.name] ?? "text-white/40";
              const isActive = agent.status === "executing" || agent.status === "thinking";
              return (
                <div key={agent.id} className="relative group/avatar" title={`${agent.name} — ${agent.status}`}>
                  <div className={cn(
                    "flex items-center justify-center w-7 h-7 rounded-full text-[9px] font-bold",
                    bgColor, textColor
                  )}>
                    {agent.avatar}
                  </div>
                  <span className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-void",
                    statusConfig[agent.status].dot,
                    isActive && "animate-pulse"
                  )} />
                </div>
              );
            })}
          </div>
          <span className="text-[10px] text-white/20 whitespace-nowrap shrink-0">
            {activeAgentCount} active
          </span>
        </div>

        {/* Chat Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
        </div>

        {/* Input Area */}
        <div className="shrink-0 px-3 py-3 border-t border-white/[0.06]">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholders[placeholderIdx]}
              rows={1}
              className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2 text-[12px] text-white/80 placeholder:text-white/20 outline-none resize-none min-h-[36px] max-h-[100px] focus:border-accent/20 transition-colors duration-200"
            />
            <motion.button
              onClick={handleSubmit}
              disabled={!hasInput}
              whileHover={hasInput ? { scale: 1.08 } : undefined}
              whileTap={hasInput ? { scale: 0.92 } : undefined}
              className={cn(
                "flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-all duration-200",
                hasInput
                  ? "bg-gradient-to-br from-accent to-cyan-500 text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]"
                  : "bg-white/[0.04] text-white/15 cursor-not-allowed"
              )}
            >
              <Send className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>

        {/* Bottom edge gradient */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      </motion.div>

      {/* Collapsed pill button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={toggle}
            className="fixed left-3 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center w-10 h-10 rounded-full bg-void/80 backdrop-blur-md border border-accent/25 shadow-[0_0_20px_rgba(139,92,246,0.35),0_0_40px_rgba(139,92,246,0.15),0_4px_20px_rgba(0,0,0,0.3)] hover:bg-white/[0.06] hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <span className="absolute inset-0 rounded-full bg-accent/15 animate-pulse-glow" />
            <Sparkles className="w-4 h-4 text-accent relative z-10" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 z-20 flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-danger text-white text-[8px] font-bold shadow-[0_2px_8px_rgba(239,68,68,0.4)]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
            {unreadCount > 0 && (
              <span className="absolute inset-0 rounded-full bg-accent/20 animate-ping z-10" />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

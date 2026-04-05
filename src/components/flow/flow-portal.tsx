"use client";

import { useState, useCallback, useMemo, memo, useRef, useEffect, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Zap, ChevronRight, ChevronLeft, Sparkles, Bot, Send,
  Code, Bug, Plug, Database, RefreshCw,
  Shield, Lock,
  Cloud, GitBranch, AlertTriangle,
  BarChart3, Brain, Search,
  Palette, Rocket, BookOpen,
  Headphones, FileText, DollarSign, Users,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { SPRING, SPRING_SNAPPY, SPRING_GENTLE } from "@/lib/utils/motion";
import { useBoardStore } from "@/lib/stores/board-store";
import { flowTemplates, FLOW_CATEGORIES } from "@/lib/mock-data/flow-templates";
import type { FlowTemplate } from "@/lib/types";
import type { FlowCategoryMeta } from "@/lib/mock-data/flow-templates";

// ── Icon registry ──────────────────────────────────────────────────────────
const ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Code, Bug, Plug, Database, RefreshCw,
  Shield, Lock,
  Cloud, GitBranch, AlertTriangle,
  BarChart3, Brain, Search,
  Palette, Rocket, BookOpen,
  Headphones, FileText, DollarSign, Users,
};

const COMPLEXITY_LABELS: Record<string, { label: string; color: string }> = {
  starter: { label: "Starter", color: "text-success" },
  standard: { label: "Standard", color: "text-info" },
  advanced: { label: "Advanced", color: "text-warning" },
  enterprise: { label: "Enterprise", color: "text-accent" },
};

type PortalView = "categories" | "all";

// Precompute flow counts per category (static data, never changes)
const CATEGORY_FLOW_COUNTS: Record<string, number> = {};
for (const cat of FLOW_CATEGORIES) {
  CATEGORY_FLOW_COUNTS[cat.key] = flowTemplates.filter((t) => t.category === cat.key).length;
}

// ── Skeleton Loader ────────────────────────────────────────────────────────
function CardSkeleton({ count, delay = 0 }: { count: number; delay?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="relative p-5 rounded-2xl bg-nebula/80 border border-white/[0.06] overflow-hidden"
          style={{ animationDelay: `${delay + i * 60}ms` }}
        >
          {/* Shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-shimmer" />
          {/* Icon placeholder */}
          <div className="w-11 h-11 rounded-xl bg-white/[0.04] mb-4" />
          {/* Title placeholder */}
          <div className="h-4 w-3/4 rounded bg-white/[0.04] mb-2" />
          {/* Tagline placeholder */}
          <div className="h-3 w-full rounded bg-white/[0.03] mb-1" />
          <div className="h-3 w-1/2 rounded bg-white/[0.03] mb-4" />
          {/* Footer placeholder */}
          <div className="h-3 w-1/3 rounded bg-white/[0.03] mt-auto" />
        </div>
      ))}
    </>
  );
}

function CategorySkeleton() {
  return (
    <>
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className="relative p-6 rounded-2xl bg-nebula/80 border border-white/[0.06] overflow-hidden"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-shimmer" />
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] mb-5" />
          <div className="h-5 w-1/2 rounded bg-white/[0.04] mb-2" />
          <div className="h-3 w-full rounded bg-white/[0.03] mb-1" />
          <div className="h-3 w-3/4 rounded bg-white/[0.03] mb-5" />
          <div className="h-3 w-1/3 rounded bg-white/[0.03]" />
        </div>
      ))}
      {/* Custom card skeleton */}
      <div className="col-span-1 sm:col-span-2 lg:col-span-3 relative p-6 rounded-2xl bg-nebula/80 border border-white/[0.06] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-shimmer" />
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] shrink-0" />
          <div className="flex-1">
            <div className="h-5 w-2/3 rounded bg-white/[0.04] mb-2" />
            <div className="h-3 w-full rounded bg-white/[0.03]" />
          </div>
        </div>
      </div>
    </>
  );
}

// ── Category Card — Pure CSS hover for perf ────────────────────────────────
const CategoryCard = memo(function CategoryCard({
  category,
  flowCount,
  onSelect,
  index,
}: {
  category: FlowCategoryMeta;
  flowCount: number;
  onSelect: () => void;
  index: number;
}) {
  const Icon = ICONS[category.icon] ?? Zap;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col p-6 rounded-2xl cursor-pointer text-left",
        "bg-nebula/80 border border-white/[0.06]",
        "transition-[transform,opacity,border-color,background-color,box-shadow] duration-300 will-change-transform",
        "hover:-translate-y-1.5 hover:bg-cosmos/80 hover:border-white/[0.12] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)]",
        "active:scale-[0.97]",
        "animate-[fadeSlideIn_0.5s_var(--ease-out-expo)_both]",
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Top edge highlight */}
      <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Gradient glow */}
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none", category.gradient)} />

      {/* Icon */}
      <div className="relative mb-5">
        <div
          className="flex items-center justify-center w-14 h-14 rounded-2xl border transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: `${category.color}12`, borderColor: `${category.color}25` }}
        >
          <Icon className="w-7 h-7" style={{ color: category.color }} />
        </div>
      </div>

      {/* Title + flow count */}
      <div className="relative flex items-center gap-2.5 mb-2">
        <h3 className="text-[17px] font-bold tracking-[-0.02em] text-white/90 group-hover:text-white transition-colors duration-200">
          {category.label}
        </h3>
        <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[10px] font-mono text-white/25">
          {flowCount}
        </span>
      </div>

      {/* Description */}
      <p className="relative text-[12px] text-white/35 leading-relaxed mb-5 line-clamp-2 group-hover:text-white/45 transition-colors duration-200">
        {category.description}
      </p>

      {/* Footer */}
      <div className="relative mt-auto flex items-center gap-1.5">
        <span className="text-[11px] font-medium" style={{ color: category.color }}>Explore flows</span>
        <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" style={{ color: category.color }} />
      </div>
    </button>
  );
});

// ── Custom AI Card — Pure CSS ──────────────────────────────────────────────
const CustomAICard = memo(function CustomAICard({ onSelect, index }: { onSelect: () => void; index: number }) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col p-6 rounded-2xl cursor-pointer text-left col-span-1 sm:col-span-2 lg:col-span-3",
        "bg-nebula/80 border border-white/[0.06]",
        "transition-[transform,background-color,border-color,box-shadow] duration-300 will-change-transform",
        "hover:bg-cosmos/80 hover:border-accent/20 hover:shadow-[0_12px_40px_rgba(139,92,246,0.15)]",
        "active:scale-[0.98]",
        "animate-[fadeSlideIn_0.5s_var(--ease-out-expo)_both]",
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Gradient border */}
      <div className="absolute inset-0 rounded-2xl gradient-border pointer-events-none" />
      {/* Top edge highlight */}
      <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      <div className="relative flex items-center gap-5">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/15 border border-accent/25 transition-transform duration-300 group-hover:scale-110 shrink-0">
          <Sparkles className="w-7 h-7 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[17px] font-bold tracking-[-0.02em] text-white/90 group-hover:text-white transition-colors duration-200 mb-1">
            What would you like to build today?
          </h3>
          <p className="text-[12px] text-white/35 leading-relaxed group-hover:text-white/45 transition-colors duration-200">
            Describe your vision in plain English — AI designs a custom workflow with specialised agents tailored to your exact needs.
          </p>
        </div>
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 shrink-0 group-hover:bg-accent/20 transition-colors duration-200">
          <ChevronRight className="w-5 h-5 text-accent transition-transform duration-200 group-hover:translate-x-0.5" />
        </div>
      </div>
    </button>
  );
});

// ── Custom AI Prompt Panel ─────────────────────────────────────────────────
const CustomPromptPanel = memo(function CustomPromptPanel({ onClose }: { onClose: () => void }) {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Tell me what you want to build. I'll design a custom workflow with specialised AI agents to make it happen.\n\nYou can describe a project, a problem to solve, or a process to automate — as detailed or high-level as you like." },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(() => {
    if (!prompt.trim() || isThinking) return;
    const userMsg = prompt.trim();
    setPrompt("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setIsThinking(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: `Great — I can see a clear workflow taking shape.\n\nI'd structure this as a **3-sprint project** with the following agent squad:\n\n• **Architect** — Maps requirements into epics and technical design\n• **Builder** — Implements the core functionality across your stack\n• **Validator** — Tests thoroughly and ensures quality gates pass\n• **Deployer** — Ships to staging with rollback safety nets\n\nWould you like me to launch this flow? I can customise the agents further based on your tech stack and preferences.`,
        },
      ]);
      setIsThinking(false);
    }, 2000);
  }, [prompt, isThinking]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06] shrink-0">
        <button onClick={onClose} className="p-1.5 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition-colors duration-150">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-accent/15 border border-accent/25">
          <Sparkles className="w-4 h-4 text-accent" />
        </div>
        <div>
          <h3 className="text-[14px] font-semibold text-white/90">Custom Flow Builder</h3>
          <p className="text-[10px] text-white/25">AI-powered workflow design</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesRef} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={cn(
              "flex gap-3 animate-[fadeSlideIn_0.35s_var(--ease-out-expo)_both]",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === "ai" && (
              <div className="flex items-start justify-center w-8 h-8 rounded-xl bg-accent/15 border border-accent/20 shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-accent mt-2" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[80%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap",
                msg.role === "user"
                  ? "bg-accent/15 border border-accent/20 text-white/85"
                  : "bg-white/[0.03] border border-white/[0.06] text-white/60"
              )}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-3 animate-[fadeSlideIn_0.2s_ease-out_both]">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-accent/15 border border-accent/20 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse-glow" />
            </div>
            <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <span className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-pulse" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-pulse" style={{ animationDelay: "200ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-pulse" style={{ animationDelay: "400ms" }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-white/[0.06] shrink-0">
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Describe what you'd like to build..."
            rows={1}
            className="flex-1 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[13px] text-white/80 placeholder:text-white/20 resize-none focus:outline-none focus:border-accent/30 focus:bg-white/[0.04] transition-colors duration-150"
            style={{ minHeight: "44px", maxHeight: "120px" }}
          />
          <button
            onClick={handleSend}
            disabled={!prompt.trim() || isThinking}
            className={cn(
              "flex items-center justify-center w-11 h-11 rounded-xl transition-[background-color,box-shadow,color] duration-200 shrink-0 active:scale-95",
              prompt.trim()
                ? "bg-accent text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                : "bg-white/[0.04] text-white/15 border border-white/[0.06]"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

// ── Flow Card — Pure CSS hover, no framer per-card ─────────────────────────
const FlowCard = memo(function FlowCard({
  template,
  isSelected,
  onSelect,
  index,
}: {
  template: FlowTemplate;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}) {
  const Icon = ICONS[template.icon] ?? Zap;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col items-start p-5 rounded-2xl border text-left overflow-hidden",
        "bg-nebula/80",
        "transition-[transform,opacity,border-color,background-color,box-shadow] duration-200 will-change-transform",
        "hover:-translate-y-1 hover:bg-cosmos/80 hover:border-white/[0.12] hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]",
        "active:scale-[0.97]",
        "animate-[fadeSlideIn_0.45s_var(--ease-out-expo)_both]",
        isSelected
          ? "border-white/20 bg-cosmos/80 shadow-[0_0_40px_rgba(139,92,246,0.15)]"
          : "border-white/[0.06]"
      )}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Top edge highlight */}
      <div className="absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Gradient glow on hover */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br rounded-2xl pointer-events-none transition-opacity duration-500",
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-60",
          template.gradient
        )}
      />

      {/* Selected edge highlight */}
      {isSelected && (
        <div className="absolute inset-x-3 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${template.color}50, transparent)` }} />
      )}

      {/* Priority-style color bar */}
      <div
        className="absolute top-5 left-0 w-[3px] h-8 rounded-r-full"
        style={{
          backgroundColor: template.color,
          boxShadow: isSelected ? `0 0 8px ${template.color}50` : undefined,
          opacity: isSelected ? 1 : 0.4,
        }}
      />

      {/* Icon */}
      <div className="relative mb-4">
        <div
          className="flex items-center justify-center w-11 h-11 rounded-xl border transition-transform duration-200 group-hover:scale-105"
          style={{ backgroundColor: `${template.color}12`, borderColor: `${template.color}${isSelected ? "40" : "20"}` }}
        >
          <Icon className="w-5 h-5" style={{ color: template.color }} />
        </div>
      </div>

      {/* Name + tagline */}
      <div className="relative">
        <h3 className={cn(
          "text-[14px] font-semibold tracking-[-0.01em] mb-1 transition-colors duration-200",
          isSelected ? "text-white/95" : "text-white/70 group-hover:text-white/90"
        )}>
          {template.name}
        </h3>
        <p className="text-[11px] text-white/30 leading-relaxed line-clamp-2">{template.tagline}</p>
      </div>

      {/* Footer */}
      <div className="relative flex items-center gap-2 mt-auto pt-4">
        <span className={cn("text-[9px] font-semibold uppercase tracking-wider", COMPLEXITY_LABELS[template.complexity].color)}>
          {COMPLEXITY_LABELS[template.complexity].label}
        </span>
        <div className="w-px h-2.5 bg-white/[0.08]" />
        <div className="flex items-center gap-1">
          <Bot className="w-2.5 h-2.5 text-white/20" />
          <span className="text-[9px] font-mono text-white/20">{template.agents.length}</span>
        </div>
        <div className="w-px h-2.5 bg-white/[0.08]" />
        <span className="text-[9px] font-mono text-white/20">{template.estimatedSprints}s</span>
      </div>
    </button>
  );
});

// ── Detail Panel ───────────────────────────────────────────────────────────
const DetailPanel = memo(function DetailPanel({
  template,
  onLaunch,
  onClose,
}: {
  template: FlowTemplate;
  onLaunch: () => void;
  onClose: () => void;
}) {
  const Icon = ICONS[template.icon] ?? Zap;
  const complexity = COMPLEXITY_LABELS[template.complexity];

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={SPRING}
      className="w-full lg:w-[420px] shrink-0 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="relative px-6 pt-6 pb-5 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(ellipse at 50% 0%, ${template.color}30, transparent 70%)` }} />
        <div className="absolute inset-x-4 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${template.color}50, transparent)` }} />

        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl border" style={{ backgroundColor: `${template.color}20`, borderColor: `${template.color}40` }}>
              <Icon className="w-6 h-6" style={{ color: template.color }} />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-white/95 tracking-[-0.02em]">{template.name}</h2>
              <p className="text-[12px] text-white/40">{template.tagline}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/20 hover:text-white/50 hover:bg-white/[0.06] transition-colors duration-150">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative flex items-center gap-3 mt-4">
          <span className={cn("text-[10px] font-semibold uppercase tracking-wider", complexity.color)}>{complexity.label}</span>
          <div className="w-px h-3 bg-white/[0.08]" />
          <span className="text-[10px] text-white/30">{template.estimatedSprints} sprint{template.estimatedSprints > 1 ? "s" : ""}</span>
          <div className="w-px h-3 bg-white/[0.08]" />
          <span className="text-[10px] text-white/30">{template.agents.length} agents</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-5">
        <p className="text-[12px] text-white/50 leading-relaxed">{template.description}</p>

        {/* Agents */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Bot className="w-3.5 h-3.5 text-accent" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/25">Agent Squad</span>
          </div>
          <div className="space-y-2">
            {template.agents.map((agent, idx) => (
              <div
                key={agent.name}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] animate-[fadeSlideIn_0.35s_var(--ease-out-expo)_both]"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0" style={{ backgroundColor: `${template.color}15` }}>
                  <Sparkles className="w-3.5 h-3.5" style={{ color: template.color }} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-white/80">{agent.name}</span>
                    <span className="text-[9px] font-mono text-white/20 uppercase">{agent.role}</span>
                  </div>
                  <p className="text-[10px] text-white/35 leading-relaxed mt-0.5">{agent.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {template.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[9px] font-mono text-white/25">{tag}</span>
          ))}
        </div>
      </div>

      {/* Launch */}
      <div className="px-6 py-4 border-t border-white/[0.06] shrink-0">
        <button
          onClick={onLaunch}
          className="w-full relative flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-[14px] font-semibold text-white overflow-hidden transition-transform duration-150 hover:scale-[1.02] active:scale-[0.97]"
          style={{
            background: `linear-gradient(135deg, ${template.color}, ${template.color}90)`,
            boxShadow: `0 0 30px ${template.color}30, 0 4px 20px ${template.color}20`,
          }}
        >
          <Zap className="w-4 h-4" />
          Launch Flow
          <ChevronRight className="w-4 h-4" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer" />
        </button>
      </div>
    </motion.div>
  );
});

// ── Launch Animation Overlay ───────────────────────────────────────────────
function LaunchOverlay({ template, onComplete }: { template: FlowTemplate; onComplete: () => void }) {
  const Icon = ICONS[template.icon] ?? Zap;

  useEffect(() => {
    const timer = setTimeout(onComplete, 2400);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-void/90"
    >
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 8, opacity: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute w-24 h-24 rounded-full border-2"
        style={{ borderColor: template.color }}
      />
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ ...SPRING, delay: 0.2 }}
        className="flex items-center justify-center w-20 h-20 rounded-2xl mb-6"
        style={{ backgroundColor: `${template.color}20`, boxShadow: `0 0 60px ${template.color}40` }}
      >
        <Icon className="w-10 h-10" style={{ color: template.color }} />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-center">
        <h2 className="text-2xl font-bold text-white/95 mb-2">Launching {template.name}</h2>
        <p className="text-[13px] text-white/40">Spawning {template.agents.length} AI agents...</p>
      </motion.div>
      <div className="flex items-center gap-3 mt-8">
        {template.agents.map((agent, idx) => (
          <motion.div
            key={agent.name}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8 + idx * 0.2, ...SPRING }}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ backgroundColor: `${template.color}15`, borderColor: `${template.color}30` }}>
              <Sparkles className="w-4 h-4" style={{ color: template.color }} />
            </div>
            <span className="text-[9px] font-medium text-white/40">{agent.name}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ── View Toggle ────────────────────────────────────────────────────────────
const ViewToggle = memo(function ViewToggle({ view, onToggle }: { view: PortalView; onToggle: (v: PortalView) => void }) {
  return (
    <div className="flex items-center p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      {(["categories", "all"] as const).map((v) => (
        <button
          key={v}
          onClick={() => onToggle(v)}
          className={cn(
            "relative px-4 py-1.5 rounded-lg text-[11px] font-medium transition-colors duration-200",
            view === v ? "text-white/90" : "text-white/30 hover:text-white/50"
          )}
        >
          {view === v && (
            <motion.div
              layoutId="view-toggle-pill"
              className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/[0.06]"
              transition={SPRING_SNAPPY}
            />
          )}
          <span className="relative">{v === "categories" ? "Categories" : "All Flows"}</span>
        </button>
      ))}
    </div>
  );
});

// ── Main Flow Portal ───────────────────────────────────────────────────────
export function FlowPortal() {
  const toggleNewTaskModal = useBoardStore((s) => s.toggleNewTaskModal);
  const [view, setView] = useState<PortalView>("categories");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [launching, setLaunching] = useState<FlowTemplate | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const selectedTemplate = useMemo(
    () => flowTemplates.find((t) => t.id === selectedId) ?? null,
    [selectedId]
  );

  const categoryFlows = useMemo(
    () => activeCategory ? flowTemplates.filter((t) => t.category === activeCategory) : flowTemplates,
    [activeCategory]
  );

  const activeCategoryMeta = useMemo(
    () => FLOW_CATEGORIES.find((c) => c.key === activeCategory),
    [activeCategory]
  );

  // Stable callbacks to prevent child re-renders
  const handleCategorySelect = useCallback((key: string) => {
    setIsTransitioning(true);
    // Show skeleton briefly, then render cards
    requestAnimationFrame(() => {
      startTransition(() => {
        setActiveCategory(key);
        setSelectedId(null);
      });
      setTimeout(() => setIsTransitioning(false), 80);
    });
  }, []);

  const handleBack = useCallback(() => {
    setIsTransitioning(true);
    requestAnimationFrame(() => {
      startTransition(() => {
        if (selectedId) {
          setSelectedId(null);
        } else {
          setActiveCategory(null);
          setSelectedId(null);
        }
      });
      setTimeout(() => setIsTransitioning(false), 80);
    });
  }, [selectedId]);

  const handleFlowSelect = useCallback((id: string) => {
    setSelectedId((prev) => prev === id ? null : id);
  }, []);

  const handleLaunch = useCallback(() => {
    if (!selectedTemplate) return;
    setLaunching(selectedTemplate);
  }, [selectedTemplate]);

  const handleLaunchComplete = useCallback(() => {
    setLaunching(null);
    toggleNewTaskModal();
  }, [toggleNewTaskModal]);

  const handleViewToggle = useCallback((v: PortalView) => {
    setView(v);
    setSelectedId(null);
    if (v === "all") setActiveCategory(null);
  }, []);

  const handleCloseCustom = useCallback(() => setShowCustom(false), []);
  const handleOpenCustom = useCallback(() => setShowCustom(true), []);

  // Determine content mode
  const showCategoryCards = view === "categories" && !activeCategory && !showCustom;
  const showDrilledDown = view === "categories" && !!activeCategory && !showCustom;
  const showAllFlows = view === "all" && !showCustom;

  return (
    <>
      {/* Backdrop — no blur, just opacity for perf */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={toggleNewTaskModal}
        className="fixed inset-0 bg-black/70 z-40"
      />

      {/* Portal container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={SPRING}
        className="fixed inset-3 sm:inset-5 md:inset-8 z-50 flex flex-col rounded-2xl sm:rounded-3xl border border-white/[0.06] bg-nebula/[0.97] backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.7)] overflow-hidden"
      >
        {/* Ambient glows — GPU-friendly, no blur stacking */}
        <div className="hidden md:block pointer-events-none">
          <div className="absolute -top-20 left-1/4 w-[400px] h-[200px] bg-accent/[0.04] blur-[80px]" />
          <div className="absolute -bottom-20 right-1/4 w-[400px] h-[200px] bg-cyan-400/[0.03] blur-[80px]" />
        </div>

        {/* Top edge highlight */}
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent z-10" />

        {/* Launch overlay */}
        <AnimatePresence>
          {launching && <LaunchOverlay template={launching} onComplete={handleLaunchComplete} />}
        </AnimatePresence>

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3">
            {(activeCategory || showCustom) && (
              <button
                onClick={() => { if (showCustom) handleCloseCustom(); else handleBack(); }}
                className="p-1.5 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition-colors duration-150"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent/15 border border-accent/20">
              <Zap className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-white/95 tracking-[-0.02em]">
                {showCustom ? "Custom Flow" : activeCategoryMeta ? activeCategoryMeta.label : "Launch a Flow"}
              </h2>
              <p className="text-[11px] text-white/25">
                {showCustom
                  ? "Describe your vision — AI designs the workflow"
                  : activeCategoryMeta
                    ? `${categoryFlows.length} workflows available`
                    : "Select a category — AI agents handle the rest"
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!showCustom && !activeCategory && (
              <ViewToggle view={view} onToggle={handleViewToggle} />
            )}
            <button
              onClick={toggleNewTaskModal}
              className="p-2 rounded-xl text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition-colors duration-150"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* ─── Custom AI Prompt ─── */}
          {showCustom && <CustomPromptPanel onClose={handleCloseCustom} />}

          {/* ─── Category Cards (default) ─── */}
          {showCategoryCards && !isTransitioning && (
            <div className="flex-1 overflow-y-auto p-5 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
                {FLOW_CATEGORIES.map((cat, i) => (
                  <CategoryCard
                    key={cat.key}
                    category={cat}
                    flowCount={CATEGORY_FLOW_COUNTS[cat.key]}
                    onSelect={() => handleCategorySelect(cat.key)}
                    index={i}
                  />
                ))}
                <CustomAICard onSelect={handleOpenCustom} index={FLOW_CATEGORIES.length} />
              </div>
            </div>
          )}

          {/* ─── Skeleton during transition ─── */}
          {showCategoryCards && isTransitioning && (
            <div className="flex-1 overflow-y-auto p-5 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
                <CategorySkeleton />
              </div>
            </div>
          )}

          {/* ─── Drilled-down or All Flows ─── */}
          {(showDrilledDown || showAllFlows) && (
            <div className="flex-1 flex min-h-0 overflow-hidden">
              {/* Grid */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-8">
                {/* Filter pills (All Flows mode only) */}
                {showAllFlows && (
                  <div className="flex items-center gap-1.5 mb-5 overflow-x-auto pb-1 scrollbar-thin">
                    <button
                      onClick={() => { setActiveCategory(null); setSelectedId(null); }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[11px] font-medium border whitespace-nowrap shrink-0 transition-colors duration-150",
                        !activeCategory
                          ? "bg-accent/10 text-accent border-accent/20"
                          : "bg-white/[0.02] text-white/30 border-white/[0.04] hover:bg-white/[0.04] hover:text-white/50"
                      )}
                    >
                      All
                    </button>
                    {FLOW_CATEGORIES.map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => { setActiveCategory(activeCategory === cat.key ? null : cat.key); setSelectedId(null); }}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[11px] font-medium border whitespace-nowrap shrink-0 transition-colors duration-150",
                          activeCategory === cat.key
                            ? "bg-accent/10 text-accent border-accent/20"
                            : "bg-white/[0.02] text-white/30 border-white/[0.04] hover:bg-white/[0.04] hover:text-white/50"
                        )}
                      >
                        {cat.label}
                      </button>
                    ))}
                    <span className="ml-auto pl-3 shrink-0 text-[10px] font-mono text-white/15">{categoryFlows.length} flows</span>
                  </div>
                )}

                {isTransitioning ? (
                  <div className={cn(
                    "grid gap-3",
                    selectedTemplate ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  )}>
                    <CardSkeleton count={selectedTemplate ? 4 : 8} />
                  </div>
                ) : (
                  <div className={cn(
                    "grid gap-3",
                    selectedTemplate ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  )}>
                    {categoryFlows.map((template, i) => (
                      <FlowCard
                        key={template.id}
                        template={template}
                        isSelected={selectedId === template.id}
                        onSelect={() => handleFlowSelect(template.id)}
                        index={i}
                      />
                    ))}
                  </div>
                )}

                {categoryFlows.length === 0 && !isTransitioning && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Search className="w-8 h-8 text-white/10 mb-3" />
                    <span className="text-[13px] text-white/25">No flows in this category</span>
                  </div>
                )}
              </div>

              {/* Detail panel — no backdrop-blur (parent already has it) */}
              <AnimatePresence>
                {selectedTemplate && (
                  <div className="hidden md:flex border-l border-white/[0.06] bg-space">
                    <DetailPanel template={selectedTemplate} onLaunch={handleLaunch} onClose={() => setSelectedId(null)} />
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Mobile detail panel */}
        <AnimatePresence>
          {selectedTemplate && !showCustom && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={SPRING_GENTLE}
              className="md:hidden fixed inset-x-3 bottom-3 max-h-[70vh] z-60 rounded-2xl border border-white/[0.08] bg-nebula/[0.99] shadow-[0_-12px_40px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              <DetailPanel template={selectedTemplate} onLaunch={handleLaunch} onClose={() => setSelectedId(null)} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

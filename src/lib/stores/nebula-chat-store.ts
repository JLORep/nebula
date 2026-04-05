"use client";

import { create } from "zustand";

// ============================================================================
// Nebula Chat Store — DM-style chat with Nebula AI (River pattern)
// Single source of truth for left-side chat panel state
// ============================================================================

export type ChatSender = "system" | "agent" | "user" | "nebula";

export interface NebulaChatMessage {
  id: string;
  timestamp: number;
  sender: ChatSender;
  agentName?: string;
  agentColor?: string;
  content: string;
}

interface NebulaChatState {
  messages: NebulaChatMessage[];
  isOpen: boolean;
  unreadCount: number;

  toggle: () => void;
  open: () => void;
  close: () => void;
  pushMessage: (msg: Omit<NebulaChatMessage, "id" | "timestamp">) => void;
}

const MAX_MESSAGES = 80;
let messageCounter = 0;

const seedMessages: NebulaChatMessage[] = [
  {
    id: "nc-seed-1",
    timestamp: Date.now() - 180000,
    sender: "nebula",
    content: "Nebula AI online. Coordinating 10 agents across 6 projects.",
  },
  {
    id: "nc-seed-2",
    timestamp: Date.now() - 120000,
    sender: "nebula",
    content: "Sprint Alpha at 65% \u2014 3 agents actively working.",
  },
  {
    id: "nc-seed-3",
    timestamp: Date.now() - 60000,
    sender: "agent",
    agentName: "Sentinel",
    agentColor: "text-blue-400",
    content: "Scanning codebase for security violations...",
  },
  {
    id: "nc-seed-4",
    timestamp: Date.now() - 30000,
    sender: "agent",
    agentName: "Forge",
    agentColor: "text-emerald-400",
    content: "Implementing auth middleware for AUTH-7",
  },
];

export const useNebulaChatStore = create<NebulaChatState>((set, get) => ({
  messages: seedMessages,
  isOpen: false,
  unreadCount: 0,

  toggle: () => {
    const wasOpen = get().isOpen;
    set({ isOpen: !wasOpen });
    if (!wasOpen) set({ unreadCount: 0 });
  },

  open: () => set({ isOpen: true, unreadCount: 0 }),
  close: () => set({ isOpen: false }),

  pushMessage: (msg) => {
    messageCounter++;
    const newMessage: NebulaChatMessage = {
      ...msg,
      id: `nc-${messageCounter}-${Date.now()}`,
      timestamp: Date.now(),
    };

    const messages = get().messages;
    const updated = [...messages, newMessage].slice(-MAX_MESSAGES);
    const unread = get().isOpen ? 0 : get().unreadCount + 1;
    set({ messages: updated, unreadCount: unread });
  },
}));

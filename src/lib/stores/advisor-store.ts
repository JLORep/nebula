"use client";

import { create } from "zustand";

// ============================================================================
// Advisor Store — AI advisor chat messages (River pattern)
// Single source of truth for advisor panel state
// ============================================================================

export type AdvisorMessageType = "insight" | "alert" | "recommendation" | "completion" | "system";

export interface AdvisorMessage {
  id: string;
  timestamp: number;
  type: AdvisorMessageType;
  content: string;
  action: string | null;
  taskKey: string | null;
}

interface AdvisorState {
  messages: AdvisorMessage[];
  unreadCount: number;
  isOpen: boolean;

  toggle: () => void;
  open: () => void;
  close: () => void;
  markRead: () => void;
  pushMessage: (msg: Omit<AdvisorMessage, "id" | "timestamp">) => void;
}

const MAX_MESSAGES = 50;
let messageCounter = 0;

// Initial seed messages so the advisor isn't empty on first open
const seedMessages: AdvisorMessage[] = [
  {
    id: "adv-seed-1",
    timestamp: Date.now() - 120000,
    type: "system",
    content: "FLOW Advisor online. I'll monitor your sprint and surface insights as agents work.",
    action: null,
    taskKey: null,
  },
  {
    id: "adv-seed-2",
    timestamp: Date.now() - 60000,
    type: "insight",
    content: "Sprint velocity up 12% from last cycle — on track for completion by Apr 10.",
    action: "View sprint analytics",
    taskKey: null,
  },
  {
    id: "adv-seed-3",
    timestamp: Date.now() - 30000,
    type: "recommendation",
    content: "3 idle agents available. Consider assigning them to backlog items to accelerate delivery.",
    action: "Open agent fleet",
    taskKey: null,
  },
];

export const useAdvisorStore = create<AdvisorState>((set, get) => ({
  messages: seedMessages,
  unreadCount: 2,
  isOpen: false,

  toggle: () => {
    const wasOpen = get().isOpen;
    set({ isOpen: !wasOpen });
    if (!wasOpen) set({ unreadCount: 0 });
  },

  open: () => set({ isOpen: true, unreadCount: 0 }),
  close: () => set({ isOpen: false }),
  markRead: () => set({ unreadCount: 0 }),

  pushMessage: (msg) => {
    messageCounter++;
    const newMessage: AdvisorMessage = {
      ...msg,
      id: `adv-${messageCounter}-${Date.now()}`,
      timestamp: Date.now(),
    };

    const messages = get().messages;
    const updated = [...messages, newMessage].slice(-MAX_MESSAGES);
    const unread = get().isOpen ? 0 : get().unreadCount + 1;
    set({ messages: updated, unreadCount: unread });
  },
}));

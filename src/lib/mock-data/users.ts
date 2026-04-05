import type { User } from "@/lib/types";

// ============================================================================
// NEBULA — Mock Users (10 across roles)
// ============================================================================

export const users: Record<string, User> = {
  sarah:   { id: "u1",  name: "Sarah Chen",       avatar: "SC", role: "Engineering Lead" },
  marcus:  { id: "u2",  name: "Marcus Webb",       avatar: "MW", role: "Senior Engineer" },
  priya:   { id: "u3",  name: "Priya Sharma",      avatar: "PS", role: "Product Manager" },
  alex:    { id: "u4",  name: "Alex Rivera",       avatar: "AR", role: "DevOps Engineer" },
  jordan:  { id: "u5",  name: "Jordan Blake",      avatar: "JB", role: "Security Engineer" },
  elena:   { id: "u6",  name: "Elena Vasquez",     avatar: "EV", role: "Frontend Lead" },
  kai:     { id: "u7",  name: "Kai Nakamura",      avatar: "KN", role: "Data Engineer" },
  olivia:  { id: "u8",  name: "Olivia Okonkwo",    avatar: "OO", role: "QA Lead" },
  ryan:    { id: "u9",  name: "Ryan Foster",       avatar: "RF", role: "Platform Engineer" },
  nadia:   { id: "u10", name: "Nadia Al-Rashid",   avatar: "NA", role: "ML Engineer" },
};

export const userList: User[] = Object.values(users);

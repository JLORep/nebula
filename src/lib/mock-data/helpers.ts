import type { Column, Task, TaskStatus } from "@/lib/types";

// ============================================================================
// Mock Data Helpers — shared utilities for building project data
// ============================================================================

/** Generate a task key like AUTH-101 */
export function taskKey(prefix: string, num: number): string {
  return `${prefix}-${num}`;
}

/** Build standard 5-column board structure from tasks */
export function buildColumns(tasks: Task[]): Column[] {
  return [
    { id: "backlog" as TaskStatus, title: "Backlog", tasks: tasks.filter((t) => t.status === "backlog"), limit: null },
    { id: "todo" as TaskStatus, title: "To Do", tasks: tasks.filter((t) => t.status === "todo"), limit: 5 },
    { id: "in_progress" as TaskStatus, title: "In Progress", tasks: tasks.filter((t) => t.status === "in_progress"), limit: 3 },
    { id: "in_review" as TaskStatus, title: "In Review", tasks: tasks.filter((t) => t.status === "in_review"), limit: 3 },
    { id: "done" as TaskStatus, title: "Done", tasks: tasks.filter((t) => t.status === "done"), limit: null },
  ];
}

/** Offset from today by N days (ISO string) */
export function dateOffset(days: number): string {
  const d = new Date("2026-04-04T10:00:00Z");
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

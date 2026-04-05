"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Bookmark, Bug, Lightbulb, FileText, Bot, Shield, Zap, AlertTriangle, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useBoardStore } from "@/lib/stores/board-store";
import { SelectMenu } from "@/components/ui/select-menu";
import type { SelectOption } from "@/components/ui/select-menu";
import { SPRING } from "@/lib/utils/motion";
import type { IssueType, TaskPriority, TaskStatus, ApprovalGate } from "@/lib/types";

// ============================================================================
// NewTaskModal — Full task creation workflow with sexy select menus
// ============================================================================

const issueTypeOptions: SelectOption[] = [
  { value: "story", label: "Story", icon: <Bookmark className="w-4 h-4 text-success" />, description: "A user-facing feature or enhancement" },
  { value: "bug", label: "Bug", icon: <Bug className="w-4 h-4 text-danger" />, description: "Something that needs fixing" },
  { value: "task", label: "Task", icon: <FileText className="w-4 h-4 text-info" />, description: "Technical or operational work" },
  { value: "spike", label: "Spike", icon: <Lightbulb className="w-4 h-4 text-warning" />, description: "Research or investigation" },
];

const priorityOptions: SelectOption[] = [
  { value: "critical", label: "Critical", icon: <AlertTriangle className="w-4 h-4 text-danger" />, description: "Immediate attention required" },
  { value: "high", label: "High", icon: <ArrowUp className="w-4 h-4 text-warning" />, description: "Should be done this sprint" },
  { value: "medium", label: "Medium", icon: <Minus className="w-4 h-4 text-info" />, description: "Normal priority" },
  { value: "low", label: "Low", icon: <ArrowDown className="w-4 h-4 text-white/30" />, description: "Nice to have" },
];

const statusOptions: SelectOption[] = [
  { value: "backlog", label: "Backlog", color: "rgba(255,255,255,0.2)" },
  { value: "todo", label: "To Do", color: "var(--info)" },
  { value: "in_progress", label: "In Progress", color: "var(--accent)" },
  { value: "in_review", label: "In Review", color: "var(--warning)" },
];

const approvalOptions: SelectOption[] = [
  { value: "auto", label: "Auto", icon: <Zap className="w-4 h-4 text-success" />, description: "No human approval needed" },
  { value: "human_required", label: "Human Required", icon: <Shield className="w-4 h-4 text-warning" />, description: "Must be approved by a human" },
  { value: "team_review", label: "Team Review", icon: <Bot className="w-4 h-4 text-accent" />, description: "Requires team sign-off" },
];

export function NewTaskModal() {
  const { activeProject, projects, toggleNewTaskModal, createTask } = useBoardStore();

  const [projectId, setProjectId] = useState(activeProject?.id ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [issueType, setIssueType] = useState<IssueType>("story");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("backlog");
  const [themeId, setThemeId] = useState<string | null>(null);
  const [epicId, setEpicId] = useState<string | null>(null);
  const [sprintId, setSprintId] = useState<string | null>(null);
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [storyPoints, setStoryPoints] = useState<string>("");
  const [approvalGate, setApprovalGate] = useState<ApprovalGate>("auto");
  const [labels, setLabels] = useState("");

  const selectedProject = projects.find(p => p.id === projectId);

  const projectOptions: SelectOption[] = projects.map(p => ({
    value: p.id,
    label: p.name,
    color: p.color,
    description: p.key,
  }));

  const themeOptions: SelectOption[] = (selectedProject?.themes ?? []).map(t => ({
    value: t.id,
    label: t.name,
    color: t.color,
    description: t.description,
  }));

  const epicOptions: SelectOption[] = (selectedProject?.epics ?? [])
    .filter(e => !themeId || e.themeId === themeId)
    .map(e => ({
      value: e.id,
      label: e.name,
      description: e.description,
    }));

  const sprintOptions: SelectOption[] = (selectedProject?.sprints ?? []).map(s => ({
    value: s.id,
    label: s.name,
    description: s.status === "active" ? "Active" : s.status,
    color: s.status === "active" ? "var(--success)" : undefined,
  }));

  const memberOptions: SelectOption[] = (selectedProject?.members ?? []).map(m => ({
    value: m.id,
    label: m.name,
    description: m.role,
  }));

  const pointOptions: SelectOption[] = [1, 2, 3, 5, 8, 13, 21].map(n => ({
    value: String(n),
    label: String(n),
    description: n <= 3 ? "Small" : n <= 8 ? "Medium" : "Large",
  }));

  const canSubmit = title.trim().length > 0 && projectId;

  function handleSubmit() {
    if (!canSubmit || !selectedProject) return;

    const assignee = selectedProject.members.find(m => m.id === assigneeId) ?? null;
    const labelsArr = labels.split(",").map(l => l.trim()).filter(Boolean);

    createTask({
      title: title.trim(),
      description: description.trim(),
      issueType,
      priority,
      status,
      projectId,
      themeId,
      epicId,
      sprintId,
      assignee,
      storyPoints: storyPoints ? Number(storyPoints) : null,
      approvalGate,
      labels: labelsArr,
    });

    toggleNewTaskModal();
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={toggleNewTaskModal}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 gpu"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={SPRING}
        className="fixed inset-4 sm:inset-8 md:inset-y-10 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-[720px] z-50 flex flex-col"
      >
        <div className="flex-1 flex flex-col rounded-2xl border border-white/[0.08] bg-modal/[0.99] backdrop-blur-md shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Top edge */}
          <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent z-10" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-accent/15 border border-accent/20">
                <Zap className="w-4 h-4 text-accent" />
              </div>
              <div>
                <h2 className="text-[16px] font-bold text-white/90 tracking-[-0.02em]">Create Task</h2>
                <p className="text-[11px] text-white/25">Add a new task to {selectedProject?.name ?? "your project"}</p>
              </div>
            </div>
            <button
              onClick={toggleNewTaskModal}
              className="p-2 rounded-xl text-white/25 hover:text-white/60 hover:bg-white/[0.06] hover:scale-110 active:scale-90 transition-[color,background-color,transform] duration-200 will-change-transform"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-white/25 mb-1.5">
                Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[15px] text-white/90 placeholder:text-white/15 focus:outline-none focus:border-accent/30 focus:bg-white/[0.04] transition-[border-color,background-color] duration-200"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-white/25 mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details, acceptance criteria, or context..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[13px] text-white/70 placeholder:text-white/15 focus:outline-none focus:border-accent/30 focus:bg-white/[0.04] transition-[border-color,background-color] duration-200 resize-none leading-relaxed"
              />
            </div>

            {/* Row: Type + Priority */}
            <div className="grid grid-cols-2 gap-4">
              <SelectMenu
                label="Issue Type"
                options={issueTypeOptions}
                value={issueType}
                onChange={(v) => setIssueType(v as IssueType)}
              />
              <SelectMenu
                label="Priority"
                options={priorityOptions}
                value={priority}
                onChange={(v) => setPriority(v as TaskPriority)}
              />
            </div>

            {/* Row: Status + Project */}
            <div className="grid grid-cols-2 gap-4">
              <SelectMenu
                label="Status"
                options={statusOptions}
                value={status}
                onChange={(v) => setStatus(v as TaskStatus)}
              />
              <SelectMenu
                label="Project"
                options={projectOptions}
                value={projectId}
                onChange={(v) => { setProjectId(v); setThemeId(null); setEpicId(null); setSprintId(null); setAssigneeId(null); }}
              />
            </div>

            {/* Row: Theme + Epic */}
            <div className="grid grid-cols-2 gap-4">
              <SelectMenu
                label="Theme"
                options={themeOptions}
                value={themeId}
                onChange={(v) => { setThemeId(v); setEpicId(null); }}
                placeholder="Optional"
              />
              <SelectMenu
                label="Epic"
                options={epicOptions}
                value={epicId}
                onChange={setEpicId}
                placeholder="Optional"
              />
            </div>

            {/* Row: Sprint + Assignee */}
            <div className="grid grid-cols-2 gap-4">
              <SelectMenu
                label="Sprint"
                options={sprintOptions}
                value={sprintId}
                onChange={setSprintId}
                placeholder="Backlog"
              />
              <SelectMenu
                label="Assignee"
                options={memberOptions}
                value={assigneeId}
                onChange={setAssigneeId}
                placeholder="Unassigned"
              />
            </div>

            {/* Row: Points + Approval Gate */}
            <div className="grid grid-cols-2 gap-4">
              <SelectMenu
                label="Story Points"
                options={pointOptions}
                value={storyPoints || null}
                onChange={setStoryPoints}
                placeholder="Estimate"
              />
              <SelectMenu
                label="Approval Gate"
                options={approvalOptions}
                value={approvalGate}
                onChange={(v) => setApprovalGate(v as ApprovalGate)}
              />
            </div>

            {/* Labels */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-white/25 mb-1.5">
                Labels
              </label>
              <input
                type="text"
                value={labels}
                onChange={(e) => setLabels(e.target.value)}
                placeholder="Comma-separated: auth, security, backend"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[13px] text-white/70 placeholder:text-white/15 focus:outline-none focus:border-accent/30 focus:bg-white/[0.04] transition-[border-color,background-color] duration-200"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06] shrink-0">
            <button
              onClick={toggleNewTaskModal}
              className="px-4 py-2.5 rounded-xl text-[13px] font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[13px] font-semibold transition-[background-color,box-shadow,transform] duration-200 will-change-transform",
                canSubmit
                  ? "bg-accent text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-white/[0.04] text-white/20 cursor-not-allowed"
              )}
            >
              Create Task
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

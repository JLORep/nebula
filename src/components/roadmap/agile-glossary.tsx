"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { SPRING } from "@/lib/utils/motion";
import { useRoadmapStore } from "@/lib/stores/roadmap-store";
import { useBoardStore } from "@/lib/stores/board-store";
import { getAgileTerms } from "@/lib/utils/agile-coach";

const terms = getAgileTerms();

function getContextualNote(key: string, projectName: string): string {
  const notes: Record<string, string> = {
    sprint: `${projectName} uses 2-week sprints with clearly defined goals.`,
    epic: `${projectName} has multiple epics tracked across sprint boundaries.`,
    theme: `${projectName} organizes epics under strategic themes visible on the timeline.`,
    story: `Stories in ${projectName} are estimated in story points and assigned to sprints.`,
    velocity: `Track ${projectName}'s velocity trend in the Sprint Health dashboard above.`,
    burndown: `The burndown chart for ${projectName} shows remaining work vs. the ideal line.`,
    standup: `With AI agents on ${projectName}, standups include agent status alongside human updates.`,
    retrospective: `${projectName} runs retros at the end of each sprint to improve agent-human collaboration.`,
    backlog: `${projectName}'s backlog is groomed weekly, with AI agents suggesting story refinements.`,
    "story-points": `${projectName} uses Fibonacci sizing. Check the timeline to see point distributions.`,
    "definition-of-done": `${projectName} requires code review, tests passing, and staging deploy for each story.`,
    "wip-limit": `${projectName} enforces a WIP limit of 3 items in progress — visible on the board.`,
    "scrum-master": `NEBULA acts as an AI Scrum Master for ${projectName}, providing coaching insights above.`,
    "product-owner": `${projectName} has a Product Owner who prioritizes the backlog and approves agent actions.`,
    increment: `Each sprint produces a shippable increment for ${projectName}.`,
    "sprint-review": `${projectName} demos completed work to stakeholders at the end of each sprint.`,
    "sprint-planning": `${projectName}'s planning sessions commit to work based on historical velocity.`,
    "daily-scrum": `${projectName}'s daily scrum includes both human team members and AI agent status.`,
  };
  return notes[key] ?? `This concept applies to how ${projectName} manages its agile workflow.`;
}

export const AgileGlossary = memo(function AgileGlossary() {
  const activeTerm = useRoadmapStore((s) => s.activeGlossaryTerm);
  const setGlossaryTerm = useRoadmapStore((s) => s.setGlossaryTerm);
  const activeProject = useBoardStore((s) => s.activeProject);
  const projectName = activeProject?.name ?? "this project";

  const selected = terms.find((t) => t.key === activeTerm);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-3.5 h-3.5 text-white/25" />
        <span className="text-[11px] font-medium uppercase tracking-wider text-white/25">Agile Glossary</span>
      </div>

      {/* Horizontal scrollable pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
        {terms.map((term) => {
          const isActive = activeTerm === term.key;
          return (
            <button
              key={term.key}
              onClick={() => setGlossaryTerm(isActive ? null : term.key)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors duration-200 whitespace-nowrap shrink-0",
                isActive
                  ? "bg-accent/10 text-accent border-accent/20"
                  : "bg-white/[0.02] text-white/30 border-white/[0.04] hover:bg-white/[0.04] hover:text-white/50"
              )}
            >
              {term.term}
            </button>
          );
        })}
      </div>

      {/* Expanded term card */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={SPRING}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 relative">
              {/* Close */}
              <button
                onClick={() => setGlossaryTerm(null)}
                className="absolute top-3 right-3 p-1 rounded-lg text-white/20 hover:text-white/50 hover:bg-white/[0.06] transition-colors duration-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Term name */}
              <h4 className="text-[15px] font-bold text-white/90 mb-2">{selected.term}</h4>

              {/* Definition */}
              <p className="text-[12px] text-white/50 leading-relaxed mb-3">{selected.definition}</p>

              {/* Example */}
              <div className="rounded-lg bg-nebula/80 border border-white/[0.04] p-3 mb-3">
                <span className="text-[9px] uppercase tracking-wider text-white/20 font-medium block mb-1.5">In Practice</span>
                <p className="text-[11px] font-mono text-white/40 leading-relaxed">{selected.example}</p>
              </div>

              {/* Contextual note */}
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-accent mt-1.5 shrink-0" />
                <p className="text-[11px] text-accent/60 leading-relaxed">
                  <span className="font-medium text-accent/80">In your project:</span>{" "}
                  {getContextualNote(selected.key, projectName)}
                </p>
              </div>

              {/* Tip */}
              <div className="mt-3 flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-warning mt-1.5 shrink-0" />
                <p className="text-[11px] text-warning/50 leading-relaxed">
                  <span className="font-medium text-warning/70">Tip:</span>{" "}
                  {selected.tip}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

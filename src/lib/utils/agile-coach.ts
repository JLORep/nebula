import type { Sprint, Task, Project, CoachInsight, AgileTerm } from "@/lib/types";

// ============================================================================
// Agile Coach — Pure functions for sprint health, insights, burndown
// No state. No side effects. Just math and wisdom.
// ============================================================================

/** Compute sprint health 0-100 from velocity, blockers, completion rate */
export function computeSprintHealth(sprint: Sprint, tasks: Task[]): number {
  const sprintTasks = tasks.filter((t) => t.sprintId === sprint.id);
  if (sprintTasks.length === 0) return 50;

  const total = sprintTasks.length;
  const done = sprintTasks.filter((t) => t.status === "done").length;
  const blocked = sprintTasks.filter((t) => t.blockedBy.length > 0 && t.status !== "done").length;
  const inProgress = sprintTasks.filter((t) => t.status === "in_progress").length;

  // Sprint elapsed ratio (0-1)
  const now = new Date("2026-04-04");
  const start = new Date(sprint.startDate);
  const end = new Date(sprint.endDate);
  const totalDays = Math.max((end.getTime() - start.getTime()) / 86400000, 1);
  const elapsed = Math.max(Math.min((now.getTime() - start.getTime()) / 86400000, totalDays), 0);
  const elapsedRatio = elapsed / totalDays;

  // Completion ratio should track elapsed ratio
  const completionRatio = total > 0 ? done / total : 0;
  const completionScore = Math.min(completionRatio / Math.max(elapsedRatio, 0.1), 1) * 40;

  // Blocker penalty
  const blockerPenalty = (blocked / Math.max(total, 1)) * 30;

  // WIP health — too many in progress is bad
  const wipScore = inProgress <= 3 ? 15 : Math.max(15 - (inProgress - 3) * 3, 0);

  // Velocity tracking — points completed vs expected at this time
  const expectedPoints = sprint.totalPoints * elapsedRatio;
  const velocityScore = Math.min(sprint.completedPoints / Math.max(expectedPoints, 1), 1) * 15;

  return Math.round(Math.min(Math.max(completionScore - blockerPenalty + wipScore + velocityScore, 0), 100));
}

/** Generate coaching insights from project data */
export function generateInsights(project: Project, allTasks: Task[]): CoachInsight[] {
  const insights: CoachInsight[] = [];
  const activeSprint = project.sprints.find((s) => s.status === "active");
  if (!activeSprint) return insights;

  const sprintTasks = allTasks.filter((t) => t.sprintId === activeSprint.id);
  const blocked = sprintTasks.filter((t) => t.blockedBy.length > 0 && t.status !== "done");
  const inProgress = sprintTasks.filter((t) => t.status === "in_progress");
  const done = sprintTasks.filter((t) => t.status === "done");
  const backlog = sprintTasks.filter((t) => t.status === "backlog");

  // Blockers
  if (blocked.length > 0) {
    insights.push({
      id: "insight-blockers",
      message: `${blocked.length} ${blocked.length === 1 ? "story is" : "stories are"} blocked. Unblock "${blocked[0].title}" to keep the sprint on track.`,
      severity: blocked.length >= 3 ? "critical" : "warning",
      category: "blockers",
      actionable: true,
      action: "Review blocked items and resolve dependencies",
    });
  }

  // Velocity tracking
  const completionRate = sprintTasks.length > 0 ? done.length / sprintTasks.length : 0;
  if (completionRate > 0.6) {
    insights.push({
      id: "insight-velocity-good",
      message: `Sprint is ${Math.round(completionRate * 100)}% complete — strong velocity. The team is on track to meet the sprint goal.`,
      severity: "success",
      category: "velocity",
      actionable: false,
      action: null,
    });
  } else if (completionRate < 0.2 && sprintTasks.length > 0) {
    insights.push({
      id: "insight-velocity-low",
      message: `Only ${Math.round(completionRate * 100)}% of sprint items are done. Consider reducing scope or swarming on critical items.`,
      severity: "warning",
      category: "velocity",
      actionable: true,
      action: "Re-prioritize sprint backlog and identify items to defer",
    });
  }

  // WIP limits
  if (inProgress.length > 3) {
    insights.push({
      id: "insight-wip",
      message: `${inProgress.length} items in progress — exceeds recommended WIP limit of 3. Focus on finishing before starting new work.`,
      severity: "warning",
      category: "health",
      actionable: true,
      action: "Stop starting, start finishing. Complete current items first.",
    });
  }

  // Scope creep detection
  if (backlog.length > 3) {
    insights.push({
      id: "insight-scope",
      message: `${backlog.length} items still in backlog. Consider whether these are achievable this sprint or should move to the next.`,
      severity: "info",
      category: "scope",
      actionable: true,
      action: "Groom the sprint backlog — move uncommitted items to next sprint",
    });
  }

  // Story splitting recommendation
  const largeStories = sprintTasks.filter((t) => (t.storyPoints ?? 0) >= 8 && t.status !== "done");
  if (largeStories.length > 0) {
    insights.push({
      id: "insight-splitting",
      message: `"${largeStories[0].title}" is ${largeStories[0].storyPoints} points — consider splitting into smaller stories for better flow.`,
      severity: "info",
      category: "recommendation",
      actionable: true,
      action: "Break large stories into 3-5 point increments",
    });
  }

  // Overall health
  const health = computeSprintHealth(activeSprint, allTasks);
  if (health >= 70) {
    insights.push({
      id: "insight-health",
      message: `Sprint health score is ${health}/100 — the team is performing well. Keep the momentum going!`,
      severity: "success",
      category: "health",
      actionable: false,
      action: null,
    });
  } else if (health < 40) {
    insights.push({
      id: "insight-health-low",
      message: `Sprint health is ${health}/100 — below healthy threshold. Consider a mid-sprint retrospective.`,
      severity: "critical",
      category: "health",
      actionable: true,
      action: "Schedule a team sync to identify and address impediments",
    });
  }

  return insights;
}

/** Compute burndown chart data for the sprint */
export function computeBurndown(sprint: Sprint, tasks: Task[]): { day: number; ideal: number; actual: number }[] {
  const start = new Date(sprint.startDate);
  const end = new Date(sprint.endDate);
  const totalDays = Math.round((end.getTime() - start.getTime()) / 86400000);
  const now = new Date("2026-04-04");
  const elapsed = Math.max(Math.round((now.getTime() - start.getTime()) / 86400000), 0);
  const totalPoints = sprint.totalPoints;

  const data: { day: number; ideal: number; actual: number }[] = [];

  for (let d = 0; d <= totalDays; d++) {
    const ideal = Math.round(totalPoints * (1 - d / totalDays));
    // Simulate actual burndown — starts slow, catches up
    let actual: number;
    if (d <= elapsed) {
      const remaining = totalPoints - sprint.completedPoints;
      const progress = d / Math.max(elapsed, 1);
      // S-curve: slow start, fast middle, slow end
      const curve = progress < 0.3
        ? progress * 0.5
        : progress < 0.7
          ? 0.15 + (progress - 0.3) * 1.75
          : 0.85 + (progress - 0.7) * 0.5;
      actual = Math.round(totalPoints - (totalPoints - remaining) * Math.min(curve, 1));
    } else {
      actual = -1; // No data yet
    }
    data.push({ day: d, ideal, actual });
  }

  return data;
}

/** 18 agile terms with definitions, examples, and contextual tips */
export function getAgileTerms(): AgileTerm[] {
  return [
    { key: "sprint", term: "Sprint", definition: "A fixed time-box (typically 1-4 weeks) in which a team completes a set of work items.", example: "Sprint 7 runs from March 31 to April 14 with a goal of completing OAuth2 integration.", tip: "Keep sprints consistent in length. Changing sprint duration mid-project signals planning issues." },
    { key: "epic", term: "Epic", definition: "A large body of work that can be broken down into smaller stories. Epics span multiple sprints.", example: "The 'RBAC Permission Engine' epic contains 5 stories across 2 sprints.", tip: "If an epic spans more than 3 sprints, consider splitting it — it may be too broad." },
    { key: "theme", term: "Theme", definition: "A strategic grouping of epics that share a common business objective or capability area.", example: "The 'Identity & Access Management' theme groups RBAC, session management, and audit epics.", tip: "Themes help stakeholders understand WHY work is being done, not just WHAT." },
    { key: "story", term: "Story", definition: "A user-facing requirement written as: 'As a [user], I want [goal], so that [benefit]'.", example: "As an admin, I want to assign roles to users, so that I can control access permissions.", tip: "Stories should be completable in a single sprint. If not, they need splitting." },
    { key: "velocity", term: "Velocity", definition: "The average number of story points a team completes per sprint, used for forecasting.", example: "Team velocity averages 34 points/sprint over the last 5 sprints.", tip: "Velocity is a planning tool, not a performance metric. Don't gamify it." },
    { key: "burndown", term: "Burndown", definition: "A chart showing remaining work versus time, indicating whether the team will finish on schedule.", example: "The burndown shows 21 points remaining with 10 days left — the team is slightly behind the ideal line.", tip: "A flat burndown line means work isn't being completed. Investigate blockers immediately." },
    { key: "standup", term: "Standup", definition: "A brief daily meeting (15 min max) where each team member shares progress, plans, and blockers.", example: "In standup, Marcus reports the OAuth2 callback handler is blocked pending API key provisioning.", tip: "Keep it standing! If discussions go long, take them offline. Standup is for sync, not problem-solving." },
    { key: "retrospective", term: "Retrospective", definition: "An end-of-sprint ceremony where the team reflects on what went well, what didn't, and how to improve.", example: "The retro revealed that code reviews were taking too long — the team agreed to a 24h review SLA.", tip: "The most important agile ceremony. A team that doesn't retro doesn't improve." },
    { key: "backlog", term: "Backlog", definition: "An ordered list of all work items that could be done, prioritized by business value and dependencies.", example: "The product backlog has 47 items; the sprint backlog has 8 committed items for this sprint.", tip: "Groom the backlog weekly. An unmaintained backlog becomes a graveyard of stale items." },
    { key: "story-points", term: "Story Points", definition: "A relative measure of effort/complexity, not time. Common scales: Fibonacci (1, 2, 3, 5, 8, 13).", example: "The team estimated 'Implement OAuth2' as 8 points — high complexity, multiple integrations.", tip: "Points measure complexity relative to other stories. A '5' today should equal a '5' next sprint." },
    { key: "definition-of-done", term: "Definition of Done", definition: "A shared checklist that all work items must satisfy before being marked complete.", example: "DoD: Code reviewed, tests passing, docs updated, deployed to staging, no critical bugs.", tip: "Post your DoD visibly. If it's not enforced consistently, it doesn't exist." },
    { key: "wip-limit", term: "WIP Limit", definition: "A cap on how many items can be in progress simultaneously, preventing context-switching.", example: "The team's WIP limit is 3 — no more than 3 items can be 'In Progress' at once.", tip: "WIP limits expose bottlenecks. If the limit causes pain, that's the bottleneck talking." },
    { key: "scrum-master", term: "Scrum Master", definition: "A servant-leader who facilitates scrum ceremonies, removes impediments, and coaches the team.", example: "The Scrum Master noticed the team was consistently under-estimating — they introduced reference stories.", tip: "A great Scrum Master makes themselves unnecessary. They build self-organizing teams." },
    { key: "product-owner", term: "Product Owner", definition: "The person responsible for maximizing the value of the product by managing the backlog.", example: "The PO reprioritized MFA above session management based on customer security requirements.", tip: "One PO per product. Shared ownership means no ownership." },
    { key: "increment", term: "Increment", definition: "The sum of all completed backlog items during a sprint, forming a potentially releasable product.", example: "Sprint 7's increment includes RBAC permissions, OAuth2 callbacks, and 3 bug fixes.", tip: "Every increment should be potentially shippable. 'Almost done' isn't an increment." },
    { key: "sprint-review", term: "Sprint Review", definition: "A ceremony at sprint end where the team demos completed work to stakeholders for feedback.", example: "During the review, the PO approved the RBAC UI but requested changes to the role assignment flow.", tip: "Sprint reviews aren't status reports. Demo working software and collect real feedback." },
    { key: "sprint-planning", term: "Sprint Planning", definition: "A ceremony at sprint start where the team selects items from the backlog and defines the sprint goal.", example: "Sprint 8 planning committed to 29 points: session management, MFA, and audit events.", tip: "Don't plan more than your average velocity. Optimism bias is the #1 sprint killer." },
    { key: "daily-scrum", term: "Daily Scrum", definition: "Another name for the daily standup — a time-boxed event for the development team to synchronize.", example: "The daily scrum revealed that 2 team members were stuck on the same issue — they paired up.", tip: "It's the TEAM's meeting, not the manager's. Focus on coordination, not reporting." },
  ];
}

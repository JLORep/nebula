import type { AgentRole } from "@/lib/types";

// ============================================================================
// Simulation — Action message templates by agent role
// Pure data, no side effects.
// ============================================================================

const messagesByRole: Record<AgentRole, string[]> = {
  planner: [
    "Planning sprint scope for {title}",
    "Decomposing requirements for {title}",
    "Estimating story points for {title}",
    "Prioritizing backlog items for {title}",
    "Mapping dependencies for {title}",
  ],
  architect: [
    "Designing system architecture for {title}",
    "Drafting API contract for {title}",
    "Evaluating trade-offs for {title}",
    "Reviewing data model for {title}",
    "Defining integration boundaries for {title}",
  ],
  developer: [
    "Implementing {title}",
    "Writing tests for {title}",
    "Refactoring internals for {title}",
    "Building API endpoint for {title}",
    "Wiring up state management for {title}",
  ],
  tester: [
    "Running test suite on {title}",
    "Accessibility audit on {title}",
    "Load testing {title}",
    "Regression testing {title}",
    "Validating edge cases for {title}",
  ],
  reviewer: [
    "Code review for {title}",
    "Security scan on {title}",
    "Reviewing PR for {title}",
    "Static analysis on {title}",
    "Checking compliance for {title}",
  ],
  deployer: [
    "Deploying {title} to staging",
    "Running smoke tests on {title}",
    "Rolling out {title} to production",
    "Verifying deployment health for {title}",
    "Configuring feature flags for {title}",
  ],
};

export function getActionMessage(role: AgentRole, taskTitle: string): string {
  const templates = messagesByRole[role];
  const template = templates[Math.floor(Math.random() * templates.length)];
  return template.replace("{title}", taskTitle);
}

import type { Milestone } from "@/lib/types";

// ============================================================================
// Milestones — Key checkpoints derived from epic progress
// 3-5 per project, tied to epic completion
// ============================================================================

export const authMilestones: Milestone[] = [
  { id: "ms-auth-1", projectId: "proj-auth", epicId: "epic-auth-rbac", name: "RBAC MVP Complete", description: "Permission engine with hierarchical roles operational", targetDate: "2026-04-10", status: "in_progress", completionPercent: 65 },
  { id: "ms-auth-2", projectId: "proj-auth", epicId: "epic-auth-oauth", name: "OAuth2 Integration Live", description: "Google, Microsoft, and Okta SSO providers fully integrated", targetDate: "2026-04-12", status: "in_progress", completionPercent: 35 },
  { id: "ms-auth-3", projectId: "proj-auth", epicId: "epic-auth-session", name: "Session Management Launch", description: "Redis-backed distributed sessions deployed to production", targetDate: "2026-04-21", status: "upcoming", completionPercent: 0 },
  { id: "ms-auth-4", projectId: "proj-auth", epicId: "epic-auth-mfa", name: "MFA Rollout", description: "TOTP and WebAuthn available for all enterprise users", targetDate: "2026-04-26", status: "upcoming", completionPercent: 0 },
  { id: "ms-auth-5", projectId: "proj-auth", epicId: "epic-auth-audit", name: "SOC2 Audit Ready", description: "All compliance controls automated and evidence collection live", targetDate: "2026-04-28", status: "upcoming", completionPercent: 0 },
];

export const dataMilestones: Milestone[] = [
  { id: "ms-data-1", projectId: "proj-data", epicId: "epic-data-kafka", name: "Kafka Cluster Stable", description: "Event streaming platform handling 100k events/sec", targetDate: "2026-04-08", status: "achieved", completionPercent: 100 },
  { id: "ms-data-2", projectId: "proj-data", epicId: "epic-data-spark", name: "Spark Pipeline Operational", description: "Real-time transformation pipeline processing production workloads", targetDate: "2026-04-14", status: "in_progress", completionPercent: 55 },
  { id: "ms-data-3", projectId: "proj-data", epicId: "epic-data-dbt", name: "dbt Models Certified", description: "All transformation models tested and certified for analytics", targetDate: "2026-04-20", status: "upcoming", completionPercent: 10 },
  { id: "ms-data-4", projectId: "proj-data", epicId: "epic-data-snowflake", name: "Warehouse Migration Complete", description: "Full migration to Snowflake with zero-downtime cutover", targetDate: "2026-04-28", status: "upcoming", completionPercent: 0 },
];

export const portalMilestones: Milestone[] = [
  { id: "ms-port-1", projectId: "proj-portal", epicId: "epic-port-components", name: "Design System v2 Shipped", description: "Component library rebuilt with new brand guidelines", targetDate: "2026-04-06", status: "achieved", completionPercent: 100 },
  { id: "ms-port-2", projectId: "proj-portal", epicId: "epic-port-responsive", name: "Mobile-First Responsive", description: "All portal pages responsive from 320px to 4K", targetDate: "2026-04-15", status: "in_progress", completionPercent: 70 },
  { id: "ms-port-3", projectId: "proj-portal", epicId: "epic-port-wcag", name: "WCAG 2.1 AA Certified", description: "Full accessibility audit passed with zero critical issues", targetDate: "2026-04-22", status: "upcoming", completionPercent: 20 },
  { id: "ms-port-4", projectId: "proj-portal", epicId: "epic-port-vitals", name: "Core Web Vitals Green", description: "LCP < 2.5s, FID < 100ms, CLS < 0.1 on all pages", targetDate: "2026-04-28", status: "upcoming", completionPercent: 0 },
];

export const agentMilestones: Milestone[] = [
  { id: "ms-agen-1", projectId: "proj-agent", epicId: "epic-agen-executor", name: "Agent Runtime v1", description: "Core execution engine handling multi-step agent workflows", targetDate: "2026-04-10", status: "in_progress", completionPercent: 45 },
  { id: "ms-agen-2", projectId: "proj-agent", epicId: "epic-agen-sandbox", name: "Sandbox Isolation Ready", description: "Secure sandboxed execution for untrusted agent actions", targetDate: "2026-04-16", status: "upcoming", completionPercent: 15 },
  { id: "ms-agen-3", projectId: "proj-agent", epicId: "epic-agen-approval", name: "Human-in-the-Loop Gates", description: "Configurable approval workflows for high-risk agent actions", targetDate: "2026-04-22", status: "upcoming", completionPercent: 0 },
  { id: "ms-agen-4", projectId: "proj-agent", epicId: "epic-agen-trace", name: "Observability Dashboard", description: "Full tracing and monitoring for agent execution pipelines", targetDate: "2026-04-28", status: "upcoming", completionPercent: 0 },
];

export const paymentMilestones: Milestone[] = [
  { id: "ms-pay-1", projectId: "proj-payment", epicId: "epic-pay-stripe", name: "Stripe Integration Live", description: "Payment processing via Stripe with subscription billing", targetDate: "2026-04-12", status: "in_progress", completionPercent: 60 },
  { id: "ms-pay-2", projectId: "proj-payment", epicId: "epic-pay-pci", name: "PCI DSS Compliant", description: "Level 1 PCI DSS certification achieved for card processing", targetDate: "2026-04-20", status: "upcoming", completionPercent: 25 },
  { id: "ms-pay-3", projectId: "proj-payment", epicId: "epic-pay-ledger", name: "Reconciliation Engine", description: "Automated ledger reconciliation with anomaly detection", targetDate: "2026-04-28", status: "upcoming", completionPercent: 0 },
];

export const cloudMilestones: Milestone[] = [
  { id: "ms-cloud-1", projectId: "proj-cloud", epicId: "epic-cloud-eks", name: "EKS Cluster Production", description: "Kubernetes cluster with auto-scaling and zero-downtime deploys", targetDate: "2026-04-08", status: "achieved", completionPercent: 100 },
  { id: "ms-cloud-2", projectId: "proj-cloud", epicId: "epic-cloud-terraform", name: "IaC 100% Coverage", description: "All infrastructure managed via Terraform with drift detection", targetDate: "2026-04-14", status: "in_progress", completionPercent: 75 },
  { id: "ms-cloud-3", projectId: "proj-cloud", epicId: "epic-cloud-mesh", name: "Service Mesh Deployed", description: "Istio service mesh with mTLS across all microservices", targetDate: "2026-04-22", status: "upcoming", completionPercent: 10 },
  { id: "ms-cloud-4", projectId: "proj-cloud", epicId: "epic-cloud-dr", name: "Multi-Region DR Active", description: "Disaster recovery with < 5 min RTO across two regions", targetDate: "2026-04-28", status: "upcoming", completionPercent: 0 },
];

export const allMilestones: Milestone[] = [
  ...authMilestones,
  ...dataMilestones,
  ...portalMilestones,
  ...agentMilestones,
  ...paymentMilestones,
  ...cloudMilestones,
];

import type { Project, Task, Theme, Epic, Sprint, Board } from "@/lib/types";
import { users } from "../users";
import { agents } from "../agents";
import { taskKey, buildColumns, dateOffset } from "../helpers";
import { dataMilestones } from "../milestones";

// ============================================================================
// DATA — Data Pipeline Modernisation
// ETL, streaming, data warehouse (11 stories)
// ============================================================================

const PROJECT_ID = "proj-data";
const KEY = "DATA";

export const dataThemes: Theme[] = [
  { id: "theme-data-ingest", projectId: PROJECT_ID, name: "Data Ingestion", description: "Real-time and batch data ingestion pipelines", color: "#06b6d4" },
  { id: "theme-data-transform", projectId: PROJECT_ID, name: "Transformation Engine", description: "ETL/ELT transformation logic and orchestration", color: "#8b5cf6" },
  { id: "theme-data-warehouse", projectId: PROJECT_ID, name: "Data Warehouse", description: "Analytical storage and query optimization", color: "#10b981" },
];

export const dataEpics: Epic[] = [
  { id: "epic-data-kafka", projectId: PROJECT_ID, themeId: "theme-data-ingest", name: "Kafka Streaming Layer", description: "Event-driven streaming with Kafka Connect", status: "in_progress" },
  { id: "epic-data-spark", projectId: PROJECT_ID, themeId: "theme-data-transform", name: "Spark ETL Migration", description: "Migrate legacy batch jobs to Spark", status: "in_progress" },
  { id: "epic-data-dbt", projectId: PROJECT_ID, themeId: "theme-data-transform", name: "dbt Model Library", description: "Reusable dbt models for common transformations", status: "open" },
  { id: "epic-data-snowflake", projectId: PROJECT_ID, themeId: "theme-data-warehouse", name: "Snowflake Optimization", description: "Query performance and cost optimization", status: "open" },
];

export const dataSprints: Sprint[] = [
  {
    id: "sprint-data-4", name: "Sprint 4 — Streaming Foundation", startDate: "2026-03-31", endDate: "2026-04-14",
    goal: "Stand up Kafka cluster and migrate first 3 ETL jobs to streaming",
    velocity: 28, completedPoints: 8, totalPoints: 28, projectId: PROJECT_ID, number: 4, status: "active",
  },
  {
    id: "sprint-data-5", name: "Sprint 5 — Warehouse Tuning", startDate: "2026-04-14", endDate: "2026-04-28",
    goal: "Optimize top-20 Snowflake queries and deploy dbt models",
    velocity: 0, completedPoints: 0, totalPoints: 24, projectId: PROJECT_ID, number: 5, status: "planning",
  },
];

export const dataTasks: Task[] = [
  {
    id: "t-data-1", key: taskKey(KEY, 201), title: "Deploy Kafka cluster on EKS",
    description: "Provision 3-broker Kafka cluster on Kubernetes with Strimzi operator, configure topic auto-creation and retention policies.",
    status: "done", priority: "critical", issueType: "story", assignee: users.alex, agent: agents.nexus,
    labels: ["infrastructure", "kafka"], storyPoints: 5, createdAt: dateOffset(-4), updatedAt: dateOffset(-2),
    subtasks: [
      { id: "st-d1", title: "Helm chart configuration", completed: true },
      { id: "st-d2", title: "TLS certificate setup", completed: true },
      { id: "st-d3", title: "Topic retention policies", completed: true },
    ],
    approvalGate: "human_required", executionLog: [], completionPercent: 100,
    projectId: PROJECT_ID, epicId: "epic-data-kafka", themeId: "theme-data-ingest", sprintId: "sprint-data-4",
    blockedBy: [], blocking: ["t-data-2", "t-data-3"],
  },
  {
    id: "t-data-2", key: taskKey(KEY, 202), title: "Build Kafka Connect source connectors",
    description: "Configure Debezium CDC connectors for PostgreSQL and MongoDB, with schema registry integration.",
    status: "in_progress", priority: "high", issueType: "story", assignee: users.kai, agent: agents.spark,
    labels: ["kafka", "cdc"], storyPoints: 5, createdAt: dateOffset(-3), updatedAt: dateOffset(0),
    subtasks: [
      { id: "st-d4", title: "PostgreSQL CDC connector", completed: true },
      { id: "st-d5", title: "MongoDB CDC connector", completed: false },
      { id: "st-d6", title: "Schema registry setup", completed: false },
    ],
    approvalGate: "auto", executionLog: agents.spark.actions, completionPercent: 40,
    projectId: PROJECT_ID, epicId: "epic-data-kafka", themeId: "theme-data-ingest", sprintId: "sprint-data-4",
    blockedBy: ["t-data-1"], blocking: [],
  },
  {
    id: "t-data-3", key: taskKey(KEY, 203), title: "Migrate customer-events ETL to Spark",
    description: "Rewrite the legacy cron-based customer events ETL as a Spark Structured Streaming job.",
    status: "in_progress", priority: "high", issueType: "story", assignee: users.kai, agent: agents.spark,
    labels: ["spark", "migration"], storyPoints: 8, createdAt: dateOffset(-3), updatedAt: dateOffset(0),
    subtasks: [
      { id: "st-d7", title: "Schema mapping analysis", completed: true },
      { id: "st-d8", title: "Spark job skeleton", completed: true },
      { id: "st-d9", title: "Watermark and window logic", completed: false },
      { id: "st-d10", title: "Integration test with Kafka", completed: false },
    ],
    approvalGate: "auto", executionLog: [], completionPercent: 50,
    projectId: PROJECT_ID, epicId: "epic-data-spark", themeId: "theme-data-transform", sprintId: "sprint-data-4",
    blockedBy: ["t-data-1"], blocking: ["t-data-5"],
  },
  {
    id: "t-data-4", key: taskKey(KEY, 204), title: "Data quality validation framework",
    description: "Implement Great Expectations-based validation for all pipeline outputs with alerting.",
    status: "todo", priority: "medium", issueType: "story", assignee: users.nadia, agent: null,
    labels: ["quality", "monitoring"], storyPoints: 5, createdAt: dateOffset(-2), updatedAt: dateOffset(-2),
    subtasks: [], approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-data-spark", themeId: "theme-data-transform", sprintId: "sprint-data-4",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-data-5", key: taskKey(KEY, 205), title: "Dead letter queue handling",
    description: "Implement DLQ for failed pipeline events with replay capability and admin dashboard.",
    status: "todo", priority: "high", issueType: "story", assignee: users.kai, agent: null,
    labels: ["resilience", "kafka"], storyPoints: 3, createdAt: dateOffset(-2), updatedAt: dateOffset(-2),
    subtasks: [], approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-data-kafka", themeId: "theme-data-ingest", sprintId: "sprint-data-4",
    blockedBy: ["t-data-3"], blocking: [],
  },
  {
    id: "t-data-6", key: taskKey(KEY, 206), title: "Fix duplicate event detection in CDC",
    description: "Debezium CDC produces duplicate events during PostgreSQL failover. Implement idempotency checks.",
    status: "in_review", priority: "critical", issueType: "bug", assignee: users.kai, agent: agents.sentinel,
    labels: ["bug", "cdc"], storyPoints: 2, createdAt: dateOffset(-1), updatedAt: dateOffset(0),
    subtasks: [
      { id: "st-d11", title: "Reproduce in staging", completed: true },
      { id: "st-d12", title: "Add idempotency key tracking", completed: true },
    ],
    approvalGate: "auto", executionLog: [], completionPercent: 90,
    projectId: PROJECT_ID, epicId: "epic-data-kafka", themeId: "theme-data-ingest", sprintId: "sprint-data-4",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-data-7", key: taskKey(KEY, 207), title: "Snowflake query optimization — top 20",
    description: "Profile and optimize the 20 slowest Snowflake queries. Target: 50% latency reduction.",
    status: "backlog", priority: "high", issueType: "task", assignee: users.nadia, agent: null,
    labels: ["performance", "snowflake"], storyPoints: 5, createdAt: dateOffset(-1), updatedAt: dateOffset(-1),
    subtasks: [], approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-data-snowflake", themeId: "theme-data-warehouse", sprintId: "sprint-data-5",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-data-8", key: taskKey(KEY, 208), title: "Build dbt model for revenue attribution",
    description: "Create dbt model transforming raw event data into revenue attribution report with incremental materialization.",
    status: "backlog", priority: "medium", issueType: "story", assignee: null, agent: null,
    labels: ["dbt", "analytics"], storyPoints: 5, createdAt: dateOffset(-1), updatedAt: dateOffset(-1),
    subtasks: [], approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-data-dbt", themeId: "theme-data-transform", sprintId: "sprint-data-5",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-data-9", key: taskKey(KEY, 209), title: "Pipeline observability dashboard",
    description: "Grafana dashboard showing pipeline throughput, latency p99, error rates, and consumer lag.",
    status: "backlog", priority: "medium", issueType: "story", assignee: users.alex, agent: null,
    labels: ["monitoring", "grafana"], storyPoints: 3, createdAt: dateOffset(0), updatedAt: dateOffset(0),
    subtasks: [], approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-data-kafka", themeId: "theme-data-ingest", sprintId: "sprint-data-5",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-data-10", key: taskKey(KEY, 210), title: "Spike: Evaluate Apache Flink for windowing",
    description: "Evaluate Flink as alternative to Spark for complex windowed aggregations. Compare latency, throughput, and operational overhead.",
    status: "backlog", priority: "low", issueType: "spike", assignee: users.nadia, agent: null,
    labels: ["research", "streaming"], storyPoints: 3, createdAt: dateOffset(0), updatedAt: dateOffset(0),
    subtasks: [], approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-data-spark", themeId: "theme-data-transform", sprintId: "sprint-data-5",
    blockedBy: [], blocking: [],
  },
  {
    id: "t-data-11", key: taskKey(KEY, 211), title: "Implement backpressure for Kafka consumers",
    description: "Add adaptive rate limiting to Kafka consumers to prevent downstream service overload during spike traffic.",
    status: "backlog", priority: "medium", issueType: "story", assignee: null, agent: null,
    labels: ["resilience", "kafka"], storyPoints: 3, createdAt: dateOffset(0), updatedAt: dateOffset(0),
    subtasks: [], approvalGate: "auto", executionLog: [], completionPercent: 0,
    projectId: PROJECT_ID, epicId: "epic-data-kafka", themeId: "theme-data-ingest", sprintId: "sprint-data-5",
    blockedBy: [], blocking: [],
  },
];

const activeSprint = dataSprints[0];

export const dataBoard: Board = {
  id: "board-data",
  name: "Data Pipeline Modernisation",
  description: "Migrate legacy ETL to real-time streaming architecture",
  columns: buildColumns(dataTasks.filter((t) => t.sprintId === activeSprint.id)),
  agents: [agents.spark, agents.sentinel, agents.nexus],
  sprint: activeSprint,
  createdAt: dateOffset(-10),
  projectId: PROJECT_ID,
};

export const dataProject: Project = {
  id: PROJECT_ID,
  key: KEY,
  name: "Data Pipeline Modernisation",
  description: "Real-time streaming architecture with Kafka and Spark",
  color: "#06b6d4",
  icon: "Database",
  boards: [dataBoard],
  themes: dataThemes,
  epics: dataEpics,
  sprints: dataSprints,
  agents: [agents.spark, agents.sentinel, agents.nexus],
  members: [users.kai, users.nadia, users.alex],
  milestones: dataMilestones,
};

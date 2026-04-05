import type { Board, Project } from "@/lib/types";

// Re-export foundations
export { users, userList } from "./users";
export { agents, agentList } from "./agents";
export { taskKey, buildColumns, dateOffset } from "./helpers";
export { allMilestones, authMilestones, dataMilestones, portalMilestones, agentMilestones, paymentMilestones, cloudMilestones } from "./milestones";

// Re-export projects
export { authProject, authBoard, authTasks, authThemes, authEpics, authSprints } from "./projects/auth";
export { dataProject, dataBoard, dataTasks, dataThemes, dataEpics, dataSprints } from "./projects/data-pipeline";
export { portalProject, portalBoard, portalTasks, portalThemes, portalEpics, portalSprints } from "./projects/customer-portal";
export { agentProject, agentBoard, agentTasks, agentThemes, agentEpics, agentSprints } from "./projects/ai-orchestration";
export { paymentProject, paymentBoard, paymentTasks, paymentThemes, paymentEpics, paymentSprints } from "./projects/payment";
export { cloudProject, cloudBoard, cloudTasks, cloudThemes, cloudEpics, cloudSprints } from "./projects/cloud";

// Import for assembly
import { authProject, authBoard } from "./projects/auth";
import { dataProject, dataBoard } from "./projects/data-pipeline";
import { portalProject, portalBoard } from "./projects/customer-portal";
import { agentProject, agentBoard } from "./projects/ai-orchestration";
import { paymentProject, paymentBoard } from "./projects/payment";
import { cloudProject, cloudBoard } from "./projects/cloud";

// ============================================================================
// Assembled collections
// ============================================================================

export const mockProjects: Project[] = [
  authProject,
  dataProject,
  portalProject,
  agentProject,
  paymentProject,
  cloudProject,
];

/** All boards across all projects */
export const mockBoards: Board[] = [
  authBoard,
  dataBoard,
  portalBoard,
  agentBoard,
  paymentBoard,
  cloudBoard,
];

// ============================================================================
// Backward compatibility — existing code imports these
// ============================================================================

/** Default active board (Auth project) */
export const mockBoard: Board = authBoard;

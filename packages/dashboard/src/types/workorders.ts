/**
 * Workorder Type Definitions
 *
 * A "workorder" represents active work in a project.
 * Workorders are distributed across projects in coderef/workorder/ folders.
 * Each workorder folder may contain:
 * - communication.json (required) - workflow status and logs
 * - plan.json (optional) - implementation plan with tasks
 * - DELIVERABLES.md (optional) - progress tracking
 */

export type WorkorderStatus =
  | 'pending_plan'
  | 'plan_submitted'
  | 'changes_requested'
  | 'approved'
  | 'implementing'
  | 'complete'
  | 'verified'
  | 'closed';

/**
 * Represents files associated with a workorder
 */
export interface WorkorderFiles {
  /** Parsed content of communication.json (if present) */
  communication_json?: Record<string, any> | null;

  /** Parsed content of plan.json (if present) */
  plan_json?: Record<string, any> | null;

  /** Raw content of DELIVERABLES.md (if present) */
  deliverables_md?: string | null;
}

/**
 * Represents a single workorder (active work item)
 */
export interface WorkorderObject {
  /** Workorder ID (e.g., WO-PROJECT-001) */
  id: string;

  /** Project ID from projects.config.json */
  project_id: string;

  /** Human-readable project name */
  project_name: string;

  /** Feature name (usually folder name) */
  feature_name: string;

  /** Current workorder status */
  status: WorkorderStatus;

  /** File system path to workorder directory */
  path: string;

  /** Parsed files from the workorder folder */
  files: WorkorderFiles;

  /** ISO 8601 timestamp when workorder was created */
  created: string;

  /** ISO 8601 timestamp when workorder was last updated */
  updated: string;

  /** ISO 8601 timestamp of last status update */
  last_status_update: string;
}

/**
 * Response schema for GET /api/workorders
 */
export interface WorkorderListResponse {
  /** Whether request was successful */
  success: boolean;

  /** Response data */
  data: {
    /** Array of workorder objects */
    workorders: WorkorderObject[];

    /** Total number of workorders found */
    total: number;

    /** Count of workorders per project */
    by_project: Record<string, number>;

    /** Count of workorders per status */
    by_status: Record<string, number>;
  };

  /** ISO 8601 timestamp of response */
  timestamp: string;
}

/**
 * Response schema for GET /api/workorders/:workorderId
 */
export interface WorkorderDetailResponse {
  /** Whether request was successful */
  success: boolean;

  /** Response data */
  data: {
    /** Complete workorder object with all files */
    workorder: WorkorderObject;

    /** Array of tasks from plan.json (if present) */
    tasks?: Array<{
      id: string;
      description: string;
      status: string;
    }>;

    /** Array of deliverables from DELIVERABLES.md (if present) */
    deliverables?: Array<{
      name: string;
      status: string;
    }>;

    /** Communication log from communication.json (if present) */
    communication_log?: Array<{
      timestamp: string;
      message: string;
      author?: string;
    }>;
  };

  /** ISO 8601 timestamp of response */
  timestamp: string;
}

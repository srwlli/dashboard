/**
 * Stub Type Definitions
 *
 * A "stub" represents a pending idea or feature that hasn't been started yet.
 * Stubs live in the centralized orchestrator directory and are the backlog
 * of work that hasn't been assigned to projects yet.
 */

export type StubCategory = 'feature' | 'fix' | 'improvement' | 'idea' | 'refactor' | 'test';
export type StubPriority = 'low' | 'medium' | 'high' | 'critical';
export type StubStatus = 'stub' | 'planned' | 'in_progress' | 'completed';

/**
 * Represents a single stub (pending work item)
 */
export interface StubObject {
  /** Unique stub identifier (usually feature-name) */
  id: string;

  /** Feature name matching folder name */
  feature_name: string;

  /** Display title */
  title: string;

  /** Description of the stub */
  description: string;

  /** Category of work */
  category: StubCategory;

  /** Priority level */
  priority: StubPriority;

  /** Current status */
  status: StubStatus;

  /** ISO 8601 timestamp when stub was created */
  created: string;

  /** ISO 8601 timestamp when stub was last updated */
  updated: string;

  /** File system path to stub.json */
  path: string;

  /** Optional target project name */
  target_project?: string;
}

/**
 * Response schema for GET /api/stubs
 */
export interface StubListResponse {
  /** Whether request was successful */
  success: boolean;

  /** Response data */
  data: {
    /** Array of stub objects */
    stubs: StubObject[];

    /** Total number of stubs found */
    total: number;

    /** Location scanned for stubs */
    location: string;
  };

  /** ISO 8601 timestamp of response */
  timestamp: string;
}

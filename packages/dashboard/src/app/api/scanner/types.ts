/**
 * Scanner API Type Definitions
 *
 * Interfaces for scanner project management and scan execution.
 * Mirrors Python Scanner GUI functionality with TypeScript type safety.
 */

/**
 * Represents a project configured for scanning
 */
export interface ScannerProject {
  /** Unique identifier (UUID v4) */
  id: string;

  /** Project display name (derived from path basename) */
  name: string;

  /** Absolute path to project directory */
  path: string;

  /** ISO 8601 timestamp when project was added */
  addedAt: string;
}

/**
 * Storage format for projects.json file
 */
export interface ProjectsStorage {
  /** Array of configured scanner projects */
  projects: ScannerProject[];

  /** Schema version for future migrations */
  version: string;
}

/**
 * Scan execution status
 */
export type ScanStatus = 'idle' | 'running' | 'completed' | 'cancelled' | 'error';

/**
 * Progress information for an active scan
 */
export interface ScanProgress {
  /** Current scan status */
  status: ScanStatus;

  /** Index of currently scanning project (0-based) */
  currentProjectIndex: number;

  /** Total number of projects to scan */
  totalProjects: number;

  /** Path of project currently being scanned */
  currentProjectPath: string | null;

  /** ISO 8601 timestamp when scan started */
  startedAt: string | null;

  /** ISO 8601 timestamp when scan completed */
  completedAt: string | null;

  /** Error message if status is 'error' */
  error: string | null;
}

/**
 * Project selection for directories/scan/populate operations
 */
export interface ProjectSelection {
  directories: boolean;
  scan: boolean;
  populate: boolean;
}

/**
 * Request body for starting a new scan
 */
export interface StartScanRequest {
  /** Array of project IDs to scan */
  projectIds: string[];

  /** Optional: Map of project selections for multi-phase execution */
  selections?: Record<string, ProjectSelection>;
}

/**
 * Response from starting a new scan
 */
export interface StartScanResponse {
  /** Unique scan identifier (UUID v4) */
  scanId: string;

  /** Initial scan status */
  status: ScanStatus;

  /** Number of projects queued for scanning */
  projectCount: number;
}

/**
 * Server-Sent Event message types
 */
export type SSEMessageType = 'output' | 'progress' | 'complete' | 'error';

/**
 * Server-Sent Event message format
 */
export interface SSEMessage {
  /** Message type */
  type: SSEMessageType;

  /** Message payload (varies by type) */
  data: string | ScanProgress;

  /** ISO 8601 timestamp */
  timestamp: string;
}

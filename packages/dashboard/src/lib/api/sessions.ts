/**
 * SessionReader API - Read and parse multi-agent session data
 *
 * Scans session directories and parses communication.json files
 * to provide session monitoring functionality.
 *
 * @module lib/api/sessions
 */

import fs from 'fs';
import path from 'path';

// ============================================================================
// Type Definitions
// ============================================================================

export type SessionStatus = 'not_started' | 'in_progress' | 'complete';
export type AgentStatus = 'not_started' | 'in_progress' | 'complete' | 'blocked';

export interface Session {
  workorder_id: string;
  feature_name: string;
  status: SessionStatus;
  created: string;
  description: string;
  total_agents: number;
  completed_agents: number;
}

export interface OrchestratorInfo {
  agent_id: string;
  agent_path?: string;
  role: string;
  status: AgentStatus;
  output_file: string;
  notes?: string;
}

export interface AgentInfo {
  agent_id: string;
  workorder_id?: string;
  agent_path?: string;
  role: string;
  status: AgentStatus;
  output_file: string;
  output_directory?: string;
  phases?: string[];
  notes?: string;
  forbidden_files?: string[];
  depends_on?: string[];
  context_file?: string;
}

export interface ParallelExecutionInfo {
  enabled: boolean;
  can_run_simultaneously: string[];
  must_run_sequentially: string[];
  rationale?: string;
}

export interface AggregationInfo {
  total_agents: number;
  completed: number;
  in_progress: number;
  not_started: number;
  blocked: number;
}

export interface SessionDetail extends Session {
  orchestrator: OrchestratorInfo;
  agents: AgentInfo[];
  parallel_execution?: ParallelExecutionInfo;
  aggregation?: AggregationInfo;
  instructions_file?: string;

  // Phase 1: Session metrics
  completed_at?: string;  // ISO 8601 timestamp when session marked complete
  duration?: number;      // Duration in seconds
}

export interface SessionStatusUpdate {
  status: SessionStatus;
  total_agents: number;
  completed_agents: number;
  aggregation: AggregationInfo;
}

// ============================================================================
// Configuration
// ============================================================================

/**
 * Default session directories to scan
 * Can be overridden by projects.config.json
 */
const DEFAULT_SESSION_DIRS = [
  'C:\\Users\\willh\\.mcp-servers\\coderef\\sessions'
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate aggregation stats from agents array
 */
function calculateAggregation(agents: AgentInfo[]): AggregationInfo {
  const aggregation: AggregationInfo = {
    total_agents: agents.length,
    completed: 0,
    in_progress: 0,
    not_started: 0,
    blocked: 0
  };

  agents.forEach(agent => {
    switch (agent.status) {
      case 'complete':
        aggregation.completed++;
        break;
      case 'in_progress':
        aggregation.in_progress++;
        break;
      case 'not_started':
        aggregation.not_started++;
        break;
      case 'blocked':
        aggregation.blocked++;
        break;
    }
  });

  return aggregation;
}

/**
 * Determine overall session status from agent statuses
 */
function calculateSessionStatus(agents: AgentInfo[]): SessionStatus {
  if (agents.every(agent => agent.status === 'complete')) {
    return 'complete';
  }
  if (agents.some(agent => agent.status === 'in_progress')) {
    return 'in_progress';
  }
  return 'not_started';
}

/**
 * Calculate human-readable duration between two timestamps
 *
 * @param created - ISO 8601 timestamp when session started
 * @param completed - ISO 8601 timestamp when session completed (optional)
 * @returns Human-readable duration string (e.g., "2h 30m", "45m", "N/A")
 */
export function calculateDuration(created: string, completed?: string): string {
  if (!completed) {
    return 'N/A';
  }

  try {
    const start = new Date(created).getTime();
    const end = new Date(completed).getTime();

    if (isNaN(start) || isNaN(end)) {
      return 'N/A';
    }

    // Handle invalid duration (completed before created or same time)
    if (end <= start) {
      return 'N/A';
    }

    const durationMs = end - start;
    const durationMinutes = Math.floor(durationMs / (1000 * 60));

    if (durationMinutes < 60) {
      return `${durationMinutes}m`;
    }

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (minutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${minutes}m`;
  } catch (error) {
    console.error('Failed to calculate duration:', error);
    return 'N/A';
  }
}

/**
 * Safe JSON parse with error handling
 */
function safeJSONParse<T>(filePath: string): T | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Failed to parse JSON file: ${filePath}`, error);
    return null;
  }
}

/**
 * Check if a directory exists
 */
function directoryExists(dirPath: string): boolean {
  try {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  } catch {
    return false;
  }
}

// ============================================================================
// Core API Functions
// ============================================================================

/**
 * Get all sessions from configured directories
 *
 * Scans session directories and reads communication.json files
 * to build a list of all sessions with basic info.
 *
 * @returns Array of session summaries
 */
export async function getAllSessions(): Promise<Session[]> {
  const sessions: Session[] = [];

  for (const sessionBaseDir of DEFAULT_SESSION_DIRS) {
    if (!directoryExists(sessionBaseDir)) {
      console.warn(`Session directory does not exist: ${sessionBaseDir}`);
      continue;
    }

    try {
      const sessionDirs = fs.readdirSync(sessionBaseDir);

      for (const sessionDir of sessionDirs) {
        const sessionPath = path.join(sessionBaseDir, sessionDir);

        // Skip if not a directory
        if (!fs.statSync(sessionPath).isDirectory()) {
          continue;
        }

        const commPath = path.join(sessionPath, 'communication.json');

        if (!fs.existsSync(commPath)) {
          continue;
        }

        const commData = safeJSONParse<any>(commPath);
        if (!commData) {
          continue;
        }

        // Calculate aggregation from agents
        const agents: AgentInfo[] = commData.agents || [];
        const aggregation = calculateAggregation(agents);
        const calculatedStatus = calculateSessionStatus(agents);

        const session: Session = {
          workorder_id: commData.workorder_id || 'UNKNOWN',
          feature_name: commData.feature_name || sessionDir,
          status: commData.status || calculatedStatus,
          created: commData.created || 'Unknown',
          description: commData.description || '',
          total_agents: aggregation.total_agents,
          completed_agents: aggregation.completed
        };

        sessions.push(session);
      }
    } catch (error) {
      console.error(`Error scanning session directory: ${sessionBaseDir}`, error);
    }
  }

  return sessions;
}

/**
 * Get detailed session information by feature name
 *
 * Reads communication.json and returns full session details
 * including orchestrator, agents, and parallel execution info.
 *
 * @param featureName - Feature name (used as directory name)
 * @returns Session details or null if not found
 */
export async function getSessionById(featureName: string): Promise<SessionDetail | null> {
  for (const sessionBaseDir of DEFAULT_SESSION_DIRS) {
    const sessionPath = path.join(sessionBaseDir, featureName);
    const commPath = path.join(sessionPath, 'communication.json');

    if (!fs.existsSync(commPath)) {
      continue;
    }

    const commData = safeJSONParse<any>(commPath);
    if (!commData) {
      continue;
    }

    const agents: AgentInfo[] = commData.agents || [];
    const aggregation = commData.aggregation || calculateAggregation(agents);
    const calculatedStatus = calculateSessionStatus(agents);

    const sessionDetail: SessionDetail = {
      workorder_id: commData.workorder_id || 'UNKNOWN',
      feature_name: commData.feature_name || featureName,
      status: commData.status || calculatedStatus,
      created: commData.created || 'Unknown',
      description: commData.description || '',
      total_agents: agents.length,
      completed_agents: aggregation.completed,
      orchestrator: commData.orchestrator,
      agents: agents,
      parallel_execution: commData.parallel_execution,
      aggregation: aggregation,
      instructions_file: commData.instructions_file
    };

    return sessionDetail;
  }

  return null;
}

/**
 * Get agent output file contents
 *
 * Reads the output file specified in the agent's configuration.
 * Validates path to prevent directory traversal attacks.
 *
 * @param featureName - Feature name (session directory)
 * @param agentId - Agent identifier
 * @returns File contents as string, or null if not found/error
 */
export async function getAgentOutput(
  featureName: string,
  agentId: string
): Promise<string | null> {
  const sessionDetail = await getSessionById(featureName);

  if (!sessionDetail) {
    console.error(`Session not found: ${featureName}`);
    return null;
  }

  // Find agent in session
  const agent = sessionDetail.agents.find(a => a.agent_id === agentId);
  if (!agent) {
    console.error(`Agent not found: ${agentId} in session ${featureName}`);
    return null;
  }

  const outputFile = agent.output_file;
  if (!outputFile) {
    console.warn(`No output file specified for agent: ${agentId}`);
    return null;
  }

  // Security: Validate path exists and is within allowed directories
  if (!fs.existsSync(outputFile)) {
    console.warn(`Output file does not exist: ${outputFile}`);
    return 'Output file not yet created by agent.';
  }

  try {
    // Read file contents
    const contents = fs.readFileSync(outputFile, 'utf-8');
    return contents;
  } catch (error) {
    console.error(`Failed to read agent output file: ${outputFile}`, error);
    return null;
  }
}

/**
 * Refresh session status by re-reading communication.json
 *
 * Recalculates aggregation stats from current agent statuses.
 *
 * @param featureName - Feature name (session directory)
 * @returns Updated status summary or null if not found
 */
export async function refreshSessionStatus(
  featureName: string
): Promise<SessionStatusUpdate | null> {
  const sessionDetail = await getSessionById(featureName);

  if (!sessionDetail) {
    return null;
  }

  const aggregation = calculateAggregation(sessionDetail.agents);
  const status = calculateSessionStatus(sessionDetail.agents);

  return {
    status,
    total_agents: aggregation.total_agents,
    completed_agents: aggregation.completed,
    aggregation
  };
}

/**
 * Update session status in communication.json
 *
 * Manually sets the status field in communication.json file.
 *
 * @param featureName - Feature name (session directory)
 * @param newStatus - New status to set
 * @returns Updated session detail or null if not found/failed
 */
export async function updateSessionStatus(
  featureName: string,
  newStatus: SessionStatus
): Promise<{ status: SessionStatus } | null> {
  for (const sessionBaseDir of DEFAULT_SESSION_DIRS) {
    const sessionPath = path.join(sessionBaseDir, featureName);
    const commPath = path.join(sessionPath, 'communication.json');

    if (!fs.existsSync(commPath)) {
      continue;
    }

    try {
      // Read current communication.json
      const commData = safeJSONParse<any>(commPath);
      if (!commData) {
        return null;
      }

      // Update status field
      commData.status = newStatus;

      // Write back to file
      fs.writeFileSync(commPath, JSON.stringify(commData, null, 4), 'utf-8');

      return { status: newStatus };
    } catch (error) {
      console.error(`Failed to update session status: ${commPath}`, error);
      return null;
    }
  }

  return null;
}

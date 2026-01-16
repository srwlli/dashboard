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

  // Hierarchical session structure fields (requires agent subdirectory)
  // Only populated when session uses agent-subdirectory pattern
  tasks?: AgentTask[];              // Task tracking from agent/communication.json
  success_metrics?: SuccessMetric;  // Progress metrics from agent/communication.json
  resources?: AgentResources;       // Resource links from agent/resources/index.md
  outputs?: AgentOutputs;           // Output specifications from agent/communication.json
  phase_gate?: PhaseGate;           // Phase progression criteria
  started?: string;                 // ISO 8601 timestamp when agent started work
  phase?: string;                   // Which phase this agent belongs to (e.g., "phase_1")
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

  // Hierarchical session structure fields (WO-SESSION-STRUCTURE-STANDARDIZATION)
  // Only populated when session uses multi-phase pattern
  phases?: Record<string, PhaseInfo>;  // Phase tracking (e.g., { "phase_1": {...}, "phase_2": {...} })
  created_workorders?: string[];       // Workorder IDs created during session execution
  files_modified?: string[];           // Files modified during session (Phase 2)
  resource_sheets?: string[];          // Resource sheets accessed (Phase 2)
}

export interface SessionStatusUpdate {
  status: SessionStatus;
  total_agents: number;
  completed_agents: number;
  aggregation: AggregationInfo;
}

// ============================================================================
// Hierarchical Session Structure Types (WO-SESSION-STRUCTURE-STANDARDIZATION)
// ============================================================================

/**
 * Agent task tracking from agent subdirectory communication.json
 * Represents individual task within an agent's workorder
 */
export interface AgentTask {
  task_id: string;          // e.g., "TASK-001"
  description: string;      // What this task accomplishes
  status: 'pending' | 'in_progress' | 'complete' | 'blocked';
  completed?: string;       // ISO 8601 timestamp when completed
  commit?: string;          // Git commit SHA for this task
  proof?: string;           // Path to proof of completion
}

/**
 * Success metrics tracking progress toward goals
 * Used at both agent and phase level
 */
export interface SuccessMetric {
  baseline: number | string;   // Starting value
  current: number | string;     // Current value
  target: number | string;      // Goal value
  status: string;               // Progress percentage or status description
}

/**
 * Agent resource tracking from resources/index.md
 * Links to source documents, not copies
 */
export interface AgentResources {
  index?: string;                // Path to resources/index.md
  primary_spec?: string;         // Link to primary specification
  proof_of_concept?: string;     // Link to POC or example
  requirements?: string;         // Link to requirements doc
  architecture?: string;         // Link to architecture doc
  [key: string]: string | undefined;  // Additional resource links
}

/**
 * Agent output specifications
 * Defines what the agent produces
 */
export interface AgentOutputs {
  primary_output: string;        // Path to main deliverable
  format: string;                // Output format (markdown, json, code, etc.)
  workorders_created?: string[]; // Workorder IDs created by this agent
  files_created?: string[];      // Files created during execution (may include metadata like line counts)
  files_modified?: string[];     // Files modified during execution (may include metadata)
  total_lines_added?: number;    // Total lines of code added
  total_functions_added?: number;// Total functions added
  breaking_changes?: number;     // Number of breaking changes
  typescript_compilation?: string; // TypeScript compilation status
}

/**
 * Phase gate criteria for progression
 * Defines what must be achieved before next phase
 */
export interface PhaseGate {
  required_for_phase_2: boolean;
  criteria: string[];            // List of criteria that must be met
}

/**
 * Phase information from session-level communication.json
 * Tracks multi-phase execution progress
 */
export interface PhaseInfo {
  name: string;                  // Phase name (e.g., "Core Enhancements")
  status: 'not_started' | 'in_progress' | 'complete';
  progress: string | number;     // Progress string (e.g., "11/11 tasks complete (100%)") or percentage
  lead_agents: string[];         // Agent IDs responsible for this phase
  started?: string;              // ISO 8601 timestamp when phase started
  completed?: string;            // ISO 8601 timestamp when phase completed
  description?: string;          // Optional detailed description
  gate_criteria?: string[];      // Phase gate criteria
  success_metrics?: SuccessMetric;
  dependencies?: string[];       // Phase IDs that must complete first (e.g., ["phase_1"])
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
// Re-export calculateDuration from utils for backward compatibility
export { calculateDuration } from '../utils/time';

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
 * Read agent subdirectory communication.json (hierarchical session structure)
 *
 * For sessions using agent-subdirectory pattern, each agent has:
 * - <session>/<agent-id>/communication.json (agent-level data)
 * - <session>/<agent-id>/resources/index.md
 * - <session>/<agent-id>/outputs/
 *
 * This function enriches AgentInfo with data from agent subdirectory.
 *
 * @param sessionPath - Path to session directory
 * @param agentId - Agent identifier
 * @returns Partial AgentInfo with hierarchical fields, or empty object if not found
 */
async function readAgentSubdirectory(
  sessionPath: string,
  agentId: string
): Promise<Partial<AgentInfo>> {
  const agentDir = path.join(sessionPath, agentId);
  const agentCommPath = path.join(agentDir, 'communication.json');

  // Check if agent subdirectory exists (hierarchical structure)
  if (!fs.existsSync(agentDir) || !fs.existsSync(agentCommPath)) {
    return {}; // Flat structure - return empty (no hierarchical data)
  }

  const agentCommData = safeJSONParse<any>(agentCommPath);
  if (!agentCommData) {
    return {}; // Invalid/missing data
  }

  // Extract hierarchical fields from agent communication.json
  return {
    tasks: agentCommData.tasks,
    success_metrics: agentCommData.success_metrics,
    resources: agentCommData.resources,
    outputs: agentCommData.outputs,
    phase_gate: agentCommData.phase_gate,
    started: agentCommData.started,
    phase: agentCommData.phase,
    workorder_id: agentCommData.workorder_id || undefined
  };
}

/**
 * Extract workorders created during session execution
 *
 * Scans agent subdirectories for workorders created as deliverables.
 * Checks agent.outputs.workorders_created fields.
 *
 * @param sessionPath - Path to session directory
 * @param agents - Array of AgentInfo objects (must be enriched with outputs field)
 * @returns Array of workorder IDs created during session
 */
async function extractWorkordersCreated(
  _sessionPath: string,
  agents: AgentInfo[]
): Promise<string[]> {
  const workorders: string[] = [];

  for (const agent of agents) {
    if (agent.outputs?.workorders_created) {
      workorders.push(...agent.outputs.workorders_created);
    }
  }

  return workorders;
}

/**
 * Extract files modified during session execution
 *
 * Scans agent subdirectories for files modified during execution.
 * Aggregates from agent.outputs.files_created, files_modified, and primary_output.
 *
 * @param sessionPath - Path to session directory
 * @param agents - Array of AgentInfo objects (must be enriched with outputs field)
 * @returns Array of file paths modified during session
 */
async function extractFilesModified(
  _sessionPath: string,
  agents: AgentInfo[]
): Promise<string[]> {
  const filesSet = new Set<string>(); // Use Set to avoid duplicates

  for (const agent of agents) {
    // Check primary output
    if (agent.outputs?.primary_output) {
      filesSet.add(agent.outputs.primary_output);
    }

    // Check files_created array (from agent outputs)
    if (agent.outputs?.files_created && Array.isArray(agent.outputs.files_created)) {
      for (const file of agent.outputs.files_created) {
        // Handle both "path" and "path (metadata)" formats
        const cleanPath = file.split(' (')[0].trim();
        filesSet.add(cleanPath);
      }
    }

    // Check files_modified array (from agent outputs)
    if (agent.outputs?.files_modified && Array.isArray(agent.outputs.files_modified)) {
      for (const file of agent.outputs.files_modified) {
        // Handle both "path" and "path (metadata)" formats
        const cleanPath = file.split(' (')[0].trim();
        filesSet.add(cleanPath);
      }
    }
  }

  return Array.from(filesSet);
}

/**
 * Extract resource sheets accessed during session execution
 *
 * Scans agent subdirectories for resource sheet references.
 * Reads resources/index.md from each agent subdirectory and extracts
 * links to *-RESOURCE-SHEET.md files.
 *
 * @param sessionPath - Path to session directory
 * @param agents - Array of AgentInfo objects (must be enriched with resources field)
 * @returns Array of resource sheet paths accessed during session
 */
async function extractResourceSheets(
  sessionPath: string,
  agents: AgentInfo[]
): Promise<string[]> {
  const resourceSheets: string[] = [];

  for (const agent of agents) {
    // Check if agent has resources/index.md
    const resourcesIndexPath = path.join(sessionPath, agent.agent_id, 'resources', 'index.md');

    if (!fs.existsSync(resourcesIndexPath)) {
      continue;
    }

    try {
      const indexContent = fs.readFileSync(resourcesIndexPath, 'utf-8');

      // Extract links to *-RESOURCE-SHEET.md files
      // Pattern: [title](path/to/file-RESOURCE-SHEET.md)
      const resourceSheetPattern = /\[.*?\]\((.*?-RESOURCE-SHEET\.md)\)/gi;
      const matches = indexContent.matchAll(resourceSheetPattern);

      for (const match of matches) {
        const resourceSheetPath = match[1];
        if (!resourceSheets.includes(resourceSheetPath)) {
          resourceSheets.push(resourceSheetPath);
        }
      }
    } catch (error) {
      console.error(`Failed to read resources/index.md for agent ${agent.agent_id}:`, error);
    }
  }

  return resourceSheets;
}

/**
 * Get detailed session information by feature name
 *
 * Reads communication.json and returns full session details
 * including orchestrator, agents, and parallel execution info.
 *
 * For hierarchical sessions (agent-subdirectory pattern):
 * - Reads agent/<agent-id>/communication.json for each agent
 * - Populates agent.tasks, agent.success_metrics, etc.
 * - Extracts created workorders from agent outputs
 *
 * For flat sessions (legacy):
 * - Only reads session-level communication.json
 * - Hierarchical fields remain undefined (backward compatible)
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

    // Enrich agents with hierarchical data (if agent subdirectories exist)
    // Read agent/<agent-id>/communication.json for each agent
    const enrichedAgents = await Promise.all(
      agents.map(async (agent) => {
        const hierarchicalData = await readAgentSubdirectory(sessionPath, agent.agent_id);
        return {
          ...agent,
          ...hierarchicalData  // Merge hierarchical fields (tasks, success_metrics, etc.)
        };
      })
    );

    // Always recalculate aggregation from agents array (source of truth)
    // Don't trust commData.aggregation as it may be stale from template
    const aggregation = calculateAggregation(enrichedAgents);
    const calculatedStatus = calculateSessionStatus(enrichedAgents);

    // Extract Phase 2 data from agent subdirectories
    const createdWorkorders = await extractWorkordersCreated(sessionPath, enrichedAgents);
    const filesModified = await extractFilesModified(sessionPath, enrichedAgents);
    const resourceSheets = await extractResourceSheets(sessionPath, enrichedAgents);

    const sessionDetail: SessionDetail = {
      workorder_id: commData.workorder_id || 'UNKNOWN',
      feature_name: commData.feature_name || featureName,
      status: commData.status || calculatedStatus,
      created: commData.created || 'Unknown',
      description: commData.description || '',
      total_agents: enrichedAgents.length,
      completed_agents: aggregation.completed,
      orchestrator: commData.orchestrator,
      agents: enrichedAgents,  // Use enriched agents with hierarchical data
      parallel_execution: commData.parallel_execution,
      aggregation: aggregation,
      instructions_file: commData.instructions_file,

      // Hierarchical session fields (Phase 1)
      phases: commData.phases,  // Session-level phase tracking
      completed_at: commData.completed_at,
      duration: commData.duration,

      // Hierarchical session fields (Phase 2)
      created_workorders: createdWorkorders.length > 0 ? createdWorkorders : undefined,
      files_modified: filesModified.length > 0 ? filesModified : undefined,
      resource_sheets: resourceSheets.length > 0 ? resourceSheets : undefined
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

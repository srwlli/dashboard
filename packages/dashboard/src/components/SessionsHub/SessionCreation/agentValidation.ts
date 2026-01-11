/**
 * Agent assignment validation utilities
 */

import type { AgentAssignment, InstructionBlock } from './types';

export interface ValidationError {
  type: 'error' | 'warning';
  agentId: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Validate all agent assignments
 */
export function validateAgentAssignments(
  agents: AgentAssignment[],
  instructionBlocks: InstructionBlock[]
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Rule 1: At least one agent must be assigned
  if (agents.length === 0) {
    errors.push({
      type: 'error',
      agentId: 'global',
      message: 'At least one agent must be assigned'
    });
  }

  // Rule 2: Each agent must have a role
  agents.forEach(agent => {
    if (!agent.role || agent.role.trim() === '') {
      errors.push({
        type: 'error',
        agentId: agent.agentId,
        message: 'Agent must have a role defined'
      });
    }
  });

  // Rule 3: Each agent must have at least one instruction
  agents.forEach(agent => {
    if (agent.instructions.length === 0) {
      errors.push({
        type: 'error',
        agentId: agent.agentId,
        message: 'Agent must have at least one instruction assigned'
      });
    }
  });

  // Rule 4: Each agent must have at least one output file
  agents.forEach(agent => {
    if (agent.outputFiles.length === 0) {
      errors.push({
        type: 'error',
        agentId: agent.agentId,
        message: 'Agent must specify at least one output file'
      });
    }
  });

  // Rule 5: All instructions must be assigned to at least one agent
  const assignedInstructionIds = new Set(
    agents.flatMap(agent => agent.instructions)
  );

  instructionBlocks.forEach(block => {
    if (!assignedInstructionIds.has(block.id)) {
      warnings.push({
        type: 'warning',
        agentId: 'global',
        message: `Instruction "${block.content.substring(0, 50)}..." is not assigned to any agent`
      });
    }
  });

  // Rule 6: Detect circular dependencies
  const circularDeps = detectCircularDependencies(agents);
  circularDeps.forEach(cycle => {
    errors.push({
      type: 'error',
      agentId: cycle[0],
      message: `Circular dependency detected: ${cycle.join(' → ')}`
    });
  });

  // Rule 7: Check for duplicate output files across agents
  const outputFileMap = new Map<string, string[]>();
  agents.forEach(agent => {
    agent.outputFiles.forEach(file => {
      if (!outputFileMap.has(file)) {
        outputFileMap.set(file, []);
      }
      outputFileMap.get(file)!.push(agent.agentId);
    });
  });

  outputFileMap.forEach((agentIds, file) => {
    if (agentIds.length > 1) {
      warnings.push({
        type: 'warning',
        agentId: 'global',
        message: `File "${file}" is assigned to multiple agents: ${agentIds.join(', ')}`
      });
    }
  });

  // Rule 8: Warn if agent has many instructions (potential overload)
  agents.forEach(agent => {
    if (agent.instructions.length > 5) {
      warnings.push({
        type: 'warning',
        agentId: agent.agentId,
        message: `Agent has ${agent.instructions.length} instructions - consider splitting workload`
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Detect circular dependencies in agent graph
 */
function detectCircularDependencies(agents: AgentAssignment[]): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  // Build adjacency list
  const graph = new Map<string, string[]>();
  agents.forEach(agent => {
    graph.set(agent.agentId, agent.dependsOn || []);
  });

  // DFS to detect cycles
  function dfs(agentId: string, path: string[]): boolean {
    visited.add(agentId);
    recursionStack.add(agentId);
    path.push(agentId);

    const dependencies = graph.get(agentId) || [];

    for (const depId of dependencies) {
      if (!visited.has(depId)) {
        if (dfs(depId, [...path])) {
          return true;
        }
      } else if (recursionStack.has(depId)) {
        // Cycle detected
        const cycleStart = path.indexOf(depId);
        cycles.push([...path.slice(cycleStart), depId]);
        return true;
      }
    }

    recursionStack.delete(agentId);
    return false;
  }

  // Check each agent for cycles
  agents.forEach(agent => {
    if (!visited.has(agent.agentId)) {
      dfs(agent.agentId, []);
    }
  });

  return cycles;
}

/**
 * Check if agent is ready for execution
 */
export function isAgentReady(agent: AgentAssignment): boolean {
  return (
    agent.role.trim() !== '' &&
    agent.instructions.length > 0 &&
    agent.outputFiles.length > 0
  );
}

/**
 * Get agent readiness percentage
 */
export function getAgentReadiness(agents: AgentAssignment[]): number {
  if (agents.length === 0) return 0;

  const readyCount = agents.filter(isAgentReady).length;
  return Math.round((readyCount / agents.length) * 100);
}

/**
 * Check if all agents are ready
 */
export function areAllAgentsReady(agents: AgentAssignment[]): boolean {
  return agents.length > 0 && agents.every(isAgentReady);
}

/**
 * Get validation summary text
 */
export function getValidationSummary(result: ValidationResult): string {
  const parts: string[] = [];

  if (result.errors.length > 0) {
    parts.push(`${result.errors.length} error${result.errors.length !== 1 ? 's' : ''}`);
  }

  if (result.warnings.length > 0) {
    parts.push(`${result.warnings.length} warning${result.warnings.length !== 1 ? 's' : ''}`);
  }

  if (parts.length === 0) {
    return 'All validation checks passed';
  }

  return parts.join(', ');
}

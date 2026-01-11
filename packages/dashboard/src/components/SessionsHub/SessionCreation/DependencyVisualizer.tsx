'use client';

import React from 'react';
import { GitBranch, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { AgentAssignment } from './types';

interface DependencyVisualizerProps {
  agents: AgentAssignment[];
}

export const DependencyVisualizer: React.FC<DependencyVisualizerProps> = ({ agents }) => {
  // Get agent number from ID
  const getAgentNumber = (agentId: string): number => {
    return agents.findIndex(a => a.agentId === agentId) + 1;
  };

  // Detect if agent has no dependencies (can run immediately)
  const canRunImmediately = (agent: AgentAssignment): boolean => {
    return !agent.dependsOn || agent.dependsOn.length === 0;
  };

  // Get execution level (wave) for each agent
  const getExecutionLevels = (): Map<number, AgentAssignment[]> => {
    const levels = new Map<number, AgentAssignment[]>();
    const processed = new Set<string>();

    let level = 0;

    while (processed.size < agents.length) {
      const currentLevel: AgentAssignment[] = [];

      agents.forEach(agent => {
        if (processed.has(agent.agentId)) return;

        // Check if all dependencies are processed
        const depsProcessed = (agent.dependsOn || []).every(depId => processed.has(depId));

        if (depsProcessed) {
          currentLevel.push(agent);
          processed.add(agent.agentId);
        }
      });

      if (currentLevel.length > 0) {
        levels.set(level, currentLevel);
        level++;
      } else {
        // Circular dependency or orphaned agents
        break;
      }
    }

    return levels;
  };

  const executionLevels = getExecutionLevels();

  // Check for circular dependencies
  const hasCircularDeps = agents.some(a => !Array.from(executionLevels.values()).flat().includes(a));

  if (agents.length === 0) {
    return (
      <div className="text-center py-8 bg-ind-panel rounded border border-ind-border">
        <GitBranch className="w-10 h-10 mx-auto mb-2 text-ind-text-muted opacity-30" />
        <p className="text-sm text-ind-text-muted">
          No agents to visualize
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-ind-text mb-1">
            Execution Flow
          </h3>
          <p className="text-sm text-ind-text-muted">
            Agents grouped by execution wave (parallel execution within each wave)
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="text-ind-text-muted">No dependencies</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="text-ind-text-muted">Has dependencies</span>
          </div>
        </div>
      </div>

      {/* Circular Dependency Warning */}
      {hasCircularDeps && (
        <div className="border-2 border-ind-error rounded-lg p-4 bg-ind-error/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-ind-error flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-ind-error mb-1">
                Circular Dependency Detected
              </h4>
              <p className="text-sm text-ind-error">
                One or more agents have circular dependencies and cannot be scheduled for execution.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Execution Waves */}
      <div className="space-y-6">
        {Array.from(executionLevels.entries()).map(([level, levelAgents]) => (
          <div key={level} className="relative">
            {/* Wave Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-ind-accent flex items-center justify-center text-sm font-bold text-black">
                {level + 1}
              </div>
              <div>
                <h4 className="text-sm font-bold text-ind-text">
                  Wave {level + 1}
                </h4>
                <p className="text-xs text-ind-text-muted">
                  {levelAgents.length} agent{levelAgents.length !== 1 ? 's' : ''} run in parallel
                </p>
              </div>
            </div>

            {/* Agents in this wave */}
            <div className="ml-11 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {levelAgents.map(agent => {
                const agentNum = getAgentNumber(agent.agentId);
                const immediate = canRunImmediately(agent);

                return (
                  <div
                    key={agent.agentId}
                    className="p-3 rounded border border-ind-border bg-ind-panel"
                  >
                    {/* Agent Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${immediate ? 'bg-green-400' : 'bg-yellow-400'}`} />
                      <span className="text-sm font-bold text-ind-text">
                        Agent {agentNum}
                      </span>
                    </div>

                    {/* Role */}
                    {agent.role && (
                      <p className="text-xs text-ind-text-muted mb-2 line-clamp-2">
                        {agent.role}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-xs text-ind-text-muted">
                      <span>{agent.instructions.length} tasks</span>
                      <span>•</span>
                      <span>{agent.outputFiles.length} outputs</span>
                    </div>

                    {/* Dependencies */}
                    {agent.dependsOn && agent.dependsOn.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-ind-border">
                        <div className="flex items-center gap-2 text-xs">
                          <GitBranch className="w-3 h-3 text-ind-accent" />
                          <span className="text-ind-text-muted">
                            After: Agent {agent.dependsOn.map(getAgentNumber).join(', ')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Connector Line */}
            {level < executionLevels.size - 1 && (
              <div className="ml-3.5 w-1 h-6 bg-ind-border" />
            )}
          </div>
        ))}
      </div>

      {/* Execution Summary */}
      <div className="bg-ind-accent/10 border border-ind-accent/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-ind-accent flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-ind-text mb-1">
              Execution Plan Summary
            </h4>
            <ul className="text-sm text-ind-text-muted space-y-1">
              <li>• Total agents: {agents.length}</li>
              <li>• Execution waves: {executionLevels.size}</li>
              <li>
                • Immediate execution: {agents.filter(canRunImmediately).length} agent
                {agents.filter(canRunImmediately).length !== 1 ? 's' : ''}
              </li>
              <li>
                • Dependent execution: {agents.filter(a => !canRunImmediately(a)).length} agent
                {agents.filter(a => !canRunImmediately(a)).length !== 1 ? 's' : ''}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

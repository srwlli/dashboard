'use client';

import React, { useState } from 'react';
import { Users, Plus, X } from 'lucide-react';
import { AgentCard } from './AgentCard';
import type { InstructionBlock, Attachment, AgentAssignment } from './types';

interface AgentAssignerProps {
  instructionBlocks: InstructionBlock[];
  attachments: Attachment[];
  agents: AgentAssignment[];
  onAgentsChange: (agents: AgentAssignment[]) => void;
}

export const AgentAssigner: React.FC<AgentAssignerProps> = ({
  instructionBlocks,
  attachments,
  agents,
  onAgentsChange
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [maxAgents] = useState(5); // Maximum number of agents allowed

  // Add new agent
  const handleAddAgent = () => {
    if (agents.length >= maxAgents) return;

    const newAgent: AgentAssignment = {
      agentId: `agent-${agents.length + 1}`,
      role: '',
      instructions: [],
      attachments: [],
      outputFiles: [],
      dependsOn: []
    };

    onAgentsChange([...agents, newAgent]);
    setSelectedAgentId(newAgent.agentId);
  };

  // Remove agent
  const handleRemoveAgent = (agentId: string) => {
    const updatedAgents = agents.filter(a => a.agentId !== agentId);

    // Update dependencies - remove references to deleted agent
    const cleanedAgents = updatedAgents.map(agent => ({
      ...agent,
      dependsOn: agent.dependsOn?.filter(id => id !== agentId) || []
    }));

    onAgentsChange(cleanedAgents);

    if (selectedAgentId === agentId) {
      setSelectedAgentId(null);
    }
  };

  // Update agent role
  const handleRoleChange = (agentId: string, role: string) => {
    const updatedAgents = agents.map(agent =>
      agent.agentId === agentId ? { ...agent, role } : agent
    );
    onAgentsChange(updatedAgents);
  };

  // Toggle instruction assignment
  const handleToggleInstruction = (agentId: string, instructionId: string) => {
    const updatedAgents = agents.map(agent => {
      if (agent.agentId !== agentId) return agent;

      const hasInstruction = agent.instructions.includes(instructionId);

      return {
        ...agent,
        instructions: hasInstruction
          ? agent.instructions.filter(id => id !== instructionId)
          : [...agent.instructions, instructionId]
      };
    });

    onAgentsChange(updatedAgents);
  };

  // Toggle attachment assignment
  const handleToggleAttachment = (agentId: string, attachmentId: string) => {
    const updatedAgents = agents.map(agent => {
      if (agent.agentId !== agentId) return agent;

      const hasAttachment = agent.attachments.includes(attachmentId);

      return {
        ...agent,
        attachments: hasAttachment
          ? agent.attachments.filter(id => id !== attachmentId)
          : [...agent.attachments, attachmentId]
      };
    });

    onAgentsChange(updatedAgents);
  };

  // Update output files
  const handleOutputFilesChange = (agentId: string, outputFiles: string[]) => {
    const updatedAgents = agents.map(agent =>
      agent.agentId === agentId ? { ...agent, outputFiles } : agent
    );
    onAgentsChange(updatedAgents);
  };

  // Toggle dependency
  const handleToggleDependency = (agentId: string, dependencyId: string) => {
    const updatedAgents = agents.map(agent => {
      if (agent.agentId !== agentId) return agent;

      const hasDependency = agent.dependsOn?.includes(dependencyId);

      return {
        ...agent,
        dependsOn: hasDependency
          ? (agent.dependsOn || []).filter(id => id !== dependencyId)
          : [...(agent.dependsOn || []), dependencyId]
      };
    });

    onAgentsChange(updatedAgents);
  };

  // Get agent number from ID
  const getAgentNumber = (agentId: string): number => {
    return agents.findIndex(a => a.agentId === agentId) + 1;
  };

  // Get selected agent
  const selectedAgent = selectedAgentId
    ? agents.find(a => a.agentId === selectedAgentId)
    : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-ind-text mb-1">
            Agent Assignment
          </h3>
          <p className="text-sm text-ind-text-muted">
            Assign instructions and attachments to agents for parallel execution
          </p>
        </div>

        {/* Add Agent Button */}
        <button
          onClick={handleAddAgent}
          disabled={agents.length >= maxAgents}
          className={`px-4 py-2 font-bold uppercase tracking-wider text-sm transition-all flex items-center gap-2 ${
            agents.length < maxAgents
              ? 'bg-ind-accent text-black hover:bg-ind-accent/90'
              : 'bg-ind-border text-ind-text-muted cursor-not-allowed'
          }`}
        >
          <Plus className="w-4 h-4" />
          Add Agent ({agents.length}/{maxAgents})
        </button>
      </div>

      {/* Empty State */}
      {agents.length === 0 && (
        <div className="text-center py-12 bg-ind-panel rounded border border-ind-border">
          <Users className="w-12 h-12 mx-auto mb-3 text-ind-text-muted opacity-30" />
          <p className="text-sm text-ind-text-muted mb-4">
            No agents assigned yet. Add an agent to get started.
          </p>
          <button
            onClick={handleAddAgent}
            className="px-4 py-2 font-bold uppercase tracking-wider text-sm bg-ind-accent text-black hover:bg-ind-accent/90 transition-all"
          >
            <Plus className="w-4 h-4 inline-block mr-2" />
            Add First Agent
          </button>
        </div>
      )}

      {/* Two-Column Layout */}
      {agents.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Agent List */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-ind-text uppercase tracking-wider mb-3">
              Agents ({agents.length})
            </h4>
            {agents.map((agent, index) => (
              <div key={agent.agentId} className="relative">
                <AgentCard
                  agentNumber={index + 1}
                  role={agent.role}
                  assignedInstructions={agent.instructions.length}
                  assignedAttachments={agent.attachments.length}
                  outputFiles={agent.outputFiles}
                  dependsOn={(agent.dependsOn || []).map(getAgentNumber)}
                  isAssigned={selectedAgentId === agent.agentId}
                  onSelect={() => setSelectedAgentId(agent.agentId)}
                />

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveAgent(agent.agentId)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-ind-error/10 border border-ind-error/30 flex items-center justify-center hover:bg-ind-error/20 transition-all"
                  title="Remove agent"
                >
                  <X className="w-3.5 h-3.5 text-ind-error" />
                </button>
              </div>
            ))}
          </div>

          {/* Right: Agent Configuration */}
          <div className="bg-ind-panel rounded border border-ind-border p-4">
            {selectedAgent ? (
              <div className="space-y-4">
                {/* Agent Header */}
                <div>
                  <h4 className="text-sm font-bold text-ind-text uppercase tracking-wider mb-3">
                    Configure Agent {getAgentNumber(selectedAgent.agentId)}
                  </h4>
                </div>

                {/* Role Input */}
                <div>
                  <label className="block text-xs font-bold text-ind-text-muted uppercase tracking-wider mb-2">
                    Role / Responsibility
                  </label>
                  <input
                    type="text"
                    value={selectedAgent.role}
                    onChange={(e) => handleRoleChange(selectedAgent.agentId, e.target.value)}
                    placeholder="e.g., Frontend Developer, API Designer"
                    className="w-full px-3 py-2 bg-ind-bg border border-ind-border text-ind-text text-sm placeholder:text-ind-text-muted focus:outline-none focus:border-ind-accent"
                  />
                </div>

                {/* Instructions Assignment */}
                <div>
                  <label className="block text-xs font-bold text-ind-text-muted uppercase tracking-wider mb-2">
                    Instructions ({selectedAgent.instructions.length}/{instructionBlocks.length})
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {instructionBlocks.map(block => {
                      const isAssigned = selectedAgent.instructions.includes(block.id);
                      return (
                        <label
                          key={block.id}
                          className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-all ${
                            isAssigned
                              ? 'border-ind-accent bg-ind-accent/5'
                              : 'border-ind-border bg-ind-bg hover:bg-ind-panel'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={() => handleToggleInstruction(selectedAgent.agentId, block.id)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-ind-text mb-1 line-clamp-2">
                              {block.content.substring(0, 100)}...
                            </div>
                            <div className="text-xs text-ind-text-muted">
                              Type: {block.type}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Attachments Assignment */}
                {attachments.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-ind-text-muted uppercase tracking-wider mb-2">
                      Attachments ({selectedAgent.attachments.length}/{attachments.length})
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {attachments.map(attachment => {
                        const isAssigned = selectedAgent.attachments.includes(attachment.id);
                        return (
                          <label
                            key={attachment.id}
                            className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-all ${
                              isAssigned
                                ? 'border-ind-accent bg-ind-accent/5'
                                : 'border-ind-border bg-ind-bg hover:bg-ind-panel'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isAssigned}
                              onChange={() => handleToggleAttachment(selectedAgent.agentId, attachment.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-ind-text truncate">
                                {attachment.name}
                              </div>
                              <div className="text-xs text-ind-text-muted">
                                {attachment.type}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Output Files */}
                <div>
                  <label className="block text-xs font-bold text-ind-text-muted uppercase tracking-wider mb-2">
                    Output Files (one per line)
                  </label>
                  <textarea
                    value={selectedAgent.outputFiles.join('\n')}
                    onChange={(e) => {
                      const files = e.target.value
                        .split('\n')
                        .map(f => f.trim())
                        .filter(Boolean);
                      handleOutputFilesChange(selectedAgent.agentId, files);
                    }}
                    placeholder="src/components/Button.tsx&#10;src/hooks/useAuth.ts"
                    rows={4}
                    className="w-full px-3 py-2 bg-ind-bg border border-ind-border text-ind-text text-sm font-mono placeholder:text-ind-text-muted focus:outline-none focus:border-ind-accent resize-none"
                  />
                </div>

                {/* Dependencies */}
                {agents.length > 1 && (
                  <div>
                    <label className="block text-xs font-bold text-ind-text-muted uppercase tracking-wider mb-2">
                      Dependencies (runs after)
                    </label>
                    <div className="space-y-2">
                      {agents
                        .filter(a => a.agentId !== selectedAgent.agentId)
                        .map(agent => {
                          const isDependency = selectedAgent.dependsOn?.includes(agent.agentId);
                          return (
                            <label
                              key={agent.agentId}
                              className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-all ${
                                isDependency
                                  ? 'border-ind-accent bg-ind-accent/5'
                                  : 'border-ind-border bg-ind-bg hover:bg-ind-panel'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isDependency}
                                onChange={() => handleToggleDependency(selectedAgent.agentId, agent.agentId)}
                              />
                              <div className="flex-1">
                                <div className="text-xs font-bold text-ind-text">
                                  Agent {getAgentNumber(agent.agentId)}
                                </div>
                                {agent.role && (
                                  <div className="text-xs text-ind-text-muted">
                                    {agent.role}
                                  </div>
                                )}
                              </div>
                            </label>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-3 text-ind-text-muted opacity-30" />
                <p className="text-sm text-ind-text-muted">
                  Select an agent to configure
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

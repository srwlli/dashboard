'use client';

/**
 * AgentCard Component
 *
 * Displays individual agent information with:
 * - Agent ID and workorder ID
 * - Role description
 * - Status badge with color coding
 * - Phases with checkboxes
 * - Output file link
 * - Notes section
 * - Forbidden files list
 */

import React from 'react';
import { CheckCircle2, Circle, FileText, AlertTriangle } from 'lucide-react';
import type { AgentInfo } from '@/lib/api/sessions';

interface AgentCardProps {
  agent: AgentInfo;
  onViewOutput?: () => void;
  className?: string;
}

/**
 * Get status badge styling
 */
function getStatusStyle(status: AgentInfo['status']) {
  switch (status) {
    case 'not_started':
      return 'bg-ind-text-muted/10 text-ind-text-muted';
    case 'in_progress':
      return 'bg-ind-accent/10 text-ind-accent';
    case 'complete':
      return 'bg-ind-success/10 text-ind-success';
    case 'blocked':
      return 'bg-ind-warning/10 text-ind-warning';
    default:
      return 'bg-ind-bg/30 text-ind-text-muted';
  }
}

/**
 * Get status label
 */
function getStatusLabel(status: AgentInfo['status']) {
  return status.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

export default function AgentCard({
  agent,
  onViewOutput,
  className = ''
}: AgentCardProps) {
  return (
    <div className={`
      border border-ind-border rounded-lg p-4 bg-ind-panel
      ${className}
    `}>
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-ind-text mb-1">
          {agent.agent_id}
        </h3>
        {agent.workorder_id && (
          <div className="text-xs text-ind-text-muted">
            {agent.workorder_id}
          </div>
        )}
      </div>

      {/* Role */}
      <div className="mb-3">
        <span className="text-xs text-ind-text-muted block mb-1">Role:</span>
        <p className="text-xs text-ind-text">{agent.role}</p>
      </div>

      {/* Status */}
      <div className="mb-3">
        <span className={`
          inline-flex items-center px-2 py-1 rounded-md text-xs font-medium
          ${getStatusStyle(agent.status)}
        `}>
          {getStatusLabel(agent.status)}
        </span>
      </div>

      {/* Task-Level Metrics (Hierarchical Session Structure) */}
      {agent.tasks && agent.tasks.length > 0 && (
        <div className="mb-3 pt-3 border-t border-ind-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {/* Tasks Completion */}
            <div>
              <span className="text-ind-text-muted block mb-1">Tasks</span>
              <span className="text-ind-text font-medium">
                {agent.tasks.filter(t => t.status === 'complete').length}/{agent.tasks.length}
              </span>
            </div>

            {/* Progress from Success Metrics */}
            {agent.success_metrics?.status && (
              <div>
                <span className="text-ind-text-muted block mb-1">Progress</span>
                <span className="text-ind-text font-medium">
                  {typeof agent.success_metrics.status === 'string'
                    ? agent.success_metrics.status
                    : `${agent.success_metrics.status}%`}
                </span>
              </div>
            )}

            {/* Phase Assignment */}
            {agent.phase && (
              <div>
                <span className="text-ind-text-muted block mb-1">Phase</span>
                <span className="px-2 py-0.5 bg-ind-accent/10 text-ind-accent rounded text-xs font-medium">
                  {agent.phase}
                </span>
              </div>
            )}

            {/* Duration (if started timestamp available) */}
            {agent.started && (
              <div>
                <span className="text-ind-text-muted block mb-1">Duration</span>
                <span className="text-ind-text font-medium">
                  {(() => {
                    try {
                      const start = new Date(agent.started).getTime();
                      const now = Date.now();
                      const durationMs = now - start;
                      const hours = Math.floor(durationMs / (1000 * 60 * 60));
                      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

                      if (hours > 0) {
                        return `${hours}h ${minutes}m`;
                      }
                      return `${minutes}m`;
                    } catch {
                      return 'N/A';
                    }
                  })()}
                </span>
              </div>
            )}
          </div>

          {/* Empty state for flat sessions */}
          {(!agent.success_metrics && !agent.phase && !agent.started) && (
            <div className="text-xs text-ind-text-muted italic">
              Task tracking not available for this session
            </div>
          )}
        </div>
      )}

      {/* Phases */}
      {agent.phases && agent.phases.length > 0 && (
        <div className="mb-3">
          <span className="text-xs text-ind-text-muted block mb-2">Phases:</span>
          <div className="space-y-1.5">
            {agent.phases.map((phase, index) => (
              <div key={index} className="flex items-start gap-2 text-xs">
                {agent.status === 'complete' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-ind-success mt-0.5 flex-shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-ind-text-muted mt-0.5 flex-shrink-0" />
                )}
                <span className={`
                  ${agent.status === 'complete' ? 'text-ind-success' : 'text-ind-text'}
                `}>
                  {phase}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Output File */}
      {agent.output_file && (
        <div className="mb-3">
          <button
            onClick={onViewOutput}
            className="flex items-center gap-2 text-xs text-ind-accent hover:underline"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Output</span>
          </button>
        </div>
      )}

      {/* Dependencies */}
      {agent.depends_on && agent.depends_on.length > 0 && (
        <div className="mb-3 p-2 bg-ind-bg rounded-md">
          <span className="text-xs text-ind-text-muted block mb-1">Depends on:</span>
          <div className="flex flex-wrap gap-1">
            {agent.depends_on.map(dep => (
              <span key={dep} className="px-1.5 py-0.5 bg-ind-warning/10 text-ind-warning text-xs rounded">
                {dep}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Forbidden Files */}
      {agent.forbidden_files && agent.forbidden_files.length > 0 && (
        <div className="mb-3 p-2 bg-ind-warning/5 border border-ind-warning/20 rounded-md">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle className="w-3 h-3 text-ind-warning" />
            <span className="text-xs text-ind-warning font-medium">Forbidden Files:</span>
          </div>
          <div className="space-y-0.5">
            {agent.forbidden_files.map((file, index) => (
              <div key={index} className="text-xs text-ind-text-muted font-mono">
                {file}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {agent.notes && (
        <div className="p-2 bg-ind-bg rounded-md">
          <span className="text-xs text-ind-text-muted block mb-1">Notes:</span>
          <p className="text-xs text-ind-text">{agent.notes}</p>
        </div>
      )}
    </div>
  );
}

'use client';

/**
 * SessionDetail Component
 *
 * Displays detailed view of a single session with:
 * - Orchestrator panel at top
 * - Agents grid below
 * - Real-time status updates
 * - Manual refresh button
 * - Manual "Mark as Complete" button (when all agents complete but session isn't)
 */

import React from 'react';
import { RefreshCw, User, Users, CheckCircle } from 'lucide-react';
import type { SessionDetail as SessionDetailType } from '@/lib/api/sessions';
import AgentCard from './AgentCard';
import SessionMetricsCard from './SessionMetricsCard';

interface SessionDetailProps {
  session: SessionDetailType;
  onRefresh?: () => void;
  onViewOutput?: (agentId: string) => void;
  onMarkComplete?: () => void;
  isRefreshing?: boolean;
  isMarkingComplete?: boolean;
  className?: string;
}

/**
 * Get status badge styling
 */
function getStatusStyle(status: string) {
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
function getStatusLabel(status: string) {
  return status.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

export default function SessionDetail({
  session,
  onRefresh,
  onViewOutput,
  onMarkComplete,
  isRefreshing = false,
  isMarkingComplete = false,
  className = ''
}: SessionDetailProps) {
  // Check if all agents and orchestrator are complete but session status isn't
  const allAgentsComplete = session.completed_agents === session.total_agents && session.orchestrator.status === 'complete';
  const canMarkComplete = allAgentsComplete && session.status !== 'complete';

  return (
    <div className={`flex flex-col h-full bg-ind-bg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-ind-border">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-ind-text mb-2">
              {session.feature_name}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-ind-text-muted">
                {session.workorder_id}
              </span>
              <span className={`
                px-2 py-1 rounded-md text-xs font-medium
                ${getStatusStyle(session.status)}
              `}>
                {getStatusLabel(session.status)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Mark as Complete Button (shown when all agents complete but session isn't) */}
            {canMarkComplete && onMarkComplete && (
              <button
                onClick={onMarkComplete}
                disabled={isMarkingComplete}
                className="px-3 py-2 rounded-md border border-ind-success bg-ind-success/10 text-ind-success hover:bg-ind-success/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Mark session as complete"
              >
                <CheckCircle className={`w-4 h-4 ${isMarkingComplete ? 'animate-pulse' : ''}`} />
                <span className="text-sm font-medium">Mark as Complete</span>
              </button>
            )}

            {/* Refresh Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-md border border-ind-border bg-ind-panel text-ind-text hover:border-ind-accent hover:text-ind-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh session status"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        {session.description && (
          <p className="text-sm text-ind-text-muted mb-4">
            {session.description}
          </p>
        )}

        {/* Progress Summary */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-ind-text-muted" />
            <span className="text-ind-text-muted">
              Agents: {session.completed_agents}/{session.total_agents} complete
            </span>
          </div>
          {session.aggregation && (
            <>
              {session.aggregation.in_progress > 0 && (
                <div className="text-ind-accent">
                  {session.aggregation.in_progress} in progress
                </div>
              )}
              {session.aggregation.blocked > 0 && (
                <div className="text-ind-warning">
                  {session.aggregation.blocked} blocked
                </div>
              )}
              {session.aggregation.not_started > 0 && (
                <div className="text-ind-text-muted">
                  {session.aggregation.not_started} not started
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Session Metrics Card */}
        <SessionMetricsCard session={session} />

        {/* Orchestrator Panel */}
        <div className="border border-ind-border rounded-lg p-4 bg-ind-panel">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-ind-accent" />
            <h2 className="text-lg font-semibold text-ind-text">Orchestrator</h2>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-ind-text-muted">Agent ID:</span>
              <span className="text-ind-text font-medium">{session.orchestrator.agent_id}</span>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-ind-text-muted min-w-[60px]">Role:</span>
              <span className="text-ind-text">{session.orchestrator.role}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-ind-text-muted">Status:</span>
              <span className={`
                px-2 py-0.5 rounded-md text-xs font-medium
                ${getStatusStyle(session.orchestrator.status)}
              `}>
                {getStatusLabel(session.orchestrator.status)}
              </span>
            </div>

            {session.orchestrator.output_file && (
              <div className="flex items-center gap-2">
                <span className="text-ind-text-muted">Output:</span>
                <button
                  onClick={() => onViewOutput?.(session.orchestrator.agent_id)}
                  className="text-ind-accent hover:underline text-xs"
                >
                  View output file
                </button>
              </div>
            )}

            {session.orchestrator.notes && (
              <div className="mt-3 p-3 bg-ind-bg rounded-md">
                <span className="text-ind-text-muted text-xs block mb-1">Notes:</span>
                <span className="text-ind-text text-xs">{session.orchestrator.notes}</span>
              </div>
            )}
          </div>

          {/* Orchestrator Metrics */}
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div className="p-2 bg-ind-bg rounded">
              <span className="text-ind-text-muted block mb-1">Agents Managed</span>
              <span className="text-ind-text font-medium">{session.total_agents}</span>
            </div>
            <div className="p-2 bg-ind-bg rounded">
              <span className="text-ind-text-muted block mb-1">Parallel Groups</span>
              <span className="text-ind-text font-medium">
                {session.parallel_execution?.can_run_simultaneously.length || 0}
              </span>
            </div>
          </div>

          {/* Output Preview Button */}
          {session.orchestrator.output_file && (
            <button
              onClick={() => onViewOutput?.(session.orchestrator.agent_id)}
              className="mt-3 w-full px-3 py-2 bg-ind-accent/10 text-ind-accent rounded-md hover:bg-ind-accent/20 transition-colors text-xs font-medium"
            >
              View Orchestrator Output →
            </button>
          )}
        </div>

        {/* Agents Grid */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-ind-accent" />
            <h2 className="text-lg font-semibold text-ind-text">
              Agents ({session.agents.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {session.agents.map((agent) => (
              <AgentCard
                key={agent.agent_id}
                agent={agent}
                onViewOutput={() => onViewOutput?.(agent.agent_id)}
              />
            ))}
          </div>
        </div>

        {/* Parallel Execution Info */}
        {session.parallel_execution?.enabled && (
          <div className="border border-ind-border rounded-lg p-4 bg-ind-panel">
            <h3 className="text-sm font-semibold text-ind-text mb-3">
              Parallel Execution
            </h3>
            <div className="space-y-2 text-xs">
              {session.parallel_execution.can_run_simultaneously.length > 0 && (
                <div>
                  <span className="text-ind-text-muted">Can run simultaneously:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {session.parallel_execution.can_run_simultaneously.map(agentId => (
                      <span key={agentId} className="px-2 py-0.5 bg-ind-accent/10 text-ind-accent rounded">
                        {agentId}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {session.parallel_execution.must_run_sequentially.length > 0 && (
                <div>
                  <span className="text-ind-text-muted">Must run sequentially:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {session.parallel_execution.must_run_sequentially.map(agentId => (
                      <span key={agentId} className="px-2 py-0.5 bg-ind-warning/10 text-ind-warning rounded">
                        {agentId}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {session.parallel_execution.rationale && (
                <div className="mt-2">
                  <span className="text-ind-text-muted">Rationale:</span>
                  <p className="text-ind-text mt-1">{session.parallel_execution.rationale}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

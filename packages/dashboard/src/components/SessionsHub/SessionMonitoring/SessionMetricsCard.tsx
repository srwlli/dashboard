'use client';

/**
 * SessionMetricsCard Component
 *
 * Displays high-level session metrics in a 6-column grid:
 * - Duration (calculated from created → completed_at)
 * - Total Agents
 * - Active Phase (from session.phases - hierarchical structure)
 * - Total Tasks (aggregated from agent.tasks arrays)
 * - Files Modified (populated in Phase 2)
 * - Completion percentage
 *
 * Responsive: 2 columns on mobile, 3 columns on tablet, 6 columns on desktop
 */

import React from 'react';
import { BarChart3 } from 'lucide-react';
import type { SessionDetail } from '@/lib/api/sessions';
import { calculateDuration } from '@/lib/utils/time';

interface SessionMetricsCardProps {
  session: SessionDetail;
  className?: string;
}

export default function SessionMetricsCard({
  session,
  className = ''
}: SessionMetricsCardProps) {
  // Calculate metrics
  const duration = calculateDuration(session.created, session.completed_at);
  const completionPercentage = session.total_agents > 0
    ? Math.round((session.completed_agents / session.total_agents) * 100)
    : 0;
  const filesModified = session.files_modified?.length || 0;

  // Calculate active phase (hierarchical sessions)
  const activePhase = (() => {
    if (!session.phases) return null;

    // Find highest phase number with status in_progress or complete
    const phaseEntries = Object.entries(session.phases);
    const activeEntry = phaseEntries
      .filter(([_, info]) => info.status === 'in_progress' || info.status === 'complete')
      .sort((a, b) => b[0].localeCompare(a[0])) // Sort descending (phase_2 before phase_1)
      .find(([_, info]) => info.status === 'in_progress') || phaseEntries.find(([_, info]) => info.status === 'complete');

    if (!activeEntry) return null;

    const [phaseKey, phaseInfo] = activeEntry;
    return {
      key: phaseKey,
      name: phaseInfo.name || phaseKey,
      progress: phaseInfo.progress || 0
    };
  })();

  // Calculate total tasks (hierarchical sessions)
  const totalTasks = (() => {
    if (!session.agents) return null;

    let completed = 0;
    let total = 0;

    for (const agent of session.agents) {
      if (agent.tasks) {
        total += agent.tasks.length;
        completed += agent.tasks.filter(t => t.status === 'complete').length;
      }
    }

    return total > 0 ? { completed, total } : null;
  })();

  return (
    <div className={`border border-ind-border rounded-lg p-4 bg-ind-panel ${className}`}>
      <h3 className="text-sm font-semibold text-ind-text mb-3 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-ind-accent" />
        Session Metrics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
        {/* Duration */}
        <div>
          <span className="text-ind-text-muted block mb-1">Duration</span>
          <span className="text-ind-text font-medium">
            {duration}
          </span>
        </div>

        {/* Total Agents */}
        <div>
          <span className="text-ind-text-muted block mb-1">Total Agents</span>
          <span className="text-ind-text font-medium">{session.total_agents}</span>
        </div>

        {/* Active Phase (Hierarchical Sessions Only) */}
        <div>
          <span className="text-ind-text-muted block mb-1">Active Phase</span>
          {activePhase ? (
            <div className="flex flex-col gap-0.5">
              <span className="text-ind-text font-medium text-xs">
                {activePhase.name}
              </span>
              <span className="text-ind-accent text-xs">
                {activePhase.progress}
              </span>
            </div>
          ) : (
            <span className="text-ind-text-muted text-xs">N/A</span>
          )}
        </div>

        {/* Total Tasks (Hierarchical Sessions Only) */}
        <div>
          <span className="text-ind-text-muted block mb-1">Tasks</span>
          {totalTasks ? (
            <span className="text-ind-text font-medium">
              {totalTasks.completed}/{totalTasks.total}
            </span>
          ) : (
            <span className="text-ind-text-muted text-xs">N/A</span>
          )}
        </div>

        {/* Files Modified */}
        <div>
          <span className="text-ind-text-muted block mb-1">Files Modified</span>
          <span className="text-ind-text font-medium">
            {filesModified === 0 ? 'TBD' : filesModified}
          </span>
        </div>

        {/* Completion Rate */}
        <div>
          <span className="text-ind-text-muted block mb-1">Completion</span>
          <span className="text-ind-text font-medium">
            {completionPercentage}%
          </span>
        </div>
      </div>
    </div>
  );
}

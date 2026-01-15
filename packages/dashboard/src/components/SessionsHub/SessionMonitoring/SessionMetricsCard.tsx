'use client';

/**
 * SessionMetricsCard Component
 *
 * Displays high-level session metrics in a 4-column grid:
 * - Duration (calculated from created → completed_at)
 * - Total Agents
 * - Files Modified (populated in Phase 2)
 * - Completion percentage
 *
 * Responsive: 2 columns on mobile, 4 columns on desktop
 */

import React from 'react';
import { BarChart3 } from 'lucide-react';
import type { SessionDetail } from '@/lib/api/sessions';
import { calculateDuration } from '@/lib/api/sessions';

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

  return (
    <div className={`border border-ind-border rounded-lg p-4 bg-ind-panel ${className}`}>
      <h3 className="text-sm font-semibold text-ind-text mb-3 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-ind-accent" />
        Session Metrics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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

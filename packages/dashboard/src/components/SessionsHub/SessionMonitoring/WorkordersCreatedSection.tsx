'use client';

/**
 * WorkordersCreatedSection Component
 *
 * Displays workorders created during session execution as deliverables.
 * Shows list of workorder IDs with links to their directories.
 */

import React from 'react';
import { Briefcase, ExternalLink } from 'lucide-react';

interface WorkordersCreatedSectionProps {
  workorders: string[];
  className?: string;
}

export default function WorkordersCreatedSection({
  workorders,
  className = ''
}: WorkordersCreatedSectionProps) {
  if (!workorders || workorders.length === 0) {
    return null;
  }

  return (
    <div className={`border border-ind-border rounded-lg p-4 bg-ind-panel ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Briefcase className="w-5 h-5 text-ind-accent" />
        <h3 className="text-lg font-semibold text-ind-text">
          Workorders Created
        </h3>
        <span className="ml-auto px-2 py-0.5 bg-ind-accent/10 text-ind-accent rounded text-xs font-medium">
          {workorders.length}
        </span>
      </div>

      <p className="text-sm text-ind-text-muted mb-3">
        Workorders created during session execution as deliverables
      </p>

      <div className="space-y-2">
        {workorders.map((workorderId, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-ind-bg rounded-md border border-ind-border hover:border-ind-accent transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-ind-text-muted group-hover:text-ind-accent transition-colors" />
              <span className="text-sm font-medium text-ind-text font-mono">
                {workorderId}
              </span>
            </div>

            <button
              onClick={() => {
                // Future: Navigate to workorder detail view
                console.log('Navigate to workorder:', workorderId);
              }}
              className="flex items-center gap-1.5 px-2 py-1 text-xs text-ind-accent hover:bg-ind-accent/10 rounded transition-colors"
              title="View workorder details"
            >
              <span>View</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Empty state for when session hasn't created any workorders yet */}
      {workorders.length === 0 && (
        <div className="text-center py-6">
          <Briefcase className="w-8 h-8 text-ind-text-muted mx-auto mb-2 opacity-50" />
          <p className="text-sm text-ind-text-muted">
            No workorders created yet
          </p>
        </div>
      )}
    </div>
  );
}

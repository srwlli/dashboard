'use client';

/**
 * WorkordersCreatedSection Component
 *
 * Displays workorders created during session execution as deliverables.
 * Shows workorder metadata from context.json including requirements and success criteria.
 */

import React from 'react';
import { Briefcase, ExternalLink, Calendar, CheckCircle } from 'lucide-react';
import type { WorkorderInfo } from '@/lib/api/sessions';

interface WorkordersCreatedSectionProps {
  workorders: WorkorderInfo[];
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

      <div className="space-y-3">
        {workorders.map((workorder, index) => (
          <div
            key={index}
            className="p-4 bg-ind-bg rounded-md border border-ind-border hover:border-ind-accent transition-colors"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-ind-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-ind-text font-mono">
                    {workorder.id}
                  </h4>
                  {workorder.metadata?.feature_name && (
                    <p className="text-xs text-ind-text-muted mt-0.5">
                      {workorder.metadata.feature_name}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  // Future: Navigate to workorder detail view
                  console.log('Navigate to workorder:', workorder.id);
                }}
                className="flex items-center gap-1.5 px-2 py-1 text-xs text-ind-accent hover:bg-ind-accent/10 rounded transition-colors flex-shrink-0"
                title="View workorder details"
              >
                <span>View</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Metadata */}
            {workorder.metadata && (
              <div className="space-y-3 text-xs">
                {/* Agent & Created */}
                <div className="flex items-center gap-4 text-ind-text-muted">
                  {workorder.metadata.agent_id && (
                    <div className="flex items-center gap-1.5">
                      <span className="opacity-70">Agent:</span>
                      <span className="text-ind-text font-medium">{workorder.metadata.agent_id}</span>
                    </div>
                  )}
                  {workorder.metadata.created_at && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 opacity-70" />
                      <span>{new Date(workorder.metadata.created_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Requirements */}
                {workorder.metadata.requirements && workorder.metadata.requirements.length > 0 && (
                  <div>
                    <div className="text-ind-text-muted mb-1.5 opacity-70">Requirements:</div>
                    <ul className="space-y-1">
                      {workorder.metadata.requirements.slice(0, 3).map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-ind-text">
                          <span className="text-ind-accent mt-0.5">•</span>
                          <span className="flex-1">{req}</span>
                        </li>
                      ))}
                      {workorder.metadata.requirements.length > 3 && (
                        <li className="text-ind-text-muted opacity-70 ml-4">
                          +{workorder.metadata.requirements.length - 3} more...
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Success Criteria Count */}
                {workorder.metadata.success_criteria && Object.keys(workorder.metadata.success_criteria).length > 0 && (
                  <div className="flex items-center gap-1.5 text-ind-text-muted">
                    <CheckCircle className="w-3 h-3 text-ind-success" />
                    <span>
                      {Object.keys(workorder.metadata.success_criteria).length} success criteria defined
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Path (for debugging/reference) */}
            {workorder.path && (
              <div className="mt-2 pt-2 border-t border-ind-border/50">
                <span className="text-xs text-ind-text-muted font-mono opacity-50">
                  {workorder.path}
                </span>
              </div>
            )}
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

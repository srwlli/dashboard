'use client';

import { Clock, CheckCircle, RefreshCw, Zap, Sparkles, Lock } from 'lucide-react';
import { WorkorderObject } from '@/types/workorders';

interface WorkorderCardProps {
  workorder: WorkorderObject;
  onClick?: () => void;
}

const statusIcons: Record<string, any> = {
  pending_plan: Clock,
  plan_submitted: CheckCircle,
  changes_requested: RefreshCw,
  approved: CheckCircle,
  implementing: Zap,
  complete: Sparkles,
  verified: CheckCircle,
  closed: Lock,
};

const statusColors: Record<string, string> = {
  pending_plan: 'text-ind-text-muted',
  plan_submitted: 'text-ind-text',
  changes_requested: 'text-ind-warning',
  approved: 'text-ind-accent',
  implementing: 'text-ind-accent',
  complete: 'text-ind-success',
  verified: 'text-ind-success',
  closed: 'text-ind-text-muted',
};

export function WorkorderCard({ workorder, onClick }: WorkorderCardProps) {
  const StatusIcon = statusIcons[workorder.status];
  const statusColor = statusColors[workorder.status] || 'text-ind-text';

  const lastUpdated = new Date(workorder.updated || workorder.created);
  const formattedDate = lastUpdated.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: lastUpdated.getFullYear() !== new Date().getFullYear() ? '2-digit' : undefined,
  });

  return (
    <div
      onClick={onClick}
      className={`
        p-3 sm:p-4 rounded-lg
        bg-ind-panel border border-ind-border
        transition-all duration-200
        ${onClick ? 'cursor-pointer hover:bg-ind-bg hover:border-ind-accent/50' : ''}
      `}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {StatusIcon && <StatusIcon className={`w-4 sm:w-5 h-4 sm:h-5 ${statusColor}`} />}
            <h3 className="text-xs sm:text-sm font-semibold text-ind-text truncate">
              {workorder.feature_name}
            </h3>
          </div>
          <p className="text-xs text-ind-text-muted truncate">
            {workorder.project_name}
          </p>
        </div>
        <span className="text-xs font-mono text-ind-text-muted shrink-0">
          {workorder.id}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 sm:pt-2 border-t border-ind-border/50 min-w-0">
        <span className="text-xs text-ind-text-muted capitalize shrink-0 whitespace-nowrap">
          {workorder.status.replace(/_/g, ' ')}
        </span>
        <span className="text-xs text-ind-text-muted shrink-0">
          {formattedDate}
        </span>
      </div>
    </div>
  );
}

export default WorkorderCard;

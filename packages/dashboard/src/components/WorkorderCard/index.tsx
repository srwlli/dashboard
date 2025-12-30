'use client';

import { Clock, CheckCircle, RefreshCw, Zap, Sparkles, Lock } from 'lucide-react';
import { WorkorderObject } from '@/types/workorders';
import { UnifiedCard } from '@/components/UnifiedCard';

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

/**
 * WorkorderCard - Wrapper around UnifiedCard for workorder-specific data
 *
 * Maintains the same external API while using UnifiedCard internally.
 */
export function WorkorderCard({ workorder, onClick }: WorkorderCardProps) {
  const StatusIcon = statusIcons[workorder.status] || Clock;
  const statusColor = statusColors[workorder.status] || 'text-ind-text';

  const lastUpdated = new Date(workorder.updated || workorder.created);
  const formattedDate = lastUpdated.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: lastUpdated.getFullYear() !== new Date().getFullYear() ? '2-digit' : undefined,
  });

  return (
    <UnifiedCard
      icon={StatusIcon}
      iconColor={statusColor}
      title={workorder.feature_name}
      subtitle={workorder.project_name}
      headerRight={
        <span className="text-xs font-mono text-ind-text-muted">
          {workorder.id}
        </span>
      }
      footerLeft={
        <span className="text-xs text-ind-text-muted capitalize whitespace-nowrap">
          {workorder.status.replace(/_/g, ' ')}
        </span>
      }
      footerRight={
        <span className="text-xs text-ind-text-muted">
          {formattedDate}
        </span>
      }
      onClick={onClick}
    />
  );
}

export default WorkorderCard;

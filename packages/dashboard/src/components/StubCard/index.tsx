'use client';

import { Sparkles, Bug, TrendingUp, Lightbulb, Wrench, Beaker } from 'lucide-react';
import { StubObject } from '@/types/stubs';
import { UnifiedCard } from '@/components/UnifiedCard';

interface StubCardProps {
  stub: StubObject;
  onClick?: () => void;
}

const categoryIcons: Record<string, any> = {
  feature: Sparkles,
  fix: Bug,
  improvement: TrendingUp,
  idea: Lightbulb,
  refactor: Wrench,
  test: Beaker,
};

const priorityColors: Record<string, string> = {
  low: 'text-ind-text-muted',
  medium: 'text-ind-text',
  high: 'text-ind-warning',
  critical: 'text-ind-error',
};

const statusBgColors: Record<string, string> = {
  stub: 'bg-ind-bg/30 text-ind-text-muted',
  planned: 'bg-ind-accent/10 text-ind-accent',
  in_progress: 'bg-ind-accent/20 text-ind-accent',
  completed: 'bg-ind-success/10 text-ind-success',
};

/**
 * StubCard - Wrapper around UnifiedCard for stub-specific data
 *
 * Maintains the same external API while using UnifiedCard internally.
 */
export function StubCard({ stub, onClick }: StubCardProps) {
  const CategoryIcon = categoryIcons[stub.category || ''] || categoryIcons.feature;
  const priorityColor = priorityColors[stub.priority || ''] || 'text-ind-text';
  const statusBg = statusBgColors[stub.status || 'stub'] || 'bg-ind-bg text-ind-text';

  const createdDate = stub.created ? new Date(stub.created) : new Date();
  const formattedDate = createdDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: createdDate.getFullYear() !== new Date().getFullYear() ? '2-digit' : undefined,
  });

  return (
    <UnifiedCard
      icon={CategoryIcon}
      iconColor="text-ind-accent"
      title={stub.title || stub.feature_name || 'Untitled'}
      subtitle={stub.target_project}
      description={stub.description}
      headerRight={
        stub.priority ? (
          <span className={`text-xs sm:text-sm font-semibold whitespace-nowrap ${priorityColor}`}>
            {stub.priority.charAt(0).toUpperCase() + stub.priority.slice(1)}
          </span>
        ) : undefined
      }
      footerLeft={
        <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${statusBg}`}>
          {stub.status ? stub.status.replace(/_/g, ' ') : 'stub'}
        </span>
      }
      footerRight={
        <span className="text-xs text-ind-text-muted whitespace-nowrap">
          {formattedDate}
        </span>
      }
      onClick={onClick}
    />
  );
}

export default StubCard;

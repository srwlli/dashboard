'use client';

import { Sparkles, Bug, TrendingUp, Lightbulb, Wrench, Beaker } from 'lucide-react';
import { StubObject } from '@/types/stubs';

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

export function StubCard({ stub, onClick }: StubCardProps) {
  const CategoryIcon = categoryIcons[stub.category || ''];
  const priorityColor = priorityColors[stub.priority || ''] || 'text-ind-text';
  const statusBg = statusBgColors[stub.status || 'stub'] || 'bg-ind-bg text-ind-text';

  const createdDate = stub.created ? new Date(stub.created) : new Date();
  const formattedDate = createdDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: createdDate.getFullYear() !== new Date().getFullYear() ? '2-digit' : undefined,
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
          <div className="flex items-center gap-2 mb-2">
            {CategoryIcon && <CategoryIcon className="w-4 h-4 text-ind-accent" />}
            <h3 className="text-xs sm:text-sm font-semibold text-ind-text truncate">
              {stub.title || stub.feature_name || 'Untitled'}
            </h3>
          </div>
          {stub.description && (
            <p className="text-xs text-ind-text-muted line-clamp-2">
              {stub.description}
            </p>
          )}
        </div>
        {stub.priority && (
          <span className={`text-xs sm:text-sm font-semibold shrink-0 ${priorityColor}`}>
            {stub.priority.charAt(0).toUpperCase() + stub.priority.slice(1)}
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-ind-border/50 min-w-0">
        <span className={`text-xs px-2 py-1 rounded shrink-0 ${statusBg} whitespace-nowrap`}>
          {stub.status ? stub.status.replace(/_/g, ' ') : 'stub'}
        </span>
        <span className="text-xs text-ind-text-muted shrink-0">
          {formattedDate}
        </span>
      </div>
    </div>
  );
}

export default StubCard;

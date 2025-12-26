'use client';

import { StubObject } from '@/types/stubs';

interface StubCardProps {
  stub: StubObject;
  onClick?: () => void;
}

const categoryIcons: Record<string, string> = {
  feature: '✨',
  fix: '🐛',
  improvement: '⬆️',
  idea: '💡',
  refactor: '🔧',
  test: '🧪',
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
  const categoryIcon = categoryIcons[stub.category] || '•';
  const priorityColor = priorityColors[stub.priority] || 'text-ind-text';
  const statusBg = statusBgColors[stub.status] || 'bg-ind-bg text-ind-text';

  const createdDate = new Date(stub.created);
  const formattedDate = createdDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: createdDate.getFullYear() !== new Date().getFullYear() ? '2-digit' : undefined,
  });

  return (
    <div
      onClick={onClick}
      className={`
        p-4 rounded-lg
        bg-ind-panel border border-ind-border
        transition-all duration-200
        ${onClick ? 'cursor-pointer hover:bg-ind-bg hover:border-ind-accent/50' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{categoryIcon}</span>
            <h3 className="text-sm font-semibold text-ind-text truncate">
              {stub.title}
            </h3>
          </div>
          {stub.description && (
            <p className="text-xs text-ind-text-muted line-clamp-2">
              {stub.description}
            </p>
          )}
        </div>
        <span className={`text-sm font-semibold shrink-0 ${priorityColor}`}>
          {stub.priority.charAt(0).toUpperCase() + stub.priority.slice(1)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-ind-border/50">
        <span className={`text-xs px-2 py-1 rounded ${statusBg}`}>
          {stub.status.replace(/_/g, ' ')}
        </span>
        <span className="text-xs text-ind-text-muted">
          {formattedDate}
        </span>
      </div>
    </div>
  );
}

export default StubCard;

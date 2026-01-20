'use client';

import { WorkorderObject } from '@/types/workorders';
import WorkorderCard from '@/components/WorkorderCard';
import { FilterConfig } from '@/components/FilterBar';

interface WorkorderListProps {
  workorders: WorkorderObject[];
  filters?: FilterConfig;
  isLoading?: boolean;
  error?: string | null;
  onWorkorderClick?: (workorderId: string) => void;
}

export function WorkorderList({
  workorders,
  filters = {},
  isLoading = false,
  error = null,
  onWorkorderClick,
}: WorkorderListProps) {
  const filteredWorkorders = workorders.filter((workorder) => {
    // Filter by search query
    if (filters.search) {
      const query = filters.search.toLowerCase();
      const matchesSearch =
        workorder.feature_name.toLowerCase().includes(query) ||
        workorder.project_name.toLowerCase().includes(query) ||
        workorder.id.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Filter by status
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(workorder.status)) return false;
    }

    // Filter by project
    if (filters.project && filters.project.length > 0) {
      if (!filters.project.includes(workorder.project_name)) return false;
    }

    return true;
  });

  if (error) {
    return (
      <div className="p-6 rounded-lg bg-ind-panel border border-ind-border text-center">
        <p className="text-sm text-ind-text-muted">
          Failed to load workorders: {error}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-lg bg-ind-panel border border-ind-border animate-pulse"
          >
            <div className="h-5 bg-ind-bg rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-ind-bg rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredWorkorders.length === 0) {
    return (
      <div className="p-6 rounded-lg bg-ind-panel border border-ind-border text-center">
        <p className="text-sm text-ind-text-muted">
          {workorders.length === 0 ? 'No workorders found' : 'No workorders match your filters'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredWorkorders.map((workorder, idx) => (
        <WorkorderCard
          key={`${workorder.id}-${workorder.path}-${idx}`}
          workorder={workorder}
          onClick={() => onWorkorderClick?.(workorder.id)}
        />
      ))}
      {filteredWorkorders.length > 0 && (
        <p className="text-xs text-ind-text-muted text-center pt-2">
          Showing {filteredWorkorders.length} of {workorders.length} workorders
        </p>
      )}
    </div>
  );
}

export default WorkorderList;

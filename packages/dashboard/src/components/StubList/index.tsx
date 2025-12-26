'use client';

import { StubObject } from '@/types/stubs';
import StubCard from '@/components/StubCard';
import { FilterConfig } from '@/components/FilterBar';

interface StubListProps {
  stubs: StubObject[];
  filters?: FilterConfig;
  isLoading?: boolean;
  error?: string | null;
  onStubClick?: (featureName: string) => void;
}

export function StubList({
  stubs,
  filters = {},
  isLoading = false,
  error = null,
  onStubClick,
}: StubListProps) {
  const filteredStubs = stubs.filter((stub) => {
    // Filter by search query
    if (filters.search) {
      const query = filters.search.toLowerCase();
      const matchesSearch =
        stub.title.toLowerCase().includes(query) ||
        (stub.description && stub.description.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }

    // Filter by status
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(stub.status)) return false;
    }

    // Filter by priority
    if (filters.priority && filters.priority.length > 0) {
      if (!filters.priority.includes(stub.priority)) return false;
    }

    // Filter by category
    if (filters.category && filters.category.length > 0) {
      if (!filters.category.includes(stub.category)) return false;
    }

    return true;
  });

  if (error) {
    return (
      <div className="p-6 rounded-lg bg-ind-panel border border-ind-border text-center">
        <p className="text-sm text-ind-text-muted">
          Failed to load stubs: {error}
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

  if (filteredStubs.length === 0) {
    return (
      <div className="p-6 rounded-lg bg-ind-panel border border-ind-border text-center">
        <p className="text-sm text-ind-text-muted">
          {stubs.length === 0 ? 'No stubs found' : 'No stubs match your filters'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredStubs.map((stub, idx) => (
        <StubCard
          key={stub.id || stub.feature_name || idx}
          stub={stub}
          onClick={() => onStubClick?.(stub.feature_name)}
        />
      ))}
      {filteredStubs.length > 0 && (
        <p className="text-xs text-ind-text-muted text-center pt-2">
          Showing {filteredStubs.length} of {stubs.length} stubs
        </p>
      )}
    </div>
  );
}

export default StubList;

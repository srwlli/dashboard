'use client';

import React, { useState, useMemo } from 'react';
import { Search, Sparkles, Bug, TrendingUp, Wrench, Loader2 } from 'lucide-react';
import useSWR from 'swr';
import type { Stub } from './types';
import type { StubListResponse, StubObject } from '@/types/stubs';

/**
 * SWR fetcher for API calls
 */
const fetcher = (url: string) => fetch(url).then(res => res.json());

/**
 * Map API StubObject to component Stub type
 */
function mapStubObjectToStub(stubObject: StubObject): Stub | null {
  // Filter out categories not supported by SessionCreation
  if (stubObject.category === 'idea' || stubObject.category === 'test') {
    return null;
  }

  return {
    id: stubObject.id,
    feature_name: stubObject.feature_name,
    description: stubObject.description,
    target_project: stubObject.target_project || 'unknown',
    category: stubObject.category as 'feature' | 'fix' | 'improvement' | 'refactor',
    priority: stubObject.priority,
    created_at: stubObject.created
  };
}

interface StubSelectorProps {
  onSelectStub: (stub: Stub) => void;
  selectedStub: Stub | null;
}

const categoryIcons: Record<string, typeof Sparkles> = {
  feature: Sparkles,
  fix: Bug,
  improvement: TrendingUp,
  refactor: Wrench
};

// Default icon for unknown categories
const DefaultIcon = Sparkles;

const priorityColors: Record<string, string> = {
  low: 'text-ind-text-muted',
  medium: 'text-ind-text',
  high: 'text-ind-warning',
  critical: 'text-ind-error'
};

// Default priority color for unknown priorities
const defaultPriorityColor = 'text-ind-text';

export const StubSelector: React.FC<StubSelectorProps> = ({ onSelectStub, selectedStub }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch stubs from API
  const { data, error, isLoading } = useSWR<StubListResponse>('/api/stubs', fetcher);

  // Map API response to component type
  const allStubs = useMemo(() => {
    if (!data?.data?.stubs) return [];
    return data.data.stubs
      .map(mapStubObjectToStub)
      .filter((stub): stub is Stub => stub !== null);
  }, [data]);

  // Filter stubs based on search query
  const filteredStubs = useMemo(() => {
    if (!searchQuery.trim()) return allStubs;

    const query = searchQuery.toLowerCase();
    return allStubs.filter(stub =>
      stub.id.toLowerCase().includes(query) ||
      stub.feature_name.toLowerCase().includes(query) ||
      stub.description.toLowerCase().includes(query) ||
      stub.target_project.toLowerCase().includes(query)
    );
  }, [searchQuery, allStubs]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm uppercase tracking-widest text-ind-text-muted font-mono font-bold mb-2">
          Select Stub
        </h3>
        <p className="text-xs text-ind-text-muted mb-4">
          Choose a feature specification to start building your session
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ind-text-muted" />
        <input
          type="text"
          placeholder="Search stubs by ID, name, or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-ind-panel border border-ind-border rounded text-sm text-ind-text placeholder:text-ind-text-muted focus:outline-none focus:border-ind-accent transition-colors"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12 text-ind-text-muted">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span className="text-sm">Loading stubs...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-ind-error/10 border border-ind-error/30 rounded-md p-4 text-sm text-ind-error">
          <p className="font-semibold mb-1">Failed to load stubs</p>
          <p className="text-xs">{error.message || 'Unable to fetch stubs from API'}</p>
        </div>
      )}

      {/* Stub List */}
      {!isLoading && !error && (
        <div className="space-y-3">
          {filteredStubs.length === 0 ? (
            <div className="text-center py-8 text-ind-text-muted text-sm">
              {allStubs.length === 0 ? (
                <>No stubs available. Create stubs to get started.</>
              ) : (
                <>No stubs found matching &quot;{searchQuery}&quot;</>
              )}
            </div>
          ) : (
          filteredStubs.map((stub) => {
            const Icon = categoryIcons[stub.category] || DefaultIcon;
            const isSelected = selectedStub?.id === stub.id;

            return (
              <button
                key={stub.id}
                onClick={() => onSelectStub(stub)}
                className={`w-full text-left p-4 rounded border-2 transition-all ${
                  isSelected
                    ? 'border-ind-accent bg-ind-accent/5'
                    : 'border-ind-border bg-ind-panel hover:border-ind-accent/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`flex-shrink-0 mt-1 ${priorityColors[stub.priority] || defaultPriorityColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-ind-accent">
                        {stub.id}
                      </span>
                      <span className={`text-xs font-bold uppercase ${priorityColors[stub.priority] || defaultPriorityColor}`}>
                        {stub.priority}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-ind-text mb-1">
                      {stub.feature_name}
                    </h4>
                    <p className="text-xs text-ind-text-muted line-clamp-2 mb-2">
                      {stub.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-ind-text-muted">
                      <span className="font-mono">{stub.target_project}</span>
                      <span>•</span>
                      <span className="capitalize">{stub.category}</span>
                    </div>
                  </div>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-ind-accent flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })
        )}
        </div>
      )}

      {/* Stats Footer */}
      {!isLoading && !error && (
        <div className="pt-3 border-t border-ind-border">
          <p className="text-xs text-ind-text-muted">
            Showing {filteredStubs.length} of {allStubs.length} stubs
          </p>
        </div>
      )}
    </div>
  );
};

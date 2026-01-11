'use client';

import React, { useState, useMemo } from 'react';
import { Search, Sparkles, Bug, TrendingUp, Wrench } from 'lucide-react';
import type { Stub } from './types';

// Hardcoded stubs as per Phase 1 design spec
const HARDCODED_STUBS: Stub[] = [
  {
    id: 'STUB-082',
    feature_name: 'Multi-Agent Session Coordinator',
    description: 'Build automated coordination system for parallel agent execution with dependency tracking, output aggregation, and conflict resolution',
    target_project: 'coderef-dashboard',
    category: 'feature',
    priority: 'high',
    created_at: '2026-01-10'
  },
  {
    id: 'STUB-054',
    feature_name: 'Component Inventory Generator',
    description: 'Scan codebase to generate comprehensive component inventory with props, dependencies, and usage analysis',
    target_project: 'coderef-dashboard',
    category: 'feature',
    priority: 'medium',
    created_at: '2026-01-08'
  },
  {
    id: 'STUB-055',
    feature_name: 'Context Backbone Optimizer',
    description: 'Optimize context backbone generation for files larger than 20,000 lines with progressive streaming and relevance filtering',
    target_project: 'coderef-workflow',
    category: 'improvement',
    priority: 'high',
    created_at: '2026-01-09'
  },
  {
    id: 'STUB-056',
    feature_name: 'Session Monitoring Dashboard',
    description: 'Real-time visualization of active multi-agent sessions with agent status, output preview, and progress tracking',
    target_project: 'coderef-dashboard',
    category: 'feature',
    priority: 'critical',
    created_at: '2026-01-10'
  },
  {
    id: 'STUB-057',
    feature_name: 'Dependency Graph Validator',
    description: 'Detect circular dependencies in agent coordination and suggest optimal execution order based on dependency graph',
    target_project: 'coderef-workflow',
    category: 'refactor',
    priority: 'medium',
    created_at: '2026-01-07'
  }
];

interface StubSelectorProps {
  onSelectStub: (stub: Stub) => void;
  selectedStub: Stub | null;
}

const categoryIcons = {
  feature: Sparkles,
  fix: Bug,
  improvement: TrendingUp,
  refactor: Wrench
};

const priorityColors = {
  low: 'text-ind-text-muted',
  medium: 'text-ind-text',
  high: 'text-ind-warning',
  critical: 'text-ind-error'
};

export const StubSelector: React.FC<StubSelectorProps> = ({ onSelectStub, selectedStub }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter stubs based on search query
  const filteredStubs = useMemo(() => {
    if (!searchQuery.trim()) return HARDCODED_STUBS;

    const query = searchQuery.toLowerCase();
    return HARDCODED_STUBS.filter(stub =>
      stub.id.toLowerCase().includes(query) ||
      stub.feature_name.toLowerCase().includes(query) ||
      stub.description.toLowerCase().includes(query) ||
      stub.target_project.toLowerCase().includes(query)
    );
  }, [searchQuery]);

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

      {/* Stub List */}
      <div className="space-y-3">
        {filteredStubs.length === 0 ? (
          <div className="text-center py-8 text-ind-text-muted text-sm">
            No stubs found matching &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredStubs.map((stub) => {
            const Icon = categoryIcons[stub.category];
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
                  <div className={`flex-shrink-0 mt-1 ${priorityColors[stub.priority]}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-ind-accent">
                        {stub.id}
                      </span>
                      <span className={`text-xs font-bold uppercase ${priorityColors[stub.priority]}`}>
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

      {/* Stats Footer */}
      <div className="pt-3 border-t border-ind-border">
        <p className="text-xs text-ind-text-muted">
          Showing {filteredStubs.length} of {HARDCODED_STUBS.length} stubs
        </p>
      </div>
    </div>
  );
};

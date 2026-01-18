'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, RefreshCw, ExternalLink } from 'lucide-react';
import type { Resource } from '@/app/api/resources/route';

interface DynamicResourcesTableProps {
  refreshInterval?: number; // milliseconds, default 30000 (30s)
}

export default function DynamicResourcesTable({ refreshInterval = 30000 }: DynamicResourcesTableProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedServer, setSelectedServer] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Fetch resources from API
  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/resources');
      const result = await response.json();

      if (result.success) {
        setResources(result.data);
        setLastUpdated(result.timestamp);
      } else {
        setError(result.error || 'Failed to fetch resources');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and polling
  useEffect(() => {
    fetchResources();
    const interval = setInterval(fetchResources, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Extract unique values for filters - always from full dataset
  const types = useMemo(() => {
    return Array.from(new Set(resources.map(r => r.Type))).sort();
  }, [resources]);

  // Dynamically filtered dropdown options based on current Type filter
  const { servers, categories, statuses, typeFilteredResources } = useMemo(() => {
    // Filter resources by selected Type to get context-aware dropdown options
    const typeFilteredResources = selectedType === 'all'
      ? resources
      : resources.filter(r => r.Type === selectedType);

    const servers = Array.from(new Set(typeFilteredResources.map(r => r.Server))).sort();
    const categories = Array.from(new Set(typeFilteredResources.map(r => r.Category))).sort();
    const statuses = Array.from(new Set(typeFilteredResources.map(r => r.Status))).sort();

    return { servers, categories, statuses, typeFilteredResources };
  }, [resources, selectedType]);

  // Auto-reset dependent filters when they become invalid
  useEffect(() => {
    // Reset Server if current selection is not in available servers
    if (selectedServer !== 'all' && !servers.includes(selectedServer)) {
      setSelectedServer('all');
    }
    // Reset Category if current selection is not in available categories
    if (selectedCategory !== 'all' && !categories.includes(selectedCategory)) {
      setSelectedCategory('all');
    }
    // Reset Status if current selection is not in available statuses
    if (selectedStatus !== 'all' && !statuses.includes(selectedStatus)) {
      setSelectedStatus('all');
    }
  }, [servers, categories, statuses, selectedServer, selectedCategory, selectedStatus]);

  // Filter resources
  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        resource.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.Description.toLowerCase().includes(searchQuery.toLowerCase());

      // Type filter
      const matchesType = selectedType === 'all' || resource.Type === selectedType;

      // Server filter
      const matchesServer = selectedServer === 'all' || resource.Server === selectedServer;

      // Category filter
      const matchesCategory = selectedCategory === 'all' || resource.Category === selectedCategory;

      // Status filter
      const matchesStatus = selectedStatus === 'all' || resource.Status === selectedStatus;

      return matchesSearch && matchesType && matchesServer && matchesCategory && matchesStatus;
    });
  }, [resources, searchQuery, selectedType, selectedServer, selectedCategory, selectedStatus]);

  // Group resources by type
  const groupedResources = useMemo(() => {
    const groups: Record<string, Resource[]> = {};
    filteredResources.forEach(resource => {
      if (!groups[resource.Type]) {
        groups[resource.Type] = [];
      }
      groups[resource.Type].push(resource);
    });
    return groups;
  }, [filteredResources]);

  if (loading && resources.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 text-ind-accent animate-spin" />
        <span className="ml-2 text-ind-text-muted">Loading resources...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
        <p className="text-sm text-red-400">Error: {error}</p>
        <button
          onClick={fetchResources}
          className="mt-2 px-3 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="p-4 bg-ind-bg border border-ind-border rounded-lg">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <p className="text-sm text-ind-text-muted">
              <strong className="text-ind-text">{filteredResources.length}</strong> of{' '}
              <strong className="text-ind-text">{resources.length}</strong> resources
            </p>
            {lastUpdated && (
              <p className="text-xs text-ind-text-muted">
                Updated: {new Date(lastUpdated).toLocaleTimeString()}
              </p>
            )}
          </div>
          <button
            onClick={fetchResources}
            className="p-2 hover:bg-ind-panel rounded transition-colors"
            title="Refresh resources"
          >
            <RefreshCw className={`w-4 h-4 text-ind-text-muted ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ind-text-muted" />
          <input
            type="text"
            placeholder="Search resources by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-ind-panel border border-ind-border rounded-lg text-sm text-ind-text placeholder-ind-text-muted focus:outline-none focus:border-ind-accent"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Type Filter */}
          <div>
            <label className="block text-xs text-ind-text-muted mb-1">Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-ind-panel border border-ind-border rounded-lg text-sm text-ind-text focus:outline-none focus:border-ind-accent"
            >
              <option value="all">All Types ({types.length})</option>
              {types.map(type => (
                <option key={type} value={type}>
                  {type} ({resources.filter(r => r.Type === type).length})
                </option>
              ))}
            </select>
          </div>

          {/* Server Filter */}
          <div>
            <label className="block text-xs text-ind-text-muted mb-1">Server</label>
            <select
              value={selectedServer}
              onChange={(e) => setSelectedServer(e.target.value)}
              className="w-full px-3 py-2 bg-ind-panel border border-ind-border rounded-lg text-sm text-ind-text focus:outline-none focus:border-ind-accent"
            >
              <option value="all">All Servers ({servers.length})</option>
              {servers.map(server => (
                <option key={server} value={server}>
                  {server} ({typeFilteredResources.filter(r => r.Server === server).length})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs text-ind-text-muted mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-ind-panel border border-ind-border rounded-lg text-sm text-ind-text focus:outline-none focus:border-ind-accent"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category} ({typeFilteredResources.filter(r => r.Category === category).length})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs text-ind-text-muted mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-ind-panel border border-ind-border rounded-lg text-sm text-ind-text focus:outline-none focus:border-ind-accent"
            >
              <option value="all">All Status ({statuses.length})</option>
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status} ({typeFilteredResources.filter(r => r.Status === status).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Indicator */}
        {(searchQuery || selectedType !== 'all' || selectedServer !== 'all' || selectedCategory !== 'all' || selectedStatus !== 'all') && (
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-ind-accent" />
            <span className="text-xs text-ind-text-muted">Active filters:</span>
            {searchQuery && (
              <span className="px-2 py-1 text-xs bg-ind-accent/10 text-ind-accent rounded">
                Search: "{searchQuery}"
              </span>
            )}
            {selectedType !== 'all' && (
              <span className="px-2 py-1 text-xs bg-ind-accent/10 text-ind-accent rounded">
                Type: {selectedType}
              </span>
            )}
            {selectedServer !== 'all' && (
              <span className="px-2 py-1 text-xs bg-ind-accent/10 text-ind-accent rounded">
                Server: {selectedServer}
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="px-2 py-1 text-xs bg-ind-accent/10 text-ind-accent rounded">
                Category: {selectedCategory}
              </span>
            )}
            {selectedStatus !== 'all' && (
              <span className="px-2 py-1 text-xs bg-ind-accent/10 text-ind-accent rounded">
                Status: {selectedStatus}
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setSelectedServer('all');
                setSelectedCategory('all');
                setSelectedStatus('all');
              }}
              className="text-xs text-ind-accent hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Resources Table - Grouped by Type */}
      {filteredResources.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-ind-text-muted">No resources match your filters.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedType('all');
              setSelectedServer('all');
              setSelectedCategory('all');
              setSelectedStatus('all');
            }}
            className="mt-2 text-sm text-ind-accent hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedResources).sort().map(([type, typeResources]) => (
            <div key={type} className="space-y-3">
              <h3 className="text-lg font-semibold text-ind-text">
                {type} <span className="text-sm text-ind-text-muted">({typeResources.length})</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-ind-border">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-ind-text-muted">Name</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-ind-text-muted">Description</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-ind-text-muted">Server</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-ind-text-muted">Category</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-ind-text-muted">Status</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-ind-text-muted">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {typeResources.map((resource, idx) => (
                      <tr
                        key={`${resource.Type}-${resource.Name}-${idx}`}
                        className="border-b border-ind-border/50 hover:bg-ind-panel/50 transition-colors"
                      >
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono text-ind-text">{resource.Name}</span>
                            {resource.Path && (
                              <a
                                href={`file:///${resource.Path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-ind-text-muted hover:text-ind-accent"
                                title={resource.Path}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-3 text-sm text-ind-text-muted">{resource.Description}</td>
                        <td className="py-2 px-3">
                          <span className="text-xs px-2 py-1 bg-ind-bg rounded text-ind-text">
                            {resource.Server}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className="text-xs px-2 py-1 bg-ind-accent/10 rounded text-ind-accent">
                            {resource.Category}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`text-xs px-2 py-1 rounded ${
                            resource.Status === 'active' ? 'bg-green-500/10 text-green-400' :
                            resource.Status === 'deprecated' ? 'bg-red-500/10 text-red-400' :
                            'bg-yellow-500/10 text-yellow-400'
                          }`}>
                            {resource.Status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-xs text-ind-text-muted">
                          {resource.LastUpdated ? new Date(resource.LastUpdated).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

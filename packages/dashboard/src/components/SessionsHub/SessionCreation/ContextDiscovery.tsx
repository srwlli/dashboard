'use client';

import React, { useState, useEffect } from 'react';
import { Search, FileText, Archive, BookOpen, CheckCircle2, Circle, Loader2, Component, Zap, Code, Wrench, TestTube2 } from 'lucide-react';

interface ContextFile {
  id: string;
  filename: string;
  path: string;
  type: 'foundation' | 'archived' | 'resource' | 'component' | 'hook' | 'api' | 'util' | 'test';
  size: number;
  relevanceScore: number;
  excerpt: string;
  scoringBreakdown?: {
    patternSimilarity: number;
    dependencies: number;
    complexity: number;
    coverage: number;
  };
}

interface ContextDiscoveryProps {
  stubDescription: string;
  onSelectionChange: (selectedFiles: ContextFile[]) => void;
}

export const ContextDiscovery: React.FC<ContextDiscoveryProps> = ({
  stubDescription,
  onSelectionChange
}) => {
  const [files, setFiles] = useState<ContextFile[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'foundation' | 'archived' | 'resource' | 'component' | 'hook' | 'api' | 'util' | 'test'>('all');

  // Fetch context files when stub description changes
  useEffect(() => {
    if (!stubDescription) {
      setFiles([]);
      setKeywords([]);
      return;
    }

    const fetchContextFiles = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          stubDescription,
          projectPath: process.cwd()
        });

        const response = await fetch(`/api/sessions/context-discovery?${params}`);

        if (!response.ok) {
          throw new Error('Failed to discover context files');
        }

        const data = await response.json();
        setFiles(data.files || []);
        setKeywords(data.keywords || []);

        // Auto-select files with score >= 90
        const autoSelectedSet = new Set(data.autoSelected || []);
        setSelectedIds(autoSelectedSet);

        // Notify parent of initial selection
        const autoSelectedFiles = (data.files || []).filter((f: ContextFile) =>
          autoSelectedSet.has(f.id)
        );
        onSelectionChange(autoSelectedFiles);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchContextFiles();
  }, [stubDescription, onSelectionChange]);

  // Toggle file selection
  const handleToggle = (file: ContextFile) => {
    const newSelectedIds = new Set(selectedIds);

    if (newSelectedIds.has(file.id)) {
      newSelectedIds.delete(file.id);
    } else {
      newSelectedIds.add(file.id);
    }

    setSelectedIds(newSelectedIds);

    // Notify parent of selection change
    const selectedFiles = files.filter(f => newSelectedIds.has(f.id));
    onSelectionChange(selectedFiles);
  };

  // Filter files by type
  const filteredFiles = files.filter(file =>
    filterType === 'all' || file.type === filterType
  );

  // Get icon for file type
  const getTypeIcon = (type: ContextFile['type']) => {
    switch (type) {
      case 'foundation':
        return FileText;
      case 'archived':
        return Archive;
      case 'resource':
        return BookOpen;
      case 'component':
        return Component;
      case 'hook':
        return Zap;
      case 'api':
        return Code;
      case 'util':
        return Wrench;
      case 'test':
        return TestTube2;
    }
  };

  // Get badge color for type
  const getTypeBadgeColor = (type: ContextFile['type']) => {
    switch (type) {
      case 'foundation':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'archived':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'resource':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'component':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'hook':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'api':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'util':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
      case 'test':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  // Get relevance score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-ind-text-muted';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-ind-text mb-1">
          Context Discovery
        </h3>
        <p className="text-sm text-ind-text-muted">
          Auto-discovered files based on stub description. Files with 90%+ relevance are pre-selected.
        </p>
      </div>

      {/* Keywords Display */}
      {keywords.length > 0 && (
        <div className="bg-ind-bg p-3 rounded border border-ind-border">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-4 h-4 text-ind-accent" />
            <span className="text-xs font-bold text-ind-text uppercase tracking-wider">
              Keywords Detected
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs font-mono bg-ind-panel border border-ind-border text-ind-text rounded"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Type Filter */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
            filterType === 'all'
              ? 'bg-ind-accent text-black'
              : 'bg-ind-panel text-ind-text-muted border border-ind-border hover:bg-ind-bg'
          }`}
        >
          All ({files.length})
        </button>
        <button
          onClick={() => setFilterType('foundation')}
          className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
            filterType === 'foundation'
              ? 'bg-ind-accent text-black'
              : 'bg-ind-panel text-ind-text-muted border border-ind-border hover:bg-ind-bg'
          }`}
        >
          Foundation ({files.filter(f => f.type === 'foundation').length})
        </button>
        <button
          onClick={() => setFilterType('archived')}
          className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
            filterType === 'archived'
              ? 'bg-ind-accent text-black'
              : 'bg-ind-panel text-ind-text-muted border border-ind-border hover:bg-ind-bg'
          }`}
        >
          Archived ({files.filter(f => f.type === 'archived').length})
        </button>
        <button
          onClick={() => setFilterType('resource')}
          className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
            filterType === 'resource'
              ? 'bg-ind-accent text-black'
              : 'bg-ind-panel text-ind-text-muted border border-ind-border hover:bg-ind-bg'
          }`}
        >
          Resources ({files.filter(f => f.type === 'resource').length})
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-ind-accent animate-spin" />
          <span className="ml-3 text-sm text-ind-text-muted">Discovering context files...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="border-2 border-ind-error rounded-lg p-4 bg-ind-error/5">
          <p className="text-sm text-ind-error font-bold">Error: {error}</p>
        </div>
      )}

      {/* Files List */}
      {!loading && !error && filteredFiles.length === 0 && (
        <div className="text-center py-12 text-ind-text-muted">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No context files found</p>
        </div>
      )}

      {!loading && !error && filteredFiles.length > 0 && (
        <div className="space-y-2">
          {filteredFiles.map(file => {
            const TypeIcon = getTypeIcon(file.type);
            const isSelected = selectedIds.has(file.id);

            return (
              <button
                key={file.id}
                onClick={() => handleToggle(file)}
                className={`w-full text-left p-4 rounded border transition-all ${
                  isSelected
                    ? 'border-ind-accent bg-ind-accent/5'
                    : 'border-ind-border bg-ind-panel hover:bg-ind-bg'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Selection Checkbox */}
                  <div className="flex-shrink-0 mt-0.5">
                    {isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-ind-accent" />
                    ) : (
                      <Circle className="w-5 h-5 text-ind-text-muted" />
                    )}
                  </div>

                  {/* File Icon */}
                  <TypeIcon className="w-5 h-5 text-ind-accent flex-shrink-0 mt-0.5" />

                  {/* File Details */}
                  <div className="flex-1 min-w-0">
                    {/* Filename + Type Badge */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold text-ind-text truncate">
                        {file.filename}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs font-bold uppercase tracking-wider border rounded ${getTypeBadgeColor(
                          file.type
                        )}`}
                      >
                        {file.type}
                      </span>
                    </div>

                    {/* Excerpt */}
                    <p className="text-xs text-ind-text-muted line-clamp-2 mb-2">
                      {file.excerpt}
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-ind-text-muted">
                        Size: {(file.size / 1024).toFixed(1)} KB
                      </span>
                      <span className={`font-bold ${getScoreColor(file.relevanceScore)}`}>
                        Relevance: {file.relevanceScore}%
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Selection Summary */}
      {selectedIds.size > 0 && (
        <div className="bg-ind-accent/10 border border-ind-accent/30 rounded-lg p-3">
          <p className="text-sm text-ind-text">
            <span className="font-bold text-ind-accent">{selectedIds.size}</span> file
            {selectedIds.size !== 1 ? 's' : ''} selected for context
          </p>
        </div>
      )}
    </div>
  );
};

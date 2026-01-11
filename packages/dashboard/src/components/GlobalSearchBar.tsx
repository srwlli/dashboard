'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useSearch } from '@/contexts/SearchContext';
import type { SearchResult } from '@coderef/core/search-client';

export default function GlobalSearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { search } = useSearch();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        document.getElementById('global-search-input')?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }

    const searchResults = search(value, {
      maxResults: 10,
      sortBy: 'relevance'
    });
    setResults(searchResults);
    setIsOpen(true);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const highlightMatch = (text: string, query: string) => {
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-ind-accent/30 text-ind-accent">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ind-text-secondary" />
        <input
          id="global-search-input"
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Search notes, docs, and resources... (⌘K)"
          className="w-full pl-10 pr-10 py-2.5 bg-ind-bg-secondary border border-ind-border rounded-lg
                     text-ind-text placeholder:text-ind-text-secondary
                     focus:outline-none focus:border-ind-accent transition-colors"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ind-text-secondary hover:text-ind-text"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-ind-bg-secondary border border-ind-border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          <div className="p-2">
            <div className="text-xs text-ind-text-secondary px-3 py-2">
              {results.length} result{results.length !== 1 ? 's' : ''} found
            </div>
            {results.map((result, idx) => (
              <div
                key={`${result.documentKey}-${idx}`}
                className="px-3 py-2.5 rounded-md hover:bg-ind-bg-tertiary transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-ind-text truncate">
                      {highlightMatch(result.documentName, query)}
                    </div>
                    {result.matches.length > 0 && (
                      <div className="text-sm text-ind-text-secondary mt-1 space-y-1">
                        {result.matches.slice(0, 2).map((match, i) => (
                          <div key={i}>
                            <span className="text-xs text-ind-accent">{match.field}:</span>{' '}
                            {match.excerpts[0] && highlightMatch(match.excerpts[0], query)}
                          </div>
                        ))}
                      </div>
                    )}
                    {result.tags && result.tags.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {result.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 bg-ind-bg-tertiary text-ind-text-secondary rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-ind-text-secondary whitespace-nowrap">
                    {result.score.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-ind-bg-secondary border border-ind-border rounded-lg shadow-lg p-6 text-center z-50">
          <p className="text-ind-text-secondary">No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
}

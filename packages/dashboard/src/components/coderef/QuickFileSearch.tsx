/**
 * QuickFileSearch Component
 *
 * @description Quick file search input with fuzzy matching for CodeRef Explorer sidebar.
 * Filters FileTree nodes in real-time as user types.
 *
 * @component
 * @example
 * ```tsx
 * <QuickFileSearch
 *   value={searchQuery}
 *   onChange={setSearchQuery}
 *   placeholder="Search files..."
 * />
 * ```
 *
 * @remarks
 * **Features**:
 * - Search input with clear button
 * - Fuzzy matching support (matches partial file/folder names)
 * - Keyboard shortcuts (Cmd/Ctrl+K to focus)
 * - Visual feedback (search icon, clear icon)
 *
 * **Design Tokens**:
 * - Uses `bg-ind-bg` for input background
 * - Uses `border-ind-border` for input border
 * - Uses `text-ind-text` for input text
 * - Uses `text-ind-text-muted` for placeholder and icons
 */
'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

export interface QuickFileSearchProps {
  /** Current search query value */
  value: string;
  /** Callback when search query changes */
  onChange: (value: string) => void;
  /** Placeholder text for input */
  placeholder?: string;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * QuickFileSearch - Search input for filtering file tree
 *
 * @param props - Component props
 * @returns Search input component
 */
export function QuickFileSearch({
  value,
  onChange,
  placeholder = 'Search files...',
  className = '',
}: QuickFileSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Cmd/Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search icon */}
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ind-text-muted pointer-events-none" />

      {/* Search input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 bg-ind-bg border border-ind-border rounded text-ind-text placeholder-ind-text-muted focus:outline-none focus:border-ind-accent transition-colors text-sm"
        aria-label="Search files"
      />

      {/* Clear button - only show when there's text */}
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ind-text-muted hover:text-ind-accent transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Keyboard shortcut hint */}
      {!value && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ind-text-muted pointer-events-none">
          <kbd className="px-1.5 py-0.5 bg-ind-panel border border-ind-border rounded text-xs">
            ⌘K
          </kbd>
        </div>
      )}
    </div>
  );
}

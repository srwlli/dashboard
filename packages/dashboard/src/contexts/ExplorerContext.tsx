'use client';

/**
 * ExplorerContext - Global CodeRef Explorer state management
 *
 * Provides centralized state for the CodeRef Explorer widget to persist
 * user preferences across navigation and page reloads.
 *
 * Manages:
 * - View mode (projects/coderef/favorites)
 * - Selected file path
 * - localStorage persistence
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ViewMode } from '@/components/coderef/ViewModeToggle';
import type { TreeNode } from '@/lib/coderef/types';

/**
 * Explorer context state shape
 */
interface ExplorerContextState {
  /** Current view mode (projects/coderef/favorites) */
  viewMode: ViewMode;

  /** Currently selected file node */
  selectedFile: TreeNode | null;

  /** Set the view mode */
  setViewMode: (mode: ViewMode) => void;

  /** Set the selected file */
  setSelectedFile: (file: TreeNode | null) => void;

  /** Clear selected file when switching contexts */
  clearSelection: () => void;
}

/**
 * Context definition
 */
const ExplorerContext = createContext<ExplorerContextState | null>(null);

/**
 * ExplorerProvider Props
 */
interface ExplorerProviderProps {
  children: React.ReactNode;
}

/**
 * ExplorerProvider Component
 *
 * Wraps the CodeRef Explorer widget to provide persistent state.
 * Automatically saves view mode to localStorage and restores on mount.
 *
 * @param props - Provider props
 * @returns Provider component
 */
export function ExplorerProvider({ children }: ExplorerProviderProps) {
  const [viewMode, setViewModeState] = useState<ViewMode>('projects');
  const [selectedFile, setSelectedFileState] = useState<TreeNode | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Restore view mode from localStorage on mount
  useEffect(() => {
    const savedViewMode = localStorage.getItem('coderef-explorer-view-mode');
    if (savedViewMode && (savedViewMode === 'projects' || savedViewMode === 'coderef' || savedViewMode === 'favorites')) {
      setViewModeState(savedViewMode as ViewMode);
    }
    setIsInitialized(true);
  }, []);

  // Save view mode to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('coderef-explorer-view-mode', viewMode);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.warn('[ExplorerContext] localStorage quota exceeded when saving view mode');
        } else {
          console.error('[ExplorerContext] Failed to save view mode:', error);
        }
      }
    }
  }, [viewMode, isInitialized]);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    // Clear selection when switching view modes
    setSelectedFileState(null);
  }, []);

  const setSelectedFile = useCallback((file: TreeNode | null) => {
    setSelectedFileState(file);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedFileState(null);
  }, []);

  const value: ExplorerContextState = {
    viewMode,
    selectedFile,
    setViewMode,
    setSelectedFile,
    clearSelection,
  };

  return (
    <ExplorerContext.Provider value={value}>
      {children}
    </ExplorerContext.Provider>
  );
}

/**
 * useExplorer Hook
 *
 * Access explorer context in any component.
 *
 * @returns Explorer context state
 * @throws Error if used outside ExplorerProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { viewMode, setViewMode, selectedFile } = useExplorer();
 *
 *   return (
 *     <div>
 *       Current mode: {viewMode}
 *       {selectedFile && <div>Selected: {selectedFile.path}</div>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useExplorer(): ExplorerContextState {
  const context = useContext(ExplorerContext);

  if (!context) {
    throw new Error('useExplorer must be used within an ExplorerProvider');
  }

  return context;
}

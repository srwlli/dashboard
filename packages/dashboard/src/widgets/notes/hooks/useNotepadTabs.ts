/**
 * useNotepadTabs Hook
 *
 * State management for multi-tab notepad interface
 * Handles tab lifecycle, content updates, and dirty state tracking
 */

import { useState, useCallback } from 'react';
import type { NotepadTab } from '../types/notepad';
import { FilePicker } from '../components/FilePicker';

/**
 * Generate unique tab ID
 */
function generateTabId(): string {
  return `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Hook return type
 */
interface UseNotepadTabsReturn {
  /** Array of open tabs */
  tabs: NotepadTab[];

  /** Currently active tab ID */
  activeTabId: string | null;

  /** Get active tab object */
  activeTab: NotepadTab | null;

  /** Create new tab */
  createTab: (filePath?: string, content?: string, extension?: string) => string;

  /** Switch to tab */
  switchTab: (tabId: string) => void;

  /** Update tab content */
  updateContent: (tabId: string, content: string) => void;

  /** Mark tab as saved */
  markAsSaved: (tabId: string, filePath: string) => void;

  /** Close tab */
  closeTab: (tabId: string) => void;

  /** Close all tabs */
  closeAllTabs: () => void;

  /** Get tab by ID */
  getTab: (tabId: string) => NotepadTab | undefined;

  /** Check if any tabs have unsaved changes */
  hasUnsavedChanges: () => boolean;
}

/**
 * useNotepadTabs hook
 */
export function useNotepadTabs(): UseNotepadTabsReturn {
  const [tabs, setTabs] = useState<NotepadTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  /**
   * Get active tab object
   */
  const activeTab = tabs.find(tab => tab.id === activeTabId) || null;

  /**
   * Create new tab
   */
  const createTab = useCallback((
    filePath?: string,
    content: string = '',
    extension: string = '.md'
  ): string => {
    const id = generateTabId();
    const title = filePath ? FilePicker.getTitle(filePath) : 'Untitled';

    const newTab: NotepadTab = {
      id,
      filePath: filePath || null,
      content,
      isDirty: false,
      lastSaved: null,
      fileExtension: extension,
      title,
    };

    setTabs(prev => [...prev, newTab]);
    setActiveTabId(id);

    return id;
  }, []);

  /**
   * Switch to tab
   */
  const switchTab = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  /**
   * Update tab content
   */
  const updateContent = useCallback((tabId: string, content: string) => {
    setTabs(prev => prev.map(tab => {
      if (tab.id === tabId) {
        return {
          ...tab,
          content,
          isDirty: tab.filePath !== null, // Only mark dirty if file exists
        };
      }
      return tab;
    }));
  }, []);

  /**
   * Mark tab as saved
   */
  const markAsSaved = useCallback((tabId: string, filePath: string) => {
    setTabs(prev => prev.map(tab => {
      if (tab.id === tabId) {
        const extension = FilePicker.getExtension(filePath);
        const title = FilePicker.getTitle(filePath);

        return {
          ...tab,
          filePath,
          fileExtension: extension,
          title,
          isDirty: false,
          lastSaved: new Date().toISOString(),
        };
      }
      return tab;
    }));
  }, []);

  /**
   * Close tab
   */
  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const filtered = prev.filter(tab => tab.id !== tabId);

      // If closing active tab, switch to another tab
      if (tabId === activeTabId) {
        const index = prev.findIndex(tab => tab.id === tabId);
        const nextTab = filtered[index] || filtered[index - 1] || filtered[0];
        setActiveTabId(nextTab?.id || null);
      }

      return filtered;
    });
  }, [activeTabId]);

  /**
   * Close all tabs
   */
  const closeAllTabs = useCallback(() => {
    setTabs([]);
    setActiveTabId(null);
  }, []);

  /**
   * Get tab by ID
   */
  const getTab = useCallback((tabId: string): NotepadTab | undefined => {
    return tabs.find(tab => tab.id === tabId);
  }, [tabs]);

  /**
   * Check if any tabs have unsaved changes
   */
  const hasUnsavedChanges = useCallback((): boolean => {
    return tabs.some(tab => tab.isDirty);
  }, [tabs]);

  return {
    tabs,
    activeTabId,
    activeTab,
    createTab,
    switchTab,
    updateContent,
    markAsSaved,
    closeTab,
    closeAllTabs,
    getTab,
    hasUnsavedChanges,
  };
}

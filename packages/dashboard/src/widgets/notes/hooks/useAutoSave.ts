'use client';

/**
 * useAutoSave Hook
 *
 * Auto-save with debouncing and localStorage fallback
 * Tracks save status and prevents duplicate saves
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { SaveStatus } from '../types';

/**
 * useAutoSave Hook Result
 */
export interface UseAutoSaveResult {
  /** Current save status */
  saveStatus: SaveStatus;

  /** Manually trigger save (bypasses debounce) */
  triggerSave: () => void;

  /** Reset save status to idle */
  resetStatus: () => void;
}

/**
 * useAutoSave Hook Props
 */
export interface UseAutoSaveProps {
  /** Content to save */
  content: string;

  /** Note name (for localStorage backup key) */
  noteName: string | null;

  /** Save function (called after debounce) */
  onSave: (content: string) => Promise<void>;

  /** Debounce delay in ms (default: 500) */
  delay?: number;

  /** Enable auto-save (default: true) */
  enabled?: boolean;
}

/**
 * useAutoSave Hook
 *
 * Provides auto-save with debouncing, status tracking, and localStorage fallback
 *
 * @example
 * ```tsx
 * const { saveStatus, triggerSave } = useAutoSave({
 *   content: editorContent,
 *   noteName: currentNote?.name,
 *   onSave: async (content) => {
 *     await CodeRefApi.notes.save(projectRoot, noteName, content);
 *   },
 * });
 * ```
 */
export function useAutoSave({
  content,
  noteName,
  onSave,
  delay = 500,
  enabled = true,
}: UseAutoSaveProps): UseAutoSaveResult {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(SaveStatus.Idle);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef<string>('');
  const isSavingRef = useRef(false);

  /**
   * Perform save operation
   */
  const performSave = useCallback(async () => {
    if (!noteName || !enabled) return;
    if (isSavingRef.current) return; // Prevent concurrent saves
    if (content === lastSavedContentRef.current) return; // No changes

    try {
      isSavingRef.current = true;
      setSaveStatus(SaveStatus.Saving);

      await onSave(content);

      lastSavedContentRef.current = content;
      setSaveStatus(SaveStatus.Saved);

      // Clear localStorage backup on successful save
      try {
        localStorage.removeItem(`coderef-notes-backup-${noteName}`);
      } catch (err) {
        // Ignore localStorage errors
      }

      // Auto-reset to idle after 2 seconds
      setTimeout(() => {
        setSaveStatus(SaveStatus.Idle);
      }, 2000);
    } catch (error) {
      console.error('Save failed:', error);
      setSaveStatus(SaveStatus.Error);

      // Fallback to localStorage
      try {
        localStorage.setItem(`coderef-notes-backup-${noteName}`, content);
        console.warn('Saved to localStorage backup');
      } catch (err) {
        console.error('localStorage backup also failed:', err);
      }
    } finally {
      isSavingRef.current = false;
    }
  }, [content, noteName, onSave, enabled]);

  /**
   * Trigger save manually (bypass debounce)
   */
  const triggerSave = useCallback(() => {
    // Cancel pending debounced save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    performSave();
  }, [performSave]);

  /**
   * Reset save status to idle
   */
  const resetStatus = useCallback(() => {
    setSaveStatus(SaveStatus.Idle);
  }, []);

  /**
   * Debounced auto-save on content change
   */
  useEffect(() => {
    if (!enabled || !noteName) return;
    if (content === lastSavedContentRef.current) return; // No changes

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new debounced save
    timeoutRef.current = setTimeout(() => {
      performSave();
    }, delay);

    // Cleanup on unmount or content change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, noteName, enabled, delay, performSave]);

  /**
   * Cancel pending saves on unmount
   */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    saveStatus,
    triggerSave,
    resetStatus,
  };
}

'use client';

/**
 * useLocalNotes Hook
 *
 * Manages note cards with localStorage persistence
 * Each note can be local-only or saved to file system
 */

import { useState, useEffect, useCallback } from 'react';

export interface LocalNote {
  id: string;
  title: string;
  content: string;
  savedToFile: boolean;
  filename?: string; // Only set if savedToFile is true
  lastModified: string;
}

const STORAGE_KEY = 'coderef-local-notes';

export function useLocalNotes() {
  const [notes, setNotes] = useState<LocalNote[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Load notes from localStorage on mount
   */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotes(parsed);
      }
    } catch (err) {
      console.error('Failed to load notes from localStorage:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Save notes to localStorage whenever they change
   */
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
      } catch (err) {
        console.error('Failed to save notes to localStorage:', err);
      }
    }
  }, [notes, loading]);

  /**
   * Create a new note
   */
  const createNote = useCallback(() => {
    const newNote: LocalNote = {
      id: `note-${Date.now()}`,
      title: '',
      content: '',
      savedToFile: false,
      lastModified: new Date().toISOString(),
    };
    setNotes(prev => [...prev, newNote]);
    return newNote.id;
  }, []);

  /**
   * Update a note's title or content
   */
  const updateNote = useCallback((id: string, updates: Partial<Pick<LocalNote, 'title' | 'content'>>) => {
    setNotes(prev =>
      prev.map(note =>
        note.id === id
          ? { ...note, ...updates, lastModified: new Date().toISOString() }
          : note
      )
    );
  }, []);

  /**
   * Mark a note as saved to file system
   */
  const markAsSaved = useCallback((id: string, filename: string) => {
    setNotes(prev =>
      prev.map(note =>
        note.id === id
          ? { ...note, savedToFile: true, filename, lastModified: new Date().toISOString() }
          : note
      )
    );
  }, []);

  /**
   * Delete a note
   */
  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  }, []);

  /**
   * Clear all notes
   */
  const clearAll = useCallback(() => {
    setNotes([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    notes,
    loading,
    createNote,
    updateNote,
    markAsSaved,
    deleteNote,
    clearAll,
  };
}

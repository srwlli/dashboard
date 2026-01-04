'use client';

/**
 * useNotes Hook
 *
 * State management for notes widget
 * Handles CRUD operations and integrates with API
 */

import { useState, useEffect, useCallback } from 'react';
import { CodeRefApi } from '@/lib/coderef/api-access';
import type { NoteMetadata } from '@/lib/coderef/api-access';
import type { Note, CreateNoteRequest } from '../types';
import { useProjects } from '@/contexts/ProjectsContext';

/**
 * useNotes Hook Result
 */
export interface UseNotesResult {
  /** List of notes */
  notes: NoteMetadata[];

  /** Currently selected note */
  currentNote: Note | null;

  /** Loading state */
  loading: boolean;

  /** Error message */
  error: string | null;

  /** Create a new note */
  createNote: (request: CreateNoteRequest) => Promise<void>;

  /** Load a note's content */
  loadNote: (name: string) => Promise<void>;

  /** Delete a note */
  deleteNote: (name: string) => Promise<void>;

  /** Refresh notes list */
  refreshNotes: () => Promise<void>;
}

/**
 * useNotes Hook
 *
 * Provides notes state management and CRUD operations
 * Integrates with ProjectsContext to get current project root
 */
export function useNotes(): UseNotesResult {
  const { projects } = useProjects();
  const [notes, setNotes] = useState<NoteMetadata[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the first project's path (for MVP, use first project)
  // TODO: Add project selector in future
  const projectRoot = projects[0]?.path || '';

  /**
   * Load notes list from API
   */
  const refreshNotes = useCallback(async () => {
    if (!projectRoot) {
      setNotes([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const notesList = await CodeRefApi.notes.list(projectRoot);
      setNotes(notesList);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load notes';
      setError(errorMessage);
      console.error('Error loading notes:', err);
    } finally {
      setLoading(false);
    }
  }, [projectRoot]);

  /**
   * Load notes on mount and when projectRoot changes
   */
  useEffect(() => {
    refreshNotes();
  }, [refreshNotes]);

  /**
   * Create a new note
   */
  const createNote = useCallback(
    async (request: CreateNoteRequest) => {
      if (!projectRoot) {
        throw new Error('No project selected');
      }

      try {
        setLoading(true);
        setError(null);

        // Write note to file system
        await CodeRefApi.notes.save(projectRoot, request.name, request.content || '');

        // Refresh notes list
        await refreshNotes();

        // Load the new note
        await loadNote(request.name);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create note';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [projectRoot, refreshNotes]
  );

  /**
   * Load a note's content
   */
  const loadNote = useCallback(
    async (name: string) => {
      if (!projectRoot) {
        throw new Error('No project selected');
      }

      try {
        setLoading(true);
        setError(null);

        // Find note metadata
        const noteMeta = notes.find(n => n.name === name);
        if (!noteMeta) {
          throw new Error(`Note not found: ${name}`);
        }

        // Load file content via FileApi
        const fileData = await CodeRefApi.file.load(
          `${projectRoot}/coderef/notes/${name}`
        );

        const note: Note = {
          name: noteMeta.name,
          path: noteMeta.path,
          content: fileData.content,
          modified: noteMeta.modified,
          size: noteMeta.size,
          extension: noteMeta.extension,
        };

        setCurrentNote(note);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load note';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [projectRoot, notes]
  );

  /**
   * Delete a note
   */
  const deleteNote = useCallback(
    async (name: string) => {
      if (!projectRoot) {
        throw new Error('No project selected');
      }

      try {
        setLoading(true);
        setError(null);

        // Delete via API
        await CodeRefApi.notes.delete(projectRoot, name);

        // Clear current note if it was deleted
        if (currentNote?.name === name) {
          setCurrentNote(null);
        }

        // Refresh notes list
        await refreshNotes();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete note';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [projectRoot, currentNote, refreshNotes]
  );

  return {
    notes,
    currentNote,
    loading,
    error,
    createNote,
    loadNote,
    deleteNote,
    refreshNotes,
  };
}

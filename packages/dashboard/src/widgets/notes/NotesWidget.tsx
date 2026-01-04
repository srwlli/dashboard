'use client';

/**
 * NotesWidget - Main container component
 *
 * Smart container that manages notes state, editor mode, and auto-save
 * Provides overall layout (2-column: list + editor) with industrial theme
 */

import { useState, useEffect, useCallback } from 'react';
import { useNotes } from './hooks/useNotes';
import { useAutoSave } from './hooks/useAutoSave';
import { useProjects } from '@/contexts/ProjectsContext';
import { CodeRefApi } from '@/lib/coderef/api-access';

/**
 * NotesWidget Component
 *
 * Main widget component that orchestrates notes functionality
 * Two-column layout: NotesList (30%) + Editor (70%)
 * Responsive: stacks on mobile (<768px)
 */
export default function NotesWidget() {
  const { projects } = useProjects();
  const { notes, currentNote, loading, error, createNote, loadNote, deleteNote, refreshNotes } =
    useNotes();
  const [editorContent, setEditorContent] = useState('');
  const [noteTitle, setNoteTitle] = useState('');

  // Get project root (use first project for MVP)
  const projectRoot = projects[0]?.path || '';

  // Auto-save hook
  const { saveStatus, triggerSave } = useAutoSave({
    content: editorContent,
    noteName: currentNote?.name || null,
    onSave: async content => {
      if (!currentNote || !projectRoot) return;
      await CodeRefApi.notes.save(projectRoot, currentNote.name, content);
    },
    enabled: !!currentNote,
  });

  /**
   * Handle note creation
   */
  const handleCreateNote = useCallback(async () => {
    try {
      const defaultName = `untitled-${Date.now()}.md`;
      await createNote({ name: defaultName, content: '' });
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  }, [createNote]);

  /**
   * Handle note selection from list
   */
  const handleNoteSelect = async (name: string) => {
    try {
      await loadNote(name);
    } catch (err) {
      console.error('Failed to load note:', err);
    }
  };

  /**
   * Keyboard shortcuts
   * Cmd/Ctrl+S: Manual save
   * Cmd/Ctrl+N: New note
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl+S: Manual save
      if (isMod && e.key === 's') {
        e.preventDefault();
        if (currentNote) {
          triggerSave();
        }
      }

      // Cmd/Ctrl+N: New note
      if (isMod && e.key === 'n') {
        e.preventDefault();
        handleCreateNote();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentNote, triggerSave, handleCreateNote]);

  /**
   * Handle note deletion
   */
  const handleDeleteNote = async (name: string) => {
    if (!confirm(`Delete note "${name}"?`)) return;

    try {
      await deleteNote(name);
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  /**
   * Update editor content when note changes
   */
  if (currentNote && editorContent !== currentNote.content) {
    setEditorContent(currentNote.content);
    setNoteTitle(currentNote.name);
  }

  return (
    <div className="h-full flex flex-col bg-ind-bg relative">
      {/* 3 Inline Note Cards */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
          {/* Note Card 1 */}
          <div className="bg-ind-panel border-2 border-ind-border rounded-lg p-4 flex flex-col h-80">
            <input
              type="text"
              placeholder="Untitled"
              className="bg-transparent border-b border-ind-border px-2 py-1 mb-3 text-ind-text font-semibold focus:outline-none focus:border-ind-accent"
            />
            <textarea
              placeholder="Start writing..."
              className="flex-1 resize-none bg-transparent text-ind-text text-sm focus:outline-none"
            />
            <div className="text-xs text-ind-text-muted mt-2">Local draft</div>
          </div>

          {/* Note Card 2 */}
          <div className="bg-ind-panel border-2 border-ind-border rounded-lg p-4 flex flex-col h-80">
            <input
              type="text"
              placeholder="Untitled"
              className="bg-transparent border-b border-ind-border px-2 py-1 mb-3 text-ind-text font-semibold focus:outline-none focus:border-ind-accent"
            />
            <textarea
              placeholder="Start writing..."
              className="flex-1 resize-none bg-transparent text-ind-text text-sm focus:outline-none"
            />
            <div className="text-xs text-ind-text-muted mt-2">Local draft</div>
          </div>

          {/* Note Card 3 */}
          <div className="bg-ind-panel border-2 border-ind-border rounded-lg p-4 flex flex-col h-80">
            <input
              type="text"
              placeholder="Untitled"
              className="bg-transparent border-b border-ind-border px-2 py-1 mb-3 text-ind-text font-semibold focus:outline-none focus:border-ind-accent"
            />
            <textarea
              placeholder="Start writing..."
              className="flex-1 resize-none bg-transparent text-ind-text text-sm focus:outline-none"
            />
            <div className="text-xs text-ind-text-muted mt-2">Local draft</div>
          </div>
        </div>
      </div>

      {/* Floating (+) Button - Bottom Right */}
      <button
        onClick={handleCreateNote}
        className="fixed bottom-8 right-8 w-14 h-14 bg-ind-accent text-white rounded-full shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center text-2xl font-light"
        aria-label="Create new note"
      >
        +
      </button>
    </div>
  );
}

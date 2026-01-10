'use client';

/**
 * NotesWidget - Main container component
 *
 * Smart container that manages notes state, editor mode, and auto-save
 * Provides overall layout (2-column: list + editor) with industrial theme
 */

import { useState, useEffect, useCallback } from 'react';
import { Save, Trash2 } from 'lucide-react';
import { useLocalNotes } from './hooks/useLocalNotes';
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
  const { notes, loading, createNote, updateNote, markAsSaved, deleteNote } = useLocalNotes();
  const [savingNotes, setSavingNotes] = useState<Set<string>>(new Set());

  // Get project root (use first project for MVP)
  const projectRoot = projects[0]?.path || '';

  /**
   * Handle creating a new note card
   */
  const handleCreateNote = useCallback(() => {
    createNote();
  }, [createNote]);

  /**
   * Handle saving a note to file system
   */
  const handleSaveNote = useCallback(async (id: string, title: string, content: string) => {
    if (!projectRoot) {
      alert('No project selected');
      return;
    }

    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    try {
      setSavingNotes(prev => new Set(prev).add(id));

      // Ensure filename has extension
      const filename = title.endsWith('.md') || title.endsWith('.txt')
        ? title
        : `${title}.md`;

      // Save to file system
      await CodeRefApi.notes.save(projectRoot, filename, content);

      // Mark as saved
      markAsSaved(id, filename);

      console.log(`Saved note to coderef/notes/${filename}`);
    } catch (err) {
      console.error('Failed to save note:', err);
      alert('Failed to save note to file system');
    } finally {
      setSavingNotes(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [projectRoot, markAsSaved]);

  /**
   * Handle deleting a note
   */
  const handleDeleteNote = useCallback((id: string) => {
    if (confirm('Delete this note?')) {
      deleteNote(id);
    }
  }, [deleteNote]);

  /**
   * Keyboard shortcuts
   * Cmd/Ctrl+N: New note
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl+N: New note
      if (isMod && e.key === 'n') {
        e.preventDefault();
        handleCreateNote();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCreateNote]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-ind-text-muted">
        Loading notes...
      </div>
    );
  }

  // Always show exactly 3 cards
  const displayNotes = notes.slice(0, 3);
  while (displayNotes.length < 3) {
    displayNotes.push({
      id: `temp-${displayNotes.length}`,
      title: '',
      content: '',
      savedToFile: false,
      lastModified: new Date().toISOString(),
    });
  }

  return (
    <div className="h-full flex gap-4 bg-ind-bg">
      {/* 3 Note Cards - Inline, Full Height */}
      {displayNotes.map((note, index) => {
        const isSaving = savingNotes.has(note.id);

        return (
          <div
            key={note.id}
            className="flex-1 bg-ind-panel border-2 border-ind-border rounded-lg p-4 flex flex-col"
          >
            {/* Title Input - TEXT EDITING FUNCTION: Title editing interface */}
            {/* This input allows users to edit note titles. Changes are handled by updateNote function */}
            <input
              type="text"
              placeholder="Untitled"
              value={note.title}
              onChange={e => updateNote(note.id, { title: e.target.value })}
              className="bg-transparent border-b border-ind-border px-2 py-1 mb-3 text-ind-text font-semibold focus:outline-none focus:border-ind-accent"
            />

            {/* Content Textarea - TEXT EDITING FUNCTION: Main text editing interface */}
            {/* This textarea allows users to edit note content. Changes are handled by updateNote function */}
            <textarea
              placeholder="Start writing..."
              value={note.content}
              onChange={e => updateNote(note.id, { content: e.target.value })}
              className="flex-1 resize-none bg-transparent text-ind-text text-sm focus:outline-none mb-3"
            />

            {/* Footer: Status + Actions */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-ind-text-muted">
                {note.savedToFile ? (
                  <span className="text-green-500">✓ Saved to {note.filename}</span>
                ) : (
                  <span>Local draft</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Save Button */}
                {!note.savedToFile && (
                  <button
                    onClick={() => handleSaveNote(note.id, note.title, note.content)}
                    disabled={isSaving}
                    className="p-1.5 hover:bg-ind-bg rounded transition-colors disabled:opacity-50"
                    title="Save to file system"
                  >
                    <Save className="w-4 h-4 text-ind-text-muted hover:text-ind-accent" />
                  </button>
                )}

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="p-1.5 hover:bg-ind-bg rounded transition-colors"
                  title="Delete note"
                >
                  <Trash2 className="w-4 h-4 text-ind-text-muted hover:text-red-500" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

'use client';

/**
 * NotesWidget - Main container component
 *
 * Smart container that manages notes state, editor mode, and auto-save
 * Provides overall layout (2-column: list + editor) with industrial theme
 */

import { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeSlug from 'rehype-slug';
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
    <div className="h-full flex flex-col bg-ind-bg">
      {/* Two-column layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Notes List - 30% on desktop, full width on mobile */}
        <div className="w-full md:w-[30%] border-r border-ind-border flex flex-col">
          <div className="p-4 border-b border-ind-border">
            <button
              onClick={handleCreateNote}
              className="w-full px-4 py-2 bg-ind-accent text-white font-semibold rounded hover:opacity-90 transition-opacity"
            >
              + New Note
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {loading && notes.length === 0 && (
              <div className="text-ind-text-muted text-sm">Loading notes...</div>
            )}

            {!loading && notes.length === 0 && (
              <div className="text-ind-text-muted text-sm">
                No notes yet. Create your first note.
              </div>
            )}

            {error && <div className="text-red-500 text-sm">Error: {error}</div>}

            {notes.map(note => (
              <div
                key={note.name}
                onClick={() => handleNoteSelect(note.name)}
                className={`p-3 rounded cursor-pointer border transition-colors ${
                  currentNote?.name === note.name
                    ? 'border-ind-accent bg-ind-panel'
                    : 'border-ind-border hover:bg-ind-panel'
                }`}
              >
                <div className="text-ind-text font-medium text-sm truncate">{note.name}</div>
                <div className="text-ind-text-muted text-xs mt-1">
                  {new Date(note.modified).toLocaleDateString()} • {(note.size / 1024).toFixed(1)}
                  KB
                </div>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleDeleteNote(note.name);
                  }}
                  className="text-ind-text-muted hover:text-red-500 text-xs mt-2"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Editor - 70% on desktop, full width on mobile */}
        <div className="flex-1 flex flex-col bg-ind-panel">
          {!currentNote && (
            <div className="flex-1 flex items-center justify-center text-ind-text-muted">
              Select a note or create a new one
            </div>
          )}

          {currentNote && (
            <>
              {/* Toolbar */}
              <div className="p-4 border-b border-ind-border flex items-center justify-between">
                <input
                  type="text"
                  value={noteTitle}
                  onChange={e => setNoteTitle(e.target.value)}
                  className="flex-1 bg-transparent border border-ind-border px-3 py-1 rounded text-ind-text focus:outline-none focus:border-ind-accent"
                />

                <div className="ml-4 flex items-center gap-4">
                  <div className="text-ind-text-muted text-xs">
                    {saveStatus === 'saving' && '💾 Saving...'}
                    {saveStatus === 'saved' && '✓ Saved'}
                    {saveStatus === 'error' && '⚠ Error (backup in browser)'}
                  </div>
                </div>
              </div>

              {/* Side-by-side Editor + Preview */}
              <div className="flex-1 flex overflow-hidden">
                {/* Editor (left 50%) */}
                <div className="w-1/2 border-r border-ind-border overflow-y-auto p-4">
                  <textarea
                    value={editorContent}
                    onChange={e => setEditorContent(e.target.value)}
                    className="w-full h-full resize-none bg-transparent text-ind-text font-mono text-sm focus:outline-none"
                    placeholder="Start writing markdown..."
                  />
                </div>

                {/* Preview (right 50%) */}
                <div className="w-1/2 overflow-y-auto p-4">
                  <div className="prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown
                      rehypePlugins={[rehypeSlug]}
                      components={{
                        code(props) {
                          const { children, className, ...rest } = props;
                          const match = /language-(\w+)/.exec(className || '');
                          const language = match ? match[1] : 'text';
                          const isInline = !match;

                          return !isInline ? (
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={language}
                              PreTag="div"
                              customStyle={{
                                margin: 0,
                                borderRadius: '0.375rem',
                                fontSize: '0.875rem',
                              }}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...rest}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {editorContent || '*Start writing to see preview...*'}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

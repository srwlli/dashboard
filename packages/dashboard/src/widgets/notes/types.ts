/**
 * Notes Widget Type Definitions
 */

/**
 * Note data structure
 */
export interface Note {
  /** Note file name */
  name: string;

  /** Relative path from coderef/notes/ */
  path: string;

  /** Note content (markdown/text) */
  content: string;

  /** Last modified timestamp */
  modified: string;

  /** File size in bytes */
  size: number;

  /** File extension */
  extension: string;
}

/**
 * Save status states
 */
export enum SaveStatus {
  /** No pending changes */
  Idle = 'idle',

  /** Save in progress */
  Saving = 'saving',

  /** Successfully saved */
  Saved = 'saved',

  /** Save failed, using localStorage backup */
  Error = 'error',
}

/**
 * Editor mode
 */
export enum EditorMode {
  /** Edit mode (textarea) */
  Edit = 'edit',

  /** Preview mode (rendered markdown) */
  Preview = 'preview',
}

/**
 * Create note request
 */
export interface CreateNoteRequest {
  /** Note file name (must include extension) */
  name: string;

  /** Initial content (optional) */
  content?: string;
}

/**
 * Rename note request
 */
export interface RenameNoteRequest {
  /** Current file name */
  oldName: string;

  /** New file name (must include extension) */
  newName: string;
}

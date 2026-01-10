/**
 * TypeScript interfaces for Notepad clone
 * Defines tab state, file operations, and menu actions
 */

/**
 * Individual tab/file in the notepad
 */
export interface NotepadTab {
  /** Unique tab identifier */
  id: string;

  /** Relative file path from project root (e.g., "src/App.tsx", "coderef/notes/todo.md") */
  filePath: string | null;

  /** File content */
  content: string;

  /** Unsaved changes indicator */
  isDirty: boolean;

  /** Last saved timestamp (ISO 8601) */
  lastSaved: string | null;

  /** File extension (e.g., ".md", ".ts", ".py") */
  fileExtension: string;

  /** Display title (derived from filePath or "Untitled") */
  title: string;
}

/**
 * Menu action types for File menu
 */
export type FileMenuAction = 'new' | 'open' | 'save' | 'save-as' | 'close-tab';

/**
 * Menu action types for Edit menu
 */
export type EditMenuAction = 'undo' | 'redo' | 'cut' | 'copy' | 'paste' | 'select-all';

/**
 * File picker result from dialog
 */
export interface FilePickerResult {
  /** Absolute file path */
  filePath: string;

  /** File content */
  content: string;

  /** Filename only (e.g., "App.tsx") */
  filename: string;
}

/**
 * Save file result
 */
export interface SaveFileResult {
  /** Success indicator */
  success: boolean;

  /** Absolute file path where saved */
  filePath?: string;

  /** Error message if failed */
  error?: string;
}

/**
 * File size warning dialog props
 */
export interface FileSizeWarning {
  /** File size in bytes */
  size: number;

  /** File path being opened */
  filePath: string;

  /** Show warning dialog */
  show: boolean;

  /** Callback when user confirms */
  onConfirm: () => void;

  /** Callback when user cancels */
  onCancel: () => void;
}

/**
 * Tab close confirmation props
 */
export interface TabCloseConfirmation {
  /** Tab being closed */
  tab: NotepadTab;

  /** Show confirmation dialog */
  show: boolean;

  /** Callback when user confirms (don't save) */
  onConfirm: () => void;

  /** Callback when user saves before closing */
  onSave: () => void;

  /** Callback when user cancels */
  onCancel: () => void;
}

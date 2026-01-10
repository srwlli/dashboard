'use client';

/**
 * MenuBar Component
 *
 * Notepad-style menu bar with File and Edit menus
 * Supports keyboard shortcuts and menu item callbacks
 */

import { useState, useRef, useEffect } from 'react';
import { FileText, Edit3, ChevronDown } from 'lucide-react';
import type { FileMenuAction, EditMenuAction } from '../types/notepad';

interface MenuBarProps {
  /** Callback when File menu action triggered */
  onFileAction: (action: FileMenuAction) => void;

  /** Callback when Edit menu action triggered */
  onEditAction: (action: EditMenuAction) => void;

  /** Disable save actions when no unsaved changes */
  canSave?: boolean;

  /** Disable close when no tabs open */
  canClose?: boolean;

  /** Optional className */
  className?: string;
}

export function MenuBar({
  onFileAction,
  onEditAction,
  canSave = true,
  canClose = true,
  className = '',
}: MenuBarProps) {
  const [openMenu, setOpenMenu] = useState<'file' | 'edit' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      // File menu shortcuts
      if (isMod && e.key === 'n') {
        e.preventDefault();
        onFileAction('new');
      } else if (isMod && e.key === 'o') {
        e.preventDefault();
        onFileAction('open');
      } else if (isMod && e.key === 's') {
        e.preventDefault();
        if (e.shiftKey) {
          onFileAction('save-as');
        } else if (canSave) {
          onFileAction('save');
        }
      } else if (isMod && e.key === 'w') {
        e.preventDefault();
        if (canClose) {
          onFileAction('close-tab');
        }
      }

      // Edit menu shortcuts
      else if (isMod && e.key === 'z') {
        e.preventDefault();
        onEditAction('undo');
      } else if (isMod && e.key === 'y') {
        e.preventDefault();
        onEditAction('redo');
      } else if (isMod && e.key === 'x') {
        e.preventDefault();
        onEditAction('cut');
      } else if (isMod && e.key === 'c') {
        e.preventDefault();
        onEditAction('copy');
      } else if (isMod && e.key === 'v') {
        e.preventDefault();
        onEditAction('paste');
      } else if (isMod && e.key === 'a') {
        e.preventDefault();
        onEditAction('select-all');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onFileAction, onEditAction, canSave, canClose]);

  const handleFileAction = (action: FileMenuAction) => {
    setOpenMenu(null);
    onFileAction(action);
  };

  const handleEditAction = (action: EditMenuAction) => {
    setOpenMenu(null);
    onEditAction(action);
  };

  return (
    <div
      ref={menuRef}
      className={`flex items-center gap-1 px-2 py-1 bg-ind-panel border-b border-ind-border ${className}`}
    >
      {/* File Menu */}
      <div className="relative">
        <button
          onClick={() => setOpenMenu(openMenu === 'file' ? null : 'file')}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-ind-text hover:bg-ind-bg rounded transition-colors"
        >
          <FileText className="w-4 h-4" />
          <span>File</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        {openMenu === 'file' && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-ind-panel border border-ind-border rounded shadow-lg z-50">
            <MenuItem
              label="New"
              shortcut="Ctrl+N"
              onClick={() => handleFileAction('new')}
            />
            <MenuItem
              label="Open..."
              shortcut="Ctrl+O"
              onClick={() => handleFileAction('open')}
            />
            <MenuDivider />
            <MenuItem
              label="Save"
              shortcut="Ctrl+S"
              onClick={() => handleFileAction('save')}
              disabled={!canSave}
            />
            <MenuItem
              label="Save As..."
              shortcut="Ctrl+Shift+S"
              onClick={() => handleFileAction('save-as')}
            />
            <MenuDivider />
            <MenuItem
              label="Close Tab"
              shortcut="Ctrl+W"
              onClick={() => handleFileAction('close-tab')}
              disabled={!canClose}
            />
          </div>
        )}
      </div>

      {/* Edit Menu */}
      <div className="relative">
        <button
          onClick={() => setOpenMenu(openMenu === 'edit' ? null : 'edit')}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-ind-text hover:bg-ind-bg rounded transition-colors"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        {openMenu === 'edit' && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-ind-panel border border-ind-border rounded shadow-lg z-50">
            <MenuItem
              label="Undo"
              shortcut="Ctrl+Z"
              onClick={() => handleEditAction('undo')}
            />
            <MenuItem
              label="Redo"
              shortcut="Ctrl+Y"
              onClick={() => handleEditAction('redo')}
            />
            <MenuDivider />
            <MenuItem
              label="Cut"
              shortcut="Ctrl+X"
              onClick={() => handleEditAction('cut')}
            />
            <MenuItem
              label="Copy"
              shortcut="Ctrl+C"
              onClick={() => handleEditAction('copy')}
            />
            <MenuItem
              label="Paste"
              shortcut="Ctrl+V"
              onClick={() => handleEditAction('paste')}
            />
            <MenuDivider />
            <MenuItem
              label="Select All"
              shortcut="Ctrl+A"
              onClick={() => handleEditAction('select-all')}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Menu item component
 */
function MenuItem({
  label,
  shortcut,
  onClick,
  disabled = false,
}: {
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full flex items-center justify-between px-3 py-2 text-sm
        ${disabled
          ? 'text-ind-text-muted opacity-50 cursor-not-allowed'
          : 'text-ind-text hover:bg-ind-bg'
        }
        transition-colors
      `}
    >
      <span>{label}</span>
      {shortcut && (
        <span className="text-xs text-ind-text-muted">{shortcut}</span>
      )}
    </button>
  );
}

/**
 * Menu divider
 */
function MenuDivider() {
  return <div className="h-px bg-ind-border my-1" />;
}

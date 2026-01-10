'use client';

/**
 * NotesWidget - Notepad Clone
 *
 * Multi-tab text editor with syntax highlighting
 * Supports project-wide file operations (Open, Save, Save As)
 * Features: File/Edit menus, keyboard shortcuts, unsaved changes tracking
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useProjects } from '@/contexts/ProjectsContext';
import { CodeRefApi } from '@/lib/coderef/api-access';
import { MenuBar } from './components/MenuBar';
import { TabBar } from './components/TabBar';
import { FilePicker } from './components/FilePicker';
import { useNotepadTabs } from './hooks/useNotepadTabs';
import type { FileMenuAction, EditMenuAction } from './types/notepad';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getLanguage } from '@/components/PromptingWorkflow/utils/languageMap';
import { Eye, Edit3, ExternalLink } from 'lucide-react';

export default function NotesWidget() {
  const { projects } = useProjects();
  const {
    tabs,
    activeTabId,
    activeTab,
    createTab,
    switchTab,
    updateContent,
    markAsSaved,
    closeTab,
    hasUnsavedChanges,
  } = useNotepadTabs();

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [saving, setSaving] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Get project root (use first project for MVP)
  const projectRoot = projects[0]?.path || '';

  /**
   * Handle File menu actions
   */
  const handleFileAction = useCallback(async (action: FileMenuAction) => {
    switch (action) {
      case 'new':
        createTab(undefined, '', '.md');
        break;

      case 'open':
        try {
          const result = await FilePicker.openFile();
          if (result) {
            const extension = FilePicker.getExtension(result.filename);
            createTab(result.filename, result.content, extension);
          }
        } catch (error) {
          console.error('Failed to open file:', error);
          alert('Failed to open file');
        }
        break;

      case 'save':
        if (activeTab) {
          await handleSave(activeTab.id);
        }
        break;

      case 'save-as':
        if (activeTab) {
          await handleSaveAs(activeTab.id);
        }
        break;

      case 'close-tab':
        if (activeTabId) {
          handleCloseTab(activeTabId);
        }
        break;
    }
  }, [activeTab, activeTabId, createTab]);

  /**
   * Handle Edit menu actions
   */
  const handleEditAction = useCallback((action: EditMenuAction) => {
    if (!editorRef.current) return;

    const textarea = editorRef.current;

    switch (action) {
      case 'undo':
        document.execCommand('undo');
        break;

      case 'redo':
        document.execCommand('redo');
        break;

      case 'cut':
        navigator.clipboard.writeText(
          textarea.value.substring(textarea.selectionStart, textarea.selectionEnd)
        );
        const cutValue = textarea.value.substring(0, textarea.selectionStart) +
          textarea.value.substring(textarea.selectionEnd);
        if (activeTab) {
          updateContent(activeTab.id, cutValue);
        }
        break;

      case 'copy':
        navigator.clipboard.writeText(
          textarea.value.substring(textarea.selectionStart, textarea.selectionEnd)
        );
        break;

      case 'paste':
        navigator.clipboard.readText().then(text => {
          const pasteValue = textarea.value.substring(0, textarea.selectionStart) +
            text +
            textarea.value.substring(textarea.selectionEnd);
          if (activeTab) {
            updateContent(activeTab.id, pasteValue);
          }
        });
        break;

      case 'select-all':
        textarea.select();
        break;
    }
  }, [activeTab, updateContent]);

  /**
   * Save active tab to file system
   */
  const handleSave = useCallback(async (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    // If no filePath, use Save As
    if (!tab.filePath) {
      await handleSaveAs(tabId);
      return;
    }

    if (!projectRoot) {
      alert('No project selected');
      return;
    }

    try {
      setSaving(true);

      // Save using FileApi
      await CodeRefApi.file.save(projectRoot, tab.filePath, tab.content);

      // Mark as saved
      markAsSaved(tabId, tab.filePath);
    } catch (error) {
      console.error('Failed to save file:', error);
      alert('Failed to save file');
    } finally {
      setSaving(false);
    }
  }, [tabs, projectRoot, markAsSaved]);

  /**
   * Save As - prompt for file path
   */
  const handleSaveAs = useCallback(async (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    try {
      setSaving(true);

      const suggestedName = tab.title !== 'Untitled' ? tab.title : `untitled${tab.fileExtension}`;
      const result = await FilePicker.saveFile(tab.content, suggestedName);

      if (result && result.success && result.filePath) {
        // Mark as saved with new path
        markAsSaved(tabId, result.filePath);
      }
    } catch (error) {
      console.error('Failed to save file:', error);
      alert('Failed to save file');
    } finally {
      setSaving(false);
    }
  }, [tabs, markAsSaved]);

  /**
   * Handle tab close with unsaved changes confirmation
   */
  const handleCloseTab = useCallback((tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    if (tab.isDirty) {
      setShowCloseConfirm(tabId);
    } else {
      closeTab(tabId);
    }
  }, [tabs, closeTab]);

  /**
   * Confirm close tab without saving
   */
  const confirmCloseTab = useCallback(() => {
    if (showCloseConfirm) {
      closeTab(showCloseConfirm);
      setShowCloseConfirm(null);
    }
  }, [showCloseConfirm, closeTab]);

  /**
   * Save before closing tab
   */
  const saveBeforeClose = useCallback(async () => {
    if (showCloseConfirm) {
      await handleSave(showCloseConfirm);
      closeTab(showCloseConfirm);
      setShowCloseConfirm(null);
    }
  }, [showCloseConfirm, handleSave, closeTab]);

  /**
   * Handle content change
   */
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (activeTab) {
      updateContent(activeTab.id, e.target.value);
    }
  }, [activeTab, updateContent]);

  /**
   * Open notepad in new Electron window
   */
  const handleOpenInNewWindow = useCallback(() => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      // Electron IPC call to open new window
      (window as any).electronAPI.openNotesWindow?.();
    } else {
      // Web fallback: open in new browser tab
      window.open('/notes', '_blank');
    }
  }, []);

  /**
   * Warn before closing window with unsaved changes
   */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return (
    <div className="h-full flex flex-col bg-ind-bg">
      {/* Menu Bar */}
      <MenuBar
        onFileAction={handleFileAction}
        onEditAction={handleEditAction}
        canSave={activeTab?.isDirty || false}
        canClose={tabs.length > 0}
      />

      {/* Tab Bar */}
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={switchTab}
        onCloseTab={handleCloseTab}
      />

      {/* Preview Toggle & Actions */}
      {activeTab && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-ind-panel border-b border-ind-border">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewMode(false)}
              className={`flex items-center gap-1 px-3 py-1 rounded text-xs transition-colors ${
                !previewMode
                  ? 'bg-ind-accent text-white'
                  : 'text-ind-text-muted hover:bg-ind-bg'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => setPreviewMode(true)}
              className={`flex items-center gap-1 px-3 py-1 rounded text-xs transition-colors ${
                previewMode
                  ? 'bg-ind-accent text-white'
                  : 'text-ind-text-muted hover:bg-ind-bg'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          {/* Open in New Window button */}
          <button
            onClick={handleOpenInNewWindow}
            className="flex items-center gap-1 px-3 py-1 rounded text-xs text-ind-text-muted hover:bg-ind-bg hover:text-ind-text transition-colors"
            title="Open in new window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>New Window</span>
          </button>
        </div>
      )}

      {/* Editor Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab ? (
          previewMode ? (
            <div className="w-full h-full overflow-auto p-4 bg-ind-bg">
              <SyntaxHighlighter
                language={getLanguage(activeTab.fileExtension)}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                  height: '100%',
                }}
                showLineNumbers
              >
                {activeTab.content || '// Empty file'}
              </SyntaxHighlighter>
            </div>
          ) : (
            <textarea
              ref={editorRef}
              value={activeTab.content}
              onChange={handleContentChange}
              className="w-full h-full p-4 bg-ind-bg text-ind-text font-mono text-sm resize-none focus:outline-none"
              placeholder="Start typing..."
              spellCheck={false}
            />
          )
        ) : (
          <div className="h-full flex items-center justify-center text-ind-text-muted">
            <p>No file open. Press Ctrl+N to create a new file or Ctrl+O to open an existing file.</p>
          </div>
        )}
      </div>

      {/* Status Bar */}
      {activeTab && (
        <div className="px-4 py-2 bg-ind-panel border-t border-ind-border text-xs text-ind-text-muted flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>{activeTab.filePath || 'Untitled'}</span>
            <span>•</span>
            <span>{activeTab.fileExtension.toUpperCase().replace('.', '')}</span>
            {activeTab.isDirty && (
              <>
                <span>•</span>
                <span className="text-amber-500">Unsaved changes</span>
              </>
            )}
            {saving && (
              <>
                <span>•</span>
                <span className="text-blue-500">Saving...</span>
              </>
            )}
          </div>
          <div>
            Lines: {activeTab.content.split('\n').length} |
            Characters: {activeTab.content.length}
          </div>
        </div>
      )}

      {/* Close Confirmation Dialog */}
      {showCloseConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-ind-panel border border-ind-border rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold text-ind-text mb-2">Unsaved Changes</h3>
            <p className="text-sm text-ind-text-muted mb-6">
              Do you want to save changes to this file before closing?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowCloseConfirm(null)}
                className="px-4 py-2 rounded bg-ind-bg text-ind-text hover:bg-ind-border transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmCloseTab}
                className="px-4 py-2 rounded bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
              >
                Don't Save
              </button>
              <button
                onClick={saveBeforeClose}
                className="px-4 py-2 rounded bg-ind-accent text-white hover:bg-ind-accent/80 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

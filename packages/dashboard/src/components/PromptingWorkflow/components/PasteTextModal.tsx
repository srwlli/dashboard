import React, { useState, useEffect, useCallback } from 'react';
import { Attachment } from '../types';
import { generateClipboardFilename } from '../utils/filenameGenerator';
import { useClipboard } from '../hooks/useClipboard';

interface PasteTextModalProps {
  isOpen: boolean;
  existingFilenames: string[];
  onTextAdded: (attachment: Attachment) => void;
  onClose: () => void;
}

export const PasteTextModal: React.FC<PasteTextModalProps> = ({
  isOpen,
  existingFilenames,
  onTextAdded,
  onClose,
}) => {
  const [text, setText] = useState('');
  const [filename, setFilename] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { read: readClipboard } = useClipboard();

  // Auto-detect clipboard on modal open
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      readClipboard().then((clipboardText) => {
        if (clipboardText) {
          setText(clipboardText);
          const generatedFilename = generateClipboardFilename(existingFilenames);
          setFilename(generatedFilename);
        }
        setIsLoading(false);
      });
    }
  }, [isOpen, readClipboard, existingFilenames]);

  const handleSubmit = useCallback(() => {
    if (!text.trim()) {
      alert('Please enter text to paste');
      return;
    }

    if (!filename.trim()) {
      alert('Please enter a filename');
      return;
    }

    const attachment: Attachment = {
      id: Math.random().toString(36).substring(2, 11),
      filename: filename.trim(),
      type: 'PASTED_TEXT',
      extension: '.txt',
      mimeType: 'text/plain',
      size: text.length,
      content: text,
      preview: text.substring(0, 200),
      language: 'text',
      isText: true,
      isBinary: false,
      createdAt: new Date(),
    };

    onTextAdded(attachment);
    setText('');
    setFilename('');
    onClose();
  }, [text, filename, onTextAdded, onClose]);

  const handleClose = useCallback(() => {
    setText('');
    setFilename('');
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleClose}>
      <div className="bg-ind-panel border border-ind-border rounded max-w-md w-full mx-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-ind-border">
          <h2 className="text-lg font-bold text-ind-text">Paste Text as Attachment</h2>
          <button
            className="text-ind-text-muted hover:text-ind-text cursor-pointer transition-colors"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-ind-text uppercase tracking-wider">Filename</label>
            <input
              type="text"
              className="w-full bg-ind-bg border border-ind-border rounded p-3 text-ind-text text-sm placeholder-ind-text-muted focus:outline-none focus:ring-2 focus:ring-ind-accent"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="clipboard_001.txt"
            />
            <p className="text-xs text-ind-text-muted">
              Auto-generated: {generateClipboardFilename(existingFilenames)}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-ind-text uppercase tracking-wider">Text Content</label>
            <textarea
              className="w-full bg-ind-bg border border-ind-border rounded p-3 text-ind-text text-sm placeholder-ind-text-muted focus:outline-none focus:ring-2 focus:ring-ind-accent disabled:opacity-50"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste text here..."
              disabled={isLoading}
              rows={8}
            />
            <p className="text-xs text-ind-text-muted">
              {text.length > 0
                ? `${text.length} characters (~${Math.ceil(text.length / 4)} tokens)`
                : 'Paste or type text here'}
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t border-ind-border">
          <button
            className="flex-1 px-4 py-2 bg-ind-border text-ind-text font-bold uppercase tracking-wider text-sm hover:bg-ind-text hover:text-ind-bg transition-all active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed rounded"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            className="flex-1 px-4 py-2 bg-ind-accent text-black font-bold uppercase tracking-wider text-sm hover:bg-ind-accent-hover transition-all active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed rounded"
            onClick={handleSubmit}
            disabled={isLoading || !text.trim()}
          >
            {isLoading ? '⟳ Loading...' : 'Add Text as Attachment'}
          </button>
        </div>
      </div>
    </div>
  );
};

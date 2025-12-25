import React, { useState, useEffect, useCallback } from 'react';
import { Attachment } from '../types';
import { generateClipboardFilename } from '../utils/filenameGenerator';
import { useClipboard } from '../hooks/useClipboard';
import styles from './PasteTextModal.module.css';

interface PasteTextModalProps {
  isOpen: boolean;
  existingFilenames: string[];
  onTextAdded: (attachment: Attachment) => void;
  onClose: () => void;
}

/**
 * PasteTextModal - Modal for pasting raw text as attachment
 * Auto-detects clipboard content and auto-generates filename
 */
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
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Paste Text as Attachment</h2>
          <button className={styles.closeButton} onClick={handleClose}>
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Filename</label>
            <input
              type="text"
              className={styles.input}
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="clipboard_001.txt"
            />
            <p className={styles.hint}>
              Auto-generated: {generateClipboardFilename(existingFilenames)}
            </p>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Text Content</label>
            <textarea
              className={styles.textarea}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste text here..."
              disabled={isLoading}
            />
            <p className={styles.hint}>
              {text.length > 0
                ? `${text.length} characters (~${Math.ceil(text.length / 4)} tokens)`
                : 'Paste or type text here'}
            </p>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={handleClose}>
            Cancel
          </button>
          <button
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={isLoading || !text.trim()}
          >
            {isLoading ? 'Loading...' : 'Add Text as Attachment'}
          </button>
        </div>
      </div>
    </div>
  );
};

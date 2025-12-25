import React, { useState, useCallback } from 'react';
import { Attachment } from '../types';
import { readFileContent } from '../utils/fileContentExtractor';
import styles from './AttachmentDropZone.module.css';

interface AttachmentDropZoneProps {
  onFilesAdded: (attachments: Attachment[]) => void;
  disabled?: boolean;
}

type DropZoneState = 'idle' | 'drag' | 'loading' | 'success' | 'error';

export const AttachmentDropZone: React.FC<AttachmentDropZoneProps> = ({
  onFilesAdded,
  disabled = false,
}) => {
  const [state, setState] = useState<DropZoneState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setState('drag');
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setState('idle');
  }, [disabled]);

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) {
        setState('idle');
        return;
      }

      setState('loading');
      setErrorMessage(null);

      try {
        const attachments = await Promise.all(files.map((file) => readFileContent(file)));
        onFilesAdded(attachments);
        setState('success');
        setTimeout(() => setState('idle'), 2000);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to process files';
        setErrorMessage(message);
        setState('error');
        setTimeout(() => setState('idle'), 3000);
      }
    },
    [disabled, onFilesAdded]
  );

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      setState('loading');
      setErrorMessage(null);

      try {
        const attachments = await Promise.all(files.map((file) => readFileContent(file)));
        onFilesAdded(attachments);
        setState('success');
        setTimeout(() => setState('idle'), 2000);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to process files';
        setErrorMessage(message);
        setState('error');
        setTimeout(() => setState('idle'), 3000);
      }
    },
    [onFilesAdded]
  );

  const stateMessage: Record<DropZoneState, string> = {
    idle: 'Drag files here or click to browse',
    drag: 'Drop files to attach',
    loading: 'Processing files...',
    success: '✓ Files added successfully',
    error: '✗ Error processing files',
  };

  return (
    <div
      className={`${styles.dropZone} ${styles[state]} ${disabled ? styles.disabled : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        multiple
        onChange={handleFileInput}
        disabled={disabled || state === 'loading'}
        style={{ display: 'none' }}
        id="file-input"
      />

      <label htmlFor="file-input" className={styles.content}>
        <div className={styles.icon}>
          {state === 'loading' && <span className={styles.spinner}>⟳</span>}
          {state === 'success' && <span>✓</span>}
          {state === 'error' && <span>⚠</span>}
          {['idle', 'drag'].includes(state) && <span>📎</span>}
        </div>
        <p className={styles.message}>{stateMessage[state]}</p>
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        <p className={styles.hint}>
          Supports code, text, markdown, JSON, and other text files
        </p>
      </label>
    </div>
  );
};

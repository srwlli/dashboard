import React, { useState, useCallback } from 'react';
import { Attachment } from '../types';
import { readFileContent } from '../utils/fileContentExtractor';

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

  const getStateStyles = () => {
    const base = 'border-2 border-dashed rounded p-8 text-center cursor-pointer transition-all ';
    switch (state) {
      case 'drag':
        return base + 'border-ind-accent bg-ind-accent/10';
      case 'loading':
        return base + 'border-ind-text-muted bg-ind-bg/50';
      case 'success':
        return base + 'border-green-600 bg-green-900/20';
      case 'error':
        return base + 'border-red-600 bg-red-900/20';
      default:
        return base + 'border-ind-border hover:border-ind-accent';
    }
  };

  return (
    <div
      className={`${getStateStyles()} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
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

      <label htmlFor="file-input" className="block cursor-pointer">
        <div className="text-4xl mb-3">
          {state === 'loading' && <span className="inline-block animate-spin">⟳</span>}
          {state === 'success' && <span className="text-green-400">✓</span>}
          {state === 'error' && <span className="text-red-400">⚠</span>}
          {['idle', 'drag'].includes(state) && <span>📎</span>}
        </div>
        <p className={`text-sm font-bold ${
          state === 'success' ? 'text-green-400' :
          state === 'error' ? 'text-red-400' :
          'text-ind-text'
        }`}>
          {stateMessage[state]}
        </p>
        {errorMessage && <p className="text-xs text-red-400 mt-2">{errorMessage}</p>}
        <p className="text-xs text-ind-text-muted mt-2">
          Supports code, text, markdown, JSON, and other text files
        </p>
      </label>
    </div>
  );
};

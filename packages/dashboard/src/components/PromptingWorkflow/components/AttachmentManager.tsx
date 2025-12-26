import React, { useCallback } from 'react';
import { Attachment } from '../types';
import { AttachmentDropZone } from './AttachmentDropZone';
import { formatTokenCount } from '../utils/tokenEstimator';
import { generateClipboardFilename } from '../utils/filenameGenerator';
import { useClipboard } from '../hooks/useClipboard';

interface AttachmentManagerProps {
  attachments: Attachment[];
  onAddAttachments: (attachments: Attachment[]) => void;
  onRemoveAttachment: (id: string) => void;
  onClearAll: () => void;
}

export const AttachmentManager: React.FC<AttachmentManagerProps> = ({
  attachments,
  onAddAttachments,
  onRemoveAttachment,
  onClearAll,
}) => {
  const existingFilenames = attachments.map((a) => a.filename);
  const { read: readClipboard } = useClipboard();

  const handleQuickPaste = useCallback(async () => {
    try {
      const clipboardText = await readClipboard();

      if (!clipboardText?.trim()) {
        alert('Unable to read clipboard. Please ensure:\n1. You have copied text to clipboard\n2. The browser has permission to access clipboard\n3. You are using HTTPS or localhost');
        return;
      }

      const filename = generateClipboardFilename(existingFilenames);

      const attachment: Attachment = {
        id: Math.random().toString(36).substring(2, 11),
        filename,
        type: 'PASTED_TEXT',
        extension: '.txt',
        mimeType: 'text/plain',
        size: clipboardText.length,
        content: clipboardText,
        preview: clipboardText.substring(0, 200),
        language: 'text',
        isText: true,
        isBinary: false,
        createdAt: new Date(),
      };

      onAddAttachments([attachment]);
    } catch (error) {
      alert('Failed to read clipboard');
    }
  }, [existingFilenames, onAddAttachments, readClipboard]);

  const totalSize = attachments.reduce((sum, a) => sum + a.size, 0);
  const totalTokens = Math.ceil(
    attachments.reduce((sum, a) => sum + (a.content?.length || 0), 0) / 4
  );

  return (
    <div className="w-full space-y-4">
      <h3 className="text-sm uppercase tracking-widest text-ind-text-muted font-mono font-bold">
        Attachments
      </h3>

      <AttachmentDropZone onFilesAdded={onAddAttachments} disabled={false} />

      <div className="flex gap-3 flex-wrap">
        <button
          className="px-4 py-2 bg-ind-accent text-black font-bold uppercase tracking-wider text-sm hover:bg-ind-accent-hover transition-all active:translate-y-0.5"
          onClick={handleQuickPaste}
          type="button"
        >
          + Paste Text
        </button>
        {attachments.length > 0 && (
          <button
            className="px-4 py-2 bg-ind-border text-ind-text font-bold uppercase tracking-wider text-sm hover:bg-ind-text transition-all active:translate-y-0.5"
            onClick={onClearAll}
            type="button"
          >
            Clear All
          </button>
        )}
      </div>

      {attachments.length > 0 && (
        <div className="flex gap-6 px-4 py-3 bg-ind-bg border border-ind-border rounded">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-ind-text-muted">Files:</span>
            <span className="text-sm font-bold text-ind-accent">{attachments.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-ind-text-muted">Size:</span>
            <span className="text-sm font-bold text-ind-accent">
              {(totalSize / 1024).toFixed(1)} KB
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-ind-text-muted">Tokens:</span>
            <span className="text-sm font-bold text-ind-accent">
              {formatTokenCount(totalTokens)}
            </span>
          </div>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="space-y-3 mt-4">
          <h4 className="text-xs uppercase tracking-wider text-ind-text font-bold">Attached Files</h4>
          {attachments.map((attachment) => (
            <div key={attachment.id} className="bg-ind-panel border border-ind-border rounded overflow-hidden hover:border-ind-accent transition-colors">
              <div className="flex items-center gap-3 p-3">
                <span className="text-xl flex-shrink-0">
                  {attachment.type === 'IMAGE' ? '🖼️' : '📄'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-ind-text truncate">{attachment.filename}</p>
                  <p className="text-xs text-ind-text-muted">
                    {(attachment.size / 1024).toFixed(1)} KB
                    {attachment.language && ` • ${attachment.language}`}
                  </p>
                </div>
                <button
                  className="flex items-center justify-center w-7 h-7 text-ind-text-muted hover:bg-ind-border rounded transition-colors"
                  onClick={() => onRemoveAttachment(attachment.id)}
                  title="Remove attachment"
                >
                  ✕
                </button>
              </div>
              {attachment.preview && (
                <div className="px-3 py-2 bg-ind-bg border-t border-ind-border text-xs text-ind-text-muted font-mono max-h-[100px] overflow-hidden">
                  <p className="m-0 whitespace-pre-wrap break-words">{attachment.preview}...</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

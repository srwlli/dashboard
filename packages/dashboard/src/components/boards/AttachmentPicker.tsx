'use client';

/**
 * AttachmentPicker Component
 *
 * UI for adding file/folder/URL attachments to cards
 * Stores references only (no file content reading)
 */

import { useState } from 'react';
import { File, Folder, Link as LinkIcon, Plus, X } from 'lucide-react';
import type { CardAttachment } from '@/types/boards';

interface AttachmentPickerProps {
  attachments: CardAttachment[];
  onAdd: (attachment: CardAttachment) => void;
  onRemove: (id: string) => void;
}

type AttachmentType = 'file' | 'folder' | 'url';

export function AttachmentPicker({ attachments, onAdd, onRemove }: AttachmentPickerProps) {
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<AttachmentType>('file');
  const [pathOrUrl, setPathOrUrl] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');

  function handleAdd() {
    // Validation
    if (!pathOrUrl.trim()) {
      setError('Path or URL is required');
      return;
    }

    if (!displayName.trim()) {
      setError('Display name is required');
      return;
    }

    // URL validation
    if (type === 'url') {
      try {
        new URL(pathOrUrl);
      } catch {
        setError('Invalid URL format');
        return;
      }
    }

    // Create attachment
    const attachment: CardAttachment = {
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      displayName: displayName.trim(),
      addedAt: new Date().toISOString(),
      ...(type === 'url' ? { url: pathOrUrl.trim() } : { path: pathOrUrl.trim() }),
    };

    onAdd(attachment);

    // Reset form
    setPathOrUrl('');
    setDisplayName('');
    setError('');
    setShowForm(false);
  }

  function handleCancel() {
    setShowForm(false);
    setPathOrUrl('');
    setDisplayName('');
    setError('');
  }

  return (
    <div className="space-y-3">
      {/* Attachment List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 p-3 bg-ind-bg border border-ind-border hover:border-ind-accent transition-colors"
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                {attachment.type === 'file' && <File className="w-4 h-4 text-ind-accent" />}
                {attachment.type === 'folder' && <Folder className="w-4 h-4 text-ind-accent" />}
                {attachment.type === 'url' && <LinkIcon className="w-4 h-4 text-blue-400" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ind-text truncate">
                  {attachment.displayName}
                </p>
                <p className="text-xs text-ind-text-muted truncate">
                  {attachment.type === 'url' ? attachment.url : attachment.path}
                </p>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => onRemove(attachment.id)}
                className="flex-shrink-0 p-1 hover:bg-red-500/20 transition-colors"
              >
                <X className="w-4 h-4 text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Button / Form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-4 py-3 border-2 border-dashed border-ind-border hover:border-ind-accent hover:bg-ind-accent/5 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-ind-text-muted"
        >
          <Plus className="w-4 h-4" />
          Add Attachment
        </button>
      ) : (
        <div className="p-4 bg-ind-panel border-2 border-ind-border space-y-3">
          {/* Type Selector */}
          <div>
            <label className="block text-xs font-medium text-ind-text-muted mb-2">
              Attachment Type
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setType('file')}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                  type === 'file'
                    ? 'bg-ind-accent text-black'
                    : 'bg-ind-bg text-ind-text hover:bg-ind-border'
                }`}
              >
                <File className="w-4 h-4 inline mr-1" />
                File
              </button>
              <button
                onClick={() => setType('folder')}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                  type === 'folder'
                    ? 'bg-ind-accent text-black'
                    : 'bg-ind-bg text-ind-text hover:bg-ind-border'
                }`}
              >
                <Folder className="w-4 h-4 inline mr-1" />
                Folder
              </button>
              <button
                onClick={() => setType('url')}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                  type === 'url'
                    ? 'bg-ind-accent text-black'
                    : 'bg-ind-bg text-ind-text hover:bg-ind-border'
                }`}
              >
                <LinkIcon className="w-4 h-4 inline mr-1" />
                URL
              </button>
            </div>
          </div>

          {/* Path/URL Input */}
          <div>
            <label
              htmlFor="path-url-input"
              className="block text-xs font-medium text-ind-text-muted mb-2"
            >
              {type === 'url' ? 'URL' : 'Path'}
            </label>
            <input
              id="path-url-input"
              type="text"
              value={pathOrUrl}
              onChange={(e) => setPathOrUrl(e.target.value)}
              placeholder={
                type === 'url'
                  ? 'https://example.com'
                  : type === 'folder'
                  ? 'C:\\path\\to\\folder'
                  : 'C:\\path\\to\\file.ext'
              }
              className="w-full px-3 py-2 bg-ind-bg border-2 border-ind-border text-ind-text placeholder:text-ind-text-muted focus:border-ind-accent outline-none transition-colors"
            />
          </div>

          {/* Display Name Input */}
          <div>
            <label
              htmlFor="display-name-input"
              className="block text-xs font-medium text-ind-text-muted mb-2"
            >
              Display Name
            </label>
            <input
              id="display-name-input"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="My File / My Link"
              className="w-full px-3 py-2 bg-ind-bg border-2 border-ind-border text-ind-text placeholder:text-ind-text-muted focus:border-ind-accent outline-none transition-colors"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2 bg-red-500/10 border border-red-500/30">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 px-4 py-2 bg-ind-accent hover:bg-ind-accent-hover text-black font-medium text-sm transition-colors"
            >
              Add
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-ind-border hover:bg-ind-text hover:text-ind-bg text-ind-text font-medium text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

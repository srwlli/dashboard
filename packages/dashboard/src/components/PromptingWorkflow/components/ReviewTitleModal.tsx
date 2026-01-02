'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ReviewTitleModalProps {
  isOpen: boolean;
  onConfirm: (title: string) => void;
  onClose: () => void;
}

/**
 * Modal to collect review title for CODEREF_ECOSYSTEM_REVIEW exports
 * Appears when user clicks export for key '0004' prompt
 */
export const ReviewTitleModal: React.FC<ReviewTitleModalProps> = ({
  isOpen,
  onConfirm,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    // Validate title
    if (!title.trim()) {
      setError('Review title is required');
      return;
    }

    // Validate format (alphanumeric, hyphens, underscores only)
    if (!/^[a-zA-Z0-9_-]+$/.test(title)) {
      setError('Use only letters, numbers, hyphens, and underscores');
      return;
    }

    onConfirm(title.trim());
    setTitle(''); // Reset for next time
    setError('');
  };

  const handleCancel = () => {
    setTitle('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-ind-panel border-2 border-ind-accent p-8 max-w-2xl w-full mx-4 relative">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-ind-accent"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-ind-accent"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-ind-accent"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-ind-accent"></div>

        {/* Close button */}
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 text-ind-text-muted hover:text-ind-text transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-ind-text mb-2">
              Enter Review Title
            </h3>
            <p className="text-xs text-ind-text-muted font-mono">
              This title organizes multi-agent reviews in: <code className="bg-ind-bg px-1">coderef/reviews/[title]/</code>
            </p>
          </div>

          <div>
            <label htmlFor="review-title" className="block text-sm text-ind-text-muted mb-2 font-mono">
              Review Title *
            </label>
            <input
              id="review-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError(''); // Clear error on change
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Q1-2026-Documentation-Review"
              className="w-full px-4 py-2 bg-ind-bg border border-ind-border text-ind-text placeholder-ind-text-muted focus:border-ind-accent focus:outline-none font-mono text-sm"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-xs text-red-500 font-mono">{error}</p>
            )}
          </div>

          <div className="bg-ind-bg border border-ind-border border-dashed p-4">
            <p className="text-xs text-ind-text-muted mb-2 font-bold">Examples:</p>
            <ul className="text-xs text-ind-text-muted space-y-1 font-mono">
              <li>• <code>Q1-2026-Documentation-Review</code></li>
              <li>• <code>Workflow-Audit-January-2026</code></li>
              <li>• <code>Integration-Standards-Review</code></li>
            </ul>
          </div>

          <div className="bg-ind-bg border border-ind-border border-dashed p-4">
            <p className="text-xs text-ind-text font-bold mb-2">📁 Folder Structure</p>
            <pre className="text-xs text-ind-text-muted font-mono">
{`coderef/reviews/[your-title]/
  ├── prompt.json           (Original prompt + metadata)
  └── responses/
      ├── agent-1.json      (Agent 1's analysis)
      ├── agent-2.json      (Agent 2's analysis)
      └── agent-3.json      (Agent 3's analysis)`}
            </pre>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-ind-accent text-black font-bold uppercase tracking-wider text-sm hover:bg-ind-accent-hover transition-colors active:translate-y-0.5"
            >
              Continue with Export
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-3 border-2 border-ind-border text-ind-text font-bold uppercase tracking-wider text-sm hover:border-ind-accent transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

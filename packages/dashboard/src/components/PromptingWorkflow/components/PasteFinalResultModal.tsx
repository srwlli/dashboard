import React, { useState, useEffect, useCallback } from 'react';
import { estimateTokens, formatTokenCount } from '../utils/tokenEstimator';
import { useClipboard } from '../hooks/useClipboard';

interface PasteFinalResultModalProps {
  isOpen: boolean;
  onResultSaved: (result: string) => void;
  onClose: () => void;
}

export const PasteFinalResultModal: React.FC<PasteFinalResultModalProps> = ({
  isOpen,
  onResultSaved,
  onClose,
}) => {
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { read: readClipboard } = useClipboard();

  // Auto-detect clipboard on modal open
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      readClipboard().then((clipboardText) => {
        if (clipboardText) {
          setResult(clipboardText);
        }
        setIsLoading(false);
      });
    }
  }, [isOpen, readClipboard]);

  const handleSave = useCallback(() => {
    if (!result.trim()) {
      alert('Please paste or enter the LLM result');
      return;
    }

    onResultSaved(result);
    setResult('');
    onClose();
  }, [result, onResultSaved, onClose]);

  const handleClose = useCallback(() => {
    setResult('');
    onClose();
  }, [onClose]);

  const tokenCount = estimateTokens(result);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleClose}>
      <div className="bg-ind-panel border border-ind-border rounded max-w-md w-full mx-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-ind-border">
          <h2 className="text-lg font-bold text-ind-text">Paste Final LLM Result</h2>
          <button
            className="text-ind-text-muted hover:text-ind-text cursor-pointer transition-colors"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-ind-text-muted">
            Paste the LLM response below to complete your workflow. This will be saved with all
            attachments and prompts.
          </p>

          <div className="space-y-2">
            <label className="text-sm font-bold text-ind-text uppercase tracking-wider">LLM Response</label>
            <textarea
              className="w-full bg-ind-bg border border-ind-border rounded p-3 text-ind-text text-sm placeholder-ind-text-muted focus:outline-none focus:ring-2 focus:ring-ind-accent disabled:opacity-50"
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="Paste the LLM response here..."
              disabled={isLoading}
              rows={8}
            />
            <p className="text-xs text-ind-text-muted">
              {result.length > 0
                ? `${result.length} characters (~${formatTokenCount(tokenCount)} tokens)`
                : 'Paste the LLM response here'}
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
            onClick={handleSave}
            disabled={isLoading || !result.trim()}
          >
            {isLoading ? '⟳ Loading...' : 'Save Workflow'}
          </button>
        </div>
      </div>
    </div>
  );
};

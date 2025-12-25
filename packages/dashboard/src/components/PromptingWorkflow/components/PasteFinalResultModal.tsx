import React, { useState, useEffect, useCallback } from 'react';
import { estimateTokens, formatTokenCount } from '../utils/tokenEstimator';
import { useClipboard } from '../hooks/useClipboard';
import styles from './PasteFinalResultModal.module.css';

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
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Paste Final LLM Result</h2>
          <button className={styles.closeButton} onClick={handleClose}>
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <p className={styles.description}>
            Paste the LLM response below to complete your workflow. This will be saved with all
            attachments and prompts.
          </p>

          <div className={styles.formGroup}>
            <label className={styles.label}>LLM Response</label>
            <textarea
              className={styles.textarea}
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="Paste the LLM response here..."
              disabled={isLoading}
            />
            <p className={styles.hint}>
              {result.length > 0
                ? `${result.length} characters (~${formatTokenCount(tokenCount)} tokens)`
                : 'Paste the LLM response here'}
            </p>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={handleClose}>
            Cancel
          </button>
          <button
            className={styles.saveButton}
            onClick={handleSave}
            disabled={isLoading || !result.trim()}
          >
            {isLoading ? 'Loading...' : 'Save Workflow'}
          </button>
        </div>
      </div>
    </div>
  );
};

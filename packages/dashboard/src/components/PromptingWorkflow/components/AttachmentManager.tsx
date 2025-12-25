import React, { useState, useCallback } from 'react';
import { Attachment } from '../types';
import { AttachmentDropZone } from './AttachmentDropZone';
import { PasteTextModal } from './PasteTextModal';
import { formatTokenCount } from '../utils/tokenEstimator';
import styles from './AttachmentManager.module.css';

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
  const [showPasteModal, setShowPasteModal] = useState(false);

  const existingFilenames = attachments.map((a) => a.filename);

  const handleTextAdded = useCallback(
    (attachment: Attachment) => {
      onAddAttachments([attachment]);
    },
    [onAddAttachments]
  );

  const totalSize = attachments.reduce((sum, a) => sum + a.size, 0);
  const totalTokens = Math.ceil(
    attachments.reduce((sum, a) => sum + (a.content?.length || 0), 0) / 4
  );

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Attachments</h2>

      <AttachmentDropZone onFilesAdded={onAddAttachments} disabled={false} />

      <div className={styles.actions}>
        <button
          className={styles.pasteButton}
          onClick={() => setShowPasteModal(true)}
          type="button"
        >
          + Paste Text
        </button>
        {attachments.length > 0 && (
          <button className={styles.clearButton} onClick={onClearAll} type="button">
            Clear All
          </button>
        )}
      </div>

      {attachments.length > 0 && (
        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Files:</span>
            <span className={styles.summaryValue}>{attachments.length}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Size:</span>
            <span className={styles.summaryValue}>
              {(totalSize / 1024).toFixed(1)} KB
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Tokens:</span>
            <span className={styles.summaryValue}>
              {formatTokenCount(totalTokens)}
            </span>
          </div>
        </div>
      )}

      {attachments.length > 0 && (
        <div className={styles.attachmentList}>
          <h3 className={styles.listTitle}>Attached Files</h3>
          {attachments.map((attachment) => (
            <div key={attachment.id} className={styles.attachmentItem}>
              <div className={styles.attachmentHeader}>
                <span className={styles.attachmentIcon}>
                  {attachment.type === 'IMAGE' ? '🖼️' : '📄'}
                </span>
                <div className={styles.attachmentInfo}>
                  <p className={styles.attachmentName}>{attachment.filename}</p>
                  <p className={styles.attachmentMeta}>
                    {(attachment.size / 1024).toFixed(1)} KB
                    {attachment.language && ` • ${attachment.language}`}
                  </p>
                </div>
                <button
                  className={styles.removeButton}
                  onClick={() => onRemoveAttachment(attachment.id)}
                  title="Remove attachment"
                >
                  ✕
                </button>
              </div>
              {attachment.preview && (
                <div className={styles.attachmentPreview}>
                  <p>{attachment.preview}...</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <PasteTextModal
        isOpen={showPasteModal}
        existingFilenames={existingFilenames}
        onTextAdded={handleTextAdded}
        onClose={() => setShowPasteModal(false)}
      />
    </div>
  );
};

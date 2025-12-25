import React, { useMemo } from 'react';
import { Attachment, PreloadedPrompt } from '../types';
import {
  calculateTotalTokens,
  estimatePromptTokens,
  estimateTokens,
  formatTokenCount,
  getTokenWarning,
} from '../utils/tokenEstimator';
import styles from './WorkflowMeta.module.css';

interface WorkflowMetaProps {
  prompt?: PreloadedPrompt;
  attachments: Attachment[];
}

/**
 * WorkflowMeta - Display metadata and statistics about the workflow
 * Shows token counts, file sizes, languages, and warnings
 */
export const WorkflowMeta: React.FC<WorkflowMetaProps> = ({ prompt, attachments }) => {
  const metadata = useMemo(() => {
    const promptTokens = prompt ? estimatePromptTokens(prompt.text) : 0;
    const attachmentTokens = attachments.map((a) => estimateTokens(a.content || ''));
    const totalTokens = calculateTotalTokens(promptTokens, attachmentTokens);

    const languages = new Set<string>();
    attachments.forEach((a) => {
      if (a.language) languages.add(a.language);
    });

    const totalSize = attachments.reduce((sum, a) => sum + a.size, 0);
    const fileTypes = new Set<string>();
    attachments.forEach((a) => {
      fileTypes.add(a.type);
    });

    return {
      promptTokens,
      attachmentTokens,
      totalTokens,
      languages: Array.from(languages),
      totalSize,
      fileTypes: Array.from(fileTypes),
      warning: getTokenWarning(totalTokens),
    };
  }, [prompt, attachments]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Workflow Summary</h2>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Prompt</h3>
          {prompt ? (
            <div className={styles.promptInfo}>
              <p className={styles.promptLabel}>{prompt.label}</p>
              <p className={styles.promptTokens}>
                {formatTokenCount(metadata.promptTokens)} tokens
              </p>
            </div>
          ) : (
            <p className={styles.empty}>No prompt selected</p>
          )}
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Attachments</h3>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Files:</span>
              <span className={styles.statValue}>{attachments.length}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Size:</span>
              <span className={styles.statValue}>
                {metadata.totalSize > 0 ? (metadata.totalSize / 1024).toFixed(1) + ' KB' : '0 KB'}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Total Tokens</h3>
          <p className={`${styles.tokenCount} ${metadata.warning ? styles.warning : ''}`}>
            {formatTokenCount(metadata.totalTokens)}
          </p>
          <p className={styles.tokenBreakdown}>
            Prompt: {formatTokenCount(metadata.promptTokens)} + Attachments:{' '}
            {formatTokenCount(
              metadata.attachmentTokens.reduce((sum, t) => sum + t, 0)
            )}
          </p>
        </div>
      </div>

      {metadata.languages.length > 0 && (
        <div className={styles.languages}>
          <h3 className={styles.sectionTitle}>Languages Detected</h3>
          <div className={styles.languageBadges}>
            {metadata.languages.map((lang) => (
              <span key={lang} className={styles.languageBadge}>
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}

      {metadata.fileTypes.length > 0 && (
        <div className={styles.fileTypes}>
          <h3 className={styles.sectionTitle}>File Types</h3>
          <div className={styles.fileTypeBadges}>
            {metadata.fileTypes.map((type) => (
              <span key={type} className={styles.fileTypeBadge}>
                {type}
              </span>
            ))}
          </div>
        </div>
      )}

      {metadata.warning && (
        <div className={styles.warningBox}>
          <p className={styles.warningText}>⚠️ {metadata.warning}</p>
          <p className={styles.warningHint}>Consider splitting large files or removing some attachments</p>
        </div>
      )}

      {attachments.length === 0 && !prompt && (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>Select a prompt and add attachments to see metadata</p>
        </div>
      )}
    </div>
  );
};

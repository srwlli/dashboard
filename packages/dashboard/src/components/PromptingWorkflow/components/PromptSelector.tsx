import React from 'react';
import { PreloadedPrompt } from '../types';
import { formatTokenCount } from '../utils/tokenEstimator';
import styles from './PromptSelector.module.css';

interface PromptSelectorProps {
  prompts: PreloadedPrompt[];
  selectedPromptKey?: string;
  onSelectPrompt: (prompt: PreloadedPrompt) => void;
}

export const PromptSelector: React.FC<PromptSelectorProps> = ({
  prompts,
  selectedPromptKey,
  onSelectPrompt,
}) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Select Prompt</h2>
      <p className={styles.subtitle}>Choose an analysis workflow</p>

      <div className={styles.promptGrid}>
        {prompts.map((prompt) => (
          <button
            key={prompt.key}
            className={`${styles.promptCard} ${
              selectedPromptKey === prompt.key ? styles.selected : ''
            }`}
            onClick={() => onSelectPrompt(prompt)}
            type="button"
          >
            <div className={styles.promptHeader}>
              <h3 className={styles.promptName}>{prompt.label}</h3>
              <span className={styles.tokenBadge}>
                {formatTokenCount(prompt.estimatedTokens)}
              </span>
            </div>
            <p className={styles.promptDescription}>{prompt.description}</p>
            <div className={styles.promptMeta}>
              <span className={styles.promptKey}>Prompt {prompt.key}</span>
              <span className={styles.tokenCount}>
                ~{prompt.estimatedTokens.toLocaleString()} tokens
              </span>
            </div>
          </button>
        ))}
      </div>

      {selectedPromptKey && (
        <div className={styles.selectedInfo}>
          <p className={styles.selectedText}>
            Selected: <strong>{prompts.find((p) => p.key === selectedPromptKey)?.label}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

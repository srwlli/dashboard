import React, { useMemo } from 'react';
import { Attachment, PreloadedPrompt } from '../types';
import {
  calculateTotalTokens,
  estimatePromptTokens,
  estimateTokens,
  formatTokenCount,
  getTokenWarning,
} from '../utils/tokenEstimator';

interface WorkflowMetaProps {
  prompt?: PreloadedPrompt;
  attachments: Attachment[];
}

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
    <div className="w-full space-y-4">
      <h3 className="text-sm uppercase tracking-widest text-ind-text-muted font-mono font-bold">
        Workflow Summary
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-ind-panel border border-ind-border rounded p-4">
          <h4 className="text-xs uppercase tracking-wider text-ind-text-muted font-bold mb-3">Prompt</h4>
          {prompt ? (
            <div>
              <p className="text-sm font-bold text-ind-text">{prompt.label}</p>
              <p className="text-sm text-ind-accent font-bold mt-1">
                {formatTokenCount(metadata.promptTokens)} tokens
              </p>
            </div>
          ) : (
            <p className="text-xs text-ind-text-muted">No prompt selected</p>
          )}
        </div>

        <div className="bg-ind-panel border border-ind-border rounded p-4">
          <h4 className="text-xs uppercase tracking-wider text-ind-text-muted font-bold mb-3">Attachments</h4>
          <div className="space-y-2">
            <div>
              <span className="text-xs text-ind-text-muted">Files:</span>
              <span className="text-sm font-bold text-ind-accent ml-2">{attachments.length}</span>
            </div>
            <div>
              <span className="text-xs text-ind-text-muted">Size:</span>
              <span className="text-sm font-bold text-ind-accent ml-2">
                {metadata.totalSize > 0 ? (metadata.totalSize / 1024).toFixed(1) + ' KB' : '0 KB'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-ind-panel border border-ind-border rounded p-4">
          <h4 className="text-xs uppercase tracking-wider text-ind-text-muted font-bold mb-3">Total Tokens</h4>
          <p className={`text-2xl font-bold ${metadata.warning ? 'text-red-400' : 'text-ind-accent'}`}>
            {formatTokenCount(metadata.totalTokens)}
          </p>
          <p className="text-xs text-ind-text-muted mt-2">
            Prompt: {formatTokenCount(metadata.promptTokens)} + Attachments:{' '}
            {formatTokenCount(
              metadata.attachmentTokens.reduce((sum, t) => sum + t, 0)
            )}
          </p>
        </div>
      </div>

      {metadata.languages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs uppercase tracking-wider text-ind-text-muted font-bold">Languages Detected</h4>
          <div className="flex gap-2 flex-wrap">
            {metadata.languages.map((lang) => (
              <span
                key={lang}
                className="px-2 py-1 bg-ind-accent text-black text-xs font-bold rounded"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}

      {metadata.fileTypes.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs uppercase tracking-wider text-ind-text-muted font-bold">File Types</h4>
          <div className="flex gap-2 flex-wrap">
            {metadata.fileTypes.map((type) => (
              <span
                key={type}
                className="px-2 py-1 bg-ind-border text-ind-text text-xs font-bold rounded"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      )}

      {metadata.warning && (
        <div className="px-4 py-3 bg-red-900/20 border border-red-600/50 rounded">
          <p className="text-xs text-red-400 font-bold m-0">⚠️ {metadata.warning}</p>
          <p className="text-xs text-red-300 m-0 mt-1">Consider splitting large files or removing some attachments</p>
        </div>
      )}

      {attachments.length === 0 && !prompt && (
        <div className="text-center py-6">
          <p className="text-xs text-ind-text-muted">Select a prompt and add attachments to see metadata</p>
        </div>
      )}
    </div>
  );
};

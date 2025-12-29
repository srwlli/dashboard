import React, { useState, useCallback } from 'react';
import { PromptSelector } from './PromptSelector';
import { AttachmentManager } from './AttachmentManager';
import { WorkflowMeta } from './WorkflowMeta';
import { ExportMenu } from './ExportMenu';
import { PasteFinalResultModal } from './PasteFinalResultModal';
import { useWorkflow } from '@/contexts/WorkflowContext';
import { useClipboard } from '../hooks/useClipboard';
import { useFileHandlers } from '../hooks/useFileHandlers';
import { getAllPrompts } from '../utils/prompts';
import { generateJSON, generateMarkdown } from '../utils/exportFormatter';

/**
 * PromptingWorkflow - Main widget container
 * Orchestrates entire workflow: prompt selection → attachments → export → save
 */
export const PromptingWorkflow: React.FC = () => {
  const prompts = getAllPrompts();
  const {
    workflow,
    setSelectedPrompt,
    addAttachments,
    removeAttachment,
    clearAttachments,
    setFinalResult,
  } = useWorkflow();
  const { write: copyToClipboard } = useClipboard();
  const { selectDirectory } = useFileHandlers();
  const [showPasteFinalResult, setShowPasteFinalResult] = useState(false);

  // Validate workflow ready for export
  const isReadyForExport = workflow.selectedPrompt && workflow.attachments.length > 0;

  const handleCopyJSON = useCallback(async () => {
    if (!isReadyForExport) {
      alert('Please select a prompt and add attachments');
      return;
    }

    const json = generateJSON(workflow);
    const success = await copyToClipboard(json);
    if (!success) {
      throw new Error('Failed to copy to clipboard');
    }
  }, [workflow, isReadyForExport, copyToClipboard]);

  const handleExportJSON = useCallback(async () => {
    if (!isReadyForExport) {
      alert('Please select a prompt and add attachments');
      return;
    }

    const directory = await selectDirectory();
    if (!directory) return;

    const json = generateJSON(workflow);
    const filename = `workflow_${workflow.selectedPrompt?.name}_${Date.now()}.json`;

    // In a real implementation, use CodeRefCore.api.storage to save
    console.log(`Would save to: ${directory}/${filename}`);
    console.log('JSON:', json);

    // For now, trigger browser download fallback
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [workflow, isReadyForExport, selectDirectory]);

  const handleExportMarkdown = useCallback(async () => {
    if (!isReadyForExport) {
      alert('Please select a prompt and add attachments');
      return;
    }

    const directory = await selectDirectory();
    if (!directory) return;

    const markdown = generateMarkdown(workflow);
    const filename = `workflow_${workflow.selectedPrompt?.name}_${Date.now()}.md`;

    // In a real implementation, use CodeRefCore.api.storage to save
    console.log(`Would save to: ${directory}/${filename}`);
    console.log('Markdown:', markdown);

    // For now, trigger browser download fallback
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [workflow, isReadyForExport, selectDirectory]);

  const handleFinalResultSaved = useCallback(
    async (result: string) => {
      setFinalResult(result);

      // Optionally save workflow to browser storage or user-selected directory
      const shouldSaveWorkflow = confirm(
        'Save this workflow to local storage for later retrieval?'
      );
      if (shouldSaveWorkflow) {
        const directory = await selectDirectory();
        if (directory) {
          const json = generateJSON({ ...workflow, finalResult: result });
          const filename = `session_${Date.now()}.json`;
          console.log(`Would save to: ${directory}/${filename}`);

          // Trigger browser download
          const blob = new Blob([json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }
    },
    [workflow, setFinalResult, selectDirectory]
  );

  return (
    <div className="w-full space-y-6">
      <div className="bg-ind-panel border-2 border-ind-border p-8 relative">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-ind-accent"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-ind-accent"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-ind-accent"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-ind-accent"></div>

        <div className="space-y-6">
          {/* Prompt Selection */}
          <PromptSelector
            prompts={prompts}
            selectedPromptKey={workflow.selectedPrompt?.key}
            onSelectPrompt={setSelectedPrompt}
          />

          {/* Attachment Management */}
          <AttachmentManager
            attachments={workflow.attachments}
            onAddAttachments={addAttachments}
            onRemoveAttachment={removeAttachment}
            onClearAll={clearAttachments}
          />

          {/* Workflow Metadata */}
          <WorkflowMeta prompt={workflow.selectedPrompt} attachments={workflow.attachments} />

          {/* Export Actions */}
          <div className="border-t border-ind-border pt-6">
            <h3 className="text-sm uppercase tracking-widest text-ind-text-muted font-mono mb-4 font-bold">
              Export
            </h3>
            <ExportMenu
              onCopyJSON={handleCopyJSON}
              onExportJSON={handleExportJSON}
              onExportMarkdown={handleExportMarkdown}
              disabled={!isReadyForExport}
            />

            {!isReadyForExport && (
              <p className="mt-4 px-4 py-3 bg-ind-bg border border-ind-border border-dashed rounded text-ind-text-muted text-xs">
                ⚠️ Select a prompt and add at least one attachment to enable export
              </p>
            )}

            {isReadyForExport && (
              <button
                className="mt-4 px-4 py-2 bg-ind-accent text-black font-bold uppercase tracking-wider text-sm hover:bg-ind-accent-hover transition-colors active:translate-y-0.5"
                onClick={() => setShowPasteFinalResult(true)}
              >
                📝 Paste Final LLM Result
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Paste Final Result Modal */}
      <PasteFinalResultModal
        isOpen={showPasteFinalResult}
        onResultSaved={handleFinalResultSaved}
        onClose={() => setShowPasteFinalResult(false)}
      />
    </div>
  );
};

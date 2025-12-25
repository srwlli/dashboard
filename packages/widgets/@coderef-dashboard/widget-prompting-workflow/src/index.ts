/**
 * Prompting Workflow Widget - Main Entry Point
 *
 * This widget enables users to:
 * 1. Select from 3 preloaded LLM prompts (Code Review, Synthesize, Consolidate)
 * 2. Attach code/text files via drag & drop or paste
 * 3. View comprehensive metadata (tokens, files, languages)
 * 4. Copy JSON to clipboard for LLM consumption
 * 5. Export as .json or .md files
 * 6. Paste final LLM result and save workflow
 */

import React from 'react';
import { PromptingWorkflow } from './components/PromptingWorkflow';

/**
 * IScriptboardWidget interface
 * Defines the contract for all dashboard widgets
 */
interface IScriptboardWidget {
  id: string;
  name: string;
  version: string;
  description?: string;
  settings?: Record<string, any>;
  render(): React.ReactNode;
  onEnable?(): Promise<void>;
  onDisable?(): Promise<void>;
  onSettingsChange?(settings: any): Promise<void>;
  onError?(error: Error): boolean;
}

// Export all components
export { PromptingWorkflow } from './components/PromptingWorkflow';
export { PromptSelector } from './components/PromptSelector';
export { AttachmentDropZone } from './components/AttachmentDropZone';
export { AttachmentManager } from './components/AttachmentManager';
export { PasteTextModal } from './components/PasteTextModal';
export { WorkflowMeta } from './components/WorkflowMeta';
export { ExportMenu } from './components/ExportMenu';
export { PasteFinalResultModal } from './components/PasteFinalResultModal';

// Export all types
export type { Attachment, PreloadedPrompt, Workflow, WorkflowSession, WorkflowExport } from './types';

// Export all utilities
export { readFileContent } from './utils/fileContentExtractor';
export { languageMap, getLanguage } from './utils/languageMap';
export {
  estimateTokens,
  estimatePromptTokens,
  calculateTotalTokens,
  formatTokenCount,
  shouldWarnTokens,
  getTokenWarning,
} from './utils/tokenEstimator';
export { generateClipboardFilename, generateUniqueFilename, getNextClipboardNumber } from './utils/filenameGenerator';
export { PRELOADED_PROMPTS, getPrompt, getAllPrompts } from './utils/prompts';
export { generateJSON, generateMarkdown } from './utils/exportFormatter';

// Export all hooks
export { useWorkflow } from './hooks/useWorkflow';
export { useClipboard } from './hooks/useClipboard';
export { useFileHandlers } from './hooks/useFileHandlers';

/**
 * Widget implementation for dashboard integration
 * Implements IScriptboardWidget interface required by the widget loader
 */
const PromptingWorkflowWidget: IScriptboardWidget = {
  id: 'prompting-workflow',
  name: 'Prompting Workflow',
  version: '1.0.0',
  description: 'LLM prompting workflow with file attachments, metadata display, and export functionality',

  render(): React.ReactNode {
    return React.createElement(PromptingWorkflow);
  },

  async onEnable(): Promise<void> {
    // Initialize widget resources if needed
    console.log('Prompting Workflow Widget enabled');
  },

  async onDisable(): Promise<void> {
    // Clean up resources
    console.log('Prompting Workflow Widget disabled');
  },

  onError(error: Error): boolean {
    // Log widget errors
    console.error('Prompting Workflow Widget error:', error);
    return true; // Return true to suppress error propagation
  },
};

export default PromptingWorkflowWidget;

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

// Widget registration for dashboard integration
declare global {
  interface Window {
    ScriptboardWidgets?: {
      registerWidget(name: string, component: any): void;
    };
  }
}

// Auto-register widget if ScriptboardWidgets available
if (typeof window !== 'undefined' && window.ScriptboardWidgets) {
  window.ScriptboardWidgets.registerWidget('prompting-workflow', PromptingWorkflow);
}

import { Workflow, WorkflowExport } from '../types';
import { estimateTokens } from './tokenEstimator';

/**
 * Generate structured JSON export for workflow
 * Includes prompt, attachments with content, and metadata
 * Optimized for agent consumption
 */
export function generateJSON(workflow: Workflow): string {
  if (!workflow.selectedPrompt || workflow.attachments.length === 0) {
    throw new Error('Cannot export: missing prompt or attachments');
  }

  const promptTokens = estimateTokens(workflow.selectedPrompt.text);
  const attachmentTokensPerFile: Record<string, number> = {};
  let totalAttachmentTokens = 0;

  const exportAttachments = workflow.attachments.map((attachment) => {
    const tokens = estimateTokens(attachment.content || '');
    attachmentTokensPerFile[attachment.filename] = tokens;
    totalAttachmentTokens += tokens;

    return {
      id: attachment.id,
      filename: attachment.filename,
      type: attachment.type,
      extension: attachment.extension,
      language: attachment.language,
      size: attachment.size,
      content: attachment.content || '',
    };
  });

  const totalTokens = promptTokens + totalAttachmentTokens;

  const exportData: WorkflowExport = {
    session_id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    generated_at: new Date().toISOString(),
    prompt: workflow.selectedPrompt,
    attachments: exportAttachments,
    metadata: {
      total_tokens: totalTokens,
      estimated_tokens_per_file: attachmentTokensPerFile,
      file_count: workflow.attachments.length,
      attachment_types: Array.from(new Set(workflow.attachments.map((a) => a.type))),
      created_at: new Date().toISOString(),
      user_instructions: 'Add your analysis and suggestions below this prompt and attachments',
    },
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Generate human-readable Markdown export for workflow
 * Includes prompt text and code blocks for each attachment
 */
export function generateMarkdown(workflow: Workflow): string {
  if (!workflow.selectedPrompt || workflow.attachments.length === 0) {
    throw new Error('Cannot export: missing prompt or attachments');
  }

  let markdown = `# ${workflow.selectedPrompt.label} Workflow\n\n`;

  // Prompt section
  markdown += `## Prompt\n\n`;
  markdown += `**Task:** ${workflow.selectedPrompt.name}\n`;
  markdown += `**Estimated Tokens:** ~${estimateTokens(workflow.selectedPrompt.text).toLocaleString()}\n\n`;
  markdown += `${workflow.selectedPrompt.text}\n\n`;

  // Attachments section
  markdown += `## Attachments\n\n`;

  workflow.attachments.forEach((attachment) => {
    const sizeKB = (attachment.size / 1024).toFixed(1);
    markdown += `### ${attachment.filename} (${sizeKB}KB)\n\n`;

    if (attachment.isBinary) {
      markdown += `> Binary file - content cannot be embedded in markdown\n\n`;
    } else if (attachment.content) {
      const language = attachment.language || 'plaintext';
      markdown += `\`\`\`${language}\n`;
      markdown += `${attachment.content}\n`;
      markdown += `\`\`\`\n\n`;
    } else {
      markdown += `> [File content not extracted]\n\n`;
    }
  });

  // Metadata section
  const totalTokens = workflow.attachments.reduce((sum, a) => sum + estimateTokens(a.content || ''), 0) +
    estimateTokens(workflow.selectedPrompt.text);

  markdown += `## Metadata\n\n`;
  markdown += `- **Task:** ${workflow.selectedPrompt.name}\n`;
  markdown += `- **Files:** ${workflow.attachments.length}\n`;
  markdown += `- **Total Tokens:** ~${totalTokens.toLocaleString()}\n`;
  markdown += `- **Created:** ${new Date().toLocaleString()}\n`;
  markdown += `- **Languages:** ${Array.from(new Set(workflow.attachments.map((a) => a.language).filter(Boolean))).join(', ') || 'N/A'}\n\n`;

  // Instructions
  markdown += `## Instructions for LLM\n\n`;
  markdown += `1. Review the prompt above to understand the task\n`;
  markdown += `2. Analyze the attached files in the Attachments section\n`;
  markdown += `3. Provide your analysis below\n\n`;

  markdown += `---\n\n`;
  markdown += `## Your Analysis\n\n`;
  markdown += `[Add your analysis and suggestions here]\n`;

  return markdown;
}

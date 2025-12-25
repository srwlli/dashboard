/**
 * Estimate token count from text content
 * Uses conservative formula: char_count / 4 ≈ tokens (±15% accuracy)
 * Most LLMs tokenize at roughly 1 token per 4 characters
 */
export function estimateTokens(content: string): number {
  if (!content) return 0;
  return Math.ceil(content.length / 4);
}

/**
 * Estimate tokens for a prompt and its estimated size
 */
export function estimatePromptTokens(promptText: string): number {
  return estimateTokens(promptText);
}

/**
 * Calculate total token count for workflow
 */
export function calculateTotalTokens(promptTokens: number, attachmentTokens: number[]): number {
  const attachmentTotal = attachmentTokens.reduce((sum, tokens) => sum + tokens, 0);
  return promptTokens + attachmentTotal;
}

/**
 * Format token count for display
 */
export function formatTokenCount(tokens: number): string {
  if (tokens < 1000) {
    return `~${tokens}`;
  } else if (tokens < 1000000) {
    return `~${(tokens / 1000).toFixed(1)}K`;
  } else {
    return `~${(tokens / 1000000).toFixed(1)}M`;
  }
}

/**
 * Check if token count exceeds warning threshold
 */
export function shouldWarnTokens(tokens: number): boolean {
  return tokens > 100000;
}

/**
 * Get warning message for token count
 */
export function getTokenWarning(tokens: number): string | null {
  if (tokens > 150000) {
    return `⚠️ Token count ${formatTokenCount(tokens)} exceeds recommended limit (100K). LLM may struggle with this context.`;
  }
  if (tokens > 100000) {
    return `⚠️ Token count ${formatTokenCount(tokens)} exceeds recommended limit (100K). Consider splitting attachments.`;
  }
  return null;
}

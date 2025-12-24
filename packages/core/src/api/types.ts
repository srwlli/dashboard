/**
 * API Types for CodeRef Dashboard
 */

export interface Session {
  prompt_source: string | null;
  has_prompt: boolean;
  attachment_count: number;
  response_count: number;
}

export interface Attachment {
  id: string;
  filename: string;
  lines: number;
  binary: boolean;
}

export interface PreloadedPrompt {
  key: string;
  label: string;
  preview: string;
}

export interface Response {
  id: string;
  content: string;
  char_count: number;
  created_at: string;
}

export interface Config {
  llm_urls: Array<{ label: string; url: string }>;
}

export interface ExportResult {
  text: string;
}

export interface PromptSummary {
  count: number;
  char_count: number;
}

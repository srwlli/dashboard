/**
 * API Client for CodeRef Dashboard
 * Interfaces with backend services
 */

import type {
  Session,
  Attachment,
  PreloadedPrompt,
  Response,
  Config,
  ExportResult,
  PromptSummary
} from './types';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // ============================================
  // Session
  // ============================================
  async getSession(): Promise<Session> {
    return apiCall('/api/session');
  },

  async setPrompt(content: string): Promise<void> {
    return apiCall('/api/prompt', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  async clearPrompt(): Promise<void> {
    return apiCall('/api/prompt', { method: 'DELETE' });
  },

  // ============================================
  // Attachments
  // ============================================
  async listAttachments(): Promise<Attachment[]> {
    return apiCall('/api/attachments');
  },

  async addAttachmentText(content: string, filename: string): Promise<Attachment> {
    return apiCall('/api/attachments/text', {
      method: 'POST',
      body: JSON.stringify({ content, filename }),
    });
  },

  async clearAttachments(): Promise<void> {
    return apiCall('/api/attachments', { method: 'DELETE' });
  },

  // ============================================
  // Responses
  // ============================================
  async addResponse(content: string): Promise<Response> {
    return apiCall('/api/responses', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  async getResponsesSummary(): Promise<PromptSummary> {
    return apiCall('/api/responses/summary');
  },

  async clearResponses(): Promise<void> {
    return apiCall('/api/responses', { method: 'DELETE' });
  },

  // ============================================
  // Preloaded Prompts
  // ============================================
  async getPreloadedPrompts(): Promise<{ prompts: PreloadedPrompt[] }> {
    return apiCall('/api/prompts/preloaded');
  },

  async usePreloadedPrompt(key: string): Promise<void> {
    return apiCall(`/api/prompts/preloaded/${key}`, { method: 'POST' });
  },

  async addPreloadedPrompt(label: string, text: string): Promise<PreloadedPrompt> {
    return apiCall('/api/prompts/preloaded', {
      method: 'POST',
      body: JSON.stringify({ label, text }),
    });
  },

  // ============================================
  // Export
  // ============================================
  async exportLlmFriendly(): Promise<ExportResult> {
    return apiCall('/api/export/llm-friendly');
  },

  async exportLlmFriendlyPrompt(): Promise<ExportResult> {
    return apiCall('/api/export/llm-friendly/prompt');
  },

  async exportLlmFriendlyAttachments(): Promise<ExportResult> {
    return apiCall('/api/export/llm-friendly/attachments');
  },

  async exportLlmFriendlyResponses(): Promise<ExportResult> {
    return apiCall('/api/export/llm-friendly/responses');
  },

  // ============================================
  // Config
  // ============================================
  async getConfig(): Promise<Config> {
    return apiCall('/api/config');
  },
};

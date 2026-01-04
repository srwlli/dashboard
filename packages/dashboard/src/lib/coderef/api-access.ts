/**
 * CodeRef API Access Utilities
 *
 * Client-side fetch wrappers for CodeRef API endpoints
 * Provides type-safe API calls with error handling
 */

import type { TreeNode } from '@/app/api/coderef/tree/route';
import type { FileData } from '@/app/api/coderef/file/route';
import type { CodeRefProject } from '@/app/api/coderef/projects/route';
import type { ElementData } from '@coderef/core';

/**
 * API response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
}

/**
 * API error class
 */
export class ApiError extends Error {
  code: string;
  details?: Record<string, any>;

  constructor(code: string, message: string, details?: Record<string, any>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Fetch wrapper with error handling
 */
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data: ApiResponse<T> = await response.json();

    if (!data.success) {
      throw new ApiError(
        data.error?.code || 'UNKNOWN_ERROR',
        data.error?.message || 'Unknown error occurred',
        data.error?.details
      );
    }

    return data.data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('NETWORK_ERROR', (error as Error).message);
  }
}

/**
 * Project API calls
 */
export const ProjectsApi = {
  /**
   * Get all registered projects
   */
  async list(): Promise<{ projects: CodeRefProject[]; total: number }> {
    return apiFetch('/api/coderef/projects');
  },

  /**
   * Register a new project
   */
  async create(project: {
    id: string;
    name: string;
    path: string;
  }): Promise<{ project: CodeRefProject; updated: boolean }> {
    return apiFetch('/api/coderef/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  },

  /**
   * Remove a project by ID
   */
  async remove(id: string): Promise<{ removed: CodeRefProject; remaining: number }> {
    return apiFetch(`/api/coderef/projects/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};

/**
 * File tree API calls
 */
export const TreeApi = {
  /**
   * Get directory tree for a project path
   */
  async load(projectPath: string): Promise<{
    path: string;
    tree: TreeNode[];
    total_nodes: number;
  }> {
    const params = new URLSearchParams({ path: projectPath });
    return apiFetch(`/api/coderef/tree?${params.toString()}`);
  },
};

/**
 * File content API calls
 */
export const FileApi = {
  /**
   * Get file content and metadata
   */
  async load(filePath: string): Promise<FileData> {
    const params = new URLSearchParams({ path: filePath });
    return apiFetch(`/api/coderef/file?${params.toString()}`);
  },

  /**
   * Decode file content based on encoding
   */
  decodeContent(fileData: FileData): string {
    if (fileData.encoding === 'base64') {
      // For base64 encoded files, return as-is or decode if needed
      return fileData.content;
    }
    return fileData.content;
  },
};

/**
 * Scan options interface
 */
export interface ScanOptions {
  lang?: string[];
  recursive?: boolean;
  exclude?: string[];
}

/**
 * Scan summary statistics
 */
export interface ScanSummary {
  totalElements: number;
  byType: Record<string, number>;
  byLanguage: Record<string, number>;
  filesScanned: number;
  scanDuration: number;
}

/**
 * Scan result
 */
export interface ScanResult {
  elements: ElementData[];
  summary: ScanSummary;
}

/**
 * Scanner API calls
 */
export const ScanApi = {
  /**
   * Scan project using @coderef/core scanner
   *
   * @param projectPath - Absolute path to project directory
   * @param options - Scanner options (lang, recursive, exclude)
   * @returns Scan results with elements and summary
   */
  async scan(projectPath: string, options?: ScanOptions): Promise<ScanResult> {
    return apiFetch('/api/scan', {
      method: 'POST',
      body: JSON.stringify({ projectPath, options }),
    });
  },
};

/**
 * Note metadata (from /api/coderef/notes)
 */
export interface NoteMetadata {
  name: string;
  path: string;
  size: number;
  modified: string;
  extension: string;
}

/**
 * Notes API calls
 */
export const NotesApi = {
  /**
   * Save note content to file
   * Writes to <projectRoot>/coderef/notes/<filePath>
   */
  async save(projectRoot: string, filePath: string, content: string): Promise<string> {
    const result = await apiFetch<{ success: boolean; path: string; size: number }>(
      '/api/coderef/file',
      {
        method: 'PUT',
        body: JSON.stringify({ projectRoot, filePath, content }),
      }
    );
    return result.path;
  },

  /**
   * List all notes in project
   */
  async list(projectRoot: string): Promise<NoteMetadata[]> {
    const params = new URLSearchParams({ projectRoot });
    const result = await apiFetch<{ notes: NoteMetadata[]; total: number; timestamp: string }>(
      `/api/coderef/notes?${params.toString()}`
    );
    return result.notes;
  },

  /**
   * Delete note file
   */
  async delete(projectRoot: string, filePath: string): Promise<void> {
    await apiFetch<{ success: boolean; deleted: string }>('/api/coderef/file', {
      method: 'DELETE',
      body: JSON.stringify({ projectRoot, filePath }),
    });
  },
};

/**
 * Combined API export
 */
export const CodeRefApi = {
  projects: ProjectsApi,
  tree: TreeApi,
  file: FileApi,
  scan: ScanApi,
  notes: NotesApi,
};

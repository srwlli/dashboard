'use client';

/**
 * FilePicker Component
 *
 * Cross-platform file picker for Open and Save As operations
 * Uses Electron IPC in desktop mode, File System Access API in web mode
 */

import type { FilePickerResult, SaveFileResult } from '../types/notepad';

/**
 * Check if running in Electron environment
 * Verifies both electronAPI exists and has the required file dialog methods
 */
function isElectron(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!(window as any).electronAPI &&
    typeof (window as any).electronAPI.saveFileDialog === 'function' &&
    typeof (window as any).electronAPI.openFileDialog === 'function'
  );
}

/**
 * Open file dialog (cross-platform)
 */
async function openFile(options: {
  title?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
}): Promise<{ content: string; filename: string } | null> {
  if (isElectron()) {
    // Electron file dialog
    try {
      const result = await (window as any).electronAPI.openFileDialog({
        title: options.title || 'Select file',
        filters: options.filters || [{ name: 'All files', extensions: ['*'] }]
      });

      if (result?.filePath && !result.canceled) {
        const fileData = await (window as any).electronAPI.readFile(result.filePath);
        if (fileData.error) {
          throw new Error(fileData.error);
        }
        return { content: fileData.content, filename: fileData.filename || 'file.txt' };
      }
      return null;
    } catch (error) {
      console.error('Electron file dialog error:', error);
      throw error;
    }
  } else {
    // Web file input
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      if (options.filters?.[0]?.extensions) {
        input.accept = options.filters[0].extensions.map(ext => `.${ext}`).join(',');
      }

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          try {
            const content = await file.text();
            resolve({ content, filename: file.name });
          } catch (error) {
            console.error('File read error:', error);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };

      input.click();
    });
  }
}

/**
 * Save file dialog (cross-platform)
 */
async function saveFile(options: {
  content: string;
  suggestedName?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
}): Promise<{ success: boolean; filePath?: string } | null> {
  if (isElectron()) {
    // Electron save dialog
    try {
      const result = await (window as any).electronAPI.saveFileDialog({
        title: 'Save file',
        defaultPath: options.suggestedName || 'untitled.txt',
        filters: options.filters || [{ name: 'All files', extensions: ['*'] }]
      });

      if (result?.filePath && !result.canceled) {
        const writeResult = await (window as any).electronAPI.writeFile({
          filePath: result.filePath,
          content: options.content
        });

        if (writeResult.error) {
          throw new Error(writeResult.error);
        }

        return { success: true, filePath: result.filePath };
      }
      return null;
    } catch (error) {
      console.error('Electron save dialog error:', error);
      throw error;
    }
  } else {
    // Web File System Access API (if available)
    if ('showSaveFilePicker' in window) {
      try {
        // Filter out wildcard extensions (not supported by File System Access API)
        const webFilters = options.filters
          ?.filter(filter => !filter.extensions.includes('*'))
          .map(filter => ({
            description: filter.name,
            accept: {
              'text/plain': filter.extensions.map(ext => `.${ext}`)
            }
          }));

        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: options.suggestedName || 'untitled.txt',
          types: webFilters && webFilters.length > 0 ? webFilters : undefined
        });

        const writable = await fileHandle.createWritable();
        await writable.write(options.content);
        await writable.close();

        return { success: true, filePath: fileHandle.name };
      } catch (error) {
        const errorName = (error as Error).name;

        // User cancelled or permission denied - return null
        if (errorName === 'AbortError') {
          return null; // User cancelled
        }

        // NotAllowedError: Permission denied or blocked by browser
        // Fall through to download fallback instead of throwing
        if (errorName === 'NotAllowedError') {
          console.warn('File System Access API not allowed, using download fallback');
          // Fall through to download fallback below
        } else {
          console.error('File System Access API error:', error);
          throw error;
        }
      }
    }

    // Fallback: Download file (also used when NotAllowedError occurs)
    const blob = new Blob([options.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = options.suggestedName || 'untitled.txt';
    a.click();
    URL.revokeObjectURL(url);

    return { success: true }; // Can't get file path in fallback mode
  }
}

/**
 * File type filter for dialogs
 */
interface FileFilter {
  name: string;
  extensions: string[];
}

/**
 * Default file filters for notepad (30+ file types)
 */
const DEFAULT_FILTERS: FileFilter[] = [
  { name: 'All Supported Files', extensions: ['*'] },
  { name: 'Markdown', extensions: ['md'] },
  { name: 'Text', extensions: ['txt'] },
  { name: 'HTML', extensions: ['html', 'htm'] },
  { name: 'CSS', extensions: ['css', 'scss', 'sass'] },
  { name: 'JavaScript', extensions: ['js', 'jsx'] },
  { name: 'TypeScript', extensions: ['ts', 'tsx'] },
  { name: 'Python', extensions: ['py'] },
  { name: 'JSON', extensions: ['json'] },
  { name: 'YAML', extensions: ['yaml', 'yml'] },
  { name: 'Configuration', extensions: ['toml', 'ini', 'env'] },
  { name: 'XML/SVG', extensions: ['xml', 'svg'] },
  { name: 'SQL', extensions: ['sql'] },
  { name: 'Shell Scripts', extensions: ['sh', 'bash'] },
];

/**
 * FilePicker utility class
 */
export class FilePicker {
  /**
   * Open file picker dialog
   */
  static async openFile(): Promise<FilePickerResult | null> {
    try {
      const result = await openFile({
        title: 'Open File',
        filters: DEFAULT_FILTERS,
      });

      if (!result) {
        return null;
      }

      return {
        filePath: result.filename, // Note: In web mode, this is just filename
        content: result.content,
        filename: result.filename,
      };
    } catch (error) {
      console.error('FilePicker.openFile error:', error);
      throw error;
    }
  }

  /**
   * Save file picker dialog (Save As)
   */
  static async saveFile(content: string, suggestedName?: string): Promise<SaveFileResult | null> {
    try {
      const result = await saveFile({
        content,
        suggestedName: suggestedName || 'untitled.md',
        filters: DEFAULT_FILTERS,
      });

      if (!result) {
        return null;
      }

      return {
        success: result.success,
        filePath: result.filePath,
      };
    } catch (error) {
      console.error('FilePicker.saveFile error:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Check if running in Electron environment
   */
  static isElectron(): boolean {
    return isElectron();
  }

  /**
   * Check if File System Access API is available (web)
   */
  static hasFileSystemAccess(): boolean {
    return typeof window !== 'undefined' && 'showOpenFilePicker' in window;
  }

  /**
   * Get file extension from filename
   */
  static getExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? `.${parts[parts.length - 1]}` : '.txt';
  }

  /**
   * Get display title from file path
   */
  static getTitle(filePath: string | null): string {
    if (!filePath) {
      return 'Untitled';
    }

    const parts = filePath.split(/[\\/]/);
    return parts[parts.length - 1] || 'Untitled';
  }

  /**
   * Validate file size before opening (1MB warning, 10MB hard limit)
   */
  static validateFileSize(size: number): { valid: boolean; warning?: boolean; error?: string } {
    const ONE_MB = 1024 * 1024;
    const TEN_MB = 10 * ONE_MB;

    if (size > TEN_MB) {
      return {
        valid: false,
        error: `File size (${(size / ONE_MB).toFixed(1)} MB) exceeds 10MB limit`,
      };
    }

    if (size > ONE_MB) {
      return {
        valid: true,
        warning: true,
      };
    }

    return { valid: true };
  }
}

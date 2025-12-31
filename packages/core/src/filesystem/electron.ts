/**
 * Electron Filesystem Adapter
 *
 * Uses Node.js fs module for direct filesystem access.
 * No permission prompts, no handle invalidation, paths persist forever!
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import type { FileSystemAdapter, ProjectPath } from './types';

export class ElectronFileSystemAdapter implements FileSystemAdapter {
  readonly platform = 'electron' as const;

  /**
   * Show native folder picker dialog
   * Returns absolute path (e.g., "C:/Users/willh/projects/my-app")
   */
  async selectDirectory(): Promise<ProjectPath | null> {
    try {
      // Use Electron's dialog API
      const { dialog } = require('@electron/remote');

      const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
        title: 'Select Project Folder',
        buttonLabel: 'Select Folder',
      });

      if (result.canceled || result.filePaths.length === 0) {
        console.log('[Electron] User cancelled folder selection');
        return null;
      }

      const absolutePath = result.filePaths[0];
      console.log('[Electron] Selected folder:', absolutePath);

      // Return absolute path - this persists FOREVER in localStorage/projects.json!
      return absolutePath;
    } catch (error) {
      console.error('[Electron] Failed to show folder picker:', error);
      return null;
    }
  }

  /**
   * Check if directory still exists on filesystem
   * No permission checks needed - Electron has full access!
   */
  async isProjectValid(projectId: string, projectPath: string): Promise<boolean> {
    try {
      // Simply check if directory exists
      const stats = await fs.stat(projectPath);
      const isValid = stats.isDirectory();

      if (isValid) {
        console.log(`[Electron] Project ${projectId} is valid:`, projectPath);
      } else {
        console.warn(`[Electron] Path exists but is not a directory:`, projectPath);
      }

      return isValid;
    } catch (error) {
      console.warn(`[Electron] Project ${projectId} not accessible:`, projectPath);
      return false;
    }
  }

  /**
   * Read directory contents
   */
  async readDirectory(projectId: string, projectPath: string): Promise<string[]> {
    try {
      const entries = await fs.readdir(projectPath, { withFileTypes: true });
      const names = entries.map((entry) => entry.name);

      console.log(`[Electron] Read ${names.length} entries from:`, projectPath);
      return names;
    } catch (error) {
      console.error(`[Electron] Failed to read directory:`, projectPath, error);
      throw error;
    }
  }

  /**
   * Read file contents as UTF-8 text
   */
  async readFile(projectId: string, filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      console.log(`[Electron] Read file (${content.length} bytes):`, filePath);
      return content;
    } catch (error) {
      console.error(`[Electron] Failed to read file:`, filePath, error);
      throw error;
    }
  }

  /**
   * Resolve relative path to absolute path
   */
  async resolvePath(
    projectId: string,
    projectPath: string,
    relativePath: string
  ): Promise<string> {
    const absolutePath = path.join(projectPath, relativePath);
    console.log(`[Electron] Resolved path:`, relativePath, '→', absolutePath);
    return absolutePath;
  }

  /**
   * Additional helper: Check if file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Additional helper: List files recursively
   */
  async readDirectoryRecursive(
    projectId: string,
    projectPath: string,
    options?: { maxDepth?: number; exclude?: RegExp[] }
  ): Promise<string[]> {
    const maxDepth = options?.maxDepth ?? 10;
    const exclude = options?.exclude ?? [/node_modules/, /\.git/, /dist/, /build/];

    const files: string[] = [];

    async function walk(dir: string, depth: number) {
      if (depth > maxDepth) return;

      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(projectPath, fullPath);

        // Skip excluded directories
        if (exclude.some((pattern) => pattern.test(relativePath))) {
          continue;
        }

        if (entry.isDirectory()) {
          await walk(fullPath, depth + 1);
        } else {
          files.push(relativePath);
        }
      }
    }

    await walk(projectPath, 0);
    console.log(`[Electron] Found ${files.length} files in:`, projectPath);
    return files;
  }
}

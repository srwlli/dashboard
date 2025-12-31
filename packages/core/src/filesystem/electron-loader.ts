/**
 * Electron Filesystem Adapter Loader
 *
 * Simplified IPC-based loading - no dynamic imports needed!
 * Simply checks if window.electronAPI.fs is available and returns the adapter.
 */

/// <reference path="./electron-types.d.ts" />

import type { FileSystemAdapter } from './types';
import { ElectronFileSystemAdapter } from './electron';

/**
 * Load Electron adapter (IPC-based, no dynamic imports)
 *
 * Checks if window.electronAPI.fs is available, which indicates we're
 * running in Electron with proper IPC bridge set up.
 */
export async function loadElectronAdapter(): Promise<FileSystemAdapter> {
  console.log('🔍 [Electron Loader] Checking for electronAPI.fs...');

  // Check if we're in a browser environment with electronAPI
  if (typeof window === 'undefined') {
    console.error('❌ [Electron Loader] Not in browser environment');
    throw new Error('Cannot load Electron adapter - window not defined');
  }

  // Check if electronAPI.fs is available
  if (!window.electronAPI?.fs) {
    console.error('❌ [Electron Loader] electronAPI.fs not available');
    throw new Error('electronAPI.fs not available - not running in Electron or IPC bridge not set up');
  }

  console.log('✅ [Electron Loader] Successfully loaded Electron adapter (IPC-based)');
  return new ElectronFileSystemAdapter();
}

/**
 * Check if Electron adapter can be loaded (runtime check)
 *
 * Returns true if window.electronAPI.fs is available.
 */
export function canLoadElectronAdapter(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return typeof window.electronAPI?.fs !== 'undefined';
}

/**
 * Electron Filesystem Adapter Loader
 *
 * This module provides a safe way to load the Electron adapter
 * without triggering webpack/Turbopack to bundle it for the browser.
 *
 * The trick: Use eval() to dynamically construct the import statement
 * at runtime, preventing static analysis from detecting the import.
 */

import type { FileSystemAdapter } from './types';

/**
 * Dynamically load Electron adapter at runtime (no build-time bundling)
 *
 * Uses eval() to prevent webpack/Turbopack from detecting the import
 * during static analysis. This ensures Electron modules are never
 * included in browser bundles.
 */
export async function loadElectronAdapter(): Promise<FileSystemAdapter> {
  // Debug logging
  console.log('🔍 [Electron Loader] Attempting to load Electron adapter...');

  // First check if we're actually in Electron
  if (typeof window !== 'undefined') {
    // Browser environment - check for actual Electron environment
    const userAgent = navigator.userAgent.toLowerCase();
    const hasElectronUA = userAgent.includes('electron');
    const hasNodeRequire = typeof (window as any).require === 'function';

    if (!hasElectronUA && !hasNodeRequire) {
      console.error('❌ [Electron Loader] Not in Electron environment (browser detected)');
      throw new Error('Cannot load Electron adapter in browser environment');
    }
  }

  try {
    // Use Function constructor instead of eval for better security
    // This prevents static analysis from detecting the import path
    const importElectron = new Function(
      'return import("./electron")'
    );

    const module = await importElectron();
    console.log('✅ [Electron Loader] Successfully loaded Electron adapter');

    return new module.ElectronFileSystemAdapter();
  } catch (error) {
    console.error('❌ [Electron Loader] Failed to load Electron adapter:', error);
    throw new Error(
      `Failed to load Electron filesystem adapter: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Check if Electron adapter can be loaded (runtime check)
 *
 * Returns true if we're in an Electron environment where the adapter
 * modules are available.
 */
export function canLoadElectronAdapter(): boolean {
  // Check for Electron-specific globals that indicate we can load the adapter
  if (typeof window === 'undefined') {
    return false;
  }

  // Check for Node.js require (Electron exposes this)
  if (typeof (window as any).require !== 'function') {
    return false;
  }

  // Check for Electron in user agent
  const userAgent = navigator.userAgent.toLowerCase();
  if (!userAgent.includes('electron')) {
    return false;
  }

  return true;
}

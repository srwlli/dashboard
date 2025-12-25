import { useState, useCallback } from 'react';

interface FileHandlerStatus {
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for file operations with error handling
 * Uses window.CodeRefCore.utils.fileHandlers when available (Electron)
 * Falls back to HTML file input in browser environments
 */
export function useFileHandlers() {
  const [status, setStatus] = useState<FileHandlerStatus>({
    loading: false,
    error: null,
  });

  /**
   * Open file selection dialog
   * Returns selected files or null if cancelled
   */
  const selectFiles = useCallback(
    async (options?: { multiple?: boolean; accept?: string }): Promise<File[] | null> => {
      setStatus({ loading: true, error: null });

      try {
        // Try CodeRefCore fileHandlers first (Electron support)
        if (window.CodeRefCore?.utils?.fileHandlers?.selectFiles) {
          const files = await window.CodeRefCore.utils.fileHandlers.selectFiles(options);
          setStatus({ loading: false, error: null });
          return files || null;
        }

        // Fallback to HTML file input
        return new Promise((resolve) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.multiple = options?.multiple ?? false;
          if (options?.accept) {
            input.accept = options.accept;
          }

          input.onchange = (e) => {
            const target = e.target as HTMLInputElement;
            const files = target.files ? Array.from(target.files) : null;
            setStatus({ loading: false, error: null });
            resolve(files);
          };

          input.onclick = () => {
            setStatus({ loading: false, error: null });
          };

          input.click();
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to select files';
        setStatus({ loading: false, error: errorMessage });
        return null;
      }
    },
    []
  );

  /**
   * Open directory selection dialog
   * Returns selected directory path or null if cancelled
   */
  const selectDirectory = useCallback(async (): Promise<string | null> => {
    setStatus({ loading: true, error: null });

    try {
      // Try CodeRefCore fileHandlers first (Electron support)
      if (window.CodeRefCore?.utils?.fileHandlers?.selectDirectory) {
        const directory = await window.CodeRefCore.utils.fileHandlers.selectDirectory();
        setStatus({ loading: false, error: null });
        return directory || null;
      }

      // Browser fallback - use showDirectoryPicker if available (Chrome/Edge only)
      if ('showDirectoryPicker' in window) {
        try {
          const dirHandle = await (window as any).showDirectoryPicker();
          setStatus({ loading: false, error: null });
          return dirHandle.name; // Limited info in browser
        } catch (err) {
          throw new Error('Directory selection not supported in this browser');
        }
      }

      throw new Error('Directory selection not available - use Electron or Chrome/Edge browser');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to select directory';
      setStatus({ loading: false, error: errorMessage });
      return null;
    }
  }, []);

  /**
   * Check if running in Electron
   */
  const isElectron = useCallback(() => {
    return window.CodeRefCore?.utils?.fileHandlers?.isElectron?.() ?? false;
  }, []);

  /**
   * Clear status
   */
  const clearStatus = useCallback(() => {
    setStatus({ loading: false, error: null });
  }, []);

  return {
    selectFiles,
    selectDirectory,
    isElectron,
    status,
    clearStatus,
  };
}

/**
 * Declare CodeRefCore global for TypeScript
 */
declare global {
  interface Window {
    CodeRefCore?: {
      utils?: {
        fileHandlers?: {
          selectFiles(options?: { multiple?: boolean; accept?: string }): Promise<File[] | null>;
          selectDirectory(): Promise<string | null>;
          isElectron(): boolean;
        };
      };
    };
  }
}

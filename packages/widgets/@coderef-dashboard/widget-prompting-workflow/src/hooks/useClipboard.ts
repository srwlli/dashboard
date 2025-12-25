import { useState, useCallback } from 'react';

interface ClipboardStatus {
  loading: boolean;
  error: string | null;
  success: boolean;
}

/**
 * Custom hook for clipboard operations with error handling
 * Uses window.CodeRefCore.utils.clipboard when available
 * Falls back to navigator.clipboard in browser environments
 */
export function useClipboard() {
  const [status, setStatus] = useState<ClipboardStatus>({
    loading: false,
    error: null,
    success: false,
  });

  /**
   * Write text to clipboard
   */
  const write = useCallback(async (text: string): Promise<boolean> => {
    setStatus({ loading: true, error: null, success: false });

    try {
      // Try CodeRefCore clipboard first (Electron support)
      if (window.CodeRefCore?.utils?.clipboard?.write) {
        await window.CodeRefCore.utils.clipboard.write(text);
        setStatus({ loading: false, error: null, success: true });
        return true;
      }

      // Fallback to navigator.clipboard
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setStatus({ loading: false, error: null, success: true });
        return true;
      }

      // Last resort: copy to textarea (for restricted environments)
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);

      if (success) {
        setStatus({ loading: false, error: null, success: true });
        return true;
      }

      throw new Error('Clipboard write failed - all methods exhausted');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to write to clipboard';
      setStatus({ loading: false, error: errorMessage, success: false });
      return false;
    }
  }, []);

  /**
   * Read text from clipboard
   */
  const read = useCallback(async (): Promise<string | null> => {
    setStatus({ loading: true, error: null, success: false });

    try {
      // Try CodeRefCore clipboard first (Electron support)
      if (window.CodeRefCore?.utils?.clipboard?.read) {
        const text = await window.CodeRefCore.utils.clipboard.read();
        setStatus({ loading: false, error: null, success: true });
        return text;
      }

      // Fallback to navigator.clipboard
      if (navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        setStatus({ loading: false, error: null, success: true });
        return text;
      }

      throw new Error('Clipboard read failed - method not available');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to read from clipboard';
      setStatus({ loading: false, error: errorMessage, success: false });
      return null;
    }
  }, []);

  /**
   * Clear status
   */
  const clearStatus = useCallback(() => {
    setStatus({ loading: false, error: null, success: false });
  }, []);

  return {
    write,
    read,
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
        clipboard?: {
          write(text: string): Promise<void>;
          read(): Promise<string>;
        };
      };
    };
  }
}

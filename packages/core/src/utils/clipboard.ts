/**
 * Clipboard utilities for reading and writing text
 */

export const clipboard = {
  async read(): Promise<string> {
    // Focus window for clipboard access
    if (typeof window !== 'undefined' && document.hasFocus()) {
      window.focus();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
      return await navigator.clipboard.readText();
    } catch (error) {
      if (error instanceof Error && error.name === 'NotAllowedError') {
        throw new Error('Clipboard access denied. Please click again to allow access.');
      }
      throw error;
    }
  },

  async write(text: string): Promise<void> {
    // Focus window for clipboard access
    if (typeof window !== 'undefined' && document.hasFocus()) {
      window.focus();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      if (error instanceof Error && error.name === 'NotAllowedError') {
        throw new Error('Clipboard access denied. Please click again to allow access.');
      }
      throw error;
    }
  }
};

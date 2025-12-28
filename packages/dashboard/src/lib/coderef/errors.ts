/**
 * User-Friendly Error Messages for CodeRef Explorer
 *
 * Translates technical errors into helpful messages
 */

export interface UserFriendlyError {
  title: string;
  message: string;
  suggestion?: string;
}

/**
 * Convert error to user-friendly message
 */
export function getUserFriendlyError(error: unknown): UserFriendlyError {
  const err = error as Error;

  // Browser not supported
  if (err.message?.includes('showDirectoryPicker')) {
    return {
      title: 'Browser Not Supported',
      message: 'Your browser does not support local file access.',
      suggestion: 'Please use Google Chrome or Microsoft Edge for local mode. You can still use API mode in other browsers.',
    };
  }

  // User cancelled directory picker
  if (err.name === 'AbortError') {
    return {
      title: 'Cancelled',
      message: 'Folder selection was cancelled.',
    };
  }

  // Permission denied
  if (err.name === 'NotAllowedError' || err.message?.toLowerCase().includes('permission')) {
    return {
      title: 'Permission Denied',
      message: 'Access to the folder was denied.',
      suggestion: 'Click the folder again and select "Allow" when prompted. You can revoke permissions in browser settings.',
    };
  }

  // File/directory not found
  if (err.name === 'NotFoundError' || err.message?.toLowerCase().includes('not found')) {
    return {
      title: 'File Not Found',
      message: 'The requested file or folder could not be found.',
      suggestion: 'The file may have been moved or deleted. Try reloading the project.',
    };
  }

  // Stale handle (file/folder deleted)
  if (err.message?.toLowerCase().includes('stale') || err.message?.toLowerCase().includes('invalid state')) {
    return {
      title: 'Folder No Longer Available',
      message: 'The folder you selected is no longer accessible.',
      suggestion: 'The folder may have been deleted or moved. Remove this project and add it again.',
    };
  }

  // Network error (API fallback)
  if (err.message?.toLowerCase().includes('fetch') || err.message?.toLowerCase().includes('network')) {
    return {
      title: 'Connection Error',
      message: 'Could not connect to the server.',
      suggestion: 'Check your internet connection and try again.',
    };
  }

  // File too large
  if (err.message?.toLowerCase().includes('too large')) {
    return {
      title: 'File Too Large',
      message: 'The file exceeds the maximum size limit (10MB).',
      suggestion: 'Please select a smaller file.',
    };
  }

  // Generic error
  return {
    title: 'Error',
    message: err.message || 'An unexpected error occurred.',
    suggestion: 'Please try again. If the problem persists, refresh the page.',
  };
}

/**
 * Format error for display
 */
export function formatError(error: unknown): string {
  const friendly = getUserFriendlyError(error);
  let formatted = `${friendly.title}: ${friendly.message}`;

  if (friendly.suggestion) {
    formatted += `\n\n${friendly.suggestion}`;
  }

  return formatted;
}

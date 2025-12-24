/**
 * Hook to listen for session refresh events
 * Triggered when session data changes
 */

import { useEffect } from 'react';

export function useSessionRefresh(callback: () => void, deps: React.DependencyList = []) {
  useEffect(() => {
    const handler = () => callback();

    if (typeof window !== 'undefined') {
      window.addEventListener('session-refresh', handler);
      return () => window.removeEventListener('session-refresh', handler);
    }

    return undefined;
  }, deps);
}

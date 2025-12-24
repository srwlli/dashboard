/**
 * Hook to manage session state
 * Provides current session data with auto-refresh
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import type { Session } from '../api/types';
import { useSessionRefresh } from './useSessionRefresh';

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getSession();
      setSession(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load session'));
      if (process.env.NODE_ENV === 'development') {
        console.error('Session fetch error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useSessionRefresh(refresh);

  return { session, loading, error, refresh };
}

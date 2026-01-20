/**
 * useBoards hook
 *
 * Fetches all boards from API with 30s cache TTL and loading/error states.
 * Provides refetch function to invalidate cache and reload data.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Board } from '@/types/boards';

interface UseBoardsReturn {
  boards: Board[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface CacheEntry {
  boards: Board[];
  timestamp: number;
}

// Cache TTL: 30 seconds
const CACHE_TTL = 30000;

// Global cache (shared across hook instances)
let globalCache: CacheEntry | null = null;

/**
 * Check if cache is valid (not expired)
 */
function isCacheValid(cache: CacheEntry | null): boolean {
  if (!cache) return false;
  return Date.now() - cache.timestamp < CACHE_TTL;
}

export function useBoards(): UseBoardsReturn {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);

  /**
   * Fetch boards from API
   */
  const fetchBoards = useCallback(async (skipCache = false) => {
    // Use cache if valid and not skipping
    if (!skipCache && isCacheValid(globalCache)) {
      if (isMountedRef.current) {
        setBoards(globalCache!.boards);
        setLoading(false);
        setError(null);
      }
      return;
    }

    // Fetch from API
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/boards');

      if (!response.ok) {
        throw new Error(`Failed to fetch boards: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch boards');
      }

      const fetchedBoards: Board[] = data.data || [];

      // Update global cache
      globalCache = {
        boards: fetchedBoards,
        timestamp: Date.now(),
      };

      if (isMountedRef.current) {
        setBoards(fetchedBoards);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching boards:', err);

      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
      }
    }
  }, []);

  /**
   * Refetch boards (invalidate cache)
   */
  const refetch = useCallback(async () => {
    await fetchBoards(true);
  }, [fetchBoards]);

  // Fetch boards on mount
  useEffect(() => {
    fetchBoards();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchBoards]);

  return {
    boards,
    loading,
    error,
    refetch,
  };
}

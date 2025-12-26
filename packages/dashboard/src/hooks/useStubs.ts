/**
 * useStubs Hook
 *
 * Fetches all stubs from GET /api/stubs
 * Handles loading, error, and caching automatically
 */

import { useState, useEffect } from 'react';
import { StubObject, StubListResponse } from '@/types/stubs';
import { ApiErrorResponse } from '@/types/api';

interface UseStubsReturn {
  stubs: StubObject[];
  isLoading: boolean;
  error: string | null;
  total: number;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage stubs
 */
export function useStubs(): UseStubsReturn {
  const [stubs, setStubs] = useState<StubObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchStubs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stubs');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as StubListResponse | ApiErrorResponse;

      if (!data.success) {
        throw new Error((data as ApiErrorResponse).error?.message || 'Failed to fetch stubs');
      }

      setStubs(data.data.stubs);
      setTotal(data.data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStubs();
  }, []);

  return {
    stubs,
    isLoading,
    error,
    total,
    refetch: fetchStubs,
  };
}

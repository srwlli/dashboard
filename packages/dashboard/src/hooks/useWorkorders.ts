/**
 * useWorkorders Hook
 *
 * Fetches all workorders from GET /api/workorders
 * Handles loading, error, and caching automatically
 */

import { useState, useEffect } from 'react';
import { WorkorderObject, WorkorderListResponse } from '@/types/workorders';
import { ApiErrorResponse } from '@/types/api';

interface UseWorkorersReturn {
  workorders: WorkorderObject[];
  isLoading: boolean;
  error: string | null;
  byProject: Record<string, number>;
  byStatus: Record<string, number>;
  total: number;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage workorders
 */
export function useWorkorders(): UseWorkorersReturn {
  const [workorders, setWorkorders] = useState<WorkorderObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [byProject, setByProject] = useState<Record<string, number>>({});
  const [byStatus, setByStatus] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);

  const fetchWorkorders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/workorders');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as WorkorderListResponse | ApiErrorResponse;

      if (!data.success) {
        throw new Error((data as ApiErrorResponse).error?.message || 'Failed to fetch workorders');
      }

      setWorkorders(data.data.workorders);
      setByProject(data.data.by_project);
      setByStatus(data.data.by_status);
      setTotal(data.data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkorders();
  }, []);

  return {
    workorders,
    isLoading,
    error,
    byProject,
    byStatus,
    total,
    refetch: fetchWorkorders,
  };
}

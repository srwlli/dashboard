/**
 * useWorkorderDetail Hook
 *
 * Fetches a specific workorder from GET /api/workorders/:workorderId
 * Handles loading, error, and refetching
 */

import { useState, useEffect } from 'react';
import { WorkorderObject, WorkorderDetailResponse } from '@/types/workorders';
import { ApiErrorResponse } from '@/types/api';

interface UseWorkorderDetailReturn {
  workorder: WorkorderObject | null;
  tasks: Array<{ id: string; description: string; status: string }>;
  deliverables: Array<{ name: string; status: string }>;
  communicationLog: Array<{ timestamp: string; message: string; author?: string }>;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage a specific workorder
 */
export function useWorkorderDetail(workorderId: string | null): UseWorkorderDetailReturn {
  const [workorder, setWorkorder] = useState<WorkorderObject | null>(null);
  const [tasks, setTasks] = useState<Array<{ id: string; description: string; status: string }>>([]);
  const [deliverables, setDeliverables] = useState<Array<{ name: string; status: string }>>([]);
  const [communicationLog, setCommunicationLog] = useState<
    Array<{ timestamp: string; message: string; author?: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkorder = async () => {
    if (!workorderId) {
      setWorkorder(null);
      setTasks([]);
      setDeliverables([]);
      setCommunicationLog([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/workorders/${workorderId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Workorder not found: ${workorderId}`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as WorkorderDetailResponse | ApiErrorResponse;

      if (!data.success) {
        throw new Error((data as ApiErrorResponse).error?.message || 'Failed to fetch workorder');
      }

      setWorkorder(data.data.workorder);
      setTasks(data.data.tasks || []);
      setDeliverables(data.data.deliverables || []);
      setCommunicationLog(data.data.communication_log || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setWorkorder(null);
      setTasks([]);
      setDeliverables([]);
      setCommunicationLog([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkorder();
  }, [workorderId]);

  return {
    workorder,
    tasks,
    deliverables,
    communicationLog,
    isLoading,
    error,
    refetch: fetchWorkorder,
  };
}

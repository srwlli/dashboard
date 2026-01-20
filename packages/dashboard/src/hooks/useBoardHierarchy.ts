/**
 * useBoardHierarchy hook
 *
 * Lazy-loads board details (lists + cards) on hover with 30s cache TTL.
 * Only triggers fetch when boardId changes.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { BoardList, BoardCard } from '@/types/boards';

interface UseBoardHierarchyParams {
  boardId: string | null;
  /** Whether to auto-fetch on mount */
  autoFetch?: boolean;
}

interface UseBoardHierarchyReturn {
  lists: BoardList[];
  /** Cards grouped by list ID */
  cardsByListId: Record<string, BoardCard[]>;
  loading: boolean;
  error: Error | null;
  /** Manually trigger fetch */
  fetch: () => Promise<void>;
}

interface CacheEntry {
  lists: BoardList[];
  cardsByListId: Record<string, BoardCard[]>;
  timestamp: number;
}

// Cache TTL: 30 seconds
const CACHE_TTL = 30000;

// Global cache (shared across hook instances) - keyed by boardId
const globalCache = new Map<string, CacheEntry>();

/**
 * Check if cache entry is valid (not expired)
 */
function isCacheValid(entry: CacheEntry | undefined): boolean {
  if (!entry) return false;
  return Date.now() - entry.timestamp < CACHE_TTL;
}

/**
 * Group cards by list ID
 */
function groupCardsByListId(cards: BoardCard[]): Record<string, BoardCard[]> {
  const grouped: Record<string, BoardCard[]> = {};

  for (const card of cards) {
    if (!grouped[card.listId]) {
      grouped[card.listId] = [];
    }
    grouped[card.listId].push(card);
  }

  // Sort cards by order within each list
  for (const listId in grouped) {
    grouped[listId].sort((a, b) => a.order - b.order);
  }

  return grouped;
}

export function useBoardHierarchy({
  boardId,
  autoFetch = true,
}: UseBoardHierarchyParams): UseBoardHierarchyReturn {
  const [lists, setLists] = useState<BoardList[]>([]);
  const [cardsByListId, setCardsByListId] = useState<Record<string, BoardCard[]>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);
  const prevBoardIdRef = useRef<string | null>(null);

  /**
   * Fetch board hierarchy from API
   */
  const fetchHierarchy = useCallback(async () => {
    if (!boardId) {
      setLists([]);
      setCardsByListId({});
      setLoading(false);
      setError(null);
      return;
    }

    // Use cache if valid
    const cachedEntry = globalCache.get(boardId);
    if (isCacheValid(cachedEntry)) {
      if (isMountedRef.current) {
        setLists(cachedEntry!.lists);
        setCardsByListId(cachedEntry!.cardsByListId);
        setLoading(false);
        setError(null);
      }
      return;
    }

    // Fetch from API
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/boards/${boardId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch board details: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch board details');
      }

      const board = data.data;
      const fetchedLists: BoardList[] = board.lists || [];

      // Fetch all cards for all lists
      const allCards: BoardCard[] = [];

      for (const list of fetchedLists) {
        try {
          const cardsResponse = await fetch(`/api/boards/${boardId}/lists/${list.id}/cards`);

          if (cardsResponse.ok) {
            const cardsData = await cardsResponse.json();
            if (cardsData.success && cardsData.data) {
              allCards.push(...cardsData.data);
            }
          }
        } catch (err) {
          console.warn(`Failed to fetch cards for list ${list.id}:`, err);
        }
      }

      const grouped = groupCardsByListId(allCards);

      // Update global cache
      globalCache.set(boardId, {
        lists: fetchedLists,
        cardsByListId: grouped,
        timestamp: Date.now(),
      });

      if (isMountedRef.current) {
        setLists(fetchedLists);
        setCardsByListId(grouped);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching board hierarchy:', err);

      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
      }
    }
  }, [boardId]);

  // Fetch when boardId changes
  useEffect(() => {
    // Only fetch if boardId changed
    if (boardId !== prevBoardIdRef.current) {
      prevBoardIdRef.current = boardId;

      if (autoFetch && boardId) {
        fetchHierarchy();
      }
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [boardId, autoFetch, fetchHierarchy]);

  return {
    lists,
    cardsByListId,
    loading,
    error,
    fetch: fetchHierarchy,
  };
}

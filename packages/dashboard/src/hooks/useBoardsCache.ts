/**
 * useBoardsCache Hook
 *
 * Pre-loads and caches all boards with their lists and cards
 * Provides methods to create boards, lists, and cards for context menu integration
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  BoardMetadata,
  Board,
  BoardCard,
  CreateBoardRequest,
  CreateListRequest,
  CreateCardRequest,
  BoardDetailResponse,
  BoardsListResponse,
} from '@/types/boards';
import { ApiErrorResponse } from '@/types/api';

interface BoardCache {
  metadata: BoardMetadata;
  board?: Board;
  cards?: Record<string, BoardCard[]>;
}

interface UseBoardsCacheReturn {
  boards: BoardMetadata[];
  boardsCache: Map<string, BoardCache>;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getBoardDetail: (boardId: string) => Promise<BoardCache | null>;
  createBoard: (request: CreateBoardRequest) => Promise<string | null>;
  createList: (boardId: string, request: CreateListRequest) => Promise<string | null>;
  createCard: (boardId: string, request: CreateCardRequest) => Promise<string | null>;
}

/**
 * Custom hook to fetch and cache all boards with their details
 * Designed for context menu integration with workorders/stubs
 */
export function useBoardsCache(): UseBoardsCacheReturn {
  const [boards, setBoards] = useState<BoardMetadata[]>([]);
  const [boardsCache, setBoardsCache] = useState<Map<string, BoardCache>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all boards metadata
   */
  const fetchBoards = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/boards');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as BoardsListResponse | ApiErrorResponse;

      if (!data.success) {
        throw new Error((data as ApiErrorResponse).error?.message || 'Failed to fetch boards');
      }

      const boardsList = (data as { success: true; data: BoardsListResponse }).data.boards;
      setBoards(boardsList);

      // Initialize cache with metadata only
      const newCache = new Map<string, BoardCache>();
      boardsList.forEach((metadata) => {
        newCache.set(metadata.id, { metadata });
      });
      setBoardsCache(newCache);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get full board details (lists + cards) for a specific board
   * Caches the result for subsequent calls
   */
  const getBoardDetail = useCallback(async (boardId: string): Promise<BoardCache | null> => {
    // Check cache first
    const cached = boardsCache.get(boardId);
    if (cached?.board && cached?.cards) {
      return cached;
    }

    try {
      const response = await fetch(`/api/boards/${encodeURIComponent(boardId)}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as BoardDetailResponse | ApiErrorResponse;

      if (!data.success) {
        throw new Error((data as ApiErrorResponse).error?.message || 'Failed to fetch board details');
      }

      const { board, cards } = (data as { success: true; data: BoardDetailResponse }).data;

      // Update cache
      setBoardsCache((prev) => {
        const newCache = new Map(prev);
        const existing = newCache.get(boardId);
        if (existing) {
          newCache.set(boardId, {
            ...existing,
            board,
            cards,
          });
        }
        return newCache;
      });

      return { metadata: cached?.metadata!, board, cards };
    } catch (err) {
      console.error('Failed to fetch board details:', err);
      return null;
    }
  }, [boardsCache]);

  /**
   * Create a new board
   * Returns the new board ID on success, null on failure
   */
  const createBoard = useCallback(async (request: CreateBoardRequest): Promise<string | null> => {
    try {
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to create board');
      }

      // Refetch boards to update cache
      await fetchBoards();

      return data.data.board.id;
    } catch (err) {
      console.error('Failed to create board:', err);
      return null;
    }
  }, []);

  /**
   * Create a new list in a board
   * Returns the new list ID on success, null on failure
   */
  const createList = useCallback(async (boardId: string, request: CreateListRequest): Promise<string | null> => {
    try {
      const response = await fetch(`/api/boards/${encodeURIComponent(boardId)}/lists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to create list');
      }

      // Invalidate board cache to force refetch
      setBoardsCache((prev) => {
        const newCache = new Map(prev);
        const existing = newCache.get(boardId);
        if (existing) {
          newCache.set(boardId, { metadata: existing.metadata });
        }
        return newCache;
      });

      return data.data.list.id;
    } catch (err) {
      console.error('Failed to create list:', err);
      return null;
    }
  }, []);

  /**
   * Create a new card in a board list
   * Returns the new card ID on success, null on failure
   */
  const createCard = useCallback(async (boardId: string, request: CreateCardRequest): Promise<string | null> => {
    try {
      const response = await fetch(`/api/boards/${encodeURIComponent(boardId)}/lists/${encodeURIComponent(request.listId)}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to create card');
      }

      // Invalidate board cache to force refetch
      setBoardsCache((prev) => {
        const newCache = new Map(prev);
        const existing = newCache.get(boardId);
        if (existing) {
          newCache.set(boardId, { metadata: existing.metadata });
        }
        return newCache;
      });

      return data.data.card.id;
    } catch (err) {
      console.error('Failed to create card:', err);
      return null;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchBoards();
  }, []);

  // Listen for refetch events
  useEffect(() => {
    const handleRefetch = () => fetchBoards();
    window.addEventListener('refetch-boards', handleRefetch);
    return () => window.removeEventListener('refetch-boards', handleRefetch);
  }, []);

  return {
    boards,
    boardsCache,
    isLoading,
    error,
    refetch: fetchBoards,
    getBoardDetail,
    createBoard,
    createList,
    createCard,
  };
}

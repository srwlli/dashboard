/**
 * Target Adapters for Universal Context Menu System
 *
 * Pluggable adapter pattern for integrating with different target systems.
 * Each adapter handles CRUD operations, menu structure, and UI feedback for its target type.
 *
 * Part of WO-UNIVERSAL-CTX-MENU-001-DASHBOARD
 */

import type { Board, BoardList } from '@/types/boards';

/**
 * Loading state labels for async operations
 */
export interface LoadingStates {
  [key: string]: string;
}

/**
 * Empty state labels when no items found
 */
export interface EmptyStates {
  [key: string]: string;
}

/**
 * Menu structure configuration
 */
export interface MenuStructure {
  /** Number of nesting levels (1-5) */
  levels: number;
  /** Label for each level (e.g., ['Action Type', 'Board', 'List', 'Card']) */
  labels: string[];
}

/**
 * Universal target adapter interface
 *
 * Adapters provide target-specific implementations for:
 * - Fetching targets and nested items
 * - Creating/adding entities to targets
 * - Defining menu hierarchy
 * - Providing loading and empty states
 *
 * @template TTarget - Target type (Board, Prompt, Note, Session, Favorite, etc.)
 *
 * @example
 * ```typescript
 * const boardAdapter: TargetAdapter<Board> = {
 *   fetchTargets: async () => useBoards().boards,
 *   fetchItems: async (boardId) => useBoardHierarchy(boardId).lists,
 *   getMenuStructure: () => ({ levels: 4, labels: ['Action', 'Board', 'List', 'Card'] }),
 *   addToTarget: async (board, item) => { ... },
 *   loadingStates: { boards: 'Loading boards...', lists: 'Loading lists...' },
 *   emptyStates: { boards: 'No boards found', lists: 'No lists in this board' }
 * };
 * ```
 */
export interface TargetAdapter<TTarget> {
  /**
   * Fetch all available targets
   *
   * @returns Promise resolving to array of targets (boards, prompts, notes, etc.)
   *
   * @example
   * // BoardTargetAdapter
   * fetchTargets: async () => {
   *   const { boards } = useBoards();
   *   return boards;
   * }
   */
  fetchTargets(): Promise<TTarget[]>;

  /**
   * Fetch nested items for a specific target
   *
   * @param targetId - ID of the target to fetch items for
   * @returns Promise resolving to array of nested items
   *   - For boards: lists in the board
   *   - For notes: tags in the note
   *   - For other targets: may return empty array if no nesting
   *
   * @example
   * // BoardTargetAdapter
   * fetchItems: async (boardId) => {
   *   const { lists } = useBoardHierarchy(boardId, { autoFetch: false });
   *   return lists;
   * }
   */
  fetchItems(targetId: string): Promise<any[]>;

  /**
   * Get menu structure configuration
   *
   * Defines the hierarchy depth and labels for the context menu.
   *
   * @returns Menu structure with levels and labels
   *
   * @example
   * // BoardTargetAdapter (4 levels: Action → Board → List → Card)
   * getMenuStructure: () => ({
   *   levels: 4,
   *   labels: ['Action Type', 'Board', 'List', 'Card']
   * })
   *
   * // PromptTargetAdapter (1 level: Prompt only)
   * getMenuStructure: () => ({
   *   levels: 1,
   *   labels: ['Prompt']
   * })
   */
  getMenuStructure(): MenuStructure;

  /**
   * Add entity to target
   *
   * Performs the actual CRUD operation to add the converted entity to the target.
   *
   * @param target - Target object to add to
   * @param item - Converted entity item to add
   * @param options - Optional parameters (e.g., listId for boards, tagId for notes)
   * @returns Promise resolving when operation completes
   *
   * @example
   * // BoardTargetAdapter
   * addToTarget: async (board, item, options) => {
   *   const { listId, action } = options;
   *   if (action === 'as_board') {
   *     await createBoard(item);
   *   } else if (action === 'as_card') {
   *     await createCard(board.id, listId, item);
   *   }
   * }
   */
  addToTarget(target: TTarget, item: any, options?: Record<string, any>): Promise<void>;

  /**
   * Loading state labels
   *
   * Displayed during async fetch operations.
   *
   * @example
   * {
   *   boards: 'Loading boards...',
   *   lists: 'Loading lists...',
   *   cards: 'Loading cards...'
   * }
   */
  loadingStates: LoadingStates;

  /**
   * Empty state labels
   *
   * Displayed when no items are found.
   *
   * @example
   * {
   *   boards: 'No boards found',
   *   lists: 'No lists in this board',
   *   cards: 'No cards in this list'
   * }
   */
  emptyStates: EmptyStates;
}

/**
 * BoardTargetAdapter - Full implementation for board system
 *
 * Production-ready adapter with real API integration.
 * Supports 4-level hierarchy: Action Type → Board → List → Card
 */
class BoardTargetAdapterClass implements TargetAdapter<Board> {
  /**
   * Fetch all boards from API
   */
  async fetchTargets(): Promise<Board[]> {
    try {
      const response = await fetch('/api/boards');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.success ? data.data || [] : [];
    } catch (error) {
      console.error('Error fetching boards:', error);
      return [];
    }
  }

  /**
   * Fetch lists for a specific board
   */
  async fetchItems(boardId: string): Promise<BoardList[]> {
    try {
      const response = await fetch(`/api/boards/${encodeURIComponent(boardId)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.data) {
        return data.data.lists || [];
      }
      return [];
    } catch (error) {
      console.error(`Error fetching lists for board ${boardId}:`, error);
      return [];
    }
  }

  /**
   * Get menu structure (4 levels: Action → Board → List → Card)
   */
  getMenuStructure(): MenuStructure {
    return {
      levels: 4,
      labels: ['Action Type', 'Board', 'List', 'Card'],
    };
  }

  /**
   * Add entity to board target
   */
  async addToTarget(board: Board, item: any, options?: Record<string, any>): Promise<void> {
    const { action, listId } = options || {};

    try {
      if (action === 'as_board') {
        // Create new board
        const boardResponse = await fetch('/api/boards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });

        if (!boardResponse.ok) {
          throw new Error('Failed to create board');
        }

        const boardResult = await boardResponse.json();
        if (!boardResult.success) {
          throw new Error(boardResult.error || 'Failed to create board');
        }

        const newBoard = boardResult.data.board; // API returns { board, created } in data

        // Create initial "To Do" list
        const listResponse = await fetch(`/api/boards/${newBoard.id}/lists`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'To Do', order: 0 }),
        });

        if (!listResponse.ok) {
          throw new Error('Failed to create list');
        }

        const listResult = await listResponse.json();
        if (!listResult.success) {
          throw new Error(listResult.error || 'Failed to create list');
        }

        const newList = listResult.data.list; // API returns { list, created } in data

        // Create initial card
        await fetch(`/api/boards/${newBoard.id}/lists/${newList.id}/cards`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...item, listId: newList.id, order: 0 }),
        });

      } else if (action === 'as_list') {
        // Create new list in board
        const listResponse = await fetch(`/api/boards/${board.id}/lists`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: item.title || 'New List', order: board.lists.length }),
        });

        if (!listResponse.ok) {
          throw new Error('Failed to create list');
        }

        const listResult = await listResponse.json();
        if (!listResult.success) {
          throw new Error(listResult.error || 'Failed to create list');
        }

        const newList = listResult.data.list; // API returns { list, created } in data

        // Create initial card in new list
        await fetch(`/api/boards/${board.id}/lists/${newList.id}/cards`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...item, listId: newList.id, order: 0 }),
        });

      } else if (action === 'as_card' && listId) {
        // Add as new card to existing list
        const cardsResponse = await fetch(`/api/boards/${board.id}/lists/${listId}/cards`);
        const cardsData = await cardsResponse.json();
        const cardsInList = cardsData.success ? cardsData.data || [] : [];

        await fetch(`/api/boards/${board.id}/lists/${listId}/cards`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...item, listId, order: cardsInList.length }),
        });

      } else if (action === 'to_card' && listId && options?.cardId) {
        // Attach to existing card
        const cardResponse = await fetch(`/api/boards/${board.id}/lists/${listId}/cards/${options.cardId}`);
        const cardData = await cardResponse.json();
        const existingCard = cardData.success ? cardData.data : null;

        if (existingCard) {
          const updatedAttachments = [...(existingCard.attachments || []), ...(item.attachments || [])];
          const updatedTags = [...new Set([...(existingCard.tags || []), ...(item.tags || [])])];

          await fetch(`/api/boards/${board.id}/lists/${listId}/cards/${options.cardId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              attachments: updatedAttachments,
              tags: updatedTags,
            }),
          });
        }
      }
    } catch (error) {
      console.error('Error adding to board:', error);
      throw error;
    }
  }

  loadingStates: LoadingStates = {
    boards: 'Loading boards...',
    lists: 'Loading lists...',
    cards: 'Loading cards...',
  };

  emptyStates: EmptyStates = {
    boards: 'No boards found',
    lists: 'No lists in this board',
    cards: 'No cards in this list',
  };
}

/**
 * BoardTargetAdapter singleton instance
 */
export const BoardTargetAdapter = new BoardTargetAdapterClass();

/**
 * PromptTargetAdapter - Proof of concept for prompt library integration
 *
 * Demonstrates single-level menu structure with mock data.
 */
class PromptTargetAdapterClass implements TargetAdapter<any> {
  async fetchTargets(): Promise<any[]> {
    // Mock prompt list
    return [
      { id: 'claude', name: 'Claude', description: 'Anthropic Claude prompts' },
      { id: 'gpt4', name: 'GPT-4', description: 'OpenAI GPT-4 prompts' },
      { id: 'gemini', name: 'Gemini', description: 'Google Gemini prompts' },
    ];
  }

  async fetchItems(promptId: string): Promise<any[]> {
    // Prompts have no nested items
    return [];
  }

  getMenuStructure(): MenuStructure {
    return {
      levels: 1,
      labels: ['Prompt'],
    };
  }

  async addToTarget(prompt: any, item: any, options?: Record<string, any>): Promise<void> {
    // Proof of concept - just log
    console.log(`[PromptTargetAdapter] Adding to prompt "${prompt.name}":`, item);
  }

  loadingStates: LoadingStates = {
    prompts: 'Loading prompts...',
  };

  emptyStates: EmptyStates = {
    prompts: 'No prompts found',
  };
}

/**
 * PromptTargetAdapter singleton instance
 */
export const PromptTargetAdapter = new PromptTargetAdapterClass();

/**
 * SessionTargetAdapter - Proof of concept for multi-agent sessions
 *
 * Demonstrates single-level menu structure with mock session data.
 */
class SessionTargetAdapterClass implements TargetAdapter<any> {
  async fetchTargets(): Promise<any[]> {
    // Mock session list
    return [
      { id: 'session-1', name: 'universal-context-menu', status: 'active' },
      { id: 'session-2', name: 'authentication-system', status: 'complete' },
      { id: 'session-3', name: 'dashboard-refactor', status: 'active' },
    ];
  }

  async fetchItems(sessionId: string): Promise<any[]> {
    // Sessions have no nested items
    return [];
  }

  getMenuStructure(): MenuStructure {
    return {
      levels: 1,
      labels: ['Session'],
    };
  }

  async addToTarget(session: any, item: any, options?: Record<string, any>): Promise<void> {
    // Proof of concept - just log
    console.log(`[SessionTargetAdapter] Adding to session "${session.name}":`, item);
  }

  loadingStates: LoadingStates = {
    sessions: 'Loading sessions...',
  };

  emptyStates: EmptyStates = {
    sessions: 'No sessions found',
  };
}

/**
 * SessionTargetAdapter singleton instance
 */
export const SessionTargetAdapter = new SessionTargetAdapterClass();

/**
 * NoteTargetAdapter - Proof of concept for notes with tags
 *
 * Demonstrates 2-level menu structure (Note → Tag).
 */
class NoteTargetAdapterClass implements TargetAdapter<any> {
  async fetchTargets(): Promise<any[]> {
    // Mock note list
    return [
      { id: 'note-1', name: 'Project Ideas', tags: ['ideas', 'planning'] },
      { id: 'note-2', name: 'Meeting Notes', tags: ['meetings', 'archive'] },
      { id: 'note-3', name: 'Code Snippets', tags: ['code', 'reference'] },
    ];
  }

  async fetchItems(noteId: string): Promise<any[]> {
    // Mock tags for note (nested items)
    const tagMap: Record<string, any[]> = {
      'note-1': [
        { id: 'tag-ideas', name: 'ideas' },
        { id: 'tag-planning', name: 'planning' },
      ],
      'note-2': [
        { id: 'tag-meetings', name: 'meetings' },
        { id: 'tag-archive', name: 'archive' },
      ],
      'note-3': [
        { id: 'tag-code', name: 'code' },
        { id: 'tag-reference', name: 'reference' },
      ],
    };
    return tagMap[noteId] || [];
  }

  getMenuStructure(): MenuStructure {
    return {
      levels: 2,
      labels: ['Note', 'Tag'],
    };
  }

  async addToTarget(note: any, item: any, options?: Record<string, any>): Promise<void> {
    // Proof of concept - just log
    console.log(`[NoteTargetAdapter] Adding to note "${note.name}":`, item);
  }

  loadingStates: LoadingStates = {
    notes: 'Loading notes...',
    tags: 'Loading tags...',
  };

  emptyStates: EmptyStates = {
    notes: 'No notes found',
    tags: 'No tags in this note',
  };
}

/**
 * NoteTargetAdapter singleton instance
 */
export const NoteTargetAdapter = new NoteTargetAdapterClass();

/**
 * FavoriteTargetAdapter - Proof of concept for favorites system
 *
 * Demonstrates single-level menu structure for favorites categories.
 */
class FavoriteTargetAdapterClass implements TargetAdapter<any> {
  async fetchTargets(): Promise<any[]> {
    // Mock favorite categories
    return [
      { id: 'fav-1', name: 'Ungrouped', count: 5 },
      { id: 'fav-2', name: 'Work Files', count: 12 },
      { id: 'fav-3', name: 'Personal', count: 8 },
      { id: 'fav-4', name: 'Archived', count: 20 },
    ];
  }

  async fetchItems(favoriteId: string): Promise<any[]> {
    // Favorites have no nested items
    return [];
  }

  getMenuStructure(): MenuStructure {
    return {
      levels: 1,
      labels: ['Favorite'],
    };
  }

  async addToTarget(favorite: any, item: any, options?: Record<string, any>): Promise<void> {
    // Proof of concept - just log
    console.log(`[FavoriteTargetAdapter] Adding to favorite category "${favorite.name}":`, item);
  }

  loadingStates: LoadingStates = {
    favorites: 'Loading favorites...',
  };

  emptyStates: EmptyStates = {
    favorites: 'No favorite categories found',
  };
}

/**
 * FavoriteTargetAdapter singleton instance
 */
export const FavoriteTargetAdapter = new FavoriteTargetAdapterClass();

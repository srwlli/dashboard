/**
 * Unit tests for target-adapters.ts
 *
 * Tests all target adapter implementations for universal context menu system.
 * Coverage includes:
 * - BoardTargetAdapter (full implementation)
 * - PromptTargetAdapter (proof of concept)
 * - SessionTargetAdapter (proof of concept)
 * - NoteTargetAdapter (proof of concept with nested items)
 * - FavoriteTargetAdapter (proof of concept)
 *
 * Part of WO-UNIVERSAL-CTX-MENU-001-DASHBOARD
 */

import {
  BoardTargetAdapter,
  PromptTargetAdapter,
  SessionTargetAdapter,
  NoteTargetAdapter,
  FavoriteTargetAdapter,
} from '../target-adapters';
import type { Board } from '@/types/boards';

// Mock fetch globally
global.fetch = jest.fn();

describe('target-adapters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('BoardTargetAdapter', () => {
    describe('fetchTargets', () => {
      it('should fetch boards from API successfully', async () => {
        const mockBoards: Board[] = [
          { id: 'board-1', name: 'Project Alpha', lists: [] },
          { id: 'board-2', name: 'Project Beta', lists: [] },
        ];

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: mockBoards }),
        });

        const result = await BoardTargetAdapter.fetchTargets();

        expect(global.fetch).toHaveBeenCalledWith('/api/boards');
        expect(result).toEqual(mockBoards);
      });

      it('should return empty array on API error', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 500,
        });

        const result = await BoardTargetAdapter.fetchTargets();

        expect(result).toEqual([]);
      });

      it('should handle network errors gracefully', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        const result = await BoardTargetAdapter.fetchTargets();

        expect(result).toEqual([]);
        expect(consoleSpy).toHaveBeenCalledWith('Error fetching boards:', expect.any(Error));
        consoleSpy.mockRestore();
      });

      it('should return empty array when API returns unsuccessful response', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: false }),
        });

        const result = await BoardTargetAdapter.fetchTargets();

        expect(result).toEqual([]);
      });
    });

    describe('fetchItems', () => {
      it('should fetch lists for a board successfully', async () => {
        const mockLists = [
          { id: 'list-1', title: 'To Do', order: 0 },
          { id: 'list-2', title: 'In Progress', order: 1 },
        ];

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: { lists: mockLists } }),
        });

        const result = await BoardTargetAdapter.fetchItems('board-1');

        expect(global.fetch).toHaveBeenCalledWith('/api/boards/board-1');
        expect(result).toEqual(mockLists);
      });

      it('should return empty array when board has no lists', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: { lists: [] } }),
        });

        const result = await BoardTargetAdapter.fetchItems('board-1');

        expect(result).toEqual([]);
      });

      it('should handle API errors gracefully', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 404,
        });

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        const result = await BoardTargetAdapter.fetchItems('invalid-board');

        expect(result).toEqual([]);
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
      });

      it('should encode board ID in URL', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: { lists: [] } }),
        });

        await BoardTargetAdapter.fetchItems('board with spaces');

        expect(global.fetch).toHaveBeenCalledWith('/api/boards/board%20with%20spaces');
      });
    });

    describe('getMenuStructure', () => {
      it('should return 4-level menu structure', () => {
        const result = BoardTargetAdapter.getMenuStructure();

        expect(result).toEqual({
          levels: 4,
          labels: ['Action Type', 'Board', 'List', 'Card'],
        });
      });
    });

    describe('addToTarget', () => {
      it('should create board, list, and card when action is "as_board"', async () => {
        const mockBoard = { id: 'new-board', name: 'New Board', lists: [] };
        const mockList = { id: 'new-list', title: 'To Do', order: 0 };
        const mockCard = { title: 'New Card', description: 'Test' };

        // Mock board creation
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: mockBoard }),
        });

        // Mock list creation
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: mockList }),
        });

        // Mock card creation
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

        await BoardTargetAdapter.addToTarget(
          mockBoard as Board,
          mockCard,
          { action: 'as_board' }
        );

        expect(global.fetch).toHaveBeenCalledTimes(3);
        expect(global.fetch).toHaveBeenNthCalledWith(1, '/api/boards', expect.any(Object));
        expect(global.fetch).toHaveBeenNthCalledWith(2, `/api/boards/${mockBoard.id}/lists`, expect.any(Object));
        expect(global.fetch).toHaveBeenNthCalledWith(3, `/api/boards/${mockBoard.id}/lists/${mockList.id}/cards`, expect.any(Object));
      });

      it('should create list and card when action is "as_list"', async () => {
        const mockBoard = { id: 'board-1', name: 'Existing Board', lists: [] };
        const mockList = { id: 'new-list', title: 'New List', order: 0 };
        const mockItem = { title: 'New List', description: 'Test' };

        // Mock list creation
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: mockList }),
        });

        // Mock card creation
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

        await BoardTargetAdapter.addToTarget(
          mockBoard as Board,
          mockItem,
          { action: 'as_list' }
        );

        expect(global.fetch).toHaveBeenCalledTimes(2);
      });

      it('should create card in existing list when action is "as_card"', async () => {
        const mockBoard = { id: 'board-1', name: 'Board', lists: [] };
        const mockItem = { title: 'New Card', description: 'Test' };
        const mockCards = [{ id: 'card-1', title: 'Existing Card' }];

        // Mock fetch existing cards
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: mockCards }),
        });

        // Mock card creation
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

        await BoardTargetAdapter.addToTarget(
          mockBoard as Board,
          mockItem,
          { action: 'as_card', listId: 'list-1' }
        );

        expect(global.fetch).toHaveBeenCalledTimes(2);
      });

      it('should attach to existing card when action is "to_card"', async () => {
        const mockBoard = { id: 'board-1', name: 'Board', lists: [] };
        const mockCard = { id: 'card-1', title: 'Card', attachments: [], tags: [] };
        const mockItem = { attachments: [{ url: 'file://test.txt' }], tags: ['new-tag'] };

        // Mock fetch existing card
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: mockCard }),
        });

        // Mock card update
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

        await BoardTargetAdapter.addToTarget(
          mockBoard as Board,
          mockItem,
          { action: 'to_card', listId: 'list-1', cardId: 'card-1' }
        );

        expect(global.fetch).toHaveBeenCalledTimes(2);
      });

      it('should throw error when board creation fails', async () => {
        const mockBoard = { id: 'board-1', name: 'Board', lists: [] };
        const mockItem = { title: 'New Card' };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 500,
        });

        await expect(
          BoardTargetAdapter.addToTarget(mockBoard as Board, mockItem, { action: 'as_board' })
        ).rejects.toThrow('Failed to create board');
      });
    });

    describe('loadingStates', () => {
      it('should have loading states for boards, lists, and cards', () => {
        expect(BoardTargetAdapter.loadingStates).toEqual({
          boards: 'Loading boards...',
          lists: 'Loading lists...',
          cards: 'Loading cards...',
        });
      });
    });

    describe('emptyStates', () => {
      it('should have empty states for boards, lists, and cards', () => {
        expect(BoardTargetAdapter.emptyStates).toEqual({
          boards: 'No boards found',
          lists: 'No lists in this board',
          cards: 'No cards in this list',
        });
      });
    });
  });

  describe('PromptTargetAdapter', () => {
    describe('fetchTargets', () => {
      it('should return mock prompt list', async () => {
        const result = await PromptTargetAdapter.fetchTargets();

        expect(result).toHaveLength(3);
        expect(result[0]).toEqual({
          id: 'claude',
          name: 'Claude',
          description: 'Anthropic Claude prompts',
        });
      });
    });

    describe('fetchItems', () => {
      it('should return empty array (no nested items)', async () => {
        const result = await PromptTargetAdapter.fetchItems('claude');

        expect(result).toEqual([]);
      });
    });

    describe('getMenuStructure', () => {
      it('should return single-level menu structure', () => {
        const result = PromptTargetAdapter.getMenuStructure();

        expect(result).toEqual({
          levels: 1,
          labels: ['Prompt'],
        });
      });
    });

    describe('addToTarget', () => {
      it('should log to console (proof of concept)', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const mockPrompt = { id: 'claude', name: 'Claude' };
        const mockItem = { content: 'Test prompt' };

        await PromptTargetAdapter.addToTarget(mockPrompt, mockItem);

        expect(consoleSpy).toHaveBeenCalledWith(
          '[PromptTargetAdapter] Adding to prompt "Claude":',
          mockItem
        );
        consoleSpy.mockRestore();
      });
    });

    describe('states', () => {
      it('should have loading and empty states', () => {
        expect(PromptTargetAdapter.loadingStates).toEqual({
          prompts: 'Loading prompts...',
        });
        expect(PromptTargetAdapter.emptyStates).toEqual({
          prompts: 'No prompts found',
        });
      });
    });
  });

  describe('SessionTargetAdapter', () => {
    describe('fetchTargets', () => {
      it('should return mock session list', async () => {
        const result = await SessionTargetAdapter.fetchTargets();

        expect(result).toHaveLength(3);
        expect(result[0]).toEqual({
          id: 'session-1',
          name: 'universal-context-menu',
          status: 'active',
        });
      });
    });

    describe('fetchItems', () => {
      it('should return empty array (no nested items)', async () => {
        const result = await SessionTargetAdapter.fetchItems('session-1');

        expect(result).toEqual([]);
      });
    });

    describe('getMenuStructure', () => {
      it('should return single-level menu structure', () => {
        const result = SessionTargetAdapter.getMenuStructure();

        expect(result).toEqual({
          levels: 1,
          labels: ['Session'],
        });
      });
    });

    describe('addToTarget', () => {
      it('should log to console (proof of concept)', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const mockSession = { id: 'session-1', name: 'universal-context-menu' };
        const mockItem = { data: 'Test data' };

        await SessionTargetAdapter.addToTarget(mockSession, mockItem);

        expect(consoleSpy).toHaveBeenCalledWith(
          '[SessionTargetAdapter] Adding to session "universal-context-menu":',
          mockItem
        );
        consoleSpy.mockRestore();
      });
    });

    describe('states', () => {
      it('should have loading and empty states', () => {
        expect(SessionTargetAdapter.loadingStates).toEqual({
          sessions: 'Loading sessions...',
        });
        expect(SessionTargetAdapter.emptyStates).toEqual({
          sessions: 'No sessions found',
        });
      });
    });
  });

  describe('NoteTargetAdapter', () => {
    describe('fetchTargets', () => {
      it('should return mock note list', async () => {
        const result = await NoteTargetAdapter.fetchTargets();

        expect(result).toHaveLength(3);
        expect(result[0]).toEqual({
          id: 'note-1',
          name: 'Project Ideas',
          tags: ['ideas', 'planning'],
        });
      });
    });

    describe('fetchItems', () => {
      it('should return tags for note-1', async () => {
        const result = await NoteTargetAdapter.fetchItems('note-1');

        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({
          id: 'tag-ideas',
          name: 'ideas',
        });
      });

      it('should return tags for note-2', async () => {
        const result = await NoteTargetAdapter.fetchItems('note-2');

        expect(result).toHaveLength(2);
        expect(result[0].name).toBe('meetings');
      });

      it('should return empty array for unknown note', async () => {
        const result = await NoteTargetAdapter.fetchItems('unknown');

        expect(result).toEqual([]);
      });
    });

    describe('getMenuStructure', () => {
      it('should return 2-level menu structure', () => {
        const result = NoteTargetAdapter.getMenuStructure();

        expect(result).toEqual({
          levels: 2,
          labels: ['Note', 'Tag'],
        });
      });
    });

    describe('addToTarget', () => {
      it('should log to console (proof of concept)', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const mockNote = { id: 'note-1', name: 'Project Ideas' };
        const mockItem = { content: 'New note entry' };

        await NoteTargetAdapter.addToTarget(mockNote, mockItem);

        expect(consoleSpy).toHaveBeenCalledWith(
          '[NoteTargetAdapter] Adding to note "Project Ideas":',
          mockItem
        );
        consoleSpy.mockRestore();
      });
    });

    describe('states', () => {
      it('should have loading and empty states for notes and tags', () => {
        expect(NoteTargetAdapter.loadingStates).toEqual({
          notes: 'Loading notes...',
          tags: 'Loading tags...',
        });
        expect(NoteTargetAdapter.emptyStates).toEqual({
          notes: 'No notes found',
          tags: 'No tags in this note',
        });
      });
    });
  });

  describe('FavoriteTargetAdapter', () => {
    describe('fetchTargets', () => {
      it('should return mock favorite categories', async () => {
        const result = await FavoriteTargetAdapter.fetchTargets();

        expect(result).toHaveLength(4);
        expect(result[0]).toEqual({
          id: 'fav-1',
          name: 'Ungrouped',
          count: 5,
        });
      });
    });

    describe('fetchItems', () => {
      it('should return empty array (no nested items)', async () => {
        const result = await FavoriteTargetAdapter.fetchItems('fav-1');

        expect(result).toEqual([]);
      });
    });

    describe('getMenuStructure', () => {
      it('should return single-level menu structure', () => {
        const result = FavoriteTargetAdapter.getMenuStructure();

        expect(result).toEqual({
          levels: 1,
          labels: ['Favorite'],
        });
      });
    });

    describe('addToTarget', () => {
      it('should log to console (proof of concept)', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const mockFavorite = { id: 'fav-1', name: 'Work Files' };
        const mockItem = { path: '/path/to/file.txt' };

        await FavoriteTargetAdapter.addToTarget(mockFavorite, mockItem);

        expect(consoleSpy).toHaveBeenCalledWith(
          '[FavoriteTargetAdapter] Adding to favorite category "Work Files":',
          mockItem
        );
        consoleSpy.mockRestore();
      });
    });

    describe('states', () => {
      it('should have loading and empty states', () => {
        expect(FavoriteTargetAdapter.loadingStates).toEqual({
          favorites: 'Loading favorites...',
        });
        expect(FavoriteTargetAdapter.emptyStates).toEqual({
          favorites: 'No favorite categories found',
        });
      });
    });
  });
});

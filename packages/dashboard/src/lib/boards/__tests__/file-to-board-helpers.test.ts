/**
 * Unit tests for file-to-board-helpers.ts
 *
 * Tests all helper functions for converting Explorer files to board entities.
 * Coverage includes:
 * - File data extraction (paths, extensions, edge cases)
 * - Board/List/Card creation from file metadata
 * - File attachment handling
 * - Validation and path comparison utilities
 */

import {
  extractFileData,
  getFilenameWithoutExtension,
  createBoardFromFile,
  createListFromFile,
  createCardFromFile,
  attachFileToCard,
  validateFileData,
  isSameFile,
} from '../file-to-board-helpers';
import type { FileData } from '@/types/file-board-integration';
import type { BoardCard } from '@/types/boards';

describe('file-to-board-helpers', () => {
  describe('extractFileData', () => {
    it('should extract file data from Unix-style path', () => {
      const filePath = '/home/user/projects/my-app/src/components/Button.tsx';
      const result = extractFileData(filePath);

      expect(result).toEqual({
        path: '/home/user/projects/my-app/src/components/Button.tsx',
        name: 'Button.tsx',
        extension: 'tsx',
        nameWithoutExtension: 'Button',
      });
    });

    it('should extract file data from Windows-style path', () => {
      const filePath = 'C:\\Users\\willh\\Desktop\\project\\src\\index.ts';
      const result = extractFileData(filePath);

      expect(result).toEqual({
        path: 'C:/Users/willh/Desktop/project/src/index.ts', // Normalized to forward slashes
        name: 'index.ts',
        extension: 'ts',
        nameWithoutExtension: 'index',
      });
    });

    it('should handle files without extension', () => {
      const filePath = '/home/user/README';
      const result = extractFileData(filePath);

      expect(result).toEqual({
        path: '/home/user/README',
        name: 'README',
        extension: '',
        nameWithoutExtension: 'README',
      });
    });

    it('should handle hidden files (starting with dot)', () => {
      const filePath = '/home/user/.gitignore';
      const result = extractFileData(filePath);

      expect(result).toEqual({
        path: '/home/user/.gitignore',
        name: '.gitignore',
        extension: '', // Hidden files are treated as having no extension
        nameWithoutExtension: '.gitignore', // Full name preserved
      });
    });

    it('should handle files with multiple dots', () => {
      const filePath = '/home/user/file.test.ts';
      const result = extractFileData(filePath);

      expect(result).toEqual({
        path: '/home/user/file.test.ts',
        name: 'file.test.ts',
        extension: 'ts',
        nameWithoutExtension: 'file.test',
      });
    });

    it('should handle root-level files', () => {
      const filePath = '/package.json';
      const result = extractFileData(filePath);

      expect(result).toEqual({
        path: '/package.json',
        name: 'package.json',
        extension: 'json',
        nameWithoutExtension: 'package',
      });
    });
  });

  describe('getFilenameWithoutExtension', () => {
    it('should extract filename without extension', () => {
      expect(getFilenameWithoutExtension('Button.tsx')).toBe('Button');
    });

    it('should handle multiple dots', () => {
      expect(getFilenameWithoutExtension('file.test.ts')).toBe('file.test');
    });

    it('should handle files without extension', () => {
      expect(getFilenameWithoutExtension('README')).toBe('README');
    });

    it('should handle hidden files', () => {
      expect(getFilenameWithoutExtension('.gitignore')).toBe('.gitignore');
    });

    it('should handle empty string', () => {
      expect(getFilenameWithoutExtension('')).toBe('');
    });

    it('should handle file with leading dot and extension', () => {
      expect(getFilenameWithoutExtension('.env.local')).toBe('.env');
    });
  });

  describe('createBoardFromFile', () => {
    const mockFileData: FileData = {
      path: '/home/user/project/src/components/Button.tsx',
      name: 'Button.tsx',
      extension: 'tsx',
      nameWithoutExtension: 'Button',
    };

    it('should create board, initial list, and initial card from file', () => {
      const result = createBoardFromFile({ file: mockFileData });

      // Board assertions
      expect(result.board).toMatchObject({
        name: 'Button',
        linkedPath: '/home/user/project/src/components',
      });
      expect(result.board.createdAt).toBeDefined();
      expect(result.board.updatedAt).toBeDefined();

      // Initial list assertions
      expect(result.initialList).toMatchObject({
        title: 'To Do',
        collapsed: false,
        order: 0,
        cardIds: [],
      });
      expect(result.initialList.createdAt).toBeDefined();

      // Initial card assertions
      expect(result.initialCard).toMatchObject({
        title: 'Button',
        description: `File: ${mockFileData.path}`,
        order: 0,
        tags: ['tsx'],
      });
      expect(result.initialCard.attachments).toHaveLength(1);
      expect(result.initialCard.attachments![0]).toMatchObject({
        type: 'file',
        path: mockFileData.path,
        displayName: mockFileData.name,
      });
    });

    it('should link board to project when projectId provided', () => {
      const result = createBoardFromFile({
        file: mockFileData,
        projectId: 'proj-123',
      });

      expect(result.board.projectId).toBe('proj-123');
    });

    it('should not include tag if file has no extension', () => {
      const fileWithoutExt: FileData = {
        path: '/home/user/README',
        name: 'README',
        extension: '',
        nameWithoutExtension: 'README',
      };

      const result = createBoardFromFile({ file: fileWithoutExt });

      expect(result.initialCard.tags).toEqual([]);
    });
  });

  describe('createListFromFile', () => {
    const mockFileData: FileData = {
      path: '/home/user/project/src/utils/helpers.ts',
      name: 'helpers.ts',
      extension: 'ts',
      nameWithoutExtension: 'helpers',
    };

    it('should create list with initial card when createCard=true', () => {
      const result = createListFromFile({
        file: mockFileData,
        boardId: 'board-123',
        createCard: true,
      });

      // List assertions
      expect(result.list).toMatchObject({
        title: 'helpers',
        collapsed: false,
        cardIds: [],
      });
      expect(result.list.createdAt).toBeDefined();

      // Initial card assertions
      expect(result.initialCard).toBeDefined();
      expect(result.initialCard).toMatchObject({
        title: 'helpers',
        description: `File: ${mockFileData.path}`,
        order: 0,
        tags: ['ts'],
      });
      expect(result.initialCard!.attachments).toHaveLength(1);
    });

    it('should create list without card when createCard=false', () => {
      const result = createListFromFile({
        file: mockFileData,
        boardId: 'board-123',
        createCard: false,
      });

      expect(result.list).toMatchObject({
        title: 'helpers',
        collapsed: false,
        cardIds: [],
      });
      expect(result.initialCard).toBeUndefined();
    });

    it('should create list without card when createCard not specified', () => {
      const result = createListFromFile({
        file: mockFileData,
        boardId: 'board-123',
      });

      expect(result.initialCard).toBeUndefined();
    });
  });

  describe('createCardFromFile', () => {
    const mockFileData: FileData = {
      path: '/home/user/project/src/lib/api.ts',
      name: 'api.ts',
      extension: 'ts',
      nameWithoutExtension: 'api',
    };

    it('should create card with file attachment', () => {
      const result = createCardFromFile({
        file: mockFileData,
        boardId: 'board-123',
        listId: 'list-456',
      });

      expect(result).toMatchObject({
        title: 'api',
        description: `File: ${mockFileData.path}`,
        order: 0,
        tags: ['ts'],
      });
      expect(result.attachments).toHaveLength(1);
      expect(result.attachments![0]).toMatchObject({
        type: 'file',
        path: mockFileData.path,
        displayName: mockFileData.name,
      });
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should generate attachment IDs with correct format', () => {
      const result = createCardFromFile({
        file: mockFileData,
        boardId: 'board-123',
        listId: 'list-456',
      });

      expect(result.attachments).toHaveLength(1);
      expect(result.attachments![0].id).toMatch(/^attachment-\d+$/);
      expect(typeof result.attachments![0].id).toBe('string');
    });
  });

  describe('attachFileToCard', () => {
    const mockFileData: FileData = {
      path: '/home/user/project/docs/README.md',
      name: 'README.md',
      extension: 'md',
      nameWithoutExtension: 'README',
    };

    const mockCard: BoardCard = {
      id: 'card-123',
      listId: 'list-456',
      title: 'Documentation',
      description: 'Existing description',
      order: 0,
      attachments: [],
      tags: [],
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: '2026-01-15T10:00:00Z',
    };

    it('should add attachment to card without appending to description', () => {
      const result = attachFileToCard(
        {
          file: mockFileData,
          boardId: 'board-123',
          listId: 'list-456',
          cardId: 'card-123',
          appendToDescription: false,
        },
        mockCard
      );

      expect(result.updatedAttachments).toHaveLength(1);
      expect(result.updatedAttachments[0]).toMatchObject({
        type: 'file',
        path: mockFileData.path,
        displayName: mockFileData.name,
      });
      expect(result.updatedDescription).toBe('Existing description');
      expect(result.updatedTags).toContain('md');
    });

    it('should append to description when appendToDescription=true', () => {
      const result = attachFileToCard(
        {
          file: mockFileData,
          boardId: 'board-123',
          listId: 'list-456',
          cardId: 'card-123',
          appendToDescription: true,
        },
        mockCard
      );

      expect(result.updatedDescription).toContain('Existing description');
      expect(result.updatedDescription).toContain('---');
      expect(result.updatedDescription).toContain('**Attached File:**');
      expect(result.updatedDescription).toContain('README.md');
      expect(result.updatedDescription).toContain(mockFileData.path);
    });

    it('should add separator when appending to non-empty description', () => {
      const result = attachFileToCard(
        {
          file: mockFileData,
          boardId: 'board-123',
          listId: 'list-456',
          cardId: 'card-123',
          appendToDescription: true,
        },
        mockCard
      );

      expect(result.updatedDescription).toMatch(/Existing description\n\n---\n\n/);
    });

    it('should not add separator when appending to empty description', () => {
      const cardWithEmptyDesc = { ...mockCard, description: '' };

      const result = attachFileToCard(
        {
          file: mockFileData,
          boardId: 'board-123',
          listId: 'list-456',
          cardId: 'card-123',
          appendToDescription: true,
        },
        cardWithEmptyDesc
      );

      expect(result.updatedDescription).not.toContain('---');
      expect(result.updatedDescription).toMatch(/^\*\*Attached File:\*\*/);
    });

    it('should add file extension as tag if not already present', () => {
      const result = attachFileToCard(
        {
          file: mockFileData,
          boardId: 'board-123',
          listId: 'list-456',
          cardId: 'card-123',
        },
        mockCard
      );

      expect(result.updatedTags).toContain('md');
    });

    it('should not duplicate tag if already present', () => {
      const cardWithTag = { ...mockCard, tags: ['md', 'documentation'] };

      const result = attachFileToCard(
        {
          file: mockFileData,
          boardId: 'board-123',
          listId: 'list-456',
          cardId: 'card-123',
        },
        cardWithTag
      );

      expect(result.updatedTags).toEqual(['md', 'documentation']);
      expect(result.updatedTags?.filter((tag) => tag === 'md')).toHaveLength(1);
    });

    it('should throw error if file already attached', () => {
      const cardWithAttachment: BoardCard = {
        ...mockCard,
        attachments: [
          {
            id: 'attachment-1',
            type: 'file',
            path: mockFileData.path,
            displayName: mockFileData.name,
            addedAt: '2026-01-15T10:00:00Z',
          },
        ],
      };

      expect(() =>
        attachFileToCard(
          {
            file: mockFileData,
            boardId: 'board-123',
            listId: 'list-456',
            cardId: 'card-123',
          },
          cardWithAttachment
        )
      ).toThrow(`File "${mockFileData.name}" is already attached to this card`);
    });

    it('should preserve existing attachments', () => {
      const cardWithAttachment: BoardCard = {
        ...mockCard,
        attachments: [
          {
            id: 'attachment-1',
            type: 'file',
            path: '/other/file.txt',
            displayName: 'file.txt',
            addedAt: '2026-01-15T10:00:00Z',
          },
        ],
      };

      const result = attachFileToCard(
        {
          file: mockFileData,
          boardId: 'board-123',
          listId: 'list-456',
          cardId: 'card-123',
        },
        cardWithAttachment
      );

      expect(result.updatedAttachments).toHaveLength(2);
      expect(result.updatedAttachments[0]).toMatchObject({
        id: 'attachment-1',
        path: '/other/file.txt',
      });
      expect(result.updatedAttachments[1]).toMatchObject({
        path: mockFileData.path,
      });
    });
  });

  describe('validateFileData', () => {
    it('should validate correct file data', () => {
      const validFile: FileData = {
        path: '/home/user/file.ts',
        name: 'file.ts',
        extension: 'ts',
        nameWithoutExtension: 'file',
      };

      const result = validateFileData(validFile);

      expect(result).toEqual({ valid: true });
    });

    it('should reject empty path', () => {
      const invalidFile: FileData = {
        path: '',
        name: 'file.ts',
        extension: 'ts',
        nameWithoutExtension: 'file',
      };

      const result = validateFileData(invalidFile);

      expect(result).toEqual({ valid: false, error: 'File path is required' });
    });

    it('should reject whitespace-only path', () => {
      const invalidFile: FileData = {
        path: '   ',
        name: 'file.ts',
        extension: 'ts',
        nameWithoutExtension: 'file',
      };

      const result = validateFileData(invalidFile);

      expect(result).toEqual({ valid: false, error: 'File path is required' });
    });

    it('should reject empty name', () => {
      const invalidFile: FileData = {
        path: '/home/user/file.ts',
        name: '',
        extension: 'ts',
        nameWithoutExtension: 'file',
      };

      const result = validateFileData(invalidFile);

      expect(result).toEqual({ valid: false, error: 'File name is required' });
    });

    it('should reject empty nameWithoutExtension', () => {
      const invalidFile: FileData = {
        path: '/home/user/file.ts',
        name: 'file.ts',
        extension: 'ts',
        nameWithoutExtension: '',
      };

      const result = validateFileData(invalidFile);

      expect(result).toEqual({
        valid: false,
        error: 'File name without extension is required',
      });
    });

    it('should allow empty extension (files without extension)', () => {
      const validFile: FileData = {
        path: '/home/user/README',
        name: 'README',
        extension: '',
        nameWithoutExtension: 'README',
      };

      const result = validateFileData(validFile);

      expect(result).toEqual({ valid: true });
    });
  });

  describe('isSameFile', () => {
    it('should match identical paths', () => {
      expect(isSameFile('/home/user/file.ts', '/home/user/file.ts')).toBe(true);
    });

    it('should match paths with different slash styles (Windows vs Unix)', () => {
      expect(isSameFile('C:\\Users\\file.ts', 'C:/Users/file.ts')).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(isSameFile('/HOME/USER/FILE.TS', '/home/user/file.ts')).toBe(true);
    });

    it('should not match different paths', () => {
      expect(isSameFile('/home/user/file1.ts', '/home/user/file2.ts')).toBe(
        false
      );
    });

    it('should normalize backslashes to forward slashes', () => {
      expect(
        isSameFile(
          'C:\\Users\\willh\\project\\file.ts',
          'c:/users/willh/project/file.ts'
        )
      ).toBe(true);
    });
  });
});

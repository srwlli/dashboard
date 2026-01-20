/**
 * Helper utilities for converting Explorer files to board entities
 *
 * Provides conversion functions for:
 * - File data extraction
 * - Board/List/Card creation from file metadata
 * - File attachment handling
 */

import type { Board, BoardList, BoardCard, CardAttachment } from '@/types/boards';
import type {
  FileData,
  CreateBoardFromFileRequest,
  CreateListFromFileRequest,
  CreateCardFromFileRequest,
  AttachFileToCardRequest,
} from '@/types/file-board-integration';

/**
 * Extract file data from file path
 */
export function extractFileData(filePath: string): FileData {
  const normalizedPath = filePath.replace(/\\/g, '/');
  const pathParts = normalizedPath.split('/');
  const name = pathParts[pathParts.length - 1] || '';
  const lastDotIndex = name.lastIndexOf('.');
  const extension = lastDotIndex > 0 ? name.substring(lastDotIndex + 1) : '';
  const nameWithoutExtension = lastDotIndex > 0 ? name.substring(0, lastDotIndex) : name;

  return {
    path: normalizedPath,
    name,
    extension,
    nameWithoutExtension,
  };
}

/**
 * Get filename without extension
 * Handles edge cases: multiple dots, no extension, hidden files
 */
export function getFilenameWithoutExtension(filename: string): string {
  if (!filename) return '';

  // Handle hidden files (e.g., ".gitignore")
  if (filename.startsWith('.') && filename.lastIndexOf('.') === 0) {
    return filename;
  }

  const lastDotIndex = filename.lastIndexOf('.');

  // No extension
  if (lastDotIndex === -1) return filename;

  // Extension exists
  return filename.substring(0, lastDotIndex);
}

/**
 * Create a new board from file
 *
 * Creates a board with:
 * - Board name: filename (without extension)
 * - Initial list: "To Do"
 * - Initial card: filename with file attachment
 */
export function createBoardFromFile(request: CreateBoardFromFileRequest): {
  board: Partial<Board>;
  initialList: Partial<BoardList>;
  initialCard: Partial<BoardCard>;
} {
  const { file, projectId } = request;
  const now = new Date().toISOString();

  const board: Partial<Board> = {
    name: file.nameWithoutExtension,
    projectId,
    linkedPath: file.path.substring(0, file.path.lastIndexOf('/')),
    createdAt: now,
    updatedAt: now,
  };

  const initialList: Partial<BoardList> = {
    title: 'To Do',
    collapsed: false,
    order: 0,
    cardIds: [],
    createdAt: now,
  };

  const initialCard: Partial<BoardCard> = {
    title: file.nameWithoutExtension,
    description: `File: ${file.path}`,
    order: 0,
    attachments: [
      {
        id: `attachment-${Date.now()}`,
        type: 'file',
        path: file.path,
        displayName: file.name,
        addedAt: now,
      },
    ],
    tags: file.extension ? [file.extension] : [],
    createdAt: now,
    updatedAt: now,
  };

  return { board, initialList, initialCard };
}

/**
 * Create a new list from file
 *
 * Creates a list with:
 * - List title: filename (without extension)
 * - Optional initial card with file attachment
 */
export function createListFromFile(request: CreateListFromFileRequest): {
  list: Partial<BoardList>;
  initialCard?: Partial<BoardCard>;
} {
  const { file, createCard } = request;
  const now = new Date().toISOString();

  const list: Partial<BoardList> = {
    title: file.nameWithoutExtension,
    collapsed: false,
    cardIds: [],
    createdAt: now,
  };

  if (createCard) {
    const initialCard: Partial<BoardCard> = {
      title: file.nameWithoutExtension,
      description: `File: ${file.path}`,
      order: 0,
      attachments: [
        {
          id: `attachment-${Date.now()}`,
          type: 'file',
          path: file.path,
          displayName: file.name,
          addedAt: now,
        },
      ],
      tags: file.extension ? [file.extension] : [],
      createdAt: now,
      updatedAt: now,
    };

    return { list, initialCard };
  }

  return { list };
}

/**
 * Create a new card from file
 *
 * Creates a card with:
 * - Card title: filename (without extension)
 * - Card description: full file path
 * - File attachment
 * - Tag: file extension
 */
export function createCardFromFile(request: CreateCardFromFileRequest): Partial<BoardCard> {
  const { file } = request;
  const now = new Date().toISOString();

  return {
    title: file.nameWithoutExtension,
    description: `File: ${file.path}`,
    order: 0,
    attachments: [
      {
        id: `attachment-${Date.now()}`,
        type: 'file',
        path: file.path,
        displayName: file.name,
        addedAt: now,
      },
    ],
    tags: file.extension ? [file.extension] : [],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Attach file to existing card
 *
 * Creates a CardAttachment and optionally appends to description
 */
export function attachFileToCard(
  request: AttachFileToCardRequest,
  existingCard: BoardCard
): {
  updatedAttachments: CardAttachment[];
  updatedDescription?: string;
  updatedTags?: string[];
} {
  const { file, appendToDescription } = request;
  const now = new Date().toISOString();

  // Create new attachment
  const newAttachment: CardAttachment = {
    id: `attachment-${Date.now()}`,
    type: 'file',
    path: file.path,
    displayName: file.name,
    addedAt: now,
  };

  // Check if file already attached (by path)
  const alreadyAttached = existingCard.attachments.some((att) => att.path === file.path);

  if (alreadyAttached) {
    throw new Error(`File "${file.name}" is already attached to this card`);
  }

  const updatedAttachments = [...existingCard.attachments, newAttachment];

  // Optionally append to description
  let updatedDescription = existingCard.description;
  if (appendToDescription) {
    const separator = existingCard.description ? '\n\n---\n\n' : '';
    updatedDescription = `${existingCard.description || ''}${separator}**Attached File:** ${file.name}\n\`${file.path}\``;
  }

  // Add file extension as tag if not already present
  const updatedTags = existingCard.tags || [];
  if (file.extension && !updatedTags.includes(file.extension)) {
    updatedTags.push(file.extension);
  }

  return {
    updatedAttachments,
    updatedDescription,
    updatedTags,
  };
}

/**
 * Validate file data
 */
export function validateFileData(file: FileData): { valid: boolean; error?: string } {
  if (!file.path || file.path.trim() === '') {
    return { valid: false, error: 'File path is required' };
  }

  if (!file.name || file.name.trim() === '') {
    return { valid: false, error: 'File name is required' };
  }

  if (!file.nameWithoutExtension || file.nameWithoutExtension.trim() === '') {
    return { valid: false, error: 'File name without extension is required' };
  }

  return { valid: true };
}

/**
 * Check if two files are the same (by path)
 */
export function isSameFile(file1Path: string, file2Path: string): boolean {
  const normalize = (p: string) => p.replace(/\\/g, '/').toLowerCase();
  return normalize(file1Path) === normalize(file2Path);
}

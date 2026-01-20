/**
 * Type definitions for File-to-Board integration
 *
 * Defines types for adding files from Explorer to Project Boards
 * via right-click context menu with nested navigation.
 */

import { Board, BoardList, BoardCard } from './boards';

/**
 * File-to-board action types
 */
export type FileToBoardAction = 'as_board' | 'as_list' | 'as_card' | 'to_card';

/**
 * File data extracted from Explorer
 */
export interface FileData {
  /** Full absolute path to the file */
  path: string;
  /** Filename with extension (e.g., "MyComponent.tsx") */
  name: string;
  /** File extension without dot (e.g., "tsx") */
  extension: string;
  /** Filename without extension (e.g., "MyComponent") */
  nameWithoutExtension: string;
}

/**
 * Board picker data for menu navigation
 */
export interface BoardPickerData {
  id: string;
  name: string;
  /** Project ID if board is linked to a project */
  projectId?: string;
  /** Number of lists in the board */
  listCount?: number;
}

/**
 * List picker data for menu navigation
 */
export interface ListPickerData {
  id: string;
  title: string;
  /** Board ID this list belongs to */
  boardId: string;
  /** Number of cards in the list */
  cardCount?: number;
  /** List color (optional) */
  color?: string;
}

/**
 * Card picker data for menu navigation
 */
export interface CardPickerData {
  id: string;
  title: string;
  /** List ID this card belongs to */
  listId: string;
  /** Board ID this card belongs to */
  boardId: string;
  /** Number of attachments on the card */
  attachmentCount?: number;
  /** Card tags */
  tags?: string[];
}

/**
 * Props for AddFileToBoardMenu component
 */
export interface AddFileToBoardMenuProps {
  /** File data from Explorer */
  file: FileData;
  /** Position for context menu */
  position: { x: number; y: number };
  /** Callback when menu closes */
  onClose: () => void;
  /** Optional callback on successful action */
  onSuccess?: (action: FileToBoardAction, result: AddFileToBoardResult) => void;
  /** Optional callback on error */
  onError?: (error: Error) => void;
}

/**
 * Result of adding file to board
 */
export interface AddFileToBoardResult {
  /** Action that was performed */
  action: FileToBoardAction;
  /** Created or updated board */
  board: Board;
  /** Created or updated list (if applicable) */
  list?: BoardList;
  /** Created or updated card */
  card: BoardCard;
  /** Success message */
  message: string;
}

/**
 * Request payload for creating board from file
 */
export interface CreateBoardFromFileRequest {
  file: FileData;
  /** Optional project ID to link board to */
  projectId?: string;
}

/**
 * Request payload for creating list from file
 */
export interface CreateListFromFileRequest {
  file: FileData;
  boardId: string;
  /** Whether to create an initial card */
  createCard?: boolean;
}

/**
 * Request payload for creating card from file
 */
export interface CreateCardFromFileRequest {
  file: FileData;
  boardId: string;
  listId: string;
}

/**
 * Request payload for attaching file to existing card
 */
export interface AttachFileToCardRequest {
  file: FileData;
  boardId: string;
  listId: string;
  cardId: string;
  /** Whether to append to description */
  appendToDescription?: boolean;
}

/**
 * Cache entry for board data
 */
export interface BoardCacheEntry {
  board: Board;
  /** Lists in the board */
  lists: BoardList[];
  /** Cards grouped by list ID */
  cardsByListId: Record<string, BoardCard[]>;
  /** Timestamp when cached */
  cachedAt: number;
  /** TTL in milliseconds (default: 30000 = 30s) */
  ttl: number;
}

/**
 * Cache for board hierarchy data
 */
export type BoardCache = Map<string, BoardCacheEntry>;

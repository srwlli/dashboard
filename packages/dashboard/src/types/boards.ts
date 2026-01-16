/**
 * Board System Type Definitions
 *
 * Type definitions for Trello-like board system with drag & drop functionality.
 * Supports standalone boards or boards linked to projects/directories.
 */

/**
 * Board - Top-level board container
 *
 * Can exist standalone or be linked to a project/directory.
 * Stored in ~/.coderef-dashboard/boards/board-{id}/board.json
 */
export interface Board {
  /** Unique board identifier (UUID) */
  id: string;

  /** User-defined board name */
  name: string;

  /** Optional link to project from projects.json */
  projectId?: string;

  /** Optional link to directory path */
  linkedPath?: string;

  /** Ordered list of board lists */
  lists: BoardList[];

  /** ISO 8601 creation timestamp */
  createdAt: string;

  /** ISO 8601 last update timestamp */
  updatedAt: string;
}

/**
 * BoardList - Vertical column container
 *
 * Contains ordered cards and supports collapse/expand.
 */
export interface BoardList {
  /** Unique list identifier (UUID) */
  id: string;

  /** Editable list title */
  title: string;

  /** Collapse state (title-only vs full view) */
  collapsed: boolean;

  /** Position in board (0-indexed) */
  order: number;

  /** Array of card IDs in this list */
  cardIds: string[];

  /** Optional accent color (hex or CSS color) */
  color?: string;

  /** ISO 8601 creation timestamp */
  createdAt: string;
}

/**
 * BoardCard - Individual task card
 *
 * Supports rich content including markdown description, tags, and attachments.
 */
export interface BoardCard {
  /** Unique card identifier (UUID) */
  id: string;

  /** Parent list ID */
  listId: string;

  /** Card title (required) */
  title: string;

  /** Markdown description (optional) */
  description?: string;

  /** Position within list (0-indexed) */
  order: number;

  /** File/folder/URL attachments */
  attachments: CardAttachment[];

  /** Tags for categorization */
  tags?: string[];

  /** ISO 8601 creation timestamp */
  createdAt: string;

  /** ISO 8601 last update timestamp */
  updatedAt: string;
}

/**
 * CardAttachment - File, folder, or URL reference
 *
 * Attachments are references only (no file uploads).
 */
export interface CardAttachment {
  /** Unique attachment identifier (UUID) */
  id: string;

  /** Attachment type */
  type: 'file' | 'folder' | 'url';

  /** File or folder path (for file/folder types) */
  path?: string;

  /** Display name shown in UI */
  displayName: string;

  /** URL (for url type) */
  url?: string;

  /** ISO 8601 timestamp when added */
  addedAt: string;
}

/**
 * API Response Types
 */

export interface BoardsListResponse {
  boards: BoardMetadata[];
  total: number;
}

export interface BoardMetadata {
  id: string;
  name: string;
  projectId?: string;
  linkedPath?: string;
  listCount: number;
  cardCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BoardDetailResponse {
  board: Board;
  cards: Record<string, BoardCard[]>; // Keyed by listId
}

export interface CreateBoardRequest {
  name: string;
  projectId?: string;
  linkedPath?: string;
}

export interface UpdateBoardRequest {
  name?: string;
  projectId?: string;
  linkedPath?: string;
}

export interface CreateListRequest {
  title: string;
  order: number;
  color?: string;
}

export interface UpdateListRequest {
  title?: string;
  order?: number;
  collapsed?: boolean;
  color?: string;
}

export interface CreateCardRequest {
  listId: string;
  title: string;
  description?: string;
  order: number;
  tags?: string[];
}

export interface UpdateCardRequest {
  listId?: string;
  title?: string;
  description?: string;
  order?: number;
  attachments?: CardAttachment[];
  tags?: string[];
}

/**
 * UI Component Props Types
 */

export interface BoardCanvasProps {
  boardId: string;
  standalone?: boolean;
}

export interface BoardListProps {
  list: BoardList;
  cards: BoardCard[];
  onUpdateList: (listId: string, updates: UpdateListRequest) => Promise<void>;
  onDeleteList: (listId: string) => Promise<void>;
  onCreateCard: (request: CreateCardRequest) => Promise<void>;
  onUpdateCard: (cardId: string, updates: UpdateCardRequest) => Promise<void>;
  onDeleteCard: (cardId: string) => Promise<void>;
}

export interface BoardCardProps {
  card: BoardCard;
  onUpdate: (updates: UpdateCardRequest) => Promise<void>;
  onDelete: () => Promise<void>;
}

export interface BoardPickerProps {
  onSelectBoard: (boardId: string) => void;
  selectedBoardId?: string;
}

export interface CardEditorProps {
  card?: BoardCard; // undefined for new cards
  listId: string;
  onSave: (data: CreateCardRequest | UpdateCardRequest) => Promise<void>;
  onClose: () => void;
}

export interface AttachmentPickerProps {
  onAddAttachment: (attachment: Omit<CardAttachment, 'id' | 'addedAt'>) => void;
  onClose: () => void;
}

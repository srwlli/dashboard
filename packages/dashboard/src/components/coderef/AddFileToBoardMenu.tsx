/**
 * AddFileToBoardMenu Component
 *
 * 3-5 level nested context menu for adding files from Explorer to boards.
 *
 * Menu Structure:
 * - Level 1: "Add to Board" (root item)
 * - Level 2: Action type (Add as New Board | Add as New List | Add as New Card | Add to Existing Card)
 * - Level 3: Board selection (lazy-loaded from BoardTargetAdapter)
 * - Level 4: List selection (lazy-loaded from BoardTargetAdapter)
 * - Level 5: Card selection (only for "Add to Existing Card")
 *
 * **Refactored:** Now uses universal adapter system (BoardTargetAdapter + fileToBoard converter)
 * for simplified data fetching and type-safe file-to-board conversions.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Folder, List, FileText, Paperclip } from 'lucide-react';
import type { AddFileToBoardMenuProps, FileData } from '@/types/file-board-integration';
import type { Board, BoardList, BoardCard } from '@/types/boards';
import ContextMenu, { ContextMenuItem } from './ContextMenu';
import { BoardTargetAdapter } from '@/lib/boards/target-adapters';
import { fileToBoard } from '@/lib/boards/entity-converters';
import { attachFileToCard } from '@/lib/boards/file-to-board-helpers';

export default function AddFileToBoardMenu({
  file,
  position,
  onClose,
  onSuccess,
  onError,
}: AddFileToBoardMenuProps) {
  const [boards, setBoards] = useState<any[]>([]);
  const [boardsLoading, setBoardsLoading] = useState(true);
  const [listsCache, setListsCache] = useState<Record<string, any[]>>({});
  const [cardsCache, setCardsCache] = useState<Record<string, any[]>>({});

  // Fetch boards using universal adapter
  useEffect(() => {
    const fetchBoards = async () => {
      setBoardsLoading(true);
      const fetchedBoards = await BoardTargetAdapter.fetchTargets();
      setBoards(fetchedBoards);
      setBoardsLoading(false);
    };
    fetchBoards();
  }, []);

  /**
   * Handle "Add as New Board" action
   * Creates: board → initial list ("To Do") → initial card (with file attachment)
   * Uses universal adapter for streamlined board creation
   */
  const handleAddAsBoard = async () => {
    try {
      const boardData = fileToBoard.convert(file, 'board');
      await BoardTargetAdapter.addToTarget({} as any, boardData, { action: 'as_board' });

      onSuccess?.({
        action: 'as_board',
        message: `Created board "${file.nameWithoutExtension}" with file "${file.name}"`,
      } as any);

      onClose();
    } catch (error) {
      console.error('Error adding as board:', error);
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  };

  /**
   * Handle "Add as New List" action
   * Creates: list in selected board → optional card (with file attachment)
   * Uses universal adapter for streamlined list/card creation
   */
  const handleAddAsList = async (board: any) => {
    try {
      const listData = fileToBoard.convert(file, 'list');
      await BoardTargetAdapter.addToTarget(board, listData, { action: 'as_list' });

      onSuccess?.({
        action: 'as_list',
        message: `Created list "${file.nameWithoutExtension}" in board "${board.name}"`,
      } as any);

      onClose();
    } catch (error) {
      console.error('Error adding as list:', error);
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  };

  /**
   * Handle "Add as New Card" action
   * Creates: card in selected list (with file attachment)
   * Uses universal adapter for streamlined card creation
   */
  const handleAddAsCard = async (board: any, list: any) => {
    try {
      const cardData = fileToBoard.convert(file, 'card');
      await BoardTargetAdapter.addToTarget(board, cardData, { action: 'as_card', listId: list.id });

      onSuccess?.({
        action: 'as_card',
        message: `Created card "${file.nameWithoutExtension}" in list "${list.title}"`,
      } as any);

      onClose();
    } catch (error) {
      console.error('Error adding as card:', error);
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  };

  /**
   * Handle "Add to Existing Card" action
   * Attaches file to selected card (uses file-to-board-helpers for attachment logic)
   */
  const handleAddToCard = async (board: any, list: any, card: any) => {
    try {
      const { updatedAttachments, updatedDescription, updatedTags } = attachFileToCard(
        { file, boardId: board.id, listId: list.id, cardId: card.id, appendToDescription: false },
        card
      );

      await BoardTargetAdapter.addToTarget(board, {
        attachments: updatedAttachments,
        description: updatedDescription,
        tags: updatedTags,
      }, { action: 'to_card', listId: list.id, cardId: card.id });

      onSuccess?.({
        action: 'to_card',
        message: `Attached "${file.name}" to card "${card.title}"`,
      } as any);

      onClose();
    } catch (error) {
      console.error('Error adding to card:', error);
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  };

  /**
   * Fetch lists for a board (cached)
   */
  const fetchListsForBoard = async (boardId: string): Promise<any[]> => {
    if (listsCache[boardId]) return listsCache[boardId];

    const lists = await BoardTargetAdapter.fetchItems(boardId);
    setListsCache(prev => ({ ...prev, [boardId]: lists }));
    return lists;
  };

  /**
   * Build menu items for board picker (uses universal adapter)
   */
  const buildBoardPickerItems = (onSelectBoard: (board: any) => void): ContextMenuItem[] => {
    if (boardsLoading) {
      return [{
        label: 'Loading boards...',
        icon: Loader2,
        iconClassName: 'animate-spin',
        onClick: () => {},
      }];
    }

    if (boards.length === 0) {
      return [{
        label: 'No boards found',
        icon: Folder,
        textClassName: 'text-ind-text-muted',
        onClick: () => {},
      }];
    }

    return boards.map((board) => ({
      label: board.name,
      icon: Folder,
      onClick: () => onSelectBoard(board),
    }));
  };

  /**
   * Build menu items for list picker (simplified with caching)
   */
  const buildListPickerItems = (
    board: any,
    onSelectList: (list: any) => void
  ): ContextMenuItem[] => {
    const lists = listsCache[board.id] || [];

    if (lists.length === 0) {
      return [{
        label: 'No lists found',
        icon: List,
        textClassName: 'text-ind-text-muted',
        onClick: () => {},
      }];
    }

    return lists.map((list) => ({
      label: list.title,
      icon: List,
      onClick: () => onSelectList(list),
    }));
  };

  /**
   * Build menu items for card picker (simplified with caching)
   */
  const buildCardPickerItems = (
    board: any,
    list: any,
    onSelectCard: (card: any) => void
  ): ContextMenuItem[] => {
    const cards = cardsCache[list.id] || [];

    if (cards.length === 0) {
      return [{
        label: 'No cards found',
        icon: FileText,
        textClassName: 'text-ind-text-muted',
        onClick: () => {},
      }];
    }

    return cards.map((card) => ({
      label: card.title,
      icon: FileText,
      onClick: () => onSelectCard(card),
    }));
  };

  /**
   * Build "Add as New List" submenu (board picker - simplified)
   */
  const buildAddAsListSubmenu = (): ContextMenuItem[] => {
    return buildBoardPickerItems((board) => handleAddAsList(board));
  };

  /**
   * Build "Add as New Card" submenu (board picker → list picker - async loading)
   */
  const buildAddAsCardSubmenu = (): ContextMenuItem[] => {
    if (boardsLoading) {
      return [{
        label: 'Loading boards...',
        icon: Loader2,
        iconClassName: 'animate-spin',
        onClick: () => {},
      }];
    }

    if (!boards || boards.length === 0) {
      return [{
        label: 'No boards found',
        icon: Folder,
        textClassName: 'text-ind-text-muted',
        onClick: () => {},
      }];
    }

    return boards.map((board) => ({
      label: board.name,
      icon: Folder,
      onHover: async () => {
        if (!listsCache[board.id]) {
          await fetchListsForBoard(board.id);
        }
      },
      submenu: (listsCache[board.id] || []).map((list: any) => ({
        label: list.title,
        icon: List,
        onClick: () => handleAddAsCard(board, list),
      })),
    }));
  };

  /**
   * Build "Add to Existing Card" submenu (board → list → card picker - async loading)
   */
  const buildAddToCardSubmenu = (): ContextMenuItem[] => {
    if (boardsLoading) {
      return [{
        label: 'Loading boards...',
        icon: Loader2,
        iconClassName: 'animate-spin',
        onClick: () => {},
      }];
    }

    if (!boards || boards.length === 0) {
      return [{
        label: 'No boards found',
        icon: Folder,
        textClassName: 'text-ind-text-muted',
        onClick: () => {},
      }];
    }

    return boards.map((board) => ({
      label: board.name,
      icon: Folder,
      onHover: async () => {
        if (!listsCache[board.id]) {
          await fetchListsForBoard(board.id);
        }
      },
      submenu: (listsCache[board.id] || []).map((list: any) => ({
        label: list.title,
        icon: List,
        submenu: (cardsCache[list.id] || []).map((card: any) => ({
          label: card.title,
          icon: FileText,
          onClick: () => handleAddToCard(board, list, card),
        })),
      })),
    }));
  };

  /**
   * Main menu items (Level 2: Action types)
   */
  const menuItems: ContextMenuItem[] = [
    {
      label: 'Add as New Board',
      icon: Folder,
      onClick: handleAddAsBoard,
    },
    {
      label: 'Add as New List',
      icon: List,
      submenu: buildAddAsListSubmenu(),
    },
    {
      label: 'Add as New Card',
      icon: FileText,
      submenu: buildAddAsCardSubmenu(),
    },
    {
      label: 'Add to Existing Card',
      icon: Paperclip,
      submenu: buildAddToCardSubmenu(),
    },
  ];

  return (
    <ContextMenu
      items={menuItems}
      position={position}
      onClose={onClose}
    />
  );
}

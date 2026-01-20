/**
 * AddFileToBoardMenu Component
 *
 * 3-5 level nested context menu for adding files from Explorer to boards.
 *
 * Menu Structure:
 * - Level 1: "Add to Board" (root item)
 * - Level 2: Action type (Add as New Board | Add as New List | Add as New Card | Add to Existing Card)
 * - Level 3: Board selection (lazy-loaded from useBoards)
 * - Level 4: List selection (lazy-loaded from useBoardHierarchy)
 * - Level 5: Card selection (only for "Add to Existing Card")
 */

'use client';

import React, { useState } from 'react';
import { Loader2, Folder, List, FileText, Paperclip } from 'lucide-react';
import type { AddFileToBoardMenuProps, FileData } from '@/types/file-board-integration';
import type { Board, BoardList, BoardCard } from '@/types/boards';
import { useBoards } from '@/hooks/useBoards';
import { useBoardHierarchy } from '@/hooks/useBoardHierarchy';
import ContextMenu, { ContextMenuItem } from './ContextMenu';
import { createBoardFromFile, createListFromFile, createCardFromFile, attachFileToCard } from '@/lib/boards/file-to-board-helpers';

export default function AddFileToBoardMenu({
  file,
  position,
  onClose,
  onSuccess,
  onError,
}: AddFileToBoardMenuProps) {
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [selectedList, setSelectedList] = useState<BoardList | null>(null);

  // Fetch all boards (cached for 30s)
  const { boards, loading: boardsLoading } = useBoards();

  // Lazy-load board hierarchy when board is hovered
  const { lists, cardsByListId, loading: hierarchyLoading } = useBoardHierarchy({
    boardId: selectedBoard?.id || null,
    autoFetch: false,
  });

  /**
   * Handle "Add as New Board" action
   * Creates: board → initial list ("To Do") → initial card (with file attachment)
   */
  const handleAddAsBoard = async () => {
    try {
      // Step 1: Create board, list, and card data
      const { board: boardData, initialList: listData, initialCard: cardData } = createBoardFromFile({
        file,
        projectId: undefined, // TODO: Get from ProjectsContext if needed
      });

      // Step 2: Create board
      const boardResponse = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(boardData),
      });

      if (!boardResponse.ok) {
        throw new Error('Failed to create board');
      }

      const boardResult = await boardResponse.json();
      if (!boardResult.success) {
        throw new Error(boardResult.error || 'Failed to create board');
      }

      const newBoard: Board = boardResult.data;

      // Step 3: Create initial list
      const listResponse = await fetch(`/api/boards/${newBoard.id}/lists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listData),
      });

      if (!listResponse.ok) {
        throw new Error('Failed to create list');
      }

      const listResult = await listResponse.json();
      if (!listResult.success) {
        throw new Error(listResult.error || 'Failed to create list');
      }

      const newList: BoardList = listResult.data;

      // Step 4: Create initial card
      const cardResponse = await fetch(`/api/boards/${newBoard.id}/lists/${newList.id}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...cardData, listId: newList.id }),
      });

      if (!cardResponse.ok) {
        throw new Error('Failed to create card');
      }

      const cardResult = await cardResponse.json();
      if (!cardResult.success) {
        throw new Error(cardResult.error || 'Failed to create card');
      }

      const newCard: BoardCard = cardResult.data.card;

      // Success callback
      onSuccess?.({
        action: 'as_board',
        board: newBoard,
        list: newList,
        card: newCard,
        message: `Created board "${newBoard.name}" with file "${file.name}"`,
      });

      onClose();
    } catch (error) {
      console.error('Error adding as board:', error);
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  };

  /**
   * Handle "Add as New List" action
   * Creates: list in selected board → optional card (with file attachment)
   */
  const handleAddAsList = async (board: Board) => {
    try {
      // Step 1: Create list and optional card data
      const { list: listData, initialCard: cardData } = createListFromFile({
        file,
        boardId: board.id,
        createCard: true, // Always create initial card
      });

      // Calculate next list order
      const nextOrder = board.lists.length;

      // Step 2: Create list
      const listResponse = await fetch(`/api/boards/${board.id}/lists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...listData, order: nextOrder }),
      });

      if (!listResponse.ok) {
        throw new Error('Failed to create list');
      }

      const listResult = await listResponse.json();
      if (!listResult.success) {
        throw new Error(listResult.error || 'Failed to create list');
      }

      const newList: BoardList = listResult.data;

      // Step 3: Create initial card (if requested)
      let newCard: BoardCard | undefined;
      if (cardData) {
        const cardResponse = await fetch(`/api/boards/${board.id}/lists/${newList.id}/cards`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...cardData, listId: newList.id }),
        });

        if (cardResponse.ok) {
          const cardResult = await cardResponse.json();
          if (cardResult.success) {
            newCard = cardResult.data.card;
          }
        }
      }

      // Success callback
      onSuccess?.({
        action: 'as_list',
        board,
        list: newList,
        card: newCard!,
        message: `Created list "${newList.title}" in board "${board.name}"`,
      });

      onClose();
    } catch (error) {
      console.error('Error adding as list:', error);
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  };

  /**
   * Handle "Add as New Card" action
   * Creates: card in selected list (with file attachment)
   */
  const handleAddAsCard = async (board: Board, list: BoardList) => {
    try {
      // Step 1: Create card data
      const cardData = createCardFromFile({
        file,
        boardId: board.id,
        listId: list.id,
      });

      // Calculate next card order
      const nextOrder = list.cardIds.length;

      // Step 2: Create card
      const cardResponse = await fetch(`/api/boards/${board.id}/lists/${list.id}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...cardData, order: nextOrder }),
      });

      if (!cardResponse.ok) {
        throw new Error('Failed to create card');
      }

      const cardResult = await cardResponse.json();
      if (!cardResult.success) {
        throw new Error(cardResult.error || 'Failed to create card');
      }

      const newCard: BoardCard = cardResult.data.card;

      // Success callback
      onSuccess?.({
        action: 'as_card',
        board,
        list,
        card: newCard,
        message: `Created card "${newCard.title}" in list "${list.title}"`,
      });

      onClose();
    } catch (error) {
      console.error('Error adding as card:', error);
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  };

  /**
   * Handle "Add to Existing Card" action
   * Attaches file to selected card
   */
  const handleAddToCard = async (board: Board, list: BoardList, card: BoardCard) => {
    try {
      // Step 1: Create updated card data
      const { updatedAttachments, updatedDescription, updatedTags } = attachFileToCard(
        {
          file,
          boardId: board.id,
          listId: list.id,
          cardId: card.id,
          appendToDescription: false, // Don't append to description by default
        },
        card
      );

      // Step 2: Update card
      const cardResponse = await fetch(`/api/boards/${board.id}/lists/${list.id}/cards/${card.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attachments: updatedAttachments,
          description: updatedDescription,
          tags: updatedTags,
        }),
      });

      if (!cardResponse.ok) {
        throw new Error('Failed to update card');
      }

      const cardResult = await cardResponse.json();
      if (!cardResult.success) {
        throw new Error(cardResult.error || 'Failed to update card');
      }

      const updatedCard: BoardCard = cardResult.data.card;

      // Success callback
      onSuccess?.({
        action: 'to_card',
        board,
        list,
        card: updatedCard,
        message: `Attached "${file.name}" to card "${card.title}"`,
      });

      onClose();
    } catch (error) {
      console.error('Error adding to card:', error);
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  };

  /**
   * Build menu items for board picker
   */
  const buildBoardPickerItems = (onSelectBoard: (board: Board) => void): ContextMenuItem[] => {
    if (boardsLoading) {
      return [
        {
          label: 'Loading boards...',
          icon: Loader2,
          iconClassName: 'animate-spin',
          onClick: () => {},
        },
      ];
    }

    if (boards.length === 0) {
      return [
        {
          label: 'No boards found',
          icon: Folder,
          textClassName: 'text-ind-text-muted',
          onClick: () => {},
        },
      ];
    }

    return boards.map((board) => ({
      label: board.name,
      icon: Folder,
      onClick: () => onSelectBoard(board),
    }));
  };

  /**
   * Build menu items for list picker
   */
  const buildListPickerItems = (
    board: Board,
    onSelectList: (list: BoardList) => void
  ): ContextMenuItem[] => {
    if (hierarchyLoading) {
      return [
        {
          label: 'Loading lists...',
          icon: Loader2,
          iconClassName: 'animate-spin',
          onClick: () => {},
        },
      ];
    }

    if (lists.length === 0) {
      return [
        {
          label: 'No lists found',
          icon: List,
          textClassName: 'text-ind-text-muted',
          onClick: () => {},
        },
      ];
    }

    return lists.map((list) => ({
      label: list.title,
      icon: List,
      onClick: () => onSelectList(list),
    }));
  };

  /**
   * Build menu items for card picker
   */
  const buildCardPickerItems = (
    board: Board,
    list: BoardList,
    onSelectCard: (card: BoardCard) => void
  ): ContextMenuItem[] => {
    const cards = cardsByListId[list.id] || [];

    if (hierarchyLoading) {
      return [
        {
          label: 'Loading cards...',
          icon: Loader2,
          iconClassName: 'animate-spin',
          onClick: () => {},
        },
      ];
    }

    if (cards.length === 0) {
      return [
        {
          label: 'No cards found',
          icon: FileText,
          textClassName: 'text-ind-text-muted',
          onClick: () => {},
        },
      ];
    }

    return cards.map((card) => ({
      label: card.title,
      icon: FileText,
      onClick: () => onSelectCard(card),
    }));
  };

  /**
   * Build "Add as New List" submenu (board picker)
   */
  const buildAddAsListSubmenu = (): ContextMenuItem[] => {
    return buildBoardPickerItems((board) => handleAddAsList(board));
  };

  /**
   * Build "Add as New Card" submenu (board picker → list picker)
   */
  const buildAddAsCardSubmenu = (): ContextMenuItem[] => {
    return buildBoardPickerItems((board) => {
      setSelectedBoard(board);
      // Return list picker items
      return buildListPickerItems(board, (list) => handleAddAsCard(board, list));
    }).map((boardItem) => ({
      ...boardItem,
      submenu: boardItem.onClick
        ? undefined
        : buildListPickerItems(boards.find((b) => b.name === boardItem.label)!, (list) =>
            handleAddAsCard(boards.find((b) => b.name === boardItem.label)!, list)
          ),
    }));
  };

  /**
   * Build "Add to Existing Card" submenu (board picker → list picker → card picker)
   */
  const buildAddToCardSubmenu = (): ContextMenuItem[] => {
    return boards.map((board) => ({
      label: board.name,
      icon: Folder,
      submenu: lists
        .filter((list) => list.id) // Only show lists that exist
        .map((list) => ({
          label: list.title,
          icon: List,
          submenu: (cardsByListId[list.id] || []).map((card) => ({
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

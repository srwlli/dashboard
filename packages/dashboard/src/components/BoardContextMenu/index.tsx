/**
 * BoardContextMenu Component
 *
 * Specialized context menu for adding workorders/stubs to boards
 * Supports nested navigation: Board → List → "Add as Card"
 * Also includes "Add as New Board" option
 */

'use client';

import { useEffect, useState } from 'react';
import { LayoutGrid, Plus, FileText } from 'lucide-react';
import { ContextMenu, ContextMenuItem } from '@/components/coderef/ContextMenu';
import { useBoardsCache } from '@/hooks/useBoardsCache';

interface BoardContextMenuProps {
  /** X coordinate for menu position */
  x: number;
  /** Y coordinate for menu position */
  y: number;
  /** Title for the new board/card */
  title: string;
  /** Description/content for the new board/card */
  description?: string;
  /** Callback when menu closes */
  onClose: () => void;
  /** Callback when board/card is created successfully */
  onSuccess?: (type: 'board' | 'card', id: string) => void;
}

/**
 * BoardContextMenu - Context menu for adding items to boards
 *
 * Features:
 * - "Add as New Board" - Creates a new board with the item as first card
 * - "Add to Existing Board" - Nested submenu showing all boards → lists → "Add as Card"
 * - Automatic board/list/card creation via useBoardsCache hook
 * - Success callbacks for user feedback
 */
export function BoardContextMenu({
  x,
  y,
  title,
  description,
  onClose,
  onSuccess,
}: BoardContextMenuProps) {
  const { boards, getBoardDetail, createBoard, createList, createCard } = useBoardsCache();
  const [menuItems, setMenuItems] = useState<ContextMenuItem[]>([]);

  useEffect(() => {
    buildMenuItems();
  }, [boards]);

  /**
   * Handle "Add as New Board" action
   * Creates a new board with a default "To Do" list and the item as first card
   */
  const handleAddAsNewBoard = async () => {
    const boardId = await createBoard({
      name: title,
    });

    if (!boardId) {
      console.error('Failed to create board');
      return;
    }

    // Create default "To Do" list
    const listId = await createList(boardId, {
      title: 'To Do',
      order: 0,
    });

    if (!listId) {
      console.error('Failed to create list');
      return;
    }

    // Create card with the item details
    const cardId = await createCard(boardId, {
      listId,
      title,
      description,
      order: 0,
    });

    if (cardId) {
      onSuccess?.('board', boardId);
    }
  };

  /**
   * Handle "Add as Card" to existing list
   */
  const handleAddToList = async (boardId: string, listId: string) => {
    // Get board details to determine next card order
    const boardDetail = await getBoardDetail(boardId);
    const cardsInList = boardDetail?.cards?.[listId] || [];
    const nextOrder = cardsInList.length;

    const cardId = await createCard(boardId, {
      listId,
      title,
      description,
      order: nextOrder,
    });

    if (cardId) {
      onSuccess?.('card', cardId);
    }
  };

  /**
   * Build nested menu structure dynamically
   */
  const buildMenuItems = async () => {
    const items: ContextMenuItem[] = [
      {
        label: 'Add as New Board',
        icon: Plus,
        onClick: handleAddAsNewBoard,
      },
    ];

    // Only show "Add to Existing Board" if there are boards
    if (boards.length > 0) {
      // Build nested submenu for each board
      const boardSubmenuItems: ContextMenuItem[] = [];

      for (const board of boards) {
        // Lazily load board details on hover (handled by submenu expansion)
        const listSubmenuItems: ContextMenuItem[] = [];

        // Pre-fetch board details to show lists
        const boardDetail = await getBoardDetail(board.id);

        if (boardDetail?.board?.lists) {
          for (const list of boardDetail.board.lists) {
            listSubmenuItems.push({
              label: list.title,
              icon: FileText,
              onClick: () => handleAddToList(board.id, list.id),
            });
          }
        }

        // Add "Add to New List" option
        listSubmenuItems.push({
          label: 'Add to New List',
          icon: Plus,
          onClick: async () => {
            const listId = await createList(board.id, {
              title: 'New List',
              order: boardDetail?.board?.lists.length || 0,
            });

            if (listId) {
              await handleAddToList(board.id, listId);
            }
          },
        });

        boardSubmenuItems.push({
          label: board.name,
          icon: LayoutGrid,
          submenu: listSubmenuItems,
        });
      }

      items.push({
        label: 'Add to Existing Board',
        icon: LayoutGrid,
        submenu: boardSubmenuItems,
      });
    }

    setMenuItems(items);
  };

  return (
    <ContextMenu
      x={x}
      y={y}
      items={menuItems}
      onClose={onClose}
    />
  );
}

export default BoardContextMenu;

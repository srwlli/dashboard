/**
 * /api/boards/[id]/lists/[listId]/reorder
 *
 * Batch reorder cards within a list (atomic operation)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse, ErrorCodes, HttpStatus } from '@/types/api';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import type { Board, BoardCard } from '@/types/boards';

/**
 * Get path to boards storage directory
 */
function getBoardsDir(): string {
  const homeDir = os.homedir();
  return path.join(homeDir, '.coderef-dashboard', 'boards');
}

/**
 * Get path to specific board directory
 */
function getBoardDir(boardId: string): string {
  return path.join(getBoardsDir(), `board-${boardId}`);
}

/**
 * Load board from board.json
 */
async function loadBoard(boardId: string): Promise<Board | null> {
  const boardFile = path.join(getBoardDir(boardId), 'board.json');

  try {
    const data = await fs.readFile(boardFile, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * Save board to board.json
 */
async function saveBoard(board: Board): Promise<void> {
  const boardFile = path.join(getBoardDir(board.id), 'board.json');
  await fs.writeFile(boardFile, JSON.stringify(board, null, 2), 'utf-8');
}

/**
 * Load cards for a specific list
 */
async function loadListCards(boardId: string, listId: string): Promise<BoardCard[]> {
  const cardFile = path.join(getBoardDir(boardId), 'cards', `${listId}.json`);

  try {
    const data = await fs.readFile(cardFile, 'utf-8');
    const cards: BoardCard[] = JSON.parse(data);
    // Sort cards by order field to ensure consistent ordering
    return cards.sort((a, b) => a.order - b.order);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

/**
 * Save cards for a specific list
 */
async function saveListCards(boardId: string, listId: string, cards: BoardCard[]): Promise<void> {
  const cardsDir = path.join(getBoardDir(boardId), 'cards');
  await fs.mkdir(cardsDir, { recursive: true });
  const cardFile = path.join(cardsDir, `${listId}.json`);
  await fs.writeFile(cardFile, JSON.stringify(cards, null, 2), 'utf-8');
}

/**
 * POST /api/boards/[id]/lists/[listId]/reorder
 * Atomically reorder all cards in a list
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; listId: string }> }
): Promise<NextResponse> {
  try {
    const { id, listId } = await params;
    const body: { cardOrders: Array<{ cardId: string; order: number }> } = await request.json();
    const { cardOrders } = body;

    // Validate request
    if (!cardOrders || !Array.isArray(cardOrders)) {
      const errorResponse = createErrorResponse(
        {
          code: 'VALIDATION_ERROR',
          message: 'Missing or invalid field: cardOrders (must be an array)',
        },
        { received: body }
      );
      return NextResponse.json(errorResponse, { status: HttpStatus.BAD_REQUEST });
    }

    const board = await loadBoard(id);
    if (!board) {
      const errorResponse = createErrorResponse(
        {
          code: 'BOARD_NOT_FOUND',
          message: `Board with ID '${id}' not found`,
        },
        { boardId: id }
      );
      return NextResponse.json(errorResponse, { status: HttpStatus.NOT_FOUND });
    }

    // Verify list exists
    const list = board.lists.find((l) => l.id === listId);
    if (!list) {
      const errorResponse = createErrorResponse(
        {
          code: 'LIST_NOT_FOUND',
          message: `List with ID '${listId}' not found`,
        },
        { listId }
      );
      return NextResponse.json(errorResponse, { status: HttpStatus.NOT_FOUND });
    }

    // Load existing cards
    const cards = await loadListCards(id, listId);

    // Create a map of cardId -> new order
    const orderMap = new Map<string, number>();
    for (const { cardId, order } of cardOrders) {
      orderMap.set(cardId, order);
    }

    // Update order for each card and track changes
    const now = new Date().toISOString();
    let updatedCount = 0;

    for (const card of cards) {
      const newOrder = orderMap.get(card.id);
      if (newOrder !== undefined && card.order !== newOrder) {
        card.order = newOrder;
        card.updatedAt = now;
        updatedCount++;
      }
    }

    // Validate that orders are sequential (0, 1, 2, ...)
    const sortedCards = cards.sort((a, b) => a.order - b.order);
    for (let i = 0; i < sortedCards.length; i++) {
      if (sortedCards[i].order !== i) {
        // Reindex to fix gaps or duplicates
        sortedCards[i].order = i;
        sortedCards[i].updatedAt = now;
      }
    }

    // Save updated cards atomically (single file write)
    await saveListCards(id, listId, sortedCards);

    // Update board's updatedAt timestamp
    board.updatedAt = now;
    await saveBoard(board);

    const response = createSuccessResponse({
      reordered: true,
      updatedCount,
      totalCards: sortedCards.length,
    });

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error) {
    const errorResponse = createErrorResponse(ErrorCodes.INTERNAL_ERROR, {
      reason: (error as Error).message,
    });
    return NextResponse.json(errorResponse, { status: HttpStatus.INTERNAL_ERROR });
  }
}

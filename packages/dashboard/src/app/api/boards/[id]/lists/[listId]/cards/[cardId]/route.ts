/**
 * /api/boards/[id]/lists/[listId]/cards/[cardId]
 *
 * Update or delete a specific card within a list
 */

import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse, ErrorCodes, HttpStatus } from '@/types/api';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import type { Board, BoardCard, UpdateCardRequest } from '@/types/boards';

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
    return JSON.parse(data);
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
 * PATCH /api/boards/[id]/lists/[listId]/cards/[cardId]
 * Update card properties, including moving to different list
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; listId: string; cardId: string } }
): Promise<NextResponse> {
  try {
    const { id, listId, cardId } = params;
    const updates: UpdateCardRequest = await request.json();

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

    // Load cards from current list
    const cards = await loadListCards(id, listId);
    const cardIndex = cards.findIndex((c) => c.id === cardId);

    if (cardIndex === -1) {
      const errorResponse = createErrorResponse(
        {
          code: 'CARD_NOT_FOUND',
          message: `Card with ID '${cardId}' not found in list '${listId}'`,
        },
        { cardId, listId }
      );
      return NextResponse.json(errorResponse, { status: HttpStatus.NOT_FOUND });
    }

    const card = cards[cardIndex];
    const now = new Date().toISOString();

    // Check if card is being moved to a different list
    if (updates.listId && updates.listId !== listId) {
      // Verify target list exists
      const targetList = board.lists.find((l) => l.id === updates.listId);
      if (!targetList) {
        const errorResponse = createErrorResponse(
          {
            code: 'LIST_NOT_FOUND',
            message: `Target list with ID '${updates.listId}' not found`,
          },
          { listId: updates.listId }
        );
        return NextResponse.json(errorResponse, { status: HttpStatus.NOT_FOUND });
      }

      // Remove card from current list
      cards.splice(cardIndex, 1);
      await saveListCards(id, listId, cards);

      // Update card properties
      card.listId = updates.listId;
      if (updates.title !== undefined) card.title = updates.title.trim();
      if (updates.description !== undefined) card.description = updates.description?.trim();
      if (updates.order !== undefined) card.order = updates.order;
      if (updates.attachments !== undefined) card.attachments = updates.attachments;
      if (updates.tags !== undefined) card.tags = updates.tags;
      card.updatedAt = now;

      // Add card to target list
      const targetCards = await loadListCards(id, updates.listId);
      targetCards.push(card);
      await saveListCards(id, updates.listId, targetCards);
    } else {
      // Update card in place
      if (updates.title !== undefined) {
        if (updates.title.trim() === '') {
          const errorResponse = createErrorResponse(
            {
              code: 'VALIDATION_ERROR',
              message: 'Card title cannot be empty',
            },
            { title: updates.title }
          );
          return NextResponse.json(errorResponse, { status: HttpStatus.BAD_REQUEST });
        }
        card.title = updates.title.trim();
      }

      if (updates.description !== undefined) {
        card.description = updates.description?.trim();
      }

      if (updates.order !== undefined) {
        card.order = updates.order;
      }

      if (updates.attachments !== undefined) {
        card.attachments = updates.attachments;
      }

      if (updates.tags !== undefined) {
        card.tags = updates.tags;
      }

      card.updatedAt = now;

      // Save updated cards
      await saveListCards(id, listId, cards);
    }

    // Update board's updatedAt timestamp
    board.updatedAt = now;
    await saveBoard(board);

    const response = createSuccessResponse({
      card,
      updated: true,
    });

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error) {
    const errorResponse = createErrorResponse(ErrorCodes.INTERNAL_ERROR, {
      reason: (error as Error).message,
    });
    return NextResponse.json(errorResponse, { status: HttpStatus.INTERNAL_ERROR });
  }
}

/**
 * DELETE /api/boards/[id]/lists/[listId]/cards/[cardId]
 * Delete card from list
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; listId: string; cardId: string } }
): Promise<NextResponse> {
  try {
    const { id, listId, cardId } = params;

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

    // Load cards from list
    const cards = await loadListCards(id, listId);
    const cardIndex = cards.findIndex((c) => c.id === cardId);

    if (cardIndex === -1) {
      const errorResponse = createErrorResponse(
        {
          code: 'CARD_NOT_FOUND',
          message: `Card with ID '${cardId}' not found in list '${listId}'`,
        },
        { cardId, listId }
      );
      return NextResponse.json(errorResponse, { status: HttpStatus.NOT_FOUND });
    }

    const card = cards[cardIndex];

    // Remove card
    cards.splice(cardIndex, 1);
    await saveListCards(id, listId, cards);

    // Update board's updatedAt timestamp
    board.updatedAt = new Date().toISOString();
    await saveBoard(board);

    const response = createSuccessResponse({
      deleted: true,
      cardId,
      cardTitle: card.title,
    });

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error) {
    const errorResponse = createErrorResponse(ErrorCodes.INTERNAL_ERROR, {
      reason: (error as Error).message,
    });
    return NextResponse.json(errorResponse, { status: HttpStatus.INTERNAL_ERROR });
  }
}

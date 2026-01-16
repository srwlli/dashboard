/**
 * /api/boards/[id]/lists/[listId]/cards
 *
 * Create cards within a list
 */

import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse, ErrorCodes, HttpStatus } from '@/types/api';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import type { Board, BoardCard, CreateCardRequest } from '@/types/boards';

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
 * POST /api/boards/[id]/lists/[listId]/cards
 * Create a new card in the list
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; listId: string } }
): Promise<NextResponse> {
  try {
    const { id, listId } = params;
    const body: CreateCardRequest = await request.json();
    const { title, description, order, tags } = body;

    // Validate required fields
    if (!title || title.trim() === '') {
      const errorResponse = createErrorResponse(
        {
          code: 'VALIDATION_ERROR',
          message: 'Missing required field: title',
        },
        { received: body }
      );
      return NextResponse.json(errorResponse, { status: HttpStatus.BAD_REQUEST });
    }

    if (order === undefined || order === null) {
      const errorResponse = createErrorResponse(
        {
          code: 'VALIDATION_ERROR',
          message: 'Missing required field: order',
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

    // Generate unique card ID
    const cardId = `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create new card
    const now = new Date().toISOString();
    const newCard: BoardCard = {
      id: cardId,
      listId,
      title: title.trim(),
      description: description?.trim(),
      order,
      attachments: [],
      tags: tags || [],
      createdAt: now,
      updatedAt: now,
    };

    // Load existing cards for this list
    const cards = await loadListCards(id, listId);
    cards.push(newCard);

    // Save updated cards
    await saveListCards(id, listId, cards);

    // Update board's updatedAt timestamp
    board.updatedAt = now;
    await saveBoard(board);

    const response = createSuccessResponse({
      card: newCard,
      created: true,
    });

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error) {
    const errorResponse = createErrorResponse(ErrorCodes.INTERNAL_ERROR, {
      reason: (error as Error).message,
    });
    return NextResponse.json(errorResponse, { status: HttpStatus.INTERNAL_ERROR });
  }
}

/**
 * /api/boards/[id]
 *
 * Get, update, or delete a specific board
 */

import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse, ErrorCodes, HttpStatus } from '@/types/api';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import type { Board, BoardCard, BoardDetailResponse, UpdateBoardRequest } from '@/types/boards';

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
 * Load all cards for a board, organized by listId
 */
async function loadCards(boardId: string): Promise<Record<string, BoardCard[]>> {
  const cardsDir = path.join(getBoardDir(boardId), 'cards');
  const cards: Record<string, BoardCard[]> = {};

  try {
    const files = await fs.readdir(cardsDir);

    for (const file of files) {
      if (file.endsWith('.json')) {
        const listId = file.replace('.json', '');
        const cardFile = path.join(cardsDir, file);
        const data = await fs.readFile(cardFile, 'utf-8');
        const listCards: BoardCard[] = JSON.parse(data);
        cards[listId] = listCards;
      }
    }
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
    // No cards directory yet - return empty
  }

  return cards;
}

/**
 * GET /api/boards/[id]
 * Returns complete board with all lists and cards
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

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

    const cards = await loadCards(id);

    const response: BoardDetailResponse = {
      board,
      cards,
    };

    return NextResponse.json(createSuccessResponse(response), { status: HttpStatus.OK });
  } catch (error) {
    const errorResponse = createErrorResponse(ErrorCodes.INTERNAL_ERROR, {
      reason: (error as Error).message,
    });
    return NextResponse.json(errorResponse, { status: HttpStatus.INTERNAL_ERROR });
  }
}

/**
 * PATCH /api/boards/[id]
 * Update board name, projectId, or linkedPath
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const updates: UpdateBoardRequest = await request.json();

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

    // Apply updates
    if (updates.name !== undefined) {
      if (updates.name.trim() === '') {
        const errorResponse = createErrorResponse(
          {
            code: 'VALIDATION_ERROR',
            message: 'Board name cannot be empty',
          },
          { name: updates.name }
        );
        return NextResponse.json(errorResponse, { status: HttpStatus.BAD_REQUEST });
      }
      board.name = updates.name.trim();
    }

    if (updates.projectId !== undefined) {
      board.projectId = updates.projectId || undefined;
    }

    if (updates.linkedPath !== undefined) {
      board.linkedPath = updates.linkedPath || undefined;
    }

    board.updatedAt = new Date().toISOString();

    await saveBoard(board);

    const response = createSuccessResponse({
      board,
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
 * DELETE /api/boards/[id]
 * Delete board and all associated data
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

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

    // Delete entire board directory
    const boardDir = getBoardDir(id);
    await fs.rm(boardDir, { recursive: true, force: true });

    const response = createSuccessResponse({
      deleted: true,
      boardId: id,
      boardName: board.name,
    });

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error) {
    const errorResponse = createErrorResponse(ErrorCodes.INTERNAL_ERROR, {
      reason: (error as Error).message,
    });
    return NextResponse.json(errorResponse, { status: HttpStatus.INTERNAL_ERROR });
  }
}

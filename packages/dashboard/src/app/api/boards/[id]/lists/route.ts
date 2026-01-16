/**
 * /api/boards/[id]/lists
 *
 * Create lists within a board
 */

import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse, ErrorCodes, HttpStatus } from '@/types/api';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import type { Board, BoardList, CreateListRequest } from '@/types/boards';

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
 * POST /api/boards/[id]/lists
 * Create a new list in the board
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = params;
    const body: CreateListRequest = await request.json();
    const { title, order, color } = body;

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

    // Generate unique list ID
    const listId = `list-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create new list
    const now = new Date().toISOString();
    const newList: BoardList = {
      id: listId,
      title: title.trim(),
      collapsed: false,
      order,
      cardIds: [],
      color,
      createdAt: now,
    };

    // Add list to board
    board.lists.push(newList);
    board.updatedAt = now;

    await saveBoard(board);

    // Create empty cards file for this list
    const cardsDir = path.join(getBoardDir(id), 'cards');
    await fs.mkdir(cardsDir, { recursive: true });
    const cardFile = path.join(cardsDir, `${listId}.json`);
    await fs.writeFile(cardFile, JSON.stringify([], null, 2), 'utf-8');

    const response = createSuccessResponse({
      list: newList,
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

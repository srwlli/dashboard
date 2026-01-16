/**
 * /api/boards/[id]/lists/[listId]
 *
 * Update or delete a specific list within a board
 */

import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse, ErrorCodes, HttpStatus } from '@/types/api';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import type { Board, UpdateListRequest } from '@/types/boards';

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
 * PATCH /api/boards/[id]/lists/[listId]
 * Update list title, order, collapsed state, or color
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; listId: string } }
): Promise<NextResponse> {
  try {
    const { id, listId } = params;
    const updates: UpdateListRequest = await request.json();

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

    // Find the list
    const listIndex = board.lists.findIndex((list) => list.id === listId);
    if (listIndex === -1) {
      const errorResponse = createErrorResponse(
        {
          code: 'LIST_NOT_FOUND',
          message: `List with ID '${listId}' not found`,
        },
        { listId }
      );
      return NextResponse.json(errorResponse, { status: HttpStatus.NOT_FOUND });
    }

    const list = board.lists[listIndex];

    // Apply updates
    if (updates.title !== undefined) {
      if (updates.title.trim() === '') {
        const errorResponse = createErrorResponse(
          {
            code: 'VALIDATION_ERROR',
            message: 'List title cannot be empty',
          },
          { title: updates.title }
        );
        return NextResponse.json(errorResponse, { status: HttpStatus.BAD_REQUEST });
      }
      list.title = updates.title.trim();
    }

    if (updates.order !== undefined) {
      list.order = updates.order;
    }

    if (updates.collapsed !== undefined) {
      list.collapsed = updates.collapsed;
    }

    if (updates.color !== undefined) {
      list.color = updates.color || undefined;
    }

    board.updatedAt = new Date().toISOString();

    await saveBoard(board);

    const response = createSuccessResponse({
      list,
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
 * DELETE /api/boards/[id]/lists/[listId]
 * Delete list and its associated cards file
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; listId: string } }
): Promise<NextResponse> {
  try {
    const { id, listId } = params;

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

    // Find the list
    const listIndex = board.lists.findIndex((list) => list.id === listId);
    if (listIndex === -1) {
      const errorResponse = createErrorResponse(
        {
          code: 'LIST_NOT_FOUND',
          message: `List with ID '${listId}' not found`,
        },
        { listId }
      );
      return NextResponse.json(errorResponse, { status: HttpStatus.NOT_FOUND });
    }

    const list = board.lists[listIndex];

    // Remove list from board
    board.lists.splice(listIndex, 1);
    board.updatedAt = new Date().toISOString();

    await saveBoard(board);

    // Delete associated cards file
    const cardFile = path.join(getBoardDir(id), 'cards', `${listId}.json`);
    try {
      await fs.unlink(cardFile);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      // File doesn't exist - that's fine
    }

    const response = createSuccessResponse({
      deleted: true,
      listId,
      listTitle: list.title,
    });

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error) {
    const errorResponse = createErrorResponse(ErrorCodes.INTERNAL_ERROR, {
      reason: (error as Error).message,
    });
    return NextResponse.json(errorResponse, { status: HttpStatus.INTERNAL_ERROR });
  }
}

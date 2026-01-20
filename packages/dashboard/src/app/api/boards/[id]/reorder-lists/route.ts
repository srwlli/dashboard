/**
 * /api/boards/[id]/reorder-lists
 *
 * Batch reorder lists within a board (atomic operation)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse, ErrorCodes, HttpStatus } from '@/types/api';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import type { Board } from '@/types/boards';

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
 * POST /api/boards/[id]/reorder-lists
 * Atomically reorder all lists in a board
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body: { listOrders: Array<{ listId: string; order: number }> } = await request.json();
    const { listOrders } = body;

    // Validate request
    if (!listOrders || !Array.isArray(listOrders)) {
      const errorResponse = createErrorResponse(
        {
          code: 'VALIDATION_ERROR',
          message: 'Missing or invalid field: listOrders (must be an array)',
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

    // Create a map of listId -> new order
    const orderMap = new Map<string, number>();
    for (const { listId, order } of listOrders) {
      orderMap.set(listId, order);
    }

    // Update order for each list and track changes
    const now = new Date().toISOString();
    let updatedCount = 0;

    for (const list of board.lists) {
      const newOrder = orderMap.get(list.id);
      if (newOrder !== undefined && list.order !== newOrder) {
        list.order = newOrder;
        updatedCount++;
      }
    }

    // Validate that orders are sequential (0, 1, 2, ...)
    const sortedLists = board.lists.sort((a, b) => a.order - b.order);
    for (let i = 0; i < sortedLists.length; i++) {
      if (sortedLists[i].order !== i) {
        // Reindex to fix gaps or duplicates
        sortedLists[i].order = i;
      }
    }

    // Update board metadata
    board.lists = sortedLists;
    board.updatedAt = now;

    // Save updated board atomically (single file write)
    await saveBoard(board);

    const response = createSuccessResponse({
      reordered: true,
      updatedCount,
      totalLists: sortedLists.length,
    });

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error) {
    const errorResponse = createErrorResponse(ErrorCodes.INTERNAL_ERROR, {
      reason: (error as Error).message,
    });
    return NextResponse.json(errorResponse, { status: HttpStatus.INTERNAL_ERROR });
  }
}

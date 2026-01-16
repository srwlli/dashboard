/**
 * /api/boards
 *
 * List all boards or create a new board
 */

import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse, ErrorCodes, HttpStatus } from '@/types/api';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import type { Board, BoardsListResponse, BoardMetadata, CreateBoardRequest } from '@/types/boards';

/**
 * Get path to boards storage directory
 * Stored in user's home directory: ~/.coderef-dashboard/boards/
 */
function getBoardsDir(): string {
  const homeDir = os.homedir();
  return path.join(homeDir, '.coderef-dashboard', 'boards');
}

/**
 * Ensure boards directory exists
 */
async function ensureBoardsDir(): Promise<void> {
  const boardsDir = getBoardsDir();

  try {
    await fs.access(boardsDir);
  } catch {
    await fs.mkdir(boardsDir, { recursive: true });
  }
}

/**
 * Load board metadata from board.json
 */
async function loadBoardMetadata(boardId: string): Promise<BoardMetadata | null> {
  const boardDir = path.join(getBoardsDir(), `board-${boardId}`);
  const boardFile = path.join(boardDir, 'board.json');

  try {
    const data = await fs.readFile(boardFile, 'utf-8');
    const board: Board = JSON.parse(data);

    // Count cards across all lists
    let cardCount = 0;
    try {
      const cardsDir = path.join(boardDir, 'cards');
      const cardFiles = await fs.readdir(cardsDir);
      for (const file of cardFiles) {
        if (file.endsWith('.json')) {
          const cardData = await fs.readFile(path.join(cardsDir, file), 'utf-8');
          const cards = JSON.parse(cardData);
          cardCount += Array.isArray(cards) ? cards.length : 0;
        }
      }
    } catch {
      // No cards directory or error reading - default to 0
    }

    return {
      id: board.id,
      name: board.name,
      projectId: board.projectId,
      linkedPath: board.linkedPath,
      listCount: board.lists.length,
      cardCount,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
    };
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return null; // Board doesn't exist
    }
    throw error;
  }
}

/**
 * GET /api/boards
 * Returns list of all boards with metadata
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await ensureBoardsDir();
    const boardsDir = getBoardsDir();

    // Read all board directories
    const entries = await fs.readdir(boardsDir, { withFileTypes: true });
    const boardDirs = entries.filter(
      (entry) => entry.isDirectory() && entry.name.startsWith('board-')
    );

    // Load metadata for each board
    const boards: BoardMetadata[] = [];
    for (const dir of boardDirs) {
      const boardId = dir.name.replace('board-', '');
      const metadata = await loadBoardMetadata(boardId);
      if (metadata) {
        boards.push(metadata);
      }
    }

    // Sort by most recently updated
    boards.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const response: BoardsListResponse = {
      boards,
      total: boards.length,
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
 * POST /api/boards
 * Create a new board
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: CreateBoardRequest = await request.json();
    const { name, projectId, linkedPath } = body;

    // Validate required fields
    if (!name || name.trim() === '') {
      const errorResponse = createErrorResponse(
        {
          code: 'VALIDATION_ERROR',
          message: 'Missing required field: name',
        },
        { received: body }
      );
      return NextResponse.json(errorResponse, { status: HttpStatus.BAD_REQUEST });
    }

    await ensureBoardsDir();

    // Generate unique board ID (timestamp-based UUID)
    const boardId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const boardDir = path.join(getBoardsDir(), `board-${boardId}`);
    const cardsDir = path.join(boardDir, 'cards');

    // Create board directory structure
    await fs.mkdir(boardDir, { recursive: true });
    await fs.mkdir(cardsDir, { recursive: true });

    // Create board object
    const now = new Date().toISOString();
    const board: Board = {
      id: boardId,
      name: name.trim(),
      projectId,
      linkedPath,
      lists: [],
      createdAt: now,
      updatedAt: now,
    };

    // Write board.json
    const boardFile = path.join(boardDir, 'board.json');
    await fs.writeFile(boardFile, JSON.stringify(board, null, 2), 'utf-8');

    const response = createSuccessResponse({
      board,
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

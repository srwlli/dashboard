/**
 * GET /api/stubs
 *
 * Fetch all stubs from the centralized stubs directory.
 * Stubs are the backlog of pending work items.
 * Uses unified storage: ~/.coderef-dashboard/projects.json
 * Reads optional stubs_directory field (fallback: ~/Desktop/assistant/stubs)
 */

import { NextResponse } from 'next/server';
import { createProjectsConfig } from '@/lib/api/projects';
import { StubReader } from '@/lib/api/stubs';
import { StubListResponse } from '@/types/stubs';
import { createErrorResponse, ErrorCodes, HttpStatus } from '@/types/api';

/**
 * GET /api/stubs
 * Returns all stubs from centralized directory (configured in unified storage)
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Load projects from unified storage (~/.coderef-dashboard/projects.json)
    const projectsConfig = createProjectsConfig();
    try {
      projectsConfig.load();
    } catch (error) {
      const errorResponse = createErrorResponse(ErrorCodes.CONFIG_MISSING, {
        reason: (error as Error).message,
      });
      return NextResponse.json(errorResponse, { status: HttpStatus.INTERNAL_ERROR });
    }

    // Get stubs directory
    let stubsDir: string;
    try {
      stubsDir = projectsConfig.getStubsDir();
    } catch (error) {
      const errorResponse = createErrorResponse(ErrorCodes.CONFIG_INVALID, {
        reason: 'centralized.stubs_dir not found in config',
      });
      return NextResponse.json(errorResponse, { status: HttpStatus.INTERNAL_ERROR });
    }

    // Read all stubs
    let stubs: Array<any>;
    try {
      const reader = new StubReader(stubsDir);
      stubs = reader.readAllStubs();
    } catch (error) {
      const errorResponse = createErrorResponse(ErrorCodes.PARSE_ERROR, {
        reason: (error as Error).message,
      });
      return NextResponse.json(errorResponse, { status: HttpStatus.INTERNAL_ERROR });
    }

    // Build response
    const response: StubListResponse = {
      success: true,
      data: {
        stubs,
        total: stubs.length,
        location: stubsDir,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error) {
    const errorResponse = createErrorResponse(ErrorCodes.INTERNAL_ERROR, {
      reason: (error as Error).message,
    });
    return NextResponse.json(errorResponse, { status: HttpStatus.INTERNAL_ERROR });
  }
}

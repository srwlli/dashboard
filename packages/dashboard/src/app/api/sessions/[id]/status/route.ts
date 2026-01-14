/**
 * PATCH /api/sessions/[id]/status
 *
 * Manually update session status
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateSessionStatus } from '@/lib/api/sessions';
import { createErrorResponse, createSuccessResponse, ErrorCodes, HttpStatus } from '@/types/api';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ['not_started', 'in_progress', 'complete'];
    if (!status || !validStatuses.includes(status)) {
      const errorResponse = createErrorResponse(
        {
          code: 'VALIDATION_ERROR',
          message: 'Invalid status. Must be one of: not_started, in_progress, complete',
        },
        { received: status }
      );
      return NextResponse.json(errorResponse, { status: HttpStatus.BAD_REQUEST });
    }

    // Update session status
    const result = await updateSessionStatus(id, status);

    if (!result) {
      const errorResponse = createErrorResponse(
        {
          code: 'SESSION_NOT_FOUND',
          message: `Session not found: ${id}`,
        }
      );
      return NextResponse.json(errorResponse, { status: HttpStatus.NOT_FOUND });
    }

    return NextResponse.json(
      createSuccessResponse({
        sessionId: id,
        status: result.status,
        updated: true,
      }),
      { status: HttpStatus.OK }
    );
  } catch (error: any) {
    console.error('[Sessions API] Failed to update status:', error);

    const errorResponse = createErrorResponse(
      {
        code: 'UPDATE_STATUS_FAILED',
        message: 'Failed to update session status',
      },
      { details: error.message }
    );
    return NextResponse.json(errorResponse, { status: HttpStatus.INTERNAL_ERROR });
  }
}

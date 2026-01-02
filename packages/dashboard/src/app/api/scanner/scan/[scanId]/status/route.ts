/**
 * Scanner Scan API - Status Endpoint
 *
 * GET /api/scanner/scan/:scanId/status - Get scan progress
 */

import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '@/types/api';
import { getScanExecutor } from '../../../lib/scanExecutor';

/**
 * GET /api/scanner/scan/:scanId/status
 * Returns current scan progress and status
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  try {
    const { scanId } = await params;

    const executor = getScanExecutor(scanId);

    if (!executor) {
      return NextResponse.json(
        createErrorResponse(
          { code: 'SCAN_NOT_FOUND', message: 'Scan not found or expired' }
        ),
        { status: 404 }
      );
    }

    const status = executor.getScanStatus();

    return NextResponse.json(
      createSuccessResponse(status),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Scanner API] Failed to get scan status:', error);

    return NextResponse.json(
      createErrorResponse(
        { code: 'GET_STATUS_FAILED', message: 'Failed to get scan status' },
        { details: error.message }
      ),
      { status: 500 }
    );
  }
}

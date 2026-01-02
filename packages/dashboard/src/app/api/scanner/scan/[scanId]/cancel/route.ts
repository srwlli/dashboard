/**
 * Scanner Scan API - Cancel Endpoint
 *
 * POST /api/scanner/scan/:scanId/cancel - Cancel running scan
 */

import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '@/types/api';
import { getScanExecutor } from '../../../lib/scanExecutor';

/**
 * POST /api/scanner/scan/:scanId/cancel
 * Cancel a currently running scan
 */
export async function POST(
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

    executor.cancelScan();

    return NextResponse.json(
      createSuccessResponse({ message: 'Scan cancelled' }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Scanner API] Failed to cancel scan:', error);

    return NextResponse.json(
      createErrorResponse(
        { code: 'CANCEL_SCAN_FAILED', message: 'Failed to cancel scan' },
        { details: error.message }
      ),
      { status: 500 }
    );
  }
}

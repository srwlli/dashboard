/**
 * Scanner Debug API - Registry Inspection Endpoint
 *
 * GET /api/scanner/debug/registry - Inspect active scans in registry
 */

import { NextRequest, NextResponse } from 'next/server';
import { inspectScanRegistry } from '../../lib/scanExecutor';
import { createSuccessResponse } from '@/types/api';

/**
 * GET /api/scanner/debug/registry
 * Returns current state of the scan executor registry
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     registrySize: number,
 *     scanIds: string[],
 *     timestamp: string,
 *     scans: Array<{
 *       scanId: string,
 *       status: string,
 *       projectCount: number,
 *       currentProject: number,
 *       startedAt: string | null,
 *       completedAt: string | null,
 *       errorMessage: string | null
 *     }>
 *   }
 * }
 */
export async function GET(_request: NextRequest) {
  try {
    console.log('[Debug Registry] Inspection requested');

    // Call the inspection function from scanExecutor
    const registryData = inspectScanRegistry();

    return NextResponse.json(
      createSuccessResponse(registryData),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Debug Registry] Failed to inspect registry:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'REGISTRY_INSPECTION_FAILED',
          message: 'Failed to inspect registry',
        },
        details: error.message,
      },
      { status: 500 }
    );
  }
}

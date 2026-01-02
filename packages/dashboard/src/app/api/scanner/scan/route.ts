/**
 * Scanner Scan API - Trigger Endpoint
 *
 * POST /api/scanner/scan - Start a new scan
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import type { StartScanRequest, StartScanResponse, ScannerProject, ProjectsStorage } from '../types';
import { createErrorResponse, createSuccessResponse } from '@/types/api';
import { ScanExecutor, registerScanExecutor } from '../lib/scanExecutor';

/**
 * Load projects from storage
 */
async function loadProjects(): Promise<ScannerProject[]> {
  const storagePath = path.join(os.homedir(), '.coderef-scanner-projects.json');

  try {
    const data = await fs.readFile(storagePath, 'utf-8');
    const storage: ProjectsStorage = JSON.parse(data);
    return storage.projects || [];
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

/**
 * POST /api/scanner/scan
 * Start a new scan for selected projects
 *
 * Request body: { projectIds: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body: StartScanRequest = await request.json();
    const { projectIds } = body;

    // Validate request
    if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
      return NextResponse.json(
        createErrorResponse(
          { code: 'INVALID_REQUEST', message: 'projectIds array is required' }
        ),
        { status: 400 }
      );
    }

    // Load all projects
    const allProjects = await loadProjects();

    // Resolve project IDs to paths
    const projectPaths: string[] = [];
    for (const id of projectIds) {
      const project = allProjects.find((p) => p.id === id);
      if (!project) {
        return NextResponse.json(
          createErrorResponse(
            { code: 'PROJECT_NOT_FOUND', message: `Project not found: ${id}` }
          ),
          { status: 404 }
        );
      }
      projectPaths.push(project.path);
    }

    // Generate scan ID
    const scanId = randomUUID();

    // Create scan executor
    const executor = new ScanExecutor({
      scanId,
      projectPaths,
    });

    // Register executor globally
    registerScanExecutor(scanId, executor);

    // Start scan asynchronously (don't await)
    executor.startScan().catch((error) => {
      console.error(`[Scanner] Scan ${scanId} failed:`, error);
    });

    // Return scan ID immediately
    const response: StartScanResponse = {
      scanId,
      status: 'running',
      projectCount: projectPaths.length,
    };

    return NextResponse.json(
      createSuccessResponse(response),
      { status: 202 } // Accepted
    );
  } catch (error: any) {
    console.error('[Scanner API] Failed to start scan:', error);

    return NextResponse.json(
      createErrorResponse(
        { code: 'START_SCAN_FAILED', message: 'Failed to start scan' },
        { details: error.message }
      ),
      { status: 500 }
    );
  }
}

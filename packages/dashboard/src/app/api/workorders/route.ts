/**
 * GET /api/workorders
 *
 * Fetch all workorders from all tracked projects.
 * Aggregates workorders from multiple project directories.
 */

import { NextResponse } from 'next/server';
import { ProjectsConfig } from '@/lib/api/projects';
import { WorkorderReader } from '@/lib/api/workorders';
import { WorkorderListResponse } from '@/types/workorders';
import { createErrorResponse, ErrorCodes, HttpStatus } from '@/types/api';
import { resolve } from 'path';

/**
 * GET /api/workorders
 * Returns all workorders from all 6 tracked projects, aggregated
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Load projects config
    let projectsConfig: ProjectsConfig;
    try {
      const configPath = resolve(process.cwd(), '../assistant/projects.config.json');
      projectsConfig = new ProjectsConfig(configPath);
      projectsConfig.load();
    } catch (error) {
      const errorResponse = createErrorResponse(ErrorCodes.CONFIG_MISSING, {
        reason: (error as Error).message,
      });
      return NextResponse.json(errorResponse, { status: HttpStatus.INTERNAL_ERROR });
    }

    // Get all workorder directories
    let projectDirs: Array<{ projectId: string; projectName: string; path: string }>;
    try {
      projectDirs = projectsConfig.getAllWorkorderDirs();
    } catch (error) {
      const errorResponse = createErrorResponse(ErrorCodes.CONFIG_INVALID, {
        reason: (error as Error).message,
      });
      return NextResponse.json(errorResponse, { status: HttpStatus.INTERNAL_ERROR });
    }

    // Read workorders from all projects
    const allWorkorders: any[] = [];

    for (const projectDir of projectDirs) {
      try {
        const workorders = WorkorderReader.readProjectWorkorders(
          projectDir.path.split('/').slice(0, -2).join('/'), // Get project root (go up 2 levels)
          projectDir.projectId,
          projectDir.projectName,
          'coderef/workorder'
        );
        allWorkorders.push(...workorders);
      } catch (error) {
        // Log error but continue with other projects (graceful degradation)
        console.error(
          `Error reading workorders from project ${projectDir.projectId}:`,
          error
        );
      }
    }

    // Calculate aggregates
    const byProject = WorkorderReader.countByProject(allWorkorders);
    const byStatus = WorkorderReader.countByStatus(allWorkorders);

    // Build response
    const response: WorkorderListResponse = {
      success: true,
      data: {
        workorders: allWorkorders,
        total: allWorkorders.length,
        by_project: byProject,
        by_status: byStatus,
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

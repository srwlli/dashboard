/**
 * GET /api/workorders/[workorderId]
 *
 * Fetch a specific workorder with complete details and all files.
 * Searches across all projects for the requested workorder.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProjectsConfig } from '@/lib/api/projects';
import { WorkorderReader } from '@/lib/api/workorders';
import { WorkorderDetailResponse } from '@/types/workorders';
import { createErrorResponse, ErrorCodes, HttpStatus } from '@/types/api';
import { resolve } from 'path';

/**
 * GET /api/workorders/:workorderId
 * Returns specific workorder with all files
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ workorderId: string }> }
): Promise<NextResponse> {
  try {
    const { workorderId } = await params;

    if (!workorderId) {
      const errorResponse = createErrorResponse(ErrorCodes.WORKORDER_NOT_FOUND, {
        reason: 'workorderId parameter is required',
      });
      return NextResponse.json(errorResponse, { status: HttpStatus.NOT_FOUND });
    }

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

    // Find the workorder
    const workorder = WorkorderReader.findWorkorder(projectDirs, workorderId);

    if (!workorder) {
      const errorResponse = createErrorResponse(ErrorCodes.WORKORDER_NOT_FOUND, {
        searchedId: workorderId,
        searchedProjects: projectDirs.map((p) => p.projectId),
      });
      return NextResponse.json(errorResponse, { status: HttpStatus.NOT_FOUND });
    }

    // Extract tasks from plan.json if available
    const tasks =
      workorder.files.plan_json && typeof workorder.files.plan_json === 'object'
        ? (workorder.files.plan_json as any).tasks || []
        : [];

    // Extract deliverables from DELIVERABLES.md if available
    // For now, just note that it exists
    const deliverables = workorder.files.deliverables_md ? ['Deliverables document exists'] : [];

    // Extract communication log from communication.json if available
    const communicationLog =
      workorder.files.communication_json &&
      typeof workorder.files.communication_json === 'object' &&
      Array.isArray((workorder.files.communication_json as any).communication_log)
        ? (workorder.files.communication_json as any).communication_log
        : [];

    // Build response
    const response: WorkorderDetailResponse = {
      success: true,
      data: {
        workorder,
        tasks,
        deliverables: deliverables.map((d) => ({
          name: d,
          status: 'active',
        })),
        communication_log: communicationLog,
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

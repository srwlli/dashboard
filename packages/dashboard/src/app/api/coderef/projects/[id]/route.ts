/**
 * /api/coderef/projects/[id]
 *
 * Manage individual CodeRef project by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse, ErrorCodes, HttpStatus } from '@/types/api';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

/**
 * CodeRef project registration interface
 */
interface CodeRefProject {
  id: string;
  name: string;
  path: string;
  addedAt: string;
}

/**
 * Projects storage file structure
 */
interface ProjectsStorage {
  projects: CodeRefProject[];
  updatedAt: string;
}

/**
 * Get path to projects storage file
 */
function getStoragePath(): string {
  const homeDir = os.homedir();
  const coderefDir = path.join(homeDir, '.coderef-dashboard');
  return path.join(coderefDir, 'projects.json');
}

/**
 * Load projects from storage file
 */
async function loadProjects(): Promise<CodeRefProject[]> {
  const storagePath = getStoragePath();

  try {
    const data = await fs.readFile(storagePath, 'utf-8');
    const storage: ProjectsStorage = JSON.parse(data);
    return storage.projects;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

/**
 * Save projects to storage file
 */
async function saveProjects(projects: CodeRefProject[]): Promise<void> {
  const homeDir = os.homedir();
  const coderefDir = path.join(homeDir, '.coderef-dashboard');

  try {
    await fs.access(coderefDir);
  } catch {
    await fs.mkdir(coderefDir, { recursive: true });
  }

  const storage: ProjectsStorage = {
    projects,
    updatedAt: new Date().toISOString(),
  };

  const storagePath = getStoragePath();
  await fs.writeFile(storagePath, JSON.stringify(storage, null, 2), 'utf-8');
}

/**
 * DELETE /api/coderef/projects/[id]
 * Remove a CodeRef project registration by ID
 */
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await context.params;

    if (!id) {
      const errorResponse = createErrorResponse(
        {
          code: 'VALIDATION_ERROR',
          message: 'Project ID is required',
        },
        { received: id }
      );
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Load existing projects
    const projects = await loadProjects();

    // Find project index
    const projectIndex = projects.findIndex((p) => p.id === id);

    if (projectIndex === -1) {
      const errorResponse = createErrorResponse(
        {
          code: 'PROJECT_NOT_FOUND',
          message: `Project with ID '${id}' not found`,
        },
        { projectId: id }
      );
      return NextResponse.json(errorResponse, { status: HttpStatus.NOT_FOUND });
    }

    // Remove project
    const removedProject = projects.splice(projectIndex, 1)[0];

    // Save updated projects
    await saveProjects(projects);

    const response = createSuccessResponse({
      removed: removedProject,
      remaining: projects.length,
    });

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error) {
    const errorResponse = createErrorResponse(ErrorCodes.INTERNAL_ERROR, {
      reason: (error as Error).message,
    });
    return NextResponse.json(errorResponse, { status: HttpStatus.INTERNAL_ERROR });
  }
}

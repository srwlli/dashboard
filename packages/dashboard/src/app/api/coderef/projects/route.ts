/**
 * /api/coderef/projects
 *
 * Manages CodeRef project registrations for hybrid local+API access.
 * Stores project metadata (id, name, path) for API-based file operations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse, ErrorCodes, HttpStatus } from '@/types/api';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

/**
 * CodeRef project registration interface
 */
export interface CodeRefProject {
  /** Unique project identifier */
  id: string;

  /** Human-readable project name */
  name: string;

  /** Absolute file system path to project root */
  path: string;

  /** ISO 8601 timestamp when project was added */
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
 * Stored in user's home directory: ~/.coderef-dashboard/projects.json
 */
function getStoragePath(): string {
  const homeDir = os.homedir();
  const coderefDir = path.join(homeDir, '.coderef-dashboard');
  return path.join(coderefDir, 'projects.json');
}

/**
 * Ensure storage directory exists
 */
async function ensureStorageDir(): Promise<void> {
  const homeDir = os.homedir();
  const coderefDir = path.join(homeDir, '.coderef-dashboard');

  try {
    await fs.access(coderefDir);
  } catch {
    await fs.mkdir(coderefDir, { recursive: true });
  }
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
      // File doesn't exist yet, return empty array
      return [];
    }
    throw error;
  }
}

/**
 * Save projects to storage file
 */
async function saveProjects(projects: CodeRefProject[]): Promise<void> {
  await ensureStorageDir();

  const storage: ProjectsStorage = {
    projects,
    updatedAt: new Date().toISOString(),
  };

  const storagePath = getStoragePath();
  await fs.writeFile(storagePath, JSON.stringify(storage, null, 2), 'utf-8');
}

/**
 * GET /api/coderef/projects
 * Returns list of all registered CodeRef projects
 *
 * Query params:
 * - id: (optional) Return single project by ID
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('id');

    const projects = await loadProjects();

    // If ID provided, return single project
    if (projectId) {
      const project = projects.find((p) => p.id === projectId);

      if (!project) {
        const errorResponse = createErrorResponse(
          {
            code: 'PROJECT_NOT_FOUND',
            message: `Project with ID '${projectId}' not found`,
          },
          { projectId }
        );
        return NextResponse.json(errorResponse, { status: HttpStatus.NOT_FOUND });
      }

      const response = createSuccessResponse({ project });
      return NextResponse.json(response, { status: HttpStatus.OK });
    }

    // Otherwise return all projects
    const response = createSuccessResponse({
      projects,
      total: projects.length,
    });

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error) {
    const errorResponse = createErrorResponse(ErrorCodes.INTERNAL_ERROR, {
      reason: (error as Error).message,
    });
    return NextResponse.json(errorResponse, { status: HttpStatus.INTERNAL_ERROR });
  }
}

/**
 * POST /api/coderef/projects
 * Register a new CodeRef project
 *
 * Body: { id: string, name: string, path: string }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { id, name, path: projectPath } = body;

    // Validate required fields
    if (!id || !name || !projectPath) {
      const errorResponse = createErrorResponse(
        {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: id, name, path',
        },
        { received: body }
      );
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Verify path exists (skip for File System Access API paths)
    const isBrowserPath = projectPath.startsWith('[Directory:');
    if (!isBrowserPath) {
      try {
        await fs.access(projectPath);
      } catch {
        const errorResponse = createErrorResponse(ErrorCodes.FOLDER_NOT_FOUND, {
          path: projectPath,
        });
        return NextResponse.json(errorResponse, { status: HttpStatus.NOT_FOUND });
      }
    }

    // Load existing projects
    const projects = await loadProjects();

    // Check if project ID already exists
    const existingIndex = projects.findIndex((p) => p.id === id);

    const newProject: CodeRefProject = {
      id,
      name,
      path: projectPath,
      addedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      // Update existing project
      projects[existingIndex] = newProject;
    } else {
      // Add new project
      projects.push(newProject);
    }

    // Save updated projects
    await saveProjects(projects);

    const response = createSuccessResponse({
      project: newProject,
      updated: existingIndex >= 0,
    });

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error) {
    const errorResponse = createErrorResponse(ErrorCodes.INTERNAL_ERROR, {
      reason: (error as Error).message,
    });
    return NextResponse.json(errorResponse, { status: HttpStatus.INTERNAL_ERROR });
  }
}

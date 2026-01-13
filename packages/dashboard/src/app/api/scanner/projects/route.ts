/**
 * Scanner Projects API - Main CRUD Endpoint
 *
 * GET  /api/scanner/projects - List all configured projects
 * POST /api/scanner/projects - Add a new project
 */

import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { randomUUID } from 'crypto';
import type { ScannerProject, ProjectsStorage } from '../types';
import { createErrorResponse, createSuccessResponse } from '@/types/api';

/**
 * Get storage file path for CodeRef projects
 * Uses unified storage: ~/.coderef-dashboard/projects.json
 */
function getStoragePath(): string {
  const homeDir = os.homedir();
  return path.join(homeDir, '.coderef-dashboard', 'projects.json');
}

/**
 * Load projects from unified CodeRef storage
 * Returns empty array if file doesn't exist (graceful ENOENT handling)
 */
async function loadProjects(): Promise<ScannerProject[]> {
  const storagePath = getStoragePath();

  try {
    const data = await fs.readFile(storagePath, 'utf-8');
    const storage: { projects: ScannerProject[]; updatedAt: string } = JSON.parse(data);
    return storage.projects || [];
  } catch (error: any) {
    // File doesn't exist - return empty array
    if (error.code === 'ENOENT') {
      return [];
    }
    // Other errors (permission, parse errors) should throw
    throw error;
  }
}

/**
 * Save projects to unified CodeRef storage
 * Creates directory if it doesn't exist
 */
async function saveProjects(projects: ScannerProject[]): Promise<void> {
  const storagePath = getStoragePath();
  const storageDir = path.dirname(storagePath);

  // Ensure directory exists
  try {
    await fs.access(storageDir);
  } catch {
    await fs.mkdir(storageDir, { recursive: true });
  }

  const storage = {
    projects,
    updatedAt: new Date().toISOString(),
  };

  await fs.writeFile(storagePath, JSON.stringify(storage, null, 2), 'utf-8');
}

/**
 * GET /api/scanner/projects
 * Returns all configured scanner projects
 */
export async function GET(_request: NextRequest) {
  try {
    const projects = await loadProjects();

    return NextResponse.json(
      createSuccessResponse({ projects }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Scanner API] Failed to load projects:', error);

    return NextResponse.json(
      createErrorResponse(
        { code: 'LOAD_PROJECTS_FAILED', message: 'Failed to load scanner projects' },
        { details: error.message }
      ),
      { status: 500 }
    );
  }
}

/**
 * POST /api/scanner/projects
 * Add a new project to scanner
 *
 * Request body: { path: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path: projectPath } = body;

    // Validate request
    if (!projectPath || typeof projectPath !== 'string') {
      return NextResponse.json(
        createErrorResponse(
          { code: 'INVALID_REQUEST', message: 'Project path is required' }
        ),
        { status: 400 }
      );
    }

    // Validate path exists and is a directory
    try {
      const stats = await fs.stat(projectPath);
      if (!stats.isDirectory()) {
        return NextResponse.json(
          createErrorResponse(
            { code: 'INVALID_PATH', message: 'Path is not a directory' }
          ),
          { status: 400 }
        );
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return NextResponse.json(
          createErrorResponse(
            { code: 'PATH_NOT_FOUND', message: 'Path does not exist' }
          ),
          { status: 404 }
        );
      }
      return NextResponse.json(
        createErrorResponse(
          { code: 'PATH_ACCESS_ERROR', message: 'Cannot access path' },
          { details: error.message }
        ),
        { status: 400 }
      );
    }

    // Load existing projects
    const projects = await loadProjects();

    // Check for duplicate path
    const duplicate = projects.find((p) => p.path === projectPath);
    if (duplicate) {
      return NextResponse.json(
        createErrorResponse(
          { code: 'DUPLICATE_PROJECT', message: 'Project already exists' },
          { projectId: duplicate.id }
        ),
        { status: 409 }
      );
    }

    // Create new project
    const newProject: ScannerProject = {
      id: randomUUID(),
      name: path.basename(projectPath),
      path: projectPath,
      addedAt: new Date().toISOString(),
    };

    // Add and save
    projects.push(newProject);
    await saveProjects(projects);

    return NextResponse.json(
      createSuccessResponse({ project: newProject }),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Scanner API] Failed to add project:', error);

    return NextResponse.json(
      createErrorResponse(
        { code: 'ADD_PROJECT_FAILED', message: 'Failed to add project' },
        { details: error.message }
      ),
      { status: 500 }
    );
  }
}

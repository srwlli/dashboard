/**
 * Scanner Projects API - Individual Project Operations
 *
 * DELETE /api/scanner/projects/:id - Remove a project
 */

import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import type { ScannerProject, ProjectsStorage } from '../../types';
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
 */
async function loadProjects(): Promise<ScannerProject[]> {
  const storagePath = getStoragePath();

  try {
    const data = await fs.readFile(storagePath, 'utf-8');
    const storage: { projects: ScannerProject[]; updatedAt: string } = JSON.parse(data);
    return storage.projects || [];
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

/**
 * Save projects to unified CodeRef storage
 */
async function saveProjects(projects: ScannerProject[]): Promise<void> {
  const storagePath = getStoragePath();
  const storageDir = path.dirname(storagePath);

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
 * DELETE /api/scanner/projects/:id
 * Remove a project from scanner configuration
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Load existing projects
    const projects = await loadProjects();

    // Find project index
    const projectIndex = projects.findIndex((p) => p.id === id);

    if (projectIndex === -1) {
      return NextResponse.json(
        createErrorResponse(
          { code: 'PROJECT_NOT_FOUND', message: 'Project not found' }
        ),
        { status: 404 }
      );
    }

    // Remove project
    const [removedProject] = projects.splice(projectIndex, 1);

    // Save updated list
    await saveProjects(projects);

    return NextResponse.json(
      createSuccessResponse({ project: removedProject }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Scanner API] Failed to delete project:', error);

    return NextResponse.json(
      createErrorResponse(
        { code: 'DELETE_PROJECT_FAILED', message: 'Failed to delete project' },
        { details: error.message }
      ),
      { status: 500 }
    );
  }
}

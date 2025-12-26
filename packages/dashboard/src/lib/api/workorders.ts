/**
 * WorkorderReader Utility
 *
 * Reads and aggregates workorders from all projects.
 * Workorders are discovered by folder existence (files are optional).
 * Implements graceful degradation - missing files don't break the system.
 */

import { readdirSync, readFileSync, existsSync, statSync } from 'fs';
import { resolve } from 'path';
import { WorkorderObject, WorkorderFiles } from '@/types/workorders';

/**
 * Raw communication.json structure
 */
interface RawCommunicationData {
  workorder_id?: string;
  status?: string;
  created?: string;
  updated?: string;
  [key: string]: any;
}

/**
 * WorkorderReader - Discovers and reads workorders from projects
 */
export class WorkorderReader {
  /**
   * Read all workorders from a project directory
   * @param projectPath Path to project root
   * @param projectId Project ID for reference
   * @param projectName Human-readable project name
   * @param workorderDir Relative path to workorder directory (e.g., 'coderef/workorder')
   * @returns Array of WorkorderObject
   */
  static readProjectWorkorders(
    projectPath: string,
    projectId: string,
    projectName: string,
    workorderDir: string
  ): WorkorderObject[] {
    const workorders: WorkorderObject[] = [];
    const workorderPath = resolve(projectPath, workorderDir);

    // Check if workorder directory exists
    if (!existsSync(workorderPath)) {
      // Project has no workorders yet - that's OK, return empty array
      return workorders;
    }

    try {
      // Read all folders in workorder directory
      const folders = readdirSync(workorderPath, { withFileTypes: true });

      for (const entry of folders) {
        if (!entry.isDirectory()) continue;

        const folderName = entry.name;
        const folderPath = resolve(workorderPath, folderName);

        try {
          // Folder existence = workorder exists (files are optional)
          const workorder = this.parseWorkorderFolder(
            folderPath,
            folderName,
            projectId,
            projectName
          );

          workorders.push(workorder);
        } catch (error) {
          // Log but continue - graceful degradation
          console.error(`Error parsing workorder at ${folderPath}:`, error);
        }
      }

      return workorders;
    } catch (error) {
      // Directory exists but can't be read
      throw new Error(`Failed to read workorder directory at ${workorderPath}: ${(error as Error).message}`);
    }
  }

  /**
   * Parse a single workorder folder
   * @private
   */
  private static parseWorkorderFolder(
    folderPath: string,
    folderName: string,
    projectId: string,
    projectName: string
  ): WorkorderObject {
    // Get folder timestamps via file system stats
    const folderStats = statSync(folderPath);
    const folderCreatedTime = folderStats.birthtime.toISOString();
    const folderModifiedTime = folderStats.mtime.toISOString();

    // Try to read optional files
    const files = this.readWorkorderFiles(folderPath);

    // Extract metadata from communication.json if available
    let workorderId = '';
    let status = 'pending';

    if (files.communication_json && typeof files.communication_json === 'object') {
      workorderId = (files.communication_json as RawCommunicationData).workorder_id || '';
      status = (files.communication_json as RawCommunicationData).status || 'pending';
    }

    return {
      id: workorderId || folderName,
      project_id: projectId,
      project_name: projectName,
      feature_name: folderName,
      status: status as any,
      path: folderPath,
      files,
      created:
        (files.communication_json &&
          typeof files.communication_json === 'object' &&
          (files.communication_json as RawCommunicationData).created) ||
        folderCreatedTime,
      updated:
        (files.communication_json &&
          typeof files.communication_json === 'object' &&
          (files.communication_json as RawCommunicationData).updated) ||
        folderModifiedTime,
      last_status_update:
        (files.communication_json &&
          typeof files.communication_json === 'object' &&
          (files.communication_json as RawCommunicationData).updated) ||
        folderModifiedTime,
    };
  }

  /**
   * Read all available files from a workorder folder
   * Graceful degradation: missing files are OK
   * @private
   */
  private static readWorkorderFiles(folderPath: string): WorkorderFiles {
    const files: WorkorderFiles = {};

    // Try to read communication.json
    const commPath = resolve(folderPath, 'communication.json');
    if (existsSync(commPath)) {
      try {
        const content = readFileSync(commPath, 'utf-8');
        files.communication_json = JSON.parse(content);
      } catch (error) {
        // Invalid JSON - log but continue
        console.error(`Failed to parse communication.json at ${commPath}:`, error);
        files.communication_json = null;
      }
    }

    // Try to read plan.json
    const planPath = resolve(folderPath, 'plan.json');
    if (existsSync(planPath)) {
      try {
        const content = readFileSync(planPath, 'utf-8');
        files.plan_json = JSON.parse(content);
      } catch (error) {
        // Invalid JSON - log but continue
        console.error(`Failed to parse plan.json at ${planPath}:`, error);
        files.plan_json = null;
      }
    }

    // Try to read DELIVERABLES.md
    const delivPath = resolve(folderPath, 'DELIVERABLES.md');
    if (existsSync(delivPath)) {
      try {
        files.deliverables_md = readFileSync(delivPath, 'utf-8');
      } catch (error) {
        // Failed to read - log but continue
        console.error(`Failed to read DELIVERABLES.md at ${delivPath}:`, error);
        files.deliverables_md = null;
      }
    }

    return files;
  }

  /**
   * Find a specific workorder by ID across all projects
   */
  static findWorkorder(
    projectDirs: Array<{ projectId: string; projectName: string; path: string }>,
    workorderId: string
  ): WorkorderObject | null {
    for (const { projectId, projectName, path } of projectDirs) {
      const workorderPath = path;

      if (!existsSync(workorderPath)) continue;

      try {
        const folders = readdirSync(workorderPath, { withFileTypes: true });

        for (const entry of folders) {
          if (!entry.isDirectory()) continue;

          const folderPath = resolve(workorderPath, entry.name);
          const workorder = this.parseWorkorderFolder(
            folderPath,
            entry.name,
            projectId,
            projectName
          );

          // Match by workorder ID or folder name
          if (workorder.id === workorderId || entry.name === workorderId) {
            return workorder;
          }
        }
      } catch (error) {
        // Continue searching in other projects
        console.error(`Error searching project ${projectId}:`, error);
      }
    }

    return null;
  }

  /**
   * Count workorders by status
   */
  static countByStatus(workorders: WorkorderObject[]): Record<string, number> {
    const counts: Record<string, number> = {};

    for (const wo of workorders) {
      counts[wo.status] = (counts[wo.status] || 0) + 1;
    }

    return counts;
  }

  /**
   * Count workorders by project
   */
  static countByProject(workorders: WorkorderObject[]): Record<string, number> {
    const counts: Record<string, number> = {};

    for (const wo of workorders) {
      counts[wo.project_id] = (counts[wo.project_id] || 0) + 1;
    }

    return counts;
  }
}

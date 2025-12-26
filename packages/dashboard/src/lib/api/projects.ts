/**
 * ProjectsConfig Utility
 *
 * Loads and manages the projects.config.json file which contains
 * the source of truth for all tracked projects and their paths.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Project configuration from projects.config.json
 */
export interface ProjectConfig {
  id: string;
  name: string;
  type: string;
  path: string;
  has_workorders: boolean;
  workorder_dir: string;
  status: string;
  description: string;
  routes?: Array<{
    path: string;
    description: string;
  }>;
}

/**
 * Centralized paths configuration
 */
export interface CentralizedConfig {
  stubs_dir: string;
  description?: string;
}

/**
 * Complete projects.config.json structure
 */
export interface ProjectsConfigFile {
  version: string;
  created: string;
  description: string;
  projects: ProjectConfig[];
  centralized: CentralizedConfig;
  discovery_rules?: Record<string, string>;
}

/**
 * ProjectsConfig - Loader and manager for projects.config.json
 */
export class ProjectsConfig {
  private config: ProjectsConfigFile | null = null;
  private configPath: string;

  /**
   * Create a new ProjectsConfig instance
   * @param configPath Path to projects.config.json
   */
  constructor(configPath: string) {
    this.configPath = configPath;
  }

  /**
   * Load the configuration from file
   * @throws Error if file not found or invalid JSON
   */
  load(): ProjectsConfigFile {
    try {
      const content = readFileSync(this.configPath, 'utf-8');
      this.config = JSON.parse(content) as ProjectsConfigFile;
      this.validate();
      return this.config;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in projects.config.json: ${error.message}`);
      }
      throw new Error(`Failed to read projects.config.json: ${(error as Error).message}`);
    }
  }

  /**
   * Get loaded config (or load if not already loaded)
   */
  getConfig(): ProjectsConfigFile {
    if (!this.config) {
      this.load();
    }
    return this.config!;
  }

  /**
   * Validate config structure
   * @throws Error if config is invalid
   */
  private validate(): void {
    if (!this.config) {
      throw new Error('Config not loaded');
    }

    const { projects, centralized } = this.config;

    // Validate projects array
    if (!Array.isArray(projects)) {
      throw new Error('projects must be an array');
    }

    if (projects.length === 0) {
      throw new Error('projects array cannot be empty');
    }

    // Validate each project
    projects.forEach((project, index) => {
      if (!project.id) throw new Error(`projects[${index}] missing id`);
      if (!project.path) throw new Error(`projects[${index}] missing path`);
      if (!project.workorder_dir) throw new Error(`projects[${index}] missing workorder_dir`);
    });

    // Validate centralized config
    if (!centralized || !centralized.stubs_dir) {
      throw new Error('centralized.stubs_dir is required');
    }
  }

  /**
   * Get all active projects
   */
  getActiveProjects(): ProjectConfig[] {
    const config = this.getConfig();
    return config.projects.filter((p) => p.status === 'active');
  }

  /**
   * Get projects with workorder tracking enabled
   */
  getProjectsWithWorkorders(): ProjectConfig[] {
    const config = this.getConfig();
    return config.projects.filter((p) => p.has_workorders === true && p.status === 'active');
  }

  /**
   * Get a specific project by ID
   */
  getProject(projectId: string): ProjectConfig | undefined {
    const config = this.getConfig();
    return config.projects.find((p) => p.id === projectId);
  }

  /**
   * Get stubs directory path
   */
  getStubsDir(): string {
    const config = this.getConfig();
    return config.centralized.stubs_dir;
  }

  /**
   * Get workorder directory for a project
   */
  getWorkorderDir(projectId: string): string | null {
    const project = this.getProject(projectId);
    if (!project) return null;
    return resolve(project.path, project.workorder_dir);
  }

  /**
   * Get all workorder directories from all projects
   */
  getAllWorkorderDirs(): Array<{ projectId: string; projectName: string; path: string }> {
    const projects = this.getProjectsWithWorkorders();
    return projects.map((p) => ({
      projectId: p.id,
      projectName: p.name,
      path: resolve(p.path, p.workorder_dir),
    }));
  }
}

/**
 * Create a ProjectsConfig instance with the standard orchestrator path
 */
export function createProjectsConfig(): ProjectsConfig {
  // Default path: C:\Users\{username}\..\assistant\projects.config.json
  const configPath = resolve(process.cwd(), '../assistant/projects.config.json');
  return new ProjectsConfig(configPath);
}

/**
 * Load config from a custom path
 */
export function loadProjectsConfig(customPath: string): ProjectsConfigFile {
  const config = new ProjectsConfig(customPath);
  return config.load();
}

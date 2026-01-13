/**
 * ProjectsConfig Utility
 *
 * Loads and manages project configuration from unified storage.
 * Reads from ~/.coderef-dashboard/projects.json (unified storage) by default.
 * Falls back to custom projects.config.json path if provided.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { homedir } from 'os';

/**
 * Project from unified storage (simplified schema)
 */
export interface UnifiedProject {
  id: string;
  name: string;
  path: string;
  addedAt: string;
}

/**
 * Unified storage schema (~/.coderef-dashboard/projects.json)
 */
export interface UnifiedStorage {
  projects: UnifiedProject[];
  stubs_directory?: string; // Optional centralized stubs directory
  updatedAt: string;
}

/**
 * Project configuration from projects.config.json (legacy format)
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
 * ProjectsConfig - Loader and manager for project configuration
 * Supports both unified storage and legacy projects.config.json format
 */
export class ProjectsConfig {
  private config: ProjectsConfigFile | null = null;
  private unifiedStorage: UnifiedStorage | null = null;
  private configPath: string;
  private useUnifiedStorage: boolean;

  /**
   * Create a new ProjectsConfig instance
   * @param configPath Path to config file (defaults to unified storage)
   */
  constructor(configPath?: string) {
    if (!configPath) {
      // Use unified storage by default
      this.configPath = resolve(homedir(), '.coderef-dashboard', 'projects.json');
      this.useUnifiedStorage = true;
    } else {
      // Use custom config path (legacy format)
      this.configPath = configPath;
      this.useUnifiedStorage = false;
    }
  }

  /**
   * Load the configuration from file
   * @throws Error if file not found or invalid JSON
   */
  load(): ProjectsConfigFile {
    try {
      const content = readFileSync(this.configPath, 'utf-8');
      const parsed = JSON.parse(content);

      // Detect format
      if (this.useUnifiedStorage || this.isUnifiedStorageFormat(parsed)) {
        // Unified storage format
        this.unifiedStorage = parsed as UnifiedStorage;
        this.config = this.convertToLegacyFormat(this.unifiedStorage);
      } else {
        // Legacy projects.config.json format
        this.config = parsed as ProjectsConfigFile;
      }

      this.validate();
      return this.config;
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        // File doesn't exist - return empty config
        if (this.useUnifiedStorage) {
          this.unifiedStorage = { projects: [], updatedAt: new Date().toISOString() };
          this.config = this.convertToLegacyFormat(this.unifiedStorage);
          return this.config;
        }
      }
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in config file: ${error.message}`);
      }
      throw new Error(`Failed to read config file: ${(error as Error).message}`);
    }
  }

  /**
   * Check if parsed JSON is unified storage format
   */
  private isUnifiedStorageFormat(parsed: any): boolean {
    return (
      parsed.projects &&
      Array.isArray(parsed.projects) &&
      parsed.updatedAt &&
      !parsed.version // Legacy format has version field
    );
  }

  /**
   * Convert unified storage format to legacy format for backwards compatibility
   */
  private convertToLegacyFormat(unified: UnifiedStorage): ProjectsConfigFile {
    const projects: ProjectConfig[] = unified.projects.map((p) => ({
      id: p.id,
      name: p.name,
      type: 'tracked', // Default type
      path: p.path,
      has_workorders: true, // Assume all projects can have workorders
      workorder_dir: 'coderef/workorder', // Standard location
      status: 'active', // All projects in unified storage are active
      description: '',
    }));

    return {
      version: '2.0', // Unified storage version
      created: unified.updatedAt,
      description: 'Auto-generated from unified storage',
      projects,
      centralized: {
        stubs_dir: unified.stubs_directory || resolve(homedir(), 'Desktop', 'assistant', 'stubs'),
      },
    };
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

    // Empty projects array is valid for unified storage (no projects added yet)
    if (projects.length === 0 && !this.useUnifiedStorage) {
      throw new Error('projects array cannot be empty in legacy config');
    }

    // Validate each project
    projects.forEach((project, index) => {
      if (!project.id) throw new Error(`projects[${index}] missing id`);
      if (!project.path) throw new Error(`projects[${index}] missing path`);
      if (!project.workorder_dir) throw new Error(`projects[${index}] missing workorder_dir`);
    });

    // Centralized config is optional for unified storage (will use fallback)
    if (!this.useUnifiedStorage && (!centralized || !centralized.stubs_dir)) {
      throw new Error('centralized.stubs_dir is required in legacy config');
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
 * Create a ProjectsConfig instance with unified storage (default)
 * Uses ~/.coderef-dashboard/projects.json
 */
export function createProjectsConfig(): ProjectsConfig {
  return new ProjectsConfig(); // No path = unified storage
}

/**
 * Create a ProjectsConfig instance with legacy orchestrator path
 * @deprecated Use createProjectsConfig() for unified storage instead
 */
export function createLegacyProjectsConfig(): ProjectsConfig {
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

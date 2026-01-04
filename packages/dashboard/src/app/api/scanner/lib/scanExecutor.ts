/**
 * Scan Executor - Subprocess Orchestration for CodeRef Scanner
 *
 * Manages scan execution with:
 * - Sequential project scanning (one at a time)
 * - Real-time output buffering for SSE streaming
 * - Process lifecycle management (start, cancel, cleanup)
 * - Event emission for output and progress updates
 */

import { EventEmitter } from 'events';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import type { ScanProgress, ScanStatus } from '../types';
import { scanCurrentElements, type ElementData } from '@coderef/core';

/**
 * Project selection for scan/populate operations
 */
interface ProjectSelection {
  scan: boolean;
  populate: boolean;
}

/**
 * Scan execution configuration
 */
interface ScanConfig {
  /** Array of absolute project paths to scan */
  projectPaths: string[];

  /** Unique scan identifier */
  scanId: string;

  /** Optional: Project selections for multi-phase execution */
  selections?: Record<string, ProjectSelection>;
}

/**
 * ScanExecutor manages scan lifecycle and output streaming
 *
 * Events:
 * - 'output': (line: string) - New output line from subprocess
 * - 'progress': (progress: ScanProgress) - Progress update
 * - 'complete': (progress: ScanProgress) - Scan completed successfully
 * - 'error': (error: string) - Scan failed with error
 */
export class ScanExecutor extends EventEmitter {
  private projectPaths: string[];
  private projectIds: Map<string, string>; // Maps path -> projectId
  private selections: Record<string, ProjectSelection> | undefined;
  private currentProcess: ChildProcess | null = null;
  private currentProjectIndex: number = 0;
  private status: ScanStatus = 'idle';
  private outputBuffer: string[] = [];
  private startedAt: string | null = null;
  private completedAt: string | null = null;
  private errorMessage: string | null = null;

  constructor(config: ScanConfig) {
    super();
    this.projectPaths = config.projectPaths;
    this.selections = config.selections;
    this.projectIds = new Map();
  }

  /**
   * Set project ID mapping (path -> ID) for selection lookup
   */
  public setProjectIdMapping(mapping: Map<string, string>): void {
    this.projectIds = mapping;
  }

  /**
   * Start scan execution
   * Runs projects sequentially, emitting output and progress events
   */
  public async startScan(): Promise<void> {
    if (this.status !== 'idle') {
      throw new Error('Scan already running or completed');
    }

    this.status = 'running';
    this.startedAt = new Date().toISOString();
    this.currentProjectIndex = 0;

    this.emitProgress();

    try {
      // Scan each project sequentially
      for (let i = 0; i < this.projectPaths.length; i++) {
        // Check if scan was cancelled (can happen via cancelScan())
        if (this.status !== 'running') {
          this.completedAt = new Date().toISOString();
          this.emitProgress();
          this.emit('complete', this.getScanStatus());
          return;
        }

        this.currentProjectIndex = i;
        this.emitProgress();

        const projectPath = this.projectPaths[i];
        const projectId = this.projectIds.get(projectPath);
        const selection = projectId && this.selections ? this.selections[projectId] : undefined;

        // Phase 1: Scan (if selected or no selections provided - backward compatibility)
        const shouldScan = !selection || selection.scan;
        if (shouldScan) {
          try {
            await this.runScanForProject(projectPath);
          } catch (scanError: any) {
            // If scan fails, log error and skip populate phase for this project
            this.emitOutput(`[ERROR] Scan failed for ${projectPath}: ${scanError.message}\n`);
            this.emitOutput(`[Scanner] Skipping populate phase for ${projectPath}\n`);
            continue; // Move to next project
          }
        }

        // Phase 2: Populate (if selected AND scan succeeded)
        const shouldPopulate = selection && selection.populate;
        if (shouldPopulate) {
          try {
            await this.runPopulateForProject(projectPath);
          } catch (populateError: any) {
            // Log populate error but continue (don't fail entire scan)
            this.emitOutput(`[ERROR] Populate failed for ${projectPath}: ${populateError.message}\n`);
          }
        }
      }

      // All projects completed successfully
      this.status = 'completed';
      this.completedAt = new Date().toISOString();
      this.emitProgress();
      this.emit('complete', this.getScanStatus());
    } catch (error: any) {
      this.status = 'error';
      this.errorMessage = error.message;
      this.completedAt = new Date().toISOString();
      this.emitProgress();
      this.emit('error', error.message);
    }
  }

  /**
   * Run scan for a single project using @coderef/core directly
   * No subprocess, no HTTP - pure in-process scanning
   */
  private async runScanForProject(projectPath: string): Promise<void> {
    try {
      this.emitOutput(`\n[Scanner] Starting scan for: ${projectPath}`);
      this.emitOutput(`[Scanner] Using @coderef/core scanner (in-process)\n`);

      const startTime = Date.now();

      // Call scanner directly (no HTTP, no subprocess)
      const elements: ElementData[] = await scanCurrentElements(
        projectPath,
        ['ts', 'tsx', 'js', 'jsx'],
        {
          recursive: true,
          exclude: ['node_modules/**', '.git/**', 'dist/**', 'build/**', '.next/**'],
        }
      );

      const scanDuration = Date.now() - startTime;

      // Calculate summary statistics
      const filesScanned = new Set(elements.map(el => el.file)).size;
      const totalElements = elements.length;

      // Emit completion with summary
      this.emitOutput(`[Scanner] Scan completed successfully`);
      this.emitOutput(`[Scanner] Found ${totalElements} elements in ${filesScanned} files`);
      this.emitOutput(`[Scanner] Scan duration: ${scanDuration}ms\n`);
    } catch (error: any) {
      // Handle scanner errors directly
      this.emitOutput(`[ERROR] Scan failed: ${error.message}\n`);
      throw new Error(`Scan failed: ${error.message}`);
    }
  }

  /**
   * Find available Python command with full path resolution
   */
  private async findPythonCommand(): Promise<string> {
    const { execSync } = require('child_process');

    // Use environment variable if set
    if (process.env.PYTHON_COMMAND) {
      return process.env.PYTHON_COMMAND;
    }

    // On Windows, try to find Python using 'where' command
    if (process.platform === 'win32') {
      try {
        const result = execSync('where python', { encoding: 'utf-8' }).trim();
        const firstPath = result.split('\n')[0].trim();
        if (firstPath) {
          return firstPath;
        }
      } catch {
        // If 'where python' fails, try 'py' launcher
        try {
          execSync('py --version', { encoding: 'utf-8' });
          return 'py';
        } catch {
          // Fall back to 'python' and let it fail with helpful error
          return 'python';
        }
      }
    }

    // On Unix/macOS, try which command
    try {
      const result = execSync('which python3 || which python', { encoding: 'utf-8' }).trim();
      if (result) {
        return result;
      }
    } catch {
      // Fall back to python3
    }

    return 'python3';
  }

  /**
   * Run generate-coderef-directories.py for a single project
   * Uses child_process.spawn() to execute Python script
   */
  private async runPopulateForProject(projectPath: string): Promise<void> {
    // Locate generate-coderef-directories.py script (now in dashboard monorepo)
    const populateScriptPath = process.env.POPULATE_SCRIPT_PATH ||
      path.resolve(__dirname, '../../../../../coderef-core/scripts/generate-coderef-directories.py');

    // Find Python command with full path
    const pythonCmd = await this.findPythonCommand();

    this.emitOutput(`\n[Intelligence] Generating coderef directories for: ${projectPath}`);
    this.emitOutput(`[Intelligence] Using Python: ${pythonCmd}`);
    this.emitOutput(`[Intelligence] Using script: ${populateScriptPath}\n`);

    return new Promise((resolve, reject) => {

      // Spawn Python subprocess
      this.currentProcess = spawn(pythonCmd, [populateScriptPath, projectPath], {
        stdio: ['ignore', 'pipe', 'pipe'],
        cwd: path.dirname(populateScriptPath),
      });

      // Handle stdout
      this.currentProcess.stdout?.on('data', (data) => {
        const output = data.toString();
        this.emitOutput(output);
      });

      // Handle stderr
      this.currentProcess.stderr?.on('data', (data) => {
        const output = data.toString();
        this.emitOutput(`[ERROR] ${output}`);
      });

      // Handle process exit
      this.currentProcess.on('close', (code) => {
        if (code === 0) {
          this.emitOutput(`[Intelligence] Completed: ${projectPath}\n`);
          resolve();
        } else if (code === null) {
          // Process was killed (cancelled)
          this.emitOutput(`[Intelligence] Cancelled: ${projectPath}\n`);
          resolve();
        } else {
          reject(new Error(`Populate failed with exit code ${code}`));
        }
        this.currentProcess = null;
      });

      // Handle process error (e.g., python not found)
      this.currentProcess.on('error', (error) => {
        this.emitOutput(`[ERROR] Failed to start Python: ${error.message}\n`);
        this.emitOutput(`[ERROR] Could not find '${pythonCmd}' command\n`);
        this.emitOutput(`[HELP] Try one of these solutions:\n`);
        this.emitOutput(`  1. Install Python: https://www.python.org/downloads/\n`);
        this.emitOutput(`  2. Set PYTHON_COMMAND env var (e.g., PYTHON_COMMAND=python3)\n`);
        this.emitOutput(`  3. Add Python to your system PATH\n`);
        this.emitOutput(`  4. On Windows, try installing from Microsoft Store\n`);
        reject(error);
      });
    });
  }

  /**
   * Cancel currently running scan
   * Kills subprocess and marks scan as cancelled
   */
  public cancelScan(): void {
    if (this.status !== 'running') {
      return;
    }

    this.status = 'cancelled';

    if (this.currentProcess) {
      this.emitOutput('\n[Scanner] Scan cancelled by user\n');
      this.currentProcess.kill('SIGTERM');
      this.currentProcess = null;
    }
  }

  /**
   * Get current scan status and progress
   */
  public getScanStatus(): ScanProgress {
    return {
      status: this.status,
      currentProjectIndex: this.currentProjectIndex,
      totalProjects: this.projectPaths.length,
      currentProjectPath:
        this.status === 'running' && this.currentProjectIndex < this.projectPaths.length
          ? this.projectPaths[this.currentProjectIndex]
          : null,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      error: this.errorMessage,
    };
  }

  /**
   * Get buffered output (for SSE clients joining mid-scan)
   */
  public getBufferedOutput(): string[] {
    return [...this.outputBuffer];
  }

  /**
   * Emit output line and add to buffer
   */
  private emitOutput(line: string): void {
    this.outputBuffer.push(line);
    this.emit('output', line);
  }

  /**
   * Emit progress update
   */
  private emitProgress(): void {
    this.emit('progress', this.getScanStatus());
  }
}

/**
 * Global registry of active scans
 * Maps scanId -> ScanExecutor instance
 */
const activeScans = new Map<string, ScanExecutor>();

/**
 * Get or create a scan executor
 */
export function getScanExecutor(scanId: string): ScanExecutor | undefined {
  return activeScans.get(scanId);
}

/**
 * Register a new scan executor
 */
export function registerScanExecutor(scanId: string, executor: ScanExecutor): void {
  activeScans.set(scanId, executor);

  // Auto-cleanup after scan completes (1 hour retention)
  executor.once('complete', () => {
    setTimeout(() => {
      activeScans.delete(scanId);
    }, 60 * 60 * 1000); // 1 hour
  });

  executor.once('error', () => {
    setTimeout(() => {
      activeScans.delete(scanId);
    }, 60 * 60 * 1000); // 1 hour
  });
}

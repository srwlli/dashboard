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
import { scanCurrentElements, DEFAULT_EXCLUDE_PATTERNS, type ElementData } from '@coderef/core';

/**
 * Project selection for directories/scan/populate operations
 */
interface ProjectSelection {
  directories: boolean;
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
  private scanResults = new Map<string, ElementData[]>(); // Cache scan results for Phase 2
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

        // Phase 0: Create Directories (if selected)
        const shouldCreateDirs = selection && selection.directories;
        if (shouldCreateDirs) {
          try {
            await this.runDirectoriesForProject(projectPath);
          } catch (dirError: any) {
            // Log error but continue to next phases (don't fail)
            this.emitOutput(`[ERROR] Directory creation failed for ${projectPath}: ${dirError.message}\n`);
          }
        }

        // Check cancellation after Phase 0
        if (this.status !== 'running') {
          this.completedAt = new Date().toISOString();
          this.emitProgress();
          this.emit('complete', this.getScanStatus());
          return;
        }

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

        // Check cancellation after Phase 1
        if (this.status !== 'running') {
          this.completedAt = new Date().toISOString();
          this.emitProgress();
          this.emit('complete', this.getScanStatus());
          return;
        }

        // Phase 2: Generate (if selected AND scan succeeded)
        const shouldPopulate = selection && selection.populate;
        if (shouldPopulate) {
          try {
            await this.runGenerateForProject(projectPath);
          } catch (generateError: any) {
            // Log generate error but continue (don't fail entire scan)
            this.emitOutput(`[ERROR] Generate failed for ${projectPath}: ${generateError.message}\n`);
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
   * Run setup_coderef_dirs.py for a single project
   * Creates .coderef/ and coderef/ directory structure only
   */
  private async runDirectoriesForProject(projectPath: string): Promise<void> {
    const dirsScriptPath = process.env.DIRS_SCRIPT_PATH ||
      path.join(process.cwd(), 'packages/coderef-core/scripts/setup-coderef-dir/setup_coderef_dirs.py');

    const pythonCmd = await this.findPythonCommand();

    this.emitOutput(`\n[Directories] Creating structure for: ${projectPath}`);
    this.emitOutput(`[Directories] Using Python: ${pythonCmd}`);
    this.emitOutput(`[Directories] Using script: ${dirsScriptPath}\n`);

    return new Promise((resolve, reject) => {
      // Use shell on Windows for PATH resolution with explicit shell path
      const spawnOptions: any = {
        stdio: ['ignore', 'pipe', 'pipe'],
        cwd: path.dirname(dirsScriptPath),
        windowsHide: true, // Hide console window on Windows
      };

      // On Windows, explicitly set shell to COMSPEC (avoids hardcoded paths)
      if (process.platform === 'win32') {
        spawnOptions.shell = process.env.COMSPEC || process.env.ComSpec || 'cmd.exe';
      }

      const childProcess = spawn(pythonCmd, [dirsScriptPath, projectPath], spawnOptions);

      childProcess.stdout?.on('data', (data) => {
        this.emitOutput(data.toString());
      });

      childProcess.stderr?.on('data', (data) => {
        this.emitOutput(`[ERROR] ${data.toString()}`);
      });

      childProcess.on('close', (code) => {
        if (code === 0) {
          this.emitOutput(`[Directories] Completed: ${projectPath}\n`);
          resolve();
        } else if (code === null) {
          this.emitOutput(`[Directories] Cancelled: ${projectPath}\n`);
          resolve();
        } else {
          reject(new Error(`Directory creation failed with exit code ${code}`));
        }
      });

      childProcess.on('error', (error) => {
        this.emitOutput(`[ERROR] Failed to start Python: ${error.message}\n`);
        reject(error);
      });
    });
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
      // Scan all 10 supported languages: TypeScript, JavaScript, Python, Go, Rust, Java, C++, C
      const elements: ElementData[] = await scanCurrentElements(
        projectPath,
        ['ts', 'tsx', 'js', 'jsx', 'py', 'go', 'rs', 'java', 'cpp', 'c'],
        {
          recursive: true,
          exclude: [...DEFAULT_EXCLUDE_PATTERNS],
        }
      );

      // Cache scan results for Phase 2 (no re-scanning needed!)
      this.scanResults.set(projectPath, elements);

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
   * Find available Python command (returns command name for PATH resolution)
   */
  private async findPythonCommand(): Promise<string> {
    const { execSync } = require('child_process');

    // Use environment variable if set
    if (process.env.PYTHON_COMMAND) {
      return process.env.PYTHON_COMMAND;
    }

    // On Windows, use 'py' launcher (most reliable, system-wide)
    if (process.platform === 'win32') {
      try {
        execSync('py --version', { encoding: 'utf-8' });
        // 'py' is the Python launcher, installed system-wide, always in PATH
        return 'py';
      } catch {
        // If 'py' doesn't work, try 'python'
        try {
          execSync('python --version', { encoding: 'utf-8' });
          return 'python';
        } catch {
          // Last resort: return 'py' and let it fail with helpful error
          return 'py';
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
   * Generate all coderef files for a project using cached scan results
   * Pure TypeScript implementation - no subprocess, no Python, no re-scanning
   * Uses parallel generation for 3-5x performance improvement
   */
  private async runGenerateForProject(projectPath: string): Promise<void> {
    try {
      this.emitOutput(`\n[Generate] Starting file generation: ${projectPath}`);

      // Get cached scan results (no re-scan!)
      const elements = this.scanResults.get(projectPath);
      if (!elements) {
        throw new Error('No scan data found. Run scan phase first.');
      }

      this.emitOutput(`[Generate] Using cached scan data (${elements.length} elements)\n`);

      // Import file generation functions (dynamic import for type safety)
      const {
        saveIndex,
        generateContext,
        buildDependencyGraph,
        detectPatterns,
        analyzeCoverage,
        validateReferences,
        detectDrift,
        generateDiagrams,
      } = await import('@coderef/core');

      // Step 1: Critical file (must succeed)
      this.emitOutput(`[Generate] Saving index...`);
      await saveIndex(projectPath, elements);
      this.emitOutput(`[Generate] ✓ index.json`);

      // Step 2: Core files (parallel - depend on elements only)
      this.emitOutput(`[Generate] Creating context and graph...`);
      await Promise.all([
        generateContext(projectPath, elements),
        buildDependencyGraph(projectPath, elements),
      ]);
      this.emitOutput(`[Generate] ✓ context.json, context.md, graph.json`);

      // Step 3: Analysis reports (parallel + fault-tolerant)
      this.emitOutput(`[Generate] Running analysis...`);
      const analysisResults = await Promise.allSettled([
        detectPatterns(projectPath, elements),
        analyzeCoverage(projectPath, elements),
        validateReferences(projectPath, elements),
        detectDrift(projectPath, elements),
      ]);

      const analysisSuccess = analysisResults.filter(r => r.status === 'fulfilled').length;
      this.emitOutput(`[Generate] ✓ Generated ${analysisSuccess}/4 analysis reports`);

      // Step 4: Diagrams
      this.emitOutput(`[Generate] Creating diagrams...`);
      await generateDiagrams(projectPath, elements);
      this.emitOutput(`[Generate] ✓ 4 diagram files`);

      this.emitOutput(`[Generate] Completed: ${projectPath}\n`);
    } catch (error: any) {
      this.emitOutput(`[ERROR] Generate failed: ${error.message}\n`);
      throw error;
    }
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
 *
 * IMPORTANT: Use globalThis to survive Next.js module reloads (HMR)
 * Without this, scan/route.ts and output/route.ts get separate Map instances
 */
const globalForScans = globalThis as unknown as {
  scanExecutors: Map<string, ScanExecutor> | undefined;
};

const activeScans = globalForScans.scanExecutors ?? new Map<string, ScanExecutor>();

if (process.env.NODE_ENV !== 'production') {
  globalForScans.scanExecutors = activeScans;
}

/**
 * Get or create a scan executor
 */
export function getScanExecutor(scanId: string): ScanExecutor | undefined {
  const timestamp = new Date().toISOString();
  const mapSize = activeScans.size;
  const mapKeys = Array.from(activeScans.keys());
  const executor = activeScans.get(scanId);

  console.log(`[ScanRegistry] [${timestamp}] GET executor for scanId: ${scanId}`);
  console.log(`[ScanRegistry] Map state: size=${mapSize}, keys=[${mapKeys.join(', ')}]`);
  console.log(`[ScanRegistry] Result: ${executor ? 'FOUND' : 'NOT FOUND'}`);

  return executor;
}

/**
 * Register a new scan executor
 */
export function registerScanExecutor(scanId: string, executor: ScanExecutor): void {
  const timestamp = new Date().toISOString();
  const mapSizeBefore = activeScans.size;
  const mapKeysBefore = Array.from(activeScans.keys());

  console.log(`[ScanRegistry] [${timestamp}] REGISTERING scanId: ${scanId}`);
  console.log(`[ScanRegistry] Map state BEFORE: size=${mapSizeBefore}, keys=[${mapKeysBefore.join(', ')}]`);

  activeScans.set(scanId, executor);

  const mapSizeAfter = activeScans.size;
  const mapKeysAfter = Array.from(activeScans.keys());

  console.log(`[ScanRegistry] Map state AFTER: size=${mapSizeAfter}, keys=[${mapKeysAfter.join(', ')}]`);
  console.log(`[ScanRegistry] Registration SUCCESS for ${scanId}`);

  // Auto-cleanup after scan completes (1 hour retention)
  executor.once('complete', () => {
    setTimeout(() => {
      console.log(`[ScanRegistry] Auto-cleanup: Removing completed scan ${scanId}`);
      activeScans.delete(scanId);
    }, 60 * 60 * 1000); // 1 hour
  });

  executor.once('error', () => {
    setTimeout(() => {
      console.log(`[ScanRegistry] Auto-cleanup: Removing failed scan ${scanId}`);
      activeScans.delete(scanId);
    }, 60 * 60 * 1000); // 1 hour
  });
}

/**
 * Inspect the scan registry for debugging
 * Returns current state of all active scans
 */
export function inspectScanRegistry() {
  const timestamp = new Date().toISOString();
  const registrySize = activeScans.size;
  const scanIds = Array.from(activeScans.keys());

  const scans = Array.from(activeScans.entries()).map(([scanId, executor]) => {
    const status = executor.getScanStatus();
    return {
      scanId,
      status: status.status,
      projectCount: status.totalProjects,
      currentProject: status.currentProjectIndex,
      startedAt: status.startedAt,
      completedAt: status.completedAt,
      errorMessage: status.errorMessage,
    };
  });

  console.log(`[ScanRegistry] Inspection at ${timestamp}: size=${registrySize}, ids=[${scanIds.join(', ')}]`);

  return {
    timestamp,
    registrySize,
    scanIds,
    scans,
  };
}

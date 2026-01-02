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

/**
 * Scan execution configuration
 */
interface ScanConfig {
  /** Array of absolute project paths to scan */
  projectPaths: string[];

  /** Unique scan identifier */
  scanId: string;
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

        await this.runScanForProject(this.projectPaths[i]);
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
   * Run scan-all.py for a single project
   * Uses child_process.spawn() to execute Python script
   */
  private async runScanForProject(projectPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Locate scan-all.py script
      const scanScriptPath = process.env.SCAN_SCRIPT_PATH ||
        'C:\\Users\\willh\\Desktop\\projects\\coderef-system\\scripts\\scan-all.py';

      this.emitOutput(`\n[Scanner] Starting scan for: ${projectPath}`);
      this.emitOutput(`[Scanner] Using script: ${scanScriptPath}\n`);

      // Spawn Python subprocess
      this.currentProcess = spawn('python', [scanScriptPath, projectPath], {
        stdio: ['ignore', 'pipe', 'pipe'],
        cwd: path.dirname(scanScriptPath),
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
          this.emitOutput(`[Scanner] Completed: ${projectPath}\n`);
          resolve();
        } else if (code === null) {
          // Process was killed (cancelled)
          this.emitOutput(`[Scanner] Cancelled: ${projectPath}\n`);
          resolve();
        } else {
          reject(new Error(`Scan failed with exit code ${code}`));
        }
        this.currentProcess = null;
      });

      // Handle process error (e.g., python not found)
      this.currentProcess.on('error', (error) => {
        this.emitOutput(`[ERROR] Failed to start scan: ${error.message}\n`);
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

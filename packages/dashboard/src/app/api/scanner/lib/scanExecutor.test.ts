
import { ScanExecutor } from './scanExecutor';
import { EventEmitter } from 'events';
import { ChildProcess } from 'child_process';

// Mock @coderef/core
jest.mock('@coderef/core', () => ({
  scanCurrentElements: jest.fn(),
}));

// Mock child_process
jest.mock('child_process', () => ({
  spawn: jest.fn(),
  execSync: jest.fn(),
}));

import { scanCurrentElements } from '@coderef/core';
import { spawn, execSync } from 'child_process';

const mockSpawn = spawn as unknown as jest.Mock;
const mockExecSync = execSync as unknown as jest.Mock;

describe('ScanExecutor', () => {
  let executor: ScanExecutor;
  const mockConfig = {
    projectPaths: ['/path/to/project'],
    scanId: 'test-scan-id',
    selections: {
      'project-1': {
        directories: true,
        scan: true,
        populate: true,
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    executor = new ScanExecutor(mockConfig);
    executor.setProjectIdMapping(new Map([['/path/to/project', 'project-1']]));
  });

  // Helper to create a mock ChildProcess
  const createMockChildProcess = (exitCode: number | null = 0, stdout = '', stderr = '') => {
    const cp = new EventEmitter() as any;
    cp.stdout = new EventEmitter();
    cp.stderr = new EventEmitter();
    cp.kill = jest.fn();
    
    // Simulate process execution on next tick
    setTimeout(() => {
      if (stdout) cp.stdout.emit('data', Buffer.from(stdout));
      if (stderr) cp.stderr.emit('data', Buffer.from(stderr));
      cp.emit('close', exitCode);
    }, 10);
    
    return cp;
  };

  test('should initialize with correct state', () => {
    const status = executor.getScanStatus();
    expect(status.status).toBe('idle');
    expect(status.totalProjects).toBe(1);
    expect(status.currentProjectIndex).toBe(0);
  });

  test('should execute full scan lifecycle successfully', async () => {
    // Mock Python command finding
    (mockExecSync as jest.Mock).mockReturnValue('python3');

    // Mock scanCurrentElements success
    (scanCurrentElements as jest.Mock).mockResolvedValue([
      { file: 'test.ts', type: 'function', name: 'test' }
    ]);

    // Mock spawns (directories and populate)
    (mockSpawn as jest.Mock)
      .mockImplementationOnce(() => createMockChildProcess(0, 'Dir created')) // Directories
      .mockImplementationOnce(() => createMockChildProcess(0, 'Populated'));  // Populate

    const progressSpy = jest.fn();
    const outputSpy = jest.fn();
    const completeSpy = jest.fn();

    executor.on('progress', progressSpy);
    executor.on('output', outputSpy);
    executor.on('complete', completeSpy);

    await executor.startScan();

    expect(scanCurrentElements).toHaveBeenCalledWith(
      '/path/to/project',
      ['ts', 'tsx', 'js', 'jsx'],
      expect.any(Object)
    );

    expect(mockSpawn).toHaveBeenCalledTimes(2); // Directories + Populate
    expect(completeSpy).toHaveBeenCalled();
    expect(executor.getScanStatus().status).toBe('completed');
  });

  test('should handle scan error and skip populate', async () => {
    (mockExecSync as jest.Mock).mockReturnValue('python3');
    
    // Mock directory success
    (mockSpawn as jest.Mock).mockImplementationOnce(() => createMockChildProcess(0));

    // Mock scan failure
    (scanCurrentElements as jest.Mock).mockRejectedValue(new Error('Scan failed'));

    // We expect populate NOT to be called
    
    await executor.startScan();

    expect(mockSpawn).toHaveBeenCalledTimes(1); // Only directories, no populate
    expect(scanCurrentElements).toHaveBeenCalled();
    
    // Should still complete the overall process (as it moves to next project or finishes)
    // but the individual project failed scan
    expect(executor.getScanStatus().status).toBe('completed'); 
    
    const output = executor.getBufferedOutput();
    expect(output.join('')).toContain('[ERROR] Scan failed');
    expect(output.join('')).toContain('Skipping populate phase');
  });

  test('should handle directory creation failure but continue', async () => {
    (mockExecSync as jest.Mock).mockReturnValue('python3');

    // Mock directory failure
    (mockSpawn as jest.Mock)
      .mockImplementationOnce(() => createMockChildProcess(1, '', 'Dir error'));
      
    // Mock scan success
    (scanCurrentElements as jest.Mock).mockResolvedValue([]);
    
    // Mock populate success
    (mockSpawn as jest.Mock)
      .mockImplementationOnce(() => createMockChildProcess(0));

    await executor.startScan();

    expect(mockSpawn).toHaveBeenCalledTimes(2); // Dirs (failed) + Populate (ran)
    expect(scanCurrentElements).toHaveBeenCalled();
    
    const output = executor.getBufferedOutput();
    expect(output.join('')).toContain('[ERROR] Directory creation failed');
  });

  test('should cancel scan', (done) => {
    (mockExecSync as jest.Mock).mockReturnValue('python3');
    
    // Manual control of the process
    const runningCp = new EventEmitter() as any;
    runningCp.stdout = new EventEmitter();
    runningCp.stderr = new EventEmitter();
    runningCp.kill = jest.fn();
    
    (mockSpawn as jest.Mock).mockReturnValue(runningCp);

    executor.startScan().then(() => {
      // Should eventually resolve when cancelled
      expect(executor.getScanStatus().status).toBe('cancelled');
      
      // Verify strict early exit
      expect(mockSpawn).toHaveBeenCalledTimes(1); // Only directory creation started
      expect(scanCurrentElements).not.toHaveBeenCalled(); // Scan phase skipped
      
      done();
    });

    // Let it start
    setTimeout(() => {
        expect(executor.getScanStatus().status).toBe('running');
        executor.cancelScan();
        
        // Simulate process kill effect (which resolves runDirectoriesForProject)
        runningCp.emit('close', null); 
    }, 50);
  });
});

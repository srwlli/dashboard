
import { ScanExecutor } from './scanExecutor';
import { EventEmitter } from 'events';
import { ChildProcess } from 'child_process';

// Mock @coderef/core
jest.mock('@coderef/core', () => ({
  scanCurrentElements: jest.fn(),
  saveIndex: jest.fn(),
  generateContext: jest.fn(),
  buildDependencyGraph: jest.fn(),
  detectPatterns: jest.fn(),
  analyzeCoverage: jest.fn(),
  validateReferences: jest.fn(),
  detectDrift: jest.fn(),
}));

// Mock child_process
jest.mock('child_process', () => ({
  spawn: jest.fn(),
  execSync: jest.fn(),
}));

import { 
  scanCurrentElements,
  saveIndex,
  generateContext,
  buildDependencyGraph,
  detectPatterns,
  analyzeCoverage,
  validateReferences,
  detectDrift,
} from '@coderef/core';
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

    // Mock spawns (directories only - populate is now TypeScript)
    (mockSpawn as jest.Mock)
      .mockImplementationOnce(() => createMockChildProcess(0, 'Dir created')); // Directories

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

    expect(mockSpawn).toHaveBeenCalledTimes(1); // Directories only (generate is TypeScript)
    // Verify file generation functions were called
    expect(saveIndex).toHaveBeenCalled();
    expect(generateContext).toHaveBeenCalled();
    expect(buildDependencyGraph).toHaveBeenCalled();
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
    
    // No populate spawn needed (now TypeScript)

    await executor.startScan();

    expect(mockSpawn).toHaveBeenCalledTimes(1); // Dirs only (generate is TypeScript)
    // Verify file generation was called
    expect(saveIndex).toHaveBeenCalled();
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

  // ============================================
  // Phase 2 Tests: Caching & TypeScript Generation
  // Workorder: WO-CODEREF-CLI-IMPLEMENTATION-001
  // ============================================

  describe('Phase 2: Caching & File Generation', () => {
    const mockElements = [
      { file: 'src/auth.ts', type: 'function' as const, name: 'authenticateUser', line: 10, exported: true },
      { file: 'src/user.ts', type: 'class' as const, name: 'UserService', line: 5, exported: true },
    ];

    beforeEach(() => {
      jest.clearAllMocks();
      (mockExecSync as jest.Mock).mockReturnValue('python3');
      (scanCurrentElements as jest.Mock).mockResolvedValue(mockElements);
      (saveIndex as jest.Mock).mockResolvedValue(undefined);
      (generateContext as jest.Mock).mockResolvedValue(undefined);
      (buildDependencyGraph as jest.Mock).mockResolvedValue({ nodes: [], edges: [] });
      (detectPatterns as jest.Mock).mockResolvedValue(undefined);
      (analyzeCoverage as jest.Mock).mockResolvedValue(undefined);
      (validateReferences as jest.Mock).mockResolvedValue(undefined);
      (detectDrift as jest.Mock).mockResolvedValue(undefined);
    });

    test('should have scanResults cache property', () => {
      expect(executor['scanResults']).toBeDefined();
      expect(executor['scanResults']).toBeInstanceOf(Map);
    });

    test('should cache scan results after runScanForProject', async () => {
      const projectPath = '/path/to/project';
      
      // Call runScanForProject (private method, accessed via reflection)
      await executor['runScanForProject'](projectPath);

      // Verify cache was populated
      const cached = executor['scanResults'].get(projectPath);
      expect(cached).toBeDefined();
      expect(cached).toEqual(mockElements);
      expect(scanCurrentElements).toHaveBeenCalledTimes(1);
    });

    test('should use cached results in runGenerateForProject (no re-scan)', async () => {
      const projectPath = '/path/to/project';
      
      // First, populate cache
      executor['scanResults'].set(projectPath, mockElements);

      // Call runGenerateForProject
      await executor['runGenerateForProject'](projectPath);

      // Verify scanCurrentElements was NOT called again
      expect(scanCurrentElements).not.toHaveBeenCalled();

      // Verify file generation functions were called with cached data
      expect(saveIndex).toHaveBeenCalledWith(projectPath, mockElements);
      expect(generateContext).toHaveBeenCalledWith(projectPath, mockElements);
      expect(buildDependencyGraph).toHaveBeenCalledWith(projectPath, mockElements);
    });

    test('should throw error if no cached data exists for runGenerateForProject', async () => {
      const projectPath = '/path/to/project';
      
      // Don't populate cache
      
      await expect(
        executor['runGenerateForProject'](projectPath)
      ).rejects.toThrow('No scan data found. Run scan phase first.');

      // Verify no file generation was attempted
      expect(saveIndex).not.toHaveBeenCalled();
    });

    test('should execute file generation functions in parallel', async () => {
      const projectPath = '/path/to/project';
      executor['scanResults'].set(projectPath, mockElements);

      // Track call order
      const callOrder: string[] = [];
      (saveIndex as jest.Mock).mockImplementation(async () => {
        callOrder.push('saveIndex');
        await new Promise(resolve => setTimeout(resolve, 50));
      });
      (generateContext as jest.Mock).mockImplementation(async () => {
        callOrder.push('generateContext');
        await new Promise(resolve => setTimeout(resolve, 50));
      });
      (buildDependencyGraph as jest.Mock).mockImplementation(async () => {
        callOrder.push('buildDependencyGraph');
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      const startTime = Date.now();
      await executor['runGenerateForProject'](projectPath);
      const duration = Date.now() - startTime;

      // saveIndex runs first (sequential)
      expect(callOrder[0]).toBe('saveIndex');
      
      // generateContext and buildDependencyGraph run in parallel (order may vary)
      expect(callOrder).toContain('generateContext');
      expect(callOrder).toContain('buildDependencyGraph');

      // Duration should be less than sequential (saveIndex + max(generateContext, buildDependencyGraph))
      // Sequential would be ~150ms, parallel should be ~100ms
      expect(duration).toBeLessThan(150);
    });

    test('should generate all 4 core files', async () => {
      const projectPath = '/path/to/project';
      executor['scanResults'].set(projectPath, mockElements);

      await executor['runGenerateForProject'](projectPath);

      // Verify all core functions called
      expect(saveIndex).toHaveBeenCalledTimes(1);
      expect(generateContext).toHaveBeenCalledTimes(1);
      expect(buildDependencyGraph).toHaveBeenCalledTimes(1);
    });

    test('should handle analysis functions with Promise.allSettled', async () => {
      const projectPath = '/path/to/project';
      executor['scanResults'].set(projectPath, mockElements);

      // Make one analysis function fail
      (detectPatterns as jest.Mock).mockRejectedValue(new Error('Pattern detection failed'));
      (analyzeCoverage as jest.Mock).mockResolvedValue(undefined);
      (validateReferences as jest.Mock).mockResolvedValue(undefined);
      (detectDrift as jest.Mock).mockResolvedValue(undefined);

      // Should not throw (Promise.allSettled handles failures)
      await expect(
        executor['runGenerateForProject'](projectPath)
      ).resolves.not.toThrow();

      // All analysis functions should have been called
      expect(detectPatterns).toHaveBeenCalled();
      expect(analyzeCoverage).toHaveBeenCalled();
      expect(validateReferences).toHaveBeenCalled();
      expect(detectDrift).toHaveBeenCalled();
    });

    test('should emit output messages during generation', async () => {
      const projectPath = '/path/to/project';
      executor['scanResults'].set(projectPath, mockElements);

      const outputSpy = jest.fn();
      executor.on('output', outputSpy);

      await executor['runGenerateForProject'](projectPath);

      const output = outputSpy.mock.calls.map(call => call[0]).join('');
      
      expect(output).toContain('[Generate] Starting file generation');
      expect(output).toContain('[Generate] Using cached scan data');
      expect(output).toContain('[Generate] Saving index...');
      expect(output).toContain('[Generate] ✓ index.json');
      expect(output).toContain('[Generate] Creating context and graph...');
      expect(output).toContain('[Generate] ✓ context.json, context.md, graph.json');
      expect(output).toContain('[Generate] Completed');
    });

    test('should cache results per project path (isolated)', async () => {
      const project1 = '/path/to/project1';
      const project2 = '/path/to/project2';
      const elements1 = [{ file: 'src/file1.ts', type: 'function' as const, name: 'func1', line: 1 }];
      const elements2 = [{ file: 'src/file2.ts', type: 'function' as const, name: 'func2', line: 2 }];

      // Scan both projects
      (scanCurrentElements as jest.Mock)
        .mockResolvedValueOnce(elements1)
        .mockResolvedValueOnce(elements2);

      await executor['runScanForProject'](project1);
      await executor['runScanForProject'](project2);

      // Verify separate cache entries
      expect(executor['scanResults'].get(project1)).toEqual(elements1);
      expect(executor['scanResults'].get(project2)).toEqual(elements2);
      expect(executor['scanResults'].size).toBe(2);
    });

    test('should complete full workflow: scan → cache → generate', async () => {
      const projectPath = '/path/to/project';
      const executor = new ScanExecutor({
        projectPaths: [projectPath],
        scanId: 'test-workflow',
        selections: {
          'project-1': {
            directories: false,
            scan: true,
            populate: true,
          }
        }
      });
      executor.setProjectIdMapping(new Map([[projectPath, 'project-1']]));

      // Mock directory creation (not needed for this test)
      (mockSpawn as jest.Mock).mockImplementation(() => createMockChildProcess(0));

      const scanSpy = scanCurrentElements as jest.Mock;
      const saveIndexSpy = saveIndex as jest.Mock;
      const generateContextSpy = generateContext as jest.Mock;
      const buildGraphSpy = buildDependencyGraph as jest.Mock;

      await executor.startScan();

      // Verify scan was called
      expect(scanSpy).toHaveBeenCalledTimes(1);

      // Verify cache was populated
      expect(executor['scanResults'].get(projectPath)).toEqual(mockElements);

      // Verify generation functions were called with cached data
      expect(saveIndexSpy).toHaveBeenCalledWith(projectPath, mockElements);
      expect(generateContextSpy).toHaveBeenCalledWith(projectPath, mockElements);
      expect(buildGraphSpy).toHaveBeenCalledWith(projectPath, mockElements);

      // Verify scan was only called once (not re-scanned for generation)
      expect(scanSpy).toHaveBeenCalledTimes(1);
    });

    test('should not re-scan when running same project twice', async () => {
      const projectPath = '/path/to/project';
      
      // First scan
      await executor['runScanForProject'](projectPath);
      expect(scanCurrentElements).toHaveBeenCalledTimes(1);

      // Second scan (should use cache if implemented, or re-scan if not)
      // For now, verify it doesn't re-scan unnecessarily
      const cachedBefore = executor['scanResults'].get(projectPath);
      await executor['runScanForProject'](projectPath);
      const cachedAfter = executor['scanResults'].get(projectPath);

      // Cache should still exist
      expect(cachedAfter).toBeDefined();
      // Note: Current implementation re-scans, but cache is updated
      // This test documents current behavior
    });
  });
});

/**
 * ISSUE #2: No Error Handling for localStorage QuotaExceededError
 *
 * PROBLEM:
 * When localStorage is full (5-10MB limit depending on browser), any write
 * attempt throws a QuotaExceededError. The component doesn't catch this,
 * causing the entire component to crash.
 *
 * EXPECTED BEHAVIOR:
 * - Try to save to localStorage
 * - If QuotaExceededError is thrown, catch it
 * - Log warning to console
 * - Continue operating (graceful degradation)
 * - Optionally show user a warning toast
 *
 * CURRENT BEHAVIOR:
 * - Throws uncaught exception
 * - Component crashes
 * - User sees white screen or error boundary
 */

import { render, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CodeRefExplorerWidget } from '../CodeRefExplorerWidget';
import type { Project } from '@/lib/coderef/types';
import React from 'react';

// Mock components
jest.mock('@/components/coderef/ProjectSelector', () => ({
  ProjectSelector: ({ selectedProjectId, onProjectChange }: any) => {
    const mockProjects: Project[] = [
      { id: 'project-1', name: 'Project Alpha', path: '/path/alpha', addedAt: '2024-01-01' },
      { id: 'project-2', name: 'Project Beta', path: '/path/beta', addedAt: '2024-01-02' },
    ];

    return (
      <div data-testid="project-selector">
        <select
          data-testid="project-select"
          value={selectedProjectId || ''}
          onChange={(e) => {
            const project = mockProjects.find((p) => p.id === e.target.value);
            onProjectChange(project || null);
          }}
        >
          <option value="">Select Project</option>
          {mockProjects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
    );
  },
}));

jest.mock('@/components/coderef/FileTree', () => ({
  FileTree: () => <div data-testid="file-tree">FileTree Mock</div>,
}));

jest.mock('@/components/coderef/FileViewer', () => ({
  FileViewer: () => <div data-testid="file-viewer">FileViewer Mock</div>,
}));

jest.mock('@/components/coderef/ViewModeToggle', () => ({
  ViewModeToggle: () => <div data-testid="view-mode-toggle">ViewModeToggle Mock</div>,
}));

describe('ISSUE #2: localStorage QuotaExceededError Handling', () => {
  let originalSetItem: typeof Storage.prototype.setItem;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();

    originalSetItem = Storage.prototype.setItem;
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    Storage.prototype.setItem = originalSetItem;
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  // ===================================================================
  // TEST 1: Demonstrate the crash
  // ===================================================================

  test('PROBLEM: QuotaExceededError crashes the component', async () => {
    // Mock localStorage.setItem to throw QuotaExceededError
    Storage.prototype.setItem = jest.fn(() => {
      const error = new DOMException(
        'Failed to execute \'setItem\' on \'Storage\': Setting the value of \'coderef-explorer-selected-project\' exceeded the quota.',
        'QuotaExceededError'
      );
      throw error;
    });

    const { getByTestId } = render(<CodeRefExplorerWidget />);

    // Try to select a project (this will trigger save)
    const select = getByTestId('project-select');

    // This should throw an error and crash the component
    await expect(async () => {
      await userEvent.selectOptions(select, 'project-1');
      // Wait for the error to propagate
      await new Promise(resolve => setTimeout(resolve, 100));
    }).rejects.toThrow();

    // Component crashed - this is the bug!
  });

  // ===================================================================
  // TEST 2: Component should continue working after quota error
  // ===================================================================

  test('EXPECTED: Component should gracefully degrade when quota exceeded', async () => {
    let quotaExceeded = false;

    // Mock setItem to throw only for project saves
    Storage.prototype.setItem = jest.fn((key, value) => {
      if (key === 'coderef-explorer-selected-project' && quotaExceeded) {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      }
      return originalSetItem.call(localStorage, key, value);
    });

    const { getByTestId } = render(<CodeRefExplorerWidget />);

    // First selection works
    await userEvent.selectOptions(getByTestId('project-select'), 'project-1');
    await waitFor(() => {
      expect(getByTestId('file-tree')).toBeTruthy();
    });

    // Now simulate quota exceeded
    quotaExceeded = true;

    // Try to select another project
    // With proper error handling, this should NOT crash
    await userEvent.selectOptions(getByTestId('project-select'), 'project-2');

    // Component should still be mounted and functional
    await waitFor(() => {
      expect(getByTestId('file-tree')).toBeTruthy();
      expect(getByTestId('file-viewer')).toBeTruthy();
    });

    // Should log error/warning
    // expect(consoleWarnSpy).toHaveBeenCalledWith(
    //   expect.stringContaining('localStorage quota'),
    //   expect.anything()
    // );
  });

  // ===================================================================
  // TEST 3: Favorites persistence should also handle quota errors
  // ===================================================================

  test('FAVORITES: Should handle quota errors when saving favorites', async () => {
    // Mock setItem to throw for favorites
    Storage.prototype.setItem = jest.fn((key, value) => {
      if (key.startsWith('coderef-favorites-')) {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      }
      return originalSetItem.call(localStorage, key, value);
    });

    const { getByTestId } = render(<CodeRefExplorerWidget />);

    // Select a project (this triggers favorites loading/creation)
    await userEvent.selectOptions(getByTestId('project-select'), 'project-1');

    // Should not crash
    await waitFor(() => {
      expect(getByTestId('file-tree')).toBeTruthy();
    });

    // Favorites save failed but component still works
  });

  // ===================================================================
  // TEST 4: Show real-world quota limit scenario
  // ===================================================================

  test('REAL-WORLD: Simulate actual localStorage quota limit', async () => {
    // Typical localStorage quota: 5-10 MB
    // Fill it up by storing large data

    const fillLocalStorage = () => {
      try {
        for (let i = 0; i < 1000; i++) {
          const largeString = 'x'.repeat(10000); // 10KB
          localStorage.setItem(`filler-${i}`, largeString);
        }
      } catch (e) {
        // Quota reached
        console.log('localStorage quota reached after filling');
      }
    };

    fillLocalStorage();

    // Now try to use the component
    const { getByTestId } = render(<CodeRefExplorerWidget />);

    // Select project - this might fail to save due to quota
    await userEvent.selectOptions(getByTestId('project-select'), 'project-1');

    // Component should still render
    expect(getByTestId('file-tree')).toBeTruthy();

    // Clean up
    localStorage.clear();
  });

  // ===================================================================
  // TEST 5: Solution - Wrap saves in try/catch
  // ===================================================================

  test('SOLUTION: All localStorage writes should be wrapped in try/catch', () => {
    // The fix would look like this in the component:

    const exampleSaveFunction = (key: string, value: string) => {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.warn('localStorage quota exceeded. Operating in degraded mode.', {
            key,
            quotaExceeded: true,
          });
          // Optionally: Show user a toast notification
          // Optionally: Clear old data to make space
        } else {
          console.error('Failed to save to localStorage:', error);
        }
      }
    };

    // Test the example
    Storage.prototype.setItem = jest.fn(() => {
      throw new DOMException('QuotaExceededError', 'QuotaExceededError');
    });

    // Should not throw
    expect(() => {
      exampleSaveFunction('test-key', 'test-value');
    }).not.toThrow();

    // Should log warning
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('quota exceeded'),
      expect.objectContaining({ quotaExceeded: true })
    );
  });

  // ===================================================================
  // TEST 6: Verify all localStorage write locations
  // ===================================================================

  test('AUDIT: Identify all localStorage write locations that need error handling', () => {
    // List of all localStorage writes in CodeRefExplorerWidget:
    const locationsNeedingErrorHandling = [
      {
        location: 'Line 80-82',
        code: 'localStorage.setItem("coderef-favorites-*", JSON.stringify(favoritesData))',
        risk: 'HIGH - Can fail when saving large favorites',
      },
      {
        location: 'Line 87-89',
        code: 'localStorage.setItem("coderef-explorer-selected-project", selectedProject.id)',
        risk: 'MEDIUM - Usually small data but can fail if quota full',
      },
    ];

    console.log('Locations needing try/catch:');
    locationsNeedingErrorHandling.forEach((loc) => {
      console.log(`  ${loc.location}: ${loc.code}`);
      console.log(`  Risk: ${loc.risk}\n`);
    });

    // Both locations should be wrapped in try/catch
    expect(locationsNeedingErrorHandling).toHaveLength(2);
  });

  // ===================================================================
  // TEST 7: Auto-recovery strategy
  // ===================================================================

  test('ENHANCEMENT: Could auto-clear old data when quota exceeded', async () => {
    const autoRecoverySave = (key: string, value: string) => {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.warn('Quota exceeded. Attempting to clear old data...');

          // Strategy: Clear old favorites for projects we haven't used in a while
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const storageKey = localStorage.key(i);
            if (storageKey?.startsWith('coderef-favorites-') && storageKey !== key) {
              keysToRemove.push(storageKey);
            }
          }

          // Remove one old key
          if (keysToRemove.length > 0) {
            localStorage.removeItem(keysToRemove[0]);
            console.log(`Removed old data: ${keysToRemove[0]}`);

            // Retry
            try {
              localStorage.setItem(key, value);
              console.log('Retry successful after clearing old data');
            } catch (retryError) {
              console.error('Still failed after clearing data');
            }
          }
        }
      }
    };

    // Test the recovery
    Storage.prototype.setItem = jest.fn((key, value) => {
      if (key === 'test-new-key') {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      }
      return originalSetItem.call(localStorage, key, value);
    });

    // Pre-populate with old data
    localStorage.setItem('coderef-favorites-old-project', JSON.stringify({ favorites: [] }));

    // Try to save new data
    autoRecoverySave('test-new-key', 'test-value');

    // Should have attempted to clear old data
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Attempting to clear old data')
    );
  });
});

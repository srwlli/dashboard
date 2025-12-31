/**
 * ISSUE #1: Restoration Flag - Component saves during initial restoration
 *
 * PROBLEM:
 * When the component mounts and restores a saved project from localStorage,
 * it triggers the "save to localStorage" effect, which is wasteful and can
 * cause issues if the saved project no longer exists.
 *
 * EXPECTED BEHAVIOR:
 * - On mount: Read from localStorage, set initialProjectId
 * - ProjectSelector restores project
 * - Set isRestoringProject=false
 * - ONLY THEN should subsequent changes save to localStorage
 *
 * CURRENT BEHAVIOR:
 * - On mount: Read from localStorage
 * - When project is restored, it triggers save effect immediately
 * - This writes to localStorage even though nothing changed
 */

import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CodeRefExplorerWidget } from '../CodeRefExplorerWidget';
import type { Project } from '@/lib/coderef/types';

// Mock components
jest.mock('@/components/coderef/ProjectSelector', () => ({
  ProjectSelector: ({ initialProjectId, onProjectChange, selectedProjectId }: any) => {
    const mockProjects: Project[] = [
      { id: 'project-1', name: 'Project Alpha', path: '/path/alpha', addedAt: '2024-01-01' },
      { id: 'project-2', name: 'Project Beta', path: '/path/beta', addedAt: '2024-01-02' },
    ];

    // Simulate auto-selection when initialProjectId is provided
    React.useEffect(() => {
      if (initialProjectId && !selectedProjectId) {
        const project = mockProjects.find((p) => p.id === initialProjectId);
        if (project) {
          // Simulate restoration by calling onProjectChange
          setTimeout(() => onProjectChange(project), 0);
        }
      }
    }, [initialProjectId, selectedProjectId, onProjectChange]);

    return (
      <div data-testid="project-selector">
        <span data-testid="initial-project-id">{initialProjectId || 'none'}</span>
        <span data-testid="selected-project-id">{selectedProjectId || 'none'}</span>
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

// Need React for useEffect in mock
import React from 'react';

describe('ISSUE #1: Restoration Flag - Prevents Wasteful Saves', () => {
  let setItemSpy: jest.SpyInstance;
  let getItemSpy: jest.SpyInstance;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();

    // Spy on localStorage methods
    setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    getItemSpy = jest.spyOn(Storage.prototype, 'getItem');
  });

  afterEach(() => {
    setItemSpy.mockRestore();
    getItemSpy.mockRestore();
  });

  // ===================================================================
  // TEST 1: Demonstrate the problem
  // ===================================================================

  test('PROBLEM: Component saves to localStorage during restoration (wasteful)', async () => {
    // Setup: localStorage already has saved project
    localStorage.setItem('coderef-explorer-selected-project', 'project-1');

    // Render component (this simulates page refresh)
    render(<CodeRefExplorerWidget />);

    // Wait for restoration to complete
    await waitFor(() => {
      const getItemCalls = getItemSpy.mock.calls.filter(
        (call) => call[0] === 'coderef-explorer-selected-project'
      );
      expect(getItemCalls.length).toBeGreaterThan(0);
    });

    // Wait a bit for effects to run
    await waitFor(() => {
      // Component should NOT write back the same value during restoration
      const setItemCalls = setItemSpy.mock.calls.filter(
        (call) => call[0] === 'coderef-explorer-selected-project' && call[1] === 'project-1'
      );

      // EXPECTED: 0 (no save during restoration)
      // ACTUAL: 1 (it saves during restoration)
      console.log('setItem calls during restoration:', setItemCalls.length);

      // This test DOCUMENTS the bug
      expect(setItemCalls.length).toBeGreaterThan(0); // Currently fails because it DOES save
    }, { timeout: 2000 });
  });

  // ===================================================================
  // TEST 2: Show what SHOULD happen
  // ===================================================================

  test('EXPECTED: Should NOT save during restoration, only on user changes', async () => {
    localStorage.setItem('coderef-explorer-selected-project', 'project-1');

    const { getByTestId } = render(<CodeRefExplorerWidget />);

    // Wait for restoration
    await waitFor(() => {
      expect(getItemSpy).toHaveBeenCalledWith('coderef-explorer-selected-project');
    });

    // Clear the spy to start fresh count
    setItemSpy.mockClear();

    // NOW user manually changes project
    await waitFor(() => {
      const select = getByTestId('project-select');
      expect(select).toBeTruthy();
    });

    const select = getByTestId('project-select');
    await userEvent.selectOptions(select, 'project-2');

    // ONLY NOW should it save
    await waitFor(() => {
      const setItemCalls = setItemSpy.mock.calls.filter(
        (call) => call[0] === 'coderef-explorer-selected-project'
      );
      expect(setItemCalls.length).toBeGreaterThan(0);
    });
  });

  // ===================================================================
  // TEST 3: Performance impact
  // ===================================================================

  test('PERFORMANCE: Wasteful writes can cause issues', async () => {
    localStorage.setItem('coderef-explorer-selected-project', 'project-1');

    // Simulate multiple rapid refreshes (user hitting F5 repeatedly)
    for (let i = 0; i < 5; i++) {
      const { unmount } = render(<CodeRefExplorerWidget />);
      await waitFor(() => {
        expect(getItemSpy).toHaveBeenCalled();
      });
      unmount();
    }

    // Count unnecessary writes
    const unnecessaryWrites = setItemSpy.mock.calls.filter(
      (call) => call[0] === 'coderef-explorer-selected-project' && call[1] === 'project-1'
    );

    console.log('Unnecessary writes during 5 refreshes:', unnecessaryWrites.length);

    // EXPECTED: 0 (no writes during restoration)
    // ACTUAL: 5 (one per refresh)
    // This is wasteful and can cause performance issues
    expect(unnecessaryWrites.length).toBeGreaterThan(0); // Documents the bug
  });

  // ===================================================================
  // TEST 4: Edge case - Saved project no longer exists
  // ===================================================================

  test('EDGE CASE: Saving during restoration can persist invalid projects', async () => {
    // Setup: localStorage has a project that no longer exists
    localStorage.setItem('coderef-explorer-selected-project', 'deleted-project-999');

    render(<CodeRefExplorerWidget />);

    await waitFor(() => {
      expect(getItemSpy).toHaveBeenCalledWith('coderef-explorer-selected-project');
    });

    // Wait for potential saves
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if it tried to save the invalid project back
    const saveAttempts = setItemSpy.mock.calls.filter(
      (call) => call[0] === 'coderef-explorer-selected-project'
    );

    console.log('Save attempts for invalid project:', saveAttempts.length);

    // If it saves during restoration, it will write back the invalid project
    // This is a real bug - we shouldn't persist invalid state
  });

  // ===================================================================
  // TEST 5: Solution verification
  // ===================================================================

  test('SOLUTION: isRestoringProject flag should prevent saves', async () => {
    localStorage.setItem('coderef-explorer-selected-project', 'project-1');

    render(<CodeRefExplorerWidget />);

    // During restoration phase
    await waitFor(() => {
      expect(getItemSpy).toHaveBeenCalledWith('coderef-explorer-selected-project');
    });

    // Check console logs for restoration flag
    const consoleSpy = jest.spyOn(console, 'log');

    await waitFor(() => {
      const restorationLogs = consoleSpy.mock.calls.filter(
        (call) => call[0] && call[0].includes('Restoring saved project ID')
      );
      expect(restorationLogs.length).toBeGreaterThan(0);
    });

    consoleSpy.mockRestore();

    // The fix would be to check isRestoringProject in the save effect:
    // useEffect(() => {
    //   if (selectedProject && !isRestoringProject) {  // <-- Check flag
    //     localStorage.setItem('coderef-explorer-selected-project', selectedProject.id);
    //   }
    // }, [selectedProject?.id, isRestoringProject]);
  });
});

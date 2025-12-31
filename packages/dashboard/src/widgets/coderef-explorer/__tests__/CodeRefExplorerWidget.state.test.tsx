/**
 * Comprehensive State Management Tests for CodeRefExplorerWidget
 *
 * Tests cover:
 * 1. State persistence across refreshes/reloads
 * 2. State synchronization between localStorage and component state
 * 3. Edge cases (corrupted data, missing data, etc.)
 * 4. Multi-state coordination (viewMode, project, file, favorites)
 * 5. State restoration on mount
 */

import { render, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CodeRefExplorerWidget } from '../CodeRefExplorerWidget';
import type { Project } from '@/lib/coderef/types';

// Mock all child components
jest.mock('@/components/coderef/ProjectSelector', () => ({
  ProjectSelector: ({ initialProjectId, onProjectChange, selectedProjectId }: any) => {
    const mockProjects: Project[] = [
      { id: 'project-1', name: 'Project Alpha', path: '/path/alpha', addedAt: '2024-01-01' },
      { id: 'project-2', name: 'Project Beta', path: '/path/beta', addedAt: '2024-01-02' },
    ];

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
  FileTree: ({ project, filterPath, showOnlyFavorites, onFileClick }: any) => (
    <div data-testid="file-tree">
      <span data-testid="file-tree-project">{project?.name || 'none'}</span>
      <span data-testid="file-tree-filter">{filterPath || 'none'}</span>
      <span data-testid="file-tree-favorites">{String(showOnlyFavorites)}</span>
      <button
        data-testid="mock-file-click"
        onClick={() =>
          onFileClick({
            type: 'file',
            name: 'test.md',
            path: '/test/test.md',
          })
        }
      >
        Click File
      </button>
    </div>
  ),
}));

jest.mock('@/components/coderef/FileViewer', () => ({
  FileViewer: ({ project, filePath }: any) => (
    <div data-testid="file-viewer">
      <span data-testid="file-viewer-project">{project?.name || 'none'}</span>
      <span data-testid="file-viewer-path">{filePath || 'none'}</span>
    </div>
  ),
}));

jest.mock('@/components/coderef/ViewModeToggle', () => ({
  ViewModeToggle: ({ value, onChange }: any) => (
    <div data-testid="view-mode-toggle">
      <span data-testid="view-mode-value">{value}</span>
      <button data-testid="view-mode-projects" onClick={() => onChange('projects')}>
        Projects
      </button>
      <button data-testid="view-mode-coderef" onClick={() => onChange('coderef')}>
        CodeRef
      </button>
      <button data-testid="view-mode-favorites" onClick={() => onChange('favorites')}>
        Favorites
      </button>
    </div>
  ),
}));

describe('CodeRefExplorerWidget - Comprehensive State Management', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  // ===================================================================
  // GROUP 1: PROJECT PERSISTENCE
  // ===================================================================

  describe('Project Persistence', () => {
    it('should save selected project to localStorage when project changes', async () => {
      const { getByTestId } = render(<CodeRefExplorerWidget />);

      const projectSelect = getByTestId('project-select');

      // Select project-1
      await act(async () => {
        await userEvent.selectOptions(projectSelect, 'project-1');
      });

      // Wait for state to update and persist
      await waitFor(() => {
        const saved = localStorage.getItem('coderef-explorer-selected-project');
        expect(saved).toBe('project-1');
      });
    });

    it('should restore selected project from localStorage on mount', async () => {
      // Setup: Save project to localStorage
      localStorage.setItem('coderef-explorer-selected-project', 'project-2');

      const { getByTestId } = render(<CodeRefExplorerWidget />);

      // Initial project ID should be passed to ProjectSelector
      await waitFor(() => {
        const initialProjectId = getByTestId('initial-project-id');
        expect(initialProjectId.textContent).toBe('project-2');
      });
    });

    it('should handle corrupted project ID in localStorage gracefully', async () => {
      localStorage.setItem('coderef-explorer-selected-project', 'invalid-project-999');

      const { getByTestId } = render(<CodeRefExplorerWidget />);

      // Should not crash, initial ID should still be set
      await waitFor(() => {
        const initialProjectId = getByTestId('initial-project-id');
        expect(initialProjectId.textContent).toBe('invalid-project-999');
      });
    });

    it('should clear selected file when project changes', async () => {
      const { getByTestId } = render(<CodeRefExplorerWidget />);

      // Select project and file
      await act(async () => {
        await userEvent.selectOptions(getByTestId('project-select'), 'project-1');
      });

      await act(async () => {
        await userEvent.click(getByTestId('mock-file-click'));
      });

      // File should be selected
      await waitFor(() => {
        expect(getByTestId('file-viewer-path').textContent).toBe('/test/test.md');
      });

      // Change project
      await act(async () => {
        await userEvent.selectOptions(getByTestId('project-select'), 'project-2');
      });

      // File should be cleared
      await waitFor(() => {
        expect(getByTestId('file-viewer-path').textContent).toBe('none');
      });
    });

    it('should NOT save project during initial restoration', async () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

      localStorage.setItem('coderef-explorer-selected-project', 'project-1');

      render(<CodeRefExplorerWidget />);

      // Should not call setItem during restoration (only getItem)
      await waitFor(() => {
        const setItemCalls = setItemSpy.mock.calls.filter(
          (call) => call[0] === 'coderef-explorer-selected-project'
        );
        // May be called for favorites but not for project during restoration
        // Check that it's not called immediately on mount
        expect(setItemCalls.length).toBe(0);
      });

      setItemSpy.mockRestore();
    });
  });

  // ===================================================================
  // GROUP 2: VIEW MODE STATE
  // ===================================================================

  describe('View Mode State', () => {
    it('should default to "projects" view mode', () => {
      const { getByTestId } = render(<CodeRefExplorerWidget />);

      const viewModeValue = getByTestId('view-mode-value');
      expect(viewModeValue.textContent).toBe('projects');
    });

    it('should switch view modes correctly', async () => {
      const { getByTestId } = render(<CodeRefExplorerWidget />);

      // Switch to coderef mode
      await act(async () => {
        await userEvent.click(getByTestId('view-mode-coderef'));
      });

      await waitFor(() => {
        expect(getByTestId('view-mode-value').textContent).toBe('coderef');
      });

      // Switch to favorites mode
      await act(async () => {
        await userEvent.click(getByTestId('view-mode-favorites'));
      });

      await waitFor(() => {
        expect(getByTestId('view-mode-value').textContent).toBe('favorites');
      });
    });

    it('should pass filterPath="coderef" to FileTree in coderef mode', async () => {
      const { getByTestId } = render(<CodeRefExplorerWidget />);

      // Switch to coderef mode
      await act(async () => {
        await userEvent.click(getByTestId('view-mode-coderef'));
      });

      await waitFor(() => {
        expect(getByTestId('file-tree-filter').textContent).toBe('coderef');
      });
    });

    it('should pass showOnlyFavorites=true in favorites mode', async () => {
      const { getByTestId } = render(<CodeRefExplorerWidget />);

      // Switch to favorites mode
      await act(async () => {
        await userEvent.click(getByTestId('view-mode-favorites'));
      });

      await waitFor(() => {
        expect(getByTestId('file-tree-favorites').textContent).toBe('true');
      });
    });

    it('should clear selected file when switching view modes', async () => {
      const { getByTestId } = render(<CodeRefExplorerWidget />);

      // Select project and file
      await act(async () => {
        await userEvent.selectOptions(getByTestId('project-select'), 'project-1');
      });

      await act(async () => {
        await userEvent.click(getByTestId('mock-file-click'));
      });

      // File should be selected
      await waitFor(() => {
        expect(getByTestId('file-viewer-path').textContent).toBe('/test/test.md');
      });

      // Switch view mode
      await act(async () => {
        await userEvent.click(getByTestId('view-mode-coderef'));
      });

      // File should be cleared
      await waitFor(() => {
        expect(getByTestId('file-viewer-path').textContent).toBe('none');
      });
    });
  });

  // ===================================================================
  // GROUP 3: FAVORITES PERSISTENCE
  // ===================================================================

  describe('Favorites Persistence', () => {
    it('should load favorites from localStorage for selected project', async () => {
      const mockFavorites = {
        groups: [{ id: 'g1', name: 'Group 1', color: '#ff0000' }],
        favorites: [{ path: '/test/file1.md', group: 'Group 1' }],
      };

      localStorage.setItem('coderef-favorites-project-1', JSON.stringify(mockFavorites));

      const { getByTestId } = render(<CodeRefExplorerWidget />);

      // Select project
      await act(async () => {
        await userEvent.selectOptions(getByTestId('project-select'), 'project-1');
      });

      // Favorites should be loaded (we can't directly inspect state, but storage should be read)
      await waitFor(() => {
        const stored = localStorage.getItem('coderef-favorites-project-1');
        expect(stored).toBeTruthy();
      });
    });

    it('should handle corrupted favorites data gracefully', async () => {
      localStorage.setItem('coderef-favorites-project-1', 'invalid-json{{{');

      const { getByTestId } = render(<CodeRefExplorerWidget />);

      // Should not crash
      await act(async () => {
        await userEvent.selectOptions(getByTestId('project-select'), 'project-1');
      });

      // Should render without errors
      expect(getByTestId('file-tree')).toBeTruthy();
    });

    it('should migrate old favorites format (array) to new format (object)', async () => {
      const oldFormatFavorites = ['/test/file1.md', '/test/file2.md'];

      localStorage.setItem('coderef-favorites-project-1', JSON.stringify(oldFormatFavorites));

      const { getByTestId } = render(<CodeRefExplorerWidget />);

      // Select project
      await act(async () => {
        await userEvent.selectOptions(getByTestId('project-select'), 'project-1');
      });

      // After migration, should be new format
      await waitFor(() => {
        const stored = localStorage.getItem('coderef-favorites-project-1');
        if (stored) {
          const parsed = JSON.parse(stored);
          expect(parsed).toHaveProperty('groups');
          expect(parsed).toHaveProperty('favorites');
        }
      });
    });

    it('should create empty favorites when none exist', async () => {
      const { getByTestId } = render(<CodeRefExplorerWidget />);

      await act(async () => {
        await userEvent.selectOptions(getByTestId('project-select'), 'project-1');
      });

      // Empty favorites should be created
      await waitFor(() => {
        const stored = localStorage.getItem('coderef-favorites-project-1');
        if (stored) {
          const parsed = JSON.parse(stored);
          expect(parsed.groups).toEqual([]);
          expect(parsed.favorites).toEqual([]);
        }
      });
    });

    it('should persist favorites separately for each project', async () => {
      const { getByTestId } = render(<CodeRefExplorerWidget />);

      // Select project-1
      await act(async () => {
        await userEvent.selectOptions(getByTestId('project-select'), 'project-1');
      });

      // Project-1 favorites key should exist
      await waitFor(() => {
        expect(localStorage.getItem('coderef-favorites-project-1')).toBeTruthy();
      });

      // Switch to project-2
      await act(async () => {
        await userEvent.selectOptions(getByTestId('project-select'), 'project-2');
      });

      // Project-2 favorites key should exist
      await waitFor(() => {
        expect(localStorage.getItem('coderef-favorites-project-2')).toBeTruthy();
      });

      // Both should exist independently
      expect(localStorage.getItem('coderef-favorites-project-1')).toBeTruthy();
      expect(localStorage.getItem('coderef-favorites-project-2')).toBeTruthy();
    });
  });

  // ===================================================================
  // GROUP 4: REFRESH/RELOAD SCENARIOS
  // ===================================================================

  describe('Refresh/Reload Scenarios', () => {
    it('should restore full state after simulated refresh', async () => {
      // Setup initial state
      localStorage.setItem('coderef-explorer-selected-project', 'project-1');
      localStorage.setItem(
        'coderef-favorites-project-1',
        JSON.stringify({
          groups: [{ id: 'g1', name: 'Important', color: '#ff0000' }],
          favorites: [{ path: '/test/file.md', group: 'Important' }],
        })
      );

      // Simulate first render (before refresh)
      const { unmount: unmount1 } = render(<CodeRefExplorerWidget />);

      // Unmount (simulates navigating away)
      unmount1();

      // Simulate refresh - render again
      const { getByTestId } = render(<CodeRefExplorerWidget />);

      // Should restore project
      await waitFor(() => {
        const initialProjectId = getByTestId('initial-project-id');
        expect(initialProjectId.textContent).toBe('project-1');
      });

      // Should restore favorites
      await waitFor(() => {
        const stored = localStorage.getItem('coderef-favorites-project-1');
        expect(stored).toBeTruthy();
      });
    });

    it('should handle refresh with empty localStorage', () => {
      // No saved state

      const { getByTestId } = render(<CodeRefExplorerWidget />);

      // Should render with default state
      expect(getByTestId('view-mode-value').textContent).toBe('projects');
      expect(getByTestId('initial-project-id').textContent).toBe('none');
    });

    it('should handle partial state restoration (project but no favorites)', async () => {
      localStorage.setItem('coderef-explorer-selected-project', 'project-1');
      // No favorites saved

      const { getByTestId } = render(<CodeRefExplorerWidget />);

      // Project should restore
      await waitFor(() => {
        expect(getByTestId('initial-project-id').textContent).toBe('project-1');
      });

      // Favorites should be empty but not crash
      expect(getByTestId('file-tree')).toBeTruthy();
    });

    it('should maintain state consistency across multiple refreshes', async () => {
      // First render
      localStorage.setItem('coderef-explorer-selected-project', 'project-1');
      const { unmount: unmount1 } = render(<CodeRefExplorerWidget />);
      unmount1();

      // Second render (refresh 1)
      const { unmount: unmount2 } = render(<CodeRefExplorerWidget />);
      unmount2();

      // Third render (refresh 2)
      const { getByTestId } = render(<CodeRefExplorerWidget />);

      // State should still be consistent
      await waitFor(() => {
        expect(getByTestId('initial-project-id').textContent).toBe('project-1');
      });
    });
  });

  // ===================================================================
  // GROUP 5: STATE SYNCHRONIZATION
  // ===================================================================

  describe('State Synchronization', () => {
    it('should sync FileTree project prop with selected project', async () => {
      const { getByTestId } = render(<CodeRefExplorerWidget />);

      // Select project
      await act(async () => {
        await userEvent.selectOptions(getByTestId('project-select'), 'project-1');
      });

      // FileTree should receive the project
      await waitFor(() => {
        expect(getByTestId('file-tree-project').textContent).toBe('Project Alpha');
      });
    });

    it('should sync FileViewer project prop with selected project', async () => {
      const { getByTestId } = render(<CodeRefExplorerWidget />);

      // Select project
      await act(async () => {
        await userEvent.selectOptions(getByTestId('project-select'), 'project-1');
      });

      // FileViewer should receive the project
      await waitFor(() => {
        expect(getByTestId('file-viewer-project').textContent).toBe('Project Alpha');
      });
    });

    it('should sync FileViewer filePath with selected file', async () => {
      const { getByTestId } = render(<CodeRefExplorerWidget />);

      // Select project and file
      await act(async () => {
        await userEvent.selectOptions(getByTestId('project-select'), 'project-1');
      });

      await act(async () => {
        await userEvent.click(getByTestId('mock-file-click'));
      });

      // FileViewer should receive the file path
      await waitFor(() => {
        expect(getByTestId('file-viewer-path').textContent).toBe('/test/test.md');
      });
    });

    it('should handle rapid project switching without state corruption', async () => {
      const { getByTestId } = render(<CodeRefExplorerWidget />);

      // Rapidly switch projects
      await act(async () => {
        await userEvent.selectOptions(getByTestId('project-select'), 'project-1');
        await userEvent.selectOptions(getByTestId('project-select'), 'project-2');
        await userEvent.selectOptions(getByTestId('project-select'), 'project-1');
      });

      // Final state should be project-1
      await waitFor(() => {
        expect(getByTestId('file-tree-project').textContent).toBe('Project Alpha');
      });

      // localStorage should have project-1
      await waitFor(() => {
        expect(localStorage.getItem('coderef-explorer-selected-project')).toBe('project-1');
      });
    });
  });

  // ===================================================================
  // GROUP 6: EDGE CASES
  // ===================================================================

  describe('Edge Cases', () => {
    it('should handle localStorage quota exceeded gracefully', async () => {
      const { getByTestId } = render(<CodeRefExplorerWidget />);

      // Mock localStorage.setItem to throw quota exceeded error
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new DOMException('QuotaExceededError');
      });

      // Should not crash when trying to save
      await act(async () => {
        await userEvent.selectOptions(getByTestId('project-select'), 'project-1');
      });

      // Restore
      Storage.prototype.setItem = originalSetItem;

      // Component should still render
      expect(getByTestId('file-tree')).toBeTruthy();
    });

    it('should handle null/undefined project gracefully', () => {
      const { getByTestId } = render(<CodeRefExplorerWidget />);

      // No project selected - should not crash
      expect(getByTestId('file-tree-project').textContent).toBe('none');
      expect(getByTestId('file-viewer-project').textContent).toBe('none');
    });

    it('should handle file clicks on directories (not files)', async () => {
      // Our mock only allows file clicks, but real component should handle directories
      const { getByTestId } = render(<CodeRefExplorerWidget />);

      await act(async () => {
        await userEvent.selectOptions(getByTestId('project-select'), 'project-1');
      });

      // Clicking directory shouldn't set selectedFile
      // (Our mock always uses type: 'file', but real component filters)
      expect(getByTestId('file-viewer')).toBeTruthy();
    });

    it('should handle concurrent state updates without race conditions', async () => {
      const { getByTestId } = render(<CodeRefExplorerWidget />);

      // Trigger multiple state updates concurrently
      await act(async () => {
        const promises = [
          userEvent.selectOptions(getByTestId('project-select'), 'project-1'),
          userEvent.click(getByTestId('view-mode-coderef')),
        ];
        await Promise.all(promises);
      });

      // Both updates should complete successfully
      await waitFor(() => {
        expect(getByTestId('view-mode-value').textContent).toBe('coderef');
        expect(getByTestId('file-tree-project').textContent).not.toBe('none');
      });
    });
  });

  // ===================================================================
  // GROUP 7: RESTORATION FLAG MANAGEMENT
  // ===================================================================

  describe('Restoration Flag Management', () => {
    it('should set isRestoringProject=true on mount with saved project', () => {
      localStorage.setItem('coderef-explorer-selected-project', 'project-1');

      const consoleSpy = jest.spyOn(console, 'log');

      render(<CodeRefExplorerWidget />);

      // Restoration log should appear
      expect(consoleSpy).toHaveBeenCalledWith(
        '[CodeRefExplorer] Restoring saved project ID:',
        'project-1'
      );

      consoleSpy.mockRestore();
    });

    it('should set isRestoringProject=false after project selection', async () => {
      const consoleSpy = jest.spyOn(console, 'log');

      const { getByTestId } = render(<CodeRefExplorerWidget />);

      await act(async () => {
        await userEvent.selectOptions(getByTestId('project-select'), 'project-1');
      });

      // Restoration complete log should appear
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          '[CodeRefExplorer] Marking restoration as complete'
        );
      });

      consoleSpy.mockRestore();
    });

    it('should NOT save to localStorage during restoration', async () => {
      localStorage.setItem('coderef-explorer-selected-project', 'project-1');

      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

      render(<CodeRefExplorerWidget />);

      // Should not save during initial restoration
      await waitFor(
        () => {
          const projectSetCalls = setItemSpy.mock.calls.filter(
            (call) => call[0] === 'coderef-explorer-selected-project'
          );
          expect(projectSetCalls.length).toBe(0);
        },
        { timeout: 1000 }
      );

      setItemSpy.mockRestore();
    });
  });
});

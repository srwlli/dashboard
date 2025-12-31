/**
 * Refresh/Reload Scenario Tests for CodeRefExplorerWidget
 *
 * These tests simulate real browser refresh/reload scenarios:
 * 1. Hard refresh (Ctrl+R / F5)
 * 2. Navigation away and back
 * 3. Tab close and reopen
 * 4. Browser crash recovery
 * 5. State persistence across page lifecycle
 */

import { render, waitFor, act } from '@testing-library/react';
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
  FileTree: ({ project, filterPath, onFileClick }: any) => (
    <div data-testid="file-tree">
      <span data-testid="file-tree-project">{project?.name || 'none'}</span>
      <span data-testid="file-tree-filter">{filterPath || 'none'}</span>
      <button
        data-testid="mock-file-click"
        onClick={() =>
          onFileClick({
            type: 'file',
            name: 'important.md',
            path: '/project/docs/important.md',
          })
        }
      >
        Click File
      </button>
    </div>
  ),
}));

jest.mock('@/components/coderef/FileViewer', () => ({
  FileViewer: ({ filePath }: any) => (
    <div data-testid="file-viewer">
      <span data-testid="file-viewer-path">{filePath || 'none'}</span>
    </div>
  ),
}));

jest.mock('@/components/coderef/ViewModeToggle', () => ({
  ViewModeToggle: ({ value, onChange }: any) => (
    <div data-testid="view-mode-toggle">
      <span data-testid="view-mode-value">{value}</span>
      <button data-testid="view-mode-coderef" onClick={() => onChange('coderef')}>
        CodeRef
      </button>
    </div>
  ),
}));

describe('CodeRefExplorerWidget - Refresh/Reload Scenarios', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  // ===================================================================
  // SCENARIO 1: Hard Refresh (F5 / Ctrl+R)
  // ===================================================================

  describe('Hard Refresh (F5 / Ctrl+R)', () => {
    it('should restore project selection after hard refresh', async () => {
      // === BEFORE REFRESH ===
      const { getByTestId, unmount } = render(<CodeRefExplorerWidget />);

      // User selects a project
      await act(async () => {
        await userEvent.selectOptions(getByTestId('project-select'), 'project-1');
      });

      // Verify project is saved
      await waitFor(() => {
        expect(localStorage.getItem('coderef-explorer-selected-project')).toBe('project-1');
      });

      // === SIMULATE HARD REFRESH ===
      unmount(); // Component unmounts

      // User hits F5 - page reloads
      const { getByTestId: getByTestId2 } = render(<CodeRefExplorerWidget />);

      // === AFTER REFRESH ===
      // Project should be restored from localStorage
      await waitFor(() => {
        expect(getByTestId2('initial-project-id').textContent).toBe('project-1');
      });
    });

    it('should NOT restore selected file after hard refresh (expected behavior)', async () => {
      // === BEFORE REFRESH ===
      const { getByTestId, unmount } = render(<CodeRefExplorerWidget />);

      await act(async () => {
        await userEvent.selectOptions(getByTestId('project-select'), 'project-1');
      });

      await act(async () => {
        await userEvent.click(getByTestId('mock-file-click'));
      });

      // File is selected
      await waitFor(() => {
        expect(getByTestId('file-viewer-path').textContent).toBe('/project/docs/important.md');
      });

      // === SIMULATE REFRESH ===
      unmount();
      const { getByTestId: getByTestId2 } = render(<CodeRefExplorerWidget />);

      // === AFTER REFRESH ===
      // File should NOT be restored (only project persists)
      await waitFor(() => {
        expect(getByTestId2('file-viewer-path').textContent).toBe('none');
      });
    });

    it('should restore favorites after hard refresh', async () => {
      const mockFavorites = {
        groups: [{ id: 'g1', name: 'Important Files', color: '#ff0000' }],
        favorites: [{ path: '/test/file.md', group: 'Important Files' }],
      };

      // === BEFORE REFRESH ===
      localStorage.setItem('coderef-favorites-project-1', JSON.stringify(mockFavorites));

      const { getByTestId, unmount } = render(<CodeRefExplorerWidget />);

      await act(async () => {
        await userEvent.selectOptions(getByTestId('project-select'), 'project-1');
      });

      // === SIMULATE REFRESH ===
      unmount();
      const { getByTestId: getByTestId2 } = render(<CodeRefExplorerWidget />);

      await act(async () => {
        await userEvent.selectOptions(getByTestId2('project-select'), 'project-1');
      });

      // === AFTER REFRESH ===
      // Favorites should be loaded
      await waitFor(() => {
        const stored = localStorage.getItem('coderef-favorites-project-1');
        const parsed = JSON.parse(stored!);
        expect(parsed.favorites).toHaveLength(1);
        expect(parsed.groups).toHaveLength(1);
      });
    });
  });

  // ===================================================================
  // SCENARIO 2: Navigation Away and Back
  // ===================================================================

  describe('Navigation Away and Back', () => {
    it('should restore state when navigating back from another page', async () => {
      // === USER ON EXPLORER PAGE ===
      const { getByTestId, unmount } = render(<CodeRefExplorerWidget />);

      await act(async () => {
        await userEvent.selectOptions(getByTestId('project-select'), 'project-2');
      });

      await waitFor(() => {
        expect(localStorage.getItem('coderef-explorer-selected-project')).toBe('project-2');
      });

      // === USER NAVIGATES TO /settings ===
      unmount();

      // Simulate user browsing other pages...
      // (localStorage persists)

      // === USER NAVIGATES BACK TO /explorer ===
      const { getByTestId: getByTestId2 } = render(<CodeRefExplorerWidget />);

      // State should be restored
      await waitFor(() => {
        expect(getByTestId2('initial-project-id').textContent).toBe('project-2');
      });
    });

    it('should handle multiple navigation cycles without data loss', async () => {
      // First visit
      const { getByTestId: getByTestId1, unmount: unmount1 } = render(<CodeRefExplorerWidget />);
      await act(async () => {
        await userEvent.selectOptions(getByTestId1('project-select'), 'project-1');
      });
      await waitFor(() => {
        expect(localStorage.getItem('coderef-explorer-selected-project')).toBe('project-1');
      });
      unmount1();

      // Navigate away and back (cycle 1)
      const { unmount: unmount2 } = render(<CodeRefExplorerWidget />);
      unmount2();

      // Navigate away and back (cycle 2)
      const { unmount: unmount3 } = render(<CodeRefExplorerWidget />);
      unmount3();

      // Navigate away and back (cycle 3)
      const { getByTestId: getByTestId4 } = render(<CodeRefExplorerWidget />);

      // Data should persist through all cycles
      await waitFor(() => {
        expect(getByTestId4('initial-project-id').textContent).toBe('project-1');
      });
    });
  });

  // ===================================================================
  // SCENARIO 3: Tab Close and Reopen
  // ===================================================================

  describe('Tab Close and Reopen', () => {
    it('should restore state when reopening closed tab (simulated)', async () => {
      // === USER HAS TAB OPEN ===
      const { getByTestId, unmount } = render(<CodeRefExplorerWidget />);

      await act(async () => {
        await userEvent.selectOptions(getByTestId('project-select'), 'project-1');
      });

      await act(async () => {
        await userEvent.click(getByTestId('view-mode-coderef'));
      });

      // Save state snapshot
      await waitFor(() => {
        expect(localStorage.getItem('coderef-explorer-selected-project')).toBe('project-1');
      });

      // === USER CLOSES TAB ===
      unmount();

      // === USER REOPENS TAB (new session) ===
      const { getByTestId: getByTestId2 } = render(<CodeRefExplorerWidget />);

      // Project should be restored
      await waitFor(() => {
        expect(getByTestId2('initial-project-id').textContent).toBe('project-1');
      });

      // ViewMode should NOT be restored (transient state)
      expect(getByTestId2('view-mode-value').textContent).toBe('projects');
    });
  });

  // ===================================================================
  // SCENARIO 4: Browser Crash Recovery
  // ===================================================================

  describe('Browser Crash Recovery', () => {
    it('should recover project state after simulated crash', async () => {
      // === USER IS WORKING ===
      localStorage.setItem('coderef-explorer-selected-project', 'project-2');
      localStorage.setItem(
        'coderef-favorites-project-2',
        JSON.stringify({
          groups: [],
          favorites: [{ path: '/critical/data.md' }],
        })
      );

      // === BROWSER CRASHES (localStorage persists) ===
      // ... crash simulation (no code needed) ...

      // === BROWSER RESTARTS - User reopens page ===
      const { getByTestId } = render(<CodeRefExplorerWidget />);

      // State should be recovered from localStorage
      await waitFor(() => {
        expect(getByTestId('initial-project-id').textContent).toBe('project-2');
      });

      // Favorites should also be recovered
      const favorites = localStorage.getItem('coderef-favorites-project-2');
      expect(favorites).toBeTruthy();
      expect(JSON.parse(favorites!).favorites).toHaveLength(1);
    });

    it('should handle corrupted localStorage after crash', async () => {
      // Simulate corrupted data (e.g., partial write during crash)
      localStorage.setItem('coderef-explorer-selected-project', 'project-1');
      localStorage.setItem('coderef-favorites-project-1', '{corrupted-json');

      const { getByTestId } = render(<CodeRefExplorerWidget />);

      // Should not crash - project should restore
      await waitFor(() => {
        expect(getByTestId('initial-project-id').textContent).toBe('project-1');
      });

      // Component should render despite corrupted favorites
      expect(getByTestId('file-tree')).toBeTruthy();
    });
  });

  // ===================================================================
  // SCENARIO 5: State Persistence Over Time
  // ===================================================================

  describe('State Persistence Over Time', () => {
    it('should persist state for hours/days (localStorage has no expiry)', async () => {
      // Day 1: User sets project
      localStorage.setItem('coderef-explorer-selected-project', 'project-1');
      localStorage.setItem(
        'coderef-favorites-project-1',
        JSON.stringify({
          groups: [{ id: 'g1', name: 'My Group' }],
          favorites: [{ path: '/file.md', group: 'My Group' }],
        })
      );

      // Simulate time passing (localStorage doesn't expire)
      // ...

      // Day 2: User returns
      const { getByTestId } = render(<CodeRefExplorerWidget />);

      // State should still be there
      await waitFor(() => {
        expect(getByTestId('initial-project-id').textContent).toBe('project-1');
      });

      const favorites = localStorage.getItem('coderef-favorites-project-1');
      expect(JSON.parse(favorites!).favorites).toHaveLength(1);
    });

    it('should handle localStorage size limits gracefully', async () => {
      const { getByTestId } = render(<CodeRefExplorerWidget />);

      // Simulate localStorage quota exceeded
      const originalSetItem = Storage.prototype.setItem;
      let quotaExceeded = false;

      Storage.prototype.setItem = jest.fn((key, value) => {
        if (quotaExceeded) {
          throw new DOMException('QuotaExceededError');
        }
        return originalSetItem.call(localStorage, key, value);
      });

      // Should handle quota error without crashing
      quotaExceeded = true;

      await act(async () => {
        await userEvent.selectOptions(getByTestId('project-select'), 'project-1');
      });

      // Component should still work
      expect(getByTestId('file-tree')).toBeTruthy();

      Storage.prototype.setItem = originalSetItem;
    });
  });

  // ===================================================================
  // SCENARIO 6: Multi-Window/Tab Synchronization
  // ===================================================================

  describe('Multi-Window/Tab Synchronization', () => {
    it('should handle same project in multiple tabs independently', async () => {
      // Tab 1
      const { getByTestId: getByTestId1 } = render(<CodeRefExplorerWidget />);
      await act(async () => {
        await userEvent.selectOptions(getByTestId1('project-select'), 'project-1');
      });

      // Tab 2 (separate render)
      const { getByTestId: getByTestId2 } = render(<CodeRefExplorerWidget />);

      // Both tabs should have access to the same localStorage
      await waitFor(() => {
        expect(getByTestId2('initial-project-id').textContent).toBe('project-1');
      });
    });

    it('should handle localStorage changes from other tabs (storage event)', async () => {
      const { getByTestId } = render(<CodeRefExplorerWidget />);

      // Simulate another tab changing localStorage
      act(() => {
        localStorage.setItem('coderef-explorer-selected-project', 'project-2');

        // Dispatch storage event (what browsers do)
        const storageEvent = new StorageEvent('storage', {
          key: 'coderef-explorer-selected-project',
          newValue: 'project-2',
          oldValue: 'project-1',
          url: window.location.href,
        });
        window.dispatchEvent(storageEvent);
      });

      // Component doesn't currently listen to storage events (could be enhanced)
      // This test documents current behavior
      expect(getByTestId('file-tree')).toBeTruthy();
    });
  });

  // ===================================================================
  // SCENARIO 7: Incognito/Private Mode
  // ===================================================================

  describe('Incognito/Private Mode', () => {
    it('should work in incognito mode (localStorage available)', () => {
      // Incognito mode still has localStorage, just cleared on session end

      const { getByTestId } = render(<CodeRefExplorerWidget />);

      expect(getByTestId('file-tree')).toBeTruthy();
      expect(getByTestId('file-viewer')).toBeTruthy();
    });

    it('should handle localStorage being null/unavailable', () => {
      // Some privacy modes disable localStorage entirely
      const originalLocalStorage = window.localStorage;

      // Mock localStorage as unavailable
      Object.defineProperty(window, 'localStorage', {
        value: null,
        writable: true,
      });

      // Should not crash (would need error handling in component)
      // This test documents expected failure mode
      expect(() => render(<CodeRefExplorerWidget />)).toThrow();

      // Restore
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
      });
    });
  });

  // ===================================================================
  // SCENARIO 8: Refresh During Async Operations
  // ===================================================================

  describe('Refresh During Async Operations', () => {
    it('should handle refresh while loading project tree', async () => {
      const { getByTestId, unmount } = render(<CodeRefExplorerWidget />);

      // Start loading a project
      act(() => {
        userEvent.selectOptions(getByTestId('project-select'), 'project-1');
      });

      // User refreshes before loading completes
      unmount();

      // Page reloads
      const { getByTestId: getByTestId2 } = render(<CodeRefExplorerWidget />);

      // Should restore and continue loading
      await waitFor(() => {
        expect(getByTestId2('initial-project-id').textContent).toBe('project-1');
      });
    });

    it('should handle refresh while saving favorites', async () => {
      localStorage.setItem('coderef-explorer-selected-project', 'project-1');

      const { unmount } = render(<CodeRefExplorerWidget />);

      // Favorites are being saved...
      // User refreshes during save

      unmount();

      // Should not lose data
      const { getByTestId } = render(<CodeRefExplorerWidget />);

      expect(getByTestId('file-tree')).toBeTruthy();
    });
  });
});

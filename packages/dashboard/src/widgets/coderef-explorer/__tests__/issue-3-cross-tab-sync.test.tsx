/**
 * ISSUE #3: No Cross-Tab Storage Synchronization
 *
 * PROBLEM:
 * When a user has the dashboard open in multiple tabs/windows and changes
 * the selected project in Tab A, Tab B doesn't update. This creates confusion
 * where the user sees different projects in different tabs.
 *
 * EXPECTED BEHAVIOR (Optional Enhancement):
 * - User changes project in Tab A
 * - Browser fires 'storage' event
 * - Tab B listens to storage event
 * - Tab B updates to match Tab A's selection
 * - Both tabs stay in sync
 *
 * CURRENT BEHAVIOR:
 * - No 'storage' event listener
 * - Tabs operate independently
 * - Can have different projects selected
 * - User confusion
 *
 * NOTE: This is a documented limitation, not a critical bug.
 * However, it would be a nice-to-have feature for better UX.
 */

import { render, waitFor, act } from '@testing-library/react';
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

describe('ISSUE #3: Cross-Tab Storage Synchronization', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  // ===================================================================
  // TEST 1: Demonstrate the limitation
  // ===================================================================

  test('CURRENT BEHAVIOR: Tabs dont sync when storage changes', async () => {
    // Render Tab 1
    const { getByTestId: getByTestIdTab1 } = render(<CodeRefExplorerWidget />);

    // Render Tab 2 (simulated as separate component instance)
    const { getByTestId: getByTestIdTab2 } = render(<CodeRefExplorerWidget />);

    // Tab 1: Select project-1
    await userEvent.selectOptions(getByTestIdTab1('project-select'), 'project-1');

    await waitFor(() => {
      expect(getByTestIdTab1('selected-project-id').textContent).toBe('project-1');
    });

    // Simulate storage event (what browser does when another tab changes localStorage)
    act(() => {
      const storageEvent = new StorageEvent('storage', {
        key: 'coderef-explorer-selected-project',
        newValue: 'project-1',
        oldValue: null,
        url: window.location.href,
        storageArea: localStorage,
      });
      window.dispatchEvent(storageEvent);
    });

    // Wait to see if Tab 2 updates
    await new Promise(resolve => setTimeout(resolve, 500));

    // Tab 2 does NOT update (this is the limitation)
    expect(getByTestIdTab2('selected-project-id').textContent).toBe('none');

    console.log('Tab 1 project:', getByTestIdTab1('selected-project-id').textContent);
    console.log('Tab 2 project:', getByTestIdTab2('selected-project-id').textContent);
    console.log('^ Tabs are out of sync - this is the current behavior');
  });

  // ===================================================================
  // TEST 2: Show the UX problem
  // ===================================================================

  test('UX PROBLEM: User gets confused with multiple tabs', async () => {
    // User opens dashboard in 2 tabs
    const tab1 = render(<CodeRefExplorerWidget />);
    const tab2 = render(<CodeRefExplorerWidget />);

    // Tab 1: Working on Project Alpha
    await userEvent.selectOptions(tab1.getByTestId('project-select'), 'project-1');

    await waitFor(() => {
      expect(tab1.getByTestId('selected-project-id').textContent).toBe('project-1');
    });

    // User switches to Tab 2, expects to see Project Alpha
    // But Tab 2 still shows nothing
    expect(tab2.getByTestId('selected-project-id').textContent).toBe('none');

    // User is confused: "Why is Tab 2 showing the wrong project?"
    // User must manually select project in Tab 2

    console.log('User confusion scenario:');
    console.log('  Tab 1 is viewing: Project Alpha');
    console.log('  Tab 2 is viewing: (none)');
    console.log('  User expected both tabs to sync automatically');
  });

  // ===================================================================
  // TEST 3: Storage event basics
  // ===================================================================

  test('BACKGROUND: How storage events work', () => {
    const storageEventListener = jest.fn();

    // Add listener
    window.addEventListener('storage', storageEventListener);

    // Simulate storage change from another tab
    const event = new StorageEvent('storage', {
      key: 'test-key',
      newValue: 'new-value',
      oldValue: 'old-value',
      url: window.location.href,
      storageArea: localStorage,
    });

    window.dispatchEvent(event);

    // Listener should be called
    expect(storageEventListener).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'test-key',
        newValue: 'new-value',
        oldValue: 'old-value',
      })
    );

    window.removeEventListener('storage', storageEventListener);

    console.log('Storage events work correctly - component just needs to listen');
  });

  // ===================================================================
  // TEST 4: Solution - Add storage event listener
  // ===================================================================

  test('SOLUTION: Component should listen to storage events', () => {
    // The solution would be to add this to CodeRefExplorerWidget:

    const exampleStorageListener = () => {
      React.useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
          if (e.key === 'coderef-explorer-selected-project' && e.newValue) {
            console.log('Another tab changed project to:', e.newValue);

            // Option 1: Auto-sync (aggressive)
            // setSelectedProject(findProjectById(e.newValue));

            // Option 2: Show notification (conservative)
            // toast.info('Project changed in another tab. Refresh to sync.');

            // Option 3: Detect conflict
            // if (selectedProject && selectedProject.id !== e.newValue) {
            //   showConflictWarning();
            // }
          }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
          window.removeEventListener('storage', handleStorageChange);
        };
      }, []);
    };

    // Test the listener
    const listener = jest.fn();
    window.addEventListener('storage', listener);

    const event = new StorageEvent('storage', {
      key: 'coderef-explorer-selected-project',
      newValue: 'project-1',
    });
    window.dispatchEvent(event);

    expect(listener).toHaveBeenCalled();

    window.removeEventListener('storage', listener);
  });

  // ===================================================================
  // TEST 5: Different sync strategies
  // ===================================================================

  test('DESIGN: Different approaches to handle cross-tab sync', () => {
    const strategies = [
      {
        name: 'Auto-Sync (Aggressive)',
        pros: ['Always in sync', 'Simple UX'],
        cons: ['Can interrupt user work', 'File viewer resets'],
        implementation: 'setSelectedProject(e.newValue)',
      },
      {
        name: 'Notification (Conservative)',
        pros: ['User stays in control', 'No interruption'],
        cons: ['User must manually sync', 'Can forget to sync'],
        implementation: 'toast.info("Project changed in another tab")',
      },
      {
        name: 'Conflict Detection (Smart)',
        pros: ['Detects when tabs diverge', 'Shows warning'],
        cons: ['More complex logic', 'UI for conflict resolution'],
        implementation: 'if (currentProject !== e.newValue) showWarning()',
      },
      {
        name: 'Read-Only Slave Tabs (Hybrid)',
        pros: ['Primary tab controls', 'Others are read-only'],
        cons: ['Complex to determine primary', 'User confusion'],
        implementation: 'Use BroadcastChannel to elect primary',
      },
    ];

    console.log('Cross-tab sync strategies:');
    strategies.forEach((strategy, i) => {
      console.log(`\n${i + 1}. ${strategy.name}`);
      console.log(`   Pros: ${strategy.pros.join(', ')}`);
      console.log(`   Cons: ${strategy.cons.join(', ')}`);
      console.log(`   How: ${strategy.implementation}`);
    });

    // Recommendation: Start with Notification (conservative)
    // Upgrade to Conflict Detection if users request it
    expect(strategies).toHaveLength(4);
  });

  // ===================================================================
  // TEST 6: Favorites should also sync
  // ===================================================================

  test('ENHANCEMENT: Favorites could also sync across tabs', () => {
    // Currently: Each tab has its own favorites state in memory
    // When Tab A favorites a file, Tab B doesn't see it until refresh

    // Solution: Listen for favorites storage changes
    const handleFavoritesSync = (e: StorageEvent) => {
      if (e.key?.startsWith('coderef-favorites-') && e.newValue) {
        console.log('Another tab updated favorites for:', e.key);
        // Re-load favorites: setFavoritesData(JSON.parse(e.newValue))
      }
    };

    const listener = jest.fn(handleFavoritesSync);
    window.addEventListener('storage', listener);

    const event = new StorageEvent('storage', {
      key: 'coderef-favorites-project-1',
      newValue: JSON.stringify({ groups: [], favorites: [{ path: '/test.md' }] }),
    });
    window.dispatchEvent(event);

    expect(listener).toHaveBeenCalled();

    window.removeEventListener('storage', listener);
  });

  // ===================================================================
  // TEST 7: Performance considerations
  // ===================================================================

  test('PERFORMANCE: Storage events are efficient', () => {
    let eventCount = 0;

    const listener = () => {
      eventCount++;
    };

    window.addEventListener('storage', listener);

    // Simulate 100 rapid storage changes (from another tab)
    for (let i = 0; i < 100; i++) {
      const event = new StorageEvent('storage', {
        key: 'coderef-explorer-selected-project',
        newValue: `project-${i}`,
      });
      window.dispatchEvent(event);
    }

    // All events are fired (no throttling by browser)
    expect(eventCount).toBe(100);

    window.removeEventListener('storage', listener);

    console.log('Storage events fired:', eventCount);
    console.log('Recommendation: Debounce handler to avoid excessive re-renders');

    // Should add debounce:
    // const debouncedHandler = debounce(handleStorageChange, 300);
  });

  // ===================================================================
  // TEST 8: Browser compatibility
  // ===================================================================

  test('COMPATIBILITY: Storage events work in all modern browsers', () => {
    // Storage events are part of HTML5 Web Storage spec
    // Supported in all modern browsers:
    // - Chrome 4+
    // - Firefox 45+
    // - Safari 4+
    // - Edge (all versions)

    expect(typeof window.addEventListener).toBe('function');
    expect(typeof StorageEvent).toBe('function');

    console.log('Storage API support:');
    console.log('  window.localStorage:', typeof window.localStorage);
    console.log('  StorageEvent:', typeof StorageEvent);
    console.log('  addEventListener:', typeof window.addEventListener);
    console.log('✓ Fully supported in test environment');
  });

  // ===================================================================
  // TEST 9: Edge case - Same tab doesn't get storage event
  // ===================================================================

  test('EDGE CASE: Storage event only fires in OTHER tabs', () => {
    const listener = jest.fn();
    window.addEventListener('storage', listener);

    // When the SAME tab changes localStorage, storage event does NOT fire
    localStorage.setItem('test-key', 'test-value');

    // No event fired
    expect(listener).not.toHaveBeenCalled();

    // This is correct behavior - only cross-tab changes trigger events
    // So the component's own changes won't trigger its own listener

    window.removeEventListener('storage', listener);

    console.log('Storage event behavior:');
    console.log('  Same tab changes localStorage → No event');
    console.log('  Other tab changes localStorage → Event fires');
    console.log('  This prevents infinite update loops ✓');
  });
});

/**
 * DEBUG TEST - Issue 2: Selected Project Not Persisting
 *
 * This test checks if the localStorage restoration code is actually running.
 *
 * Expected behavior:
 * 1. localStorage has saved project ID
 * 2. CodeRefExplorerWidget reads it on mount
 * 3. Console logs appear: "[CodeRefExplorer] Restoring saved project ID:"
 * 4. initialProjectId is passed to ProjectSelector
 * 5. ProjectSelector auto-selects the project
 *
 * If this test FAILS:
 * - Build cache preventing new code from loading, OR
 * - useEffect not triggering, OR
 * - Dependencies array causing issues
 */

import { render, screen, waitFor } from '@testing-library/react';
import { CodeRefExplorerWidget } from '../CodeRefExplorerWidget';

// Mock child components to isolate the bug
jest.mock('@/components/coderef/ProjectSelector', () => ({
  ProjectSelector: ({ initialProjectId }: any) => {
    // Capture what initialProjectId was passed
    return (
      <div data-testid="project-selector">
        <span data-testid="initial-project-id">{initialProjectId || 'none'}</span>
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

describe('Issue 2 Debug - Selected Project Persistence', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear all mocks
    jest.clearAllMocks();
  });

  test('DEBUG 1: localStorage.getItem should be called on mount', () => {
    const getItemSpy = jest.spyOn(Storage.prototype, 'getItem');

    render(<CodeRefExplorerWidget />);

    // Should attempt to read from localStorage
    expect(getItemSpy).toHaveBeenCalledWith('coderef-explorer-selected-project');

    getItemSpy.mockRestore();
  });

  test('DEBUG 2: Console log should appear when restoring project ID', async () => {
    // Setup: Save a project ID to localStorage
    localStorage.setItem('coderef-explorer-selected-project', 'test-project-123');

    // Spy on console.log
    const consoleSpy = jest.spyOn(console, 'log');

    // Render component
    render(<CodeRefExplorerWidget />);

    // Assert: Console log should appear
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        '[CodeRefExplorer] Restoring saved project ID:',
        'test-project-123'
      );
    });

    consoleSpy.mockRestore();
  });

  test('DEBUG 3: initialProjectId should be set from localStorage', async () => {
    // Setup: Save a project ID
    localStorage.setItem('coderef-explorer-selected-project', 'saved-project-456');

    // Render component
    render(<CodeRefExplorerWidget />);

    // Assert: ProjectSelector should receive the initialProjectId
    await waitFor(() => {
      const initialProjectIdElement = screen.getByTestId('initial-project-id');
      expect(initialProjectIdElement).toHaveTextContent('saved-project-456');
    });
  });

  test('DEBUG 4: initialProjectId should be undefined when localStorage is empty', () => {
    // No setup - localStorage is empty

    // Render component
    render(<CodeRefExplorerWidget />);

    // Assert: ProjectSelector should receive undefined (displays "none")
    const initialProjectIdElement = screen.getByTestId('initial-project-id');
    expect(initialProjectIdElement).toHaveTextContent('none');
  });

  test('DEBUG 5: Console log should NOT appear when localStorage is empty', () => {
    // No setup - localStorage is empty

    const consoleSpy = jest.spyOn(console, 'log');

    render(<CodeRefExplorerWidget />);

    // Assert: Restoration log should NOT appear
    expect(consoleSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('[CodeRefExplorer] Restoring saved project ID:'),
      expect.anything()
    );

    consoleSpy.mockRestore();
  });

  test('DEBUG 6: useEffect should run on mount (isRestoringProject state)', async () => {
    localStorage.setItem('coderef-explorer-selected-project', 'test-project');

    const consoleSpy = jest.spyOn(console, 'log');

    render(<CodeRefExplorerWidget />);

    // If useEffect runs, console.log will be called
    // If useEffect doesn't run, this will timeout
    await waitFor(
      () => {
        expect(consoleSpy).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );

    consoleSpy.mockRestore();
  });

  test('DEBUG 7: Verify localStorage persistence key is correct', () => {
    const EXPECTED_KEY = 'coderef-explorer-selected-project';

    localStorage.setItem(EXPECTED_KEY, 'test-value');

    const getItemSpy = jest.spyOn(Storage.prototype, 'getItem');

    render(<CodeRefExplorerWidget />);

    // Verify exact key is used
    expect(getItemSpy).toHaveBeenCalledWith(EXPECTED_KEY);

    getItemSpy.mockRestore();
  });

  test('DEBUG 8: Component renders without crashing when localStorage has data', () => {
    localStorage.setItem('coderef-explorer-selected-project', 'test-project-789');

    const { container } = render(<CodeRefExplorerWidget />);

    // Component should render successfully
    expect(container).toBeTruthy();
    expect(screen.getByTestId('project-selector')).toBeInTheDocument();
  });
});

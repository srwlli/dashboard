/**
 * BatchRestoreUI Tests - UX Issue Analysis
 *
 * Tests the current "Restore All Projects" implementation to identify
 * the UX problem: users don't know which folder to select for which project.
 *
 * Test Coverage:
 * - Rendering with stale projects - 3 tests
 * - Current broken UX behavior - 4 tests
 * - Proposed improved UX - 3 tests
 *
 * Total: 10 tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BatchRestoreUI } from '../BatchRestoreUI';
import type { Project } from '@/lib/coderef/types';
import { mockShowDirectoryPicker, createMockDirectoryHandle } from '@/__tests__/mocks/file-system-access';

// Mock the modules
jest.mock('@/lib/coderef/local-access', () => ({
  showDirectoryPicker: jest.fn(),
}));

jest.mock('@/lib/coderef/persistence', () => ({
  saveDirectoryHandlePersistent: jest.fn(),
}));

const { showDirectoryPicker } = require('@/lib/coderef/local-access');
const { saveDirectoryHandlePersistent } = require('@/lib/coderef/persistence');

describe('BatchRestoreUI - Current UX Issues', () => {
  const mockProjects: Project[] = [
    {
      id: 'project-1',
      name: 'My App',
      path: '[Directory: my-app]',
      addedAt: '2024-01-01',
    },
    {
      id: 'project-2',
      name: 'Another Project',
      path: '[Directory: another-project]',
      addedAt: '2024-01-02',
    },
    {
      id: 'project-3',
      name: 'Test Files',
      path: '[Directory: test-files]',
      addedAt: '2024-01-03',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    test('should not render when no stale projects', () => {
      const { container } = render(
        <BatchRestoreUI
          staleProjects={new Set()}
          projects={mockProjects}
          onRestore={jest.fn()}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    test('should render warning banner when stale projects exist', () => {
      render(
        <BatchRestoreUI
          staleProjects={new Set(['project-1', 'project-2'])}
          projects={mockProjects}
          onRestore={jest.fn()}
        />
      );

      expect(screen.getByText(/Access Required:/)).toBeInTheDocument();
      expect(screen.getByText(/2 projects need re-authorization/)).toBeInTheDocument();
    });

    test('should list all stale project names', () => {
      render(
        <BatchRestoreUI
          staleProjects={new Set(['project-1', 'project-3'])}
          projects={mockProjects}
          onRestore={jest.fn()}
        />
      );

      expect(screen.getByText('My App')).toBeInTheDocument();
      expect(screen.getByText('Test Files')).toBeInTheDocument();
      expect(screen.queryByText('Another Project')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Current Broken UX Behavior
  // ============================================================================

  describe('ISSUE: Current "Restore All" UX is Confusing', () => {
    test('PROBLEM 1: showDirectoryPicker opens WITHOUT telling user which project', async () => {
      const user = userEvent.setup();

      showDirectoryPicker.mockResolvedValue(createMockDirectoryHandle('selected-folder'));
      saveDirectoryHandlePersistent.mockResolvedValue(undefined);

      render(
        <BatchRestoreUI
          staleProjects={new Set(['project-1', 'project-2'])}
          projects={mockProjects}
          onRestore={jest.fn()}
        />
      );

      // Click "Restore All Projects"
      const restoreButton = screen.getByRole('button', { name: /Restore All Projects/i });
      await user.click(restoreButton);

      await waitFor(() => {
        expect(showDirectoryPicker).toHaveBeenCalledTimes(1);
      });

      // PROBLEM: showDirectoryPicker was called with NO ARGUMENTS
      // User has no idea this is for "My App" project!
      expect(showDirectoryPicker).toHaveBeenCalledWith();

      // User sees generic folder picker with no context
      // Expected: Should show "Select folder for: My App"
    });

    test('PROBLEM 2: Opens sequential pickers without context', async () => {
      const user = userEvent.setup();

      // User selects folders in sequence
      showDirectoryPicker
        .mockResolvedValueOnce(createMockDirectoryHandle('folder-1'))
        .mockResolvedValueOnce(createMockDirectoryHandle('folder-2'))
        .mockResolvedValueOnce(createMockDirectoryHandle('folder-3'));

      saveDirectoryHandlePersistent.mockResolvedValue(undefined);

      render(
        <BatchRestoreUI
          staleProjects={new Set(['project-1', 'project-2', 'project-3'])}
          projects={mockProjects}
          onRestore={jest.fn()}
        />
      );

      const restoreButton = screen.getByRole('button', { name: /Restore All Projects/i });
      await user.click(restoreButton);

      await waitFor(() => {
        expect(showDirectoryPicker).toHaveBeenCalledTimes(3);
      });

      // PROBLEM: User sees 3 folder pickers in a row
      // No indication which picker is for which project
      // User might select wrong folders or get confused
    });

    test('PROBLEM 3: No way to skip individual projects', async () => {
      const user = userEvent.setup();

      // User wants to skip project-2, but can't
      showDirectoryPicker
        .mockResolvedValueOnce(createMockDirectoryHandle('folder-1'))
        .mockResolvedValueOnce(null) // User cancels (wants to skip)
        .mockResolvedValueOnce(createMockDirectoryHandle('folder-3'));

      saveDirectoryHandlePersistent.mockResolvedValue(undefined);

      render(
        <BatchRestoreUI
          staleProjects={new Set(['project-1', 'project-2', 'project-3'])}
          projects={mockProjects}
          onRestore={jest.fn()}
        />
      );

      const restoreButton = screen.getByRole('button', { name: /Restore All Projects/i });
      await user.click(restoreButton);

      await waitFor(() => {
        // When user cancels (returns null), the loop stops completely!
        expect(showDirectoryPicker).toHaveBeenCalledTimes(2);
      });

      // PROBLEM: Cancelling one picker stops the entire batch
      // User can't skip project-2 and continue with project-3
      expect(saveDirectoryHandlePersistent).toHaveBeenCalledTimes(1);
      // Only project-1 was restored, project-3 never got a chance
    });

    test('PROBLEM 4: No original folder path shown', () => {
      render(
        <BatchRestoreUI
          staleProjects={new Set(['project-1'])}
          projects={mockProjects}
          onRestore={jest.fn()}
        />
      );

      // User sees "My App" but not the original path
      expect(screen.getByText('My App')).toBeInTheDocument();

      // PROBLEM: Original folder info is lost
      // User needs to remember: "Where was 'My App' located?"
      // Path is stored as "[Directory: my-app]" but not displayed
      expect(screen.queryByText(/my-app/)).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Proposed Improved UX
  // ============================================================================

  describe('PROPOSED: Improved UX Solution', () => {
    test('SOLUTION: Each project should have individual "Restore" button', () => {
      // This test describes the DESIRED behavior (not yet implemented)

      // Render with improved UI (mocked for now)
      const ImprovedBatchRestoreUI = () => (
        <div data-testid="improved-ui">
          <div data-testid="project-item-1">
            <span>My App</span>
            <button data-testid="restore-btn-1">Restore This Project</button>
          </div>
          <div data-testid="project-item-2">
            <span>Another Project</span>
            <button data-testid="restore-btn-2">Restore This Project</button>
          </div>
        </div>
      );

      const { container } = render(<ImprovedBatchRestoreUI />);

      // User can see each project with its own button
      expect(screen.getByTestId('restore-btn-1')).toBeInTheDocument();
      expect(screen.getByTestId('restore-btn-2')).toBeInTheDocument();

      // User knows exactly which folder to select when clicking a button
    });

    test('SOLUTION: Show original folder name in the list', () => {
      // DESIRED: Extract folder name from path and display it

      const ImprovedProjectItem = () => (
        <div>
          <div className="project-name">My App</div>
          <div className="original-folder">Original: my-app</div>
        </div>
      );

      const { container } = render(<ImprovedProjectItem />);

      // User can see the original folder name as a hint
      expect(screen.getByText(/Original: my-app/)).toBeInTheDocument();
    });

    test('SOLUTION: Allow skipping individual projects', async () => {
      const user = userEvent.setup();

      // DESIRED: Each project has its own restore button
      // User can choose which ones to restore

      const ImprovedUI = () => {
        const [restored, setRestored] = React.useState<Set<string>>(new Set());

        return (
          <div>
            <button
              data-testid="restore-project-1"
              onClick={() => setRestored((prev) => new Set(prev).add('project-1'))}
            >
              Restore My App
            </button>
            <button
              data-testid="restore-project-2"
              onClick={() => setRestored((prev) => new Set(prev).add('project-2'))}
            >
              Restore Another Project
            </button>
            {restored.has('project-1') && <span>✓ My App restored</span>}
            {restored.has('project-2') && <span>✓ Another Project restored</span>}
          </div>
        );
      };

      const { container } = render(<ImprovedUI />);

      // User can restore just project-1, skip project-2
      await user.click(screen.getByTestId('restore-project-1'));

      expect(screen.getByText('✓ My App restored')).toBeInTheDocument();
      expect(screen.queryByText('✓ Another Project restored')).not.toBeInTheDocument();

      // User has full control over which projects to restore
    });
  });
});

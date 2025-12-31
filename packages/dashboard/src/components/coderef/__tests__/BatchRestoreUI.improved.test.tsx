/**
 * BatchRestoreUI.improved Tests - Verify UX Fixes
 *
 * Tests the IMPROVED BatchRestoreUI implementation to verify:
 * ✅ Individual restore buttons (not batch blind restore)
 * ✅ Original folder names shown as hints
 * ✅ Can skip projects without breaking flow
 * ✅ Clear visual feedback when restored
 *
 * Total: 12 tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BatchRestoreUI } from '../BatchRestoreUI.improved';
import type { Project } from '@/lib/coderef/types';
import { createMockDirectoryHandle } from '@/__tests__/mocks/file-system-access';

// Mock the modules
jest.mock('@/lib/coderef/local-access', () => ({
  showDirectoryPicker: jest.fn(),
}));

jest.mock('@/lib/coderef/persistence', () => ({
  saveDirectoryHandlePersistent: jest.fn(),
}));

const { showDirectoryPicker } = require('@/lib/coderef/local-access');
const { saveDirectoryHandlePersistent } = require('@/lib/coderef/persistence');

describe('BatchRestoreUI.improved - UX Fixes Verified', () => {
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
  // FIX 1: Individual Restore Buttons
  // ============================================================================

  describe('✅ FIX 1: Individual Restore Buttons', () => {
    test('should show individual "Restore" button for each project', () => {
      render(
        <BatchRestoreUI
          staleProjects={new Set(['project-1', 'project-2'])}
          projects={mockProjects}
          onRestore={jest.fn()}
        />
      );

      // Each project should have its own button
      const restoreButtons = screen.getAllByRole('button', { name: /Restore/i });
      expect(restoreButtons).toHaveLength(2);
    });

    test('should allow restoring projects individually', async () => {
      const user = userEvent.setup();
      const onRestore = jest.fn();

      showDirectoryPicker.mockResolvedValue(createMockDirectoryHandle('selected'));
      saveDirectoryHandlePersistent.mockResolvedValue(undefined);

      render(
        <BatchRestoreUI
          staleProjects={new Set(['project-1', 'project-2'])}
          projects={mockProjects}
          onRestore={onRestore}
        />
      );

      // Get the first restore button
      const buttons = screen.getAllByRole('button', { name: /Restore/i });

      // Click first project's restore button
      await user.click(buttons[0]);

      await waitFor(() => {
        expect(showDirectoryPicker).toHaveBeenCalledTimes(1);
        expect(saveDirectoryHandlePersistent).toHaveBeenCalledTimes(1);
        expect(onRestore).toHaveBeenCalledWith('project-1');
      });

      // Second project NOT restored yet
      expect(onRestore).not.toHaveBeenCalledWith('project-2');
    });

    test('should NOT open sequential pickers automatically', async () => {
      const user = userEvent.setup();

      showDirectoryPicker.mockResolvedValue(createMockDirectoryHandle('folder'));
      saveDirectoryHandlePersistent.mockResolvedValue(undefined);

      render(
        <BatchRestoreUI
          staleProjects={new Set(['project-1', 'project-2', 'project-3'])}
          projects={mockProjects}
          onRestore={jest.fn()}
        />
      );

      const buttons = screen.getAllByRole('button', { name: /Restore/i });

      // Click first button
      await user.click(buttons[0]);

      await waitFor(() => {
        expect(showDirectoryPicker).toHaveBeenCalledTimes(1);
      });

      // Should NOT automatically open picker for project-2 or project-3
      // User must click their buttons explicitly
    });
  });

  // ============================================================================
  // FIX 2: Original Folder Names Shown
  // ============================================================================

  describe('✅ FIX 2: Original Folder Names as Hints', () => {
    test('should extract and display original folder name', () => {
      render(
        <BatchRestoreUI
          staleProjects={new Set(['project-1'])}
          projects={mockProjects}
          onRestore={jest.fn()}
        />
      );

      // Should show the folder name extracted from path
      expect(screen.getByText(/Original folder: my-app/i)).toBeInTheDocument();
    });

    test('should show folder hints for all projects', () => {
      render(
        <BatchRestoreUI
          staleProjects={new Set(['project-1', 'project-2', 'project-3'])}
          projects={mockProjects}
          onRestore={jest.fn()}
        />
      );

      expect(screen.getByText(/Original folder: my-app/i)).toBeInTheDocument();
      expect(screen.getByText(/Original folder: another-project/i)).toBeInTheDocument();
      expect(screen.getByText(/Original folder: test-files/i)).toBeInTheDocument();
    });

    test('should handle projects without folder hint gracefully', () => {
      const projectWithoutHint: Project = {
        id: 'no-hint',
        name: 'No Hint Project',
        path: '/regular/path', // Not a [Directory: ...] format
        addedAt: '2024-01-01',
      };

      render(
        <BatchRestoreUI
          staleProjects={new Set(['no-hint'])}
          projects={[projectWithoutHint]}
          onRestore={jest.fn()}
        />
      );

      // Should still render, just without folder hint
      expect(screen.getByText('No Hint Project')).toBeInTheDocument();
      expect(screen.queryByText(/Original folder:/i)).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // FIX 3: Can Skip Projects
  // ============================================================================

  describe('✅ FIX 3: Can Skip Projects Without Breaking Flow', () => {
    test('should allow skipping project without affecting others', async () => {
      const user = userEvent.setup();
      const onRestore = jest.fn();

      // User cancels first project, then restores second
      showDirectoryPicker
        .mockResolvedValueOnce(null) // Cancel first
        .mockResolvedValueOnce(createMockDirectoryHandle('folder-2'));

      saveDirectoryHandlePersistent.mockResolvedValue(undefined);

      render(
        <BatchRestoreUI
          staleProjects={new Set(['project-1', 'project-2'])}
          projects={mockProjects}
          onRestore={onRestore}
        />
      );

      const buttons = screen.getAllByRole('button', { name: /Restore/i });

      // Click first button → user cancels
      await user.click(buttons[0]);

      await waitFor(() => {
        expect(showDirectoryPicker).toHaveBeenCalledTimes(1);
      });

      // project-1 NOT restored (user cancelled)
      expect(onRestore).not.toHaveBeenCalledWith('project-1');

      // NOW restore project-2 (should still work!)
      await user.click(buttons[1]);

      await waitFor(() => {
        expect(showDirectoryPicker).toHaveBeenCalledTimes(2);
        expect(onRestore).toHaveBeenCalledWith('project-2');
      });

      // Verify: Only project-2 was restored
      expect(onRestore).toHaveBeenCalledTimes(1);
      expect(onRestore).toHaveBeenCalledWith('project-2');
    });

    test('should allow restoring in any order', async () => {
      const user = userEvent.setup();
      const onRestore = jest.fn();

      showDirectoryPicker.mockResolvedValue(createMockDirectoryHandle('folder'));
      saveDirectoryHandlePersistent.mockResolvedValue(undefined);

      render(
        <BatchRestoreUI
          staleProjects={new Set(['project-1', 'project-2', 'project-3'])}
          projects={mockProjects}
          onRestore={onRestore}
        />
      );

      const buttons = screen.getAllByRole('button', { name: /Restore/i });

      // Restore in reverse order: 3 → 1 → 2
      await user.click(buttons[2]); // project-3
      await waitFor(() => expect(onRestore).toHaveBeenCalledWith('project-3'));

      await user.click(buttons[0]); // project-1
      await waitFor(() => expect(onRestore).toHaveBeenCalledWith('project-1'));

      await user.click(buttons[1]); // project-2
      await waitFor(() => expect(onRestore).toHaveBeenCalledWith('project-2'));

      // All 3 restored successfully in non-sequential order
      expect(onRestore).toHaveBeenCalledTimes(3);
    });
  });

  // ============================================================================
  // FIX 4: Clear Visual Feedback
  // ============================================================================

  describe('✅ FIX 4: Clear Visual Feedback', () => {
    test('should show loading state while restoring', async () => {
      const user = userEvent.setup();

      // Make the operation slow so we can see loading state
      showDirectoryPicker.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(createMockDirectoryHandle('f')), 100))
      );
      saveDirectoryHandlePersistent.mockResolvedValue(undefined);

      render(
        <BatchRestoreUI
          staleProjects={new Set(['project-1'])}
          projects={mockProjects}
          onRestore={jest.fn()}
        />
      );

      const button = screen.getByRole('button', { name: /Restore/i });
      await user.click(button);

      // Should show loading state
      expect(screen.getByText(/Restoring.../i)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText(/Restoring.../i)).not.toBeInTheDocument();
      });
    });

    test('should show success indicator after restore', async () => {
      const user = userEvent.setup();

      showDirectoryPicker.mockResolvedValue(createMockDirectoryHandle('folder'));
      saveDirectoryHandlePersistent.mockResolvedValue(undefined);

      render(
        <BatchRestoreUI
          staleProjects={new Set(['project-1'])}
          projects={mockProjects}
          onRestore={jest.fn()}
        />
      );

      const button = screen.getByRole('button', { name: /Restore/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('✓ Restored')).toBeInTheDocument();
      });

      // Button should be gone (replaced with success message)
      expect(screen.queryByRole('button', { name: /Restore/i })).not.toBeInTheDocument();
    });

    test('should show completion message when all projects restored', async () => {
      const user = userEvent.setup();

      showDirectoryPicker.mockResolvedValue(createMockDirectoryHandle('folder'));
      saveDirectoryHandlePersistent.mockResolvedValue(undefined);

      render(
        <BatchRestoreUI
          staleProjects={new Set(['project-1', 'project-2'])}
          projects={mockProjects}
          onRestore={jest.fn()}
        />
      );

      const buttons = screen.getAllByRole('button', { name: /Restore/i });

      // Restore both projects
      await user.click(buttons[0]);
      await user.click(buttons[1]);

      await waitFor(() => {
        expect(screen.getByText(/All projects restored successfully!/i)).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // Additional Tests
  // ============================================================================

  describe('Edge Cases', () => {
    test('should handle errors gracefully without crashing', async () => {
      const user = userEvent.setup();

      // Simulate error
      showDirectoryPicker.mockRejectedValue(new Error('Permission denied'));

      render(
        <BatchRestoreUI
          staleProjects={new Set(['project-1'])}
          projects={mockProjects}
          onRestore={jest.fn()}
        />
      );

      const button = screen.getByRole('button', { name: /Restore/i });

      // Should not crash
      await user.click(button);

      // Button should still be available for retry
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Restore/i })).toBeInTheDocument();
      });
    });
  });
});

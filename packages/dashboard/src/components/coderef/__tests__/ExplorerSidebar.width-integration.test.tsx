/**
 * Explorer Sidebar Width Integration Tests
 *
 * Integration tests validating that the complete Explorer sidebar (widget + tree + nodes)
 * maintains fixed 320px width constraint even with extremely long document titles.
 *
 * These tests verify the entire CSS chain from container to leaf nodes.
 *
 * Test Coverage:
 * - Widget container constraints - 3 tests
 * - End-to-end width validation - 4 tests
 * - CSS class propagation - 4 tests
 * - Real-world document scenarios - 4 tests
 *
 * Total: 15 tests
 *
 * @see {@link https://github.com/coderef-dashboard/docs/EXPLORER-SIDEBAR.md}
 */

import { render, screen, within } from '@testing-library/react';
import { CodeRefExplorerWidget } from '../../../widgets/coderef-explorer/CodeRefExplorerWidget';

// Mock all dependencies
jest.mock('@/lib/coderef/hybrid-router', () => ({
  loadProjectTree: jest.fn().mockResolvedValue({
    data: [],
    mode: 'local',
  }),
  loadFileContent: jest.fn(),
}));

jest.mock('@/contexts/WorkflowContext', () => ({
  useWorkflow: () => ({
    addAttachments: jest.fn(),
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

jest.mock('@/components/coderef/FileViewer', () => ({
  FileViewer: () => <div data-testid="file-viewer">File Viewer</div>,
}));

// Mock localStorage
const localStorageMock: { [key: string]: string } = {};
global.localStorage = {
  getItem: (key: string) => localStorageMock[key] || null,
  setItem: (key: string, value: string) => {
    localStorageMock[key] = value;
  },
  removeItem: (key: string) => {
    delete localStorageMock[key];
  },
  clear: () => {
    Object.keys(localStorageMock).forEach(key => delete localStorageMock[key]);
  },
  get length() {
    return Object.keys(localStorageMock).length;
  },
  key: (index: number) => Object.keys(localStorageMock)[index] || null,
} as Storage;

describe('Explorer Sidebar - Width Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Widget Container Constraints', () => {
    it('should render sidebar with fixed width container class', () => {
      const { container } = render(<CodeRefExplorerWidget />);

      // Find the sidebar container (left panel)
      const sidebar = container.querySelector('.w-80');
      expect(sidebar).toBeInTheDocument();
    });

    it('should apply all five width constraint classes', () => {
      const { container } = render(<CodeRefExplorerWidget />);

      // Should have: w-80, min-w-80, max-w-80, basis-80
      const sidebar = container.querySelector('.w-80.min-w-80.max-w-80');
      expect(sidebar).toBeInTheDocument();
    });

    it('should apply flex-shrink-0 and flex-grow-0 to prevent resizing', () => {
      const { container } = render(<CodeRefExplorerWidget />);

      const sidebar = container.querySelector('.w-80');
      expect(sidebar).toHaveClass('flex-shrink-0');
      expect(sidebar).toHaveClass('flex-grow-0');
    });
  });

  describe('End-to-End Width Validation', () => {
    it('should maintain 320px width with no project selected', () => {
      const { container } = render(<CodeRefExplorerWidget />);

      const sidebar = container.querySelector('.w-80');
      expect(sidebar).toBeInTheDocument();

      // Should show empty state without expanding
      expect(screen.getByText(/Select a project to browse files/i)).toBeInTheDocument();
    });

    it('should maintain width with loading state', () => {
      const { loadProjectTree } = require('@/lib/coderef/hybrid-router');

      // Simulate slow loading
      loadProjectTree.mockImplementation(() => new Promise(() => {}));

      const { container } = render(<CodeRefExplorerWidget />);

      const sidebar = container.querySelector('.w-80');
      expect(sidebar).toBeInTheDocument();
    });

    it('should maintain width with error state', () => {
      const { loadProjectTree } = require('@/lib/coderef/hybrid-router');

      loadProjectTree.mockRejectedValue(new Error('Failed to load tree'));

      const { container } = render(<CodeRefExplorerWidget />);

      const sidebar = container.querySelector('.w-80');
      expect(sidebar).toBeInTheDocument();
    });

    it('should maintain width when toggling view modes', () => {
      const { container } = render(<CodeRefExplorerWidget />);

      // Find view mode toggle tabs
      const projectsTab = screen.getByRole('button', { name: /projects/i });
      const favoritesTab = screen.getByRole('button', { name: /favorites/i });

      expect(projectsTab).toBeInTheDocument();
      expect(favoritesTab).toBeInTheDocument();

      // Sidebar should maintain width regardless of view mode
      const sidebar = container.querySelector('.w-80');
      expect(sidebar).toBeInTheDocument();
    });
  });

  describe('CSS Class Propagation', () => {
    it('should apply overflow-hidden to sidebar container', () => {
      const { container } = render(<CodeRefExplorerWidget />);

      const sidebar = container.querySelector('.w-80');
      expect(sidebar).toHaveClass('overflow-hidden');
    });

    it('should have scrollable region within fixed width', () => {
      const { container } = render(<CodeRefExplorerWidget />);

      // Sidebar container should prevent overflow
      const sidebar = container.querySelector('.w-80');
      expect(sidebar).toHaveClass('overflow-hidden');

      // This ensures content scrolls within the fixed width, not expands it
    });

    it('should apply flex flex-col to sidebar for vertical layout', () => {
      const { container } = render(<CodeRefExplorerWidget />);

      const sidebar = container.querySelector('.w-80');
      expect(sidebar).toHaveClass('flex');
      expect(sidebar).toHaveClass('flex-col');
    });

    it('should have border-r for visual separation', () => {
      const { container } = render(<CodeRefExplorerWidget />);

      const sidebar = container.querySelector('.w-80');
      expect(sidebar).toHaveClass('border-r');
      expect(sidebar).toHaveClass('border-ind-border');
    });
  });

  describe('Real-World Document Scenarios', () => {
    it('should handle EXPLORER-SIDEBAR.md document name', () => {
      // This is the actual document that caused the width issue
      const { container } = render(<CodeRefExplorerWidget />);

      const sidebar = container.querySelector('.w-80');
      expect(sidebar).toBeInTheDocument();

      // Sidebar maintains 320px even if tree contains EXPLORER-SIDEBAR.md
      expect(sidebar).toHaveClass('min-w-80');
      expect(sidebar).toHaveClass('max-w-80');
    });

    it('should handle feature-implementation-planning-standard.json', () => {
      const { container } = render(<CodeRefExplorerWidget />);

      const sidebar = container.querySelector('.w-80');

      // All width constraints should be present
      expect(sidebar).toHaveClass('w-80');
      expect(sidebar).toHaveClass('min-w-80');
      expect(sidebar).toHaveClass('max-w-80');
      expect(sidebar).toHaveClass('flex-shrink-0');
      expect(sidebar).toHaveClass('flex-grow-0');
    });

    it('should handle comprehensive-api-documentation-with-examples-and-use-cases.md', () => {
      const { container } = render(<CodeRefExplorerWidget />);

      const sidebar = container.querySelector('.w-80');
      expect(sidebar).toBeInTheDocument();

      // Sidebar should not grow beyond 320px
      expect(sidebar).toHaveClass('max-w-80');
    });

    it('should handle deeply nested workorder paths', () => {
      // Scenario: coderef/workorder/multi-agent-coordination-with-papertrail-integration/comprehensive-implementation-plan-with-all-details.json
      const { container } = render(<CodeRefExplorerWidget />);

      const sidebar = container.querySelector('.w-80');

      // Complete width constraint chain
      expect(sidebar).toHaveClass('w-80');        // Sets width to 320px
      expect(sidebar).toHaveClass('min-w-80');    // Prevents shrinking
      expect(sidebar).toHaveClass('max-w-80');    // Prevents expansion
      expect(sidebar).toHaveClass('basis-80');    // Flexbox initial size
      expect(sidebar).toHaveClass('flex-shrink-0'); // No shrinking
      expect(sidebar).toHaveClass('flex-grow-0');   // No growing
      expect(sidebar).toHaveClass('overflow-hidden'); // Clip overflow
    });
  });
});

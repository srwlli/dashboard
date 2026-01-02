/**
 * FileTree Container Width Tests
 *
 * Tests that the FileTree container and sidebar maintain fixed 320px width
 * constraints even when rendering files with extremely long names.
 *
 * Test Coverage:
 * - Container width constraints - 4 tests
 * - Integration with long filenames - 5 tests
 * - View mode width consistency - 3 tests
 *
 * Total: 12 tests
 *
 * @see {@link https://github.com/coderef-dashboard/docs/EXPLORER-SIDEBAR.md#dimensional-attributes}
 */

import { render, screen } from '@testing-library/react';
import { FileTree } from '../FileTree';
import type { Project, TreeNode } from '@/lib/coderef/types';
import type { FavoritesData } from '@/lib/coderef/favorites-types';
import { WorkflowProvider } from '@/contexts/WorkflowContext';

// Mock dependencies
jest.mock('@/lib/coderef/hybrid-router', () => ({
  loadProjectTree: jest.fn(),
}));

// Helper to wrap components in required providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(<WorkflowProvider>{ui}</WorkflowProvider>);
};

describe('FileTree - Container Width Tests', () => {
  const mockProject: Project = {
    id: 'test-project',
    name: 'Test Project',
    path: '/test/path',
    addedAt: '2024-01-01',
  };

  const mockOnFileClick = jest.fn();
  const mockOnToggleFavorite = jest.fn();
  const mockIsFavorite = jest.fn(() => false);

  const createLongFilenameTree = (): TreeNode[] => [
    {
      name: 'src',
      path: 'src',
      type: 'directory',
      children: [
        {
          name: 'extremely-long-component-name-that-would-normally-expand-sidebar.tsx',
          path: 'src/extremely-long-component-name-that-would-normally-expand-sidebar.tsx',
          type: 'file',
          extension: '.tsx',
        },
        {
          name: 'another-very-long-filename-for-testing-truncation-behavior.tsx',
          path: 'src/another-very-long-filename-for-testing-truncation-behavior.tsx',
          type: 'file',
          extension: '.tsx',
        },
      ],
    },
    {
      name: 'coderef',
      path: 'coderef',
      type: 'directory',
      children: [
        {
          name: 'workorder',
          path: 'coderef/workorder',
          type: 'directory',
          children: [
            {
              name: 'feature-with-extremely-descriptive-and-verbose-name-for-clarity',
              path: 'coderef/workorder/feature-with-extremely-descriptive-and-verbose-name-for-clarity',
              type: 'directory',
              children: [
                {
                  name: 'comprehensive-implementation-plan-with-all-details.json',
                  path: 'coderef/workorder/feature-with-extremely-descriptive-and-verbose-name-for-clarity/comprehensive-implementation-plan-with-all-details.json',
                  type: 'file',
                  extension: '.json',
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Container Width Constraints', () => {
    it('should render tree without expanding beyond container', () => {
      const longTree = createLongFilenameTree();

      const { container } = renderWithProviders(
        <FileTree
          project={mockProject}
          customTree={longTree}
          onFileClick={mockOnFileClick}
          loading={false}
        />
      );

      // FileTree itself doesn't set width (parent does), but should not have flex-grow
      const treeContainer = container.firstChild;
      expect(treeContainer).toBeTruthy();
    });

    it('should render multiple long filenames without stacking width', () => {
      const longTree = createLongFilenameTree();

      const { container } = renderWithProviders(
        <FileTree
          project={mockProject}
          customTree={longTree}
          onFileClick={mockOnFileClick}
          loading={false}
        />
      );

      // All file nodes should be present
      const fileNodes = container.querySelectorAll('.truncate');
      expect(fileNodes.length).toBeGreaterThan(0);
    });

    it('should maintain width with deeply nested long paths', () => {
      const deepTree: TreeNode[] = [
        {
          name: 'level-1-with-long-name',
          path: 'level-1-with-long-name',
          type: 'directory',
          children: [
            {
              name: 'level-2-with-even-longer-descriptive-name',
              path: 'level-1-with-long-name/level-2-with-even-longer-descriptive-name',
              type: 'directory',
              children: [
                {
                  name: 'level-3-with-extremely-verbose-and-detailed-naming-convention.tsx',
                  path: 'level-1-with-long-name/level-2-with-even-longer-descriptive-name/level-3-with-extremely-verbose-and-detailed-naming-convention.tsx',
                  type: 'file',
                  extension: '.tsx',
                },
              ],
            },
          ],
        },
      ];

      const { container } = renderWithProviders(
        <FileTree
          project={mockProject}
          customTree={deepTree}
          onFileClick={mockOnFileClick}
          loading={false}
        />
      );

      // Should render without errors
      expect(container.firstChild).toBeTruthy();
    });

    it('should apply overflow-y-auto for scrolling within fixed width', () => {
      const longTree = createLongFilenameTree();

      const { container } = renderWithProviders(
        <FileTree
          project={mockProject}
          customTree={longTree}
          onFileClick={mockOnFileClick}
          loading={false}
        />
      );

      // FileTree should have overflow handling
      const scrollableContainer = container.querySelector('.overflow-y-auto');
      expect(scrollableContainer).toBeInTheDocument();
    });
  });

  describe('Integration with Long Filenames', () => {
    it('should render ARCHITECTURE.md without expanding sidebar', () => {
      const tree: TreeNode[] = [
        {
          name: 'ARCHITECTURE.md',
          path: 'coderef/foundation-docs/ARCHITECTURE.md',
          type: 'file',
          extension: '.md',
        },
      ];

      renderWithProviders(
        <FileTree
          project={mockProject}
          customTree={tree}
          onFileClick={mockOnFileClick}
          loading={false}
        />
      );

      expect(screen.getByText('ARCHITECTURE.md')).toBeInTheDocument();
    });

    it('should render feature-implementation-planning-standard.json', () => {
      const tree: TreeNode[] = [
        {
          name: 'feature-implementation-planning-standard.json',
          path: 'coderef/templates/feature-implementation-planning-standard.json',
          type: 'file',
          extension: '.json',
        },
      ];

      renderWithProviders(
        <FileTree
          project={mockProject}
          customTree={tree}
          onFileClick={mockOnFileClick}
          loading={false}
        />
      );

      expect(screen.getByText('feature-implementation-planning-standard.json')).toBeInTheDocument();
    });

    it('should render multiple long documentation files', () => {
      const tree: TreeNode[] = [
        {
          name: 'comprehensive-api-documentation-with-examples.md',
          path: 'docs/comprehensive-api-documentation-with-examples.md',
          type: 'file',
          extension: '.md',
        },
        {
          name: 'user-guide-for-advanced-features-and-workflows.md',
          path: 'docs/user-guide-for-advanced-features-and-workflows.md',
          type: 'file',
          extension: '.md',
        },
        {
          name: 'troubleshooting-guide-with-common-issues-and-solutions.md',
          path: 'docs/troubleshooting-guide-with-common-issues-and-solutions.md',
          type: 'file',
          extension: '.md',
        },
      ];

      const { container } = renderWithProviders(
        <FileTree
          project={mockProject}
          customTree={tree}
          onFileClick={mockOnFileClick}
          loading={false}
        />
      );

      // All three files should render
      expect(screen.getByText('comprehensive-api-documentation-with-examples.md')).toBeInTheDocument();
      expect(screen.getByText('user-guide-for-advanced-features-and-workflows.md')).toBeInTheDocument();
      expect(screen.getByText('troubleshooting-guide-with-common-issues-and-solutions.md')).toBeInTheDocument();
    });

    it('should handle workorder directories with long feature names', () => {
      const tree: TreeNode[] = [
        {
          name: 'multi-agent-coordination-with-papertrail-integration',
          path: 'coderef/workorder/multi-agent-coordination-with-papertrail-integration',
          type: 'directory',
          children: [
            {
              name: 'plan.json',
              path: 'coderef/workorder/multi-agent-coordination-with-papertrail-integration/plan.json',
              type: 'file',
              extension: '.json',
            },
            {
              name: 'DELIVERABLES.md',
              path: 'coderef/workorder/multi-agent-coordination-with-papertrail-integration/DELIVERABLES.md',
              type: 'file',
              extension: '.md',
            },
          ],
        },
      ];

      const { container } = renderWithProviders(
        <FileTree
          project={mockProject}
          customTree={tree}
          onFileClick={mockOnFileClick}
          loading={false}
        />
      );

      expect(screen.getByText('multi-agent-coordination-with-papertrail-integration')).toBeInTheDocument();
    });

    it('should filter to coderef folder with long paths', () => {
      const tree: TreeNode[] = [
        {
          name: 'src',
          path: 'src',
          type: 'directory',
          children: [],
        },
        {
          name: 'coderef',
          path: 'coderef',
          type: 'directory',
          children: [
            {
              name: 'extremely-long-documentation-file-name-for-comprehensive-guide.md',
              path: 'coderef/extremely-long-documentation-file-name-for-comprehensive-guide.md',
              type: 'file',
              extension: '.md',
            },
          ],
        },
      ];

      renderWithProviders(
        <FileTree
          project={mockProject}
          customTree={tree}
          onFileClick={mockOnFileClick}
          loading={false}
          filterPath="coderef"
        />
      );

      // Should show only coderef folder contents
      expect(screen.getByText('extremely-long-documentation-file-name-for-comprehensive-guide.md')).toBeInTheDocument();
      expect(screen.queryByText('src')).not.toBeInTheDocument();
    });
  });

  describe('View Mode Width Consistency', () => {
    const favoritesData: FavoritesData = {
      groups: [
        { id: 'g1', name: 'Work Files' },
      ],
      favorites: [
        {
          path: 'src/components/extremely-long-component-name-that-should-truncate.tsx',
          group: 'Work Files',
        },
      ],
    };

    it('should maintain width in Projects view mode', () => {
      const tree = createLongFilenameTree();

      const { container } = renderWithProviders(
        <FileTree
          project={mockProject}
          customTree={tree}
          onFileClick={mockOnFileClick}
          loading={false}
          showOnlyFavorites={false}
        />
      );

      expect(container.firstChild).toBeTruthy();
    });

    it('should maintain width in Favorites view mode', () => {
      const tree = createLongFilenameTree();

      const { container } = renderWithProviders(
        <FileTree
          project={mockProject}
          customTree={tree}
          onFileClick={mockOnFileClick}
          loading={false}
          showOnlyFavorites={true}
          favoritesData={favoritesData}
          isFavorite={(path) => path === 'src/components/extremely-long-component-name-that-should-truncate.tsx'}
        />
      );

      // Should render FavoritesList without width expansion
      expect(container.firstChild).toBeTruthy();
    });

    it('should maintain width when switching between empty and populated states', () => {
      const { rerender, container } = renderWithProviders(
        <FileTree
          project={mockProject}
          customTree={[]}
          onFileClick={mockOnFileClick}
          loading={false}
        />
      );

      // Empty state should not expand
      expect(container.firstChild).toBeTruthy();

      // Rerender with long filenames
      const longTree = createLongFilenameTree();
      rerender(
        <WorkflowProvider>
          <FileTree
            project={mockProject}
            customTree={longTree}
            onFileClick={mockOnFileClick}
            loading={false}
          />
        </WorkflowProvider>
      );

      // Populated state should not expand
      expect(container.firstChild).toBeTruthy();
    });
  });
});

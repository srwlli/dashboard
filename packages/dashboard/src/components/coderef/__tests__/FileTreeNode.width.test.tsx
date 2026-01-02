/**
 * FileTreeNode Width Constraint Tests
 *
 * Tests that the sidebar maintains its fixed 320px width even with very long
 * document titles. Validates the min-w-0 CSS fix for text truncation.
 *
 * Test Coverage:
 * - Fixed width constraint validation - 5 tests
 * - Text truncation behavior - 4 tests
 * - Long filename scenarios - 6 tests
 *
 * Total: 15 tests
 *
 * @see {@link https://github.com/coderef-dashboard/docs/EXPLORER-SIDEBAR.md#critical-fix-text-truncation}
 */

import { render, screen } from '@testing-library/react';
import { FileTreeNode } from '../FileTreeNode';
import type { TreeNode, Project } from '@/lib/coderef/types';

// Mock dependencies
jest.mock('@/contexts/WorkflowContext', () => ({
  useWorkflow: () => ({
    addAttachments: jest.fn(),
  }),
}));

describe('FileTreeNode - Width Constraint Tests', () => {
  const mockProject: Project = {
    id: 'test-project',
    name: 'Test Project',
    path: '/test/path',
    addedAt: '2024-01-01',
  };

  const mockOnFileClick = jest.fn();
  const mockOnToggleFavorite = jest.fn();
  const mockIsFavorite = jest.fn(() => false);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Fixed Width Constraint Validation', () => {
    it('should apply min-w-0 class to file node container', () => {
      const node: TreeNode = {
        name: 'test.ts',
        path: 'src/test.ts',
        type: 'file',
        extension: '.ts',
      };

      const { container } = render(
        <FileTreeNode
          node={node}
          project={mockProject}
          depth={0}
          onFileClick={mockOnFileClick}
        />
      );

      // Find the flex container that should have min-w-0
      const flexContainer = container.querySelector('.flex.items-center.gap-2');
      expect(flexContainer).toHaveClass('min-w-0');
    });

    it('should apply truncate class to filename span', () => {
      const node: TreeNode = {
        name: 'very-long-filename-that-should-truncate.tsx',
        path: 'src/components/very-long-filename-that-should-truncate.tsx',
        type: 'file',
        extension: '.tsx',
      };

      const { container } = render(
        <FileTreeNode
          node={node}
          project={mockProject}
          depth={0}
          onFileClick={mockOnFileClick}
        />
      );

      const filenameSpan = container.querySelector('span.text-sm');
      expect(filenameSpan).toHaveClass('truncate');
    });

    it('should not have flex-grow on node container', () => {
      const node: TreeNode = {
        name: 'test.ts',
        path: 'src/test.ts',
        type: 'file',
        extension: '.ts',
      };

      const { container } = render(
        <FileTreeNode
          node={node}
          project={mockProject}
          depth={0}
          onFileClick={mockOnFileClick}
        />
      );

      const flexContainer = container.querySelector('.flex.items-center.gap-2');
      expect(flexContainer).not.toHaveClass('flex-grow');
      expect(flexContainer).not.toHaveClass('flex-grow-1');
    });

    it('should apply flex-shrink-0 to icon containers', () => {
      const node: TreeNode = {
        name: 'test.ts',
        path: 'src/test.ts',
        type: 'file',
        extension: '.ts',
      };

      const { container } = render(
        <FileTreeNode
          node={node}
          project={mockProject}
          depth={0}
          onFileClick={mockOnFileClick}
        />
      );

      // Icon containers should not shrink
      const iconContainers = container.querySelectorAll('.flex-shrink-0');
      expect(iconContainers.length).toBeGreaterThan(0);
    });

    it('should maintain width constraints on deeply nested nodes', () => {
      const node: TreeNode = {
        name: 'deeply-nested-file-with-very-long-name.tsx',
        path: 'src/components/nested/folder/deeply-nested-file-with-very-long-name.tsx',
        type: 'file',
        extension: '.tsx',
      };

      const { container } = render(
        <FileTreeNode
          node={node}
          project={mockProject}
          depth={5} // Deep nesting
          onFileClick={mockOnFileClick}
        />
      );

      const flexContainer = container.querySelector('.flex.items-center.gap-2');
      expect(flexContainer).toHaveClass('min-w-0');
    });
  });

  describe('Text Truncation Behavior', () => {
    it('should render full short filenames without truncation', () => {
      const node: TreeNode = {
        name: 'index.ts',
        path: 'src/index.ts',
        type: 'file',
        extension: '.ts',
      };

      render(
        <FileTreeNode
          node={node}
          project={mockProject}
          depth={0}
          onFileClick={mockOnFileClick}
        />
      );

      expect(screen.getByText('index.ts')).toBeInTheDocument();
    });

    it('should have ellipsis capability for long filenames', () => {
      const longName = 'this-is-a-very-long-filename-that-would-normally-expand-the-container-beyond-its-bounds.tsx';
      const node: TreeNode = {
        name: longName,
        path: `src/${longName}`,
        type: 'file',
        extension: '.tsx',
      };

      const { container } = render(
        <FileTreeNode
          node={node}
          project={mockProject}
          depth={0}
          onFileClick={mockOnFileClick}
        />
      );

      const filenameSpan = container.querySelector('span.text-sm');
      const computedStyle = window.getComputedStyle(filenameSpan!);

      // Verify truncate class applies proper CSS
      expect(filenameSpan).toHaveClass('truncate');
      // truncate = overflow: hidden + text-overflow: ellipsis + white-space: nowrap
    });

    it('should truncate directory names with long paths', () => {
      const node: TreeNode = {
        name: 'extremely-long-directory-name-that-should-be-truncated-with-ellipsis',
        path: 'src/components/extremely-long-directory-name-that-should-be-truncated-with-ellipsis',
        type: 'directory',
        children: [],
      };

      const { container } = render(
        <FileTreeNode
          node={node}
          project={mockProject}
          depth={0}
          onFileClick={mockOnFileClick}
        />
      );

      const filenameSpan = container.querySelector('span.text-sm');
      expect(filenameSpan).toHaveClass('truncate');
    });

    it('should maintain truncation when favorited', () => {
      const longName = 'favorited-file-with-extremely-long-name-that-needs-truncation.md';
      const node: TreeNode = {
        name: longName,
        path: `docs/${longName}`,
        type: 'file',
        extension: '.md',
      };

      const mockIsFavoritedTrue = jest.fn(() => true);

      const { container } = render(
        <FileTreeNode
          node={node}
          project={mockProject}
          depth={0}
          onFileClick={mockOnFileClick}
          isFavorite={mockIsFavoritedTrue}
        />
      );

      // Should still have truncate class even with star icon
      const filenameSpan = container.querySelector('span.text-sm');
      expect(filenameSpan).toHaveClass('truncate');
    });
  });

  describe('Long Filename Scenarios', () => {
    it('should handle architecture document names', () => {
      const node: TreeNode = {
        name: 'feature-implementation-planning-standard-comprehensive-guide.md',
        path: 'coderef/foundation-docs/feature-implementation-planning-standard-comprehensive-guide.md',
        type: 'file',
        extension: '.md',
      };

      const { container } = render(
        <FileTreeNode
          node={node}
          project={mockProject}
          depth={2}
          onFileClick={mockOnFileClick}
        />
      );

      const flexContainer = container.querySelector('.flex.items-center.gap-2');
      expect(flexContainer).toHaveClass('min-w-0');
    });

    it('should handle plan.json files with long feature names', () => {
      const node: TreeNode = {
        name: 'multi-agent-coordination-workorder-tracking-deliverables-plan.json',
        path: 'coderef/workorder/multi-agent-coordination/multi-agent-coordination-workorder-tracking-deliverables-plan.json',
        type: 'file',
        extension: '.json',
      };

      const { container } = render(
        <FileTreeNode
          node={node}
          project={mockProject}
          depth={3}
          onFileClick={mockOnFileClick}
        />
      );

      const filenameSpan = container.querySelector('span.text-sm');
      expect(filenameSpan).toHaveClass('truncate');
    });

    it('should handle DELIVERABLES.md files', () => {
      const node: TreeNode = {
        name: 'DELIVERABLES.md',
        path: 'coderef/workorder/authentication-system-with-jwt-tokens/DELIVERABLES.md',
        type: 'file',
        extension: '.md',
      };

      const { container } = render(
        <FileTreeNode
          node={node}
          project={mockProject}
          depth={2}
          onFileClick={mockOnFileClick}
        />
      );

      expect(screen.getByText('DELIVERABLES.md')).toBeInTheDocument();
    });

    it('should handle component files with descriptive names', () => {
      const node: TreeNode = {
        name: 'CodeRefExplorerWidgetWithFavoritesManagementAndCrossTabSynchronization.tsx',
        path: 'src/components/CodeRefExplorerWidgetWithFavoritesManagementAndCrossTabSynchronization.tsx',
        type: 'file',
        extension: '.tsx',
      };

      const { container } = render(
        <FileTreeNode
          node={node}
          project={mockProject}
          depth={1}
          onFileClick={mockOnFileClick}
        />
      );

      const flexContainer = container.querySelector('.flex.items-center.gap-2');
      expect(flexContainer).toHaveClass('min-w-0');
    });

    it('should handle test files with long descriptive names', () => {
      const node: TreeNode = {
        name: 'FileTreeNode.width-constraint-validation-with-long-filenames.test.tsx',
        path: 'src/__tests__/FileTreeNode.width-constraint-validation-with-long-filenames.test.tsx',
        type: 'file',
        extension: '.tsx',
      };

      const { container } = render(
        <FileTreeNode
          node={node}
          project={mockProject}
          depth={1}
          onFileClick={mockOnFileClick}
        />
      );

      const filenameSpan = container.querySelector('span.text-sm');
      expect(filenameSpan).toHaveClass('truncate');
    });

    it('should handle deeply nested workorder directories', () => {
      const node: TreeNode = {
        name: 'comprehensive-documentation-generation-with-mermaid-diagrams-and-json-schema',
        path: 'coderef/workorder/comprehensive-documentation-generation-with-mermaid-diagrams-and-json-schema',
        type: 'directory',
        children: [],
      };

      const { container } = render(
        <FileTreeNode
          node={node}
          project={mockProject}
          depth={2}
          onFileClick={mockOnFileClick}
        />
      );

      const flexContainer = container.querySelector('.flex.items-center.gap-2');
      expect(flexContainer).toHaveClass('min-w-0');

      const filenameSpan = container.querySelector('span.text-sm');
      expect(filenameSpan).toHaveClass('truncate');
    });
  });
});

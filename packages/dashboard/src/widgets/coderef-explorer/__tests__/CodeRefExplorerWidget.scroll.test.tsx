/**
 * CodeRefExplorerWidget - Scroll Container Integration Tests
 *
 * Tests cover:
 * 1. Dedicated scroll container for FileTree
 * 2. Controls section stays fixed on scroll
 * 3. Visual hierarchy (borders, shadows, sticky positioning)
 * 4. ResizableSidebar integration
 * 5. Scroll event handling for shadow effects
 */

import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CodeRefExplorerWidget } from '../CodeRefExplorerWidget';
import { ExplorerProvider } from '@/contexts/ExplorerContext';

// Mock child components
jest.mock('@/components/coderef/ProjectSelector', () => ({
  ProjectSelector: ({ selectedProjectId, onProjectChange, initialProjectId }: any) => (
    <div data-testid="project-selector">
      <span data-testid="selected-project-id">{selectedProjectId || 'none'}</span>
      <button
        data-testid="change-project"
        onClick={() => onProjectChange({ id: 'test-project', name: 'Test', path: '/test', addedAt: '2024-01-01' })}
      >
        Change Project
      </button>
    </div>
  ),
}));

jest.mock('@/components/coderef/ViewModeToggle', () => ({
  ViewModeToggle: ({ value, onChange }: any) => (
    <div data-testid="view-mode-toggle">
      <span data-testid="current-view-mode">{value}</span>
      <button data-testid="switch-to-projects" onClick={() => onChange('projects')}>
        Projects
      </button>
      <button data-testid="switch-to-coderef" onClick={() => onChange('coderef')}>
        CodeRef
      </button>
    </div>
  ),
}));

jest.mock('@/components/coderef/FileTree', () => ({
  FileTree: ({ project, onFileClick, className, filterPath, showOnlyFavorites }: any) => (
    <div data-testid="file-tree" className={className}>
      <span data-testid="file-tree-project">{project?.name || 'none'}</span>
      <span data-testid="file-tree-filter">{filterPath || 'none'}</span>
      <span data-testid="file-tree-favorites">{String(showOnlyFavorites)}</span>
      {/* Simulate tall content for scroll testing */}
      <div style={{ height: '2000px' }} data-testid="tall-content">
        Tall Content Area
      </div>
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

jest.mock('@/components/coderef/ResizableSidebar', () => ({
  ResizableSidebar: ({ children, defaultWidth, minWidth, maxWidth, storageKey }: any) => (
    <div
      data-testid="resizable-sidebar"
      data-default-width={defaultWidth}
      data-min-width={minWidth}
      data-max-width={maxWidth}
      data-storage-key={storageKey}
      style={{ width: `${defaultWidth}px` }}
    >
      {children}
    </div>
  ),
}));

describe('CodeRefExplorerWidget - Scroll Container & Layout', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  const renderWidget = () => {
    return render(
      <ExplorerProvider>
        <CodeRefExplorerWidget />
      </ExplorerProvider>
    );
  };

  describe('ResizableSidebar Integration', () => {
    it('wraps sidebar content in ResizableSidebar component', () => {
      renderWidget();
      const resizableSidebar = screen.getByTestId('resizable-sidebar');
      expect(resizableSidebar).toBeInTheDocument();
    });

    it('passes correct props to ResizableSidebar', () => {
      renderWidget();
      const resizableSidebar = screen.getByTestId('resizable-sidebar');

      expect(resizableSidebar).toHaveAttribute('data-default-width', '320');
      expect(resizableSidebar).toHaveAttribute('data-min-width', '240');
      expect(resizableSidebar).toHaveAttribute('data-max-width', '600');
      expect(resizableSidebar).toHaveAttribute('data-storage-key', 'coderef-explorer-sidebar-width');
    });

    it('renders sidebar at default width', () => {
      renderWidget();
      const resizableSidebar = screen.getByTestId('resizable-sidebar');
      expect(resizableSidebar).toHaveStyle({ width: '320px' });
    });
  });

  describe('Scroll Container Structure', () => {
    it('has dedicated scroll container for FileTree', () => {
      const { container } = renderWidget();

      // Find the scroll container (div with overflow-y-auto and flex-1)
      const scrollContainer = container.querySelector('.overflow-y-auto.overflow-x-hidden.flex-1');
      expect(scrollContainer).toBeInTheDocument();
    });

    it('scroll container contains FileTree', () => {
      const { container } = renderWidget();

      const scrollContainer = container.querySelector('.overflow-y-auto.overflow-x-hidden.flex-1');
      const fileTree = screen.getByTestId('file-tree');

      expect(scrollContainer).toContainElement(fileTree);
    });

    it('controls section is outside scroll container', () => {
      const { container } = renderWidget();

      const scrollContainer = container.querySelector('.overflow-y-auto.overflow-x-hidden.flex-1');
      const projectSelector = screen.getByTestId('project-selector');
      const viewModeToggle = screen.getByTestId('view-mode-toggle');

      // Controls should NOT be inside scroll container
      expect(scrollContainer).not.toContainElement(projectSelector);
      expect(scrollContainer).not.toContainElement(viewModeToggle);
    });

    it('controls have flex-shrink-0 to prevent collapsing', () => {
      const { container } = renderWidget();

      // Find controls container (should have flex-shrink-0 and sticky)
      const controlsContainer = container.querySelector('.flex-shrink-0.sticky.top-0');
      expect(controlsContainer).toBeInTheDocument();
    });
  });

  describe('Visual Hierarchy', () => {
    it('controls section has border-b for visual separation', () => {
      const { container } = renderWidget();

      const controlsContainer = container.querySelector('.flex-shrink-0.sticky.top-0');
      expect(controlsContainer).toHaveClass('border-b');
      expect(controlsContainer).toHaveClass('border-ind-border');
    });

    it('controls have backdrop blur background', () => {
      const { container } = renderWidget();

      const controlsContainer = container.querySelector('.flex-shrink-0.sticky.top-0');
      expect(controlsContainer).toHaveClass('bg-ind-panel/80');
      expect(controlsContainer).toHaveClass('backdrop-blur-sm');
    });

    it('controls have z-10 for proper layering', () => {
      const { container } = renderWidget();

      const controlsContainer = container.querySelector('.flex-shrink-0.sticky.top-0');
      expect(controlsContainer).toHaveClass('z-10');
    });

    it('controls have sticky positioning at top', () => {
      const { container } = renderWidget();

      const controlsContainer = container.querySelector('.flex-shrink-0.sticky.top-0');
      expect(controlsContainer).toHaveClass('sticky');
      expect(controlsContainer).toHaveClass('top-0');
    });
  });

  describe('Scroll Behavior', () => {
    it('scroll container has correct overflow classes', () => {
      const { container } = renderWidget();

      const scrollContainer = container.querySelector('.overflow-y-auto.overflow-x-hidden.flex-1');
      expect(scrollContainer).toHaveClass('overflow-y-auto'); // Vertical scroll enabled
      expect(scrollContainer).toHaveClass('overflow-x-hidden'); // Horizontal scroll hidden
    });

    it('scroll container takes available vertical space with flex-1', () => {
      const { container } = renderWidget();

      const scrollContainer = container.querySelector('.overflow-y-auto.overflow-x-hidden.flex-1');
      expect(scrollContainer).toHaveClass('flex-1');
    });

    it('adds shadow to controls when scrolled', async () => {
      const { container } = renderWidget();

      const controlsContainer = container.querySelector('.flex-shrink-0.sticky.top-0') as HTMLElement;
      const scrollContainer = container.querySelector('.overflow-y-auto.overflow-x-hidden.flex-1') as HTMLElement;

      // Initially no shadow
      expect(controlsContainer).not.toHaveClass('shadow-md');

      // Simulate scroll event
      act(() => {
        Object.defineProperty(scrollContainer, 'scrollTop', {
          writable: true,
          value: 100,
        });
        scrollContainer.dispatchEvent(new Event('scroll', { bubbles: true }));
      });

      await waitFor(() => {
        expect(controlsContainer).toHaveClass('shadow-md');
      });
    });

    it('removes shadow when scrolled back to top', async () => {
      const { container } = renderWidget();

      const controlsContainer = container.querySelector('.flex-shrink-0.sticky.top-0') as HTMLElement;
      const scrollContainer = container.querySelector('.overflow-y-auto.overflow-x-hidden.flex-1') as HTMLElement;

      // Scroll down
      act(() => {
        Object.defineProperty(scrollContainer, 'scrollTop', {
          writable: true,
          value: 100,
        });
        scrollContainer.dispatchEvent(new Event('scroll', { bubbles: true }));
      });

      await waitFor(() => {
        expect(controlsContainer).toHaveClass('shadow-md');
      });

      // Scroll back to top
      act(() => {
        Object.defineProperty(scrollContainer, 'scrollTop', {
          writable: true,
          value: 0,
        });
        scrollContainer.dispatchEvent(new Event('scroll', { bubbles: true }));
      });

      await waitFor(() => {
        expect(controlsContainer).not.toHaveClass('shadow-md');
      });
    });
  });

  describe('Layout Integrity', () => {
    it('has correct root container flex layout', () => {
      const { container } = renderWidget();

      const rootContainer = container.querySelector('.h-full.flex.overflow-hidden.bg-ind-bg');
      expect(rootContainer).toBeInTheDocument();
      expect(rootContainer).toHaveClass('h-full');
      expect(rootContainer).toHaveClass('flex');
      expect(rootContainer).toHaveClass('overflow-hidden');
    });

    it('file viewer has flex-1 to take remaining space', () => {
      const { container } = renderWidget();

      const fileViewerContainer = screen.getByTestId('file-viewer').parentElement;
      expect(fileViewerContainer).toHaveClass('flex-1');
    });

    it('maintains 2-column layout (sidebar + file viewer)', () => {
      const { container } = renderWidget();

      const rootContainer = container.querySelector('.h-full.flex.overflow-hidden.bg-ind-bg');
      const resizableSidebar = screen.getByTestId('resizable-sidebar');
      const fileViewerParent = screen.getByTestId('file-viewer').parentElement;

      expect(rootContainer).toContainElement(resizableSidebar);
      expect(rootContainer).toContainElement(fileViewerParent!);
    });
  });

  describe('Component Integration', () => {
    it('renders all child components', () => {
      renderWidget();

      expect(screen.getByTestId('project-selector')).toBeInTheDocument();
      expect(screen.getByTestId('view-mode-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('file-tree')).toBeInTheDocument();
      expect(screen.getByTestId('file-viewer')).toBeInTheDocument();
    });

    it('FileTree receives correct props based on view mode', async () => {
      const user = userEvent.setup();
      renderWidget();

      // Default is 'projects' mode
      expect(screen.getByTestId('file-tree-filter')).toHaveTextContent('none');
      expect(screen.getByTestId('file-tree-favorites')).toHaveTextContent('false');

      // Switch to 'coderef' mode
      await user.click(screen.getByTestId('switch-to-coderef'));

      await waitFor(() => {
        expect(screen.getByTestId('file-tree-filter')).toHaveTextContent('coderef');
        expect(screen.getByTestId('file-tree-favorites')).toHaveTextContent('false');
      });
    });
  });
});

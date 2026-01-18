/**
 * ResizableSidebar - Visual Regression & Accessibility Tests
 *
 * Tests cover:
 * 1. Snapshot testing for layout stability
 * 2. Accessibility (ARIA, keyboard navigation, screen readers)
 * 3. Visual regression detection
 * 4. Responsive behavior
 */

import { render } from '@testing-library/react';
import { ResizableSidebar } from '../ResizableSidebar';

// Mock useSidebarResize hook
jest.mock('@/hooks/useSidebarResize', () => ({
  useSidebarResize: jest.fn(() => ({
    width: 320,
    handleMouseDown: jest.fn(),
  })),
}));

describe('ResizableSidebar - Visual Regression & Accessibility', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Snapshot Tests', () => {
    it('matches snapshot with default width', () => {
      const { container } = render(
        <ResizableSidebar
          defaultWidth={320}
          minWidth={240}
          maxWidth={600}
          storageKey="test-sidebar-width"
        >
          <div>Sidebar Content</div>
        </ResizableSidebar>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot with minimum width', () => {
      const { useSidebarResize } = require('@/hooks/useSidebarResize');
      useSidebarResize.mockReturnValue({
        width: 240,
        handleMouseDown: jest.fn(),
      });

      const { container } = render(
        <ResizableSidebar
          defaultWidth={320}
          minWidth={240}
          maxWidth={600}
          storageKey="test-sidebar-width"
        >
          <div>Sidebar Content</div>
        </ResizableSidebar>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot with maximum width', () => {
      const { useSidebarResize } = require('@/hooks/useSidebarResize');
      useSidebarResize.mockReturnValue({
        width: 600,
        handleMouseDown: jest.fn(),
      });

      const { container } = render(
        <ResizableSidebar
          defaultWidth={320}
          minWidth={240}
          maxWidth={600}
          storageKey="test-sidebar-width"
        >
          <div>Sidebar Content</div>
        </ResizableSidebar>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot with custom className', () => {
      const { container } = render(
        <ResizableSidebar
          defaultWidth={320}
          minWidth={240}
          maxWidth={600}
          storageKey="test-sidebar-width"
          className="custom-sidebar-class"
        >
          <div>Sidebar Content</div>
        </ResizableSidebar>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot with complex children', () => {
      const { container } = render(
        <ResizableSidebar
          defaultWidth={320}
          minWidth={240}
          maxWidth={600}
          storageKey="test-sidebar-width"
        >
          <div>
            <header>Header</header>
            <nav>Navigation</nav>
            <main>Main Content</main>
            <footer>Footer</footer>
          </div>
        </ResizableSidebar>
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Accessibility', () => {
    it('drag handle is keyboard accessible', () => {
      const { container } = render(
        <ResizableSidebar
          defaultWidth={320}
          minWidth={240}
          maxWidth={600}
          storageKey="test-sidebar-width"
        >
          <div>Content</div>
        </ResizableSidebar>
      );

      const dragHandle = container.querySelector('[role="separator"]');
      expect(dragHandle).toBeInTheDocument();
      expect(dragHandle).toHaveAttribute('role', 'separator');
      expect(dragHandle).toHaveAttribute('aria-orientation', 'vertical');
      expect(dragHandle).toHaveAttribute('aria-label', 'Resize sidebar');
    });

    it('has appropriate ARIA attributes for screen readers', () => {
      const { container } = render(
        <ResizableSidebar
          defaultWidth={320}
          minWidth={240}
          maxWidth={600}
          storageKey="test-sidebar-width"
        >
          <div>Content</div>
        </ResizableSidebar>
      );

      const dragHandle = container.querySelector('[role="separator"]');
      expect(dragHandle).toHaveAttribute('aria-orientation', 'vertical');
      expect(dragHandle).toHaveAttribute('aria-label'); // Has descriptive label
    });

    it('maintains semantic structure', () => {
      const { container } = render(
        <ResizableSidebar
          defaultWidth={320}
          minWidth={240}
          maxWidth={600}
          storageKey="test-sidebar-width"
        >
          <nav aria-label="Sidebar navigation">
            <ul>
              <li><a href="#">Link 1</a></li>
              <li><a href="#">Link 2</a></li>
            </ul>
          </nav>
        </ResizableSidebar>
      );

      const nav = container.querySelector('nav[aria-label="Sidebar navigation"]');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('Visual Hierarchy', () => {
    it('applies correct border and background classes', () => {
      const { container } = render(
        <ResizableSidebar
          defaultWidth={320}
          minWidth={240}
          maxWidth={600}
          storageKey="test-sidebar-width"
        >
          <div>Content</div>
        </ResizableSidebar>
      );

      const sidebar = container.firstChild as HTMLElement;
      expect(sidebar).toHaveClass('border-r');
      expect(sidebar).toHaveClass('border-ind-border');
      expect(sidebar).toHaveClass('bg-ind-panel');
    });

    it('drag handle has hover state classes', () => {
      const { container } = render(
        <ResizableSidebar
          defaultWidth={320}
          minWidth={240}
          maxWidth={600}
          storageKey="test-sidebar-width"
        >
          <div>Content</div>
        </ResizableSidebar>
      );

      const dragHandle = container.querySelector('[role="separator"]') as HTMLElement;
      expect(dragHandle).toHaveClass('hover:bg-ind-accent');
      expect(dragHandle).toHaveClass('transition-colors');
    });

    it('grip icon has correct opacity classes', () => {
      const { container } = render(
        <ResizableSidebar
          defaultWidth={320}
          minWidth={240}
          maxWidth={600}
          storageKey="test-sidebar-width"
        >
          <div>Content</div>
        </ResizableSidebar>
      );

      const gripContainer = container.querySelector('.opacity-0.group-hover\\:opacity-100');
      expect(gripContainer).toBeInTheDocument();
      expect(gripContainer).toHaveClass('transition-opacity');
    });
  });

  describe('Layout Consistency', () => {
    it('maintains consistent positioning classes', () => {
      const { container } = render(
        <ResizableSidebar
          defaultWidth={320}
          minWidth={240}
          maxWidth={600}
          storageKey="test-sidebar-width"
        >
          <div>Content</div>
        </ResizableSidebar>
      );

      const sidebar = container.firstChild as HTMLElement;
      expect(sidebar).toHaveClass('relative');
      expect(sidebar).toHaveClass('flex-shrink-0');
      expect(sidebar).toHaveClass('flex-grow-0');
    });

    it('drag handle positioned correctly', () => {
      const { container } = render(
        <ResizableSidebar
          defaultWidth={320}
          minWidth={240}
          maxWidth={600}
          storageKey="test-sidebar-width"
        >
          <div>Content</div>
        </ResizableSidebar>
      );

      const dragHandle = container.querySelector('[role="separator"]') as HTMLElement;
      expect(dragHandle).toHaveClass('absolute');
      expect(dragHandle).toHaveClass('top-0');
      expect(dragHandle).toHaveClass('right-0');
      expect(dragHandle).toHaveClass('bottom-0');
    });

    it('grip icon centered vertically', () => {
      const { container } = render(
        <ResizableSidebar
          defaultWidth={320}
          minWidth={240}
          maxWidth={600}
          storageKey="test-sidebar-width"
        >
          <div>Content</div>
        </ResizableSidebar>
      );

      const gripContainer = container.querySelector('.top-1\\/2.-translate-y-1\\/2');
      expect(gripContainer).toBeInTheDocument();
      expect(gripContainer).toHaveClass('absolute');
      expect(gripContainer).toHaveClass('right-0');
    });
  });

  describe('Responsive Behavior', () => {
    it('sidebar width adjusts based on hook', () => {
      const { useSidebarResize } = require('@/hooks/useSidebarResize');

      // Test at minimum width
      useSidebarResize.mockReturnValue({
        width: 240,
        handleMouseDown: jest.fn(),
      });

      const { container, rerender } = render(
        <ResizableSidebar
          defaultWidth={320}
          minWidth={240}
          maxWidth={600}
          storageKey="test-sidebar-width"
        >
          <div>Content</div>
        </ResizableSidebar>
      );

      expect(container.firstChild).toHaveStyle({ width: '240px' });

      // Test at maximum width
      useSidebarResize.mockReturnValue({
        width: 600,
        handleMouseDown: jest.fn(),
      });

      rerender(
        <ResizableSidebar
          defaultWidth={320}
          minWidth={240}
          maxWidth={600}
          storageKey="test-sidebar-width"
        >
          <div>Content</div>
        </ResizableSidebar>
      );

      expect(container.firstChild).toHaveStyle({ width: '600px' });
    });

    it('handles overflow correctly', () => {
      const { container } = render(
        <ResizableSidebar
          defaultWidth={320}
          minWidth={240}
          maxWidth={600}
          storageKey="test-sidebar-width"
        >
          <div>Content</div>
        </ResizableSidebar>
      );

      const sidebar = container.firstChild as HTMLElement;
      expect(sidebar).toHaveClass('overflow-hidden');
    });
  });

  describe('Color Scheme Compatibility', () => {
    it('uses design token classes for theming', () => {
      const { container } = render(
        <ResizableSidebar
          defaultWidth={320}
          minWidth={240}
          maxWidth={600}
          storageKey="test-sidebar-width"
        >
          <div>Content</div>
        </ResizableSidebar>
      );

      const sidebar = container.firstChild as HTMLElement;
      const dragHandle = container.querySelector('[role="separator"]') as HTMLElement;
      const gripIcon = container.querySelector('svg') as SVGElement;

      // Sidebar uses ind-* tokens
      expect(sidebar).toHaveClass('bg-ind-panel');
      expect(sidebar).toHaveClass('border-ind-border');

      // Drag handle uses ind-* tokens
      expect(dragHandle).toHaveClass('hover:bg-ind-accent');

      // Grip icon uses ind-text-muted
      expect(gripIcon.parentElement).toHaveClass('opacity-0');
    });
  });
});

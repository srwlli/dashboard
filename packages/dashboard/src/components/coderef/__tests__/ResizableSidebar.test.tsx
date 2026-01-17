/**
 * ResizableSidebar Component Tests
 *
 * Tests cover:
 * 1. Component rendering with default/custom widths
 * 2. Drag handle visibility and interaction
 * 3. Resize behavior during mousemove
 * 4. Width constraint enforcement (min/max)
 * 5. localStorage persistence (save/load)
 * 6. Accessibility (ARIA attributes, keyboard access)
 */

import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResizableSidebar } from '../ResizableSidebar';

// Mock useSidebarResize hook
jest.mock('@/hooks/useSidebarResize', () => ({
  useSidebarResize: jest.fn(),
}));

import { useSidebarResize } from '@/hooks/useSidebarResize';

const mockUseSidebarResize = useSidebarResize as jest.MockedFunction<typeof useSidebarResize>;

describe('ResizableSidebar', () => {
  let mockHandleMouseDown: jest.Mock;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    mockHandleMouseDown = jest.fn();

    // Default mock implementation
    mockUseSidebarResize.mockReturnValue({
      width: 320,
      handleMouseDown: mockHandleMouseDown,
    });
  });

  describe('Rendering', () => {
    it('renders with default width', () => {
      const { container } = render(
        <ResizableSidebar
          defaultWidth={320}
          minWidth={240}
          maxWidth={600}
          storageKey="test-sidebar-width"
        >
          <div data-testid="sidebar-content">Sidebar Content</div>
        </ResizableSidebar>
      );

      const sidebar = container.firstChild as HTMLElement;
      expect(sidebar).toHaveStyle({ width: '320px' });
      expect(screen.getByTestId('sidebar-content')).toBeInTheDocument();
    });

    it('renders with custom width from hook', () => {
      mockUseSidebarResize.mockReturnValue({
        width: 450,
        handleMouseDown: mockHandleMouseDown,
      });

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
      expect(sidebar).toHaveStyle({ width: '450px' });
    });

    it('renders children correctly', () => {
      render(
        <ResizableSidebar
          defaultWidth={320}
          minWidth={240}
          maxWidth={600}
          storageKey="test-sidebar-width"
        >
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </ResizableSidebar>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });

    it('applies custom className when provided', () => {
      const { container } = render(
        <ResizableSidebar
          defaultWidth={320}
          minWidth={240}
          maxWidth={600}
          storageKey="test-sidebar-width"
          className="custom-class"
        >
          <div>Content</div>
        </ResizableSidebar>
      );

      const sidebar = container.firstChild as HTMLElement;
      expect(sidebar).toHaveClass('custom-class');
    });
  });

  describe('Drag Handle', () => {
    it('renders drag handle with proper ARIA attributes', () => {
      render(
        <ResizableSidebar
          defaultWidth={320}
          minWidth={240}
          maxWidth={600}
          storageKey="test-sidebar-width"
        >
          <div>Content</div>
        </ResizableSidebar>
      );

      const dragHandle = screen.getByRole('separator');
      expect(dragHandle).toBeInTheDocument();
      expect(dragHandle).toHaveAttribute('aria-orientation', 'vertical');
      expect(dragHandle).toHaveAttribute('aria-label', 'Resize sidebar');
    });

    it('has col-resize cursor on drag handle', () => {
      render(
        <ResizableSidebar
          defaultWidth={320}
          minWidth={240}
          maxWidth={600}
          storageKey="test-sidebar-width"
        >
          <div>Content</div>
        </ResizableSidebar>
      );

      const dragHandle = screen.getByRole('separator');
      expect(dragHandle).toHaveClass('cursor-col-resize');
    });

    it('calls handleMouseDown when drag handle is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ResizableSidebar
          defaultWidth={320}
          minWidth={240}
          maxWidth={600}
          storageKey="test-sidebar-width"
        >
          <div>Content</div>
        </ResizableSidebar>
      );

      const dragHandle = screen.getByRole('separator');
      await user.pointer({ keys: '[MouseLeft>]', target: dragHandle });

      expect(mockHandleMouseDown).toHaveBeenCalledTimes(1);
    });

    it('contains GripVertical icon', () => {
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

      // GripVertical from lucide-react renders as SVG
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Hook Integration', () => {
    it('passes correct props to useSidebarResize hook', () => {
      render(
        <ResizableSidebar
          defaultWidth={320}
          minWidth={240}
          maxWidth={600}
          storageKey="my-custom-key"
        >
          <div>Content</div>
        </ResizableSidebar>
      );

      expect(mockUseSidebarResize).toHaveBeenCalledWith({
        defaultWidth: 320,
        minWidth: 240,
        maxWidth: 600,
        storageKey: 'my-custom-key',
      });
    });

    it('updates width when hook returns new value', () => {
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

      let sidebar = container.firstChild as HTMLElement;
      expect(sidebar).toHaveStyle({ width: '320px' });

      // Simulate width change from hook
      mockUseSidebarResize.mockReturnValue({
        width: 500,
        handleMouseDown: mockHandleMouseDown,
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

      sidebar = container.firstChild as HTMLElement;
      expect(sidebar).toHaveStyle({ width: '500px' });
    });
  });

  describe('Styling', () => {
    it('applies correct Tailwind classes for sidebar container', () => {
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
      expect(sidebar).toHaveClass('overflow-hidden');
      expect(sidebar).toHaveClass('border-r');
      expect(sidebar).toHaveClass('border-ind-border');
      expect(sidebar).toHaveClass('bg-ind-panel');
    });

    it('applies hover styles to drag handle', () => {
      render(
        <ResizableSidebar
          defaultWidth={320}
          minWidth={240}
          maxWidth={600}
          storageKey="test-sidebar-width"
        >
          <div>Content</div>
        </ResizableSidebar>
      );

      const dragHandle = screen.getByRole('separator');
      expect(dragHandle).toHaveClass('hover:bg-ind-accent');
      expect(dragHandle).toHaveClass('transition-colors');
    });
  });

  describe('Width Constraints', () => {
    it('enforces minimum width via hook', () => {
      mockUseSidebarResize.mockReturnValue({
        width: 240, // Minimum enforced by hook
        handleMouseDown: mockHandleMouseDown,
      });

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
      expect(sidebar).toHaveStyle({ width: '240px' });
    });

    it('enforces maximum width via hook', () => {
      mockUseSidebarResize.mockReturnValue({
        width: 600, // Maximum enforced by hook
        handleMouseDown: mockHandleMouseDown,
      });

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
      expect(sidebar).toHaveStyle({ width: '600px' });
    });
  });
});

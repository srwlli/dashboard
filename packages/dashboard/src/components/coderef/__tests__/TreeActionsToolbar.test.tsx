/**
 * TreeActionsToolbar Component Tests
 *
 * Tests cover:
 * 1. Toolbar rendering with all buttons
 * 2. Button click handlers (onExpandAll, onCollapseAll, onRefresh)
 * 3. Tooltips and aria-labels
 * 4. Icon rendering
 * 5. Tailwind styling (ind-* tokens, hover states)
 * 6. Optional props handling
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TreeActionsToolbar from '../TreeActionsToolbar';

describe('TreeActionsToolbar', () => {
  describe('Rendering', () => {
    it('renders toolbar container', () => {
      const mockExpand = jest.fn();
      const mockCollapse = jest.fn();
      const mockRefresh = jest.fn();

      const { container } = render(
        <TreeActionsToolbar
          onExpandAll={mockExpand}
          onCollapseAll={mockCollapse}
          onRefresh={mockRefresh}
        />
      );

      const toolbar = container.firstChild;
      expect(toolbar).toBeInTheDocument();
      expect(toolbar).toHaveClass('flex');
    });

    it('renders all three action buttons', () => {
      const mockExpand = jest.fn();
      const mockCollapse = jest.fn();
      const mockRefresh = jest.fn();

      render(
        <TreeActionsToolbar
          onExpandAll={mockExpand}
          onCollapseAll={mockCollapse}
          onRefresh={mockRefresh}
        />
      );

      expect(screen.getByTitle(/expand all/i)).toBeInTheDocument();
      expect(screen.getByTitle(/collapse all/i)).toBeInTheDocument();
      expect(screen.getByTitle(/refresh/i)).toBeInTheDocument();
    });

    it('renders icons for each button', () => {
      const mockExpand = jest.fn();
      const mockCollapse = jest.fn();
      const mockRefresh = jest.fn();

      const { container } = render(
        <TreeActionsToolbar
          onExpandAll={mockExpand}
          onCollapseAll={mockCollapse}
          onRefresh={mockRefresh}
        />
      );

      // Each button should have an SVG icon from lucide-react
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Button Interactions', () => {
    it('calls onExpandAll when expand button clicked', async () => {
      const mockExpand = jest.fn();
      const mockCollapse = jest.fn();
      const mockRefresh = jest.fn();
      const user = userEvent.setup();

      render(
        <TreeActionsToolbar
          onExpandAll={mockExpand}
          onCollapseAll={mockCollapse}
          onRefresh={mockRefresh}
        />
      );

      const expandButton = screen.getByTitle(/expand all/i);
      await user.click(expandButton);

      expect(mockExpand).toHaveBeenCalledTimes(1);
    });

    it('calls onCollapseAll when collapse button clicked', async () => {
      const mockExpand = jest.fn();
      const mockCollapse = jest.fn();
      const mockRefresh = jest.fn();
      const user = userEvent.setup();

      render(
        <TreeActionsToolbar
          onExpandAll={mockExpand}
          onCollapseAll={mockCollapse}
          onRefresh={mockRefresh}
        />
      );

      const collapseButton = screen.getByTitle(/collapse all/i);
      await user.click(collapseButton);

      expect(mockCollapse).toHaveBeenCalledTimes(1);
    });

    it('calls onRefresh when refresh button clicked', async () => {
      const mockExpand = jest.fn();
      const mockCollapse = jest.fn();
      const mockRefresh = jest.fn();
      const user = userEvent.setup();

      render(
        <TreeActionsToolbar
          onExpandAll={mockExpand}
          onCollapseAll={mockCollapse}
          onRefresh={mockRefresh}
        />
      );

      const refreshButton = screen.getByTitle(/refresh/i);
      await user.click(refreshButton);

      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it('does not call handlers multiple times on single click', async () => {
      const mockExpand = jest.fn();
      const mockCollapse = jest.fn();
      const mockRefresh = jest.fn();
      const user = userEvent.setup();

      render(
        <TreeActionsToolbar
          onExpandAll={mockExpand}
          onCollapseAll={mockCollapse}
          onRefresh={mockRefresh}
        />
      );

      const refreshButton = screen.getByTitle(/refresh/i);
      await user.click(refreshButton);

      expect(mockRefresh).toHaveBeenCalledTimes(1);
      expect(mockExpand).not.toHaveBeenCalled();
      expect(mockCollapse).not.toHaveBeenCalled();
    });

    it('handles multiple clicks on same button', async () => {
      const mockRefresh = jest.fn();
      const user = userEvent.setup();

      render(
        <TreeActionsToolbar
          onExpandAll={jest.fn()}
          onCollapseAll={jest.fn()}
          onRefresh={mockRefresh}
        />
      );

      const refreshButton = screen.getByTitle(/refresh/i);
      await user.click(refreshButton);
      await user.click(refreshButton);
      await user.click(refreshButton);

      expect(mockRefresh).toHaveBeenCalledTimes(3);
    });
  });

  describe('Tooltips and Accessibility', () => {
    it('expand button has tooltip/aria-label', () => {
      const mockExpand = jest.fn();
      const mockCollapse = jest.fn();
      const mockRefresh = jest.fn();

      render(
        <TreeActionsToolbar
          onExpandAll={mockExpand}
          onCollapseAll={mockCollapse}
          onRefresh={mockRefresh}
        />
      );

      const expandButton = screen.getByTitle(/expand all/i);
      expect(expandButton).toHaveAttribute('title');
      expect(expandButton).toHaveAttribute('aria-label');
    });

    it('collapse button has tooltip/aria-label', () => {
      const mockExpand = jest.fn();
      const mockCollapse = jest.fn();
      const mockRefresh = jest.fn();

      render(
        <TreeActionsToolbar
          onExpandAll={mockExpand}
          onCollapseAll={mockCollapse}
          onRefresh={mockRefresh}
        />
      );

      const collapseButton = screen.getByTitle(/collapse all/i);
      expect(collapseButton).toHaveAttribute('title');
      expect(collapseButton).toHaveAttribute('aria-label');
    });

    it('refresh button has tooltip/aria-label', () => {
      const mockExpand = jest.fn();
      const mockCollapse = jest.fn();
      const mockRefresh = jest.fn();

      render(
        <TreeActionsToolbar
          onExpandAll={mockExpand}
          onCollapseAll={mockCollapse}
          onRefresh={mockRefresh}
        />
      );

      const refreshButton = screen.getByTitle(/refresh/i);
      expect(refreshButton).toHaveAttribute('title');
      expect(refreshButton).toHaveAttribute('aria-label');
    });

    it('all buttons are keyboard accessible', () => {
      const mockExpand = jest.fn();
      const mockCollapse = jest.fn();
      const mockRefresh = jest.fn();

      render(
        <TreeActionsToolbar
          onExpandAll={mockExpand}
          onCollapseAll={mockCollapse}
          onRefresh={mockRefresh}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);

      buttons.forEach((button) => {
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('Styling', () => {
    it('applies Tailwind flex layout', () => {
      const mockExpand = jest.fn();
      const mockCollapse = jest.fn();
      const mockRefresh = jest.fn();

      const { container } = render(
        <TreeActionsToolbar
          onExpandAll={mockExpand}
          onCollapseAll={mockCollapse}
          onRefresh={mockRefresh}
        />
      );

      const toolbar = container.firstChild as HTMLElement;
      expect(toolbar).toHaveClass('flex');
    });

    it('buttons have hover state classes', () => {
      const mockExpand = jest.fn();
      const mockCollapse = jest.fn();
      const mockRefresh = jest.fn();

      render(
        <TreeActionsToolbar
          onExpandAll={mockExpand}
          onCollapseAll={mockCollapse}
          onRefresh={mockRefresh}
        />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('hover:bg-ind-panel');
        expect(button).toHaveClass('hover:text-ind-accent');
      });
    });

    it('buttons have proper padding and sizing', () => {
      const mockExpand = jest.fn();
      const mockCollapse = jest.fn();
      const mockRefresh = jest.fn();

      render(
        <TreeActionsToolbar
          onExpandAll={mockExpand}
          onCollapseAll={mockCollapse}
          onRefresh={mockRefresh}
        />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('p-2');
      });
    });

    it('toolbar has gap between buttons', () => {
      const mockExpand = jest.fn();
      const mockCollapse = jest.fn();
      const mockRefresh = jest.fn();

      const { container } = render(
        <TreeActionsToolbar
          onExpandAll={mockExpand}
          onCollapseAll={mockCollapse}
          onRefresh={mockRefresh}
        />
      );

      const toolbar = container.firstChild as HTMLElement;
      expect(toolbar).toHaveClass('gap-1');
    });
  });

  describe('Optional Props', () => {
    it('renders with only onRefresh provided', () => {
      const mockRefresh = jest.fn();

      render(<TreeActionsToolbar onRefresh={mockRefresh} />);

      expect(screen.getByTitle(/refresh/i)).toBeInTheDocument();
    });

    it('handles missing onExpandAll gracefully', () => {
      const mockCollapse = jest.fn();
      const mockRefresh = jest.fn();

      render(<TreeActionsToolbar onCollapseAll={mockCollapse} onRefresh={mockRefresh} />);

      // Should still render expand button even if handler is undefined
      const expandButton = screen.queryByTitle(/expand all/i);
      expect(expandButton).toBeInTheDocument();
    });

    it('handles missing onCollapseAll gracefully', () => {
      const mockExpand = jest.fn();
      const mockRefresh = jest.fn();

      render(<TreeActionsToolbar onExpandAll={mockExpand} onRefresh={mockRefresh} />);

      // Should still render collapse button even if handler is undefined
      const collapseButton = screen.queryByTitle(/collapse all/i);
      expect(collapseButton).toBeInTheDocument();
    });

    it('handles all props as undefined', () => {
      render(<TreeActionsToolbar />);

      // Buttons should still render
      expect(screen.getByTitle(/expand all/i)).toBeInTheDocument();
      expect(screen.getByTitle(/collapse all/i)).toBeInTheDocument();
      expect(screen.getByTitle(/refresh/i)).toBeInTheDocument();
    });
  });
});

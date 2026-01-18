/**
 * QuickFileSearch Component Tests
 *
 * Tests cover:
 * 1. Component rendering (input, icon, placeholder)
 * 2. Search input interaction (typing, onChange callback)
 * 3. Clear button visibility and functionality
 * 4. Keyboard shortcut hint display
 * 5. Tailwind styling (ind-* design tokens)
 * 6. Focus states
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuickFileSearch from '../QuickFileSearch';

describe('QuickFileSearch', () => {
  describe('Rendering', () => {
    it('renders search input', () => {
      const onSearch = jest.fn();
      render(<QuickFileSearch searchQuery="" onSearchChange={onSearch} />);

      const input = screen.getByPlaceholderText(/search files/i);
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });

    it('renders search icon', () => {
      const onSearch = jest.fn();
      const { container } = render(<QuickFileSearch searchQuery="" onSearchChange={onSearch} />);

      // Search icon from lucide-react renders as SVG
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('displays current search query as value', () => {
      const onSearch = jest.fn();
      render(<QuickFileSearch searchQuery="test query" onSearchChange={onSearch} />);

      const input = screen.getByPlaceholderText(/search files/i) as HTMLInputElement;
      expect(input.value).toBe('test query');
    });

    it('has proper placeholder text', () => {
      const onSearch = jest.fn();
      render(<QuickFileSearch searchQuery="" onSearchChange={onSearch} />);

      expect(screen.getByPlaceholderText('Search files...')).toBeInTheDocument();
    });
  });

  describe('Search Interaction', () => {
    it('calls onSearchChange when typing', async () => {
      const onSearch = jest.fn();
      const user = userEvent.setup();

      render(<QuickFileSearch searchQuery="" onSearchChange={onSearch} />);
      const input = screen.getByPlaceholderText(/search files/i);

      await user.type(input, 't');

      expect(onSearch).toHaveBeenCalledWith('t');
    });

    it('calls onSearchChange with full input value', async () => {
      const onSearch = jest.fn();
      const user = userEvent.setup();

      render(<QuickFileSearch searchQuery="" onSearchChange={onSearch} />);
      const input = screen.getByPlaceholderText(/search files/i);

      await user.type(input, 'test');

      // Should be called for each character: 't', 'te', 'tes', 'test'
      expect(onSearch).toHaveBeenLastCalledWith('test');
    });

    it('handles onChange event directly', () => {
      const onSearch = jest.fn();
      render(<QuickFileSearch searchQuery="" onSearchChange={onSearch} />);

      const input = screen.getByPlaceholderText(/search files/i);
      fireEvent.change(input, { target: { value: 'new value' } });

      expect(onSearch).toHaveBeenCalledWith('new value');
    });

    it('updates when searchQuery prop changes', () => {
      const onSearch = jest.fn();
      const { rerender } = render(<QuickFileSearch searchQuery="" onSearchChange={onSearch} />);

      let input = screen.getByPlaceholderText(/search files/i) as HTMLInputElement;
      expect(input.value).toBe('');

      rerender(<QuickFileSearch searchQuery="updated" onSearchChange={onSearch} />);

      input = screen.getByPlaceholderText(/search files/i) as HTMLInputElement;
      expect(input.value).toBe('updated');
    });
  });

  describe('Clear Button', () => {
    it('shows clear button when input has value', () => {
      const onSearch = jest.fn();
      render(<QuickFileSearch searchQuery="test" onSearchChange={onSearch} />);

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      expect(clearButton).toBeInTheDocument();
    });

    it('hides clear button when input is empty', () => {
      const onSearch = jest.fn();
      render(<QuickFileSearch searchQuery="" onSearchChange={onSearch} />);

      const clearButton = screen.queryByRole('button', { name: /clear search/i });
      expect(clearButton).not.toBeInTheDocument();
    });

    it('clears input when clear button clicked', async () => {
      const onSearch = jest.fn();
      const user = userEvent.setup();

      render(<QuickFileSearch searchQuery="test query" onSearchChange={onSearch} />);

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      await user.click(clearButton);

      expect(onSearch).toHaveBeenCalledWith('');
    });

    it('renders X icon for clear button', () => {
      const onSearch = jest.fn();
      const { container } = render(<QuickFileSearch searchQuery="test" onSearchChange={onSearch} />);

      // X icon from lucide-react
      const clearButton = screen.getByRole('button', { name: /clear search/i });
      const icon = clearButton.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcut Hint', () => {
    it('displays keyboard shortcut hint when input is empty', () => {
      const onSearch = jest.fn();
      render(<QuickFileSearch searchQuery="" onSearchChange={onSearch} />);

      // Hint should show ⌘K or Ctrl+K based on platform
      const hint = screen.getByText(/⌘K|Ctrl\+K/i);
      expect(hint).toBeInTheDocument();
    });

    it('hides keyboard shortcut hint when input has value', () => {
      const onSearch = jest.fn();
      render(<QuickFileSearch searchQuery="test" onSearchChange={onSearch} />);

      const hint = screen.queryByText(/⌘K|Ctrl\+K/i);
      expect(hint).not.toBeInTheDocument();
    });

    it('shows correct shortcut for Mac (⌘K)', () => {
      // Mock navigator.platform for Mac
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        configurable: true,
      });

      const onSearch = jest.fn();
      render(<QuickFileSearch searchQuery="" onSearchChange={onSearch} />);

      expect(screen.getByText('⌘K')).toBeInTheDocument();
    });

    it('shows correct shortcut for Windows/Linux (Ctrl+K)', () => {
      // Mock navigator.platform for Windows
      Object.defineProperty(navigator, 'platform', {
        value: 'Win32',
        configurable: true,
      });

      const onSearch = jest.fn();
      render(<QuickFileSearch searchQuery="" onSearchChange={onSearch} />);

      expect(screen.getByText('Ctrl+K')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies Tailwind ind-* design tokens', () => {
      const onSearch = jest.fn();
      const { container } = render(<QuickFileSearch searchQuery="" onSearchChange={onSearch} />);

      const input = screen.getByPlaceholderText(/search files/i);

      // Check for ind-* token classes
      expect(input).toHaveClass('bg-ind-bg');
      expect(input).toHaveClass('border-ind-border');
      expect(input).toHaveClass('text-ind-text');
    });

    it('has focus state with border-ind-accent', () => {
      const onSearch = jest.fn();
      render(<QuickFileSearch searchQuery="" onSearchChange={onSearch} />);

      const input = screen.getByPlaceholderText(/search files/i);
      expect(input).toHaveClass('focus:border-ind-accent');
    });

    it('applies proper padding and sizing', () => {
      const onSearch = jest.fn();
      render(<QuickFileSearch searchQuery="" onSearchChange={onSearch} />);

      const input = screen.getByPlaceholderText(/search files/i);
      expect(input).toHaveClass('px-3');
      expect(input).toHaveClass('py-2');
    });

    it('has rounded corners', () => {
      const onSearch = jest.fn();
      render(<QuickFileSearch searchQuery="" onSearchChange={onSearch} />);

      const input = screen.getByPlaceholderText(/search files/i);
      expect(input).toHaveClass('rounded-md');
    });
  });

  describe('Accessibility', () => {
    it('input has proper type attribute', () => {
      const onSearch = jest.fn();
      render(<QuickFileSearch searchQuery="" onSearchChange={onSearch} />);

      const input = screen.getByPlaceholderText(/search files/i);
      expect(input).toHaveAttribute('type', 'text');
    });

    it('clear button has aria-label', () => {
      const onSearch = jest.fn();
      render(<QuickFileSearch searchQuery="test" onSearchChange={onSearch} />);

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      expect(clearButton).toHaveAttribute('aria-label');
    });

    it('input can receive focus', async () => {
      const onSearch = jest.fn();
      const user = userEvent.setup();

      render(<QuickFileSearch searchQuery="" onSearchChange={onSearch} />);
      const input = screen.getByPlaceholderText(/search files/i);

      await user.click(input);
      expect(input).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string query', () => {
      const onSearch = jest.fn();
      render(<QuickFileSearch searchQuery="" onSearchChange={onSearch} />);

      const input = screen.getByPlaceholderText(/search files/i) as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('handles very long search queries', () => {
      const longQuery = 'a'.repeat(200);
      const onSearch = jest.fn();

      render(<QuickFileSearch searchQuery={longQuery} onSearchChange={onSearch} />);

      const input = screen.getByPlaceholderText(/search files/i) as HTMLInputElement;
      expect(input.value).toBe(longQuery);
    });

    it('handles special characters in query', () => {
      const specialQuery = '!@#$%^&*()_+-={}[]|:;<>?,./';
      const onSearch = jest.fn();

      render(<QuickFileSearch searchQuery={specialQuery} onSearchChange={onSearch} />);

      const input = screen.getByPlaceholderText(/search files/i) as HTMLInputElement;
      expect(input.value).toBe(specialQuery);
    });
  });
});

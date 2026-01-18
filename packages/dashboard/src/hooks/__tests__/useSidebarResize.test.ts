/**
 * useSidebarResize Hook Tests
 *
 * Tests cover:
 * 1. Initial width loading (default vs localStorage)
 * 2. Width clamping (min/max constraints)
 * 3. Drag interaction (mousedown, mousemove, mouseup)
 * 4. localStorage persistence (save on change)
 * 5. Event listener cleanup on unmount
 * 6. Edge cases (invalid localStorage, quota exceeded, etc.)
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useSidebarResize } from '../useSidebarResize';

describe('useSidebarResize', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    // Reset document body styles
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  });

  afterEach(() => {
    // Cleanup any lingering event listeners
    document.removeEventListener('mousemove', jest.fn());
    document.removeEventListener('mouseup', jest.fn());
  });

  describe('Initial Width', () => {
    it('returns defaultWidth on first mount when no localStorage value exists', () => {
      const { result } = renderHook(() =>
        useSidebarResize({
          defaultWidth: 320,
          minWidth: 240,
          maxWidth: 600,
          storageKey: 'test-sidebar-width',
        })
      );

      expect(result.current.width).toBe(320);
    });

    it('loads width from localStorage if available', () => {
      localStorage.setItem('test-sidebar-width', '450');

      const { result } = renderHook(() =>
        useSidebarResize({
          defaultWidth: 320,
          minWidth: 240,
          maxWidth: 600,
          storageKey: 'test-sidebar-width',
        })
      );

      expect(result.current.width).toBe(450);
    });

    it('clamps loaded localStorage value to min constraint', () => {
      localStorage.setItem('test-sidebar-width', '100'); // Below min (240)

      const { result } = renderHook(() =>
        useSidebarResize({
          defaultWidth: 320,
          minWidth: 240,
          maxWidth: 600,
          storageKey: 'test-sidebar-width',
        })
      );

      expect(result.current.width).toBe(240);
    });

    it('clamps loaded localStorage value to max constraint', () => {
      localStorage.setItem('test-sidebar-width', '800'); // Above max (600)

      const { result } = renderHook(() =>
        useSidebarResize({
          defaultWidth: 320,
          minWidth: 240,
          maxWidth: 600,
          storageKey: 'test-sidebar-width',
        })
      );

      expect(result.current.width).toBe(600);
    });

    it('falls back to defaultWidth if localStorage value is invalid', () => {
      localStorage.setItem('test-sidebar-width', 'invalid-number');

      const { result } = renderHook(() =>
        useSidebarResize({
          defaultWidth: 320,
          minWidth: 240,
          maxWidth: 600,
          storageKey: 'test-sidebar-width',
        })
      );

      expect(result.current.width).toBe(320);
    });

    it('handles empty string in localStorage', () => {
      localStorage.setItem('test-sidebar-width', '');

      const { result } = renderHook(() =>
        useSidebarResize({
          defaultWidth: 320,
          minWidth: 240,
          maxWidth: 600,
          storageKey: 'test-sidebar-width',
        })
      );

      expect(result.current.width).toBe(320);
    });
  });

  describe('localStorage Persistence', () => {
    it('saves width to localStorage on mount', async () => {
      renderHook(() =>
        useSidebarResize({
          defaultWidth: 320,
          minWidth: 240,
          maxWidth: 600,
          storageKey: 'test-sidebar-width',
        })
      );

      await waitFor(() => {
        expect(localStorage.getItem('test-sidebar-width')).toBe('320');
      });
    });

    it('updates localStorage when width changes', async () => {
      const { result } = renderHook(() =>
        useSidebarResize({
          defaultWidth: 320,
          minWidth: 240,
          maxWidth: 600,
          storageKey: 'test-sidebar-width',
        })
      );

      // Simulate drag to change width
      act(() => {
        const mockMouseDownEvent = new MouseEvent('mousedown', {
          clientX: 320,
          bubbles: true,
        }) as any;
        result.current.handleMouseDown(mockMouseDownEvent);
      });

      act(() => {
        const mockMouseMoveEvent = new MouseEvent('mousemove', {
          clientX: 420, // Moved 100px to the right
          bubbles: true,
        });
        document.dispatchEvent(mockMouseMoveEvent);
      });

      await waitFor(() => {
        expect(localStorage.getItem('test-sidebar-width')).toBe('420');
      });
    });

    it('handles QuotaExceededError gracefully', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Mock localStorage.setItem to throw QuotaExceededError
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        const error = new DOMException('Quota exceeded', 'QuotaExceededError');
        throw error;
      });

      renderHook(() =>
        useSidebarResize({
          defaultWidth: 320,
          minWidth: 240,
          maxWidth: 600,
          storageKey: 'test-sidebar-width',
        })
      );

      await waitFor(() => {
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('[useSidebarResize] localStorage quota exceeded'),
          expect.any(Object)
        );
      });

      // Restore original setItem
      Storage.prototype.setItem = originalSetItem;
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Drag Interaction', () => {
    it('returns handleMouseDown function', () => {
      const { result } = renderHook(() =>
        useSidebarResize({
          defaultWidth: 320,
          minWidth: 240,
          maxWidth: 600,
          storageKey: 'test-sidebar-width',
        })
      );

      expect(typeof result.current.handleMouseDown).toBe('function');
    });

    it('updates width during drag', () => {
      const { result } = renderHook(() =>
        useSidebarResize({
          defaultWidth: 320,
          minWidth: 240,
          maxWidth: 600,
          storageKey: 'test-sidebar-width',
        })
      );

      act(() => {
        const mockMouseDownEvent = new MouseEvent('mousedown', {
          clientX: 320,
          bubbles: true,
        }) as any;
        mockMouseDownEvent.preventDefault = jest.fn();
        result.current.handleMouseDown(mockMouseDownEvent);
      });

      act(() => {
        const mockMouseMoveEvent = new MouseEvent('mousemove', {
          clientX: 420, // Moved 100px to the right
          bubbles: true,
        });
        document.dispatchEvent(mockMouseMoveEvent);
      });

      expect(result.current.width).toBe(420);
    });

    it('sets body cursor to col-resize on mousedown', () => {
      const { result } = renderHook(() =>
        useSidebarResize({
          defaultWidth: 320,
          minWidth: 240,
          maxWidth: 600,
          storageKey: 'test-sidebar-width',
        })
      );

      act(() => {
        const mockMouseDownEvent = new MouseEvent('mousedown', {
          clientX: 320,
          bubbles: true,
        }) as any;
        mockMouseDownEvent.preventDefault = jest.fn();
        result.current.handleMouseDown(mockMouseDownEvent);
      });

      expect(document.body.style.cursor).toBe('col-resize');
      expect(document.body.style.userSelect).toBe('none');
    });

    it('resets body cursor on mouseup', () => {
      const { result } = renderHook(() =>
        useSidebarResize({
          defaultWidth: 320,
          minWidth: 240,
          maxWidth: 600,
          storageKey: 'test-sidebar-width',
        })
      );

      act(() => {
        const mockMouseDownEvent = new MouseEvent('mousedown', {
          clientX: 320,
          bubbles: true,
        }) as any;
        mockMouseDownEvent.preventDefault = jest.fn();
        result.current.handleMouseDown(mockMouseDownEvent);
      });

      expect(document.body.style.cursor).toBe('col-resize');

      act(() => {
        const mockMouseUpEvent = new MouseEvent('mouseup', {
          bubbles: true,
        });
        document.dispatchEvent(mockMouseUpEvent);
      });

      expect(document.body.style.cursor).toBe('');
      expect(document.body.style.userSelect).toBe('');
    });

    it('stops updating width after mouseup', () => {
      const { result } = renderHook(() =>
        useSidebarResize({
          defaultWidth: 320,
          minWidth: 240,
          maxWidth: 600,
          storageKey: 'test-sidebar-width',
        })
      );

      // Start drag
      act(() => {
        const mockMouseDownEvent = new MouseEvent('mousedown', {
          clientX: 320,
          bubbles: true,
        }) as any;
        mockMouseDownEvent.preventDefault = jest.fn();
        result.current.handleMouseDown(mockMouseDownEvent);
      });

      // Move mouse
      act(() => {
        const mockMouseMoveEvent = new MouseEvent('mousemove', {
          clientX: 420,
          bubbles: true,
        });
        document.dispatchEvent(mockMouseMoveEvent);
      });

      expect(result.current.width).toBe(420);

      // Stop drag
      act(() => {
        const mockMouseUpEvent = new MouseEvent('mouseup', {
          bubbles: true,
        });
        document.dispatchEvent(mockMouseUpEvent);
      });

      // Move mouse again (should not update width)
      act(() => {
        const mockMouseMoveEvent2 = new MouseEvent('mousemove', {
          clientX: 500,
          bubbles: true,
        });
        document.dispatchEvent(mockMouseMoveEvent2);
      });

      expect(result.current.width).toBe(420); // Width unchanged
    });
  });

  describe('Width Constraints', () => {
    it('clamps width to minWidth during drag', () => {
      const { result } = renderHook(() =>
        useSidebarResize({
          defaultWidth: 320,
          minWidth: 240,
          maxWidth: 600,
          storageKey: 'test-sidebar-width',
        })
      );

      act(() => {
        const mockMouseDownEvent = new MouseEvent('mousedown', {
          clientX: 320,
          bubbles: true,
        }) as any;
        mockMouseDownEvent.preventDefault = jest.fn();
        result.current.handleMouseDown(mockMouseDownEvent);
      });

      act(() => {
        const mockMouseMoveEvent = new MouseEvent('mousemove', {
          clientX: 100, // Trying to go below 240px
          bubbles: true,
        });
        document.dispatchEvent(mockMouseMoveEvent);
      });

      expect(result.current.width).toBe(240); // Clamped to min
    });

    it('clamps width to maxWidth during drag', () => {
      const { result } = renderHook(() =>
        useSidebarResize({
          defaultWidth: 320,
          minWidth: 240,
          maxWidth: 600,
          storageKey: 'test-sidebar-width',
        })
      );

      act(() => {
        const mockMouseDownEvent = new MouseEvent('mousedown', {
          clientX: 320,
          bubbles: true,
        }) as any;
        mockMouseDownEvent.preventDefault = jest.fn();
        result.current.handleMouseDown(mockMouseDownEvent);
      });

      act(() => {
        const mockMouseMoveEvent = new MouseEvent('mousemove', {
          clientX: 1000, // Trying to go above 600px
          bubbles: true,
        });
        document.dispatchEvent(mockMouseMoveEvent);
      });

      expect(result.current.width).toBe(600); // Clamped to max
    });

    it('allows width within valid range', () => {
      const { result } = renderHook(() =>
        useSidebarResize({
          defaultWidth: 320,
          minWidth: 240,
          maxWidth: 600,
          storageKey: 'test-sidebar-width',
        })
      );

      act(() => {
        const mockMouseDownEvent = new MouseEvent('mousedown', {
          clientX: 320,
          bubbles: true,
        }) as any;
        mockMouseDownEvent.preventDefault = jest.fn();
        result.current.handleMouseDown(mockMouseDownEvent);
      });

      act(() => {
        const mockMouseMoveEvent = new MouseEvent('mousemove', {
          clientX: 470, // 150px increase → 470px total (valid)
          bubbles: true,
        });
        document.dispatchEvent(mockMouseMoveEvent);
      });

      expect(result.current.width).toBe(470);
    });
  });

  describe('Event Listener Cleanup', () => {
    it('removes event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

      const { result, unmount } = renderHook(() =>
        useSidebarResize({
          defaultWidth: 320,
          minWidth: 240,
          maxWidth: 600,
          storageKey: 'test-sidebar-width',
        })
      );

      // Start drag to add listeners
      act(() => {
        const mockMouseDownEvent = new MouseEvent('mousedown', {
          clientX: 320,
          bubbles: true,
        }) as any;
        mockMouseDownEvent.preventDefault = jest.fn();
        result.current.handleMouseDown(mockMouseDownEvent);
      });

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });
});

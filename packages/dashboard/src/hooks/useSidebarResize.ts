/**
 * useSidebarResize Hook
 *
 * @description Custom hook for managing resizable sidebar width with drag interaction
 * and localStorage persistence. Handles mouse events for dragging, enforces min/max
 * constraints, and automatically saves/restores width from localStorage.
 *
 * @hook
 * @example
 * ```tsx
 * const { width, handleMouseDown } = useSidebarResize({
 *   defaultWidth: 320,
 *   minWidth: 240,
 *   maxWidth: 600,
 *   storageKey: 'my-sidebar-width'
 * });
 * ```
 *
 * @remarks
 * **Features**:
 * - Mouse drag interaction with mousemove/mouseup listeners
 * - Width clamping between min/max bounds
 * - localStorage persistence (load on mount, save on change)
 * - Automatic cleanup of event listeners on unmount
 *
 * **Performance**:
 * - Uses useEffect for event listener management
 * - Cleanup function prevents memory leaks
 * - Width updates trigger re-render (no debouncing - smooth resize)
 *
 * **Edge Cases**:
 * - Handles invalid localStorage values (falls back to defaultWidth)
 * - Clamps width to constraints on every update
 * - QuotaExceededError handling for localStorage writes
 */
import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseSidebarResizeParams {
  /** Default width in pixels (used on first render if no localStorage value) */
  defaultWidth: number;
  /** Minimum allowed width in pixels */
  minWidth: number;
  /** Maximum allowed width in pixels */
  maxWidth: number;
  /** localStorage key for persisting width across sessions */
  storageKey: string;
}

export interface UseSidebarResizeReturn {
  /** Current sidebar width in pixels */
  width: number;
  /** Mouse down handler to attach to drag handle */
  handleMouseDown: (e: React.MouseEvent) => void;
}

/**
 * useSidebarResize - Hook for resizable sidebar with localStorage persistence
 *
 * @param params - Configuration parameters
 * @returns Current width and drag handler
 */
export function useSidebarResize({
  defaultWidth,
  minWidth,
  maxWidth,
  storageKey,
}: UseSidebarResizeParams): UseSidebarResizeReturn {
  const [width, setWidth] = useState<number>(defaultWidth);
  const isDraggingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  // Load width from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsedWidth = parseInt(stored, 10);
      if (!isNaN(parsedWidth)) {
        // Clamp to constraints
        const clampedWidth = Math.max(minWidth, Math.min(maxWidth, parsedWidth));
        setWidth(clampedWidth);
      }
    }
  }, [storageKey, minWidth, maxWidth]);

  // Save width to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, width.toString());
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('[useSidebarResize] localStorage quota exceeded when saving width', {
          storageKey,
          width,
        });
      } else {
        console.error('[useSidebarResize] Failed to save width to localStorage:', error);
      }
    }
  }, [width, storageKey]);

  // Handle mouse move during drag
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const deltaX = e.clientX - startXRef.current;
      const newWidth = startWidthRef.current + deltaX;

      // Clamp to min/max constraints
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      setWidth(clampedWidth);
    },
    [minWidth, maxWidth]
  );

  // Handle mouse up to stop dragging
  const handleMouseUp = useCallback(() => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  }, []);

  // Cleanup function for event listeners
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Handle mouse down on drag handle
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;
      startXRef.current = e.clientX;
      startWidthRef.current = width;

      // Set cursor style for visual feedback
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none'; // Prevent text selection during drag

      // Add listeners immediately
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [width, handleMouseMove, handleMouseUp]
  );

  return {
    width,
    handleMouseDown,
  };
}

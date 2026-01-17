/**
 * ResizableSidebar Component
 *
 * @description A resizable sidebar container with drag handle for adjusting width.
 * Provides a user-controlled sidebar width with min/max constraints and localStorage persistence.
 *
 * @component
 * @example
 * ```tsx
 * <ResizableSidebar
 *   defaultWidth={320}
 *   minWidth={240}
 *   maxWidth={600}
 *   storageKey="my-sidebar-width"
 * >
 *   <div>Sidebar content</div>
 * </ResizableSidebar>
 * ```
 *
 * @remarks
 * **Features**:
 * - Draggable resize handle on right edge
 * - Width constraints (min/max enforcement)
 * - localStorage persistence via storageKey prop
 * - Visual feedback on hover/drag (cursor changes, handle highlight)
 *
 * **Design Tokens**:
 * - Uses `border-ind-border` for sidebar border and handle
 * - Uses `bg-ind-panel` for sidebar background
 * - Uses `hover:bg-ind-accent` for drag handle hover state
 *
 * **Accessibility**:
 * - Drag handle is keyboard accessible (future enhancement: arrow key resize)
 * - Visual cursor feedback (col-resize) for discoverability
 */
'use client';

import { ReactNode } from 'react';
import { GripVertical } from 'lucide-react';
import { useSidebarResize } from '@/hooks/useSidebarResize';

export interface ResizableSidebarProps {
  /** Child elements to render inside the sidebar */
  children: ReactNode;
  /** Default width in pixels (used on first render if no localStorage value) */
  defaultWidth: number;
  /** Minimum allowed width in pixels */
  minWidth: number;
  /** Maximum allowed width in pixels */
  maxWidth: number;
  /** localStorage key for persisting width across sessions */
  storageKey: string;
  /** Optional className for additional styling */
  className?: string;
  /** Collapsed state (external control) */
  isCollapsed?: boolean;
  /** Callback when collapse state changes */
  onToggleCollapse?: () => void;
}

/**
 * ResizableSidebar - A sidebar container with draggable resize handle
 *
 * @param props - Component props
 * @returns Resizable sidebar with drag handle
 */
export function ResizableSidebar({
  children,
  defaultWidth,
  minWidth,
  maxWidth,
  storageKey,
  className = '',
  isCollapsed = false,
  onToggleCollapse,
}: ResizableSidebarProps) {
  const { width, handleMouseDown } = useSidebarResize({
    defaultWidth,
    minWidth,
    maxWidth,
    storageKey,
  });

  const displayWidth = isCollapsed ? 0 : width;

  return (
    <div
      className={`relative flex-shrink-0 flex-grow-0 overflow-hidden border-r border-ind-border bg-ind-panel flex flex-col transition-all duration-200 ${className}`}
      style={{ width: `${displayWidth}px` }}
    >
      {/* Sidebar content - hide when collapsed */}
      {!isCollapsed && children}

      {/* Drag handle - positioned on right edge, hidden when collapsed */}
      {!isCollapsed && (
        <div
          className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize group hover:bg-ind-accent transition-colors flex items-center justify-center"
          onMouseDown={handleMouseDown}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
        >
          {/* Grip icon - visible on hover */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-4 w-4 text-ind-text-muted" />
          </div>
        </div>
      )}
    </div>
  );
}

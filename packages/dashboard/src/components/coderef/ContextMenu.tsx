/**
 * ContextMenu Component
 *
 * @description Right-click context menu system with support for:
 * - **Single-Level Menus**: Simple list of actions with icons and labels
 * - **Nested Submenus**: Hierarchical menus with chevron indicators and hover expansion
 * - **Custom Styling**: Per-item icon and text color customization via className props
 * - **Automatic Positioning**: Fixed positioning at mouse coordinates (x, y)
 * - **Click-Outside Handling**: Closes menu when clicking outside the menu bounds
 * - **Keyboard Support**: Escape key to close menu
 * - **Visual Feedback**: Hover states on menu items and submenu expansion
 *
 * Used throughout Explorer Sidebar for file/folder actions (Add to Favorites, Add to Prompt, Copy Path).
 *
 * @see {@link https://github.com/coderef-dashboard/docs/EXPLORER-SIDEBAR.md#context-menu-system} for detailed documentation
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Context Menu Item Definition
 *
 * @description Represents a single menu item with optional submenu support.
 * Items can have custom icon/text styling for visual differentiation (e.g., yellow star for favorites).
 *
 * @example
 * ```tsx
 * const menuItem: ContextMenuItem = {
 *   label: 'Add to Favorites',
 *   icon: Star,
 *   onClick: () => console.log('Favorited!'),
 *   iconClassName: 'fill-yellow-400 text-yellow-400',
 *   submenu: [
 *     { label: 'Ungrouped', icon: Star, onClick: () => addToFavorites() },
 *     { label: 'Work Files', icon: Star, onClick: () => addToFavorites('Work Files') },
 *   ]
 * };
 * ```
 */
export interface ContextMenuItem {
  /**
   * Menu item display text
   * @example "Add to Favorites", "Copy Path", "Remove from Group"
   */
  label: string;

  /**
   * Lucide React icon component to display
   * @example Star, Plus, FolderTree, Check
   */
  icon: LucideIcon;

  /**
   * Click handler function
   * Ignored if submenu is provided (submenu takes precedence)
   * @param void
   * @returns void
   */
  onClick?: () => void;

  /**
   * Optional nested submenu items
   * When provided, clicking the parent item does nothing - hover to expand submenu
   * @example [{ label: 'Option 1', icon: Star, onClick: () => {} }]
   */
  submenu?: ContextMenuItem[];

  /**
   * Optional icon styling (e.g., fill color, text color)
   * @example "fill-yellow-400 text-yellow-400", "text-green-500"
   */
  iconClassName?: string;

  /**
   * Optional text color class for the label
   * @example "text-red-500" for destructive actions
   */
  textClassName?: string;
}

/**
 * ContextMenu Component Props
 *
 * @description Props interface for the ContextMenu component.
 * Requires absolute positioning coordinates and item definitions.
 */
interface ContextMenuProps {
  /**
   * X coordinate for menu position (pixels from left edge)
   * Typically set to event.clientX from right-click event
   * @minimum 0
   */
  x: number;

  /**
   * Y coordinate for menu position (pixels from top edge)
   * Typically set to event.clientY from right-click event
   * @minimum 0
   */
  y: number;

  /**
   * Menu items to display
   * Array of ContextMenuItem objects defining menu structure
   * @minimum 1 item required
   */
  items: ContextMenuItem[];

  /**
   * Callback when menu should close
   * Triggered by: outside click, Escape key, item selection
   */
  onClose: () => void;
}

/**
 * ContextMenu Component
 *
 * @description Renders a fixed-position context menu at specified coordinates with support
 * for nested submenus. Manages menu lifecycle (open/close), event handling (clicks, keyboard),
 * and submenu expansion state.
 *
 * @component
 * @example
 * ```tsx
 * // Basic single-level menu
 * <ContextMenu
 *   x={event.clientX}
 *   y={event.clientY}
 *   items={[
 *     { label: 'Copy', icon: Copy, onClick: () => navigator.clipboard.writeText('...') },
 *     { label: 'Delete', icon: Trash, onClick: () => deleteItem(), textClassName: 'text-red-500' },
 *   ]}
 *   onClose={() => setContextMenu(null)}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Menu with submenu
 * <ContextMenu
 *   x={clientX}
 *   y={clientY}
 *   items={[
 *     {
 *       label: 'Add to Group',
 *       icon: Star,
 *       submenu: [
 *         { label: 'Work Files', icon: Folder, onClick: () => assignToGroup('Work Files') },
 *         { label: 'Personal', icon: Folder, onClick: () => assignToGroup('Personal') },
 *       ]
 *     }
 *   ]}
 *   onClose={() => setContextMenu(null)}
 * />
 * ```
 *
 * @remarks
 * **Event Handling**: Registers global mousedown and keydown listeners to detect outside clicks
 * and Escape key presses. Listeners are cleaned up on unmount.
 *
 * **Submenu Behavior**: Submenus expand on hover (tracked via hoveredIndex state) and are
 * positioned absolutely to the right of the parent item with 1px margin.
 *
 * **Click Behavior**: Clicking a menu item triggers onClick and immediately closes the menu.
 * Items with submenus do not trigger onClick when clicked (submenu takes precedence).
 *
 * **Positioning**: Uses fixed positioning with inline styles (`left`, `top`) to position at
 * exact mouse coordinates. No viewport boundary detection - may overflow screen edges.
 *
 * @see {@link FileTreeNode} for usage example in file tree context menus
 * @see {@link FavoritesList} for usage in favorites group management
 */
export function ContextMenu({
  x,
  y,
  items,
  onClose,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Close menu on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleItemClick = (onClick?: () => void) => {
    if (onClick) {
      onClick();
      onClose();
    }
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-ind-panel border border-ind-border rounded shadow-lg py-1 min-w-[180px]"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        const hasSubmenu = item.submenu && item.submenu.length > 0;

        return (
          <div
            key={index}
            className="relative"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <button
              onClick={() => !hasSubmenu && handleItemClick(item.onClick)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-ind-bg flex items-center gap-2 justify-between ${
                item.textClassName || 'text-ind-text'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${item.iconClassName || ''}`} />
                <span>{item.label}</span>
              </div>
              {hasSubmenu && (
                <ChevronRight className="w-3.5 h-3.5 text-ind-text-muted" />
              )}
            </button>

            {/* Submenu */}
            {hasSubmenu && hoveredIndex === index && (
              <div
                className="absolute left-full top-0 ml-1 bg-ind-panel border border-ind-border rounded shadow-lg py-1 min-w-[180px]"
              >
                {item.submenu!.map((subItem, subIndex) => {
                  const SubIcon = subItem.icon;
                  return (
                    <button
                      key={subIndex}
                      onClick={() => handleItemClick(subItem.onClick)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-ind-bg flex items-center gap-2 ${
                        subItem.textClassName || 'text-ind-text'
                      }`}
                    >
                      <SubIcon className={`w-4 h-4 ${subItem.iconClassName || ''}`} />
                      <span>{subItem.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ContextMenu;

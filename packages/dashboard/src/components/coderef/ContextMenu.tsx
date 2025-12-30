/**
 * ContextMenu Component
 *
 * Right-click context menu for various operations
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ContextMenuItem {
  /** Menu item label */
  label: string;
  /** Menu item icon */
  icon: LucideIcon;
  /** Click handler (ignored if submenu is provided) */
  onClick?: () => void;
  /** Optional submenu items */
  submenu?: ContextMenuItem[];
  /** Optional icon class name (for styling like fill color) */
  iconClassName?: string;
  /** Optional text color class */
  textClassName?: string;
}

interface ContextMenuProps {
  /** X coordinate for menu position */
  x: number;
  /** Y coordinate for menu position */
  y: number;
  /** Menu items to display */
  items: ContextMenuItem[];
  /** Callback when menu should close */
  onClose: () => void;
}

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

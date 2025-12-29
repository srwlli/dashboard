/**
 * ContextMenu Component
 *
 * Right-click context menu for various operations
 */

'use client';

import { useEffect, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface ContextMenuItem {
  /** Menu item label */
  label: string;
  /** Menu item icon */
  icon: LucideIcon;
  /** Click handler */
  onClick: () => void;
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

  const handleItemClick = (onClick: () => void) => {
    onClick();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-ind-panel border border-ind-border rounded shadow-lg py-1 min-w-[180px]"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            key={index}
            onClick={() => handleItemClick(item.onClick)}
            className={`w-full px-3 py-2 text-left text-sm hover:bg-ind-bg flex items-center gap-2 ${
              item.textClassName || 'text-ind-text'
            }`}
          >
            <Icon className={`w-4 h-4 ${item.iconClassName || ''}`} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default ContextMenu;

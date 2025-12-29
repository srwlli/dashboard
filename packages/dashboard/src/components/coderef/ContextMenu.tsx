/**
 * ContextMenu Component
 *
 * Right-click context menu for file/folder operations
 */

'use client';

import { useEffect, useRef } from 'react';
import { Star } from 'lucide-react';

interface ContextMenuProps {
  /** X coordinate for menu position */
  x: number;
  /** Y coordinate for menu position */
  y: number;
  /** Whether the item is currently favorited */
  isFavorited: boolean;
  /** Callback when favorite is toggled */
  onToggleFavorite: () => void;
  /** Callback when menu should close */
  onClose: () => void;
}

export function ContextMenu({
  x,
  y,
  isFavorited,
  onToggleFavorite,
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

  const handleFavoriteClick = () => {
    onToggleFavorite();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-ind-panel border border-ind-border rounded shadow-lg py-1 min-w-[180px]"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <button
        onClick={handleFavoriteClick}
        className="w-full px-3 py-2 text-left text-sm text-ind-text hover:bg-ind-bg flex items-center gap-2"
      >
        <Star
          className={`w-4 h-4 ${isFavorited ? 'fill-yellow-400 text-yellow-400' : ''}`}
        />
        <span>{isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}</span>
      </button>
    </div>
  );
}

export default ContextMenu;

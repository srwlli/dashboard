'use client';

/**
 * BoardCard Component
 *
 * Individual task card with title, description, tags, and attachments
 * Supports drag & drop (Phase 4) and context menu (Phase 5)
 */

import type { BoardCardProps } from '@/types/boards';

export function BoardCard({ card, onUpdate, onDelete }: BoardCardProps) {
  async function handleDelete() {
    if (confirm('Delete this card?')) {
      await onDelete();
    }
  }

  return (
    <div className="bg-ind-bg border border-ind-border p-3 hover:border-ind-accent transition-colors cursor-pointer group">
      {/* Card Title */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-ind-text font-medium flex-1">{card.title}</p>

        {/* Delete Button (visible on hover) */}
        <button
          onClick={handleDelete}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 transition-all"
        >
          <svg
            className="w-3 h-3 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Card Description */}
      {card.description && (
        <p className="text-xs text-ind-text-muted mt-1 line-clamp-2">
          {card.description}
        </p>
      )}

      {/* Card Tags */}
      {card.tags && card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {card.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-xs bg-ind-accent/10 text-ind-accent px-2 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Attachments Count */}
      {card.attachments && card.attachments.length > 0 && (
        <div className="mt-2 text-xs text-ind-text-muted flex items-center gap-1">
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
          {card.attachments.length}
        </div>
      )}
    </div>
  );
}

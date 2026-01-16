'use client';

/**
 * BoardList Component
 *
 * Vertical column containing cards
 * Supports collapse/expand, card operations, and drag & drop (Phase 4)
 */

import { useState } from 'react';
import { Plus, ChevronDown, ChevronRight, MoreVertical } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import type { BoardListProps, BoardCard as BoardCardType } from '@/types/boards';
import { BoardCard } from './BoardCard';
import { CardEditor } from './CardEditor';

export function BoardList({
  list,
  cards,
  onUpdateList,
  onDeleteList,
  onCreateCard,
  onUpdateCard,
  onDeleteCard,
}: BoardListProps) {
  const [showCardEditor, setShowCardEditor] = useState(false);
  const [editingCard, setEditingCard] = useState<BoardCardType | undefined>(undefined);

  // Make list droppable
  const { setNodeRef, isOver } = useDroppable({
    id: list.id,
    data: {
      type: 'list',
      list,
    },
  });

  async function handleToggleCollapse() {
    await onUpdateList(list.id, { collapsed: !list.collapsed });
  }

  function handleOpenCreateCard() {
    setEditingCard(undefined);
    setShowCardEditor(true);
  }

  function handleOpenEditCard(card: BoardCardType) {
    setEditingCard(card);
    setShowCardEditor(true);
  }

  function handleCloseEditor() {
    setEditingCard(undefined);
    setShowCardEditor(false);
  }

  async function handleSaveCard(data: any) {
    if (editingCard) {
      // Update existing card
      await onUpdateCard(editingCard.id, data);
    } else {
      // Create new card
      await onCreateCard({
        ...data,
        listId: list.id,
        order: cards.length,
      });
    }
    handleCloseEditor();
  }

  // Sort cards by order
  const sortedCards = [...cards].sort((a, b) => a.order - b.order);

  return (
    <div className="flex-shrink-0 w-[300px] bg-ind-panel border-2 border-ind-border flex flex-col max-h-full">
      {/* List Header */}
      <div className="border-b-2 border-ind-border p-3">
        <div className="flex items-center justify-between gap-2">
          {/* Collapse Button */}
          <button
            onClick={handleToggleCollapse}
            className="flex-shrink-0 p-1 hover:bg-ind-border transition-colors"
          >
            {list.collapsed ? (
              <ChevronRight className="w-4 h-4 text-ind-text-muted" />
            ) : (
              <ChevronDown className="w-4 h-4 text-ind-text-muted" />
            )}
          </button>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-ind-text truncate">
              {list.title}
            </h3>
          </div>

          {/* Card Count */}
          <span className="flex-shrink-0 text-xs text-ind-text-muted px-2 py-0.5 bg-ind-bg">
            {cards.length}
          </span>

          {/* Menu Button (Placeholder for MENU-002) */}
          <button className="flex-shrink-0 p-1 hover:bg-ind-border transition-colors">
            <MoreVertical className="w-4 h-4 text-ind-text-muted" />
          </button>
        </div>

        {/* Optional Color Accent */}
        {list.color && (
          <div
            className="h-1 mt-2 -mx-3"
            style={{ backgroundColor: list.color }}
          />
        )}
      </div>

      {/* Cards Container - Only visible when not collapsed */}
      {!list.collapsed && (
        <>
          <div
            ref={setNodeRef}
            className={`flex-1 overflow-y-auto p-2 space-y-2 transition-colors ${
              isOver ? 'bg-ind-accent/10' : ''
            }`}
          >
            {sortedCards.map((card) => (
              <div key={card.id} onClick={() => handleOpenEditCard(card)}>
                <BoardCard
                  card={card}
                  onUpdate={(updates) => onUpdateCard(card.id, updates)}
                  onDelete={() => onDeleteCard(card.id)}
                />
              </div>
            ))}

            {/* Empty State */}
            {sortedCards.length === 0 && (
              <div className="text-center py-8">
                <p className="text-xs text-ind-text-muted">
                  {isOver ? 'Drop card here' : 'No cards yet'}
                </p>
              </div>
            )}
          </div>

          {/* Add Card Button */}
          <div className="border-t border-ind-border p-2">
            <button
              onClick={handleOpenCreateCard}
              className="w-full px-3 py-2 text-sm text-ind-text-muted hover:bg-ind-border transition-colors text-left flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add card
            </button>
          </div>
        </>
      )}

      {/* Collapsed State - Just show card count */}
      {list.collapsed && (
        <div className="p-3 text-center">
          <p className="text-xs text-ind-text-muted">
            {cards.length} {cards.length === 1 ? 'card' : 'cards'}
          </p>
        </div>
      )}

      {/* Card Editor Modal */}
      {showCardEditor && (
        <CardEditor
          card={editingCard}
          listId={list.id}
          onSave={handleSaveCard}
          onClose={handleCloseEditor}
        />
      )}
    </div>
  );
}

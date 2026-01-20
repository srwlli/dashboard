'use client';

/**
 * BoardList Component
 *
 * Vertical column containing cards
 * Supports collapse/expand, card operations, and drag & drop (Phase 4)
 */

import { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronRight, MoreVertical, ExternalLink } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { BoardListProps, BoardCard as BoardCardType } from '@/types/boards';
import { BoardCard } from './BoardCard';
import { CardEditor } from './CardEditor';

export function BoardList({
  boardId,
  boardLists,
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
  const [showMenu, setShowMenu] = useState(false);

  // Close modal if the card being edited no longer exists (e.g., was deleted)
  useEffect(() => {
    if (editingCard && !cards.some(c => c.id === editingCard.id)) {
      setEditingCard(undefined);
      setShowCardEditor(false);
    }
  }, [cards, editingCard]);

  // Reset menu state when cards data changes (e.g., after deletion)
  useEffect(() => {
    setShowMenu(false);
  }, [cards]);

  // Make list sortable (for list reordering)
  const {
    attributes: sortableAttributes,
    listeners: sortableListeners,
    setNodeRef: setSortableNodeRef,
    transform,
    transition,
    isDragging: isListDragging,
  } = useSortable({
    id: list.id,
    data: {
      type: 'list',
      list,
    },
  });

  // Make list droppable (for card drops)
  const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({
    id: list.id,
    data: {
      type: 'list',
      list,
    },
  });

  // Combine refs for both sortable and droppable
  const setNodeRef = (node: HTMLElement | null) => {
    setSortableNodeRef(node);
    setDroppableNodeRef(node);
  };

  // Style for list dragging
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isListDragging ? 0.5 : 1,
  };

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

  function handleOpenListWindow() {
    if (!boardId || !list.id) return;

    // Check if running in Electron with the openListWindow method
    if (
      typeof window !== 'undefined' &&
      (window as any).electronAPI &&
      typeof (window as any).electronAPI.openListWindow === 'function'
    ) {
      (window as any).electronAPI.openListWindow(boardId, list.id);
    } else {
      // Fallback to web browser new tab
      window.open(`/list-standalone?boardId=${boardId}&listId=${list.id}`, '_blank');
    }
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
    <div
      ref={setNodeRef}
      style={style}
      className="flex-shrink-0 w-[280px] sm:w-[300px] bg-ind-panel border-2 border-ind-border flex flex-col max-h-full"
    >
      {/* List Header - Drag Handle */}
      <div
        {...sortableAttributes}
        {...sortableListeners}
        className="border-b-2 border-ind-border p-3 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center justify-between gap-2">
          {/* Collapse Button */}
          <button
            onClick={handleToggleCollapse}
            onPointerDown={(e) => e.stopPropagation()}
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

          {/* Menu Button */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              onPointerDown={(e) => e.stopPropagation()}
              className="p-1 hover:bg-ind-border transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-ind-text-muted" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 bg-ind-panel border-2 border-ind-border shadow-xl z-20 min-w-[180px]">
                  {boardId && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        handleOpenListWindow();
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-ind-text hover:bg-ind-accent/10 transition-colors flex items-center gap-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open in New Window
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDeleteList(list.id);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    Delete List
                  </button>
                </div>
              </>
            )}
          </div>
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
            <SortableContext
              items={sortedCards.map((card) => card.id)}
              strategy={verticalListSortingStrategy}
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
            </SortableContext>

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
          boardLists={boardLists}
          onSave={handleSaveCard}
          onClose={handleCloseEditor}
        />
      )}
    </div>
  );
}

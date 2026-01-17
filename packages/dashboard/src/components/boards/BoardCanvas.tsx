'use client';

/**
 * BoardCanvas Component
 *
 * Main board container displaying lists and cards
 * Horizontal scrolling layout with drag & drop support (Phase 4)
 */

import { useState, useEffect } from 'react';
import { Plus, ExternalLink, X } from 'lucide-react';
import { DndContext, closestCorners, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { Board, BoardCard, BoardCanvasProps, UpdateListRequest, CreateCardRequest, UpdateCardRequest } from '@/types/boards';
import { BoardList } from './BoardList';

export function BoardCanvas({ boardId }: BoardCanvasProps) {
  const [board, setBoard] = useState<Board | null>(null);
  const [cards, setCards] = useState<Record<string, BoardCard[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  // Drag & drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    })
  );

  // Fetch board data
  useEffect(() => {
    if (boardId) {
      fetchBoard();
    }
  }, [boardId]);

  async function fetchBoard() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/boards/${boardId}`);
      const data = await response.json();

      if (data.success) {
        setBoard(data.data.board);
        setCards(data.data.cards);
      } else {
        setError(data.error?.message || 'Failed to load board');
      }
    } catch (err) {
      console.error('Failed to fetch board:', err);
      setError('Failed to load board. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function openCreateListModal() {
    setNewListTitle('');
    setShowCreateListModal(true);
  }

  async function handleCreateList() {
    if (!board || !newListTitle.trim()) return;

    try {
      const response = await fetch(`/api/boards/${boardId}/lists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newListTitle.trim(),
          order: board.lists.length, // Add at the end
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh board data
        fetchBoard();
        setShowCreateListModal(false);
        setNewListTitle('');
      } else {
        setError(data.error?.message || 'Failed to create list');
      }
    } catch (err) {
      console.error('Failed to create list:', err);
      setError('Failed to create list');
    }
  }

  async function handleUpdateList(listId: string, updates: UpdateListRequest) {
    try {
      const response = await fetch(`/api/boards/${boardId}/lists/${listId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success) {
        fetchBoard();
      } else {
        alert(data.error?.message || 'Failed to update list');
      }
    } catch (err) {
      console.error('Failed to update list:', err);
      alert('Failed to update list');
    }
  }

  async function handleDeleteList(listId: string) {
    if (!confirm('Delete this list and all its cards?')) return;

    try {
      const response = await fetch(`/api/boards/${boardId}/lists/${listId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchBoard();
      } else {
        alert(data.error?.message || 'Failed to delete list');
      }
    } catch (err) {
      console.error('Failed to delete list:', err);
      alert('Failed to delete list');
    }
  }

  async function handleCreateCard(request: CreateCardRequest) {
    try {
      const response = await fetch(
        `/api/boards/${boardId}/lists/${request.listId}/cards`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );

      const data = await response.json();

      if (data.success) {
        fetchBoard();
      } else {
        alert(data.error?.message || 'Failed to create card');
      }
    } catch (err) {
      console.error('Failed to create card:', err);
      alert('Failed to create card');
    }
  }

  async function handleUpdateCard(cardId: string, updates: UpdateCardRequest) {
    try {
      // Find which list contains this card
      const listId = Object.keys(cards).find((lid) =>
        cards[lid].some((c) => c.id === cardId)
      );

      if (!listId) {
        alert('Card not found');
        return;
      }

      const response = await fetch(
        `/api/boards/${boardId}/lists/${listId}/cards/${cardId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        }
      );

      const data = await response.json();

      if (data.success) {
        fetchBoard();
      } else {
        alert(data.error?.message || 'Failed to update card');
      }
    } catch (err) {
      console.error('Failed to update card:', err);
      alert('Failed to update card');
    }
  }

  async function handleDeleteCard(cardId: string) {
    try {
      // Find which list contains this card
      const listId = Object.keys(cards).find((lid) =>
        cards[lid].some((c) => c.id === cardId)
      );

      if (!listId) {
        alert('Card not found');
        return;
      }

      const response = await fetch(
        `/api/boards/${boardId}/lists/${listId}/cards/${cardId}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (data.success) {
        fetchBoard();
      } else {
        alert(data.error?.message || 'Failed to delete card');
      }
    } catch (err) {
      console.error('Failed to delete card:', err);
      alert('Failed to delete card');
    }
  }

  /**
   * Open board in new window
   */
  function handleOpenNewWindow() {
    if (!boardId) return;

    // Check if running in Electron with the openBoardWindow method
    if (
      typeof window !== 'undefined' &&
      (window as any).electronAPI &&
      typeof (window as any).electronAPI.openBoardWindow === 'function'
    ) {
      (window as any).electronAPI.openBoardWindow(boardId);
    } else {
      // Fallback to web browser new tab
      window.open(`/boards-standalone?boardId=${boardId}`, '_blank');
    }
  }

  /**
   * Handle drag end event
   * Moves cards between lists
   */
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Check if dragging a card
    if (activeData?.type !== 'card') return;

    const draggedCard = activeData.card as BoardCard;
    const targetListId = overData?.type === 'list' ? over.id as string : null;

    if (!targetListId) return;

    // Check if card is being moved to a different list
    if (draggedCard.listId === targetListId) return;

    // Update card's listId via API
    try {
      await handleUpdateCard(draggedCard.id, {
        listId: targetListId,
      });
    } catch (err) {
      console.error('Failed to move card:', err);
      alert('Failed to move card');
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-ind-accent border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-sm text-ind-text-muted">Loading board...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <p className="text-sm text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchBoard}
            className="px-4 py-2 text-sm font-medium bg-ind-accent hover:bg-ind-accent-hover text-black transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No board state
  if (!board) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-ind-text-muted">No board selected</p>
      </div>
    );
  }

  // Sort lists by order
  const sortedLists = [...board.lists].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col h-full">
      {/* Board Header */}
      <div className="border-b-2 border-ind-border p-3 md:p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-2xl font-bold text-ind-text truncate">{board.name}</h1>
            {(board.projectId || board.linkedPath) && (
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {board.projectId && (
                  <span className="text-xs bg-ind-accent/10 text-ind-accent px-2 py-0.5 truncate">
                    Project: {board.projectId}
                  </span>
                )}
                {board.linkedPath && (
                  <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 truncate max-w-[200px]">
                    {board.linkedPath}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-xs md:text-sm text-ind-text-muted">
              {board.lists.length} <span className="hidden sm:inline">lists</span>
            </div>
            <button
              onClick={handleOpenNewWindow}
              className="px-2 md:px-3 py-1.5 text-xs font-medium bg-ind-border hover:bg-ind-accent hover:text-black text-ind-text transition-colors flex items-center gap-1.5"
              title="Open in New Window"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Window</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lists Container - Horizontal Scrolling */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 p-4 h-full">
            {/* Render Lists using BoardList component */}
            {sortedLists.map((list) => {
              const listCards = cards[list.id] || [];

              return (
                <BoardList
                  key={list.id}
                  boardId={boardId}
                  list={list}
                  cards={listCards}
                  onUpdateList={handleUpdateList}
                  onDeleteList={handleDeleteList}
                  onCreateCard={handleCreateCard}
                  onUpdateCard={handleUpdateCard}
                  onDeleteCard={handleDeleteCard}
                />
              );
            })}

            {/* Add List Button */}
            <div className="flex-shrink-0 w-[300px]">
              <button
                onClick={openCreateListModal}
                className="w-full h-full min-h-[100px] bg-ind-panel/50 border-2 border-dashed border-ind-border hover:border-ind-accent hover:bg-ind-panel transition-colors flex flex-col items-center justify-center gap-2"
              >
                <Plus className="w-6 h-6 text-ind-accent" />
                <span className="text-sm font-medium text-ind-accent">Add List</span>
              </button>
            </div>
          </div>
        </DndContext>
      </div>

      {/* Create List Modal */}
      {showCreateListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
          <div className="bg-ind-panel border-2 border-ind-border shadow-xl max-w-md w-full">
            <div className="border-b-2 border-ind-border p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ind-text">Create New List</h3>
              <button
                onClick={() => setShowCreateListModal(false)}
                className="p-1 hover:bg-ind-border transition-colors"
              >
                <X className="w-5 h-5 text-ind-text-muted" />
              </button>
            </div>
            <div className="p-4">
              <label htmlFor="list-title" className="block text-sm font-medium text-ind-text mb-2">
                List Title
              </label>
              <input
                id="list-title"
                type="text"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newListTitle.trim()) {
                    handleCreateList();
                  }
                }}
                placeholder="Enter list title..."
                autoFocus
                className="w-full px-3 py-2 bg-ind-bg border-2 border-ind-border text-ind-text placeholder:text-ind-text-muted focus:border-ind-accent outline-none transition-colors"
              />
            </div>
            <div className="border-t-2 border-ind-border p-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowCreateListModal(false)}
                className="px-4 py-2 text-sm font-medium text-ind-text-muted hover:bg-ind-border transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateList}
                disabled={!newListTitle.trim()}
                className="px-6 py-2 text-sm font-medium bg-ind-accent hover:bg-ind-accent-hover text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

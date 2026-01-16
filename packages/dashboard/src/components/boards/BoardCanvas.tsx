'use client';

/**
 * BoardCanvas Component
 *
 * Main board container displaying lists and cards
 * Horizontal scrolling layout with drag & drop support (Phase 4)
 */

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import type { Board, BoardCard, BoardCanvasProps, UpdateListRequest, CreateCardRequest, UpdateCardRequest } from '@/types/boards';
import { BoardList } from './BoardList';

export function BoardCanvas({ boardId }: BoardCanvasProps) {
  const [board, setBoard] = useState<Board | null>(null);
  const [cards, setCards] = useState<Record<string, BoardCard[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  async function handleCreateList() {
    if (!board) return;

    const title = prompt('Enter list title:');
    if (!title || !title.trim()) return;

    try {
      const response = await fetch(`/api/boards/${boardId}/lists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          order: board.lists.length, // Add at the end
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh board data
        fetchBoard();
      } else {
        alert(data.error?.message || 'Failed to create list');
      }
    } catch (err) {
      console.error('Failed to create list:', err);
      alert('Failed to create list');
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
      <div className="border-b-2 border-ind-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ind-text">{board.name}</h1>
            {(board.projectId || board.linkedPath) && (
              <div className="flex items-center gap-2 mt-1">
                {board.projectId && (
                  <span className="text-xs bg-ind-accent/10 text-ind-accent px-2 py-0.5">
                    Project: {board.projectId}
                  </span>
                )}
                {board.linkedPath && (
                  <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5">
                    {board.linkedPath}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="text-sm text-ind-text-muted">
            {board.lists.length} lists
          </div>
        </div>
      </div>

      {/* Lists Container - Horizontal Scrolling */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 p-4 h-full">
          {/* Render Lists using BoardList component */}
          {sortedLists.map((list) => {
            const listCards = cards[list.id] || [];

            return (
              <BoardList
                key={list.id}
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
              onClick={handleCreateList}
              className="w-full h-full min-h-[100px] bg-ind-panel/50 border-2 border-dashed border-ind-border hover:border-ind-accent hover:bg-ind-panel transition-colors flex flex-col items-center justify-center gap-2"
            >
              <Plus className="w-6 h-6 text-ind-accent" />
              <span className="text-sm font-medium text-ind-accent">Add List</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

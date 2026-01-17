'use client';

/**
 * List Standalone Page
 *
 * Renders a single board list in isolation without dashboard layout (no sidebar, no header)
 * Used for focus mode and multi-monitor workflows
 * Path: /list-standalone?boardId=X&listId=Y
 *
 * Note: This route is recognized by RootClientWrapper as a standalone route
 * and will not have the global layout applied.
 *
 * Wrapped in Suspense to prevent hydration flash from useSearchParams() hook
 */

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BoardList } from '@/components/boards/BoardList';
import type { Board, BoardCard, BoardList as BoardListType, UpdateListRequest, CreateCardRequest, UpdateCardRequest } from '@/types/boards';

function ListStandaloneContent() {
  const searchParams = useSearchParams();
  const boardId = searchParams.get('boardId');
  const listId = searchParams.get('listId');

  const [board, setBoard] = useState<Board | null>(null);
  const [list, setList] = useState<BoardListType | null>(null);
  const [cards, setCards] = useState<BoardCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch board and filter for this list
  useEffect(() => {
    if (boardId && listId) {
      fetchBoardAndList();
    }
  }, [boardId, listId]);

  async function fetchBoardAndList() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/boards/${boardId}`);
      const data = await response.json();

      if (data.success) {
        const boardData = data.data.board;
        const cardsData = data.data.cards;

        setBoard(boardData);

        // Find the specific list
        const targetList = boardData.lists.find((l: BoardListType) => l.id === listId);
        if (!targetList) {
          setError(`List with ID '${listId}' not found`);
          setLoading(false);
          return;
        }

        setList(targetList);
        setCards(cardsData[listId] || []);
      } else {
        setError(data.error?.message || 'Failed to load list');
      }
    } catch (err) {
      console.error('Failed to fetch list:', err);
      setError('Failed to load list. Please try again.');
    } finally {
      setLoading(false);
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
        fetchBoardAndList();
      } else {
        alert(data.error?.message || 'Failed to update list');
      }
    } catch (err) {
      console.error('Failed to update list:', err);
      alert('Failed to update list');
    }
  }

  async function handleDeleteList(listId: string) {
    if (!confirm('Delete this list and all its cards? This will close the window.')) return;

    try {
      const response = await fetch(`/api/boards/${boardId}/lists/${listId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Close window after successful deletion
        window.close();
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
        fetchBoardAndList();
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
        fetchBoardAndList();
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
      const response = await fetch(
        `/api/boards/${boardId}/lists/${listId}/cards/${cardId}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (data.success) {
        fetchBoardAndList();
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
      <div className="h-screen w-full flex items-center justify-center bg-ind-bg">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-ind-accent border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-sm text-ind-text-muted">Loading list...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-ind-bg">
        <div className="text-center max-w-md">
          <p className="text-sm text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchBoardAndList}
            className="px-4 py-2 text-sm font-medium bg-ind-accent hover:bg-ind-accent-hover text-black transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No list state
  if (!list) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-ind-bg">
        <p className="text-sm text-ind-text-muted">No list selected</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-ind-bg">
      {/* List Header with Breadcrumb */}
      <div className="border-b-2 border-ind-border p-3 bg-ind-panel flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-ind-text-muted">
            {board?.name}
          </span>
          <span className="text-sm text-ind-text-muted">›</span>
          <h1 className="text-lg font-semibold text-ind-text">{list.title}</h1>
        </div>
      </div>

      {/* Full-Height List */}
      <div className="flex-1 overflow-hidden flex justify-center p-4">
        <BoardList
          boardLists={board?.lists}
          list={list}
          cards={cards}
          onUpdateList={handleUpdateList}
          onDeleteList={handleDeleteList}
          onCreateCard={handleCreateCard}
          onUpdateCard={handleUpdateCard}
          onDeleteCard={handleDeleteCard}
        />
      </div>
    </div>
  );
}

export default function ListStandalonePage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center bg-ind-bg">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-ind-accent border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-sm text-ind-text-muted">Loading list...</p>
          </div>
        </div>
      }
    >
      <ListStandaloneContent />
    </Suspense>
  );
}

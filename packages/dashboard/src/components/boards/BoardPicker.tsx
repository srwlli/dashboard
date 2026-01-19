'use client';

/**
 * BoardPicker Component
 *
 * Dropdown selector for choosing or creating boards
 * Fetches available boards from GET /api/boards
 * Shows board metadata and provides "Create New Board" option
 */

import { useState, useEffect } from 'react';
import { Plus, ChevronDown, Folder, Link as LinkIcon } from 'lucide-react';
import type { BoardPickerProps } from '@/types/boards';
import { BoardCreationModal } from './BoardCreationModal';

interface BoardMetadata {
  id: string;
  name: string;
  projectId?: string;
  linkedPath?: string;
  listCount: number;
  cardCount: number;
  createdAt: string;
  updatedAt: string;
}

export function BoardPicker({ onSelectBoard, selectedBoardId }: BoardPickerProps) {
  const [boards, setBoards] = useState<BoardMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch boards on mount
  useEffect(() => {
    fetchBoards();
  }, []);

  async function fetchBoards() {
    try {
      setLoading(true);
      const response = await fetch('/api/boards');
      const data = await response.json();

      if (data.success) {
        setBoards(data.data.boards);
      }
    } catch (error) {
      console.error('Failed to fetch boards:', error);
    } finally {
      setLoading(false);
    }
  }

  const selectedBoard = boards.find((b) => b.id === selectedBoardId);

  function handleSelectBoard(boardId: string) {
    onSelectBoard(boardId);
    setIsOpen(false);
  }

  function handleCreateNew() {
    setIsOpen(false);
    setShowCreateModal(true);
  }

  return (
    <div className="relative">
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 bg-ind-panel border-2 border-ind-border hover:border-ind-accent transition-colors w-full md:w-auto min-w-[300px]"
      >
        <Folder className="w-4 h-4 text-ind-accent" />
        <div className="flex-1 text-left">
          {loading ? (
            <span className="text-sm text-ind-text-muted">Loading boards...</span>
          ) : selectedBoard ? (
            <>
              <div className="text-sm font-medium text-ind-text">
                {selectedBoard.name}
              </div>
              <div className="text-xs text-ind-text-muted">
                {selectedBoard.listCount} lists · {selectedBoard.cardCount} cards
              </div>
            </>
          ) : (
            <span className="text-sm text-ind-text-muted">Select a board...</span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-ind-text-muted transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1 bg-ind-panel border-2 border-ind-border shadow-xl z-50 max-h-[400px] overflow-y-auto">
          {/* Board List */}
          {boards.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-ind-text-muted">No boards found</p>
              <p className="text-xs text-ind-text-muted mt-1">
                Create your first board to get started
              </p>
            </div>
          ) : (
            <div className="divide-y divide-ind-border">
              {boards.map((board) => (
                <button
                  key={board.id}
                  onClick={() => handleSelectBoard(board.id)}
                  className={`w-full px-4 py-3 text-left hover:bg-ind-border transition-colors ${
                    selectedBoardId === board.id ? 'bg-ind-accent/10' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-ind-text truncate">
                        {board.name}
                      </div>
                      <div className="text-xs text-ind-text-muted mt-0.5">
                        {board.listCount} lists · {board.cardCount} cards
                      </div>
                      {(board.projectId || board.linkedPath) && (
                        <div className="flex items-center gap-2 mt-1">
                          {board.projectId && (
                            <span className="inline-flex items-center gap-1 text-xs bg-ind-accent/10 text-ind-accent px-2 py-0.5">
                              <Folder className="w-3 h-3" />
                              Project
                            </span>
                          )}
                          {board.linkedPath && (
                            <span className="inline-flex items-center gap-1 text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5">
                              <LinkIcon className="w-3 h-3" />
                              Linked
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Create New Board Button */}
          <button
            onClick={handleCreateNew}
            className="w-full px-4 py-3 text-left border-t-2 border-ind-border hover:bg-ind-accent hover:text-black transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-ind-accent group-hover:text-black" />
              <span className="text-sm font-medium text-ind-accent group-hover:text-black">
                Create New Board
              </span>
            </div>
          </button>
        </div>
        </>
      )}

      {/* Create Board Modal */}
      <BoardCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onBoardCreated={(boardId) => {
          fetchBoards(); // Refresh board list
          onSelectBoard(boardId); // Auto-select newly created board
        }}
      />
    </div>
  );
}

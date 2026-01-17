'use client';

import { useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { BoardPicker } from '@/components/boards/BoardPicker';
import { BoardCanvas } from '@/components/boards/BoardCanvas';

/**
 * Assistant Route - Project Boards
 * Trello-like board interface for managing projects
 */
export default function AssistantPage() {
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');

  return (
    <PageLayout>
      <div className="flex flex-col h-full">
        {/* Header with Board Picker */}
        <div className="border-b-2 border-ind-border p-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-ind-text">Project Boards</h1>
              <p className="text-sm text-ind-text-muted mt-1">
                Manage tasks across projects with boards, lists, and cards
              </p>
            </div>
          </div>
          <BoardPicker
            onSelectBoard={setSelectedBoardId}
            selectedBoardId={selectedBoardId}
          />
        </div>

        {/* Board Canvas */}
        <div className="flex-1 overflow-hidden">
          {selectedBoardId ? (
            <BoardCanvas boardId={selectedBoardId} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-ind-text-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                  />
                </svg>
                <h2 className="text-lg font-semibold text-ind-text mb-2">
                  Select a Board
                </h2>
                <p className="text-sm text-ind-text-muted">
                  Choose a board from the dropdown above or create a new one to get started
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

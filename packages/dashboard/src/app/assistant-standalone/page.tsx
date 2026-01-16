'use client';

/**
 * Standalone Assistant/Boards Page
 *
 * Renders board interface without dashboard layout (no sidebar, no header)
 * Used for Electron "New Window" functionality
 * Path: /assistant-standalone?boardId=<id>
 *
 * Note: This route is recognized by RootClientWrapper as a standalone route
 * and will not have the global layout applied.
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { BoardCanvas } from '@/components/boards/BoardCanvas';
import { BoardPicker } from '@/components/boards/BoardPicker';

export default function AssistantStandalonePage() {
  const searchParams = useSearchParams();
  const initialBoardId = searchParams.get('boardId') || '';
  const [selectedBoardId, setSelectedBoardId] = useState<string>(initialBoardId);

  // Update selected board if URL changes
  useEffect(() => {
    const boardIdFromUrl = searchParams.get('boardId');
    if (boardIdFromUrl) {
      setSelectedBoardId(boardIdFromUrl);
    }
  }, [searchParams]);

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-ind-bg">
      {/* Minimal Header with BoardPicker */}
      <div className="border-b-2 border-ind-border p-3 bg-ind-panel flex-shrink-0">
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
                Choose a board from the dropdown above to get started
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

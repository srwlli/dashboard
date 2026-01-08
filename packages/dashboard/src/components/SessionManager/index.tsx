'use client';

import { useState } from 'react';

/**
 * SessionManager
 * Full-width card for managing active sessions with context, agents, and tasks
 * Uses prompt card styling pattern
 */
export default function SessionManager() {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="w-full">
      <h3 className="text-sm uppercase tracking-widest text-ind-text-muted font-mono mb-4 font-bold">
        Session Manager
      </h3>
      <p className="text-ind-text-muted text-xs font-mono mb-4">
        Coordinate sessions with context, agents, and tasks
      </p>

      {/* Full-width session card */}
      <div
        role="button"
        tabIndex={0}
        className={`p-4 border-2 transition-all cursor-pointer text-left ${
          isActive
            ? 'border-ind-accent bg-ind-panel shadow-lg shadow-ind-accent/20'
            : 'border-ind-border bg-ind-panel hover:border-ind-accent'
        }`}
        onClick={() => setIsActive(!isActive)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsActive(!isActive);
          }
        }}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-sm font-bold text-ind-text">Active Session</h4>
          <span className="bg-ind-accent text-black px-2 py-1 text-xs font-bold whitespace-nowrap">
            READY
          </span>
        </div>
        <p className="text-xs text-ind-text-muted mb-3">
          Session coordination interface for managing context, agents, and tasks. Click to activate.
        </p>

        <div className="flex justify-between text-xs text-ind-text-muted">
          <span>Session ID: session_001</span>
          <span className="text-ind-accent font-bold">Status: {isActive ? 'Active' : 'Idle'}</span>
        </div>
      </div>

      {/* Status indicator */}
      <div className="mt-4 px-4 py-3 bg-ind-bg border border-ind-border border-dashed rounded">
        <p className="text-xs text-ind-text m-0">
          Current Session: <strong className="text-ind-accent">
            {isActive ? 'ACTIVE' : 'NONE'}
          </strong>
        </p>
      </div>
    </div>
  );
}

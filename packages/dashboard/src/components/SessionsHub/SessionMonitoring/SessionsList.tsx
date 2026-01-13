'use client';

/**
 * SessionsList Component
 *
 * Displays all active sessions in a list/grid view with:
 * - Real-time status updates via SWR polling
 * - Status badges (not_started, in_progress, complete)
 * - Progress indicators (X/Y agents complete)
 * - Search/filter functionality
 * - Click to navigate to session details
 */

import React, { useState } from 'react';
import { Search, Clock, Zap, CheckCircle } from 'lucide-react';
import type { Session } from '@/lib/api/sessions';

interface SessionsListProps {
  sessions: Session[];
  onSessionClick?: (featureName: string) => void;
  className?: string;
}

/**
 * Get status icon component based on session status
 */
function getStatusIcon(status: Session['status']) {
  switch (status) {
    case 'not_started':
      return <Clock className="w-4 h-4" />;
    case 'in_progress':
      return <Zap className="w-4 h-4" />;
    case 'complete':
      return <CheckCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
}

/**
 * Get status color classes based on session status
 */
function getStatusColor(status: Session['status']) {
  switch (status) {
    case 'not_started':
      return 'text-ind-text-muted';
    case 'in_progress':
      return 'text-ind-accent';
    case 'complete':
      return 'text-ind-success';
    default:
      return 'text-ind-text-muted';
  }
}

/**
 * Get status badge background color
 */
function getStatusBgColor(status: Session['status']) {
  switch (status) {
    case 'not_started':
      return 'bg-ind-text-muted/10';
    case 'in_progress':
      return 'bg-ind-accent/10';
    case 'complete':
      return 'bg-ind-success/10';
    default:
      return 'bg-ind-bg/30';
  }
}

/**
 * Get status label text
 */
function getStatusLabel(status: Session['status']) {
  switch (status) {
    case 'not_started':
      return 'Not Started';
    case 'in_progress':
      return 'In Progress';
    case 'complete':
      return 'Complete';
    default:
      return 'Unknown';
  }
}

type TabType = 'active' | 'completed';

export default function SessionsList({
  sessions,
  onSessionClick,
  className = ''
}: SessionsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('active');

  // Filter by tab: active (not_started + in_progress) or completed
  const tabFilteredSessions = sessions.filter(session => {
    if (activeTab === 'active') {
      return session.status === 'not_started' || session.status === 'in_progress';
    } else {
      return session.status === 'complete';
    }
  });

  // Filter sessions based on search query
  const filteredSessions = tabFilteredSessions.filter(session => {
    const query = searchQuery.toLowerCase();
    return (
      session.workorder_id.toLowerCase().includes(query) ||
      session.feature_name.toLowerCase().includes(query) ||
      session.description.toLowerCase().includes(query)
    );
  });

  // Count sessions by tab
  const activeSessions = sessions.filter(s => s.status === 'not_started' || s.status === 'in_progress');
  const completedSessions = sessions.filter(s => s.status === 'complete');

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header with Search and Tabs */}
      <div className="p-4 border-b border-ind-border">
        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ind-text-muted" />
          <input
            type="text"
            placeholder="Search by workorder ID or feature name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-ind-panel border border-ind-border rounded-md text-sm text-ind-text placeholder:text-ind-text-muted focus:outline-none focus:ring-2 focus:ring-ind-accent"
          />
        </div>

        {/* Active | Completed Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`
              flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${activeTab === 'active'
                ? 'bg-ind-accent text-white'
                : 'bg-ind-panel text-ind-text-muted border border-ind-border hover:border-ind-accent hover:text-ind-text'
              }
            `}
          >
            Active ({activeSessions.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`
              flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${activeTab === 'completed'
                ? 'bg-ind-accent text-white'
                : 'bg-ind-panel text-ind-text-muted border border-ind-border hover:border-ind-accent hover:text-ind-text'
              }
            `}
          >
            Completed ({completedSessions.length})
          </button>
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12 text-ind-text-muted">
            {searchQuery ? (
              <>
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No sessions match your search</p>
              </>
            ) : (
              <>
                {activeTab === 'active' ? (
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                ) : (
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                )}
                <p>No {activeTab} sessions found</p>
              </>
            )}
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div
              key={session.feature_name}
              onClick={() => onSessionClick?.(session.feature_name)}
              className={`
                p-4 rounded-lg border border-ind-border bg-ind-panel
                transition-all duration-200
                ${onSessionClick ? 'cursor-pointer hover:border-ind-accent hover:shadow-md' : ''}
              `}
            >
              {/* Status Badge */}
              <div className="flex items-center gap-2 mb-2">
                <div className={`
                  flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium
                  ${getStatusBgColor(session.status)} ${getStatusColor(session.status)}
                `}>
                  {getStatusIcon(session.status)}
                  <span>{getStatusLabel(session.status)}</span>
                </div>
              </div>

              {/* Workorder ID */}
              <div className="text-sm font-semibold text-ind-text mb-1">
                {session.workorder_id}
              </div>

              {/* Feature Name */}
              <div className="text-sm text-ind-text-muted mb-2">
                {session.feature_name}
              </div>

              {/* Description */}
              {session.description && (
                <div className="text-xs text-ind-text-muted mb-3 line-clamp-2">
                  {session.description}
                </div>
              )}

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs text-ind-text-muted mb-1">
                  <span>Agents: {session.completed_agents}/{session.total_agents} complete</span>
                  <span>{session.total_agents > 0 ? Math.round((session.completed_agents / session.total_agents) * 100) : 0}%</span>
                </div>
                <div className="h-1.5 bg-ind-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-ind-accent transition-all duration-300"
                    style={{
                      width: `${session.total_agents > 0 ? (session.completed_agents / session.total_agents) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              {/* Created Date */}
              <div className="text-xs text-ind-text-muted">
                Created: {session.created}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

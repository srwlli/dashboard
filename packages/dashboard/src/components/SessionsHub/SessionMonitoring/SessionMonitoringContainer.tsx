'use client';

/**
 * SessionMonitoringContainer
 *
 * Container component that integrates:
 * - SessionsList with SWR polling
 * - SessionDetail with SWR polling
 * - OutputViewer modal
 * - Real-time updates every 10 seconds
 */

import React, { useState } from 'react';
import useSWR from 'swr';
import SessionsList from './SessionsList';
import SessionDetail from './SessionDetail';
import OutputViewer from './OutputViewer';
import type { Session, SessionDetail as SessionDetailType } from '@/lib/api/sessions';

interface SessionMonitoringContainerProps {
  className?: string;
}

/**
 * SWR fetcher for API calls
 */
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function SessionMonitoringContainer({
  className = ''
}: SessionMonitoringContainerProps) {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [outputViewerState, setOutputViewerState] = useState<{
    isOpen: boolean;
    agentId: string | null;
    featureName: string | null;
  }>({
    isOpen: false,
    agentId: null,
    featureName: null
  });

  // Fetch all sessions with SWR (10-second polling)
  const {
    data: sessionsData,
    error: sessionsError,
    mutate: mutateSessions
  } = useSWR<{ sessions: Session[]; count: number }>(
    '/api/sessions',
    fetcher,
    {
      refreshInterval: 10000, // Poll every 10 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true
    }
  );

  // Fetch selected session details with SWR (10-second polling)
  const {
    data: sessionDetailData,
    error: sessionDetailError,
    mutate: mutateSessionDetail,
    isValidating: isRefreshingSessionDetail
  } = useSWR<{ session: SessionDetailType }>(
    selectedSessionId ? `/api/sessions?id=${selectedSessionId}` : null,
    fetcher,
    {
      refreshInterval: 10000, // Poll every 10 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true
    }
  );

  // Fetch agent output when viewer is open
  const {
    data: outputData,
    error: outputError,
    isLoading: outputLoading
  } = useSWR<{ content: string; feature: string; agent: string }>(
    outputViewerState.isOpen && outputViewerState.featureName && outputViewerState.agentId
      ? `/api/sessions/output?feature=${outputViewerState.featureName}&agent=${outputViewerState.agentId}`
      : null,
    fetcher
  );

  const handleSessionClick = (featureName: string) => {
    setSelectedSessionId(featureName);
  };

  const handleBackToList = () => {
    setSelectedSessionId(null);
  };

  const handleViewOutput = (agentId: string) => {
    if (selectedSessionId) {
      setOutputViewerState({
        isOpen: true,
        agentId,
        featureName: selectedSessionId
      });
    }
  };

  const handleCloseOutputViewer = () => {
    setOutputViewerState({
      isOpen: false,
      agentId: null,
      featureName: null
    });
  };

  const handleRefreshSessionDetail = () => {
    mutateSessionDetail();
  };

  // Loading state
  const isLoadingSessions = !sessionsData && !sessionsError;

  // Error state
  if (sessionsError) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <p className="text-ind-error mb-2">Failed to load sessions</p>
          <button
            onClick={() => mutateSessions()}
            className="px-4 py-2 bg-ind-accent text-white rounded-md hover:bg-ind-accent/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-full ${className}`}>
      {/* Sessions List (30% width on desktop, full width on mobile) */}
      <div className={`
        ${selectedSessionId ? 'hidden md:block' : 'block'}
        md:w-[30%] w-full border-r border-ind-border
      `}>
        <SessionsList
          sessions={sessionsData?.sessions || []}
          onSessionClick={handleSessionClick}
        />
      </div>

      {/* Session Detail (70% width on desktop, full width on mobile) */}
      {selectedSessionId && (
        <div className={`
          ${selectedSessionId ? 'block' : 'hidden'}
          md:w-[70%] w-full
        `}>
          {isLoadingSessions || !sessionDetailData ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-ind-text-muted">Loading session details...</div>
            </div>
          ) : sessionDetailError ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <p className="text-ind-error">Failed to load session details</p>
              <button
                onClick={handleBackToList}
                className="px-4 py-2 bg-ind-panel border border-ind-border rounded-md hover:border-ind-accent transition-colors"
              >
                Back to List
              </button>
            </div>
          ) : (
            <>
              {/* Back button for mobile */}
              <div className="md:hidden p-4 border-b border-ind-border">
                <button
                  onClick={handleBackToList}
                  className="text-sm text-ind-accent hover:underline"
                >
                  ← Back to sessions
                </button>
              </div>

              <SessionDetail
                session={sessionDetailData.session}
                onRefresh={handleRefreshSessionDetail}
                onViewOutput={handleViewOutput}
                isRefreshing={isRefreshingSessionDetail}
              />
            </>
          )}
        </div>
      )}

      {/* Empty state when no session selected */}
      {!selectedSessionId && (
        <div className="hidden md:flex md:w-[70%] items-center justify-center text-ind-text-muted">
          <div className="text-center">
            <p className="text-lg mb-2">Select a session to view details</p>
            <p className="text-sm">Click on any session from the list to get started</p>
          </div>
        </div>
      )}

      {/* Output Viewer Modal */}
      <OutputViewer
        isOpen={outputViewerState.isOpen}
        onClose={handleCloseOutputViewer}
        agentId={outputViewerState.agentId || ''}
        content={outputData?.content || null}
        isLoading={outputLoading}
      />
    </div>
  );
}

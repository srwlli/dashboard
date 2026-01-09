'use client';

import { useState, useEffect, useRef } from 'react';

type TabType = 'console' | 'history' | 'config';

/**
 * ConsoleTabs Component
 * Right sidebar - Console/History/Config tabs
 * Shows terminal-style output and configuration
 */
interface ConsoleTabsProps {
  scanId: string | null;
}

export function ConsoleTabs({ scanId }: ConsoleTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('console');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [scanStatus, setScanStatus] = useState<string>('Idle');
  const consoleRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryCountRef = useRef<number>(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Connect to SSE stream when scanId changes (with retry logic)
  useEffect(() => {
    if (!scanId) {
      setConsoleOutput([]);
      setScanStatus('Idle');
      retryCountRef.current = 0;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      return;
    }

    // Exponential backoff delays: 0ms, 100ms, 300ms, 500ms
    const retryDelays = [0, 100, 300, 500];
    const maxRetries = 3;

    const connectToSSE = () => {
      const retryCount = retryCountRef.current;
      const timestamp = new Date().toISOString();

      console.log(`[ConsoleTabs] [${timestamp}] Connecting to SSE for scanId: ${scanId} (attempt ${retryCount + 1}/${maxRetries + 1})`);

      if (retryCount === 0) {
        setScanStatus('Connecting...');
      } else {
        setScanStatus(`Retrying... (${retryCount}/${maxRetries})`);
      }

      // Create EventSource for SSE
      const eventSource = new EventSource(`/api/scanner/scan/${scanId}/output`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log(`[ConsoleTabs] SSE connection opened for scanId: ${scanId}`);
        setScanStatus('Running');
        retryCountRef.current = 0; // Reset retry count on successful connection
      };

      eventSource.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === 'output') {
            setConsoleOutput((prev) => [...prev, message.data]);
          } else if (message.type === 'progress') {
            const progress = message.data;
            setScanStatus(
              `Scanning ${progress.currentProjectIndex + 1}/${progress.totalProjects}`
            );
          } else if (message.type === 'complete') {
            setScanStatus('Completed');
            eventSource.close();
          } else if (message.type === 'error') {
            setConsoleOutput((prev) => [...prev, `[ERROR] ${message.data}`]);
            setScanStatus('Error');
            eventSource.close();
          }
        } catch (error) {
          console.error('[ConsoleTabs] Failed to parse SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error(`[ConsoleTabs] SSE error for scanId: ${scanId}`, error);
        eventSource.close();

        // Retry logic for 404 or connection errors
        if (retryCount < maxRetries) {
          const delay = retryDelays[retryCount];
          console.log(`[ConsoleTabs] Retrying SSE connection in ${delay}ms...`);

          retryCountRef.current = retryCount + 1;
          retryTimeoutRef.current = setTimeout(() => {
            connectToSSE();
          }, delay);
        } else {
          console.error(`[ConsoleTabs] Max retries (${maxRetries}) reached for scanId: ${scanId}`);
          setScanStatus('Connection Failed');
          setConsoleOutput((prev) => [
            ...prev,
            `[ERROR] Failed to connect to scan stream after ${maxRetries} retries`,
            `[ERROR] Scan may not be registered. Check server logs.`
          ]);
        }
      };
    };

    // Initial connection attempt
    connectToSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      retryCountRef.current = 0;
    };
  }, [scanId]);

  // Auto-scroll console to bottom
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleOutput]);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'console', label: 'Console' },
    { id: 'history', label: 'History' },
    { id: 'config', label: 'Config' },
  ];

  return (
    <div className="bg-ind-panel border-2 border-ind-border h-full flex flex-col">
      {/* Tab Headers */}
      <div className="border-b-2 border-ind-border flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-4 py-3 text-sm font-medium transition-colors relative
              ${
                activeTab === tab.id
                  ? 'text-ind-accent border-b-2 border-ind-accent'
                  : 'text-ind-text-muted hover:text-ind-text'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'console' && (
          <div
            ref={consoleRef}
            className="p-4 font-mono text-sm bg-ind-bg h-full overflow-y-auto"
          >
            {consoleOutput.length === 0 ? (
              <>
                <div className="text-green-400">{'>'} System Initialized</div>
                <div className="text-blue-400 mt-2">
                  {'>'} Ready for scan. Waiting for project selection...
                </div>
                <div className="text-ind-text-muted mt-2">
                  {'>'} Tip: Select one or more projects from the left panel
                </div>
              </>
            ) : (
              consoleOutput.map((line, index) => (
                <div
                  key={index}
                  className={
                    line.includes('[ERROR]')
                      ? 'text-red-400'
                      : line.includes('[Scanner]') || line.includes('[Intelligence]')
                      ? 'text-green-400'
                      : 'text-ind-text'
                  }
                >
                  {line}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center px-4">
            <div className="w-16 h-16 bg-ind-bg border-2 border-ind-border flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-ind-text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-ind-text mb-2">
              No Scan History
            </h3>
            <p className="text-sm text-ind-text-muted max-w-sm">
              Your scan history will appear here after running scans
            </p>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="p-4 font-mono text-sm bg-ind-bg h-full overflow-y-auto">
            <div className="text-ind-text">
              <div className="mb-4">
                <div className="text-ind-accent font-semibold mb-2">
                  Scanner Configuration
                </div>
                <div className="mb-2">
                  <span className="text-ind-text-muted">Engine:</span>{' '}
                  @coderef/core (in-process)
                </div>
                <div className="mb-2">
                  <span className="text-ind-text-muted">Languages:</span> ts, tsx,
                  js, jsx
                </div>
                <div className="mb-2">
                  <span className="text-ind-text-muted">Recursive:</span> true
                </div>
                <div className="mb-2">
                  <span className="text-ind-text-muted">Exclude:</span> node_modules,
                  .git, dist, build, .next
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Status */}
      <div className="border-t-2 border-ind-border px-4 py-2 bg-ind-bg">
        <div className="flex items-center justify-between text-xs">
          <span className="text-ind-text-muted">
            Status:{' '}
            <span
              className={`font-medium ${
                scanStatus === 'Running' || scanStatus.includes('Scanning')
                  ? 'text-blue-500'
                  : scanStatus === 'Completed'
                  ? 'text-green-500'
                  : scanStatus === 'Error'
                  ? 'text-red-500'
                  : 'text-green-500'
              }`}
            >
              {scanStatus}
            </span>
          </span>
          <span className="text-ind-text-muted">v1.0.0</span>
        </div>
      </div>
    </div>
  );
}

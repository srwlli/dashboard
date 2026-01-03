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

  // Connect to SSE stream when scanId changes
  useEffect(() => {
    if (!scanId) {
      setConsoleOutput([]);
      setScanStatus('Idle');
      return;
    }

    setScanStatus('Connecting...');

    // Create EventSource for SSE
    const eventSource = new EventSource(`/api/scanner/scan/${scanId}/output`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setScanStatus('Running');
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
        console.error('Failed to parse SSE message:', error);
      }
    };

    eventSource.onerror = () => {
      setScanStatus('Error');
      eventSource.close();
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
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
                      : line.includes('[Scanner]')
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
              <div className="mb-2">
                <span className="text-ind-text-muted">Mode:</span> Universal
                Structure
              </div>
              <div className="mb-2">
                <span className="text-ind-text-muted">Filters:</span> *.js, *.ts,
                *.py
              </div>
              <div className="mb-2">
                <span className="text-ind-text-muted">Exclude:</span> node_modules,
                .git
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

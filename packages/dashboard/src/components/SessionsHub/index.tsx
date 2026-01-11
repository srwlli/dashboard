'use client';

/**
 * SessionsHub - Main Container Component
 *
 * Integrates SessionCreation (Agent 1) and SessionMonitoring (Agent 2) systems
 * with tab navigation for Create | Monitor modes.
 *
 * Sprint 6: Integration Phase
 * Workorder: WO-SESSIONS-HUB-002-INTEGRATION
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SessionCreation } from './SessionCreation';
import { SessionMonitoringContainer } from './SessionMonitoring';

type TabType = 'create' | 'monitor';

export function SessionsHub() {
  const searchParams = useSearchParams();

  // Initialize tab from URL param or default to 'create'
  const initialTab = (searchParams?.get('tab') as TabType) || 'create';
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  // Update tab when URL changes
  useEffect(() => {
    const tabParam = searchParams?.get('tab') as TabType;
    if (tabParam && (tabParam === 'create' || tabParam === 'monitor')) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // Update URL without navigation
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.pushState({}, '', url.toString());
    }
  };

  return (
    <div className="flex flex-col h-full bg-ind-bg">
      {/* Header Section */}
      <div className="border-b border-ind-border bg-ind-panel px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-ind-text mb-1">
            Sessions Hub
          </h1>
          <p className="text-sm text-ind-text-muted">
            Create and monitor multi-agent sessions for parallel task execution
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-ind-border bg-ind-panel">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {/* Create Tab */}
            <button
              type="button"
              onClick={() => handleTabChange('create')}
              className={`
                px-6 py-3 font-bold uppercase tracking-wider text-sm
                border-b-2 transition-all
                ${activeTab === 'create'
                  ? 'border-ind-accent text-ind-accent bg-ind-bg/30'
                  : 'border-transparent text-ind-text-muted hover:text-ind-text hover:border-ind-border'
                }
              `}
            >
              Create Session
            </button>

            {/* Monitor Tab */}
            <button
              type="button"
              onClick={() => handleTabChange('monitor')}
              className={`
                px-6 py-3 font-bold uppercase tracking-wider text-sm
                border-b-2 transition-all
                ${activeTab === 'monitor'
                  ? 'border-ind-accent text-ind-accent bg-ind-bg/30'
                  : 'border-transparent text-ind-text-muted hover:text-ind-text hover:border-ind-border'
                }
              `}
            >
              Monitor Sessions
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'create' && (
          <div className="h-full">
            <SessionCreation />
          </div>
        )}

        {activeTab === 'monitor' && (
          <div className="h-full">
            <SessionMonitoringContainer />
          </div>
        )}
      </div>
    </div>
  );
}

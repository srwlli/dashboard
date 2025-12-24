'use client';

import Link from 'next/link';
import { SettingsPanel } from '@/components/SettingsPanel';

// Skip static generation for this page since it uses client context
export const dynamic = 'force-dynamic';

/**
 * Settings Page
 * Full-page settings interface with theme toggle and future configuration options
 */
export default function SettingsPage() {
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with back link */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-ind-text uppercase tracking-wider mb-2">
              Code<span className="text-ind-accent">Ref</span> Settings
            </h1>
            <p className="text-ind-text-muted text-sm font-mono">
              Manage your dashboard configuration
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-ind-accent text-black font-bold uppercase tracking-wider text-sm hover:bg-ind-accent-hover transition-colors active:translate-y-0.5"
          >
            ← Back to Dashboard
          </Link>
        </header>

        {/* Settings Content */}
        <SettingsPanel />
      </div>
    </div>
  );
}

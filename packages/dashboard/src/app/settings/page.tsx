'use client';

import { ThemePanel } from '@/components/ThemePanel';

/**
 * Settings Page
 * Manages display and theme preferences
 * Uses global page layout for consistent spacing and structure
 */
export default function SettingsPage() {
  return (
    <>
      <header className="mb-8">
        <div>
          <h1 className="text-4xl font-bold text-ind-text uppercase tracking-wider mb-2">
            Code<span className="text-ind-accent">Ref</span> Settings
          </h1>
          <p className="text-ind-text-muted text-sm font-mono">
            Manage display and theme preferences
          </p>
        </div>
      </header>

      <ThemePanel />
    </>
  );
}

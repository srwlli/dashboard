'use client';

import { PageCard } from './PageCard';
import { ThemeToggle } from './ThemeToggle';
import { AccentColorPicker } from './AccentColorPicker';

/**
 * ThemePanel Component
 * Display settings interface with theme toggle and accent color picker
 * Uses PageCard for consistent industrial design pattern with corner accents
 */
export function ThemePanel() {
  return (
    <PageCard>
      {/* Header */}
      <div className="mb-8 border-b-2 border-ind-border pb-6">
        <h2 className="text-2xl font-bold uppercase tracking-wider text-ind-text mb-2">
          Display Settings
        </h2>
        <p className="text-ind-text-muted text-sm font-mono">
          Manage theme and appearance
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-8">
        {/* Theme Section */}
        <div>
          <h3 className="text-sm uppercase tracking-widest text-ind-text-muted font-mono mb-3 font-bold">
            Theme
          </h3>
          <ThemeToggle />
        </div>

        {/* Accent Color Section */}
        <div className="border-t border-ind-border pt-8">
          <AccentColorPicker />
        </div>
      </div>
    </PageCard>
  );
}

export default ThemePanel;

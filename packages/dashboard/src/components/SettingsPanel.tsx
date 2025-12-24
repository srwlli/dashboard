'use client';

import { ThemeToggle } from './ThemeToggle';

/**
 * SettingsPanel Component
 * Main settings interface with theme toggle and placeholder for future settings
 * Follows industrial design pattern with corner accents
 */
export function SettingsPanel() {
  return (
    <div className="w-full space-y-6">
      {/* Main Panel */}
      <div className="bg-ind-panel border-2 border-ind-border p-8 relative">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-ind-accent"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-ind-accent"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-ind-accent"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-ind-accent"></div>

        {/* Header */}
        <div className="mb-8 border-b-2 border-ind-border pb-6">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-ind-text mb-2">
            Dashboard Settings
          </h2>
          <p className="text-ind-text-muted text-sm font-mono">
            Configure your dashboard preferences
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Theme Section */}
          <div>
            <h3 className="text-sm uppercase tracking-widest text-ind-text-muted font-mono mb-3 font-bold">
              Display
            </h3>
            <ThemeToggle />
          </div>

          {/* Layout Section Placeholder */}
          <div className="pt-4 border-t border-ind-border border-dashed">
            <h3 className="text-sm uppercase tracking-widest text-ind-text-muted font-mono mb-3 font-bold">
              Layout
            </h3>
            <div className="px-4 py-3 bg-ind-bg border border-ind-border border-dashed rounded">
              <p className="text-ind-text-muted text-xs">Layout options coming soon...</p>
            </div>
          </div>

          {/* Widgets Section Placeholder */}
          <div className="pt-4 border-t border-ind-border border-dashed">
            <h3 className="text-sm uppercase tracking-widest text-ind-text-muted font-mono mb-3 font-bold">
              Widgets
            </h3>
            <div className="px-4 py-3 bg-ind-bg border border-ind-border border-dashed rounded">
              <p className="text-ind-text-muted text-xs">Widget management coming soon...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center">
        <p className="text-ind-text-muted text-xs font-mono">
          Version 0.1.0 • CodeRef Dashboard Settings
        </p>
      </div>
    </div>
  );
}

export default SettingsPanel;

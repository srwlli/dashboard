import React from 'react';
import { IScriptboardWidget, WidgetSettingsChangePayload } from '@coderef-dashboard/core';
import { ComingSoonCard } from './ComingSoonCard';

/**
 * Coming Soon Widget
 * A placeholder widget that validates the entire widget infrastructure
 * with a simple "Coming Soon" message
 */
export const ComingSoonWidget: IScriptboardWidget = {
  id: 'coming-soon',
  name: 'Coming Soon',
  version: '0.1.0',
  description: 'Placeholder widget showing coming soon message',

  settings: {
    title: 'More Widgets Coming Soon',
    description: 'Additional widgets are being developed. Check back later!',
    eta: 'Q1 2025',
  },

  render(): React.ReactNode {
    return React.createElement(ComingSoonCard, {
      title: this.settings?.title,
      description: this.settings?.description,
      eta: this.settings?.eta,
    });
  },

  async onEnable(): Promise<void> {
    console.log('[ComingSoonWidget] Widget enabled');
  },

  async onDisable(): Promise<void> {
    console.log('[ComingSoonWidget] Widget disabled');
  },

  async onSettingsChange(settings: WidgetSettingsChangePayload): Promise<void> {
    console.log('[ComingSoonWidget] Settings changed:', settings);
    // Update widget settings
    if (settings.title) this.settings.title = settings.title;
    if (settings.description) this.settings.description = settings.description;
    if (settings.eta) this.settings.eta = settings.eta;
  },

  onError(error: Error): boolean {
    console.error('[ComingSoonWidget] Error:', error.message);
    return false; // Don't suppress error
  },
};

// Default export for dynamic imports
export default ComingSoonWidget;

// Also export the component
export { ComingSoonCard } from './ComingSoonCard';
export type { ComingSoonCardProps } from './ComingSoonCard';

import React from 'react';
import { IScriptboardWidget, WidgetSettingsChangePayload } from '@coderef-dashboard/core';
import { SettingsWidget } from './SettingsWidget';

/**
 * Settings Widget
 * Provides dashboard configuration and preferences
 * Includes theme toggle (dark/light mode)
 * Theme preference persists to localStorage
 */
export const SettingsWidgetExport: IScriptboardWidget = {
  id: 'settings',
  name: 'Settings',
  version: '0.1.0',
  description: 'Dashboard settings and preferences',

  settings: {
    // Settings can be expanded in the future
  },

  render(): React.ReactNode {
    return React.createElement(SettingsWidget);
  },

  async onEnable(): Promise<void> {
    console.log('[SettingsWidget] Initialized');
  },

  async onDisable(): Promise<void> {
    console.log('[SettingsWidget] Disabled');
  },

  async onSettingsChange(payload: WidgetSettingsChangePayload): Promise<void> {
    console.log('[SettingsWidget] Settings changed:', payload);
  },

  onError(error: Error): boolean {
    console.error('[SettingsWidget] Error:', error.message);
    return false;
  },
};

export default SettingsWidgetExport;

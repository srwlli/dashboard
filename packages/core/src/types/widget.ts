import React from 'react';

/**
 * Lifecycle status of a widget
 */
export type WidgetStatus = 'idle' | 'loading' | 'active' | 'error' | 'disabled';

/**
 * Widget configuration from registry
 */
export interface WidgetConfig {
  id: string;
  package: string;
  enabled: boolean;
  settings?: Record<string, any>;
  [key: string]: any;
}

/**
 * Widget settings change payload
 */
export interface WidgetSettingsChangePayload {
  [key: string]: any;
}

/**
 * Main widget interface - all widgets must implement this
 */
export interface IScriptboardWidget {
  /**
   * Unique identifier for this widget
   */
  id: string;

  /**
   * Display name of the widget
   */
  name: string;

  /**
   * Semantic version of the widget
   */
  version: string;

  /**
   * Short description of what this widget does
   */
  description?: string;

  /**
   * Settings for this widget instance
   */
  settings?: Record<string, any>;

  /**
   * Render the widget component
   * Must return a valid React component or null
   */
  render(): React.ReactNode;

  /**
   * Called when widget is enabled in the registry
   * Async to allow setup/initialization
   */
  onEnable?(): Promise<void>;

  /**
   * Called when widget is disabled in the registry
   * Cleanup and teardown
   */
  onDisable?(): Promise<void>;

  /**
   * Called when settings are changed
   * Use this to update widget behavior based on new settings
   */
  onSettingsChange?(settings: WidgetSettingsChangePayload): Promise<void>;

  /**
   * Called when widget encounters an error
   * Return true to suppress error propagation
   */
  onError?(error: Error): boolean;
}

/**
 * Props passed to widget render function
 */
export interface WidgetRenderProps {
  config: WidgetConfig;
  widget: IScriptboardWidget;
  onSettingsChange: (settings: WidgetSettingsChangePayload) => Promise<void>;
}

/**
 * Widget loader error details
 */
export interface WidgetLoaderError {
  widgetId: string;
  error: Error;
  timestamp: Date;
}

/**
 * Type guard to check if object implements IScriptboardWidget
 */
export function isScriptboardWidget(obj: any): obj is IScriptboardWidget {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.version === 'string' &&
    typeof obj.render === 'function'
  );
}

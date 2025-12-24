/**
 * Widget interface and types
 * Defines the contract that all widgets must implement
 */

export interface IScriptboardWidget {
  id: string;
  name: string;
  version: string;
  description?: string;
  settings?: Record<string, any>;
  render(): React.ReactNode;
  onEnable?(): Promise<void>;
  onDisable?(): Promise<void>;
  onSettingsChange?(settings: WidgetSettingsChangePayload): Promise<void>;
  onError?(error: Error): boolean;
}

export interface WidgetConfig {
  id: string;
  package: string;
  enabled: boolean;
  settings?: Record<string, any>;
}

export type WidgetStatus = 'loading' | 'ready' | 'error' | 'disabled';

export interface WidgetSettingsChangePayload {
  widgetId: string;
  settings: Record<string, any>;
}

export interface WidgetRenderProps {
  widget: IScriptboardWidget;
  config: WidgetConfig;
}

export interface WidgetLoaderError {
  widgetId: string;
  error: Error;
  timestamp: number;
}

export function isScriptboardWidget(obj: any): obj is IScriptboardWidget {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.version === 'string' &&
    typeof obj.render === 'function'
  );
}

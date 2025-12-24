/**
 * CodeRef Dashboard Core
 * Shared library for all widgets
 */

import { api } from './api/client';
import * as hooks from './hooks';
import * as utils from './utils';

export const version = '1.0.0';

export { api };
export { hooks };
export { utils };
export * from './types';

// Export ErrorBoundary for dashboard use
export { ErrorBoundary } from './components/ErrorBoundary';

// Re-export widget interface types for TypeScript
// These define the contract that all widgets must implement
export type {
  IScriptboardWidget,
  WidgetConfig,
  WidgetStatus,
  WidgetSettingsChangePayload,
  WidgetRenderProps,
  WidgetLoaderError,
} from './types';

/**
 * Global TypeScript declarations for window.CodeRefCore
 */
declare global {
  interface Window {
    CodeRefCore: {
      api: typeof api;
      hooks: typeof hooks;
      utils: typeof utils;
      version: string;
    };
  }
}

/**
 * Expose on window when bundled as IIFE
 */
if (typeof window !== 'undefined') {
  (window as any).CodeRefCore = {
    api,
    hooks,
    utils,
    version
  };
}

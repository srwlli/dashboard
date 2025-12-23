'use client';

import React, { Suspense, lazy, ReactNode } from 'react';
import { ErrorBoundary } from '@coderef-dashboard/core';
import { WidgetConfig, IScriptboardWidget } from '@coderef-dashboard/core';

interface WidgetLoaderProps {
  config: WidgetConfig;
  fallback?: ReactNode;
  onError?: (widgetId: string, error: Error) => void;
}

/**
 * Loading fallback component
 */
function WidgetLoading() {
  return (
    <div className="bg-ind-panel border-2 border-ind-border p-4 rounded">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-ind-accent rounded-full animate-pulse"></div>
        <p className="text-ind-text-muted text-sm font-mono">Loading widget...</p>
      </div>
    </div>
  );
}

/**
 * Error fallback component
 */
function WidgetError({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="bg-ind-panel border-2 border-ind-accent p-4 rounded">
      <div className="flex items-start gap-3">
        <div className="text-ind-accent text-xl">⚠️</div>
        <div className="flex-1">
          <h4 className="text-ind-accent font-bold uppercase tracking-wide text-sm mb-1">
            Widget Error
          </h4>
          <p className="text-ind-text-muted text-xs font-mono mb-3">
            {error.message}
          </p>
          <button
            onClick={retry}
            className="px-2 py-1 bg-ind-accent text-black text-xs font-bold uppercase tracking-wider hover:bg-ind-accent-hover transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Dynamically loads and renders a widget
 */
export function WidgetLoader({
  config,
  fallback = <WidgetLoading />,
  onError,
}: WidgetLoaderProps) {
  const [retryKey, setRetryKey] = React.useState(0);

  // Dynamically import widget package
  const Widget = lazy(async () => {
    try {
      const module = await import(
        /* webpackIgnore: true */
        config.package
      );

      // Check if default export exists and is a widget
      if (module.default && typeof module.default === 'object') {
        return { default: module.default as IScriptboardWidget };
      }

      // Check for named export
      const widget = Object.values(module).find(
        (exp: any) =>
          typeof exp === 'object' &&
          exp?.id === config.id &&
          typeof exp?.render === 'function'
      ) as IScriptboardWidget | undefined;

      if (widget) {
        return { default: widget };
      }

      throw new Error(`Widget "${config.id}" not found in package "${config.package}"`);
    } catch (error) {
      console.error(`[WidgetLoader] Failed to load widget "${config.id}":`, error);
      throw error;
    }
  });

  const handleRetry = () => {
    setRetryKey((prev) => prev + 1);
  };

  const handleError = (error: Error) => {
    console.error(`[WidgetLoader] Widget error for "${config.id}":`, error);
    onError?.(config.id, error);
    return false; // Let error bubble to ErrorBoundary
  };

  return (
    <ErrorBoundary
      key={retryKey}
      widgetId={config.id}
      onError={() => {}}
      fallback={(error) => <WidgetError error={error} retry={handleRetry} />}
    >
      <Suspense fallback={fallback}>
        <WidgetRenderer config={config} Widget={Widget} onError={handleError} />
      </Suspense>
    </ErrorBoundary>
  );
}

/**
 * Internal component that renders the widget
 */
function WidgetRenderer({
  config,
  Widget,
  onError,
}: {
  config: WidgetConfig;
  Widget: React.LazyExoticComponent<{ default: IScriptboardWidget }>;
  onError: (error: Error) => void;
}) {
  const [widget, setWidget] = React.useState<IScriptboardWidget | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const loadWidget = async () => {
      try {
        // Wait for lazy component to load
        const module = await import(
          /* webpackIgnore: true */
          config.package
        );

        if (!mounted) return;

        // Get widget instance
        const widgetInstance = module.default as IScriptboardWidget;

        // Call onEnable if available
        if (widgetInstance.onEnable) {
          await widgetInstance.onEnable();
        }

        setWidget(widgetInstance);
      } catch (error) {
        if (mounted) {
          onError(error instanceof Error ? error : new Error(String(error)));
        }
      }
    };

    loadWidget();

    return () => {
      mounted = false;
    };
  }, [config, onError]);

  if (!widget) {
    return null;
  }

  return <React.Fragment>{widget.render()}</React.Fragment>;
}

export default WidgetLoader;

'use client';

import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { ErrorBoundary } from '@coderef-dashboard/core';
import { WidgetConfig, IScriptboardWidget } from '@coderef-dashboard/core';

// Expose React and ReactDOM as globals for widget bundles
if (typeof window !== 'undefined') {
  (window as any).React = React;
  (window as any).ReactDOM = ReactDOM;
}

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
 * Uses Next.js dynamic imports for code splitting
 */
export function WidgetLoader({
  config,
  fallback = <WidgetLoading />,
  onError,
}: WidgetLoaderProps) {
  const [retryKey, setRetryKey] = React.useState(0);

  const handleRetry = () => {
    setRetryKey((prev) => prev + 1);
  };

  const handleError = (error: Error) => {
    console.error(`[WidgetLoader] Widget error for "${config.id}":`, error);
    onError?.(config.id, error);
  };

  return (
    <ErrorBoundary
      key={retryKey}
      widgetId={config.id}
      onError={() => {}}
      fallback={(error) => <WidgetError error={error} retry={handleRetry} />}
    >
      <WidgetRenderer config={config} fallback={fallback} onError={handleError} />
    </ErrorBoundary>
  );
}

/**
 * Internal component that renders the widget
 * Handles lifecycle hooks and dynamic loading
 */
function WidgetRenderer({
  config,
  fallback,
  onError,
}: {
  config: WidgetConfig;
  fallback: ReactNode;
  onError: (error: Error) => void;
}) {
  const [widget, setWidget] = React.useState<IScriptboardWidget | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const loadWidget = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load widget from public/widgets/ directory
        const widgetId = config.id;
        const scriptUrl = `/widgets/${widgetId}.js`;

        // Load the script
        const script = document.createElement('script');
        script.src = scriptUrl;
        script.async = true;

        const widgetPromise = new Promise<IScriptboardWidget>((resolve, reject) => {
          script.onload = () => {
            try {
              // Get widget from global variable created by IIFE bundle
              const globalName = `CodeRefWidget_${widgetId.replace(/-/g, '_')}`;
              const moduleExports = (window as any)[globalName];

              if (!moduleExports) {
                reject(
                  new Error(
                    `Widget not found in global namespace: ${globalName}`
                  )
                );
                return;
              }

              // Extract widget from CommonJS exports (esbuild wraps in __toCommonJS)
              // The default export contains the actual widget object
              const widgetInstance = moduleExports.default || moduleExports;

              // Validate widget has required render method
              if (!widgetInstance || typeof widgetInstance.render !== 'function') {
                reject(
                  new Error(
                    `Invalid widget: "${widgetId}" must export a widget object with a render() method`
                  )
                );
                return;
              }

              // Attempt to clean up global namespace
              try {
                delete (window as any)[globalName];
              } catch (e) {
                // Silently ignore if property cannot be deleted (non-configurable)
                // This can happen in strict mode or with certain property configurations
              }

              resolve(widgetInstance);
            } catch (err) {
              reject(err);
            }
          };

          script.onerror = () => {
            reject(new Error(`Failed to load widget script: ${scriptUrl}`));
          };
        });

        document.head.appendChild(script);

        if (!mounted) return;

        const widgetInstance = await widgetPromise;

        if (!widgetInstance || typeof widgetInstance.render !== 'function') {
          throw new Error(
            `Invalid widget: "${config.id}" must export a widget object with a render() method`
          );
        }

        // Call onEnable lifecycle hook
        if (widgetInstance.onEnable) {
          try {
            await widgetInstance.onEnable();
          } catch (err) {
            console.error(
              `[WidgetLoader] onEnable failed for "${config.id}":`,
              err
            );
            if (mounted) {
              setError(
                err instanceof Error
                  ? err
                  : new Error('Widget onEnable failed')
              );
            }
            return;
          }
        }

        if (mounted) {
          setWidget(widgetInstance);
        }
      } catch (err) {
        if (mounted) {
          const error =
            err instanceof Error ? err : new Error(String(err));
          setError(error);
          onError(error);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadWidget();

    return () => {
      mounted = false;
      // Call onDisable lifecycle hook when component unmounts
      if (widget?.onDisable) {
        widget.onDisable().catch((err) =>
          console.error(
            `[WidgetLoader] onDisable failed for "${config.id}":`,
            err
          )
        );
      }
    };
  }, [config, onError]);

  if (error) {
    throw error;
  }

  if (isLoading || !widget) {
    return <>{fallback}</>;
  }

  return <React.Fragment>{widget.render()}</React.Fragment>;
}

export default WidgetLoader;

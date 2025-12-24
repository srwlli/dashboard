'use client';

import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  widgetId?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component for catching widget errors
 * Prevents one broken widget from crashing the entire app
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      `[ErrorBoundary${this.props.widgetId ? ` - ${this.props.widgetId}` : ''}] Error caught:`,
      error,
      errorInfo
    );

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      return (
        <div className="bg-ind-panel border-2 border-ind-accent p-4 rounded">
          <div className="flex items-start gap-3">
            <div className="text-ind-accent text-xl">⚠️</div>
            <div className="flex-1">
              <h3 className="text-ind-accent font-bold uppercase tracking-wide mb-1">
                Widget Error
                {this.props.widgetId && ` (${this.props.widgetId})`}
              </h3>
              <p className="text-ind-text-muted text-sm font-mono mb-3">
                {this.state.error.message}
              </p>
              <button
                onClick={this.handleRetry}
                className="px-3 py-1 bg-ind-accent text-black text-xs font-bold uppercase tracking-wider hover:bg-ind-accent-hover transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * ErrorBoundary
 * Catches React rendering errors and displays fallback UI
 * Useful for debugging white screen issues
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-ind-bg flex items-center justify-center p-4">
          <div className="bg-ind-panel border-2 border-red-500 p-8 max-w-2xl">
            <h1 className="text-2xl font-bold text-red-500 mb-4">
              Application Error
            </h1>
            <p className="text-ind-text-muted mb-4">
              Something went wrong. Check the console for details.
            </p>
            {this.state.error && (
              <pre className="bg-ind-bg p-4 rounded text-xs overflow-auto">
                {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-ind-accent text-white rounded hover:bg-ind-accent-hover"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

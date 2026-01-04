'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface MermaidViewerProps {
  /** Mermaid diagram code to render */
  chart: string;

  /** Optional custom class name */
  className?: string;
}

/**
 * MermaidViewer Component
 *
 * @description Renders Mermaid diagrams with dark theme integration.
 * Supports architecture diagrams, dependency graphs, flowcharts, sequence diagrams, etc.
 *
 * @component
 * @example
 * ```tsx
 * <MermaidViewer chart="graph TD\n  A-->B" />
 * ```
 */
export function MermaidViewer({ chart, className = '' }: MermaidViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [mermaidInstance, setMermaidInstance] = useState<any>(null);

  // Debug logging
  useEffect(() => {
    console.log('[MermaidViewer] Chart received:', chart?.substring(0, 100));
    console.log('[MermaidViewer] Chart length:', chart?.length);
    console.log('[MermaidViewer] Chart type:', typeof chart);
  }, [chart]);

  // Load and initialize mermaid once on client-side
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let mounted = true;

    import('mermaid').then((mod) => {
      if (!mounted) return;

      const mermaid = mod.default;

      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        themeVariables: {
          primaryColor: '#60a5fa',
          primaryTextColor: '#e5e7eb',
          primaryBorderColor: '#3b82f6',
          lineColor: '#6b7280',
          secondaryColor: '#818cf8',
          tertiaryColor: '#34d399',
          background: '#1f2937',
          mainBkg: '#374151',
          secondBkg: '#4b5563',
          tertiaryBkg: '#6b7280',
        },
        securityLevel: 'loose', // Allow click handlers
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        logLevel: 'debug', // Changed to debug for more info
      });

      console.log('[MermaidViewer] Mermaid initialized successfully');
      setMermaidInstance(mermaid);
    }).catch((err) => {
      console.error('[MermaidViewer] Failed to load mermaid:', err);
      setError('Failed to load diagram renderer');
    });

    return () => {
      mounted = false;
    };
  }, []);

  // Render diagram when mermaid instance is ready and chart changes
  useEffect(() => {
    if (!mermaidInstance || !containerRef.current || !chart) {
      console.log('[MermaidViewer] Skipping render:', {
        hasMermaid: !!mermaidInstance,
        hasContainer: !!containerRef.current,
        hasChart: !!chart
      });
      return;
    }

    const renderDiagram = async () => {
      try {
        console.log('[MermaidViewer] Starting render...');
        setError(null);
        const uniqueId = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

        // Clear previous content
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        // Use the initialized mermaid instance (no re-import)
        console.log('[MermaidViewer] Calling mermaid.render() with ID:', uniqueId);
        const { svg } = await mermaidInstance.render(uniqueId, chart);
        console.log('[MermaidViewer] Render successful, SVG length:', svg.length);

        // Insert rendered SVG
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          console.log('[MermaidViewer] SVG inserted into DOM');
        }
      } catch (err) {
        console.error('[MermaidViewer] Render error:', err);
        setError((err as Error).message || 'Failed to render diagram');
      }
    };

    renderDiagram();
  }, [chart, mermaidInstance]);

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="flex items-start gap-2 p-3 rounded bg-red-500/10 border border-red-500/30 mb-4">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-500">
            <strong>Mermaid rendering failed:</strong>
            <div className="mt-1">{error}</div>
          </div>
        </div>
        {/* Fallback: Show raw mermaid code if render fails */}
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-2">Raw Mermaid Code:</div>
          <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap overflow-x-auto">
            {chart}
          </pre>
        </div>
      </div>
    );
  }

  if (!mermaidInstance) {
    return (
      <div className={`p-6 bg-gray-900 rounded-lg ${className}`}>
        <div className="text-center text-gray-400 text-sm">
          Loading diagram renderer...
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`mermaid-container p-6 bg-gray-900 rounded-lg overflow-x-auto ${className}`}
      style={{
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    />
  );
}

export default MermaidViewer;

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
  const [mermaidLoaded, setMermaidLoaded] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('[MermaidViewer] Chart received:', chart?.substring(0, 100));
    console.log('[MermaidViewer] Chart length:', chart?.length);
  }, [chart]);

  // Load mermaid dynamically on client-side only
  useEffect(() => {
    if (typeof window === 'undefined') return;

    import('mermaid').then((mod) => {
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
        logLevel: 'error',
      });

      setMermaidLoaded(true);
    }).catch((err) => {
      console.error('Failed to load mermaid:', err);
      setError('Failed to load diagram renderer');
    });
  }, []);

  // Render diagram when mermaid is loaded and chart changes
  useEffect(() => {
    if (!mermaidLoaded || !containerRef.current || !chart) return;

    const renderDiagram = async () => {
      try {
        setError(null);
        const uniqueId = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

        // Clear previous content
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        // Dynamic import for render call
        const { default: mermaid } = await import('mermaid');
        const { svg } = await mermaid.render(uniqueId, chart);

        // Insert rendered SVG
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.error('Mermaid render error:', err);
        setError((err as Error).message || 'Failed to render diagram');
      }
    };

    renderDiagram();
  }, [chart, mermaidLoaded]);

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="flex items-start gap-2 p-3 rounded bg-red-500/10 border border-red-500/30">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-500">
            <strong>Mermaid rendering failed:</strong>
            <div className="mt-1">{error}</div>
            <div className="mt-2 text-xs font-mono bg-red-950/30 p-2 rounded">
              {chart.substring(0, 200)}...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!mermaidLoaded) {
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

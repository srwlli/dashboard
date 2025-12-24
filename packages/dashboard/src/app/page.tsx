'use client';

import { useEffect, useState } from 'react';
import { WidgetLoader } from '@/components/WidgetLoader';
import { WidgetConfig } from '@coderef-dashboard/core';

export default function Home() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/coderef-dashboard.config.json');
        if (!response.ok) throw new Error('Failed to load config');
        const config = await response.json();
        setWidgets(config.widgets.filter((w: WidgetConfig) => w.enabled));
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load widgets');
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-ind-bg flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-ind-text mb-4 uppercase tracking-wider">
            Code<span className="text-ind-accent">Ref</span>
            <br />
            Dashboard
          </h1>
          <p className="text-ind-text-muted text-lg font-mono mb-8">
            Loading widgets...
          </p>
          <div className="inline-flex gap-2">
            <div className="w-2 h-2 bg-ind-accent rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-ind-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-ind-accent rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ind-bg flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-ind-accent text-lg font-mono mb-4">⚠️ Error</p>
          <p className="text-ind-text-muted">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ind-bg p-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-ind-text uppercase tracking-wider">
            Code<span className="text-ind-accent">Ref</span> Dashboard
          </h1>
        </header>
        <div className="grid gap-6">
          {widgets.map((widget) => (
            <WidgetLoader key={widget.id} config={widget} />
          ))}
        </div>
      </div>
    </div>
  );
}

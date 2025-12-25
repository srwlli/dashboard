'use client';

import Link from 'next/link';
import { PromptingWorkflow } from '@/components/PromptingWorkflow';

export default function Home() {
  return (
    <div className="p-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-ind-text uppercase tracking-wider">
            Code<span className="text-ind-accent">Ref</span> Dashboard
          </h1>
          <Link
            href="/settings"
            className="px-4 py-2 bg-ind-accent text-black font-bold uppercase tracking-wider text-sm hover:bg-ind-accent-hover transition-colors active:translate-y-0.5"
            aria-label="Settings"
            title="Settings"
          >
            ⚙️ Settings
          </Link>
        </header>
        <div className="grid gap-6">
          <PromptingWorkflow />
        </div>
      </div>
    </div>
  );
}

'use client';

import { PromptingWorkflow } from '@/components/PromptingWorkflow';

/**
 * Dashboard Page
 * Main interface displaying prompting workflow
 * Uses global page layout for consistent spacing and structure
 */
export default function Home() {
  return (
    <>
      <header className="mb-8">
        <div>
          <h1 className="text-4xl font-bold text-ind-text uppercase tracking-wider mb-2">
            Code<span className="text-ind-accent">Ref</span> Dashboard
          </h1>
        </div>
      </header>
      <PromptingWorkflow />
    </>
  );
}

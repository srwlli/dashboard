'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

/**
 * Redirect /assistant-standalone to /boards-standalone
 * Preserves boardId query parameter for backward compatibility
 */
export default function AssistantStandaloneRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const boardId = searchParams.get('boardId');
    const newUrl = boardId
      ? `/boards-standalone?boardId=${boardId}`
      : '/boards-standalone';
    router.replace(newUrl);
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center h-screen bg-ind-bg">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-ind-accent border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-sm text-ind-text-muted">Redirecting...</p>
      </div>
    </div>
  );
}

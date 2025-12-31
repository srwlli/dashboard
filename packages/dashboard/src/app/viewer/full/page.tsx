'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FileViewer } from '@/components/coderef/FileViewer';
import type { Project } from '@/lib/coderef/types';
import { Loader2, AlertCircle } from 'lucide-react';

function ViewerContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const filePath = searchParams.get('filePath');

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProject() {
      if (!projectId) {
        setError('No project ID provided');
        setLoading(false);
        return;
      }

      try {
        // First try to load from sessionStorage (passed from FileViewer)
        const storedProject = sessionStorage.getItem('fullPageViewerProject');
        if (storedProject) {
          const parsedProject = JSON.parse(storedProject);
          // Verify it matches the requested project ID
          if (parsedProject.id === projectId) {
            setProject(parsedProject);
            setLoading(false);
            // Clear from storage after using
            sessionStorage.removeItem('fullPageViewerProject');
            return;
          }
        }

        // Fallback: Fetch project data from API
        const response = await fetch(`/api/coderef/projects?id=${projectId}`);
        if (!response.ok) {
          throw new Error('Failed to load project');
        }

        const data = await response.json();
        setProject(data.project);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ind-bg">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-2 text-ind-accent animate-spin" />
          <p className="text-sm text-ind-text-muted">Loading viewer...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ind-bg p-4">
        <div className="flex items-start gap-2 p-4 rounded bg-red-500/10 border border-red-500/30 max-w-md">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-500">
            <strong>Error:</strong>
            <div className="mt-1">{error || 'Project not found'}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ind-bg">
      <FileViewer
        project={project}
        filePath={filePath}
        className="h-screen"
      />
    </div>
  );
}

export default function FullPageViewer() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-ind-bg">
          <div className="text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-2 text-ind-accent animate-spin" />
            <p className="text-sm text-ind-text-muted">Loading viewer...</p>
          </div>
        </div>
      }
    >
      <ViewerContent />
    </Suspense>
  );
}

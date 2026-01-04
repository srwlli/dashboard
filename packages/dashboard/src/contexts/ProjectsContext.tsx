'use client';

/**
 * ProjectsContext - Global project state management
 *
 * Provides centralized project list state to eliminate redundant API calls
 * across navigation. Single source of truth for all registered projects.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ProjectsApi } from '@/lib/coderef/api-access';
import type { CodeRefProject } from '@/app/api/coderef/projects/route';

/**
 * Projects context state shape
 */
interface ProjectsContextState {
  /** List of all registered projects */
  projects: CodeRefProject[];

  /** Loading state for initial fetch */
  isLoading: boolean;

  /** Error message if fetch fails */
  error: string | null;

  /** Reload projects from API */
  loadProjects: () => Promise<void>;

  /** Add a new project (optimistic update) */
  addProject: (project: { id: string; name: string; path: string }) => Promise<void>;

  /** Remove a project (optimistic update) */
  removeProject: (projectId: string) => Promise<void>;
}

/**
 * Context definition
 */
const ProjectsContext = createContext<ProjectsContextState | null>(null);

/**
 * ProjectsProvider Props
 */
interface ProjectsProviderProps {
  children: React.ReactNode;
}

/**
 * ProjectsProvider Component
 *
 * Wraps the app to provide global project state.
 * Fetches projects once on mount and caches in memory.
 *
 * @param props - Provider props
 * @returns Provider component
 */
export function ProjectsProvider({ children }: ProjectsProviderProps) {
  const [projects, setProjects] = useState<CodeRefProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load projects from API
   */
  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ProjectsApi.list();
      setProjects(response.projects);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load projects';
      setError(errorMessage);
      console.error('ProjectsContext: Failed to load projects', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Add project with optimistic update
   *
   * @param project - Project to add
   */
  const addProject = useCallback(async (project: { id: string; name: string; path: string }) => {
    // Optimistic update: add to state immediately
    const optimisticProject: CodeRefProject = {
      ...project,
      addedAt: new Date().toISOString(),
    };

    setProjects(prev => [...prev, optimisticProject]);

    try {
      // Call API in background
      await ProjectsApi.create(project);

      // Reload to get server state (in case of conflicts)
      await loadProjects();
    } catch (err) {
      // Rollback on error
      setProjects(prev => prev.filter(p => p.id !== project.id));

      const errorMessage = err instanceof Error ? err.message : 'Failed to add project';
      setError(errorMessage);
      throw err; // Re-throw for caller to handle
    }
  }, [loadProjects]);

  /**
   * Remove project with optimistic update
   *
   * @param projectId - ID of project to remove
   */
  const removeProject = useCallback(async (projectId: string) => {
    // Store original state for rollback
    const originalProjects = projects;

    // Optimistic update: remove from state immediately
    setProjects(prev => prev.filter(p => p.id !== projectId));

    try {
      // Call API in background
      await ProjectsApi.remove(projectId);
    } catch (err) {
      // Rollback on error
      setProjects(originalProjects);

      const errorMessage = err instanceof Error ? err.message : 'Failed to remove project';
      setError(errorMessage);
      throw err; // Re-throw for caller to handle
    }
  }, [projects]);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const value: ProjectsContextState = {
    projects,
    isLoading,
    error,
    loadProjects,
    addProject,
    removeProject,
  };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
}

/**
 * useProjects Hook
 *
 * Access projects context in any component.
 *
 * @returns Projects context state
 * @throws Error if used outside ProjectsProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { projects, isLoading, addProject } = useProjects();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return <div>{projects.length} projects</div>;
 * }
 * ```
 */
export function useProjects(): ProjectsContextState {
  const context = useContext(ProjectsContext);

  if (!context) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }

  return context;
}

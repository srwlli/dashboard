'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Attachment, PreloadedPrompt, Workflow } from '@/components/PromptingWorkflow/types';

interface WorkflowContextValue {
  workflow: Workflow;
  setSelectedPrompt: (prompt: PreloadedPrompt) => void;
  addAttachments: (attachments: Attachment[]) => void;
  removeAttachment: (attachmentId: string) => void;
  clearAttachments: () => void;
  setFinalResult: (result: string) => void;
  clearFinalResult: () => void;
  resetWorkflow: () => void;
}

const WorkflowContext = createContext<WorkflowContextValue | undefined>(undefined);

const STORAGE_KEY = 'coderef-workflow-state';

/**
 * WorkflowProvider - Global workflow state management
 * Persists workflow state to localStorage for cross-page navigation
 */
export function WorkflowProvider({ children }: { children: ReactNode }) {
  // Start with default state to match SSR, then sync from localStorage on mount
  const [workflow, setWorkflow] = useState<Workflow>({
    id: Math.random().toString(36).substring(2, 11),
    selectedPrompt: undefined,
    attachments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Convert date strings back to Date objects
          setWorkflow({
            ...parsed,
            createdAt: new Date(parsed.createdAt),
            updatedAt: new Date(parsed.updatedAt),
            attachments: parsed.attachments.map((att: any) => ({
              ...att,
              createdAt: new Date(att.createdAt),
            })),
          });
        }
      } catch (error) {
        console.error('Failed to load workflow from localStorage:', error);
      }
    }
  }, []); // Run once on mount

  // Persist workflow to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(workflow));
      } catch (error) {
        console.error('Failed to save workflow to localStorage:', error);
      }
    }
  }, [workflow]);

  const setSelectedPrompt = useCallback((prompt: PreloadedPrompt) => {
    setWorkflow((prev) => ({
      ...prev,
      selectedPrompt: prompt,
      updatedAt: new Date(),
    }));
  }, []);

  const addAttachments = useCallback((attachments: Attachment[]) => {
    setWorkflow((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...attachments],
      updatedAt: new Date(),
    }));
  }, []);

  const removeAttachment = useCallback((attachmentId: string) => {
    setWorkflow((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((a) => a.id !== attachmentId),
      updatedAt: new Date(),
    }));
  }, []);

  const clearAttachments = useCallback(() => {
    setWorkflow((prev) => ({
      ...prev,
      attachments: [],
      updatedAt: new Date(),
    }));
  }, []);

  const setFinalResult = useCallback((result: string) => {
    setWorkflow((prev) => ({
      ...prev,
      finalResult: result,
      updatedAt: new Date(),
    }));
  }, []);

  const clearFinalResult = useCallback(() => {
    setWorkflow((prev) => ({
      ...prev,
      finalResult: undefined,
      updatedAt: new Date(),
    }));
  }, []);

  const resetWorkflow = useCallback(() => {
    setWorkflow({
      id: Math.random().toString(36).substring(2, 11),
      selectedPrompt: undefined,
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }, []);

  return (
    <WorkflowContext.Provider
      value={{
        workflow,
        setSelectedPrompt,
        addAttachments,
        removeAttachment,
        clearAttachments,
        setFinalResult,
        clearFinalResult,
        resetWorkflow,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

/**
 * useWorkflow - Hook to access global workflow state
 */
export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within WorkflowProvider');
  }
  return context;
}

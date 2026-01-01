'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Attachment, PreloadedPrompt, Workflow } from '@/components/PromptingWorkflow/types';

interface WorkflowContextValue {
  workflow: Workflow;
  setSelectedPrompt: (prompt: PreloadedPrompt) => void;
  setSelectedTags: (tags: string[]) => void;
  toggleTag: (tagId: string) => void;
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
  const [workflow, setWorkflow] = useState<Workflow>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Convert date strings back to Date objects
          return {
            ...parsed,
            createdAt: new Date(parsed.createdAt),
            updatedAt: new Date(parsed.updatedAt),
            attachments: parsed.attachments.map((att: any) => ({
              ...att,
              createdAt: new Date(att.createdAt),
            })),
          };
        }
      } catch (error) {
        console.error('Failed to load workflow from localStorage:', error);
      }
    }

    // Default initial state
    return {
      id: Math.random().toString(36).substring(2, 11),
      selectedPrompt: undefined,
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

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
      // Clear tags when switching prompts (tags only apply to CODE_REVIEW)
      selectedTags: prompt.key === '0001' ? prev.selectedTags : undefined,
      updatedAt: new Date(),
    }));
  }, []);

  const setSelectedTags = useCallback((tags: string[]) => {
    setWorkflow((prev) => ({
      ...prev,
      selectedTags: tags,
      updatedAt: new Date(),
    }));
  }, []);

  const toggleTag = useCallback((tagId: string) => {
    setWorkflow((prev) => {
      const currentTags = prev.selectedTags || [];
      const isSelected = currentTags.includes(tagId);

      return {
        ...prev,
        selectedTags: isSelected
          ? currentTags.filter(id => id !== tagId)
          : [...currentTags, tagId],
        updatedAt: new Date(),
      };
    });
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
        setSelectedTags,
        toggleTag,
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

import { useState, useCallback } from 'react';
import { Attachment, PreloadedPrompt, Workflow } from '../types';

/**
 * Custom hook for managing workflow state
 * Handles prompt selection, attachments, and final result
 */
export function useWorkflow(initialPrompt?: PreloadedPrompt) {
  const [workflow, setWorkflow] = useState<Workflow>({
    id: Math.random().toString(36).substring(2, 11),
    selectedPrompt: initialPrompt,
    attachments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  /**
   * Set the selected prompt
   */
  const setSelectedPrompt = useCallback((prompt: PreloadedPrompt) => {
    setWorkflow((prev) => ({
      ...prev,
      selectedPrompt: prompt,
      updatedAt: new Date(),
    }));
  }, []);

  /**
   * Add attachment(s) to workflow
   */
  const addAttachments = useCallback((attachments: Attachment[]) => {
    setWorkflow((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...attachments],
      updatedAt: new Date(),
    }));
  }, []);

  /**
   * Remove attachment by ID
   */
  const removeAttachment = useCallback((attachmentId: string) => {
    setWorkflow((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((a) => a.id !== attachmentId),
      updatedAt: new Date(),
    }));
  }, []);

  /**
   * Clear all attachments
   */
  const clearAttachments = useCallback(() => {
    setWorkflow((prev) => ({
      ...prev,
      attachments: [],
      updatedAt: new Date(),
    }));
  }, []);

  /**
   * Set final LLM result
   */
  const setFinalResult = useCallback((result: string) => {
    setWorkflow((prev) => ({
      ...prev,
      finalResult: result,
      updatedAt: new Date(),
    }));
  }, []);

  /**
   * Clear final result
   */
  const clearFinalResult = useCallback(() => {
    setWorkflow((prev) => ({
      ...prev,
      finalResult: undefined,
      updatedAt: new Date(),
    }));
  }, []);

  /**
   * Reset entire workflow
   */
  const resetWorkflow = useCallback(() => {
    setWorkflow({
      id: Math.random().toString(36).substring(2, 11),
      selectedPrompt: undefined,
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }, []);

  return {
    workflow,
    setSelectedPrompt,
    addAttachments,
    removeAttachment,
    clearAttachments,
    setFinalResult,
    clearFinalResult,
    resetWorkflow,
  };
}

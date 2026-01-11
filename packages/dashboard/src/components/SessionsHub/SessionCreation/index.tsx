'use client';

import React, { useState } from 'react';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { StubSelector } from './StubSelector';
import { InstructionEditor } from './InstructionEditor';
import { AttachmentManager } from '@/components/PromptingWorkflow/components/AttachmentManager';
import type { Attachment } from '@/components/PromptingWorkflow/types';
import type { Stub, InstructionBlock, BlockType, SessionBuilderState } from './types';

export const SessionCreation: React.FC = () => {
  const [state, setState] = useState<SessionBuilderState>({
    selectedStub: null,
    instructionBlocks: [],
    attachments: [],
    agents: []
  });

  // Stub selection handler
  const handleSelectStub = (stub: Stub) => {
    setState(prev => ({ ...prev, selectedStub: stub }));
  };

  // Instruction block handlers
  const handleAddBlock = () => {
    const newBlock: InstructionBlock = {
      id: Math.random().toString(36).substring(2, 11),
      content: '',
      type: 'task',
      assignedTo: []
    };
    setState(prev => ({
      ...prev,
      instructionBlocks: [...prev.instructionBlocks, newBlock]
    }));
  };

  const handleUpdateBlock = (id: string, content: string, type: BlockType) => {
    setState(prev => ({
      ...prev,
      instructionBlocks: prev.instructionBlocks.map(block =>
        block.id === id ? { ...block, content, type } : block
      )
    }));
  };

  const handleRemoveBlock = (id: string) => {
    setState(prev => ({
      ...prev,
      instructionBlocks: prev.instructionBlocks.filter(block => block.id !== id)
    }));
  };

  // Attachment handlers
  const handleAddAttachments = (newAttachments: Attachment[]) => {
    setState(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }));
  };

  const handleRemoveAttachment = (id: string) => {
    setState(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== id)
    }));
  };

  const handleClearAttachments = () => {
    setState(prev => ({
      ...prev,
      attachments: []
    }));
  };

  // Form validation
  const validationErrors: string[] = [];

  if (!state.selectedStub) {
    validationErrors.push('Please select a stub');
  }

  if (state.instructionBlocks.length === 0) {
    validationErrors.push('At least one instruction block is required');
  }

  const hasEmptyBlocks = state.instructionBlocks.some(block => !block.content.trim());
  if (hasEmptyBlocks) {
    validationErrors.push('All instruction blocks must have content');
  }

  const isValid = validationErrors.length === 0;

  const handleNext = () => {
    if (!isValid) return;
    // TODO Sprint 2: Navigate to attachments step
    alert('Sprint 1 Complete! Next: Add attachments (Sprint 2)');
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-ind-text mb-2">
          Create New Session
        </h1>
        <p className="text-sm text-ind-text-muted">
          Build a multi-agent session from a stub with freeform instructions and context
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-ind-accent flex items-center justify-center text-sm font-bold text-black">
            1
          </div>
          <span className="text-sm font-bold text-ind-text">Stub & Instructions</span>
        </div>
        <ChevronRight className="w-4 h-4 text-ind-text-muted" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-ind-border flex items-center justify-center text-sm font-bold text-ind-text-muted">
            2
          </div>
          <span className="text-sm text-ind-text-muted">Attachments</span>
        </div>
        <ChevronRight className="w-4 h-4 text-ind-text-muted" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-ind-border flex items-center justify-center text-sm font-bold text-ind-text-muted">
            3
          </div>
          <span className="text-sm text-ind-text-muted">Agent Assignment</span>
        </div>
        <ChevronRight className="w-4 h-4 text-ind-text-muted" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-ind-border flex items-center justify-center text-sm font-bold text-ind-text-muted">
            4
          </div>
          <span className="text-sm text-ind-text-muted">Generate</span>
        </div>
      </div>

      {/* Step 1: Stub Selection */}
      <div className="border border-ind-border rounded-lg p-6 bg-ind-panel">
        <StubSelector
          onSelectStub={handleSelectStub}
          selectedStub={state.selectedStub}
        />
      </div>

      {/* Step 2: Instruction Editor */}
      {state.selectedStub && (
        <div className="border border-ind-border rounded-lg p-6 bg-ind-panel">
          <InstructionEditor
            blocks={state.instructionBlocks}
            onAddBlock={handleAddBlock}
            onUpdateBlock={handleUpdateBlock}
            onRemoveBlock={handleRemoveBlock}
          />
        </div>
      )}

      {/* Step 3: Attachments (Sprint 2) */}
      {state.selectedStub && state.instructionBlocks.length > 0 && (
        <div className="border border-ind-border rounded-lg p-6 bg-ind-panel">
          <AttachmentManager
            attachments={state.attachments}
            onAddAttachments={handleAddAttachments}
            onRemoveAttachment={handleRemoveAttachment}
            onClearAll={handleClearAttachments}
          />
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="border-2 border-ind-error rounded-lg p-4 bg-ind-error/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-ind-error flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-ind-error mb-2">
                Please fix the following errors:
              </h4>
              <ul className="text-sm text-ind-error space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-ind-border">
        <div className="text-xs text-ind-text-muted">
          {state.selectedStub && (
            <>
              Selected: <span className="font-mono font-bold text-ind-accent">{state.selectedStub.id}</span>
              {' • '}
              {state.instructionBlocks.length} block{state.instructionBlocks.length !== 1 ? 's' : ''}
            </>
          )}
        </div>
        <button
          type="button"
          onClick={handleNext}
          disabled={!isValid}
          className={`px-6 py-3 font-bold uppercase tracking-wider text-sm transition-all ${
            isValid
              ? 'bg-ind-accent text-black hover:bg-ind-accent/90 active:translate-y-0.5'
              : 'bg-ind-border text-ind-text-muted cursor-not-allowed'
          }`}
        >
          Next: Add Attachments
          <ChevronRight className="w-4 h-4 inline-block ml-2" />
        </button>
      </div>

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="text-xs text-ind-text-muted font-mono bg-ind-bg p-4 rounded border border-ind-border">
          <summary className="cursor-pointer font-bold mb-2">Debug State</summary>
          <pre className="overflow-x-auto">
            {JSON.stringify(state, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

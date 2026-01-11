'use client';

import React, { useState } from 'react';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { StubSelector } from './StubSelector';
import { InstructionEditor } from './InstructionEditor';
import { ContextDiscovery } from './ContextDiscovery';
import { AttachmentManager } from '@/components/PromptingWorkflow/components/AttachmentManager';
import { AgentAssigner } from './AgentAssigner';
import { SessionGenerator } from './SessionGenerator';
import { SessionCreationComplete } from './SessionCreationComplete';
import type { Attachment } from '@/components/PromptingWorkflow/types';
import type { Stub, InstructionBlock, BlockType, SessionBuilderState } from './types';

interface ContextFile {
  id: string;
  filename: string;
  path: string;
  type: 'foundation' | 'archived' | 'resource';
  size: number;
  relevanceScore: number;
  excerpt: string;
}

export const SessionCreation: React.FC = () => {
  const [state, setState] = useState<SessionBuilderState>({
    selectedStub: null,
    instructionBlocks: [],
    attachments: [],
    agents: []
  });
  const [contextFiles, setContextFiles] = useState<ContextFile[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(1); // 1-4: steps, 5: complete
  const [sessionPath, setSessionPath] = useState<string>('');

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

  // Context file selection handler
  const handleContextSelection = (selectedFiles: ContextFile[]) => {
    setContextFiles(selectedFiles);
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
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleComplete = (generatedSessionPath: string) => {
    setSessionPath(generatedSessionPath);
    setCurrentStep(5);
  };

  const handleCreateAnother = () => {
    // Reset all state
    setState({
      selectedStub: null,
      instructionBlocks: [],
      attachments: [],
      agents: []
    });
    setContextFiles([]);
    setCurrentStep(1);
    setSessionPath('');
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
      {currentStep < 5 && (
        <div className="flex items-center gap-3 overflow-x-auto">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep === 1 ? 'bg-ind-accent text-black' :
              currentStep > 1 ? 'bg-green-500/20 text-green-400 border-2 border-green-500/30' :
              'bg-ind-border text-ind-text-muted'
            }`}>
              1
            </div>
            <span className={`text-sm whitespace-nowrap ${
              currentStep >= 1 ? 'font-bold text-ind-text' : 'text-ind-text-muted'
            }`}>
              Stub & Instructions
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-ind-text-muted flex-shrink-0" />

          {/* Step 2 */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep === 2 ? 'bg-ind-accent text-black' :
              currentStep > 2 ? 'bg-green-500/20 text-green-400 border-2 border-green-500/30' :
              'bg-ind-border text-ind-text-muted'
            }`}>
              2
            </div>
            <span className={`text-sm whitespace-nowrap ${
              currentStep >= 2 ? 'font-bold text-ind-text' : 'text-ind-text-muted'
            }`}>
              Attachments
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-ind-text-muted flex-shrink-0" />

          {/* Step 3 */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep === 3 ? 'bg-ind-accent text-black' :
              currentStep > 3 ? 'bg-green-500/20 text-green-400 border-2 border-green-500/30' :
              'bg-ind-border text-ind-text-muted'
            }`}>
              3
            </div>
            <span className={`text-sm whitespace-nowrap ${
              currentStep >= 3 ? 'font-bold text-ind-text' : 'text-ind-text-muted'
            }`}>
              Agent Assignment
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-ind-text-muted flex-shrink-0" />

          {/* Step 4 */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep === 4 ? 'bg-ind-accent text-black' :
              currentStep > 4 ? 'bg-green-500/20 text-green-400 border-2 border-green-500/30' :
              'bg-ind-border text-ind-text-muted'
            }`}>
              4
            </div>
            <span className={`text-sm whitespace-nowrap ${
              currentStep >= 4 ? 'font-bold text-ind-text' : 'text-ind-text-muted'
            }`}>
              Generate
            </span>
          </div>
        </div>
      )}

      {/* Step 1: Stub Selection & Instructions */}
      {currentStep === 1 && (
        <>
          <div className="border border-ind-border rounded-lg p-6 bg-ind-panel">
            <StubSelector
              onSelectStub={handleSelectStub}
              selectedStub={state.selectedStub}
            />
          </div>

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
        </>
      )}

      {/* Step 2: Context & Attachments */}
      {currentStep === 2 && state.selectedStub && (
        <>
          <div className="border border-ind-border rounded-lg p-6 bg-ind-panel">
            <ContextDiscovery
              stubDescription={state.selectedStub.description}
              onSelectionChange={handleContextSelection}
            />
          </div>

          <div className="border border-ind-border rounded-lg p-6 bg-ind-panel">
            <AttachmentManager
              attachments={state.attachments}
              onAddAttachments={handleAddAttachments}
              onRemoveAttachment={handleRemoveAttachment}
              onClearAll={handleClearAttachments}
            />
          </div>
        </>
      )}

      {/* Step 3: Agent Assignment */}
      {currentStep === 3 && (
        <div className="border border-ind-border rounded-lg p-6 bg-ind-panel">
          <AgentAssigner
            instructionBlocks={state.instructionBlocks}
            attachments={state.attachments}
            agents={state.agents}
            onAgentsChange={(agents) => setState(prev => ({ ...prev, agents }))}
          />
        </div>
      )}

      {/* Step 4: Generate */}
      {currentStep === 4 && state.selectedStub && (
        <div className="border border-ind-border rounded-lg p-6 bg-ind-panel">
          <SessionGenerator
            stub={state.selectedStub}
            instructionBlocks={state.instructionBlocks}
            contextFiles={contextFiles}
            attachments={state.attachments}
            agents={state.agents}
            onComplete={handleComplete}
          />
        </div>
      )}

      {/* Step 5: Complete */}
      {currentStep === 5 && state.selectedStub && (
        <SessionCreationComplete
          sessionPath={sessionPath}
          sessionId={sessionPath.split('/').pop() || ''}
          agentCount={state.agents.length}
          onCreateAnother={handleCreateAnother}
        />
      )}

      {/* Validation Errors */}
      {currentStep === 1 && validationErrors.length > 0 && (
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
      {currentStep < 4 && (
        <div className="flex items-center justify-between pt-6 border-t border-ind-border">
          <div className="flex items-center gap-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 font-bold uppercase tracking-wider text-sm bg-ind-panel border border-ind-border text-ind-text hover:bg-ind-bg transition-all"
              >
                Back
              </button>
            )}
            <div className="text-xs text-ind-text-muted">
              {state.selectedStub && (
                <>
                  Selected: <span className="font-mono font-bold text-ind-accent">{state.selectedStub.id}</span>
                  {' • '}
                  {state.instructionBlocks.length} block{state.instructionBlocks.length !== 1 ? 's' : ''}
                  {' • '}
                  {state.agents.length} agent{state.agents.length !== 1 ? 's' : ''}
                </>
              )}
            </div>
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
            {currentStep === 1 && 'Next: Context & Attachments'}
            {currentStep === 2 && 'Next: Agent Assignment'}
            {currentStep === 3 && 'Next: Generate Session'}
            <ChevronRight className="w-4 h-4 inline-block ml-2" />
          </button>
        </div>
      )}

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="text-xs text-ind-text-muted font-mono bg-ind-bg p-4 rounded border border-ind-border">
          <summary className="cursor-pointer font-bold mb-2">Debug State</summary>
          <pre className="overflow-x-auto">
            {JSON.stringify({ ...state, contextFiles }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

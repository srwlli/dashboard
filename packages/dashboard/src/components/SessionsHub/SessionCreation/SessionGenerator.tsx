'use client';

import React, { useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle, FileText, Folder } from 'lucide-react';
import type { Stub, InstructionBlock, Attachment, AgentAssignment } from './types';
import { validateAgentAssignments, getValidationSummary } from './agentValidation';

interface SessionGeneratorProps {
  stub: Stub;
  instructionBlocks: InstructionBlock[];
  contextFiles: Array<{ id: string; filename: string; path: string }>;
  attachments: Attachment[];
  agents: AgentAssignment[];
  onComplete: (sessionPath: string) => void;
}

interface GenerationStatus {
  step: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message?: string;
}

export const SessionGenerator: React.FC<SessionGeneratorProps> = ({
  stub,
  instructionBlocks,
  contextFiles,
  attachments,
  agents,
  onComplete
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSteps, setGenerationSteps] = useState<GenerationStatus[]>([
    { step: 'context-backbone.md', status: 'pending' },
    { step: 'communication.json', status: 'pending' },
    { step: 'instructions.json', status: 'pending' },
    { step: 'agent-prompts/', status: 'pending' }
  ]);
  const [sessionPath, setSessionPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Validate before generation
  const validationResult = validateAgentAssignments(agents, instructionBlocks);

  // Update step status
  const updateStep = (stepName: string, status: GenerationStatus['status'], message?: string) => {
    setGenerationSteps(prev =>
      prev.map(s => (s.step === stepName ? { ...s, status, message } : s))
    );
  };

  // Generate session files
  const handleGenerate = async () => {
    if (!validationResult.isValid) {
      setError('Please fix validation errors before generating');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Call API to generate session
      updateStep('context-backbone.md', 'processing');

      const response = await fetch('/api/sessions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stub,
          instructionBlocks,
          contextFiles,
          attachments,
          agents
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate session');
      }

      const data = await response.json();

      // Simulate step-by-step completion
      updateStep('context-backbone.md', 'completed');

      await new Promise(resolve => setTimeout(resolve, 500));
      updateStep('communication.json', 'processing');
      await new Promise(resolve => setTimeout(resolve, 500));
      updateStep('communication.json', 'completed');

      await new Promise(resolve => setTimeout(resolve, 500));
      updateStep('instructions.json', 'processing');
      await new Promise(resolve => setTimeout(resolve, 500));
      updateStep('instructions.json', 'completed');

      await new Promise(resolve => setTimeout(resolve, 500));
      updateStep('agent-prompts/', 'processing');
      await new Promise(resolve => setTimeout(resolve, 500));
      updateStep('agent-prompts/', 'completed');

      setSessionPath(data.sessionPath);
      onComplete(data.sessionPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      generationSteps.forEach(step => {
        if (step.status === 'processing') {
          updateStep(step.step, 'error', 'Generation failed');
        }
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate readiness percentage
  const totalItems =
    instructionBlocks.length + contextFiles.length + attachments.length + agents.length;
  const readinessPercentage = totalItems > 0 ? 100 : 0;

  const isComplete = generationSteps.every(s => s.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-ind-text mb-2">
          Generate Session
        </h3>
        <p className="text-sm text-ind-text-muted">
          Review session configuration and generate multi-agent session files
        </p>
      </div>

      {/* Session Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stub Info */}
        <div className="bg-ind-panel rounded border border-ind-border p-4">
          <div className="text-xs font-bold text-ind-text-muted uppercase tracking-wider mb-2">
            Stub
          </div>
          <div className="font-mono text-lg font-bold text-ind-accent mb-1">
            {stub.id}
          </div>
          <div className="text-xs text-ind-text-muted line-clamp-2">
            {stub.feature_name}
          </div>
        </div>

        {/* Instructions Count */}
        <div className="bg-ind-panel rounded border border-ind-border p-4">
          <div className="text-xs font-bold text-ind-text-muted uppercase tracking-wider mb-2">
            Instructions
          </div>
          <div className="text-3xl font-bold text-ind-text">
            {instructionBlocks.length}
          </div>
          <div className="text-xs text-ind-text-muted">
            blocks
          </div>
        </div>

        {/* Context Files */}
        <div className="bg-ind-panel rounded border border-ind-border p-4">
          <div className="text-xs font-bold text-ind-text-muted uppercase tracking-wider mb-2">
            Context
          </div>
          <div className="text-3xl font-bold text-ind-text">
            {contextFiles.length}
          </div>
          <div className="text-xs text-ind-text-muted">
            files
          </div>
        </div>

        {/* Agents */}
        <div className="bg-ind-panel rounded border border-ind-border p-4">
          <div className="text-xs font-bold text-ind-text-muted uppercase tracking-wider mb-2">
            Agents
          </div>
          <div className="text-3xl font-bold text-ind-text">
            {agents.length}
          </div>
          <div className="text-xs text-ind-text-muted">
            assigned
          </div>
        </div>
      </div>

      {/* Validation Status */}
      {!validationResult.isValid && (
        <div className="border-2 border-ind-error rounded-lg p-4 bg-ind-error/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-ind-error flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-ind-error mb-2">
                Validation Errors
              </h4>
              <ul className="text-sm text-ind-error space-y-1">
                {validationResult.errors.map((err, index) => (
                  <li key={index}>• {err.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {validationResult.warnings.length > 0 && (
        <div className="border-2 border-yellow-500/30 rounded-lg p-4 bg-yellow-500/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-yellow-400 mb-2">
                Warnings
              </h4>
              <ul className="text-sm text-yellow-400 space-y-1">
                {validationResult.warnings.map((warn, index) => (
                  <li key={index}>• {warn.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Generation Progress */}
      <div className="bg-ind-panel rounded border border-ind-border p-6">
        <h4 className="text-sm font-bold text-ind-text uppercase tracking-wider mb-4">
          Generation Steps
        </h4>

        <div className="space-y-3">
          {generationSteps.map((step, index) => {
            const Icon =
              step.status === 'completed'
                ? CheckCircle2
                : step.status === 'error'
                ? AlertCircle
                : step.status === 'processing'
                ? Loader2
                : step.step.endsWith('/')
                ? Folder
                : FileText;

            const iconColor =
              step.status === 'completed'
                ? 'text-green-400'
                : step.status === 'error'
                ? 'text-ind-error'
                : step.status === 'processing'
                ? 'text-ind-accent'
                : 'text-ind-text-muted';

            return (
              <div
                key={step.step}
                className={`flex items-center gap-3 p-3 rounded border ${
                  step.status === 'completed'
                    ? 'border-green-500/30 bg-green-500/5'
                    : step.status === 'error'
                    ? 'border-ind-error/30 bg-ind-error/5'
                    : step.status === 'processing'
                    ? 'border-ind-accent/30 bg-ind-accent/5'
                    : 'border-ind-border bg-ind-bg'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${iconColor} flex-shrink-0 ${
                    step.status === 'processing' ? 'animate-spin' : ''
                  }`}
                />
                <div className="flex-1">
                  <div className="text-sm font-bold text-ind-text">
                    {step.step}
                  </div>
                  {step.message && (
                    <div className="text-xs text-ind-text-muted mt-0.5">
                      {step.message}
                    </div>
                  )}
                </div>
                <div className="text-xs font-bold text-ind-text-muted uppercase tracking-wider">
                  {step.status}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="border-2 border-ind-error rounded-lg p-4 bg-ind-error/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-ind-error flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-ind-error mb-1">
                Generation Failed
              </h4>
              <p className="text-sm text-ind-error">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {isComplete && sessionPath && (
        <div className="border-2 border-green-500/30 rounded-lg p-4 bg-green-500/5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-green-400 mb-1">
                Session Generated Successfully
              </h4>
              <p className="text-sm text-green-400 font-mono">
                {sessionPath}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Generate Button */}
      {!isComplete && (
        <div className="flex items-center justify-between pt-6 border-t border-ind-border">
          <div className="text-xs text-ind-text-muted">
            {validationResult.isValid
              ? 'Ready to generate'
              : getValidationSummary(validationResult)}
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !validationResult.isValid}
            className={`px-6 py-3 font-bold uppercase tracking-wider text-sm transition-all flex items-center gap-2 ${
              validationResult.isValid && !isGenerating
                ? 'bg-ind-accent text-black hover:bg-ind-accent/90 active:translate-y-0.5'
                : 'bg-ind-border text-ind-text-muted cursor-not-allowed'
            }`}
          >
            {isGenerating && <Loader2 className="w-4 h-4 animate-spin" />}
            {isGenerating ? 'Generating...' : 'Generate Session'}
          </button>
        </div>
      )}
    </div>
  );
};

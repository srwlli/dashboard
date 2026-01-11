'use client';

import React from 'react';
import { CheckCircle2, Folder, FileText, Copy, ExternalLink } from 'lucide-react';

interface SessionCreationCompleteProps {
  sessionPath: string;
  sessionId: string;
  agentCount: number;
  onCreateAnother: () => void;
}

export const SessionCreationComplete: React.FC<SessionCreationCompleteProps> = ({
  sessionPath,
  sessionId,
  agentCount,
  onCreateAnother
}) => {
  const [copied, setCopied] = React.useState(false);

  // Copy path to clipboard
  const handleCopyPath = () => {
    navigator.clipboard.writeText(sessionPath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Files generated
  const generatedFiles = [
    {
      name: 'context-backbone.md',
      description: 'Comprehensive context package (15,000-20,000 lines)',
      icon: FileText
    },
    {
      name: 'communication.json',
      description: 'Agent coordination metadata and execution waves',
      icon: FileText
    },
    {
      name: 'instructions.json',
      description: 'Freeform instructions with type classification',
      icon: FileText
    },
    {
      name: 'agent-prompts/',
      description: `${agentCount} individual agent prompt files`,
      icon: Folder
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Success Header */}
      <div className="text-center py-8">
        <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-ind-text mb-2">
          Session Created Successfully
        </h1>
        <p className="text-sm text-ind-text-muted">
          Your multi-agent session is ready for execution
        </p>
      </div>

      {/* Session Info */}
      <div className="bg-ind-panel rounded border border-ind-border p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Session ID */}
          <div>
            <div className="text-xs font-bold text-ind-text-muted uppercase tracking-wider mb-1">
              Session ID
            </div>
            <div className="font-mono text-sm font-bold text-ind-accent">
              {sessionId}
            </div>
          </div>

          {/* Agent Count */}
          <div>
            <div className="text-xs font-bold text-ind-text-muted uppercase tracking-wider mb-1">
              Agents
            </div>
            <div className="text-sm font-bold text-ind-text">
              {agentCount} parallel agents configured
            </div>
          </div>
        </div>

        {/* Session Path */}
        <div className="mt-4 pt-4 border-t border-ind-border">
          <div className="text-xs font-bold text-ind-text-muted uppercase tracking-wider mb-2">
            Session Directory
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 font-mono text-sm text-ind-text bg-ind-bg px-3 py-2 rounded border border-ind-border overflow-x-auto">
              {sessionPath}
            </div>
            <button
              onClick={handleCopyPath}
              className="px-3 py-2 bg-ind-panel border border-ind-border text-ind-text hover:bg-ind-bg transition-all"
              title="Copy path"
            >
              {copied ? (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Files */}
      <div>
        <h3 className="text-lg font-bold text-ind-text mb-3">
          Generated Files
        </h3>
        <div className="space-y-2">
          {generatedFiles.map((file, index) => {
            const Icon = file.icon;
            return (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded border border-ind-border bg-ind-panel"
              >
                <Icon className="w-5 h-5 text-ind-accent flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-mono text-sm font-bold text-ind-text mb-1">
                    {file.name}
                  </div>
                  <div className="text-xs text-ind-text-muted">
                    {file.description}
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-ind-accent/10 border border-ind-accent/30 rounded-lg p-6">
        <h3 className="text-sm font-bold text-ind-text uppercase tracking-wider mb-3">
          Next Steps
        </h3>
        <ol className="space-y-2 text-sm text-ind-text-muted">
          <li className="flex items-start gap-2">
            <span className="font-bold text-ind-accent">1.</span>
            <span>Navigate to the session directory in your file explorer</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-ind-accent">2.</span>
            <span>Review the context-backbone.md to verify all context is included</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-ind-accent">3.</span>
            <span>Open agent-prompts/ and copy individual prompts to agent sessions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-ind-accent">4.</span>
            <span>Use communication.json to coordinate agent execution waves</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-ind-accent">5.</span>
            <span>Monitor agent progress and track outputs as they complete</span>
          </li>
        </ol>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* View Session */}
        <button
          onClick={() => {
            // Open file explorer to session directory
            if (typeof window !== 'undefined' && 'electron' in window) {
              // Electron: use shell.openPath
              // @ts-ignore
              window.electron?.shell?.openPath(sessionPath);
            } else {
              // Browser: show alert with path
              alert(`Session created at:\n${sessionPath}`);
            }
          }}
          className="px-6 py-3 font-bold uppercase tracking-wider text-sm bg-ind-panel border border-ind-border text-ind-text hover:bg-ind-bg transition-all flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Open Session Folder
        </button>

        {/* Create Another */}
        <button
          onClick={onCreateAnother}
          className="px-6 py-3 font-bold uppercase tracking-wider text-sm bg-ind-accent text-black hover:bg-ind-accent/90 transition-all"
        >
          Create Another Session
        </button>
      </div>

      {/* Session Summary Card */}
      <div className="text-center py-6 border-t border-ind-border">
        <p className="text-sm text-ind-text-muted mb-2">
          Session created on {new Date().toLocaleString()}
        </p>
        <p className="text-xs text-ind-text-muted">
          Powered by CodeRef Dashboard Sessions Hub
        </p>
      </div>
    </div>
  );
};

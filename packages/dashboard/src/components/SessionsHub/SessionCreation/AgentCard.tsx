'use client';

import React from 'react';
import { Bot, CheckCircle2, Circle, FileText, Paperclip, AlertCircle } from 'lucide-react';

interface AgentCardProps {
  agentNumber: number;
  role: string;
  assignedInstructions: number;
  assignedAttachments: number;
  outputFiles: string[];
  dependsOn: number[];
  isAssigned: boolean;
  onSelect: () => void;
  onConfigure?: () => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  agentNumber,
  role,
  assignedInstructions,
  assignedAttachments,
  outputFiles,
  dependsOn,
  isAssigned,
  onSelect,
  onConfigure
}) => {
  // Calculate agent readiness
  const hasInstructions = assignedInstructions > 0;
  const hasOutputs = outputFiles.length > 0;
  const isReady = hasInstructions && hasOutputs;

  // Get status color
  const getStatusColor = () => {
    if (isReady) return 'text-green-400';
    if (isAssigned) return 'text-yellow-400';
    return 'text-ind-text-muted';
  };

  // Get status text
  const getStatusText = () => {
    if (isReady) return 'Ready';
    if (isAssigned) return 'Configuring';
    return 'Unassigned';
  };

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded border transition-all ${
        isAssigned
          ? 'border-ind-accent bg-ind-accent/5'
          : 'border-ind-border bg-ind-panel hover:bg-ind-bg'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Selection Indicator */}
        <div className="flex-shrink-0 mt-0.5">
          {isAssigned ? (
            <CheckCircle2 className="w-5 h-5 text-ind-accent" />
          ) : (
            <Circle className="w-5 h-5 text-ind-text-muted" />
          )}
        </div>

        {/* Agent Icon */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-ind-accent/10 border border-ind-accent/30 flex items-center justify-center">
            <Bot className="w-5 h-5 text-ind-accent" />
          </div>
        </div>

        {/* Agent Details */}
        <div className="flex-1 min-w-0">
          {/* Agent Name + Status */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-sm text-ind-text">
              Agent {agentNumber}
            </span>
            <span className={`text-xs font-bold ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>

          {/* Role */}
          {role && (
            <p className="text-xs text-ind-text-muted mb-2 line-clamp-1">
              {role}
            </p>
          )}

          {/* Assignments */}
          {isAssigned && (
            <div className="space-y-1.5">
              {/* Instructions Count */}
              <div className="flex items-center gap-2 text-xs">
                <FileText className="w-3.5 h-3.5 text-ind-accent" />
                <span className="text-ind-text">
                  {assignedInstructions} instruction{assignedInstructions !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Attachments Count */}
              {assignedAttachments > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <Paperclip className="w-3.5 h-3.5 text-ind-accent" />
                  <span className="text-ind-text">
                    {assignedAttachments} attachment{assignedAttachments !== 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {/* Output Files */}
              {outputFiles.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs font-bold text-ind-text-muted uppercase tracking-wider">
                    Outputs:
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {outputFiles.slice(0, 3).map((file, index) => (
                      <div key={index} className="text-xs font-mono text-ind-text truncate">
                        {file}
                      </div>
                    ))}
                    {outputFiles.length > 3 && (
                      <div className="text-xs text-ind-text-muted">
                        +{outputFiles.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Dependencies */}
              {dependsOn.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-xs text-ind-text">
                      Depends on: Agent {dependsOn.join(', Agent ')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Unassigned State */}
          {!isAssigned && (
            <p className="text-xs text-ind-text-muted">
              Click to assign instructions and attachments
            </p>
          )}

          {/* Configure Button */}
          {isAssigned && onConfigure && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onConfigure();
              }}
              className="mt-3 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-ind-panel border border-ind-border text-ind-text hover:bg-ind-bg transition-all"
            >
              Configure
            </button>
          )}
        </div>
      </div>

      {/* Readiness Indicator */}
      {isAssigned && (
        <div className="mt-3 pt-3 border-t border-ind-border">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-400' : 'bg-yellow-400'}`} />
            <span className="text-xs text-ind-text-muted">
              {isReady ? 'Ready for execution' : 'Missing required configuration'}
            </span>
          </div>
        </div>
      )}
    </button>
  );
};

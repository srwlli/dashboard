import React from 'react';
import { Zap, Lock, Sparkles, Building2, FlaskConical, Accessibility, AlertTriangle, Palette, FileText, Code2, GitBranch, Plug, Ruler, Users, Database, FileOutput, LucideIcon } from 'lucide-react';
import { PreloadedPrompt } from '../types';
import { formatTokenCount } from '../utils/tokenEstimator';
import { getAllTags } from '../constants/tags';
import { getAllEcosystemTags } from '../constants/ecosystem-tags';

// Icon map for tag icons (CODE_REVIEW + CODEREF_ECOSYSTEM_REVIEW)
const ICON_MAP: Record<string, LucideIcon> = {
  // CODE_REVIEW tags
  'Zap': Zap,
  'Lock': Lock,
  'Sparkles': Sparkles,
  'Building2': Building2,
  'FlaskConical': FlaskConical,
  'Accessibility': Accessibility,
  'AlertTriangle': AlertTriangle,
  'Palette': Palette,
  // CODEREF_ECOSYSTEM_REVIEW tags
  'FileText': FileText,
  'Code2': Code2,
  'GitBranch': GitBranch,
  'Plug': Plug,
  'Ruler': Ruler,
  'Users': Users,
  'Database': Database,
  'FileOutput': FileOutput,
};

interface PromptSelectorProps {
  prompts: PreloadedPrompt[];
  selectedPromptKey?: string;
  selectedTags?: string[];
  onSelectPrompt: (prompt: PreloadedPrompt) => void;
  onToggleTag?: (tagId: string) => void;
}

export const PromptSelector: React.FC<PromptSelectorProps> = ({
  prompts,
  selectedPromptKey,
  selectedTags = [],
  onSelectPrompt,
  onToggleTag,
}) => {
  const allTags = getAllTags();
  const allEcosystemTags = getAllEcosystemTags();

  return (
    <div className="w-full">
      <h3 className="text-sm uppercase tracking-widest text-ind-text-muted font-mono mb-4 font-bold">
        Select Prompt
      </h3>
      <p className="text-ind-text-muted text-xs font-mono mb-4">
        Choose an analysis workflow
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {prompts.map((prompt) => (
          <div
            key={prompt.key}
            role="button"
            tabIndex={0}
            className={`p-4 border-2 transition-all cursor-pointer text-left ${
              selectedPromptKey === prompt.key
                ? 'border-ind-accent bg-ind-panel shadow-lg shadow-ind-accent/20'
                : 'border-ind-border bg-ind-panel hover:border-ind-accent'
            }`}
            onClick={() => onSelectPrompt(prompt)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectPrompt(prompt);
              }
            }}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="text-sm font-bold text-ind-text">{prompt.label}</h4>
              <span className="bg-ind-accent text-black px-2 py-1 text-xs font-bold whitespace-nowrap">
                {formatTokenCount(prompt.estimatedTokens)}
              </span>
            </div>
            <p className="text-xs text-ind-text-muted mb-3 line-clamp-2">{prompt.description}</p>

            {/* Tag chips - Only show for CODE_REVIEW prompt */}
            {prompt.key === '0001' && onToggleTag && (
              <div className="mt-3 mb-3 border-t border-ind-border pt-3">
                <p className="text-xs text-ind-text-muted mb-2 font-mono">
                  Focus Areas (click to select):
                </p>
                <div className="flex flex-wrap gap-2 overflow-x-auto">
                  {allTags.map((tag) => {
                    const isActive = selectedTags.includes(tag.id);
                    const IconComponent = ICON_MAP[tag.icon];
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleTag(tag.id);
                        }}
                        className={`
                          px-2 py-1 text-xs font-medium rounded transition-all whitespace-nowrap flex items-center gap-1
                          ${isActive
                            ? 'border-2 border-ind-accent bg-ind-accent/10 text-ind-text'
                            : 'border border-ind-border bg-ind-bg text-ind-text-muted hover:border-ind-accent'
                          }
                        `}
                        title={tag.description}
                      >
                        {IconComponent && <IconComponent className="w-3 h-3" />}
                        {tag.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ecosystem tag chips - Only show for CODEREF_ECOSYSTEM_REVIEW prompt */}
            {prompt.key === '0004' && onToggleTag && (
              <div className="mt-3 mb-3 border-t border-ind-border pt-3">
                <p className="text-xs text-ind-text-muted mb-2 font-mono">
                  Ecosystem Focus Areas (click to select):
                </p>
                <div className="flex flex-wrap gap-2 overflow-x-auto">
                  {allEcosystemTags.map((tag) => {
                    const isActive = selectedTags.includes(tag.id);
                    const IconComponent = ICON_MAP[tag.icon];
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleTag(tag.id);
                        }}
                        className={`
                          px-2 py-1 text-xs font-medium rounded transition-all whitespace-nowrap flex items-center gap-1
                          ${isActive
                            ? 'border-2 border-ind-accent bg-ind-accent/10 text-ind-text'
                            : 'border border-ind-border bg-ind-bg text-ind-text-muted hover:border-ind-accent'
                          }
                        `}
                        title={tag.description}
                      >
                        {IconComponent && <IconComponent className="w-3 h-3" />}
                        {tag.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-between text-xs text-ind-text-muted">
              <span>Prompt {prompt.key}</span>
              <span className="text-ind-accent font-bold">~{prompt.estimatedTokens.toLocaleString()} tokens</span>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 bg-ind-bg border border-ind-border border-dashed rounded">
        <p className="text-xs text-ind-text m-0">
          Selected: <strong className="text-ind-accent">
            {selectedPromptKey ? prompts.find((p) => p.key === selectedPromptKey)?.label : 'NONE'}
          </strong>
        </p>
      </div>
    </div>
  );
};

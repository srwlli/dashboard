'use client';

import React from 'react';
import { GripVertical, X, FileText, Info, Code, AlertCircle } from 'lucide-react';
import type { InstructionBlock as InstructionBlockType, BlockType } from './types';

interface InstructionBlockProps {
  block: InstructionBlockType;
  index: number;
  onUpdate: (id: string, content: string, type: BlockType) => void;
  onRemove: (id: string) => void;
}

const blockTypeConfig = {
  task: {
    label: 'Task',
    icon: FileText,
    borderColor: 'border-l-green-500',
    bgColor: 'bg-green-500/5',
    description: 'Actionable task for agents to execute'
  },
  guideline: {
    label: 'Guideline',
    icon: Info,
    borderColor: 'border-l-blue-500',
    bgColor: 'bg-blue-500/5',
    description: 'Guidance on how to approach the work'
  },
  example: {
    label: 'Example',
    icon: Code,
    borderColor: 'border-l-purple-500',
    bgColor: 'bg-purple-500/5',
    description: 'Code or text example for reference'
  },
  constraint: {
    label: 'Constraint',
    icon: AlertCircle,
    borderColor: 'border-l-orange-500',
    bgColor: 'bg-orange-500/5',
    description: 'Hard constraints or forbidden actions'
  }
};

export const InstructionBlock: React.FC<InstructionBlockProps> = ({
  block,
  index,
  onUpdate,
  onRemove
}) => {
  const config = blockTypeConfig[block.type];
  const Icon = config.icon;

  return (
    <div
      className={`border-2 border-ind-border ${config.borderColor} border-l-4 rounded bg-ind-panel overflow-hidden transition-all hover:border-ind-accent/50 ${config.bgColor}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-ind-bg/50 border-b border-ind-border">
        {/* Drag Handle */}
        <button
          type="button"
          className="flex-shrink-0 text-ind-text-muted hover:text-ind-text cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Block Number */}
        <span className="text-xs font-mono font-bold text-ind-text-muted">
          #{index + 1}
        </span>

        {/* Type Selector */}
        <select
          value={block.type}
          onChange={(e) => onUpdate(block.id, block.content, e.target.value as BlockType)}
          className="flex-1 px-2 py-1 text-xs font-bold bg-transparent border border-ind-border rounded text-ind-text focus:outline-none focus:border-ind-accent transition-colors"
        >
          {Object.entries(blockTypeConfig).map(([type, cfg]) => (
            <option key={type} value={type}>
              {cfg.label}
            </option>
          ))}
        </select>

        {/* Icon */}
        <div className="flex-shrink-0 text-ind-text-muted">
          <Icon className="w-4 h-4" />
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={() => onRemove(block.id)}
          className="flex-shrink-0 text-ind-text-muted hover:text-ind-error transition-colors"
          title="Remove block"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content Textarea */}
      <textarea
        value={block.content}
        onChange={(e) => onUpdate(block.id, e.target.value, block.type)}
        placeholder={`Enter ${config.label.toLowerCase()} instructions... (Markdown supported)`}
        className="w-full min-h-[120px] p-3 bg-transparent text-sm text-ind-text placeholder:text-ind-text-muted font-mono resize-y focus:outline-none"
        style={{ lineHeight: '1.6' }}
      />

      {/* Footer with character count */}
      <div className="px-3 py-2 bg-ind-bg/30 border-t border-ind-border flex items-center justify-between">
        <span className="text-xs text-ind-text-muted">{config.description}</span>
        <span className="text-xs font-mono text-ind-text-muted">
          {block.content.length} chars
        </span>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { Plus, Eye, EyeOff } from 'lucide-react';
import { InstructionBlock } from './InstructionBlock';
import type { InstructionBlock as InstructionBlockType, BlockType } from './types';

interface InstructionEditorProps {
  blocks: InstructionBlockType[];
  onAddBlock: () => void;
  onUpdateBlock: (id: string, content: string, type: BlockType) => void;
  onRemoveBlock: (id: string) => void;
  onReorderBlocks?: (blocks: InstructionBlockType[]) => void;
}

export const InstructionEditor: React.FC<InstructionEditorProps> = ({
  blocks,
  onAddBlock,
  onUpdateBlock,
  onRemoveBlock,
  onReorderBlocks
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const totalChars = blocks.reduce((sum, block) => sum + block.content.length, 0);
  const estimatedTokens = Math.ceil(totalChars / 4);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm uppercase tracking-widest text-ind-text-muted font-mono font-bold mb-1">
            Instructions
          </h3>
          <p className="text-xs text-ind-text-muted">
            Add instruction blocks to guide agent behavior (Markdown supported)
          </p>
        </div>

        {/* Preview Toggle */}
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-ind-panel border border-ind-border rounded hover:border-ind-accent transition-colors"
          title={showPreview ? 'Hide preview (Ctrl+P)' : 'Show preview (Ctrl+P)'}
        >
          {showPreview ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              Hide Preview
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              Preview
            </>
          )}
        </button>
      </div>

      {/* Instruction Blocks */}
      <div className="space-y-3">
        {blocks.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-ind-border rounded bg-ind-panel/50">
            <p className="text-sm text-ind-text-muted mb-4">
              No instruction blocks yet. Add your first block to get started.
            </p>
            <button
              type="button"
              onClick={onAddBlock}
              className="px-4 py-2 bg-ind-accent text-black font-bold uppercase tracking-wider text-sm hover:bg-ind-accent/90 transition-all"
            >
              <Plus className="w-4 h-4 inline-block mr-2" />
              Add First Block
            </button>
          </div>
        ) : (
          <>
            {blocks.map((block, index) => (
              <InstructionBlock
                key={block.id}
                block={block}
                index={index}
                onUpdate={onUpdateBlock}
                onRemove={onRemoveBlock}
              />
            ))}
          </>
        )}
      </div>

      {/* Add Block Button */}
      {blocks.length > 0 && (
        <button
          type="button"
          onClick={onAddBlock}
          className="w-full px-4 py-3 border-2 border-dashed border-ind-border rounded text-sm font-bold text-ind-text-muted hover:border-ind-accent hover:text-ind-accent transition-all"
        >
          <Plus className="w-4 h-4 inline-block mr-2" />
          Add Instruction Block
        </button>
      )}

      {/* Stats Footer */}
      {blocks.length > 0 && (
        <div className="flex gap-6 px-4 py-3 bg-ind-bg border border-ind-border rounded">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-ind-text-muted">Blocks:</span>
            <span className="text-sm font-bold text-ind-accent">{blocks.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-ind-text-muted">Characters:</span>
            <span className="text-sm font-bold text-ind-accent">
              {totalChars.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-ind-text-muted">Est. Tokens:</span>
            <span className="text-sm font-bold text-ind-accent">
              ~{estimatedTokens.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Markdown Preview */}
      {showPreview && blocks.length > 0 && (
        <div className="border border-ind-border rounded overflow-hidden">
          <div className="px-4 py-2 bg-ind-bg border-b border-ind-border">
            <h4 className="text-xs uppercase tracking-wider text-ind-text font-bold">
              Preview (Combined Output)
            </h4>
          </div>
          <div className="p-4 bg-ind-panel max-h-[400px] overflow-y-auto">
            <div className="prose prose-sm prose-invert max-w-none">
              {blocks.map((block, index) => (
                <div key={block.id} className="mb-6 last:mb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-ind-text-muted">
                      Block #{index + 1}
                    </span>
                    <span className="text-xs font-bold uppercase text-ind-accent">
                      {block.type}
                    </span>
                  </div>
                  <div className="text-sm text-ind-text whitespace-pre-wrap font-mono leading-relaxed">
                    {block.content || <span className="text-ind-text-muted italic">(empty)</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

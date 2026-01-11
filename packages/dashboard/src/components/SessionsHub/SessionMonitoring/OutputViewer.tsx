'use client';

/**
 * OutputViewer Component
 *
 * Modal component to display agent output files with:
 * - File type detection (JSON, Markdown, Text)
 * - Syntax highlighting for JSON
 * - Markdown rendering
 * - Plain text display
 * - Download button
 * - Close button
 */

import React, { useEffect, useState } from 'react';
import { X, Download, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface OutputViewerProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  content: string | null;
  fileName?: string;
  isLoading?: boolean;
}

/**
 * Detect file type from content or filename
 */
function detectFileType(content: string, fileName?: string): 'json' | 'markdown' | 'text' {
  // Check filename extension
  if (fileName) {
    if (fileName.endsWith('.json')) return 'json';
    if (fileName.endsWith('.md')) return 'markdown';
  }

  // Try to parse as JSON
  try {
    JSON.parse(content);
    return 'json';
  } catch {
    // Check for markdown markers
    if (content.includes('# ') || content.includes('## ') || content.includes('```')) {
      return 'markdown';
    }
  }

  return 'text';
}

/**
 * Download content as file
 */
function downloadContent(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function OutputViewer({
  isOpen,
  onClose,
  agentId,
  content,
  fileName,
  isLoading = false
}: OutputViewerProps) {
  const [fileType, setFileType] = useState<'json' | 'markdown' | 'text'>('text');

  useEffect(() => {
    if (content) {
      setFileType(detectFileType(content, fileName));
    }
  }, [content, fileName]);

  if (!isOpen) return null;

  const displayFileName = fileName || `${agentId}-output.txt`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-ind-bg border border-ind-border rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-ind-border">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-ind-accent" />
            <div>
              <h2 className="text-lg font-semibold text-ind-text">
                Agent Output
              </h2>
              <p className="text-sm text-ind-text-muted">
                {agentId} • {displayFileName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Download Button */}
            {content && (
              <button
                onClick={() => downloadContent(content, displayFileName)}
                className="p-2 rounded-md border border-ind-border bg-ind-panel text-ind-text hover:border-ind-accent hover:text-ind-accent transition-colors"
                title="Download file"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-md border border-ind-border bg-ind-panel text-ind-text hover:border-ind-error hover:text-ind-error transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-ind-text-muted">Loading...</div>
            </div>
          ) : !content ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-3 text-ind-text-muted opacity-50" />
                <p className="text-ind-text-muted">No output available</p>
              </div>
            </div>
          ) : (
            <>
              {/* JSON Rendering */}
              {fileType === 'json' && (
                <SyntaxHighlighter
                  language="json"
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                  showLineNumbers
                >
                  {content}
                </SyntaxHighlighter>
              )}

              {/* Markdown Rendering */}
              {fileType === 'markdown' && (
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              )}

              {/* Plain Text Rendering */}
              {fileType === 'text' && (
                <pre className="text-sm text-ind-text font-mono whitespace-pre-wrap break-words bg-ind-panel p-4 rounded-md border border-ind-border">
                  {content}
                </pre>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-ind-border flex items-center justify-between text-xs text-ind-text-muted">
          <div>
            Type: {fileType.toUpperCase()} • Size: {content ? new Blob([content]).size : 0} bytes
          </div>
          <div>
            Press ESC to close
          </div>
        </div>
      </div>
    </div>
  );
}

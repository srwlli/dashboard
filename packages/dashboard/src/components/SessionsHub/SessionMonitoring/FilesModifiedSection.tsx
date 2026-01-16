'use client';

/**
 * FilesModifiedSection Component
 *
 * Displays files modified during session execution.
 * Shows list of file paths with file type icons and relative paths.
 */

import React from 'react';
import { FileText, FileCode, FileJson, File } from 'lucide-react';

interface FilesModifiedSectionProps {
  files: string[];
  className?: string;
}

/**
 * Get icon for file based on extension
 */
function getFileIcon(filePath: string) {
  const ext = filePath.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
    case 'py':
    case 'java':
    case 'cpp':
    case 'c':
    case 'go':
    case 'rs':
      return FileCode;
    case 'json':
      return FileJson;
    case 'md':
    case 'txt':
      return FileText;
    default:
      return File;
  }
}

/**
 * Get file extension color
 */
function getFileColor(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'text-blue-400';
    case 'js':
    case 'jsx':
      return 'text-yellow-400';
    case 'py':
      return 'text-green-400';
    case 'json':
      return 'text-orange-400';
    case 'md':
      return 'text-purple-400';
    default:
      return 'text-ind-text-muted';
  }
}

export default function FilesModifiedSection({
  files,
  className = ''
}: FilesModifiedSectionProps) {
  if (!files || files.length === 0) {
    return null;
  }

  return (
    <div className={`border border-ind-border rounded-lg p-4 bg-ind-panel ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-5 h-5 text-ind-accent" />
        <h3 className="text-lg font-semibold text-ind-text">
          Files Modified
        </h3>
        <span className="ml-auto px-2 py-0.5 bg-ind-accent/10 text-ind-accent rounded text-xs font-medium">
          {files.length}
        </span>
      </div>

      <p className="text-sm text-ind-text-muted mb-3">
        Files modified during session execution
      </p>

      <div className="space-y-1">
        {files.map((filePath, index) => {
          const Icon = getFileIcon(filePath);
          const colorClass = getFileColor(filePath);

          return (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-ind-bg rounded-md border border-ind-border hover:border-ind-accent transition-colors group"
            >
              <Icon className={`w-4 h-4 ${colorClass} flex-shrink-0`} />
              <span className="text-xs font-mono text-ind-text truncate" title={filePath}>
                {filePath}
              </span>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {files.length === 0 && (
        <div className="text-center py-6">
          <FileText className="w-8 h-8 text-ind-text-muted mx-auto mb-2 opacity-50" />
          <p className="text-sm text-ind-text-muted">
            No files modified yet
          </p>
        </div>
      )}
    </div>
  );
}

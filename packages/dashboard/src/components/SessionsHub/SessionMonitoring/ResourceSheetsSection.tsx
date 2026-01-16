'use client';

/**
 * ResourceSheetsSection Component
 *
 * Displays resource sheets accessed during session execution.
 * Shows list of *-RESOURCE-SHEET.md files with links.
 */

import React from 'react';
import { Book, ExternalLink } from 'lucide-react';

interface ResourceSheetsSectionProps {
  resourceSheets: string[];
  className?: string;
}

/**
 * Extract resource sheet name from file path
 * e.g., "coderef/resources-sheets/Auth-System-RESOURCE-SHEET.md" → "Auth System"
 */
function getResourceSheetName(filePath: string): string {
  const fileName = filePath.split('/').pop() || filePath;
  const nameWithoutExtension = fileName.replace('-RESOURCE-SHEET.md', '');
  return nameWithoutExtension.replace(/-/g, ' ');
}

export default function ResourceSheetsSection({
  resourceSheets,
  className = ''
}: ResourceSheetsSectionProps) {
  if (!resourceSheets || resourceSheets.length === 0) {
    return null;
  }

  return (
    <div className={`border border-ind-border rounded-lg p-4 bg-ind-panel ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Book className="w-5 h-5 text-ind-accent" />
        <h3 className="text-lg font-semibold text-ind-text">
          Resource Sheets
        </h3>
        <span className="ml-auto px-2 py-0.5 bg-ind-accent/10 text-ind-accent rounded text-xs font-medium">
          {resourceSheets.length}
        </span>
      </div>

      <p className="text-sm text-ind-text-muted mb-3">
        Resource sheets accessed during session execution
      </p>

      <div className="space-y-2">
        {resourceSheets.map((sheetPath, index) => {
          const sheetName = getResourceSheetName(sheetPath);

          return (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-ind-bg rounded-md border border-ind-border hover:border-ind-accent transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Book className="w-4 h-4 text-ind-text-muted group-hover:text-ind-accent transition-colors" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-ind-text">
                    {sheetName}
                  </span>
                  <span className="text-xs text-ind-text-muted font-mono truncate max-w-md" title={sheetPath}>
                    {sheetPath}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  // Future: Open resource sheet in viewer
                  console.log('Open resource sheet:', sheetPath);
                }}
                className="flex items-center gap-1.5 px-2 py-1 text-xs text-ind-accent hover:bg-ind-accent/10 rounded transition-colors flex-shrink-0"
                title="View resource sheet"
              >
                <span>View</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {resourceSheets.length === 0 && (
        <div className="text-center py-6">
          <Book className="w-8 h-8 text-ind-text-muted mx-auto mb-2 opacity-50" />
          <p className="text-sm text-ind-text-muted">
            No resource sheets accessed yet
          </p>
        </div>
      )}
    </div>
  );
}

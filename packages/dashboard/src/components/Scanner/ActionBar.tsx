'use client';

import { useState } from 'react';

/**
 * ActionBar Component
 * Bottom action bar - Scan button + Clear button
 * Shows disabled state when no projects selected
 */
interface ActionBarProps {
  selectedProjectIds: string[];
  onScanStart?: (scanId: string) => void;
}

export function ActionBar({ selectedProjectIds, onScanStart }: ActionBarProps) {
  const [scanning, setScanning] = useState(false);
  const selectedCount = selectedProjectIds.length;

  async function handleScan() {
    if (selectedCount === 0 || scanning) return;

    try {
      setScanning(true);

      const response = await fetch('/api/scanner/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectIds: selectedProjectIds }),
      });

      const data = await response.json();

      if (data.success) {
        onScanStart?.(data.data.scanId);
      } else {
        alert(`Failed to start scan: ${data.error.message}`);
      }
    } catch (error) {
      console.error('Failed to start scan:', error);
      alert('Failed to start scan');
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Status */}
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          <span className="font-medium">{selectedCount}</span> projects selected
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleScan}
            disabled={selectedCount === 0 || scanning}
            className={`
              px-6 py-2 rounded-md text-sm font-medium transition-colors
              ${
                selectedCount === 0 || scanning
                  ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
                  : 'bg-ind-accent-color hover:bg-ind-accent-hover text-white'
              }
            `}
          >
            {scanning ? 'Starting...' : 'Scan Projects'}
          </button>
        </div>
      </div>
    </div>
  );
}

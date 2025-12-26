import React, { useState, useRef, useEffect } from 'react';

interface ExportMenuProps {
  onCopyJSON: () => Promise<void>;
  onExportJSON: () => Promise<void>;
  onExportMarkdown: () => Promise<void>;
  disabled?: boolean;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  onCopyJSON,
  onExportJSON,
  onExportMarkdown,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyJSON = async () => {
    setIsLoading(true);
    try {
      await onCopyJSON();
      setMessage('✓ Copied to clipboard');
      setTimeout(() => setMessage(null), 2000);
      setIsOpen(false);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to copy';
      setMessage(`✗ ${msg}`);
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportJSON = async () => {
    setIsLoading(true);
    try {
      await onExportJSON();
      setMessage('✓ Exported as JSON');
      setTimeout(() => setMessage(null), 2000);
      setIsOpen(false);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to export';
      setMessage(`✗ ${msg}`);
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportMarkdown = async () => {
    setIsLoading(true);
    try {
      await onExportMarkdown();
      setMessage('✓ Exported as Markdown');
      setTimeout(() => setMessage(null), 2000);
      setIsOpen(false);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to export';
      setMessage(`✗ ${msg}`);
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={menuRef} className="flex gap-3 flex-wrap items-center">
      <button
        className="px-4 py-2 bg-ind-accent text-black font-bold uppercase tracking-wider text-sm hover:bg-ind-accent-hover transition-all active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleCopyJSON}
        disabled={disabled || isLoading}
        type="button"
        title="Copy workflow as JSON to clipboard"
      >
        {isLoading ? '⟳ Exporting...' : '📋 COPY ALL TO CLIPBOARD'}
      </button>

      <div className="relative">
        <button
          className="px-4 py-2 bg-ind-border text-ind-text font-bold uppercase tracking-wider text-sm hover:bg-ind-text transition-all active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          type="button"
          title="Export workflow to file"
        >
          ↓ EXPORT {isOpen ? '▲' : '▼'}
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 bg-ind-panel border border-ind-border rounded mt-1 min-w-[180px] shadow-lg z-50">
            <button
              className="flex items-center gap-3 w-full px-4 py-3 text-ind-text text-sm hover:bg-ind-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed first:rounded-t last:rounded-b text-left"
              onClick={handleExportJSON}
              disabled={isLoading}
              type="button"
            >
              <span className="text-base flex-shrink-0">📄</span>
              <span>Export as .json</span>
            </button>
            <button
              className="flex items-center gap-3 w-full px-4 py-3 text-ind-text text-sm hover:bg-ind-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed first:rounded-t last:rounded-b text-left"
              onClick={handleExportMarkdown}
              disabled={isLoading}
              type="button"
            >
              <span className="text-base flex-shrink-0">📝</span>
              <span>Export as .md</span>
            </button>
          </div>
        )}
      </div>

      {message && (
        <p className="text-xs px-3 py-2 rounded bg-green-900/30 text-green-400 whitespace-nowrap">
          {message}
        </p>
      )}
    </div>
  );
};

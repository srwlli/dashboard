import React, { useState, useRef, useEffect } from 'react';
import styles from './ExportMenu.module.css';

interface ExportMenuProps {
  onCopyJSON: () => Promise<void>;
  onExportJSON: () => Promise<void>;
  onExportMarkdown: () => Promise<void>;
  disabled?: boolean;
}

/**
 * ExportMenu - Dropdown menu for export actions
 * Options: Copy to Clipboard (JSON), Export .json, Export .md
 */
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
    <div ref={menuRef} className={styles.container}>
      <button
        className={`${styles.button} ${styles.primary}`}
        onClick={handleCopyJSON}
        disabled={disabled || isLoading}
        type="button"
        title="Copy workflow as JSON to clipboard"
      >
        {isLoading ? '⟳ Exporting...' : '📋 COPY ALL TO CLIPBOARD'}
      </button>

      <div className={styles.menuWrapper}>
        <button
          className={`${styles.button} ${styles.secondary}`}
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          type="button"
          title="Export workflow to file"
        >
          ↓ EXPORT {isOpen ? '▲' : '▼'}
        </button>

        {isOpen && (
          <div className={styles.menu}>
            <button
              className={styles.menuItem}
              onClick={handleExportJSON}
              disabled={isLoading}
              type="button"
            >
              <span className={styles.icon}>📄</span>
              <span>Export as .json</span>
            </button>
            <button
              className={styles.menuItem}
              onClick={handleExportMarkdown}
              disabled={isLoading}
              type="button"
            >
              <span className={styles.icon}>📝</span>
              <span>Export as .md</span>
            </button>
          </div>
        )}
      </div>

      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

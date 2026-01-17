'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Project, FileInfo, AccessMode } from '@/lib/coderef/types';
import { loadFileContent } from '@/lib/coderef/hybrid-router';
import { Loader2, AlertCircle, FileText, Copy, Check, Zap, Cloud, Share2, FolderTree, Maximize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { MermaidViewer } from './MermaidViewer';

interface FileViewerProps {
  /** Project containing the file */
  project: Project | null;

  /** Relative file path to display */
  filePath: string | null;

  /** Optional custom class name */
  className?: string;
}

/**
 * Extract valid Mermaid code from .mmd files by removing metadata blocks
 * 
 * Removes everything after the last valid Mermaid syntax (classDef blocks)
 * to prevent parsing errors from metadata like "Diagram Summary:", "Tip:", etc.
 * 
 * @param content - Raw file content from .mmd file
 * @returns Clean Mermaid code without metadata
 */
function extractMermaidCode(content: string): string {
  if (!content) return '';
  
  const lines = content.split('\n');
  const validLines: string[] = [];
  let foundClassDef = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Track when we've seen classDef (indicates end of diagram syntax)
    if (trimmed.includes('classDef')) {
      foundClassDef = true;
      validLines.push(line);
      continue;
    }
    
    // Stop at metadata markers (only after classDef blocks)
    if (foundClassDef) {
      if (trimmed.startsWith('Diagram Summary:') ||
          trimmed.startsWith('Tip:') ||
          trimmed.startsWith('Format:') ||
          (trimmed === '' && i > 0 && lines[i - 1]?.trim() === '')) {
        // Double blank line or metadata marker = end of diagram
        break;
      }
    }
    
    validLines.push(line);
  }
  
  return validLines.join('\n').trim();
}

export function FileViewer({ project, filePath, className = '' }: FileViewerProps) {
  const router = useRouter();
  const [fileData, setFileData] = useState<FileInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);
  const [shared, setShared] = useState(false);
  const [accessMode, setAccessMode] = useState<AccessMode | null>(null);

  // Load file when project or path changes
  useEffect(() => {
    if (project && filePath) {
      loadFile(project, filePath);
    } else {
      setFileData(null);
      setError(null);
      setAccessMode(null);
    }
  }, [project?.id, filePath]);

  const loadFile = async (proj: Project, path: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await loadFileContent(proj, path);
      setFileData(result.data);
      setAccessMode(result.mode);
    } catch (err) {
      setError((err as Error).message);
      setFileData(null);
      setAccessMode(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyContent = async () => {
    if (!fileData?.content) return;

    try {
      await navigator.clipboard.writeText(fileData.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyPath = async () => {
    if (!filePath || !project) return;

    try {
      // Clean project path - remove [Directory: ...] wrapper if present
      let projectPath = project.path;
      if (projectPath.startsWith('[Directory: ') && projectPath.endsWith(']')) {
        projectPath = projectPath.slice(12, -1); // Remove '[Directory: ' and ']'
      }

      // Construct full path from project directory through all subdirectories to file
      // Uses filePath prop which contains the complete relative path (e.g., coderef/foundation-docs/ARCHITECTURE.md)
      const fullPath = `${projectPath}/${filePath}`;
      await navigator.clipboard.writeText(fullPath);
      setCopiedPath(true);
      setTimeout(() => setCopiedPath(false), 2000);
    } catch (err) {
      console.error('Failed to copy path:', err);
    }
  };

  const handleShare = async () => {
    if (!fileData) return;

    try {
      // Use Web Share API if available, otherwise copy to clipboard
      if (navigator.share) {
        await navigator.share({
          title: fileData.name,
          text: `${fileData.name}\n\n${fileData.content}`,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } else {
        // Fallback: copy file URL or content to clipboard
        const shareText = `File: ${fileData.name}\nPath: ${fileData.path}\n\nContent:\n${fileData.content}`;
        await navigator.clipboard.writeText(shareText);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  const handleFullPage = () => {
    if (!project || !filePath) return;

    // Store project data in sessionStorage for full-page viewer to access
    sessionStorage.setItem('fullPageViewerProject', JSON.stringify(project));

    // Create URL with project ID and file path as query params
    const params = new URLSearchParams({
      projectId: project.id,
      filePath: filePath,
    });

    // Navigate to full-page viewer in same window
    router.push(`/viewer/full?${params.toString()}`);
  };

  if (!filePath) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <FileText className="w-16 h-16 mx-auto mb-4 text-ind-text-muted opacity-50" />
        <p className="text-sm text-ind-text-muted">Select a file to view its contents</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <Loader2 className="w-8 h-8 mx-auto mb-2 text-ind-accent animate-spin" />
        <p className="text-sm text-ind-text-muted">Loading file...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="flex items-start gap-2 p-3 rounded bg-red-500/10 border border-red-500/30">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-500">
            <strong>Error loading file:</strong>
            <div className="mt-1">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!fileData) {
    return null;
  }

  const isJson = fileData.extension === '.json';
  const isMarkdown = fileData.extension === '.md';
  const isMermaid = fileData.extension === '.mmd';
  const isHtml = fileData.extension === '.html' || fileData.extension === '.htm';
  const isCode =
    ['.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.c', '.cpp', '.rs', '.go', '.csv'].includes(
      fileData.extension
    );

  // Map file extension to syntax highlighter language
  const getLanguage = (ext: string): string => {
    const langMap: Record<string, string> = {
      '.ts': 'typescript',
      '.tsx': 'tsx',
      '.js': 'javascript',
      '.jsx': 'jsx',
      '.py': 'python',
      '.java': 'java',
      '.c': 'c',
      '.cpp': 'cpp',
      '.rs': 'rust',
      '.go': 'go',
      '.json': 'json',
      '.md': 'markdown',
      '.mmd': 'mermaid',
      '.csv': 'csv',
    };
    return langMap[ext] || 'text';
  };

  // Format JSON for display
  let displayContent = fileData.content;
  if (isJson && fileData.encoding === 'utf-8') {
    try {
      const parsed = JSON.parse(fileData.content);
      displayContent = JSON.stringify(parsed, null, 2);
    } catch {
      // If parsing fails, use original content
    }
  }

  // Debug mermaid files
  if (isMermaid) {
    console.log('[FileViewer] Mermaid file detected');
    console.log('[FileViewer] Extension:', fileData.extension);
    console.log('[FileViewer] Encoding:', fileData.encoding);
    console.log('[FileViewer] Content preview:', displayContent?.substring(0, 100));
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* File header */}
      <div className="flex items-center justify-between p-3 border-b border-ind-border bg-ind-panel/50">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-ind-text truncate">{fileData.name}</h3>
            {accessMode && (
              <span className="flex items-center gap-1 text-xs text-ind-text-muted">
                {accessMode === 'local' ? (
                  <>
                    <Zap className="w-3 h-3 text-green-500" />
                    <span>Local</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-3 h-3 text-blue-500" />
                    <span>API</span>
                  </>
                )}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-ind-text-muted">
            <span>{formatFileSize(fileData.size)}</span>
            <span>•</span>
            <span className="truncate font-mono">{fileData.path}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Full Page button - opens file in new tab */}
          <button
            onClick={handleFullPage}
            className="
              px-3 py-1.5 rounded text-xs
              bg-ind-bg border border-ind-border
              text-ind-text-muted hover:text-ind-text
              hover:border-ind-accent/50
              transition-colors duration-200
              flex items-center gap-2
            "
            title="Open in full page view"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Expand</span>
          </button>

          {/* Copy Path button - copies file path from project folder to file */}
          <button
            onClick={handleCopyPath}
            className="
              px-3 py-1.5 rounded text-xs
              bg-ind-bg border border-ind-border
              text-ind-text-muted hover:text-ind-text
              hover:border-ind-accent/50
              transition-colors duration-200
              flex items-center gap-2
            "
            title="Copy file path"
          >
            {copiedPath ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-500" />
                <span>Path Copied</span>
              </>
            ) : (
              <>
                <FolderTree className="w-3.5 h-3.5" />
                <span>Path</span>
              </>
            )}
          </button>

          {/* Copy Content button */}
          <button
            onClick={handleCopyContent}
            className="
              px-3 py-1.5 rounded text-xs
              bg-ind-bg border border-ind-border
              text-ind-text-muted hover:text-ind-text
              hover:border-ind-accent/50
              transition-colors duration-200
              flex items-center gap-2
            "
            title="Copy file content"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-500" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Share button - shares file via Web Share API or clipboard */}
          <button
            onClick={handleShare}
            className="
              px-3 py-1.5 rounded text-xs
              bg-ind-bg border border-ind-border
              text-ind-text-muted hover:text-ind-text
              hover:border-ind-accent/50
              transition-colors duration-200
              flex items-center gap-2
            "
            title="Share file"
          >
            {shared ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-500" />
                <span>Shared</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* File content - renders markdown as HTML, code with syntax highlighting */}
      <div className="flex-1 overflow-auto p-4 bg-ind-bg">
        {fileData.encoding === 'base64' ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto mb-3 text-ind-text-muted opacity-50" />
            <p className="text-sm text-ind-text-muted">
              Binary file preview not available
            </p>
            <p className="text-xs text-ind-text-muted mt-1">
              {fileData.mimeType} • {formatFileSize(fileData.size)}
            </p>
          </div>
        ) : isMarkdown ? (
          // Render markdown as HTML with syntax-highlighted code blocks and heading IDs for TOC links
          <div className="prose prose-sm prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSlug]}
              components={{
                code(props) {
                  const { children, className, ...rest } = props;
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : 'text';
                  const isInline = !match;

                  return !isInline ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={language}
                      PreTag="div"
                      customStyle={{
                        margin: 0,
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                      }}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...rest}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {displayContent}
            </ReactMarkdown>
          </div>
        ) : isMermaid ? (
          // Render Mermaid diagrams (architecture diagrams, dependency graphs, flowcharts)
          <MermaidViewer chart={extractMermaidCode(displayContent)} />
        ) : isHtml ? (
          // Render HTML files in sandboxed iframe for live preview
          <div className="w-full h-full bg-white">
            <iframe
              srcDoc={displayContent}
              sandbox="allow-scripts allow-same-origin"
              className="w-full h-full border-0"
              style={{ minHeight: '600px' }}
              title={fileData.name}
            />
          </div>
        ) : isJson || isCode ? (
          // Render code files with syntax highlighting
          <SyntaxHighlighter
            language={getLanguage(fileData.extension)}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: '1rem',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              lineHeight: '1.5',
            }}
            showLineNumbers
          >
            {displayContent}
          </SyntaxHighlighter>
        ) : (
          <pre className="text-sm whitespace-pre-wrap font-sans text-ind-text">
            {displayContent}
          </pre>
        )}
      </div>
    </div>
  );
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export default FileViewer;

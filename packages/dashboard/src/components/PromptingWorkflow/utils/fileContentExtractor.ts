import { Attachment } from '../types';
import { languageMap } from './languageMap';

/**
 * Extract content from a file and detect its language
 */
export async function readFileContent(file: File): Promise<Attachment> {
  const id = Math.random().toString(36).substring(2, 11);
  const filename = file.name;
  const extension = getFileExtension(filename);
  const language = languageMap[extension] || 'plaintext';
  const isText = isTextFile(extension);
  const isBinary = !isText;

  let content: string | undefined;
  let preview: string | undefined;

  if (isText) {
    try {
      content = await file.text();
      preview = content.substring(0, 200);
    } catch (error) {
      console.error(`Failed to read text from file: ${filename}`, error);
      // Leave content undefined for binary files
    }
  }

  return {
    id,
    filename,
    type: isImage(extension) ? 'IMAGE' : 'FILE',
    extension,
    mimeType: file.type || getMimeType(extension),
    size: file.size,
    content,
    preview,
    language,
    isText,
    isBinary,
    createdAt: new Date(),
  };
}

/**
 * Extract file extension from filename
 */
function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  if (parts.length > 1) {
    return '.' + parts[parts.length - 1].toLowerCase();
  }
  return '';
}

/**
 * Determine if file is text-based (can extract content)
 */
function isTextFile(extension: string): boolean {
  const textExtensions = [
    '.txt', '.md', '.json', '.js', '.ts', '.tsx', '.jsx',
    '.py', '.go', '.java', '.cpp', '.c', '.h', '.rs', '.rb',
    '.php', '.html', '.css', '.scss', '.yaml', '.yml', '.xml',
    '.csv', '.sql', '.sh', '.bash', '.gradle', '.maven',
  ];
  return textExtensions.includes(extension);
}

/**
 * Determine if file is an image
 */
function isImage(extension: string): boolean {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg', '.webp'];
  return imageExtensions.includes(extension);
}

/**
 * Get MIME type from file extension
 */
function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.json': 'application/json',
    '.js': 'text/javascript',
    '.ts': 'text/typescript',
    '.tsx': 'text/typescript',
    '.jsx': 'text/javascript',
    '.py': 'text/x-python',
    '.go': 'text/x-go',
    '.java': 'text/x-java',
    '.cpp': 'text/x-cpp',
    '.c': 'text/x-c',
    '.rs': 'text/x-rust',
    '.rb': 'text/x-ruby',
    '.html': 'text/html',
    '.css': 'text/css',
    '.xml': 'application/xml',
    '.csv': 'text/csv',
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
  };
  return mimeTypes[extension] || 'application/octet-stream';
}

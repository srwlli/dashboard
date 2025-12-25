/**
 * Map file extensions to programming language names for markdown code blocks
 * Supports 15+ file types commonly used in code analysis workflows
 */
export const languageMap: Record<string, string> = {
  // Web & TypeScript
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.html': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.less': 'less',

  // Python
  '.py': 'python',

  // Go
  '.go': 'go',

  // Java & JVM
  '.java': 'java',
  '.kotlin': 'kotlin',
  '.scala': 'scala',

  // C/C++/Rust
  '.cpp': 'cpp',
  '.cc': 'cpp',
  '.cxx': 'cpp',
  '.c': 'c',
  '.h': 'c',
  '.hpp': 'cpp',
  '.rs': 'rust',

  // Ruby & PHP
  '.rb': 'ruby',
  '.php': 'php',

  // Data & Config
  '.json': 'json',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.xml': 'xml',
  '.csv': 'csv',
  '.toml': 'toml',

  // Database
  '.sql': 'sql',

  // Markdown & Text
  '.md': 'markdown',
  '.txt': 'text',

  // Shell & Scripts
  '.sh': 'bash',
  '.bash': 'bash',
  '.zsh': 'bash',

  // Build & Config
  '.gradle': 'gradle',
  '.maven': 'maven',
  '.docker': 'dockerfile',

  // Default fallback
  'default': 'plaintext',
};

/**
 * Get language from file extension with fallback
 */
export function getLanguage(extension: string): string {
  return languageMap[extension] || languageMap['default'];
}

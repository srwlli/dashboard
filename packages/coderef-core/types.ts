// coderef-core/types.ts

/**
 * Represents a code element (function, class, etc.) found in the codebase
 */
export interface ElementData {
  type: 'function' | 'class' | 'component' | 'hook' | 'method' | 'constant' | 'unknown';
  name: string;
  file: string;
  line: number;
  /** Optional: Whether the element is exported */
  exported?: boolean;
  /** Optional: Function/method parameters (from AST analysis) */
  parameters?: string[];
  /** Optional: Functions/methods called by this element (from AST analysis) */
  calls?: string[];
}

/**
 * Parsed Coderef tag as indexed in the coderef-index.json
 */
export type IndexedCoderef = {
  type: string;
  path: string;
  element: string | null;
  line: number | null;
  file: string;
  indexLine: number;
};

/**
 * Status of a Coderef tag compared to the current codebase state
 */
export type DriftStatus =
  | 'unchanged' // Tag matches current position
  | 'moved' // Same element exists but on a different line
  | 'renamed' // Similar element exists at same position but with different name
  | 'missing' // Element does not exist in codebase anymore
  | 'unknown'; // Unable to determine status

/**
 * Report for a single Coderef tag drift analysis
 */
export type DriftReport = {
  coderef: string;
  status: DriftStatus;
  originalFile: string;
  originalLine: number;
  currentFile?: string;
  currentLine?: number;
  suggestedFix?: string;
  confidence: number;
};

/**
 * Configuration options for drift detection
 */
export type DriftDetectionOptions = {
  lang?: string | string[]; // File extension(s) to scan
  fixThreshold?: number; // Similarity threshold for suggesting fixes (0-1)
  verbose?: boolean; // Enable verbose logging
  scanOptions?: ScanOptions; // Additional scan options
};

/**
 * Options for scanning code elements
 */
export interface ScanOptions {
  /** Glob pattern for file inclusion */
  include?: string | string[];
  /** Glob pattern for file exclusion */
  exclude?: string | string[];
  /** Scan recursively into subdirectories */
  recursive?: boolean;
  /** Languages to scan (file extensions) */
  langs?: string[];
  /** Custom patterns to use for scanning */
  customPatterns?: Array<{
    type: ElementData['type'];
    pattern: RegExp;
    nameGroup: number;
    lang: string;
  }>;
  /** Whether to include comments in the scan */
  includeComments?: boolean;
  /** Whether to show verbose output */
  verbose?: boolean;
}

/**
 * Interface for a parsed Coderef2 tag
 */
export interface ParsedCoderef {
  type: string;
  path: string;
  element: string | null;
  line: number | null;
  metadata?: Record<string, any>;
}

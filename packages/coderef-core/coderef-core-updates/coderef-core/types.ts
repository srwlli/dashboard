// types.ts

/**
 * Represents a code element (function, class, etc.) found in the codebase by the scanner
 */
export interface ElementData {
    type: 'function' | 'class' | 'component' | 'hook' | 'method' | 'interface' | 'enum' | 'type' | 'unknown'; // Added more specific types based on AST scanner
    name: string;
    file: string; // Normalized path (e.g., using forward slashes)
    line: number; // 1-based line number
  }
  
  /**
   * Options for scanning code elements using the AST scanner
   */
  export interface ScanOptions {
    /** Glob pattern(s) for file inclusion (future enhancement) */
    include?: string | string[];
    /** Glob pattern(s) for file exclusion (future enhancement - basic exclude implemented) */
    exclude?: string | string[];
    /** Scan recursively into subdirectories (defaults to true) */
    recursive?: boolean;
    /** Languages to scan (file extensions) */
    langs?: string[];
    /** Whether to include comments in the scan result (currently affects skipping comment-only files) */
    includeComments?: boolean;
    /** Whether to show verbose output during scan */
    verbose?: boolean;
    // Note: customPatterns from regex scanner might not be directly applicable to AST
  }
  
  /**
   * Interface for a parsed Coderef2 tag (output of parser.ts)
   */
  export interface ParsedCoderef {
    type: string; // The @Type part
    path: string; // The /path part
    element: string | null; // The #element part (optional)
    line: number | null; // The :line part (optional)
    metadata?: Record<string, any>; // The {metadata} part (optional)
  }
  
  // --- Types related to Drift Detection (as originally provided) ---
  // These types suggest functionality beyond just scanning and parsing,
  // likely for comparing indexed references against current code state.
  
  /**
   * Parsed Coderef tag as might be stored in an index file (e.g., coderef-index.json)
   */
  export type IndexedCoderef = {
    type: string; // The @Type part from the tag
    path: string; // The /path part from the tag
    element: string | null; // The #element part from the tag (optional)
    line: number | null; // The :line part from the tag (optional)
    metadata?: Record<string, any>; // The {metadata} part (optional)
    // --- Index-specific info ---
    file: string; // File where the Coderef tag itself was found
    indexLine: number; // Line number where the Coderef tag itself was found in `file`
    originalTag: string; // The original full tag string
  };
  
  /**
   * Status of a Coderef tag compared to the current codebase state
   */
  export type DriftStatus =
    | 'unchanged' // Tag matches current element position and name
    | 'moved'     // Same element name exists in the same file but on a different line
    | 'renamed'   // An element exists at the same position, but with a different name (potential rename)
    | 'missing'   // Element (by name/path) not found in the scanned codebase
    | 'ambiguous' // Multiple potential matches found
    | 'error'     // Error during analysis (e.g., file not found)
    | 'unknown';  // Unable to determine status (e.g., parser error for tag)
  
  /**
   * Report for a single Coderef tag drift analysis
   */
  export type DriftReport = {
    coderef: IndexedCoderef; // The indexed coderef being checked
    status: DriftStatus;
    currentElement?: ElementData; // Best match found by scanner, if any
    message?: string; // Explanation for status (e.g., error details, ambiguity info)
    suggestedFix?: string; // A potential new tag string if status is 'moved' or 'renamed'
    confidence?: number; // Confidence score (0-1) for suggestedFix or status
  };
  
  /**
   * Configuration options for drift detection process
   */
  export type DriftDetectionOptions = {
    scanOptions?: ScanOptions; // Options to pass to the scanner when getting current elements
    similarityThreshold?: number; // Threshold (0-1) for suggesting renames (e.g., using Levenshtein distance)
    verbose?: boolean; // Enable verbose logging for drift detection process
  };
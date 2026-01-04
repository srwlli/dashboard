/**
 * Represents a code element (function, class, etc.) found in the codebase by the scanner
 */
export interface ElementData {
    type: 'function' | 'class' | 'component' | 'hook' | 'method' | 'interface' | 'enum' | 'type' | 'unknown';
    name: string;
    file: string;
    line: number;
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
}
/**
 * Interface for a parsed Coderef2 tag (output of parser.ts)
 */
export interface ParsedCoderef {
    type: string;
    path: string;
    element: string | null;
    line: number | null;
    metadata?: Record<string, any>;
}
/**
 * Parsed Coderef tag as might be stored in an index file (e.g., coderef-index.json)
 */
export type IndexedCoderef = {
    type: string;
    path: string;
    element: string | null;
    line: number | null;
    metadata?: Record<string, any>;
    file: string;
    indexLine: number;
    originalTag: string;
};
/**
 * Status of a Coderef tag compared to the current codebase state
 */
export type DriftStatus = 'unchanged' | 'moved' | 'renamed' | 'missing' | 'ambiguous' | 'error' | 'unknown';
/**
 * Report for a single Coderef tag drift analysis
 */
export type DriftReport = {
    coderef: IndexedCoderef;
    status: DriftStatus;
    currentElement?: ElementData;
    message?: string;
    suggestedFix?: string;
    confidence?: number;
};
/**
 * Configuration options for drift detection process
 */
export type DriftDetectionOptions = {
    scanOptions?: ScanOptions;
    similarityThreshold?: number;
    verbose?: boolean;
};
//# sourceMappingURL=types.d.ts.map
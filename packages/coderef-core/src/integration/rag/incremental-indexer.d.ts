/**
 * Incremental Indexer
 * P2-T5: Tracks file changes to avoid re-embedding unchanged code
 *
 * Uses file hashes to detect changes and only processes modified files,
 * significantly reducing API costs and processing time for large codebases.
 */
import type { CodeChunk } from './code-chunk.js';
/**
 * State of a single file in the index
 */
export interface FileIndexState {
    /** File path */
    file: string;
    /** SHA-256 hash of file content */
    hash: string;
    /** Timestamp when indexed */
    timestamp: number;
    /** CodeRef IDs of chunks from this file */
    chunks: string[];
    /** Number of chunks */
    chunkCount: number;
}
/**
 * Complete index state
 */
export interface IndexState {
    /** Version of index format */
    version: string;
    /** Timestamp of last index */
    lastIndexed: number;
    /** Base path */
    basePath: string;
    /** File states by file path */
    files: Map<string, FileIndexState>;
    /** Metadata */
    metadata?: Record<string, any>;
}
/**
 * Result from incremental analysis
 */
export interface IncrementalAnalysisResult {
    /** Files that need to be re-indexed */
    modifiedFiles: string[];
    /** New files that need indexing */
    newFiles: string[];
    /** Files that were deleted */
    deletedFiles: string[];
    /** Files that are unchanged */
    unchangedFiles: string[];
    /** Total files analyzed */
    totalFiles: number;
    /** Chunks that need to be deleted */
    chunksToDelete: string[];
    /** Summary */
    summary: {
        needsIndexing: number;
        unchanged: number;
        deletions: number;
    };
}
/**
 * Options for incremental indexing
 */
export interface IncrementalIndexOptions {
    /** Force full re-index even for unchanged files */
    force?: boolean;
    /** Index state file path */
    stateFile?: string;
}
/**
 * Manages incremental indexing to avoid redundant work
 */
export declare class IncrementalIndexer {
    private basePath;
    private stateFile;
    private currentState?;
    constructor(basePath?: string, stateFile?: string);
    /**
     * Load existing index state from disk
     */
    loadState(): Promise<IndexState | null>;
    /**
     * Save index state to disk
     */
    saveState(state: IndexState): Promise<void>;
    /**
     * Analyze which files need re-indexing
     */
    analyzeChanges(currentFiles: string[], options?: IncrementalIndexOptions): Promise<IncrementalAnalysisResult>;
    /**
     * Filter chunks to only those from changed files
     */
    filterChangedChunks(allChunks: CodeChunk[], options?: IncrementalIndexOptions): Promise<{
        chunksToIndex: CodeChunk[];
        chunksToKeep: string[];
    }>;
    /**
     * Update index state after indexing
     */
    updateState(indexedChunks: CodeChunk[], preserveUnchanged?: boolean): Promise<IndexState>;
    /**
     * Hash file content using SHA-256
     */
    hashFile(filePath: string): Promise<string>;
    /**
     * Clear index state
     */
    clearState(): Promise<void>;
    /**
     * Get statistics about current state
     */
    getStatistics(): Promise<{
        totalFiles: number;
        totalChunks: number;
        lastIndexed?: Date;
        oldestFile?: Date;
        newestFile?: Date;
    } | null>;
    /**
     * Check if a specific file needs reindexing
     */
    needsReindexing(filePath: string): Promise<boolean>;
}
//# sourceMappingURL=incremental-indexer.d.ts.map
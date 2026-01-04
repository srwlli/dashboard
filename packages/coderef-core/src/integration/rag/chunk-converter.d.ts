/**
 * Chunk Converter
 * P2-T2: Converts GraphNodes to CodeChunks with full context
 *
 * This service bridges the gap between CodeRef's AST analysis and RAG embeddings
 * by enriching graph nodes with source code, documentation, and dependency context.
 */
import type { DependencyGraph } from '../../analyzer/graph-builder.js';
import type { CodeChunk, ChunkOptions, ChunkGenerationResult, ChunkStatistics } from './code-chunk.js';
/**
 * Converts GraphNodes to CodeChunks for RAG embedding
 */
export declare class ChunkConverter {
    private basePath;
    constructor(basePath?: string);
    /**
     * Convert dependency graph to code chunks
     */
    convertGraph(graph: DependencyGraph, options?: ChunkOptions): Promise<ChunkGenerationResult>;
    /**
     * Convert a single GraphNode to CodeChunk
     */
    private convertNode;
    /**
     * Group nodes by file for efficient processing
     */
    private groupNodesByFile;
    /**
     * Read file content
     */
    private readFile;
    /**
     * Extract element name from node ID
     * Node ID format: "file:name" or just "name"
     */
    private extractElementName;
    /**
     * Detect programming language from file extension
     */
    private detectLanguage;
    /**
     * Extract source code around a line number
     */
    private extractSourceCode;
    /**
     * Extract documentation (JSDoc, docstrings) before a line
     */
    private extractDocumentation;
    /**
     * Extract dependencies (what this node calls/imports)
     */
    private extractDependencies;
    /**
     * Extract dependents (what calls/imports this node)
     */
    private extractDependents;
    /**
     * Extract related elements from the same file
     */
    private extractRelatedElements;
    /**
     * Calculate statistics about generated chunks
     */
    calculateStatistics(chunks: CodeChunk[]): ChunkStatistics;
}
//# sourceMappingURL=chunk-converter.d.ts.map
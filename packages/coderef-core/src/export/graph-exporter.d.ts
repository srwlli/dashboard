/**
 * Graph Exporter - Serialize dependency graph to multiple formats
 * Phase 5, Task P5-T5: Graph Export (JSON, Protobuf for visualization)
 *
 * Provides:
 * - JSON export for compatibility
 * - Protobuf export (stub for Phase 5.2)
 * - Visualization metadata
 * - Export validation
 */
import { DependencyGraph } from '../analyzer/graph-builder.js';
/**
 * Export format options
 */
export type ExportFormat = 'json' | 'protobuf';
/**
 * Exported graph structure
 */
export interface ExportedGraph {
    version: string;
    exportedAt: number;
    nodes: Array<{
        id: string;
        type: string;
        file?: string;
        line?: number;
        metadata?: Record<string, any>;
    }>;
    edges: Array<{
        source: string;
        target: string;
        type: string;
        weight?: number;
    }>;
    statistics: {
        nodeCount: number;
        edgeCount: number;
        edgesByType: Record<string, number>;
        densityRatio: number;
    };
    visualization?: {
        nodePositions?: Record<string, {
            x: number;
            y: number;
        }>;
        nodeColors?: Record<string, string>;
        edgeWeights?: Record<string, number>;
        layoutHints?: Record<string, any>;
    };
}
/**
 * Protobuf schema (stub)
 */
export interface ProtobufSchema {
    version: string;
    reserved: string[];
    messages: Record<string, any>;
}
export declare class GraphExporter {
    private graph;
    private exportFormat;
    private includeVisualization;
    private nodePositionCache;
    constructor(graph: DependencyGraph, format?: ExportFormat);
    /**
     * Export graph to specified format
     */
    export(format?: ExportFormat): string;
    /**
     * Export graph as JSON
     */
    private exportAsJSON;
    /**
     * Export graph as Protobuf (stub for Phase 5.2)
     */
    private exportAsProtobuf;
    /**
     * Build exported graph structure
     */
    private buildExportedGraph;
    /**
     * Build nodes array
     */
    private buildNodeArray;
    /**
     * Build edges array
     */
    private buildEdgeArray;
    /**
     * Calculate graph statistics
     */
    private calculateStatistics;
    /**
     * Build visualization metadata
     */
    private buildVisualizationData;
    /**
     * Calculate node positions for visualization (simple force-directed approximation)
     */
    private calculateNodePositions;
    /**
     * Calculate node colors based on type
     */
    private calculateNodeColors;
    /**
     * Calculate edge weights
     */
    private calculateEdgeWeights;
    /**
     * Generate layout hints for visualization
     */
    private generateLayoutHints;
    /**
     * Validate exported graph
     */
    validateExport(json: string): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Set export format
     */
    setFormat(format: ExportFormat): void;
    /**
     * Set whether to include visualization data
     */
    setIncludeVisualization(include: boolean): void;
    /**
     * Get export statistics
     */
    getExportStats(): Record<string, any>;
}
export default GraphExporter;
//# sourceMappingURL=graph-exporter.d.ts.map
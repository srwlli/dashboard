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

import { DependencyGraph, GraphNode, GraphEdge } from '../analyzer/graph-builder.js';

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
    nodePositions?: Record<string, { x: number; y: number }>;
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

export class GraphExporter {
  private graph: DependencyGraph;
  private exportFormat: ExportFormat = 'json';
  private includeVisualization: boolean = true;
  private nodePositionCache: Map<string, { x: number; y: number }> = new Map();

  constructor(graph: DependencyGraph, format: ExportFormat = 'json') {
    this.graph = graph;
    this.exportFormat = format;
  }

  /**
   * Export graph to specified format
   */
  export(format?: ExportFormat): string {
    const fmt = format || this.exportFormat;

    if (fmt === 'json') {
      return this.exportAsJSON();
    } else if (fmt === 'protobuf') {
      return this.exportAsProtobuf();
    } else {
      throw new Error(`Unsupported export format: ${fmt}`);
    }
  }

  /**
   * Export graph as JSON
   */
  private exportAsJSON(): string {
    const exported = this.buildExportedGraph();
    return JSON.stringify(exported, null, 2);
  }

  /**
   * Export graph as Protobuf (stub for Phase 5.2)
   */
  private exportAsProtobuf(): string {
    // TODO: Implement Protobuf export using protobufjs
    // For now, return JSON as placeholder
    console.warn('Protobuf export is not yet implemented. Returning JSON format instead.');
    return this.exportAsJSON();
  }

  /**
   * Build exported graph structure
   */
  private buildExportedGraph(): ExportedGraph {
    const nodes = this.buildNodeArray();
    const edges = this.buildEdgeArray();
    const statistics = this.calculateStatistics();
    const visualization = this.includeVisualization ? this.buildVisualizationData() : undefined;

    return {
      version: '1.0.0',
      exportedAt: Date.now(),
      nodes,
      edges,
      statistics,
      visualization,
    };
  }

  /**
   * Build nodes array
   */
  private buildNodeArray(): ExportedGraph['nodes'] {
    const nodes: ExportedGraph['nodes'] = [];

    for (const [nodeId, node] of this.graph.nodes.entries()) {
      nodes.push({
        id: nodeId,
        type: node.type,
        file: node.file,
        line: node.line,
        metadata: node.metadata,
      });
    }

    return nodes;
  }

  /**
   * Build edges array
   */
  private buildEdgeArray(): ExportedGraph['edges'] {
    const edges: ExportedGraph['edges'] = [];

    for (const edge of this.graph.edges) {
      edges.push({
        source: edge.source,
        target: edge.target,
        type: edge.type,
        weight: edge.weight || 1,
      });
    }

    return edges;
  }

  /**
   * Calculate graph statistics
   */
  private calculateStatistics(): ExportedGraph['statistics'] {
    const edgesByType: Record<string, number> = {};

    for (const edge of this.graph.edges) {
      edgesByType[edge.type] = (edgesByType[edge.type] || 0) + 1;
    }

    const nodeCount = this.graph.nodes.size;
    const edgeCount = this.graph.edges.length;
    const maxPossibleEdges = nodeCount * (nodeCount - 1);
    const densityRatio = maxPossibleEdges > 0 ? edgeCount / maxPossibleEdges : 0;

    return {
      nodeCount,
      edgeCount,
      edgesByType,
      densityRatio,
    };
  }

  /**
   * Build visualization metadata
   */
  private buildVisualizationData(): ExportedGraph['visualization'] {
    return {
      nodePositions: this.calculateNodePositions(),
      nodeColors: this.calculateNodeColors(),
      edgeWeights: this.calculateEdgeWeights(),
      layoutHints: this.generateLayoutHints(),
    };
  }

  /**
   * Calculate node positions for visualization (simple force-directed approximation)
   */
  private calculateNodePositions(): Record<string, { x: number; y: number }> {
    const positions: Record<string, { x: number; y: number }> = {};
    const nodeArray = Array.from(this.graph.nodes.keys());
    const radius = 500;
    const centerX = 0;
    const centerY = 0;

    // TODO: Implement proper force-directed layout
    // For now, use circular layout
    for (let i = 0; i < nodeArray.length; i++) {
      const angle = (i / nodeArray.length) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      positions[nodeArray[i]] = { x, y };
    }

    return positions;
  }

  /**
   * Calculate node colors based on type
   */
  private calculateNodeColors(): Record<string, string> {
    const colors: Record<string, string> = {};
    const colorMap: Record<string, string> = {
      'function': '#4CAF50',
      'class': '#2196F3',
      'interface': '#9C27B0',
      'module': '#FF9800',
      'file': '#757575',
      'unknown': '#BDBDBD',
    };

    for (const [nodeId, node] of this.graph.nodes.entries()) {
      colors[nodeId] = colorMap[node.type] || colorMap['unknown'];
    }

    return colors;
  }

  /**
   * Calculate edge weights
   */
  private calculateEdgeWeights(): Record<string, number> {
    const weights: Record<string, number> = {};

    for (let i = 0; i < this.graph.edges.length; i++) {
      const edge = this.graph.edges[i];
      const edgeKey = `${edge.source}-${edge.target}`;
      weights[edgeKey] = edge.weight || 1;
    }

    return weights;
  }

  /**
   * Generate layout hints for visualization
   */
  private generateLayoutHints(): Record<string, any> {
    return {
      algorithm: 'force-directed',
      iterations: 100,
      springLength: 100,
      repulsionStrength: 5000,
      centerX: 0,
      centerY: 0,
      zoomLevel: 1.0,
      recommendedCanvasSize: {
        width: 1200,
        height: 800,
      },
    };
  }

  /**
   * Validate exported graph
   */
  validateExport(json: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      const data = JSON.parse(json);

      // Check required fields
      if (!data.version) errors.push('Missing version field');
      if (!data.exportedAt) errors.push('Missing exportedAt field');
      if (!Array.isArray(data.nodes)) errors.push('nodes must be an array');
      if (!Array.isArray(data.edges)) errors.push('edges must be an array');
      if (!data.statistics) errors.push('Missing statistics object');

      // Validate nodes
      for (let i = 0; i < data.nodes.length; i++) {
        const node = data.nodes[i];
        if (!node.id) errors.push(`Node ${i} missing id`);
        if (!node.type) errors.push(`Node ${i} missing type`);
      }

      // Validate edges
      for (let i = 0; i < data.edges.length; i++) {
        const edge = data.edges[i];
        if (!edge.source) errors.push(`Edge ${i} missing source`);
        if (!edge.target) errors.push(`Edge ${i} missing target`);
        if (!edge.type) errors.push(`Edge ${i} missing type`);
      }

      return { valid: errors.length === 0, errors };
    } catch (error) {
      return {
        valid: false,
        errors: [`Failed to parse JSON: ${(error as Error).message}`],
      };
    }
  }

  /**
   * Set export format
   */
  setFormat(format: ExportFormat): void {
    this.exportFormat = format;
  }

  /**
   * Set whether to include visualization data
   */
  setIncludeVisualization(include: boolean): void {
    this.includeVisualization = include;
  }

  /**
   * Get export statistics
   */
  getExportStats(): Record<string, any> {
    return {
      format: this.exportFormat,
      includeVisualization: this.includeVisualization,
      nodeCount: this.graph.nodes.size,
      edgeCount: this.graph.edges.length,
      estimatedJsonSize: JSON.stringify(this.buildExportedGraph()).length,
    };
  }
}

export default GraphExporter;

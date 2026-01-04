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
export class GraphExporter {
    graph;
    exportFormat = 'json';
    includeVisualization = true;
    nodePositionCache = new Map();
    constructor(graph, format = 'json') {
        this.graph = graph;
        this.exportFormat = format;
    }
    /**
     * Export graph to specified format
     */
    export(format) {
        const fmt = format || this.exportFormat;
        if (fmt === 'json') {
            return this.exportAsJSON();
        }
        else if (fmt === 'protobuf') {
            return this.exportAsProtobuf();
        }
        else {
            throw new Error(`Unsupported export format: ${fmt}`);
        }
    }
    /**
     * Export graph as JSON
     */
    exportAsJSON() {
        const exported = this.buildExportedGraph();
        return JSON.stringify(exported, null, 2);
    }
    /**
     * Export graph as Protobuf (stub for Phase 5.2)
     */
    exportAsProtobuf() {
        // TODO: Implement Protobuf export using protobufjs
        // For now, return JSON as placeholder
        console.warn('Protobuf export is not yet implemented. Returning JSON format instead.');
        return this.exportAsJSON();
    }
    /**
     * Build exported graph structure
     */
    buildExportedGraph() {
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
    buildNodeArray() {
        const nodes = [];
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
    buildEdgeArray() {
        const edges = [];
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
    calculateStatistics() {
        const edgesByType = {};
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
    buildVisualizationData() {
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
    calculateNodePositions() {
        const positions = {};
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
    calculateNodeColors() {
        const colors = {};
        const colorMap = {
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
    calculateEdgeWeights() {
        const weights = {};
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
    generateLayoutHints() {
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
    validateExport(json) {
        const errors = [];
        try {
            const data = JSON.parse(json);
            // Check required fields
            if (!data.version)
                errors.push('Missing version field');
            if (!data.exportedAt)
                errors.push('Missing exportedAt field');
            if (!Array.isArray(data.nodes))
                errors.push('nodes must be an array');
            if (!Array.isArray(data.edges))
                errors.push('edges must be an array');
            if (!data.statistics)
                errors.push('Missing statistics object');
            // Validate nodes
            for (let i = 0; i < data.nodes.length; i++) {
                const node = data.nodes[i];
                if (!node.id)
                    errors.push(`Node ${i} missing id`);
                if (!node.type)
                    errors.push(`Node ${i} missing type`);
            }
            // Validate edges
            for (let i = 0; i < data.edges.length; i++) {
                const edge = data.edges[i];
                if (!edge.source)
                    errors.push(`Edge ${i} missing source`);
                if (!edge.target)
                    errors.push(`Edge ${i} missing target`);
                if (!edge.type)
                    errors.push(`Edge ${i} missing type`);
            }
            return { valid: errors.length === 0, errors };
        }
        catch (error) {
            return {
                valid: false,
                errors: [`Failed to parse JSON: ${error.message}`],
            };
        }
    }
    /**
     * Set export format
     */
    setFormat(format) {
        this.exportFormat = format;
    }
    /**
     * Set whether to include visualization data
     */
    setIncludeVisualization(include) {
        this.includeVisualization = include;
    }
    /**
     * Get export statistics
     */
    getExportStats() {
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
//# sourceMappingURL=graph-exporter.js.map
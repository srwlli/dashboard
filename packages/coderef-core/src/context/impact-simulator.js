/**
 * Impact Simulator - Calculate blast radius and cascading impacts
 * Phase 5, Task P5-T4: Impact Simulation Engine
 *
 * Provides:
 * - Blast radius calculation
 * - Cascading impact analysis
 * - Impact categorization (direct, transitive, secondary)
 * - Impact summary reporting
 */
export class ImpactSimulator {
    graph;
    impactCache = new Map();
    constructor(graph) {
        this.graph = graph;
    }
    /**
     * Calculate blast radius for given element
     */
    calculateBlastRadius(elementId, maxDepth = 5) {
        const startTime = Date.now();
        const cacheKey = `blast:${elementId}:${maxDepth}`;
        // Check cache
        if (this.impactCache.has(cacheKey)) {
            return this.impactCache.get(cacheKey);
        }
        const sourceElement = this.graph.nodes.get(elementId);
        if (!sourceElement) {
            throw new Error(`Element not found: ${elementId}`);
        }
        // Cascading impact calculation using BFS
        const directImpacts = [];
        const transitiveImpacts = [];
        const secondaryImpacts = [];
        const visited = new Set();
        const queue = [
            { nodeId: elementId, depth: 0, edges: [] },
        ];
        visited.add(elementId);
        while (queue.length > 0) {
            const current = queue.shift();
            // Get incoming edges (what depends on this element)
            const incomingEdges = this.graph.edgesByTarget.get(current.nodeId) || [];
            for (const edge of incomingEdges) {
                if (!visited.has(edge.source)) {
                    visited.add(edge.source);
                    const dependentNode = this.graph.nodes.get(edge.source);
                    if (dependentNode && current.depth < maxDepth) {
                        const depth = current.depth + 1;
                        const impactScore = 1 / (1 + depth); // Higher score for closer dependencies
                        const affectedElements = this.getTransitiveDependents(edge.source, maxDepth - depth);
                        const impact = {
                            elementId: edge.source,
                            element: dependentNode,
                            impactLevel: depth === 1 ? 'direct' : depth <= 3 ? 'transitive' : 'secondary',
                            impactScore,
                            dependentCount: affectedElements.length,
                            cascadeDepth: depth,
                            affectedElements,
                        };
                        if (depth === 1) {
                            directImpacts.push(impact);
                        }
                        else if (depth <= 3) {
                            transitiveImpacts.push(impact);
                        }
                        else {
                            secondaryImpacts.push(impact);
                        }
                        queue.push({ nodeId: edge.source, depth, edges: [...current.edges, edge] });
                    }
                }
            }
        }
        // Calculate severity and risk
        const totalImpacted = directImpacts.length + transitiveImpacts.length + secondaryImpacts.length;
        const severity = this.calculateSeverity(totalImpacted);
        const riskScore = this.calculateRiskScore(directImpacts, transitiveImpacts, secondaryImpacts);
        const result = {
            sourceElementId: elementId,
            sourceElement,
            directImpacts,
            transitiveImpacts,
            secondaryImpacts,
            totalImpactedElements: totalImpacted,
            severity,
            riskScore,
            simulationTime: Date.now() - startTime,
        };
        // Cache and return
        this.impactCache.set(cacheKey, result);
        return result;
    }
    /**
     * Get impact summary for reporting
     */
    getImpactSummary(elementId, maxDepth) {
        const blastRadius = this.calculateBlastRadius(elementId, maxDepth);
        // Extract unique modules
        const modules = new Set();
        const affectedElements = [
            ...blastRadius.directImpacts,
            ...blastRadius.transitiveImpacts,
            ...blastRadius.secondaryImpacts,
        ];
        for (const impact of affectedElements) {
            const moduleName = this.extractModuleName(impact.element);
            modules.add(moduleName);
        }
        // Generate mitigation strategies based on severity
        const mitigationStrategies = this.generateMitigationStrategies(blastRadius.severity, blastRadius.totalImpactedElements);
        // Build cascade chain
        const cascadeChain = this.buildCascadeChain(blastRadius);
        return {
            sourceElementId: elementId,
            totalImpactedFiles: modules.size,
            totalImpactedElements: blastRadius.totalImpactedElements,
            riskScore: blastRadius.riskScore,
            severity: blastRadius.severity,
            affectedModules: Array.from(modules),
            mitigationStrategies,
            cascadeChain,
        };
    }
    /**
     * Get transitive dependents for an element
     */
    getTransitiveDependents(nodeId, maxDepth) {
        const dependents = new Set();
        const visited = new Set();
        const queue = [{ nodeId, depth: 0 }];
        visited.add(nodeId);
        while (queue.length > 0) {
            const current = queue.shift();
            if (current.depth > 0) {
                dependents.add(current.nodeId);
            }
            if (current.depth < maxDepth) {
                const incoming = this.graph.edgesByTarget.get(current.nodeId) || [];
                for (const edge of incoming) {
                    if (!visited.has(edge.source)) {
                        visited.add(edge.source);
                        queue.push({ nodeId: edge.source, depth: current.depth + 1 });
                    }
                }
            }
        }
        return Array.from(dependents);
    }
    /**
     * Calculate severity level
     */
    calculateSeverity(impactedCount) {
        if (impactedCount >= 50)
            return 'critical';
        if (impactedCount >= 20)
            return 'high';
        if (impactedCount >= 5)
            return 'medium';
        return 'low';
    }
    /**
     * Calculate risk score 0-100
     */
    calculateRiskScore(direct, transitive, secondary) {
        // Direct impacts count more than transitive
        const directScore = Math.min(direct.length * 10, 60);
        const transitiveScore = Math.min(transitive.length * 2, 30);
        const secondaryScore = Math.min(secondary.length * 0.5, 10);
        return Math.min(directScore + transitiveScore + secondaryScore, 100);
    }
    /**
     * Extract module name from element
     */
    extractModuleName(element) {
        if (!element.file)
            return 'unknown';
        // Extract first-level directory from path
        const parts = element.file.split(/[\\/]/);
        if (parts.length > 0) {
            return parts[0];
        }
        return element.file;
    }
    /**
     * Generate mitigation strategies
     */
    generateMitigationStrategies(severity, impactedCount) {
        const strategies = [];
        if (severity === 'critical') {
            strategies.push('Plan extensive testing before deployment');
            strategies.push('Consider incremental rollout or blue-green deployment');
            strategies.push('Prepare rollback procedure');
            strategies.push(`Impact affects ${impactedCount}+ elements - high risk`);
        }
        else if (severity === 'high') {
            strategies.push('Increase test coverage for affected modules');
            strategies.push('Review all dependent code changes');
            strategies.push('Coordinate with affected team members');
        }
        else if (severity === 'medium') {
            strategies.push('Standard testing and code review');
            strategies.push('Monitor deployment for issues');
        }
        else {
            strategies.push('Low impact - standard deployment process');
        }
        return strategies;
    }
    /**
     * Build cascade chain representation
     */
    buildCascadeChain(blastRadius) {
        const chain = [];
        // Add source
        chain.push(`START: ${blastRadius.sourceElement.id}`);
        // Add direct impacts
        if (blastRadius.directImpacts.length > 0) {
            chain.push(`→ ${blastRadius.directImpacts.length} direct impact(s)`);
        }
        // Add transitive impacts
        if (blastRadius.transitiveImpacts.length > 0) {
            chain.push(`→ ${blastRadius.transitiveImpacts.length} transitive impact(s)`);
        }
        // Add secondary impacts
        if (blastRadius.secondaryImpacts.length > 0) {
            chain.push(`→ ${blastRadius.secondaryImpacts.length} secondary impact(s)`);
        }
        chain.push(`END: ${blastRadius.totalImpactedElements} total elements affected`);
        return chain;
    }
    /**
     * Clear impact cache
     */
    clearCache() {
        this.impactCache.clear();
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            cacheSize: this.impactCache.size,
            cachedQueries: Array.from(this.impactCache.keys()),
            totalNodes: this.graph.nodes.size,
            totalEdges: this.graph.edges.length,
        };
    }
}
export default ImpactSimulator;
//# sourceMappingURL=impact-simulator.js.map
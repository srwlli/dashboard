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
import { DependencyGraph, GraphNode } from '../analyzer/graph-builder.js';
/**
 * Represents impact for a single element
 */
export interface ElementImpact {
    elementId: string;
    element: GraphNode;
    impactLevel: 'direct' | 'transitive' | 'secondary';
    impactScore: number;
    dependentCount: number;
    cascadeDepth: number;
    affectedElements: string[];
}
/**
 * Represents blast radius result
 */
export interface BlastRadius {
    sourceElementId: string;
    sourceElement: GraphNode;
    directImpacts: ElementImpact[];
    transitiveImpacts: ElementImpact[];
    secondaryImpacts: ElementImpact[];
    totalImpactedElements: number;
    severity: 'critical' | 'high' | 'medium' | 'low';
    riskScore: number;
    simulationTime: number;
}
/**
 * Represents impact summary for reporting
 */
export interface ImpactSummary {
    sourceElementId: string;
    totalImpactedFiles: number;
    totalImpactedElements: number;
    riskScore: number;
    severity: string;
    affectedModules: string[];
    mitigationStrategies: string[];
    cascadeChain: string[];
}
export declare class ImpactSimulator {
    private graph;
    private impactCache;
    constructor(graph: DependencyGraph);
    /**
     * Calculate blast radius for given element
     */
    calculateBlastRadius(elementId: string, maxDepth?: number): BlastRadius;
    /**
     * Get impact summary for reporting
     */
    getImpactSummary(elementId: string, maxDepth?: number): ImpactSummary;
    /**
     * Get transitive dependents for an element
     */
    private getTransitiveDependents;
    /**
     * Calculate severity level
     */
    private calculateSeverity;
    /**
     * Calculate risk score 0-100
     */
    private calculateRiskScore;
    /**
     * Extract module name from element
     */
    private extractModuleName;
    /**
     * Generate mitigation strategies
     */
    private generateMitigationStrategies;
    /**
     * Build cascade chain representation
     */
    private buildCascadeChain;
    /**
     * Clear impact cache
     */
    clearCache(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): Record<string, any>;
}
export default ImpactSimulator;
//# sourceMappingURL=impact-simulator.d.ts.map
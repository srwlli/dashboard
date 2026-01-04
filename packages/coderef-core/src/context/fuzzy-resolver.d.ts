/**
 * Fuzzy Resolver - Detect moved/renamed code elements
 * Phase 5, Task P5-T3: Fuzzy Resolution for Drift Detection
 *
 * Provides:
 * - Multi-metric string similarity (name, path, signature)
 * - Element matching despite drift
 * - Confidence scoring
 */
import { GraphNode } from '../analyzer/graph-builder.js';
/**
 * Represents a potential match with confidence score
 */
export interface FuzzyMatch {
    originalElementId: string;
    matchedElementId: string;
    matchedElement: GraphNode;
    similarity: number;
    metrics: {
        nameSimilarity: number;
        pathSimilarity: number;
        signatureSimilarity: number;
    };
    confidence: number;
    reason: string;
}
/**
 * Represents drift detection result
 */
export interface DriftResult {
    sourceElementId: string;
    sourceElement: GraphNode | null;
    matches: FuzzyMatch[];
    hasMatch: boolean;
    matchFound: boolean;
}
export declare class FuzzyResolver {
    private elements;
    private similarityThreshold;
    private matchCache;
    constructor(elements: Map<string, GraphNode>, threshold?: number);
    /**
     * Find potential matches for moved/renamed element
     */
    findMovedElements(elementId: string, maxMatches?: number): DriftResult;
    /**
     * Calculate name similarity (Jaro-Winkler distance)
     */
    private calculateNameSimilarity;
    /**
     * Calculate path similarity
     */
    private calculatePathSimilarity;
    /**
     * Calculate signature similarity (function/class signature)
     */
    private calculateSignatureSimilarity;
    /**
     * Combine multiple similarity metrics
     */
    private calculateCombinedSimilarity;
    /**
     * Find all elements with similarity above threshold
     */
    findSimilarElements(elementId: string, threshold?: number): Array<{
        element: GraphNode;
        similarity: number;
    }>;
    /**
     * Generate human-readable match reason
     */
    private generateMatchReason;
    /**
     * Set similarity threshold
     */
    setSimilarityThreshold(threshold: number): void;
    /**
     * Clear match cache
     */
    clearCache(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): Record<string, any>;
}
export default FuzzyResolver;
//# sourceMappingURL=fuzzy-resolver.d.ts.map
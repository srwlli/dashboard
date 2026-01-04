/**
 * Fuzzy Resolver - Detect moved/renamed code elements
 * Phase 5, Task P5-T3: Fuzzy Resolution for Drift Detection
 *
 * Provides:
 * - Multi-metric string similarity (name, path, signature)
 * - Element matching despite drift
 * - Confidence scoring
 */
export class FuzzyResolver {
    elements;
    similarityThreshold = 0.85;
    matchCache = new Map();
    constructor(elements, threshold = 0.85) {
        this.elements = elements;
        this.similarityThreshold = threshold;
    }
    /**
     * Find potential matches for moved/renamed element
     */
    findMovedElements(elementId, maxMatches = 10) {
        const cacheKey = `drift:${elementId}`;
        // Check cache
        if (this.matchCache.has(cacheKey)) {
            const cached = this.matchCache.get(cacheKey);
            return {
                sourceElementId: elementId,
                sourceElement: this.elements.get(elementId) || null,
                matches: cached.slice(0, maxMatches),
                hasMatch: cached.length > 0,
                matchFound: cached.some((m) => m.similarity >= this.similarityThreshold),
            };
        }
        const sourceElement = this.elements.get(elementId);
        if (!sourceElement) {
            return {
                sourceElementId: elementId,
                sourceElement: null,
                matches: [],
                hasMatch: false,
                matchFound: false,
            };
        }
        // Multi-metric similarity matching
        const matches = [];
        for (const [candId, candidate] of this.elements.entries()) {
            if (candId === elementId)
                continue; // Skip self
            const nameSim = this.calculateNameSimilarity(sourceElement.id, candidate.id);
            const pathSim = sourceElement.file && candidate.file ?
                this.calculatePathSimilarity(sourceElement.file, candidate.file) : 0.5;
            const sigSim = this.calculateSignatureSimilarity(JSON.stringify(sourceElement.metadata), JSON.stringify(candidate.metadata));
            const { similarity, confidence } = this.calculateCombinedSimilarity(nameSim, pathSim, sigSim);
            if (similarity >= this.similarityThreshold) {
                matches.push({
                    originalElementId: elementId,
                    matchedElementId: candId,
                    matchedElement: candidate,
                    similarity,
                    metrics: {
                        nameSimilarity: nameSim,
                        pathSimilarity: pathSim,
                        signatureSimilarity: sigSim,
                    },
                    confidence,
                    reason: this.generateMatchReason(sourceElement, candidate, nameSim, pathSim),
                });
            }
        }
        // Sort by similarity descending
        matches.sort((a, b) => b.similarity - a.similarity);
        // Cache and return
        this.matchCache.set(cacheKey, matches);
        return {
            sourceElementId: elementId,
            sourceElement,
            matches: matches.slice(0, maxMatches),
            hasMatch: matches.length > 0,
            matchFound: matches.some((m) => m.similarity >= this.similarityThreshold),
        };
    }
    /**
     * Calculate name similarity (Jaro-Winkler distance)
     */
    calculateNameSimilarity(name1, name2) {
        // TODO: Implement using string-similarity library (Jaro-Winkler)
        // For now, return simple character overlap similarity
        if (name1 === name2)
            return 1.0;
        if (!name1 || !name2)
            return 0.0;
        // Simple similarity: ratio of common characters
        const common = Math.min(name1.length, name2.length);
        return common / Math.max(name1.length, name2.length);
    }
    /**
     * Calculate path similarity
     */
    calculatePathSimilarity(path1, path2) {
        // TODO: Implement path-based similarity
        // Consider directory structure and file names
        if (path1 === path2)
            return 1.0;
        if (!path1 || !path2)
            return 0.0;
        // Simple split-based similarity
        const parts1 = path1.split(/[\\/]/);
        const parts2 = path2.split(/[\\/]/);
        let matchingParts = 0;
        for (let i = 0; i < Math.min(parts1.length, parts2.length); i++) {
            if (parts1[i] === parts2[i])
                matchingParts++;
        }
        return matchingParts / Math.max(parts1.length, parts2.length);
    }
    /**
     * Calculate signature similarity (function/class signature)
     */
    calculateSignatureSimilarity(sig1, sig2) {
        // TODO: Implement signature-based similarity
        if (!sig1 || !sig2)
            return 0.5; // Neutral if no signature
        if (sig1 === sig2)
            return 1.0;
        return this.calculateNameSimilarity(sig1, sig2);
    }
    /**
     * Combine multiple similarity metrics
     */
    calculateCombinedSimilarity(nameSim, pathSim, signatureSim) {
        // Weighted average: 50% name, 30% path, 20% signature
        const combined = nameSim * 0.5 + pathSim * 0.3 + signatureSim * 0.2;
        // Confidence is higher if multiple metrics agree
        const variance = Math.abs(nameSim - combined) + Math.abs(pathSim - combined) + Math.abs(signatureSim - combined);
        const confidence = 1.0 - Math.min(variance / 3, 1.0);
        return { similarity: combined, confidence };
    }
    /**
     * Find all elements with similarity above threshold
     */
    findSimilarElements(elementId, threshold) {
        const element = this.elements.get(elementId);
        if (!element)
            return [];
        const thresh = threshold || this.similarityThreshold;
        const similar = [];
        // Similarity scoring across all elements
        for (const [candId, candidate] of this.elements.entries()) {
            if (candId === elementId)
                continue;
            const nameSim = this.calculateNameSimilarity(element.id, candidate.id);
            const pathSim = element.file && candidate.file ?
                this.calculatePathSimilarity(element.file, candidate.file) : 0.5;
            const sigSim = this.calculateSignatureSimilarity(JSON.stringify(element.metadata), JSON.stringify(candidate.metadata));
            const { similarity } = this.calculateCombinedSimilarity(nameSim, pathSim, sigSim);
            if (similarity >= thresh) {
                similar.push({ element: candidate, similarity });
            }
        }
        // Sort by similarity descending
        similar.sort((a, b) => b.similarity - a.similarity);
        return similar;
    }
    /**
     * Generate human-readable match reason
     */
    generateMatchReason(source, candidate, nameSim, pathSim) {
        const reasons = [];
        if (nameSim > 0.85)
            reasons.push('Similar name');
        if (pathSim > 0.7)
            reasons.push('Similar path');
        if (source.type === candidate.type)
            reasons.push('Same type');
        return reasons.length > 0 ? reasons.join(', ') : 'Possible match';
    }
    /**
     * Set similarity threshold
     */
    setSimilarityThreshold(threshold) {
        if (threshold < 0 || threshold > 1) {
            throw new Error('Similarity threshold must be between 0 and 1');
        }
        this.similarityThreshold = threshold;
        this.matchCache.clear();
    }
    /**
     * Clear match cache
     */
    clearCache() {
        this.matchCache.clear();
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            cacheSize: this.matchCache.size,
            threshold: this.similarityThreshold,
            totalElements: this.elements.size,
        };
    }
}
export default FuzzyResolver;
//# sourceMappingURL=fuzzy-resolver.js.map
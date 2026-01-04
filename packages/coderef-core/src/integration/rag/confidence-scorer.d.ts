/**
 * Confidence Scorer
 * P4-T4: Advanced confidence scoring for answer quality assessment
 *
 * Provides detailed confidence analysis based on:
 * - Retrieval quality
 * - Source diversity
 * - Answer completeness
 * - Historical performance
 */
import type { Answer } from './answer-generation-service.js';
/**
 * Detailed confidence breakdown
 */
export interface ConfidenceBreakdown {
    /** Overall confidence score (0-1) */
    overall: number;
    /** Individual component scores */
    components: {
        /** Retrieval quality score (0-1) */
        retrievalQuality: number;
        /** Source diversity score (0-1) */
        sourceDiversity: number;
        /** Answer completeness score (0-1) */
        answerCompleteness: number;
        /** LLM certainty score (0-1) */
        llmCertainty: number;
        /** Code quality score (0-1) */
        codeQuality: number;
    };
    /** Confidence level category */
    level: 'very-high' | 'high' | 'medium' | 'low' | 'very-low';
    /** Detailed explanation */
    explanation: string;
    /** Factors affecting confidence */
    factors: {
        positive: string[];
        negative: string[];
    };
    /** Recommendations */
    recommendations?: string[];
}
/**
 * Options for confidence scoring
 */
export interface ConfidenceScoringOptions {
    /** Weight for retrieval quality (default: 0.3) */
    retrievalWeight?: number;
    /** Weight for source diversity (default: 0.2) */
    diversityWeight?: number;
    /** Weight for answer completeness (default: 0.2) */
    completenessWeight?: number;
    /** Weight for LLM certainty (default: 0.15) */
    llmWeight?: number;
    /** Weight for code quality (default: 0.15) */
    qualityWeight?: number;
}
/**
 * Historical performance tracking
 */
interface PerformanceMetrics {
    totalAnswers: number;
    avgConfidence: number;
    highConfidenceCount: number;
    lowConfidenceCount: number;
}
/**
 * Advanced confidence scoring service
 */
export declare class ConfidenceScorer {
    private performanceHistory;
    /**
     * Calculate detailed confidence breakdown for an answer
     */
    calculateConfidence(answer: Answer, options?: ConfidenceScoringOptions): ConfidenceBreakdown;
    /**
     * Score retrieval quality based on search results
     */
    private scoreRetrievalQuality;
    /**
     * Score source diversity
     */
    private scoreSourceDiversity;
    /**
     * Score answer completeness
     */
    private scoreAnswerCompleteness;
    /**
     * Score LLM certainty
     */
    private scoreLLMCertainty;
    /**
     * Score code quality of sources
     */
    private scoreCodeQuality;
    /**
     * Determine confidence level category
     */
    private determineConfidenceLevel;
    /**
     * Generate explanation and factors
     */
    private generateExplanation;
    /**
     * Generate recommendations for improving confidence
     */
    private generateRecommendations;
    /**
     * Update performance history
     */
    private updatePerformanceHistory;
    /**
     * Get performance statistics
     */
    getPerformanceStats(): PerformanceMetrics;
    /**
     * Reset performance history
     */
    resetPerformanceHistory(): void;
    /**
     * Compare confidence across multiple answers
     */
    compareConfidence(answers: Answer[]): {
        best: Answer;
        worst: Answer;
        avgConfidence: number;
        variance: number;
    };
}
export {};
//# sourceMappingURL=confidence-scorer.d.ts.map
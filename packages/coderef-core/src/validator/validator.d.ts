/**
 * CodeRef2 Reference Validator
 *
 * Validates parsed CodeRef objects against specification rules
 * - Type validation
 * - Path validation
 * - Element validation
 * - Metadata validation
 * - Suggestion generation for typos/misspellings
 *
 * Implementation follows specification canonical format rules (lines 464-471)
 */
import { ParsedCodeRef } from '../parser/parser.js';
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
}
export interface ValidatorOptions {
    strict?: boolean;
    checkMetadata?: boolean;
    generateSuggestions?: boolean;
}
export declare class CodeRefValidator {
    private strict;
    private checkMetadata;
    private generateSuggestions;
    private validTypes;
    private extendedTypes;
    private validCategories;
    private validStatusValues;
    private validScopeValues;
    constructor(options?: ValidatorOptions);
    /**
     * Validate a parsed CodeRef
     */
    validate(parsed: ParsedCodeRef): ValidationResult;
    /**
     * Validate type designator
     */
    private isValidTypeDesignator;
    /**
     * Validate path format
     */
    private isValidPath;
    /**
     * Validate element format
     */
    private isValidElement;
    /**
     * Validate metadata
     */
    private validateMetadata;
    /**
     * Check if two type designators are similar (for suggestions)
     */
    private getSimilarTypes;
    /**
     * Calculate string similarity using Levenshtein distance
     */
    private calculateSimilarity;
    /**
     * Levenshtein distance algorithm
     */
    private levenshteinDistance;
}
export declare const validator: CodeRefValidator;
/**
 * Convenience function to validate a single parsed reference
 */
export declare function validateCodeRef(parsed: ParsedCodeRef, options?: ValidatorOptions): ValidationResult;
/**
 * Batch validate multiple parsed references
 */
export declare function validateCodeRefs(parsed: ParsedCodeRef[], options?: ValidatorOptions): ValidationResult[];
//# sourceMappingURL=validator.d.ts.map
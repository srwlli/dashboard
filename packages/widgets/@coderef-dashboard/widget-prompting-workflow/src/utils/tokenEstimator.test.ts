/**
 * Unit tests for tokenEstimator utility
 * Tests token counting formula and warnings
 */

import {
  estimateTokens,
  estimatePromptTokens,
  calculateTotalTokens,
  formatTokenCount,
  shouldWarnTokens,
  getTokenWarning,
} from './tokenEstimator';

describe('tokenEstimator', () => {
  describe('estimateTokens', () => {
    it('should return 0 for empty string', () => {
      expect(estimateTokens('')).toBe(0);
    });

    it('should estimate tokens using char/4 formula', () => {
      // 4 chars = 1 token
      expect(estimateTokens('test')).toBe(1);
      // 8 chars = 2 tokens
      expect(estimateTokens('testtest')).toBe(2);
      // Rounding up: 5 chars = 2 tokens (5/4 = 1.25, ceil = 2)
      expect(estimateTokens('tests')).toBe(2);
    });

    it('should handle large text files', () => {
      const largeText = 'a'.repeat(10000);
      const estimatedTokens = estimateTokens(largeText);
      expect(estimatedTokens).toBe(2500); // 10000 / 4 = 2500
    });

    it('should handle very large files (10MB)', () => {
      const veryLargeText = 'a'.repeat(10 * 1024 * 1024);
      const estimatedTokens = estimateTokens(veryLargeText);
      expect(estimatedTokens).toBeGreaterThan(2500000);
    });
  });

  describe('estimatePromptTokens', () => {
    it('should estimate prompt text tokens', () => {
      const prompt =
        'CODE REVIEW TASK\nReview the attached code and provide comprehensive analysis.';
      const tokens = estimatePromptTokens(prompt);
      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBe(Math.ceil(prompt.length / 4));
    });
  });

  describe('calculateTotalTokens', () => {
    it('should sum prompt and attachment tokens', () => {
      const promptTokens = 100;
      const attachmentTokens = [50, 75, 25];
      const total = calculateTotalTokens(promptTokens, attachmentTokens);
      expect(total).toBe(250); // 100 + 50 + 75 + 25
    });

    it('should handle empty attachment array', () => {
      const promptTokens = 100;
      const attachmentTokens: number[] = [];
      const total = calculateTotalTokens(promptTokens, attachmentTokens);
      expect(total).toBe(100);
    });
  });

  describe('formatTokenCount', () => {
    it('should format small counts without suffix', () => {
      expect(formatTokenCount(100)).toBe('~100');
      expect(formatTokenCount(999)).toBe('~999');
    });

    it('should format thousands with K suffix', () => {
      expect(formatTokenCount(1000)).toBe('~1.0K');
      expect(formatTokenCount(1500)).toBe('~1.5K');
      expect(formatTokenCount(999999)).toBe('~1000.0K');
    });

    it('should format millions with M suffix', () => {
      expect(formatTokenCount(1000000)).toBe('~1.0M');
      expect(formatTokenCount(5500000)).toBe('~5.5M');
    });
  });

  describe('shouldWarnTokens', () => {
    it('should not warn below 100K', () => {
      expect(shouldWarnTokens(50000)).toBe(false);
      expect(shouldWarnTokens(99999)).toBe(false);
    });

    it('should warn at 100K and above', () => {
      expect(shouldWarnTokens(100000)).toBe(true);
      expect(shouldWarnTokens(150000)).toBe(true);
    });
  });

  describe('getTokenWarning', () => {
    it('should return null for tokens below 100K', () => {
      expect(getTokenWarning(50000)).toBeNull();
      expect(getTokenWarning(99999)).toBeNull();
    });

    it('should warn for 100K-150K range', () => {
      const warning = getTokenWarning(100000);
      expect(warning).not.toBeNull();
      expect(warning).toContain('exceeds recommended limit');
    });

    it('should strongly warn for 150K+ tokens', () => {
      const warning = getTokenWarning(150000);
      expect(warning).not.toBeNull();
      expect(warning).toContain('exceeds recommended limit');
    });
  });
});

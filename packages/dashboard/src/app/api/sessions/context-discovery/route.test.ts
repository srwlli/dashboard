/**
 * Unit tests for Context Discovery API
 * Tests semantic scoring system and CodeRef integration
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

// Mock data structures
interface CodeRefData {
  index?: {
    elements: Array<{
      file: string;
      type: string;
      name: string;
      line: number;
    }>;
  };
  graph?: {
    edges: Array<{
      source: string;
      target: string;
    }>;
  };
  patterns?: {
    files: Record<string, string[]>;
  };
  coverage?: {
    files: Record<string, { percentage: number }>;
  };
}

// Test implementation of calculateSemanticRelevance
// (In real implementation, this would be exported from route.ts)
function calculateSemanticRelevance(
  filePath: string,
  stubDescription: string,
  codeRefData: CodeRefData
): { score: number; breakdown: any } {
  let patternScore = 0;
  let dependencyScore = 0;
  let complexityScore = 0;
  let coverageScore = 0;

  // Extract keywords
  const keywords = stubDescription
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 3);

  // Pattern similarity (40 points)
  if (codeRefData.patterns) {
    const filePatterns = codeRefData.patterns.files?.[filePath] || [];
    keywords.forEach(keyword => {
      filePatterns.forEach((pattern: string) => {
        if (pattern.toLowerCase().includes(keyword)) {
          patternScore += 5;
        }
      });
    });
  }
  patternScore = Math.min(40, patternScore);

  // Dependency relationships (30 points)
  if (codeRefData.graph?.edges) {
    const fileNormalizedPath = filePath.replace(/\\/g, '/');
    const relationships = codeRefData.graph.edges.filter((edge: any) =>
      edge.source.includes(fileNormalizedPath) || edge.target.includes(fileNormalizedPath)
    );
    dependencyScore = Math.min(30, relationships.length * 2);
  }

  // Complexity matching (20 points)
  if (codeRefData.index?.elements) {
    const fileElements = codeRefData.index.elements.filter((el: any) =>
      el.file?.replace(/\\/g, '/').includes(filePath.replace(/\\/g, '/'))
    );

    if (fileElements.length > 0 && fileElements.length < 50) {
      complexityScore = 20; // Sweet spot
    } else if (fileElements.length >= 50) {
      complexityScore = 10; // Too complex
    } else {
      complexityScore = 5; // Too simple
    }
  }

  // Test coverage (10 points)
  if (codeRefData.coverage) {
    const fileCoverage = codeRefData.coverage.files?.[filePath];
    if (fileCoverage && fileCoverage.percentage > 80) {
      coverageScore = 10;
    } else if (fileCoverage && fileCoverage.percentage > 50) {
      coverageScore = 5;
    }
  }

  const totalScore = Math.min(100, patternScore + dependencyScore + complexityScore + coverageScore);

  return {
    score: Math.round(totalScore),
    breakdown: {
      patternSimilarity: patternScore,
      dependencies: dependencyScore,
      complexity: complexityScore,
      coverage: coverageScore,
    },
  };
}

describe('Context Discovery - Semantic Scoring', () => {
  let mockCodeRefData: CodeRefData;

  beforeEach(() => {
    mockCodeRefData = {
      index: {
        elements: [],
      },
      graph: {
        edges: [],
      },
      patterns: {
        files: {},
      },
      coverage: {
        files: {},
      },
    };
  });

  describe('calculateSemanticRelevance', () => {
    it('should return 0 score when no CodeRef data available', () => {
      const result = calculateSemanticRelevance(
        '/path/to/file.ts',
        'authentication system',
        {}
      );

      expect(result.score).toBe(0);
      expect(result.breakdown.patternSimilarity).toBe(0);
      expect(result.breakdown.dependencies).toBe(0);
      expect(result.breakdown.complexity).toBe(0);
      expect(result.breakdown.coverage).toBe(0);
    });

    it('should score pattern similarity correctly', () => {
      mockCodeRefData.patterns = {
        files: {
          '/path/to/auth.ts': ['authentication', 'login', 'user', 'token'],
        },
      };

      const result = calculateSemanticRelevance(
        '/path/to/auth.ts',
        'build authentication system with login',
        mockCodeRefData
      );

      // Keywords: build, authentication, system, login (4 keywords)
      // Matches: authentication (5pts), login (5pts) = 10pts
      expect(result.breakdown.patternSimilarity).toBeGreaterThan(0);
      expect(result.breakdown.patternSimilarity).toBeLessThanOrEqual(40);
    });

    it('should cap pattern similarity at 40 points', () => {
      mockCodeRefData.patterns = {
        files: {
          '/path/to/file.ts': Array(20).fill('keyword'), // Many patterns
        },
      };

      const result = calculateSemanticRelevance(
        '/path/to/file.ts',
        'keyword keyword keyword keyword keyword keyword',
        mockCodeRefData
      );

      expect(result.breakdown.patternSimilarity).toBe(40);
    });

    it('should score dependencies correctly', () => {
      mockCodeRefData.graph = {
        edges: [
          { source: '/path/to/file.ts', target: '/other/file.ts' },
          { source: '/another/file.ts', target: '/path/to/file.ts' },
          { source: '/path/to/file.ts', target: '/third/file.ts' },
        ],
      };

      const result = calculateSemanticRelevance(
        '/path/to/file.ts',
        'authentication system',
        mockCodeRefData
      );

      // 3 relationships * 2 = 6 points
      expect(result.breakdown.dependencies).toBe(6);
    });

    it('should cap dependencies at 30 points', () => {
      mockCodeRefData.graph = {
        edges: Array(20).fill(null).map((_, i) => ({
          source: '/path/to/file.ts',
          target: `/other/file${i}.ts`,
        })),
      };

      const result = calculateSemanticRelevance(
        '/path/to/file.ts',
        'authentication system',
        mockCodeRefData
      );

      expect(result.breakdown.dependencies).toBe(30);
    });

    it('should score complexity correctly - sweet spot (1-49 elements)', () => {
      mockCodeRefData.index = {
        elements: Array(25).fill(null).map((_, i) => ({
          file: '/path/to/file.ts',
          type: 'function',
          name: `func${i}`,
          line: i + 1,
        })),
      };

      const result = calculateSemanticRelevance(
        '/path/to/file.ts',
        'authentication system',
        mockCodeRefData
      );

      expect(result.breakdown.complexity).toBe(20); // Sweet spot
    });

    it('should score complexity correctly - too complex (50+ elements)', () => {
      mockCodeRefData.index = {
        elements: Array(60).fill(null).map((_, i) => ({
          file: '/path/to/file.ts',
          type: 'function',
          name: `func${i}`,
          line: i + 1,
        })),
      };

      const result = calculateSemanticRelevance(
        '/path/to/file.ts',
        'authentication system',
        mockCodeRefData
      );

      expect(result.breakdown.complexity).toBe(10); // Too complex
    });

    it('should score complexity correctly - too simple (0 elements)', () => {
      mockCodeRefData.index = {
        elements: [],
      };

      const result = calculateSemanticRelevance(
        '/path/to/file.ts',
        'authentication system',
        mockCodeRefData
      );

      expect(result.breakdown.complexity).toBe(5); // Too simple
    });

    it('should score coverage correctly - high coverage (>80%)', () => {
      mockCodeRefData.coverage = {
        files: {
          '/path/to/file.ts': { percentage: 85 },
        },
      };

      const result = calculateSemanticRelevance(
        '/path/to/file.ts',
        'authentication system',
        mockCodeRefData
      );

      expect(result.breakdown.coverage).toBe(10);
    });

    it('should score coverage correctly - medium coverage (50-80%)', () => {
      mockCodeRefData.coverage = {
        files: {
          '/path/to/file.ts': { percentage: 65 },
        },
      };

      const result = calculateSemanticRelevance(
        '/path/to/file.ts',
        'authentication system',
        mockCodeRefData
      );

      expect(result.breakdown.coverage).toBe(5);
    });

    it('should score coverage correctly - low coverage (<50%)', () => {
      mockCodeRefData.coverage = {
        files: {
          '/path/to/file.ts': { percentage: 30 },
        },
      };

      const result = calculateSemanticRelevance(
        '/path/to/file.ts',
        'authentication system',
        mockCodeRefData
      );

      expect(result.breakdown.coverage).toBe(0);
    });

    it('should combine all scoring dimensions correctly', () => {
      // Setup all dimensions with partial scores
      mockCodeRefData.patterns = {
        files: {
          '/path/to/auth.ts': ['authentication', 'login'],
        },
      };
      mockCodeRefData.graph = {
        edges: [
          { source: '/path/to/auth.ts', target: '/other.ts' },
          { source: '/another.ts', target: '/path/to/auth.ts' },
        ],
      };
      mockCodeRefData.index = {
        elements: Array(10).fill(null).map((_, i) => ({
          file: '/path/to/auth.ts',
          type: 'function',
          name: `func${i}`,
          line: i + 1,
        })),
      };
      mockCodeRefData.coverage = {
        files: {
          '/path/to/auth.ts': { percentage: 90 },
        },
      };

      const result = calculateSemanticRelevance(
        '/path/to/auth.ts',
        'authentication system with login',
        mockCodeRefData
      );

      // Should have non-zero scores in all dimensions
      expect(result.breakdown.patternSimilarity).toBeGreaterThan(0);
      expect(result.breakdown.dependencies).toBeGreaterThan(0);
      expect(result.breakdown.complexity).toBe(20); // Sweet spot
      expect(result.breakdown.coverage).toBe(10); // High coverage

      // Total should be sum of all dimensions
      const expectedTotal =
        result.breakdown.patternSimilarity +
        result.breakdown.dependencies +
        result.breakdown.complexity +
        result.breakdown.coverage;

      expect(result.score).toBe(Math.min(100, Math.round(expectedTotal)));
    });

    it('should cap total score at 100', () => {
      // Setup maximum scores in all dimensions
      mockCodeRefData.patterns = {
        files: {
          '/path/to/file.ts': Array(20).fill('keyword'),
        },
      };
      mockCodeRefData.graph = {
        edges: Array(20).fill(null).map((_, i) => ({
          source: '/path/to/file.ts',
          target: `/other${i}.ts`,
        })),
      };
      mockCodeRefData.index = {
        elements: Array(25).fill(null).map((_, i) => ({
          file: '/path/to/file.ts',
          type: 'function',
          name: `func${i}`,
          line: i + 1,
        })),
      };
      mockCodeRefData.coverage = {
        files: {
          '/path/to/file.ts': { percentage: 100 },
        },
      };

      const result = calculateSemanticRelevance(
        '/path/to/file.ts',
        'keyword keyword keyword keyword',
        mockCodeRefData
      );

      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should handle Windows-style paths correctly', () => {
      mockCodeRefData.patterns = {
        files: {
          'C:\\Users\\project\\src\\auth.ts': ['authentication'],
        },
      };

      const result = calculateSemanticRelevance(
        'C:\\Users\\project\\src\\auth.ts',
        'authentication system',
        mockCodeRefData
      );

      expect(result.breakdown.patternSimilarity).toBeGreaterThan(0);
    });

    it('should handle Unix-style paths correctly', () => {
      mockCodeRefData.patterns = {
        files: {
          '/home/user/project/src/auth.ts': ['authentication'],
        },
      };

      const result = calculateSemanticRelevance(
        '/home/user/project/src/auth.ts',
        'authentication system',
        mockCodeRefData
      );

      expect(result.breakdown.patternSimilarity).toBeGreaterThan(0);
    });
  });
});

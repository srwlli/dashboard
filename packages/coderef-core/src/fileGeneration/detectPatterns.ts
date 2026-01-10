/**
 * Detect Patterns - Find common code patterns
 *
 * Outputs: .coderef/reports/patterns.json
 *
 * @module fileGeneration/detectPatterns
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import type { ElementData } from '../types/types.js';

interface PatternReport {
  version: string;
  generatedAt: string;
  projectPath: string;
  patterns: {
    handlers: PatternMatch[];
    decorators: PatternMatch[];
    errorPatterns: PatternMatch[];
    testPatterns: PatternMatch[];
    apiEndpoints: PatternMatch[];
  };
  statistics: {
    totalHandlers: number;
    totalDecorators: number;
    totalErrorPatterns: number;
    totalTestPatterns: number;
    totalApiEndpoints: number;
  };
}

interface PatternMatch {
  type: string;
  name: string;
  file: string;
  line: number;
  count?: number;
}

/**
 * Detect common code patterns in the codebase
 *
 * @param projectPath - Absolute path to project root
 * @param elements - Array of code elements from scan
 * @returns Promise that resolves when file is written
 */
export async function detectPatterns(
  projectPath: string,
  elements: ElementData[]
): Promise<void> {
  // Detect various patterns
  const handlers = detectHandlers(elements);
  const decorators = detectDecorators(elements);
  const errorPatterns = detectErrorPatterns(elements);
  const testPatterns = detectTestPatterns(elements);
  const apiEndpoints = detectApiEndpoints(elements);

  // Build report
  const report: PatternReport = {
    version: '2.0.0',
    generatedAt: new Date().toISOString(),
    projectPath,
    patterns: {
      handlers,
      decorators,
      errorPatterns,
      testPatterns,
      apiEndpoints,
    },
    statistics: {
      totalHandlers: handlers.length,
      totalDecorators: decorators.length,
      totalErrorPatterns: errorPatterns.length,
      totalTestPatterns: testPatterns.length,
      totalApiEndpoints: apiEndpoints.length,
    },
  };

  // Ensure reports directory exists
  const reportsDir = path.join(projectPath, '.coderef', 'reports');
  await fs.mkdir(reportsDir, { recursive: true });

  // Write report
  const reportPath = path.join(reportsDir, 'patterns.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');
}

/**
 * Detect event handlers (onClick, onSubmit, onChange, etc.)
 */
function detectHandlers(elements: ElementData[]): PatternMatch[] {
  const handlers: PatternMatch[] = [];
  const handlerPrefixes = ['on', 'handle'];

  for (const element of elements) {
    const nameLower = element.name.toLowerCase();

    // Check if name starts with handler prefix
    if (handlerPrefixes.some(prefix => nameLower.startsWith(prefix))) {
      handlers.push({
        type: 'handler',
        name: element.name,
        file: element.file,
        line: element.line,
      });
    }
  }

  return handlers;
}

/**
 * Detect decorators (@decorator syntax)
 */
function detectDecorators(elements: ElementData[]): PatternMatch[] {
  const decorators: PatternMatch[] = [];

  for (const element of elements) {
    // Check if name starts with @ (decorator syntax)
    if (element.name.startsWith('@')) {
      decorators.push({
        type: 'decorator',
        name: element.name,
        file: element.file,
        line: element.line,
      });
    }
  }

  return decorators;
}

/**
 * Detect error handling patterns
 */
function detectErrorPatterns(elements: ElementData[]): PatternMatch[] {
  const patterns: PatternMatch[] = [];
  const errorKeywords = ['error', 'exception', 'catch', 'throw'];

  for (const element of elements) {
    const nameLower = element.name.toLowerCase();

    // Check if name contains error-related keywords
    if (errorKeywords.some(keyword => nameLower.includes(keyword))) {
      patterns.push({
        type: 'error-handling',
        name: element.name,
        file: element.file,
        line: element.line,
      });
    }
  }

  return patterns;
}

/**
 * Detect test patterns (test, describe, it, etc.)
 */
function detectTestPatterns(elements: ElementData[]): PatternMatch[] {
  const patterns: PatternMatch[] = [];
  const testKeywords = ['test', 'describe', 'it', 'should', 'spec'];

  for (const element of elements) {
    const nameLower = element.name.toLowerCase();
    const fileLower = element.file.toLowerCase();

    // Check if name or file contains test-related keywords
    if (testKeywords.some(keyword => nameLower.includes(keyword) || fileLower.includes(keyword))) {
      patterns.push({
        type: 'test',
        name: element.name,
        file: element.file,
        line: element.line,
      });
    }
  }

  return patterns;
}

/**
 * Detect API endpoints (route handlers, HTTP methods)
 */
function detectApiEndpoints(elements: ElementData[]): PatternMatch[] {
  const endpoints: PatternMatch[] = [];
  const apiKeywords = ['get', 'post', 'put', 'delete', 'patch', 'route', 'api', 'endpoint'];

  for (const element of elements) {
    const nameLower = element.name.toLowerCase();
    const fileLower = element.file.toLowerCase();

    // Check if name or file contains API-related keywords
    if (apiKeywords.some(keyword => nameLower.includes(keyword)) ||
        fileLower.includes('/api/') ||
        fileLower.includes('route')) {
      endpoints.push({
        type: 'api-endpoint',
        name: element.name,
        file: element.file,
        line: element.line,
      });
    }
  }

  return endpoints;
}

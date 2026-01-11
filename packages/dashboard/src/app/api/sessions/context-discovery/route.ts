import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface ContextFile {
  id: string;
  filename: string;
  path: string;
  type: 'foundation' | 'archived' | 'resource' | 'component' | 'hook' | 'api' | 'util' | 'test';
  size: number;
  relevanceScore: number;
  excerpt: string;
  scoringBreakdown?: {
    patternSimilarity: number;
    dependencies: number;
    complexity: number;
    coverage: number;
  };
}

/**
 * Context Discovery API
 *
 * Scans project for foundation docs, archived features, and resource sheets
 * based on keyword matching from stub description.
 *
 * Query params:
 * - stubDescription: Description text from selected stub
 * - projectPath: Path to target project (optional, defaults to current project)
 *
 * Returns files with relevance scores >= 90% auto-selected
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stubDescription = searchParams.get('stubDescription') || '';
    const projectPath = searchParams.get('projectPath') || process.cwd();

    if (!stubDescription) {
      return NextResponse.json(
        { error: 'stubDescription parameter is required' },
        { status: 400 }
      );
    }

    // Extract keywords from stub description (simple approach)
    const keywords = extractKeywords(stubDescription);

    // Load CodeRef data for semantic scoring
    const codeRefData = await loadCodeRefData(projectPath);

    // Scan for context files (legacy keyword-based)
    const foundationDocs = await scanFoundationDocs(projectPath, keywords);
    const archivedFeatures = await scanArchivedFeatures(projectPath, keywords);
    const resourceSheets = await scanResourceSheets(projectPath, keywords);

    // Scan for code elements using CodeRef data (new semantic scoring)
    const codeElements = await scanCodeElements(projectPath, stubDescription, codeRefData);

    // Combine and sort by relevance score
    const allFiles = [
      ...foundationDocs,
      ...archivedFeatures,
      ...resourceSheets,
      ...codeElements
    ].sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Auto-select files with score >= 90
    const autoSelected = allFiles.filter(f => f.relevanceScore >= 90).map(f => f.id);

    // Calculate stats by type
    const statsByType = allFiles.reduce((acc, file) => {
      acc[file.type] = (acc[file.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      files: allFiles,
      autoSelected,
      keywords,
      statsByType,
      codeRefAvailable: {
        index: !!codeRefData.index,
        graph: !!codeRefData.graph,
        patterns: !!codeRefData.patterns,
        coverage: !!codeRefData.coverage,
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Context discovery error:', error);
    return NextResponse.json(
      { error: 'Failed to discover context files', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * Extract keywords from stub description
 * Simple approach: split on whitespace, remove common words, lowercase
 */
function extractKeywords(description: string): string[] {
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those']);

  return description
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word))
    .slice(0, 20); // Limit to top 20 keywords
}

/**
 * Calculate relevance score based on keyword matching (legacy)
 */
function calculateRelevance(content: string, keywords: string[]): number {
  if (keywords.length === 0) return 0;

  const contentLower = content.toLowerCase();
  let matches = 0;

  keywords.forEach(keyword => {
    // Count occurrences of each keyword
    const regex = new RegExp(keyword, 'gi');
    const occurrences = (contentLower.match(regex) || []).length;
    matches += occurrences;
  });

  // Normalize score to 0-100
  // Simple formula: (matches / keywords.length) * scale, capped at 100
  const score = Math.min(100, (matches / keywords.length) * 25);
  return Math.round(score);
}

/**
 * Calculate semantic relevance score using CodeRef data
 *
 * Scoring system:
 * - Pattern similarity: 40 points (matching patterns from .coderef/reports/patterns.json)
 * - Dependencies: 30 points (relationship graph from .coderef/graph.json)
 * - Complexity: 20 points (complexity metrics match)
 * - Coverage: 10 points (test coverage from .coderef/reports/coverage.json)
 *
 * @param filePath - Path to the file being scored
 * @param stubDescription - Description from the stub
 * @param codeRefData - Data from .coderef/ directory
 * @returns Score from 0-100 with breakdown
 */
function calculateSemanticRelevance(
  filePath: string,
  stubDescription: string,
  codeRefData: {
    index?: any;
    graph?: any;
    patterns?: any;
    coverage?: any;
  }
): { score: number; breakdown: ContextFile['scoringBreakdown'] } {
  let patternScore = 0;
  let dependencyScore = 0;
  let complexityScore = 0;
  let coverageScore = 0;

  // Pattern similarity (40 points)
  if (codeRefData.patterns) {
    // Check if file has similar patterns to stub keywords
    const keywords = extractKeywords(stubDescription);
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
    // Count how many relationships this file has
    const fileNormalizedPath = filePath.replace(/\\/g, '/');
    const relationships = codeRefData.graph.edges.filter((edge: any) =>
      edge.source.includes(fileNormalizedPath) || edge.target.includes(fileNormalizedPath)
    );

    // More relationships = more central to codebase
    dependencyScore = Math.min(30, relationships.length * 2);
  }

  // Complexity matching (20 points)
  if (codeRefData.index?.elements) {
    // Files with moderate complexity are preferred (not too simple, not too complex)
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
      coverageScore = 10; // Well-tested code
    } else if (fileCoverage && fileCoverage.percentage > 50) {
      coverageScore = 5; // Some test coverage
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

/**
 * Scan foundation docs (ARCHITECTURE.md, SCHEMA.md, etc.)
 */
async function scanFoundationDocs(projectPath: string, keywords: string[]): Promise<ContextFile[]> {
  const foundationDir = path.join(projectPath, 'coderef', 'foundation-docs');
  const files: ContextFile[] = [];

  try {
    const entries = await fs.readdir(foundationDir);

    for (const entry of entries) {
      if (!entry.endsWith('.md') && !entry.endsWith('.json')) continue;

      const filePath = path.join(foundationDir, entry);
      const stats = await fs.stat(filePath);

      if (stats.isFile()) {
        const content = await fs.readFile(filePath, 'utf-8');
        const relevanceScore = calculateRelevance(content, keywords);

        files.push({
          id: `foundation-${entry}`,
          filename: entry,
          path: filePath,
          type: 'foundation',
          size: stats.size,
          relevanceScore,
          excerpt: content.substring(0, 200).replace(/\n/g, ' ')
        });
      }
    }
  } catch (error) {
    // Directory doesn't exist - return empty array
    console.log('Foundation docs not found:', error);
  }

  return files;
}

/**
 * Scan archived features
 */
async function scanArchivedFeatures(projectPath: string, keywords: string[]): Promise<ContextFile[]> {
  const archivedDir = path.join(projectPath, 'coderef', 'archived');
  const files: ContextFile[] = [];

  try {
    const entries = await fs.readdir(archivedDir);

    for (const entry of entries) {
      const featureDir = path.join(archivedDir, entry);
      const stats = await fs.stat(featureDir);

      if (stats.isDirectory()) {
        // Check for context.json and plan.json in archived feature
        const contextPath = path.join(featureDir, 'context.json');
        const planPath = path.join(featureDir, 'plan.json');

        try {
          const contextContent = await fs.readFile(contextPath, 'utf-8');
          const contextStats = await fs.stat(contextPath);
          const relevanceScore = calculateRelevance(contextContent, keywords);

          files.push({
            id: `archived-${entry}-context`,
            filename: `${entry}/context.json`,
            path: contextPath,
            type: 'archived',
            size: contextStats.size,
            relevanceScore,
            excerpt: contextContent.substring(0, 200).replace(/\n/g, ' ')
          });
        } catch (e) {
          // context.json doesn't exist, skip
        }

        try {
          const planContent = await fs.readFile(planPath, 'utf-8');
          const planStats = await fs.stat(planPath);
          const relevanceScore = calculateRelevance(planContent, keywords);

          files.push({
            id: `archived-${entry}-plan`,
            filename: `${entry}/plan.json`,
            path: planPath,
            type: 'archived',
            size: planStats.size,
            relevanceScore,
            excerpt: planContent.substring(0, 200).replace(/\n/g, ' ')
          });
        } catch (e) {
          // plan.json doesn't exist, skip
        }
      }
    }
  } catch (error) {
    // Directory doesn't exist - return empty array
    console.log('Archived features not found:', error);
  }

  return files;
}

/**
 * Scan resource sheets
 */
async function scanResourceSheets(projectPath: string, keywords: string[]): Promise<ContextFile[]> {
  const resourceDir = path.join(projectPath, 'coderef', 'resources-sheets');
  const files: ContextFile[] = [];

  try {
    const entries = await fs.readdir(resourceDir);

    for (const entry of entries) {
      if (!entry.endsWith('.md')) continue;

      const filePath = path.join(resourceDir, entry);
      const stats = await fs.stat(filePath);

      if (stats.isFile()) {
        const content = await fs.readFile(filePath, 'utf-8');
        const relevanceScore = calculateRelevance(content, keywords);

        files.push({
          id: `resource-${entry}`,
          filename: entry,
          path: filePath,
          type: 'resource',
          size: stats.size,
          relevanceScore,
          excerpt: content.substring(0, 200).replace(/\n/g, ' ')
        });
      }
    }
  } catch (error) {
    // Directory doesn't exist - return empty array
    console.log('Resource sheets not found:', error);
  }

  return files;
}

/**
 * Load CodeRef data from .coderef/ directory
 */
async function loadCodeRefData(projectPath: string): Promise<{
  index?: any;
  graph?: any;
  patterns?: any;
  coverage?: any;
}> {
  const coderefDir = path.join(projectPath, '.coderef');
  const data: any = {};

  try {
    // Load index.json
    const indexPath = path.join(coderefDir, 'index.json');
    const indexContent = await fs.readFile(indexPath, 'utf-8');
    data.index = JSON.parse(indexContent);
  } catch (e) {
    console.log('.coderef/index.json not found');
  }

  try {
    // Load graph.json
    const graphPath = path.join(coderefDir, 'graph.json');
    const graphContent = await fs.readFile(graphPath, 'utf-8');
    data.graph = JSON.parse(graphContent);
  } catch (e) {
    console.log('.coderef/graph.json not found');
  }

  try {
    // Load patterns.json
    const patternsPath = path.join(coderefDir, 'reports', 'patterns.json');
    const patternsContent = await fs.readFile(patternsPath, 'utf-8');
    data.patterns = JSON.parse(patternsContent);
  } catch (e) {
    console.log('.coderef/reports/patterns.json not found');
  }

  try {
    // Load coverage.json
    const coveragePath = path.join(coderefDir, 'reports', 'coverage.json');
    const coverageContent = await fs.readFile(coveragePath, 'utf-8');
    data.coverage = JSON.parse(coverageContent);
  } catch (e) {
    console.log('.coderef/reports/coverage.json not found');
  }

  return data;
}

/**
 * Scan codebase for components, hooks, API routes, utils, and tests
 * using .coderef/index.json data
 */
async function scanCodeElements(
  projectPath: string,
  stubDescription: string,
  codeRefData: any
): Promise<ContextFile[]> {
  const files: ContextFile[] = [];

  if (!codeRefData.index?.elements) {
    console.log('No .coderef/index.json data available for code element scanning');
    return files;
  }

  const elements = codeRefData.index.elements;
  const processedFiles = new Set<string>();

  // Group elements by file and categorize
  elements.forEach((element: any) => {
    if (!element.file || processedFiles.has(element.file)) return;

    const filePath = element.file.replace(/\//g, '\\');
    const relativePath = path.relative(projectPath, filePath);

    // Determine file type based on path and element type
    let fileType: ContextFile['type'] = 'util';
    if (element.type === 'component') fileType = 'component';
    else if (element.type === 'hook') fileType = 'hook';
    else if (relativePath.includes('api')) fileType = 'api';
    else if (relativePath.includes('test') || relativePath.includes('spec')) fileType = 'test';
    else if (relativePath.includes('util') || relativePath.includes('helper')) fileType = 'util';

    // Calculate semantic relevance
    const { score, breakdown } = calculateSemanticRelevance(
      filePath,
      stubDescription,
      codeRefData
    );

    processedFiles.add(element.file);

    files.push({
      id: `code-${element.type}-${element.name}`,
      filename: path.basename(filePath),
      path: filePath,
      type: fileType,
      size: 0, // Not available from index
      relevanceScore: score,
      excerpt: `${element.type}: ${element.name} (line ${element.line})`,
      scoringBreakdown: breakdown,
    });
  });

  return files;
}

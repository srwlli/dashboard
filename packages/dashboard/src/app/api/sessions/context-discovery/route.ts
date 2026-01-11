import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface ContextFile {
  id: string;
  filename: string;
  path: string;
  type: 'foundation' | 'archived' | 'resource';
  size: number;
  relevanceScore: number;
  excerpt: string;
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

    // Scan for context files
    const foundationDocs = await scanFoundationDocs(projectPath, keywords);
    const archivedFeatures = await scanArchivedFeatures(projectPath, keywords);
    const resourceSheets = await scanResourceSheets(projectPath, keywords);

    // Combine and sort by relevance score
    const allFiles = [...foundationDocs, ...archivedFeatures, ...resourceSheets]
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Auto-select files with score >= 90
    const autoSelected = allFiles.filter(f => f.relevanceScore >= 90).map(f => f.id);

    return NextResponse.json({
      files: allFiles,
      autoSelected,
      keywords,
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
 * Calculate relevance score based on keyword matching
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

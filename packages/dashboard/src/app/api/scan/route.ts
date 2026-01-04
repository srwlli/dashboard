/**
 * Scanner API - Direct @coderef/core Integration
 *
 * POST /api/scan - Scan project using in-process scanner (no subprocess)
 */

import { NextRequest, NextResponse } from 'next/server';
import { scanCurrentElements } from '@coderef/core';
import type { ElementData } from '@coderef/core';
import { createErrorResponse, createSuccessResponse } from '@/types/api';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Scan options interface
 */
interface ScanOptions {
  lang?: string[];
  recursive?: boolean;
  exclude?: string[];
}

/**
 * Scan request body
 */
interface ScanRequest {
  projectPath: string;
  options?: ScanOptions;
}

/**
 * Scan summary statistics
 */
interface ScanSummary {
  totalElements: number;
  byType: Record<string, number>;
  byLanguage: Record<string, number>;
  filesScanned: number;
  scanDuration: number;
}

/**
 * Scan result response
 */
interface ScanResult {
  elements: ElementData[];
  summary: ScanSummary;
}

/**
 * Calculate scan summary from elements
 */
function calculateSummary(
  elements: ElementData[],
  startTime: number,
  endTime: number
): ScanSummary {
  const byType: Record<string, number> = {};
  const byLanguage: Record<string, number> = {};
  const filesSet = new Set<string>();

  for (const element of elements) {
    // Count by type
    byType[element.type] = (byType[element.type] || 0) + 1;

    // Count by language (extract from file extension)
    const ext = path.extname(element.file).slice(1);
    if (ext) {
      byLanguage[ext] = (byLanguage[ext] || 0) + 1;
    }

    // Track unique files
    filesSet.add(element.file);
  }

  return {
    totalElements: elements.length,
    byType,
    byLanguage,
    filesScanned: filesSet.size,
    scanDuration: endTime - startTime,
  };
}

/**
 * POST /api/scan
 * Scan project using @coderef/core scanner
 *
 * Request body: { projectPath: string, options?: ScanOptions }
 * Response: ApiResponse<ScanResult>
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: ScanRequest = await request.json();
    const { projectPath, options = {} } = body;

    // Validate request
    if (!projectPath || typeof projectPath !== 'string') {
      return NextResponse.json(
        createErrorResponse({
          code: 'VALIDATION_ERROR',
          message: 'projectPath is required and must be a string',
        }),
        { status: 400 }
      );
    }

    // Validate project path exists
    if (!fs.existsSync(projectPath)) {
      return NextResponse.json(
        createErrorResponse({
          code: 'VALIDATION_ERROR',
          message: `Project path does not exist: ${projectPath}`,
        }),
        { status: 400 }
      );
    }

    // Validate project path is absolute
    if (!path.isAbsolute(projectPath)) {
      return NextResponse.json(
        createErrorResponse({
          code: 'VALIDATION_ERROR',
          message: 'projectPath must be an absolute path',
        }),
        { status: 400 }
      );
    }

    // Validate project path is a directory
    const stats = fs.statSync(projectPath);
    if (!stats.isDirectory()) {
      return NextResponse.json(
        createErrorResponse({
          code: 'VALIDATION_ERROR',
          message: `Project path is not a directory: ${projectPath}`,
        }),
        { status: 400 }
      );
    }

    // Set default options
    const scanOptions = {
      lang: options.lang || ['ts', 'tsx', 'js', 'jsx'],
      recursive: options.recursive !== undefined ? options.recursive : true,
      exclude: options.exclude || [],
    };

    // Execute scan using @coderef/core
    const elements = await scanCurrentElements(
      projectPath,
      scanOptions.lang,
      {
        recursive: scanOptions.recursive,
        exclude: scanOptions.exclude,
      }
    );

    const endTime = Date.now();

    // Calculate summary
    const summary = calculateSummary(elements, startTime, endTime);

    // Return success response
    const result: ScanResult = {
      elements,
      summary,
    };

    return NextResponse.json(createSuccessResponse(result), { status: 200 });
  } catch (error: any) {
    console.error('[Scanner API] Scan failed:', error);

    // Handle different error types
    if (error.code === 'ENOENT') {
      return NextResponse.json(
        createErrorResponse({
          code: 'VALIDATION_ERROR',
          message: 'Project path not found',
        }),
        { status: 404 }
      );
    }

    if (error.code === 'EACCES') {
      return NextResponse.json(
        createErrorResponse({
          code: 'VALIDATION_ERROR',
          message: 'Permission denied accessing project path',
        }),
        { status: 403 }
      );
    }

    // Generic scan failure
    return NextResponse.json(
      createErrorResponse(
        {
          code: 'SCAN_FAILED',
          message: 'Scanner execution failed',
        },
        { details: error.message }
      ),
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'csv-parse/sync';

export interface Resource {
  Type: string;
  Server: string;
  Category: string;
  Name: string;
  Description: string;
  Status: string;
  Path: string;
  Created: string;
  LastUpdated: string;
}

export async function GET() {
  try {
    // Path to CSV file - adjust for monorepo structure
    // In dev: cwd is the monorepo root
    // We need to go to packages/dashboard/src/app/resources/coderef/tools-and-commands.csv
    let csvPath = join(process.cwd(), 'packages', 'dashboard', 'src', 'app', 'resources', 'coderef', 'tools-and-commands.csv');

    // Check if path exists, if not try relative path from src directory
    const { existsSync } = await import('fs');
    if (!existsSync(csvPath)) {
      // Try from dashboard package root
      csvPath = join(process.cwd(), 'src', 'app', 'resources', 'coderef', 'tools-and-commands.csv');
    }

    // Read and parse CSV
    const csvContent = readFileSync(csvPath, 'utf-8');
    const resources: Resource[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    return NextResponse.json({
      success: true,
      data: resources,
      count: resources.length,
      timestamp: new Date().toISOString(),
      csvPath, // Include path for debugging
    });
  } catch (error) {
    console.error('Error reading CSV:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to read resources CSV',
        message: error instanceof Error ? error.message : 'Unknown error',
        cwd: process.cwd(),
      },
      { status: 500 }
    );
  }
}

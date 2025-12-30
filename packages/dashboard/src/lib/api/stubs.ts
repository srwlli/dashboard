/**
 * StubReader Utility
 *
 * Reads and aggregates stubs from the centralized orchestrator directory.
 * Stubs represent pending work items (ideas/backlog) that haven't been started.
 */

import { readdirSync, readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { StubObject } from '@/types/stubs';

/**
 * Raw stub.json file structure
 *
 * Required fields (6):
 * - feature_name: Name of the feature
 * - description: Brief description
 * - category: Type of work (feature/fix/improvement/idea/refactor/test)
 * - priority: Priority level (low/medium/high/critical)
 * - status: Always "stub" for new stubs
 * - created: ISO 8601 creation timestamp
 *
 * Optional fields:
 * - stub_id: Auto-generated stub ID (added in newer stubs)
 * - context: Conversation context from when stub was created
 * - target_project: Project this stub is targeted for
 */
interface RawStubData {
  stub_id?: string;
  feature_name: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created: string;
  context?: string;
  target_project?: string;
}

/**
 * StubReader - Scans and reads stub.json files
 */
export class StubReader {
  private stubsDir: string;

  /**
   * Create a new StubReader instance
   * @param stubsDir Path to stubs directory (e.g., assistant/coderef/working/)
   */
  constructor(stubsDir: string) {
    this.stubsDir = stubsDir;
  }

  /**
   * Read all stubs from the directory
   * @throws Error if directory not found
   * @returns Array of StubObject
   */
  readAllStubs(): StubObject[] {
    const stubs: StubObject[] = [];

    // Check if directory exists
    if (!existsSync(this.stubsDir)) {
      throw new Error(`Stubs directory not found: ${this.stubsDir}`);
    }

    try {
      // Read all folders in stubs directory
      const folders = readdirSync(this.stubsDir, { withFileTypes: true });

      for (const entry of folders) {
        if (!entry.isDirectory()) continue;

        const folderPath = resolve(this.stubsDir, entry.name);
        const stubFilePath = resolve(folderPath, 'stub.json');

        try {
          // Check if stub.json exists
          if (!existsSync(stubFilePath)) {
            // Folder without stub.json is not a stub
            continue;
          }

          // Read and parse stub.json
          const content = readFileSync(stubFilePath, 'utf-8');

          let rawData: RawStubData;
          try {
            rawData = JSON.parse(content) as RawStubData;
          } catch (parseError) {
            // Enhanced error message for JSON parsing issues
            const errorMsg = parseError instanceof SyntaxError
              ? `Invalid JSON syntax: ${parseError.message}`
              : 'Failed to parse JSON';
            console.error(
              `⚠️  Skipping invalid stub at ${stubFilePath}: ${errorMsg}\n` +
              `    File: ${entry.name}/stub.json\n` +
              `    Action: Check the JSON syntax and ensure it conforms to the stub schema\n` +
              `    Schema: stub.json must contain 6 required fields: feature_name, description, category, priority, status, created`
            );
            continue;
          }

          // Validate required fields
          const requiredFields = ['feature_name', 'description', 'category', 'priority', 'status', 'created'];
          const missingFields = requiredFields.filter(field => !(field in rawData));

          if (missingFields.length > 0) {
            console.error(
              `⚠️  Skipping incomplete stub at ${entry.name}/stub.json: Missing fields [${missingFields.join(', ')}]\n` +
              `    Required fields: ${requiredFields.join(', ')}\n` +
              `    Action: Add missing required fields to the stub`
            );
            continue;
          }

          // Convert to StubObject
          const stub: StubObject = {
            id: rawData.feature_name,
            feature_name: rawData.feature_name,
            title: rawData.description, // Use description as title for display
            description: rawData.description,
            category: rawData.category as any,
            priority: rawData.priority as any,
            status: rawData.status as any,
            created: rawData.created,
            updated: rawData.created, // Use created date as updated (stub is immutable)
            path: stubFilePath,
            target_project: rawData.target_project,
          };

          stubs.push(stub);
        } catch (error) {
          // Unexpected error - log but continue processing other folders
          // This implements graceful degradation - one bad file doesn't break everything
          console.error(
            `⚠️  Unexpected error reading stub from ${entry.name}: ${(error as Error).message}`
          );
        }
      }

      // Sort by priority (critical first) then by created date (newest first)
      stubs.sort((a, b) => {
        const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
        const priorityA = priorityOrder[a.priority] ?? 99;
        const priorityB = priorityOrder[b.priority] ?? 99;

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        return new Date(b.created).getTime() - new Date(a.created).getTime();
      });

      return stubs;
    } catch (error) {
      throw new Error(`Failed to read stubs directory: ${(error as Error).message}`);
    }
  }

  /**
   * Read a single stub by feature name
   * @param featureName Name of the stub folder
   * @returns StubObject or null if not found
   */
  readStub(featureName: string): StubObject | null {
    const stubPath = resolve(this.stubsDir, featureName, 'stub.json');

    if (!existsSync(stubPath)) {
      return null;
    }

    try {
      const content = readFileSync(stubPath, 'utf-8');
      let rawData: RawStubData;

      try {
        rawData = JSON.parse(content) as RawStubData;
      } catch (parseError) {
        const errorMsg = parseError instanceof SyntaxError
          ? `Invalid JSON syntax: ${parseError.message}`
          : 'Failed to parse JSON';
        throw new Error(
          `Stub ${featureName} has invalid JSON: ${errorMsg}\n` +
          `    File: ${featureName}/stub.json\n` +
          `    Ensure the stub.json contains valid JSON with required fields`
        );
      }

      // Validate required fields
      const requiredFields = ['feature_name', 'description', 'category', 'priority', 'status', 'created'];
      const missingFields = requiredFields.filter(field => !(field in rawData));

      if (missingFields.length > 0) {
        throw new Error(
          `Stub ${featureName} is incomplete. Missing fields: [${missingFields.join(', ')}]\n` +
          `    Required fields: ${requiredFields.join(', ')}`
        );
      }

      return {
        id: rawData.feature_name,
        feature_name: rawData.feature_name,
        title: rawData.description, // Use description as title for display
        description: rawData.description,
        category: rawData.category as any,
        priority: rawData.priority as any,
        status: rawData.status as any,
        created: rawData.created,
        updated: rawData.created, // Use created date as updated (stub is immutable)
        path: stubPath,
        target_project: rawData.target_project,
      };
    } catch (error) {
      throw new Error(`Failed to read stub ${featureName}: ${(error as Error).message}`);
    }
  }

  /**
   * Count total stubs
   */
  countStubs(): number {
    try {
      const folders = readdirSync(this.stubsDir, { withFileTypes: true });
      let count = 0;

      for (const entry of folders) {
        if (!entry.isDirectory()) continue;

        const stubPath = resolve(this.stubsDir, entry.name, 'stub.json');
        if (existsSync(stubPath)) {
          count++;
        }
      }

      return count;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Filter stubs by criteria
   */
  filterStubs(
    stubs: StubObject[],
    options?: {
      priority?: string;
      category?: string;
      status?: string;
    }
  ): StubObject[] {
    let filtered = stubs;

    if (options?.priority) {
      filtered = filtered.filter((s) => s.priority === options.priority);
    }

    if (options?.category) {
      filtered = filtered.filter((s) => s.category === options.category);
    }

    if (options?.status) {
      filtered = filtered.filter((s) => s.status === options.status);
    }

    return filtered;
  }
}

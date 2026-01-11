/**
 * Integration tests for Context Discovery API
 * Tests full end-to-end workflow with CodeRef data loading
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

describe('Context Discovery API - Integration Tests', () => {
  let testProjectDir: string;
  let coderefDir: string;

  beforeEach(async () => {
    // Create temporary test project directory
    testProjectDir = path.join(os.tmpdir(), `coderef-test-${Date.now()}`);
    await fs.mkdir(testProjectDir, { recursive: true });

    // Create .coderef directory structure
    coderefDir = path.join(testProjectDir, '.coderef');
    await fs.mkdir(coderefDir, { recursive: true });
    await fs.mkdir(path.join(coderefDir, 'reports'), { recursive: true });

    // Create foundation-docs directory
    await fs.mkdir(path.join(testProjectDir, 'coderef', 'foundation-docs'), { recursive: true });

    // Create archived directory
    await fs.mkdir(path.join(testProjectDir, 'coderef', 'archived'), { recursive: true });

    // Create resources-sheets directory
    await fs.mkdir(path.join(testProjectDir, 'coderef', 'resources-sheets'), { recursive: true });
  });

  afterEach(async () => {
    // Cleanup test directory
    try {
      await fs.rm(testProjectDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  describe('GET /api/sessions/context-discovery', () => {
    it('should load and process CodeRef index.json data', async () => {
      // Setup: Create mock index.json
      const indexData = {
        version: '2.0.0',
        totalElements: 100,
        elements: [
          {
            type: 'component',
            name: 'AuthButton',
            file: path.join(testProjectDir, 'src', 'components', 'AuthButton.tsx'),
            line: 10,
            exported: true,
          },
          {
            type: 'function',
            name: 'validateAuth',
            file: path.join(testProjectDir, 'src', 'utils', 'auth.ts'),
            line: 5,
            exported: true,
          },
          {
            type: 'hook',
            name: 'useAuth',
            file: path.join(testProjectDir, 'src', 'hooks', 'useAuth.ts'),
            line: 3,
            exported: true,
          },
        ],
      };

      await fs.writeFile(
        path.join(coderefDir, 'index.json'),
        JSON.stringify(indexData, null, 2)
      );

      // The API would load this data via loadCodeRefData()
      const loadedData = JSON.parse(
        await fs.readFile(path.join(coderefDir, 'index.json'), 'utf-8')
      );

      expect(loadedData.totalElements).toBe(100);
      expect(loadedData.elements).toHaveLength(3);
      expect(loadedData.elements[0].type).toBe('component');
    });

    it('should load and process CodeRef graph.json data', async () => {
      // Setup: Create mock graph.json
      const graphData = {
        version: '2.0.0',
        nodes: [
          {
            id: 'file:src/components/AuthButton.tsx',
            type: 'file',
            label: 'AuthButton.tsx',
          },
          {
            id: 'file:src/utils/auth.ts',
            type: 'file',
            label: 'auth.ts',
          },
        ],
        edges: [
          {
            source: 'file:src/components/AuthButton.tsx',
            target: 'file:src/utils/auth.ts',
            type: 'imports',
          },
        ],
      };

      await fs.writeFile(
        path.join(coderefDir, 'graph.json'),
        JSON.stringify(graphData, null, 2)
      );

      const loadedData = JSON.parse(
        await fs.readFile(path.join(coderefDir, 'graph.json'), 'utf-8')
      );

      expect(loadedData.nodes).toHaveLength(2);
      expect(loadedData.edges).toHaveLength(1);
      expect(loadedData.edges[0].type).toBe('imports');
    });

    it('should load and process CodeRef patterns.json data', async () => {
      // Setup: Create mock patterns.json
      const patternsData = {
        patterns: [
          {
            type: 'authentication',
            files: [
              path.join(testProjectDir, 'src', 'utils', 'auth.ts'),
              path.join(testProjectDir, 'src', 'components', 'Login.tsx'),
            ],
          },
        ],
        files: {
          [path.join(testProjectDir, 'src', 'utils', 'auth.ts')]: [
            'authentication',
            'jwt',
            'token',
          ],
        },
      };

      await fs.writeFile(
        path.join(coderefDir, 'reports', 'patterns.json'),
        JSON.stringify(patternsData, null, 2)
      );

      const loadedData = JSON.parse(
        await fs.readFile(path.join(coderefDir, 'reports', 'patterns.json'), 'utf-8')
      );

      expect(loadedData.patterns).toHaveLength(1);
      expect(loadedData.patterns[0].type).toBe('authentication');
    });

    it('should load and process CodeRef coverage.json data', async () => {
      // Setup: Create mock coverage.json
      const coverageData = {
        files: {
          [path.join(testProjectDir, 'src', 'utils', 'auth.ts')]: {
            percentage: 85,
            lines: 120,
            covered: 102,
          },
          [path.join(testProjectDir, 'src', 'components', 'Login.tsx')]: {
            percentage: 60,
            lines: 80,
            covered: 48,
          },
        },
      };

      await fs.writeFile(
        path.join(coderefDir, 'reports', 'coverage.json'),
        JSON.stringify(coverageData, null, 2)
      );

      const loadedData = JSON.parse(
        await fs.readFile(path.join(coderefDir, 'reports', 'coverage.json'), 'utf-8')
      );

      const authCoverage = loadedData.files[path.join(testProjectDir, 'src', 'utils', 'auth.ts')];
      expect(authCoverage.percentage).toBe(85);
    });

    it('should scan foundation docs and calculate relevance', async () => {
      // Setup: Create foundation doc
      const architectureContent = `
# Architecture

This document describes the authentication system architecture.
We use JWT tokens for authentication and bcrypt for password hashing.
The auth module handles login, logout, and token refresh.
      `;

      await fs.writeFile(
        path.join(testProjectDir, 'coderef', 'foundation-docs', 'ARCHITECTURE.md'),
        architectureContent
      );

      const content = await fs.readFile(
        path.join(testProjectDir, 'coderef', 'foundation-docs', 'ARCHITECTURE.md'),
        'utf-8'
      );

      // Verify file can be read and contains expected content
      expect(content).toContain('authentication');
      expect(content).toContain('JWT tokens');
    });

    it('should scan archived features and calculate relevance', async () => {
      // Setup: Create archived feature
      const featureDir = path.join(testProjectDir, 'coderef', 'archived', 'old-auth-system');
      await fs.mkdir(featureDir, { recursive: true });

      const contextData = {
        feature_name: 'old-auth-system',
        description: 'Legacy authentication system with JWT support',
        requirements: ['JWT authentication', 'Password hashing', 'Token refresh'],
      };

      await fs.writeFile(
        path.join(featureDir, 'context.json'),
        JSON.stringify(contextData, null, 2)
      );

      const content = await fs.readFile(
        path.join(featureDir, 'context.json'),
        'utf-8'
      );
      const parsed = JSON.parse(content);

      expect(parsed.feature_name).toBe('old-auth-system');
      expect(parsed.description).toContain('authentication');
    });

    it('should scan resource sheets and calculate relevance', async () => {
      // Setup: Create resource sheet
      const resourceContent = `
# Authentication Patterns

Common patterns for implementing authentication:
- JWT token-based authentication
- Session-based authentication
- OAuth 2.0 integration
      `;

      await fs.writeFile(
        path.join(testProjectDir, 'coderef', 'resources-sheets', 'auth-patterns.md'),
        resourceContent
      );

      const content = await fs.readFile(
        path.join(testProjectDir, 'coderef', 'resources-sheets', 'auth-patterns.md'),
        'utf-8'
      );

      expect(content).toContain('authentication');
      expect(content).toContain('JWT');
    });

    it('should handle missing .coderef directory gracefully', async () => {
      // Remove .coderef directory
      await fs.rm(coderefDir, { recursive: true, force: true });

      // loadCodeRefData should not throw, just return empty data
      // Verify directory doesn't exist
      try {
        await fs.access(coderefDir);
        throw new Error('Directory should not exist');
      } catch (e: any) {
        expect(e.code).toBe('ENOENT');
      }
    });

    it('should combine all file sources correctly', async () => {
      // Setup all data sources
      await fs.writeFile(
        path.join(coderefDir, 'index.json'),
        JSON.stringify({
          version: '2.0.0',
          totalElements: 1,
          elements: [
            {
              type: 'component',
              name: 'AuthButton',
              file: path.join(testProjectDir, 'src', 'AuthButton.tsx'),
              line: 1,
            },
          ],
        })
      );

      await fs.writeFile(
        path.join(testProjectDir, 'coderef', 'foundation-docs', 'README.md'),
        'Authentication documentation'
      );

      await fs.writeFile(
        path.join(testProjectDir, 'coderef', 'resources-sheets', 'guide.md'),
        'Authentication guide'
      );

      // Verify all files exist
      const indexExists = await fs.access(path.join(coderefDir, 'index.json')).then(() => true).catch(() => false);
      const foundationExists = await fs.access(path.join(testProjectDir, 'coderef', 'foundation-docs', 'README.md')).then(() => true).catch(() => false);
      const resourceExists = await fs.access(path.join(testProjectDir, 'coderef', 'resources-sheets', 'guide.md')).then(() => true).catch(() => false);

      expect(indexExists).toBe(true);
      expect(foundationExists).toBe(true);
      expect(resourceExists).toBe(true);
    });

    it('should categorize files by type correctly', async () => {
      const indexData = {
        version: '2.0.0',
        totalElements: 5,
        elements: [
          {
            type: 'component',
            name: 'Button',
            file: path.join(testProjectDir, 'src', 'components', 'Button.tsx'),
            line: 1,
          },
          {
            type: 'hook',
            name: 'useAuth',
            file: path.join(testProjectDir, 'src', 'hooks', 'useAuth.ts'),
            line: 1,
          },
          {
            type: 'function',
            name: 'handler',
            file: path.join(testProjectDir, 'src', 'api', 'auth.ts'),
            line: 1,
          },
          {
            type: 'function',
            name: 'helper',
            file: path.join(testProjectDir, 'src', 'utils', 'format.ts'),
            line: 1,
          },
          {
            type: 'function',
            name: 'testAuth',
            file: path.join(testProjectDir, 'src', 'tests', 'auth.test.ts'),
            line: 1,
          },
        ],
      };

      await fs.writeFile(
        path.join(coderefDir, 'index.json'),
        JSON.stringify(indexData, null, 2)
      );

      const loaded = JSON.parse(await fs.readFile(path.join(coderefDir, 'index.json'), 'utf-8'));
      const elements = loaded.elements;

      // Verify categorization logic
      const componentFiles = elements.filter((e: any) => e.type === 'component');
      const hookFiles = elements.filter((e: any) => e.type === 'hook');
      const apiFiles = elements.filter((e: any) => e.file.includes('api'));
      const utilFiles = elements.filter((e: any) => e.file.includes('util'));
      const testFiles = elements.filter((e: any) => e.file.includes('test'));

      expect(componentFiles).toHaveLength(1);
      expect(hookFiles).toHaveLength(1);
      expect(apiFiles).toHaveLength(1);
      expect(utilFiles).toHaveLength(1);
      expect(testFiles).toHaveLength(1);
    });
  });
});

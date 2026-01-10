# @coderef/core

> Core scanning and analysis library for the CodeRef Dashboard ecosystem

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## Overview

**@coderef/core** is a powerful TypeScript library that provides code scanning, dependency analysis, and intelligent context generation for software projects. It serves as the foundational layer for the CodeRef Dashboard, enabling deep code understanding through AST-based parsing and relationship detection.

### Key Features

- **🔍 Multi-Language Scanner** - Regex-based code element detection for TypeScript, JavaScript, Python, Go, Rust, Java, C#, PHP, and more
- **📊 Dependency Analysis** - Build comprehensive dependency graphs with import/export/call relationship tracking
- **🧠 Intelligent Context** - Generate rich codebase context for AI-powered workflows and documentation
- **📁 File Generation** - Automated creation of 16 analysis files (index, context, diagrams, patterns, coverage, drift)
- **🔗 Graph Queries** - Query codebase relationships (what-calls, what-imports, shortest-path, impact analysis)
- **⚡ Performance** - In-process TypeScript scanning (3-6x faster than subprocess alternatives)
- **🎯 Type-Safe** - Complete TypeScript definitions with 26 type designators and validation

### Use Cases

- **Dashboard Integration** - Powers the CodeRef Dashboard UI scanner with real-time code analysis
- **CI/CD Pipelines** - Automated code quality checks and dependency validation
- **Documentation Generation** - Extract API endpoints, schemas, and component hierarchies
- **AI Workflows** - Provide rich context for LLM-based code assistance (RAG, embeddings, prompts)
- **Codebase Navigation** - Fast element search and relationship traversal

---

## Installation

```bash
npm install @coderef/core
```

**Requirements:**
- Node.js 16+
- TypeScript 5.0+ (for TypeScript projects)

---

## Quick Start

### Basic Scanning

```typescript
import { scanCurrentElements } from '@coderef/core';

// Scan TypeScript files in a directory
const elements = await scanCurrentElements('./src', 'ts', {
  recursive: true,
  exclude: ['**/node_modules/**', '**/dist/**']
});

console.log(`Found ${elements.length} code elements`);
// Output: Found 541 code elements

// Access element details
elements.forEach(el => {
  console.log(`${el.type}: ${el.name} (${el.file}:${el.line})`);
});
```

### Generate Output Files

```typescript
import { saveIndex, generateContext, buildDependencyGraph } from '@coderef/core';

// Scan and save to .coderef/index.json
const elements = await scanCurrentElements('./src', ['ts', 'tsx']);
await saveIndex('./my-project', elements);

// Generate context files (.coderef/context.json + context.md)
await generateContext('./my-project', elements);

// Build dependency graph (.coderef/graph.json)
const graph = await buildDependencyGraph('./my-project', elements);
```

### Dependency Analysis

```typescript
import { AnalyzerService } from '@coderef/core';

// Create analyzer for project
const analyzer = new AnalyzerService('./my-project');

// Analyze codebase
const result = await analyzer.analyze(['src/**/*.ts']);

console.log(`Nodes: ${result.statistics.nodeCount}`);
console.log(`Edges: ${result.statistics.edgeCount}`);
console.log(`Circular dependencies: ${result.circularDependencies.length}`);

// Query relationships
const callers = await analyzer.queryRelationships('scanCurrentElements', 'calls-me');
console.log('Functions that call scanCurrentElements:', callers);
```

---

## Core Modules

### 1. Scanner (`scanner/scanner.ts`)

Regex-based code element extraction supporting 8+ languages:

```typescript
import { scanCurrentElements, LANGUAGE_PATTERNS } from '@coderef/core';

// Scan multiple languages
const elements = await scanCurrentElements('./src', ['ts', 'tsx', 'js', 'jsx'], {
  recursive: true,
  exclude: ['**/*.test.ts']
});

// Access language-specific patterns
const tsPatterns = LANGUAGE_PATTERNS.ts; // TypeScript patterns
const pyPatterns = LANGUAGE_PATTERNS.py; // Python patterns
```

**Supported Types:** functions, classes, components, hooks, methods, constants, interfaces

### 2. Analyzer (`analyzer/analyzer-service.ts`)

AST-based dependency graph building and relationship queries:

```typescript
import { AnalyzerService } from '@coderef/core';

const analyzer = new AnalyzerService('./project-root');

// Build dependency graph
const result = await analyzer.analyze(['src/**/*.ts']);

// Find what calls a function
const callers = await analyzer.queryRelationships('myFunction', 'calls-me');

// Find what a function calls
const callees = await analyzer.queryRelationships('myFunction', 'calls');

// Find circular dependencies
console.log('Circular deps:', result.circularDependencies);
```

### 3. File Generation (`fileGeneration/`)

Generate 16 analysis files organized in 3 phases:

**Phase 1 - Core Files:**
```typescript
import { saveIndex, generateContext, buildDependencyGraph } from '@coderef/core';

await saveIndex(projectPath, elements);          // .coderef/index.json
await generateContext(projectPath, elements);    // .coderef/context.{json,md}
await buildDependencyGraph(projectPath, elements); // .coderef/graph.json
```

**Phase 2 - Analysis Reports:**
```typescript
import { detectPatterns, analyzeCoverage, validateReferences, detectDrift } from '@coderef/core';

await detectPatterns(projectPath, elements);     // .coderef/reports/patterns.json
await analyzeCoverage(projectPath, elements);    // .coderef/reports/coverage.json
await validateReferences(projectPath, elements); // .coderef/reports/validation.json
await detectDrift(projectPath, elements);        // .coderef/reports/drift.json
```

**Phase 3 - Diagrams:**
```typescript
import { generateDiagrams } from '@coderef/core';

await generateDiagrams(projectPath, elements);
// .coderef/diagrams/dependencies.mmd
// .coderef/diagrams/dependencies.dot
// .coderef/diagrams/calls.mmd
// .coderef/diagrams/imports.mmd
```

### 4. Query Engine (`query/query-executor.ts`)

Execute complex codebase queries:

```typescript
import { QueryExecutor } from '@coderef/core';

const executor = new QueryExecutor(elements);

// Find all functions in a file
const functions = executor.findByFile('src/scanner/scanner.ts', 'function');

// Find all React components
const components = executor.findByType('component');

// Search by name pattern
const testFiles = executor.search('*.test.ts');
```

### 5. Type System (`types/types.d.ts`)

26 type designators with validation and priorities:

```typescript
import { TypeDesignator, isValidTypeDesignator, getTypeMetadata } from '@coderef/core';

// Validate types
isValidTypeDesignator('Fn');  // true
isValidTypeDesignator('XYZ'); // false

// Get metadata
const meta = getTypeMetadata('C'); // Component metadata
console.log(meta.priority); // "High"
console.log(meta.description); // "React/Vue component"
```

---

## API Reference

See **[API.md](coderef/foundation-docs/API.md)** for complete API documentation.

### Main Exports

| Export | Type | Description |
|--------|------|-------------|
| `scanCurrentElements` | Function | Scan code elements from directory |
| `LANGUAGE_PATTERNS` | Object | Pattern definitions by language |
| `AnalyzerService` | Class | Dependency analysis orchestrator |
| `saveIndex` | Function | Save scan results to JSON |
| `generateContext` | Function | Generate context files |
| `buildDependencyGraph` | Function | Build dependency graph |
| `detectPatterns` | Function | Detect code patterns (handlers, API, tests) |
| `analyzeCoverage` | Function | Analyze test coverage |
| `validateReferences` | Function | Validate references and imports |
| `detectDrift` | Function | Detect changes since last scan |
| `generateDiagrams` | Function | Generate Mermaid/Graphviz diagrams |
| `QueryExecutor` | Class | Execute codebase queries |
| `TypeDesignator` | Enum | 26 type designators |

---

## Architecture

See **[ARCHITECTURE.md](coderef/foundation-docs/ARCHITECTURE.md)** for detailed system design.

### High-Level Overview

```
┌─────────────────────────────────────────────────┐
│         CodeRef Core Library                    │
├─────────────────────────────────────────────────┤
│  Scanner Module                                 │
│  ├── Regex-based element detection             │
│  ├── Multi-language support (8+ languages)     │
│  └── File traversal with glob patterns         │
├─────────────────────────────────────────────────┤
│  Analyzer Module                                │
│  ├── AST parsing (via acorn)                   │
│  ├── Import/export detection                   │
│  ├── Function call detection                   │
│  ├── Dependency graph building                 │
│  └── Circular dependency detection             │
├─────────────────────────────────────────────────┤
│  File Generation Module                         │
│  ├── Phase 1: Core files (index, context, graph)│
│  ├── Phase 2: Reports (patterns, coverage, etc)│
│  └── Phase 3: Diagrams (Mermaid, Graphviz)     │
├─────────────────────────────────────────────────┤
│  Query Module                                   │
│  ├── Element search and filtering              │
│  ├── Relationship queries (calls, imports)     │
│  └── Path finding (shortest-path, impact)      │
├─────────────────────────────────────────────────┤
│  Integration Module                             │
│  ├── RAG (Retrieval-Augmented Generation)      │
│  ├── Vector stores (Pinecone, Chroma, SQLite)  │
│  ├── LLM providers (OpenAI, Anthropic)         │
│  └── AI prompt generation                      │
└─────────────────────────────────────────────────┘
```

---

## Data Models

See **[SCHEMA.md](coderef/foundation-docs/SCHEMA.md)** for complete data schemas.

### Core Types

**ElementData** - Represents a code element:
```typescript
interface ElementData {
  id: string;           // Unique identifier
  name: string;         // Element name
  type: string;         // Type (function, class, component, etc)
  file: string;         // Source file path
  line: number;         // Line number
  hash: string;         // Content hash (SHA256)
  dependencies?: string[]; // Import/call dependencies
  metadata?: Record<string, any>; // Additional metadata
}
```

**DependencyGraph** - Graph structure:
```typescript
interface DependencyGraph {
  nodes: Map<string, GraphNode>;
  edges: GraphEdge[];
}

interface GraphNode {
  id: string;
  type: string;
  file: string;
  line?: number;
}

interface GraphEdge {
  source: string;
  target: string;
  type: 'import' | 'export' | 'call';
}
```

---

## Performance

### Benchmarks (541 elements, TypeScript project)

| Operation | Time | Notes |
|-----------|------|-------|
| Scan (regex) | ~1185ms | Multi-file recursive scan |
| File generation (16 files) | ~200ms | Parallel execution |
| Dependency graph | ~150ms | AST parsing + relationship detection |
| Query (element lookup) | <1ms | In-memory map lookup |

**Performance Tips:**
- ✅ Use `recursive: true` to scan entire directories efficiently
- ✅ Exclude node_modules and dist with glob patterns
- ✅ Leverage caching via `useCache: true` in AnalyzerService
- ✅ Run file generation in parallel (Phase 2 uses Promise.all)

---

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

**Test Coverage:**
- Scanner: 95%+ (regex patterns, file traversal, multi-language)
- Analyzer: 90%+ (graph building, circular deps, queries)
- File Generation: 85%+ (all 8 functions covered)
- Query Engine: 90%+ (search, filter, relationship queries)

---

## Integration Examples

### Next.js API Route

```typescript
// app/api/scanner/scan/route.ts
import { scanCurrentElements, saveIndex } from '@coderef/core';

export async function POST(request: Request) {
  const { projectPath } = await request.json();

  // Scan project
  const elements = await scanCurrentElements(projectPath, ['ts', 'tsx'], {
    recursive: true,
    exclude: ['**/node_modules/**']
  });

  // Save to .coderef/index.json
  await saveIndex(projectPath, elements);

  return Response.json({
    success: true,
    count: elements.length
  });
}
```

### CLI Tool

```typescript
#!/usr/bin/env node
import { scanCurrentElements, generateContext } from '@coderef/core';

const projectPath = process.argv[2] || process.cwd();

console.log(`Scanning ${projectPath}...`);

const elements = await scanCurrentElements(projectPath, ['ts', 'tsx', 'js', 'jsx']);
await generateContext(projectPath, elements);

console.log(`✓ Generated context for ${elements.length} elements`);
```

### Dashboard Integration

```typescript
// Dashboard UI component
import { scanCurrentElements } from '@coderef/core';

async function handleScan(projectPath: string) {
  const elements = await scanCurrentElements(projectPath, ['ts', 'tsx']);

  console.log(`Scanned ${elements.length} elements`);

  // Display in UI
  setElements(elements);
}
```

---

## Configuration

### Scan Options

```typescript
interface ScanOptions {
  recursive?: boolean;          // Traverse subdirectories (default: true)
  exclude?: string[];           // Exclude patterns (glob)
  include?: string[];           // Include patterns (glob)
  maxDepth?: number;            // Max directory depth
  followSymlinks?: boolean;     // Follow symbolic links (default: false)
}
```

### Example Configuration

```typescript
const options: ScanOptions = {
  recursive: true,
  exclude: [
    '**/node_modules/**',
    '**/dist/**',
    '**/*.test.ts',
    '**/*.spec.ts'
  ],
  maxDepth: 10
};

const elements = await scanCurrentElements('./src', 'ts', options);
```

---

## Troubleshooting

### Common Issues

**Q: Scanning returns 0 elements**
- ✅ Check file extensions match language patterns
- ✅ Verify directory path is correct (absolute vs relative)
- ✅ Review exclude patterns (might be too aggressive)

**Q: File generation fails with ENOENT**
- ✅ Ensure `.coderef/` directory exists (run `mkdir -p .coderef`)
- ✅ Check write permissions on project directory
- ✅ Verify projectPath is absolute path

**Q: Dependency graph has missing edges**
- ✅ Ensure all source files are included in scan
- ✅ Check import/export syntax is standard (no dynamic requires)
- ✅ Verify TypeScript/JavaScript parser can handle syntax

**Q: Performance is slow**
- ✅ Exclude large directories (node_modules, dist, build)
- ✅ Use caching (`useCache: true`)
- ✅ Limit file patterns to relevant extensions

---

## Roadmap

### v2.1.0 (Q1 2026)
- [ ] Add C++ and Ruby language support
- [ ] Incremental scanning (track file changes)
- [ ] Performance optimizations (parallel file reading)
- [ ] Enhanced TypeScript AST parsing (decorators, generics)

### v2.2.0 (Q2 2026)
- [ ] Real-time watch mode (auto-rescan on file changes)
- [ ] Plugin system for custom analyzers
- [ ] Web worker support for browser environments
- [ ] Enhanced diagram generation (D3.js, PlantUML)

### v3.0.0 (Q3 2026)
- [ ] Breaking: Unified AST-based parsing (replace regex)
- [ ] Enhanced RAG integration (embeddings, semantic search)
- [ ] Multi-repo analysis (monorepo support)
- [ ] GraphQL API for remote scanning

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Areas for Contribution:**
- 🌐 Add new language patterns (C++, Ruby, Swift, Kotlin)
- 🧪 Improve test coverage (integration tests, edge cases)
- 📚 Enhance documentation (examples, tutorials)
- ⚡ Performance optimizations (parallel scanning, caching)
- 🐛 Bug fixes and edge case handling

---

## License

MIT © CodeRef Team

---

## Resources

- **[API Documentation](coderef/foundation-docs/API.md)** - Complete API reference
- **[Architecture Guide](coderef/foundation-docs/ARCHITECTURE.md)** - System design and patterns
- **[Schema Reference](coderef/foundation-docs/SCHEMA.md)** - Data models and types
- **[CLAUDE.md](CLAUDE.md)** - AI development context
- **[Dashboard Integration](../../README.md)** - CodeRef Dashboard documentation

---

## Support

- 📧 Email: support@coderef.dev
- 💬 Discord: [Join our community](https://discord.gg/coderef)
- 🐛 Issues: [GitHub Issues](https://github.com/coderef/core/issues)
- 📖 Docs: [Official Documentation](https://docs.coderef.dev)

---

**Built with ❤️ by the CodeRef Team**

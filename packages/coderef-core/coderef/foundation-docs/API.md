# API Reference

**Project:** @coderef/core
**Version:** 2.0.0
**Last Updated:** 2026-01-09

---

## Table of Contents

1. [Scanner API](#scanner-api)
2. [Analyzer API](#analyzer-api)
3. [File Generation API](#file-generation-api)
4. [Query API](#query-api)
5. [Type System API](#type-system-api)
6. [Integration API](#integration-api)
7. [Utility APIs](#utility-apis)
8. [Error Handling](#error-handling)
9. [TypeScript Types](#typescript-types)

---

## Scanner API

### `scanCurrentElements()`

Scan code elements from a directory using regex patterns.

**Signature:**
```typescript
function scanCurrentElements(
  basePath: string,
  languages: string | string[],
  options?: ScanOptions
): Promise<ElementData[]>
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `basePath` | `string` | ✅ | Absolute or relative path to directory |
| `languages` | `string \| string[]` | ✅ | Language extensions (e.g., 'ts', ['ts', 'tsx']) |
| `options` | `ScanOptions` | ❌ | Scan configuration options |

**Options:**

```typescript
interface ScanOptions {
  recursive?: boolean;        // Traverse subdirectories (default: true)
  exclude?: string[];         // Glob patterns to exclude
  include?: string[];         // Glob patterns to include (overrides exclude)
  maxDepth?: number;          // Max directory depth (default: Infinity)
  followSymlinks?: boolean;   // Follow symbolic links (default: false)
}
```

**Returns:** `Promise<ElementData[]>` - Array of code elements found

**Example:**

```typescript
import { scanCurrentElements } from '@coderef/core';

// Basic scan
const elements = await scanCurrentElements('./src', 'ts');

// Multi-language scan with options
const elements = await scanCurrentElements('./src', ['ts', 'tsx', 'js', 'jsx'], {
  recursive: true,
  exclude: ['**/node_modules/**', '**/*.test.ts'],
  maxDepth: 10
});

// Access results
console.log(`Found ${elements.length} elements`);
elements.forEach(el => {
  console.log(`${el.type}: ${el.name} at ${el.file}:${el.line}`);
});
```

**Supported Languages:**

| Language | Extensions | Detects |
|----------|-----------|---------|
| TypeScript | `ts`, `tsx` | functions, classes, components, hooks, methods, constants |
| JavaScript | `js`, `jsx` | functions, classes, components, hooks, methods, constants |
| Python | `py` | functions, classes, methods |
| Go | `go` | functions, methods, structs, interfaces, constants |
| Rust | `rs` | functions, structs, enums, traits, impl blocks, constants |
| Java | `java` | methods, classes, interfaces, enums |
| C# | `cs` | methods, classes, interfaces, structs |
| PHP | `php` | functions, classes, methods |

**Throws:**
- `Error` - If directory not found
- `Error` - If unsupported language
- `Error` - If file read permission denied

---

### `LANGUAGE_PATTERNS`

Constant object containing regex patterns for each supported language.

**Type:**
```typescript
const LANGUAGE_PATTERNS: Record<string, Array<{
  type: ElementData['type'];
  pattern: RegExp;
  nameGroup: number;
}>>
```

**Example:**

```typescript
import { LANGUAGE_PATTERNS } from '@coderef/core';

// Get TypeScript patterns
const tsPatterns = LANGUAGE_PATTERNS.ts;
console.log(tsPatterns.length); // 7 patterns

// Get Python patterns
const pyPatterns = LANGUAGE_PATTERNS.py;

// Manually apply pattern
const content = fs.readFileSync('file.ts', 'utf-8');
const functionPattern = tsPatterns.find(p => p.type === 'function');
const matches = [...content.matchAll(functionPattern.pattern)];
```

---

## Analyzer API

### `AnalyzerService`

Main class for dependency analysis and relationship detection.

**Constructor:**

```typescript
class AnalyzerService {
  constructor(basePath?: string)
}
```

**Parameters:**
- `basePath` (optional): Project root path (default: `process.cwd()`)

**Example:**

```typescript
import { AnalyzerService } from '@coderef/core';

const analyzer = new AnalyzerService('./my-project');
```

---

### `analyze()`

Analyze codebase and build dependency graph.

**Signature:**

```typescript
analyze(
  patterns?: string[],
  useCache?: boolean
): Promise<AnalysisResult>
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `patterns` | `string[]` | `['packages/**/*.ts', '!**/node_modules/**', '!**/dist/**']` | Glob patterns for files |
| `useCache` | `boolean` | `true` | Use cached graph if available |

**Returns:** `Promise<AnalysisResult>`

```typescript
interface AnalysisResult {
  graph: DependencyGraph;
  statistics: {
    nodeCount: number;
    edgeCount: number;
    edgesByType: Record<string, number>;
    densityRatio: number;
    avgInDegree: number;
    avgOutDegree: number;
    circularity: number;
  };
  circularDependencies: CircularDependency[];
  isolatedNodes: GraphNode[];
  analysisTime: number;
}
```

**Example:**

```typescript
const result = await analyzer.analyze(['src/**/*.ts']);

console.log(`Found ${result.statistics.nodeCount} nodes`);
console.log(`Found ${result.statistics.edgeCount} edges`);
console.log(`Circular dependencies: ${result.circularDependencies.length}`);
console.log(`Isolated nodes: ${result.isolatedNodes.length}`);

// Access graph
const graph = result.graph;
graph.nodes.forEach(node => {
  console.log(`Node: ${node.id} (${node.type})`);
});
```

---

### `queryRelationships()`

Query relationships in the dependency graph.

**Signature:**

```typescript
queryRelationships(
  target: string,
  queryType: 'calls' | 'calls-me' | 'imports' | 'imports-me' |
             'depends-on' | 'depends-on-me',
  maxDepth?: number
): Promise<GraphNode[]>
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `target` | `string` | ✅ | Element to query (e.g., 'scanCurrentElements') |
| `queryType` | `string` | ✅ | Type of relationship query |
| `maxDepth` | `number` | ❌ | Max traversal depth (default: 3) |

**Query Types:**

| Query Type | Description |
|------------|-------------|
| `calls` | What does this element call? |
| `calls-me` | What calls this element? |
| `imports` | What does this element import? |
| `imports-me` | What imports this element? |
| `depends-on` | What does this element depend on? |
| `depends-on-me` | What depends on this element? |

**Example:**

```typescript
// Find what calls scanCurrentElements
const callers = await analyzer.queryRelationships('scanCurrentElements', 'calls-me');
console.log('Callers:', callers.map(n => n.id));

// Find what AnalyzerService imports
const imports = await analyzer.queryRelationships('AnalyzerService', 'imports');
console.log('Imports:', imports.map(n => n.id));

// Find dependencies with max depth
const deps = await analyzer.queryRelationships('GraphBuilder', 'depends-on', 2);
```

---

### `setElementMap()`

Set element map for enhanced graph building.

**Signature:**

```typescript
setElementMap(
  elementMap: Map<string, { id: string; type: string; file: string; line?: number }>
): void
```

**Example:**

```typescript
// Build element map from scan results
const elements = await scanCurrentElements('./src', ['ts', 'tsx']);
const elementMap = new Map(
  elements.map(el => [el.name, { id: el.id, type: el.type, file: el.file, line: el.line }])
);

analyzer.setElementMap(elementMap);
const result = await analyzer.analyze();
```

---

## File Generation API

### Phase 1: Core Files

#### `saveIndex()`

Save scan results to `.coderef/index.json`.

**Signature:**

```typescript
function saveIndex(
  projectPath: string,
  elements: ElementData[]
): Promise<void>
```

**Parameters:**
- `projectPath`: Absolute path to project root
- `elements`: Array of scanned elements

**Output File:** `.coderef/index.json`

**File Format:**

```json
{
  "version": "2.0.0",
  "generatedAt": "2026-01-09T12:00:00.000Z",
  "projectPath": "/path/to/project",
  "totalElements": 541,
  "elementsByType": {
    "function": 234,
    "class": 67,
    "component": 45
  },
  "elements": [...]
}
```

**Example:**

```typescript
import { scanCurrentElements, saveIndex } from '@coderef/core';

const elements = await scanCurrentElements('./src', ['ts', 'tsx']);
await saveIndex('./my-project', elements);
console.log('Saved to .coderef/index.json');
```

---

#### `generateContext()`

Generate AI-readable context files.

**Signature:**

```typescript
function generateContext(
  projectPath: string,
  elements: ElementData[]
): Promise<void>
```

**Output Files:**
- `.coderef/context.json` - Structured data
- `.coderef/context.md` - Human-readable summary

**JSON Format:**

```json
{
  "version": "2.0.0",
  "generatedAt": "2026-01-09T12:00:00.000Z",
  "projectPath": "/path/to/project",
  "statistics": {
    "totalElements": 541,
    "totalFiles": 89,
    "elementsByType": {...},
    "filesByExtension": {...}
  },
  "topFiles": [
    { "file": "scanner.ts", "elementCount": 12 }
  ]
}
```

**Example:**

```typescript
await generateContext('./my-project', elements);
// Creates: .coderef/context.json + context.md
```

---

#### `buildDependencyGraph()`

Build dependency graph from elements.

**Signature:**

```typescript
function buildDependencyGraph(
  projectPath: string,
  elements: ElementData[]
): Promise<DependencyGraph>
```

**Output File:** `.coderef/graph.json`

**Returns:** `DependencyGraph` object

**Example:**

```typescript
const graph = await buildDependencyGraph('./my-project', elements);

console.log(`Nodes: ${graph.nodes.size}`);
console.log(`Edges: ${graph.edges.length}`);

// Access graph data
graph.nodes.forEach((node, id) => {
  console.log(`${id}: ${node.type} in ${node.file}`);
});
```

---

### Phase 2: Analysis Reports

#### `detectPatterns()`

Detect common code patterns (handlers, decorators, API endpoints, etc).

**Signature:**

```typescript
function detectPatterns(
  projectPath: string,
  elements: ElementData[]
): Promise<void>
```

**Output File:** `.coderef/reports/patterns.json`

**Detects:**
- Event handlers (onClick, onSubmit, handleX)
- Decorators (@Component, @Injectable)
- Error patterns (try/catch, error classes)
- Test patterns (describe, it, test)
- API endpoints (GET, POST routes)

**Example:**

```typescript
await detectPatterns('./my-project', elements);
// Creates: .coderef/reports/patterns.json
```

---

#### `analyzeCoverage()`

Analyze test coverage.

**Signature:**

```typescript
function analyzeCoverage(
  projectPath: string,
  elements: ElementData[]
): Promise<void>
```

**Output File:** `.coderef/reports/coverage.json`

**Analyzes:**
- Test files vs source files
- Uncovered files
- Coverage percentage by type

**Example:**

```typescript
await analyzeCoverage('./my-project', elements);
// Creates: .coderef/reports/coverage.json
```

---

#### `validateReferences()`

Validate references and imports.

**Signature:**

```typescript
function validateReferences(
  projectPath: string,
  elements: ElementData[]
): Promise<void>
```

**Output File:** `.coderef/reports/validation.json`

**Validates:**
- Broken imports
- Missing files
- Undefined references

**Example:**

```typescript
await validateReferences('./my-project', elements);
// Creates: .coderef/reports/validation.json
```

---

#### `detectDrift()`

Detect changes since last scan.

**Signature:**

```typescript
function detectDrift(
  projectPath: string,
  elements: ElementData[]
): Promise<void>
```

**Output File:** `.coderef/reports/drift.json`

**Detects:**
- New elements
- Deleted elements
- Modified elements (hash changed)

**Example:**

```typescript
await detectDrift('./my-project', elements);
// Creates: .coderef/reports/drift.json
```

---

### Phase 3: Diagrams

#### `generateDiagrams()`

Generate visual dependency diagrams.

**Signature:**

```typescript
function generateDiagrams(
  projectPath: string,
  elements: ElementData[]
): Promise<void>
```

**Output Files:**
- `.coderef/diagrams/dependencies.mmd` - Mermaid diagram
- `.coderef/diagrams/dependencies.dot` - Graphviz diagram
- `.coderef/diagrams/calls.mmd` - Call graph
- `.coderef/diagrams/imports.mmd` - Import graph

**Example:**

```typescript
await generateDiagrams('./my-project', elements);
// Creates: 4 diagram files

// Render Mermaid diagrams with:
// npx @mermaid-js/mermaid-cli -i dependencies.mmd -o dependencies.png

// Render Graphviz diagrams with:
// dot -Tpng dependencies.dot -o dependencies.png
```

---

## Query API

### `QueryExecutor`

Execute complex queries on relationship graph.

**Constructor:**

```typescript
class QueryExecutor {
  constructor(analyzer: AnalyzerService, cacheExpiryMs?: number)
}
```

**Parameters:**
- `analyzer`: AnalyzerService instance
- `cacheExpiryMs` (optional): Cache expiry in milliseconds (default: 300000 = 5 minutes)

**Example:**

```typescript
import { QueryExecutor, AnalyzerService } from '@coderef/core';

const analyzer = new AnalyzerService('./my-project');
await analyzer.analyze();

const executor = new QueryExecutor(analyzer, 60000); // 1 minute cache
```

---

### `execute()`

Execute a query on the relationship graph.

**Signature:**

```typescript
execute(request: QueryRequest): Promise<QueryResult>
```

**Request:**

```typescript
interface QueryRequest {
  type: QueryType;
  target: string;       // Element to query
  source?: string;      // For path queries
  maxDepth?: number;    // Max traversal depth
  format?: 'raw' | 'summary' | 'full'; // Output format
}

type QueryType =
  | 'what-calls'        // What calls this element?
  | 'what-calls-me'     // What does this element call?
  | 'what-imports'      // What does this element import?
  | 'what-imports-me'   // What imports this element?
  | 'what-depends-on'   // What does this element depend on?
  | 'what-depends-on-me' // What depends on this element?
  | 'shortest-path'     // Find shortest path between two elements
  | 'all-paths';        // Find all paths between two elements
```

**Result:**

```typescript
interface QueryResult {
  query: QueryRequest;
  results: GraphNode[];
  count: number;
  executionTime: number;
  cached: boolean;
  timestamp: number;
  error?: string;
}
```

**Example:**

```typescript
// Find what calls a function
const result = await executor.execute({
  type: 'what-calls-me',
  target: 'scanCurrentElements'
});

console.log(`Found ${result.count} callers in ${result.executionTime}ms`);
console.log('Cached:', result.cached);

result.results.forEach(node => {
  console.log(`- ${node.id} (${node.file}:${node.line})`);
});

// Find shortest path
const pathResult = await executor.execute({
  type: 'shortest-path',
  source: 'scanCurrentElements',
  target: 'AnalyzerService'
});
```

---

### `clearCache()`

Clear query result cache.

**Signature:**

```typescript
clearCache(): void
```

**Example:**

```typescript
executor.clearCache();
console.log('Cache cleared');
```

---

### `getPerformanceMetrics()`

Get performance statistics for all queries.

**Signature:**

```typescript
getPerformanceMetrics(): Map<QueryType, { total: number; count: number; avg: number }>
```

**Example:**

```typescript
const metrics = executor.getPerformanceMetrics();

metrics.forEach((stats, queryType) => {
  console.log(`${queryType}: ${stats.count} queries, avg ${stats.avg}ms`);
});
```

---

## Type System API

### `TypeDesignator` (Enum)

26 type designators for code elements.

**Values:**

```typescript
enum TypeDesignator {
  F = 'F',        // File
  D = 'D',        // Directory
  C = 'C',        // Component
  Fn = 'Fn',      // Function
  Cl = 'Cl',      // Class
  M = 'M',        // Method
  V = 'V',        // Variable
  S = 'S',        // Style
  T = 'T',        // Test
  A = 'A',        // API Route
  Cfg = 'Cfg',    // Config
  H = 'H',        // Hook
  Ctx = 'Ctx',    // Context
  R = 'R',        // Redux
  Q = 'Q',        // Query
  I = 'I',        // Interface/Type
  Doc = 'Doc',    // Documentation
  Gen = 'Gen',    // Generated
  Dep = 'Dep',    // Dependency
  E = 'E',        // Event
  WIP = 'WIP',    // Work in Progress
  AST = 'AST'     // Abstract Syntax Tree
}
```

---

### `isValidTypeDesignator()`

Validate type designator.

**Signature:**

```typescript
function isValidTypeDesignator(type: string): boolean
```

**Example:**

```typescript
import { isValidTypeDesignator } from '@coderef/core';

isValidTypeDesignator('Fn');    // true
isValidTypeDesignator('C');     // true
isValidTypeDesignator('XYZ');   // false
```

---

### `getTypeMetadata()`

Get metadata for a type designator.

**Signature:**

```typescript
function getTypeMetadata(type: string): TypeMetadata | null
```

**Returns:**

```typescript
interface TypeMetadata {
  name: string;
  description: string;
  priority: TypePriority;
  examples: string[];
}
```

**Example:**

```typescript
import { getTypeMetadata } from '@coderef/core';

const meta = getTypeMetadata('Fn');
console.log(meta.name);         // "Function"
console.log(meta.description);  // "Standalone function or arrow function"
console.log(meta.priority);     // "High"
console.log(meta.examples);     // ["function foo()", "const bar = () => {}"]
```

---

### `getTypePriority()`

Get priority for a type.

**Signature:**

```typescript
function getTypePriority(type: string): TypePriority

enum TypePriority {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low'
}
```

**Example:**

```typescript
import { getTypePriority, TypePriority } from '@coderef/core';

getTypePriority('Fn');   // TypePriority.High
getTypePriority('M');    // TypePriority.Medium
getTypePriority('Doc');  // TypePriority.Low
```

---

### `getHighPriorityTypes()`

Get all high-priority types.

**Signature:**

```typescript
function getHighPriorityTypes(): string[]
```

**Example:**

```typescript
import { getHighPriorityTypes } from '@coderef/core';

const highPrio = getHighPriorityTypes();
console.log(highPrio); // ['Fn', 'Cl', 'C', 'H', 'A']
```

---

### `getTypesByPriority()`

Get all types by priority level.

**Signature:**

```typescript
function getTypesByPriority(priority: TypePriority): string[]
```

**Example:**

```typescript
import { getTypesByPriority, TypePriority } from '@coderef/core';

const highTypes = getTypesByPriority(TypePriority.High);
const mediumTypes = getTypesByPriority(TypePriority.Medium);
const lowTypes = getTypesByPriority(TypePriority.Low);
```

---

## Integration API

**Note:** Integration module is currently disabled due to missing AI dependencies. Enable by uncommenting in `src/index.ts`.

### RAG (Retrieval-Augmented Generation)

```typescript
// To be documented when integration module is enabled
```

### LLM Providers

```typescript
// To be documented when integration module is enabled
```

### Vector Stores

```typescript
// To be documented when integration module is enabled
```

---

## Utility APIs

### `convertGraphToElements()`

Convert graph to element array format.

**Signature:**

```typescript
function convertGraphToElements(
  graph: DependencyGraph,
  options?: ConversionOptions
): ElementData[]
```

**Example:**

```typescript
import { convertGraphToElements } from '@coderef/core';

const elements = convertGraphToElements(graph);
console.log(`Converted ${elements.length} nodes to elements`);
```

---

### `getConversionStats()`

Get statistics about graph-to-element conversion.

**Signature:**

```typescript
function getConversionStats(
  graph: DependencyGraph
): { nodeCount: number; edgeCount: number; conversionRate: number }
```

---

## Error Handling

### Error Types

**GraphError:**

```typescript
class GraphError extends Error {
  code: GraphErrorCode;
  details?: any;
}

enum GraphErrorCode {
  INVALID_NODE = 'INVALID_NODE',
  INVALID_EDGE = 'INVALID_EDGE',
  CIRCULAR_DEPENDENCY = 'CIRCULAR_DEPENDENCY',
  NODE_NOT_FOUND = 'NODE_NOT_FOUND',
  EDGE_NOT_FOUND = 'EDGE_NOT_FOUND'
}
```

**Example:**

```typescript
import { GraphError, GraphErrorCode } from '@coderef/core';

try {
  const result = await analyzer.queryRelationships('nonexistent', 'calls');
} catch (error) {
  if (error instanceof GraphError) {
    console.error(`Graph error: ${error.code}`);
    console.error(`Details:`, error.details);
  }
}
```

---

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Directory not found` | Invalid basePath | Check path exists |
| `Unsupported language` | Invalid language code | Use supported language |
| `File too large` | File > 10MB | Exclude large files |
| `Node not found` | Invalid element ID in query | Verify element exists |
| `Parse error` | Invalid syntax in source file | Fix syntax errors |

---

## TypeScript Types

### Core Types

**ElementData:**

```typescript
interface ElementData {
  id: string;               // Unique identifier
  name: string;             // Element name
  type: string;             // Type (function, class, etc)
  file: string;             // Source file path
  line: number;             // Line number
  hash: string;             // Content hash (SHA256)
  dependencies?: string[];  // Import/call dependencies
  metadata?: Record<string, any>; // Additional metadata
}
```

**DependencyGraph:**

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

**ScanOptions:**

```typescript
interface ScanOptions {
  recursive?: boolean;
  exclude?: string[];
  include?: string[];
  maxDepth?: number;
  followSymlinks?: boolean;
}
```

---

## Rate Limits & Quotas

**None** - @coderef/core is a local library with no external API calls (unless using integration module).

---

## Versioning

@coderef/core follows [Semantic Versioning](https://semver.org/):
- **Major:** Breaking API changes
- **Minor:** New features (backward compatible)
- **Patch:** Bug fixes

**Current:** v2.0.0

---

## Support

- 📧 Email: support@coderef.dev
- 💬 Discord: [Join our community](https://discord.gg/coderef)
- 🐛 Issues: [GitHub Issues](https://github.com/coderef/core/issues)
- 📖 Docs: [Official Documentation](https://docs.coderef.dev)

---

**Last Updated:** 2026-01-09

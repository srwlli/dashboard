# CodeRef CLI - Complete Capabilities Reference
**Created:** 2026-01-04
**Purpose:** Full documentation of CodeRef CLI commands to replicate in TypeScript
**Source:** Analysis of `generate-coderef-directories.py` and scanner scripts

---

## Overview

The CodeRef CLI provides 9 commands that generate 16 output files across 4 directories (.coderef/, reports/, diagrams/, exports/). This document catalogs every command, parameter, and output format for TypeScript replication.

---

## CLI Commands

### **1. coderef scan**
**Purpose:** Scan codebase and generate element index

**Usage:**
```bash
coderef scan "{project_path}" -l {languages} --json
```

**Parameters:**
- `{project_path}` - Absolute path to project directory
- `-l, --lang` - Comma-separated language extensions (e.g., `py,ts,tsx,js,jsx`)
- `--json` - Output as JSON format

**Output:** Element index with functions, classes, components, interfaces

**Output File:** `.coderef/index.json`

**Example:**
```bash
coderef scan "C:/Users/project" -l ts,tsx,js,jsx --json > .coderef/index.json
```

**TypeScript Equivalent:** `scanCurrentElements()` from `@coderef/core`

---

### **2. coderef context**
**Purpose:** Generate project context summary

**Usage:**
```bash
coderef context "{project_path}" [-f {format}]
```

**Parameters:**
- `{project_path}` - Absolute path to project directory
- `-f, --format` - Output format: `json` or markdown (default: markdown)

**Outputs:**
- `context.json` - Structured project context (with `-f json`)
- `context.md` - Markdown summary (default)

**Output Files:**
- `.coderef/context.json`
- `.coderef/context.md`

**Examples:**
```bash
coderef context "C:/Users/project" -f json > .coderef/context.json
coderef context "C:/Users/project" > .coderef/context.md
```

**TypeScript Equivalent:** `generateContext()` - **TO BE IMPLEMENTED**

---

### **3. coderef export**
**Purpose:** Export dependency graph in various formats

**Usage:**
```bash
coderef export -f {format} -s "{source}" --lang {languages} -o "{output}"
```

**Parameters:**
- `-f, --format` - Export format: `json`, `jsonld`
- `-s, --source` - Source project path
- `--lang` - Language filters
- `-o, --output` - Output file path

**Formats:**
- `json` - Standard JSON graph
- `jsonld` - JSON-LD semantic web format

**Output Files:**
- `.coderef/graph.json` (root level, duplicate of exports/graph.json)
- `.coderef/exports/graph.json` (full export)
- `.coderef/exports/graph.jsonld` (semantic web format)

**Examples:**
```bash
coderef export -f json -s "C:/Users/project" --lang ts,tsx,js,jsx -o ".coderef/graph.json"
coderef export -f json -s "C:/Users/project" --lang ts,tsx,js,jsx -o ".coderef/exports/graph.json"
coderef export -f jsonld -s "C:/Users/project" --lang ts,tsx,js,jsx -o ".coderef/exports/graph.jsonld"
```

**TypeScript Equivalent:** `buildDependencyGraph()` + `exportFormats()` - **TO BE IMPLEMENTED**

---

### **4. coderef patterns**
**Purpose:** Detect code patterns (handlers, decorators, error patterns)

**Usage:**
```bash
coderef patterns -f json
```

**Parameters:**
- `-f, --format` - Output format: `json`

**Output:** Pattern detection report with categorized findings:
- Handlers (functions/classes ending in Handler, Controller)
- Decorators (@Component, @Injectable, etc.)
- Error handling patterns (try/catch, error classes)
- Test patterns (describe, it, test)
- API endpoints (GET, POST, PUT, DELETE)
- Components (React components, Vue components)

**Output File:** `.coderef/reports/patterns.json`

**Example:**
```bash
coderef patterns -f json > .coderef/reports/patterns.json
```

**TypeScript Equivalent:** `detectPatterns()` - **TO BE IMPLEMENTED**

---

### **5. coderef coverage**
**Purpose:** Analyze test coverage

**Usage:**
```bash
coderef coverage -f json
```

**Parameters:**
- `-f, --format` - Output format: `json`

**Output:** Test coverage analysis report:
- Total elements
- Tested elements
- Coverage percentage
- Uncovered files
- Test file list

**Output File:** `.coderef/reports/coverage.json`

**Example:**
```bash
coderef coverage -f json > .coderef/reports/coverage.json
```

**TypeScript Equivalent:** `analyzeCoverage()` - **TO BE IMPLEMENTED**

---

### **6. coderef validate**
**Purpose:** Validate CodeRef references and imports

**Usage:**
```bash
coderef validate "{project_path}" -f json
```

**Parameters:**
- `{project_path}` - Absolute path to project directory
- `-f, --format` - Output format: `json`

**Output:** Validation report with:
- Valid references count
- Invalid references count
- Error details (broken references, missing imports)
- Warning details (deprecated references)

**Output File:** `.coderef/reports/validation.json`

**Example:**
```bash
coderef validate "C:/Users/project" -f json > .coderef/reports/validation.json
```

**TypeScript Equivalent:** `validateReferences()` - **TO BE IMPLEMENTED**

---

### **7. coderef drift**
**Purpose:** Detect drift between index and current codebase

**Usage:**
```bash
coderef drift "{project_path}" --json -i "{index_path}"
```

**Parameters:**
- `{project_path}` - Absolute path to project directory
- `--json` - Output as JSON
- `-i, --index` - Path to existing index.json file

**Output:** Drift report showing:
- Added elements (new since last scan)
- Removed elements (deleted since last scan)
- Modified elements (changed signatures/locations)
- Drift summary

**Output File:** `.coderef/reports/drift.json`

**Example:**
```bash
coderef drift "C:/Users/project" --json -i ".coderef/index.json" > .coderef/reports/drift.json
```

**TypeScript Equivalent:** `detectDrift()` - **TO BE IMPLEMENTED**

---

### **8. coderef complexity**
**Purpose:** Calculate complexity metrics for code elements

**Usage:**
```bash
coderef complexity {element} -f json
```

**Parameters:**
- `{element}` - Element name or ID to analyze
- `-f, --format` - Output format: `json`

**Output:** Complexity metrics:
- Cyclomatic complexity
- Cognitive complexity
- Lines of code
- Number of parameters
- Nesting depth

**Output File:** `.coderef/reports/complexity/{element}.json`

**Example:**
```bash
coderef complexity "MyFunction" -f json > .coderef/reports/complexity/MyFunction.json
```

**Note:** On-demand generation (not part of batch scan). A README.md is created in complexity/ directory with usage instructions.

**TypeScript Equivalent:** `calculateComplexity()` - **ON-DEMAND (not in batch)**

---

### **9. coderef diagram**
**Purpose:** Generate visual diagrams (Mermaid, Graphviz/DOT)

**Usage:**
```bash
coderef diagram -f {format} -t {type} -l {languages} "{element}" "{project_path}"
```

**Parameters:**
- `-f, --format` - Diagram format: `mermaid` or `dot`
- `-t, --type` - Diagram type: `dependencies`, `calls`, `imports`
- `-l, --lang` - Language filters
- `{element}` - Element filter (empty string `""` for all)
- `{project_path}` - Absolute path to project directory

**Diagram Types:**
- `dependencies` - Dependency graph (module-level relationships)
- `calls` - Function call graph (function-level relationships)
- `imports` - Import relationship graph (import statements)

**Formats:**
- `mermaid` - Mermaid diagram syntax (.mmd) for web rendering
- `dot` - Graphviz DOT format (.dot) for advanced visualization

**Output Files:**
- `.coderef/diagrams/dependencies.mmd`
- `.coderef/diagrams/dependencies.dot`
- `.coderef/diagrams/calls.mmd`
- `.coderef/diagrams/imports.mmd`

**Examples:**
```bash
# Mermaid dependency diagram
coderef diagram -f mermaid -t dependencies -l ts,tsx,js,jsx "" "C:/Users/project" > .coderef/diagrams/dependencies.mmd

# Graphviz dependency diagram
coderef diagram -f dot -t dependencies -l ts,tsx,js,jsx "" "C:/Users/project" > .coderef/diagrams/dependencies.dot

# Call graph
coderef diagram -f mermaid -t calls -l ts,tsx,js,jsx "" "C:/Users/project" > .coderef/diagrams/calls.mmd

# Import graph
coderef diagram -f mermaid -t imports -l ts,tsx,js,jsx "" "C:/Users/project" > .coderef/diagrams/imports.mmd
```

**TypeScript Equivalent:** `generateDiagrams()` - **TO BE IMPLEMENTED**

---

## Summary: 9 CLI Commands

| # | Command | Purpose | Output Files | TypeScript Status |
|---|---------|---------|--------------|-------------------|
| 1 | `scan` | Index codebase elements | index.json | ✅ EXISTS (`scanCurrentElements`) |
| 2 | `context` | Project summary | context.json, context.md | ❌ TO IMPLEMENT |
| 3 | `export` | Export dependency graphs | graph.json, graph.jsonld | ❌ TO IMPLEMENT |
| 4 | `patterns` | Detect code patterns | patterns.json | ❌ TO IMPLEMENT |
| 5 | `coverage` | Test coverage analysis | coverage.json | ❌ TO IMPLEMENT |
| 6 | `validate` | Validate references | validation.json | ❌ TO IMPLEMENT |
| 7 | `drift` | Detect index drift | drift.json | ❌ TO IMPLEMENT |
| 8 | `complexity` | Element complexity | complexity/{element}.json | ⚪ ON-DEMAND (skip) |
| 9 | `diagram` | Visual diagrams | *.mmd, *.dot (4 files) | ❌ TO IMPLEMENT |

**Total Output Files:** 16 files (15 batch + 1 on-demand README)

---

## Output File Structure

```
.coderef/
├── index.json                    # scan
├── graph.json                    # export (root level)
├── context.json                  # context
├── context.md                    # context
├── reports/
│   ├── patterns.json            # patterns
│   ├── coverage.json            # coverage
│   ├── validation.json          # validate
│   ├── drift.json               # drift
│   └── complexity/
│       └── README.md            # (on-demand guide)
├── diagrams/
│   ├── dependencies.mmd         # diagram
│   ├── dependencies.dot         # diagram
│   ├── calls.mmd                # diagram
│   └── imports.mmd              # diagram
└── exports/
    ├── graph.json               # export (full)
    ├── graph.jsonld             # export (semantic)
    └── diagram-wrapped.md       # (script-generated wrapper)
```

---

## Common Parameters Reference

| Parameter | Values | Description | Used By |
|-----------|--------|-------------|---------|
| `-l, --lang` | `py,ts,tsx,js,jsx` | Language file extensions | scan, export, diagram |
| `-f, --format` | `json`, `markdown`, `mermaid`, `dot`, `jsonld` | Output format | context, export, patterns, coverage, validate, complexity, diagram |
| `-s, --source` | `{project_path}` | Source project path | export |
| `-o, --output` | `{file_path}` | Output file path | export |
| `--json` | (flag) | JSON output mode | scan, drift |
| `-i, --index` | `{index_path}` | Path to index file | drift |
| `-t, --type` | `dependencies`, `calls`, `imports` | Diagram type | diagram |
| `{project_path}` | Absolute path | Project directory | scan, context, validate, drift, diagram |
| `{element}` | Element name/ID or `""` | Element filter | complexity, diagram |

---

## TypeScript Implementation Checklist

### Phase 1: Core Data Generation
- [x] **scan** - `scanCurrentElements()` already exists
- [ ] **save index** - Add `saveIndex()` to persist scan results
- [ ] **context** - Implement `generateContext()` for JSON + MD
- [ ] **export** - Implement `buildDependencyGraph()` for graph.json

### Phase 2: Reports & Analysis
- [ ] **patterns** - Implement `detectPatterns()`
- [ ] **coverage** - Implement `analyzeCoverage()`
- [ ] **validate** - Implement `validateReferences()`
- [ ] **drift** - Implement `detectDrift()`

### Phase 3: Diagrams & Exports
- [ ] **diagram** - Implement `generateDiagrams()` for Mermaid + DOT
- [ ] **export formats** - Implement `exportFormats()` for JSON-LD + wrapped MD

### Phase 4: On-Demand (Optional)
- [ ] **complexity** - Implement `calculateComplexity()` (on-demand, not batch)

---

## Implementation Priority

**High Priority (MVP):**
1. Save index.json (critical - data currently discarded)
2. Generate context files (needed for AI/MCP integration)
3. Build dependency graph (foundation for diagrams)
4. Detect patterns (high value for code analysis)

**Medium Priority (Enhanced):**
5. Analyze coverage (useful but not critical)
6. Validate references (quality checks)
7. Detect drift (incremental scanning)

**Low Priority (Polish):**
8. Generate diagrams (visual enhancement)
9. Export formats (alternative representations)
10. Complexity metrics (on-demand, nice-to-have)

---

## Integration Points

### Current Scanner Integration
```typescript
// packages/dashboard/src/app/api/scanner/lib/scanExecutor.ts

private async runScanForProject(projectPath: string): Promise<void> {
  const elements = await scanCurrentElements(projectPath, ...);

  // TODO: Add file generation here
  await saveIndex(projectPath, elements);
  await generateContext(projectPath, elements);
  const graph = await buildDependencyGraph(projectPath, elements);
  // ... etc
}
```

### Package Exports
```typescript
// packages/coderef-core/src/index.ts

export { scanCurrentElements } from './scanner/scanCurrentElements';
export { saveIndex } from './scanner/saveIndex';
export { generateContext } from './scanner/generateContext';
export { buildDependencyGraph } from './scanner/buildGraph';
export { detectPatterns } from './scanner/detectPatterns';
export { analyzeCoverage } from './scanner/analyzeCoverage';
export { validateReferences } from './scanner/validateReferences';
export { detectDrift } from './scanner/detectDrift';
export { generateDiagrams } from './scanner/generateDiagrams';
export { exportFormats } from './scanner/exportFormats';
```

---

## Testing Strategy

Each CLI command should have corresponding tests:

```typescript
// packages/coderef-core/src/__tests__/scanner.test.ts

describe('CLI Equivalents', () => {
  test('scan -> scanCurrentElements', async () => {
    const elements = await scanCurrentElements(projectPath, ...);
    expect(elements).toHaveLength(expected);
  });

  test('scan + save -> saveIndex', async () => {
    await saveIndex(projectPath, elements);
    const saved = await fs.readFile(indexPath);
    expect(JSON.parse(saved)).toEqual(elements);
  });

  test('context -> generateContext (JSON)', async () => {
    const { json } = await generateContext(projectPath, elements);
    expect(json.totalElements).toBe(elements.length);
  });

  test('context -> generateContext (MD)', async () => {
    const { markdown } = await generateContext(projectPath, elements);
    expect(markdown).toContain('# Project Context');
  });

  // ... etc for all 9 commands
});
```

---

## Performance Considerations

**CLI Approach (Current - External):**
- Each command spawns new process
- 9 commands × process overhead = slower
- 16 files generated sequentially
- Requires CodeRef CLI installed

**TypeScript Approach (Target - In-Process):**
- Single process, multiple functions
- Shared data (scan once, generate all)
- Parallel file generation possible
- No external dependencies

**Estimated Performance:**
- CLI: ~10-30 seconds (9 process spawns)
- TypeScript: ~2-5 seconds (in-process)

---

## Migration Strategy

1. **Phase 0 (Current):** Directories script works ✅
2. **Phase 1 (Next):** Implement saveIndex() + generateContext()
3. **Phase 2:** Implement remaining 7 functions
4. **Phase 3:** Remove Python populate script dependency
5. **Phase 4:** Optimize and add on-demand features

---

**Reference Documents:**
- `TYPESCRIPT-IMPLEMENTATION-PLAN.md` - Full implementation guide
- `SCANNER-SYSTEM.md` - Current architecture
- `generate-coderef-directories.py` - Python reference implementation

**Last Updated:** 2026-01-04

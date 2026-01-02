# Prompts Page - Prompting Workflow Documentation

## Page Architecture

**Route:** `/prompts` (`packages/dashboard/src/app/prompts/page.tsx`)
**Main Component:** `PromptingWorkflow` (`packages/dashboard/src/components/PromptingWorkflow/`)
**State Management:** `WorkflowContext` with localStorage persistence
**Purpose:** Orchestrate AI-assisted code review and analysis workflows

---

## System Overview

The Prompts page is a 4-step workflow for preparing AI prompts with attached code files:

```
1. Select Prompt Template (CODE_REVIEW, SYNTHESIZE, CONSOLIDATE)
   ↓
2. Choose Focus Areas (Tags - only for CODE_REVIEW)
   ↓
3. Attach Files (from Explorer, paste text, or upload)
   ↓
4. Export → Copy JSON / Download JSON / Download Markdown
```

**Key Innovation:** Tag-based filtering allows users to focus code review on specific improvement areas (Performance, Security, etc.) instead of receiving generic catch-all feedback.

---

## Tag System (8 Improvement Categories)

**File:** `constants/tags.ts` (packages/dashboard/src/components/PromptingWorkflow/constants/)

### Tag Data Structure

```typescript
export interface ImprovementTag {
  id: string;           // 'performance', 'security', etc.
  label: string;        // 'Performance', 'Security', etc.
  icon: string;         // Lucide icon name ('Zap', 'Lock')
  description: string;  // Tooltip text
}
```

### 8 Predefined Tags

| Tag ID | Label | Icon | Description |
|--------|-------|------|-------------|
| `performance` | Performance | Zap | Speed, efficiency, optimization |
| `security` | Security | Lock | Vulnerabilities, auth, data protection |
| `code-quality` | Code Quality | Sparkles | Readability, maintainability, patterns |
| `architecture` | Architecture | Building2 | Structure, design, scalability |
| `testing` | Testing | FlaskConical | Coverage, test quality, edge cases |
| `accessibility` | Accessibility | Accessibility | A11y, screen readers, WCAG |
| `error-handling` | Error Handling | AlertTriangle | Edge cases, validation, recovery |
| `ux-ui` | UX/UI | Palette | User experience, design, usability |

**Helper Functions:**
- `getAllTags()` - Returns all 8 tags as array
- `getTag(tagId)` - Get single tag by ID
- `getTagsByIds(tagIds)` - Get multiple tags (for selected tags)

---

## Ecosystem Tag System (10 Categories)

**File:** `constants/ecosystem-tags.ts` (packages/dashboard/src/components/PromptingWorkflow/constants/)

### Ecosystem Tag Data Structure

```typescript
export interface EcosystemTag {
  id: string;           // 'documentation', 'workflows', etc.
  label: string;        // 'Documentation', 'Workflows', etc.
  icon: string;         // Lucide icon name ('FileText', 'GitBranch')
  description: string;  // Tooltip text
}
```

### 10 Predefined Ecosystem Tags

| Tag ID | Label | Icon | Description |
|--------|-------|------|-------------|
| `documentation` | Documentation | FileText | Foundation docs, standards, workflows, coderef outputs |
| `code-quality` | Code Quality | Code2 | Patterns, complexity, architecture, dependencies |
| `workflows` | Workflows | GitBranch | Planning, execution, coordination, handoff |
| `integration` | Integration | Plug | MCP servers, ecosystem, CLI, dashboard, git |
| `standards` | Standards | Ruler | UI, UX, API, behavior standards |
| `agent-coordination` | Agent Coordination | Users | Personas, multi-agent, context, tooling |
| `metadata-governance` | Metadata & Governance | Database | Versioning, provenance, schemas, validation |
| `outputs` | Outputs | FileOutput | Reports, diagrams, exports, deliverables |
| `performance` | Performance | Zap | System performance, caching, scalability |
| `testing` | Testing | FlaskConical | Test coverage, automation, quality |

**Helper Functions:**
- `getAllEcosystemTags()` - Returns all 10 tags as array
- `getEcosystemTag(tagId)` - Get single tag by ID
- `getEcosystemTagsByIds(tagIds)` - Get multiple tags (for selected tags)

---

## Prompt Templates

**File:** `utils/prompts.ts`

### Available Prompts

**1. CODE_REVIEW (key: '0001')**
- **Purpose:** Detailed code analysis with categorized feedback
- **Tokens:** ~950
- **Tags:** Supports 8 improvement tags
- **Description:** "Analyze code for improvements across 8 categories"
- **Output:** Structured feedback by category (only selected tags)

**2. SYNTHESIZE (key: '0002')**
- **Purpose:** Consolidate multiple code files into unified analysis
- **Tokens:** ~1300
- **Tags:** Not supported
- **Description:** "Merge insights from multiple files"

**3. CONSOLIDATE (key: '0003')**
- **Purpose:** Compare and contrast implementation patterns
- **Tokens:** ~1300
- **Tags:** Not supported
- **Description:** "Find patterns and inconsistencies across files"

**4. CODEREF_ECOSYSTEM_REVIEW (key: '0004')**
- **Purpose:** Review CodeRef ecosystem components → structured JSON analysis
- **Tokens:** ~1200
- **Tags:** Supports 10 ecosystem-specific tags
- **Description:** "Review coderef ecosystem components → structured JSON analysis"
- **Output:** Valid JSON object (not markdown) with agent_metadata, component_overview, ecosystem_analysis
- **Workflow:** Multi-agent coordination - agents save to `coderef/reviews/{review-title}/responses/{agent-id}.json`
- **Review Title:** User prompted for title before export (e.g., "Q1-2026-Documentation-Review")

### Prompt Selection UI

Located in `PromptSelector.tsx`:

```typescript
// Grid layout: 3 columns on desktop, 2 on tablet, 1 on mobile
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {prompts.map((prompt) => (
    <div
      key={prompt.key}
      className={`p-4 border-2 ${
        selectedPromptKey === prompt.key
          ? 'border-ind-accent bg-ind-panel shadow-lg'
          : 'border-ind-border hover:border-ind-accent'
      }`}
    >
      {/* Prompt card content */}
    </div>
  ))}
</div>
```

**Visual States:**
- **Unselected:** Border: `border-ind-border`, Background: `bg-ind-panel`
- **Selected:** Border: `border-ind-accent`, Shadow: `shadow-lg shadow-ind-accent/20`
- **Hover:** Border changes to `border-ind-accent`

---

## Tag Interaction Flow

### CODE_REVIEW Tags (key: '0001')

**8 Improvement Categories**

1. **User clicks CODE_REVIEW prompt** → Prompt card selected
2. **Tag chips appear** below prompt description (8 chips)
3. **User clicks tag chip** → Tag toggles active/inactive
4. **Multiple tags can be selected** → All selected tags included in export

### CODEREF_ECOSYSTEM_REVIEW Tags (key: '0004')

**10 Ecosystem Categories**

1. **User clicks CODEREF_ECOSYSTEM_REVIEW prompt** → Prompt card selected
2. **Ecosystem tag chips appear** below prompt description (10 chips)
3. **User clicks ecosystem tag chip** → Tag toggles active/inactive
4. **Multiple tags can be selected** → All selected tags included in export
5. **Same visual styling** as CODE_REVIEW tags for consistency

### Tag Chip Component

**File:** `PromptSelector.tsx` (lines 73-106)

```typescript
{prompt.key === '0001' && onToggleTag && (
  <div className="mt-3 mb-3 border-t border-ind-border pt-3">
    <p className="text-xs text-ind-text-muted mb-2 font-mono">
      Focus Areas (click to select):
    </p>
    <div className="flex flex-wrap gap-2">
      {allTags.map((tag) => {
        const isActive = selectedTags.includes(tag.id);
        const IconComponent = ICON_MAP[tag.icon];
        return (
          <button
            key={tag.id}
            onClick={(e) => {
              e.stopPropagation(); // Prevent prompt card click
              onToggleTag(tag.id);
            }}
            className={`
              px-2 py-1 text-xs flex items-center gap-1
              ${isActive
                ? 'border-2 border-ind-accent bg-ind-accent/10 text-ind-text'
                : 'border border-ind-border bg-ind-bg text-ind-text-muted hover:border-ind-accent'
              }
            `}
            title={tag.description}
          >
            {IconComponent && <IconComponent className="w-3 h-3" />}
            {tag.label}
          </button>
        );
      })}
    </div>
  </div>
)}
```

**Visual States:**
- **Inactive:** Border: `border-ind-border` (1px), Background: `bg-ind-bg`, Text: `text-ind-text-muted`
- **Active:** Border: `border-ind-accent` (2px), Background: `bg-ind-accent/10`, Text: `text-ind-text`
- **Hover (inactive):** Border changes to `border-ind-accent`

**Icon Mapping:**

```typescript
const ICON_MAP: Record<string, LucideIcon> = {
  // CODE_REVIEW tags (8)
  'Zap': Zap,
  'Lock': Lock,
  'Sparkles': Sparkles,
  'Building2': Building2,
  'FlaskConical': FlaskConical,
  'Accessibility': Accessibility,
  'AlertTriangle': AlertTriangle,
  'Palette': Palette,
  // CODEREF_ECOSYSTEM_REVIEW tags (10)
  'FileText': FileText,
  'Code2': Code2,
  'GitBranch': GitBranch,
  'Plug': Plug,
  'Ruler': Ruler,
  'Users': Users,
  'Database': Database,
  'FileOutput': FileOutput,
};
```

---

## WorkflowContext State Management

**File:** `contexts/WorkflowContext.tsx`

### State Schema

```typescript
interface Workflow {
  id: string;                          // UUID
  selectedPrompt?: PreloadedPrompt;    // Currently selected prompt
  selectedTags?: string[];             // Active tag IDs (CODE_REVIEW only)
  attachments: Attachment[];           // Attached files
  finalResult?: string;                // LLM output (pasted back)
  createdAt: Date;
  updatedAt: Date;
}
```

### Context API

```typescript
interface WorkflowContextValue {
  workflow: Workflow;                       // Current state
  setSelectedPrompt: (prompt: PreloadedPrompt) => void;
  setSelectedTags: (tags: string[]) => void;
  toggleTag: (tagId: string) => void;       // Add/remove single tag
  addAttachments: (attachments: Attachment[]) => void;
  removeAttachment: (attachmentId: string) => void;
  clearAttachments: () => void;
  setFinalResult: (result: string) => void;
  clearFinalResult: () => void;
  resetWorkflow: () => void;
}
```

### Persistence Strategy

**localStorage Key:** `'coderef-workflow-state'`

**Hydration Flow:**
1. Component renders with default state (SSR-safe)
2. `useEffect` runs on mount → loads from localStorage
3. Dates converted from ISO strings → Date objects
4. State updated → triggers re-render

**Saving:**
- Every state change triggers `useEffect` → saves to localStorage
- Workflow persists across page navigation
- Survives browser refresh

**Auto-Clear Behavior:**
- When switching prompts: If new prompt is NOT CODE_REVIEW, clear `selectedTags`
- Prevents tag state leaking to non-tag-supporting prompts

---

## Attachment Management

**Component:** `AttachmentManager.tsx`

### Attachment Types

```typescript
type AttachmentType = 'FILE' | 'PASTED_TEXT' | 'IMAGE';

interface Attachment {
  id: string;
  filename: string;
  type: AttachmentType;
  extension: string;      // .tsx, .txt, .md
  mimeType: string;       // text/typescript, text/plain
  size: number;           // bytes
  content?: string;       // Full file content
  preview?: string;       // First 200 chars
  language?: string;      // For syntax highlighting
  isText: boolean;
  isBinary: boolean;
  createdAt: Date;
}
```

### Adding Attachments

**Sources:**
1. **CodeRef Explorer** → Right-click file → "Add to Prompt"
2. **File Upload** → Click "Attach File" button
3. **Paste Text** → Click "Paste Text" modal

**File Processing Flow:**

```typescript
// From CodeRef Explorer (FileTreeNode.tsx)
const handleAddToPrompt = async () => {
  const result = await loadFileContent(project, node.path);
  const fileData = result.data;

  const attachment: Attachment = {
    id: Math.random().toString(36).substring(2, 11),
    filename: fileData.name,
    type: 'FILE',
    extension: fileData.extension,
    mimeType: fileData.mimeType,
    size: fileData.size,
    content: fileData.content,              // CRITICAL for export
    preview: fileData.content.substring(0, 200),
    language: getLanguageFromExtension(fileData.extension),
    isText: fileData.encoding === 'utf-8',
    isBinary: fileData.encoding === 'base64',
    createdAt: new Date(),
  };

  addAttachments([attachment]);
};
```

---

## Review Title Workflow (CODEREF_ECOSYSTEM_REVIEW)

**Component:** `ReviewTitleModal.tsx`

### Modal Trigger

When user exports **CODEREF_ECOSYSTEM_REVIEW** prompt (key '0004'), a modal appears before export to collect review title:

**Triggered by:**
- Copy JSON to Clipboard
- Export JSON File
- Export Markdown File

**Modal Fields:**
- **Review Title** (required) - Alphanumeric, hyphens, underscores only
- **Validation:** `/^[a-zA-Z0-9_-]+$/`
- **Examples:** Q1-2026-Documentation-Review, Workflow-Audit-January-2026

**Modal Display:**
```
┌─────────────────────────────────────────────────────────┐
│ Enter Review Title                                      │
│ This title organizes multi-agent reviews in:            │
│ coderef/reviews/[title]/                                │
├─────────────────────────────────────────────────────────┤
│ Review Title *                                          │
│ [Q1-2026-Documentation-Review                    ]      │
├─────────────────────────────────────────────────────────┤
│ 📁 Folder Structure                                     │
│ coderef/reviews/[your-title]/                           │
│   ├── prompt.json           (Original prompt + meta)    │
│   └── responses/                                        │
│       ├── agent-1.json      (Agent 1's analysis)        │
│       ├── agent-2.json      (Agent 2's analysis)        │
│       └── agent-3.json      (Agent 3's analysis)        │
├─────────────────────────────────────────────────────────┤
│ [Continue with Export]  [Cancel]                        │
└─────────────────────────────────────────────────────────┘
```

### JSON Output Structure

```json
{
  "agent_metadata": {
    "agent_id": "coderef-context",
    "model": "Claude Sonnet 4.5",
    "date": "2026-01-02T00:00:00Z",
    "review_title": "Q1-2026-Documentation-Review"
  },
  "component_overview": {
    "component_name": "CodeRef Context System",
    "purpose": "Manages project context and metadata",
    "key_features": [
      "Project analysis",
      "Dependency tracking",
      "Code relationship mapping"
    ]
  },
  "ecosystem_analysis": {
    "documentation": {
      "how_used": "Foundation docs provide project context for agents during planning",
      "strengths": [
        "Clear structure",
        "Comprehensive coverage",
        "Version tracking"
      ],
      "weaknesses": [
        "No automated staleness detection",
        "Manual updates required"
      ],
      "add_remove": [
        "ADD: Timestamp metadata for freshness tracking",
        "REFACTOR: Split large CLAUDE.md into focused modules",
        "REMOVE: Redundant quick-start sections"
      ]
    },
    "workflows": {
      "how_used": "Standardizes implementation planning across agents",
      "strengths": ["Consistent structure", "Clear task breakdown"],
      "weaknesses": ["Complex for small features"],
      "add_remove": [
        "ADD: Lightweight workflow option for bug fixes",
        "REFACTOR: Simplify task ID naming scheme"
      ]
    }
  }
}
```

### Agent Coordination

**Save Location:** `coderef/reviews/{review-title}/responses/{agent-id}.json`

**Agent ID:** Derived from working directory name
- Examples: `coderef-context`, `coderef-docs`, `coderef-workflow`

**Workflow:**
1. User creates review with title: `Q1-2026-Documentation-Review`
2. User exports prompt (includes review title in metadata)
3. Agent receives prompt with `{{REVIEW_TITLE}}` interpolated
4. Agent analyzes components
5. Agent outputs JSON with structured analysis
6. Agent saves to: `coderef/reviews/Q1-2026-Documentation-Review/responses/coderef-context.json`
7. Other agents save their analyses to same folder
8. Coordinator aggregates all JSON files for synthesis

---

## Export Functionality

**Component:** `ExportMenu.tsx`

### Export Formats

**1. Copy JSON to Clipboard**
- **Action:** `handleCopyJSON()`
- **Output:** Structured JSON with prompt, attachments, metadata
- **Use Case:** Paste into AI chat interface (Claude, GPT)

**2. Download JSON File**
- **Action:** `handleExportJSON()`
- **Filename:** `workflow_{promptName}_{timestamp}.json`
- **Use Case:** Save workflow for later reuse

**3. Download Markdown File**
- **Action:** `handleExportMarkdown()`
- **Filename:** `workflow_{promptName}_{timestamp}.md`
- **Use Case:** Human-readable documentation

### JSON Export Structure

```typescript
interface WorkflowExport {
  session_id: string;                          // 'abc123'
  generated_at: string;                        // ISO timestamp
  prompt: PreloadedPrompt;                     // Full prompt object
  attachments: Array<{
    id: string;
    filename: string;
    type: string;
    extension: string;
    language?: string;
    size: number;
    content: string;                           // FULL file content
  }>;
  metadata: {
    total_tokens: number;                      // Estimated
    file_count: number;
    attachment_types: string[];                // ['FILE', 'PASTED_TEXT']
    selected_tags?: string[];                  // For CODE_REVIEW
    created_at: string;
    user_instructions: string;                 // How to use this export
  }
}
```

### Markdown Export Format

```markdown
# Workflow Export: Code Review
**Generated:** 2026-01-01 23:45:00
**Session ID:** abc123

---

## Prompt

[Full prompt text here]

---

## Selected Tags

- Performance (Speed, efficiency, optimization)
- Security (Vulnerabilities, auth, data protection)

---

## Attachments (2 files)

### 1. FileTreeNode.tsx (text/typescript, 12.5 KB)

```typescript
[Full file content]
```

### 2. ContextMenu.tsx (text/typescript, 8.3 KB)

```typescript
[Full file content]
```

---

## Metadata

- Total Tokens: ~2,450
- File Count: 2
- Attachment Types: FILE
```

---

## Data Flow Diagram

```
User Action → WorkflowContext State Update → localStorage Persist → UI Re-render

Example: Click Tag Chip
  User clicks "Performance" chip
      ↓
  onClick={(e) => { e.stopPropagation(); onToggleTag('performance'); }}
      ↓
  toggleTag('performance') in WorkflowContext
      ↓
  setWorkflow({ ...prev, selectedTags: [...currentTags, 'performance'] })
      ↓
  useEffect saves to localStorage: 'coderef-workflow-state'
      ↓
  PromptSelector re-renders with updated selectedTags
      ↓
  Chip visual state changes: border-ind-border → border-ind-accent
```

---

## Integration Points

### CodeRef Explorer → Prompts Page

**Right-Click Context Menu** (`FileTreeNode.tsx` lines 163-196)

```typescript
// User right-clicks file in Explorer → clicks "Add to Prompt"
const handleAddToPrompt = async () => {
  const result = await loadFileContent(project, node.path);
  const attachment: Attachment = { /* ... */ };
  addAttachments([attachment]);  // WorkflowContext
  console.log(`Added ${fileData.name} to prompt`);
};
```

**Flow:**
1. User navigates to CodeRef Explorer
2. Right-clicks file → Context menu appears
3. Clicks "Add to Prompt"
4. File content loaded via hybrid router
5. Attachment created and added to WorkflowContext
6. User navigates to Prompts page
7. File appears in attachments list (persisted via localStorage)

### WorkflowContext → Export

**Export Validation:**
- `isReadyForExport = workflow.selectedPrompt && workflow.attachments.length > 0`
- Export buttons disabled until condition met
- Warning message displayed: "⚠️ Select a prompt and add at least one attachment to enable export"

---

## Use Cases

### UC-1: Code Review with Performance Focus

1. User navigates to `/prompts`
2. Clicks **CODE_REVIEW** prompt card
3. Tag chips appear below prompt
4. User clicks **Performance** and **Security** tags
5. Tags turn yellow with accent border
6. User navigates to CodeRef Explorer
7. Right-clicks `FileTreeNode.tsx` → "Add to Prompt"
8. Right-clicks `ContextMenu.tsx` → "Add to Prompt"
9. Returns to Prompts page
10. Both files listed in Attachments section
11. Clicks **"Copy JSON to Clipboard"**
12. Pastes JSON into Claude chat
13. Claude analyzes files with ONLY Performance and Security feedback (other categories ignored)

### UC-2: Synthesize Multiple Files

1. User selects **SYNTHESIZE** prompt (no tags)
2. Adds 5 files from different directories
3. Clicks **"Download Markdown"**
4. Receives `workflow_SYNTHESIZE_1735776300000.md`
5. Opens in Obsidian for documentation

### UC-3: Save Workflow for Later

1. User builds complex workflow (10 files, CODE_REVIEW, 4 tags selected)
2. Closes browser
3. Reopens dashboard next day
4. Navigates to `/prompts`
5. Workflow fully restored from localStorage (prompt, tags, attachments)
6. Continues where they left off

---

## Technical Notes

### Performance Optimizations

- **Tag chips render conditionally:** Only show for CODE_REVIEW prompt
- **Event propagation stopped:** `e.stopPropagation()` prevents prompt card click when clicking tags
- **Lazy loading:** Icon components imported via dynamic map
- **localStorage caching:** Reduces API calls across page navigation

### Accessibility

- **Keyboard navigation:** Prompt cards support Enter/Space key selection
- **Tooltips:** All tag chips have `title` attribute with full description
- **Screen reader text:** Uppercase labels with tracking (`text-sm uppercase tracking-widest`)
- **ARIA roles:** Cards use `role="button"` and `tabIndex={0}`

### Browser Compatibility

- **localStorage:** Supported in all modern browsers
- **Clipboard API:** `navigator.clipboard.writeText()` requires HTTPS or localhost
- **File System Access API:** Optional (falls back to `<input type="file">`)
- **Blob URLs:** Used for download fallback (`URL.createObjectURL`)

---

## File References

### Core Implementation

- **`packages/dashboard/src/app/prompts/page.tsx`** - Prompts page route
- **`packages/dashboard/src/components/PromptingWorkflow/components/PromptingWorkflow.tsx`** - Main workflow orchestrator with export handlers
- **`packages/dashboard/src/components/PromptingWorkflow/components/PromptSelector.tsx`** - Prompt cards with tag chips (CODE_REVIEW: lines 85-118, CODEREF_ECOSYSTEM_REVIEW: lines 120-154)
- **`packages/dashboard/src/components/PromptingWorkflow/components/ReviewTitleModal.tsx`** - Review title input modal for CODEREF_ECOSYSTEM_REVIEW
- **`packages/dashboard/src/components/PromptingWorkflow/constants/tags.ts`** - CODE_REVIEW tag definitions (8 tags)
- **`packages/dashboard/src/components/PromptingWorkflow/constants/ecosystem-tags.ts`** - CODEREF_ECOSYSTEM_REVIEW tag definitions (10 tags)
- **`packages/dashboard/src/components/PromptingWorkflow/utils/prompts.ts`** - Prompt templates (CODE_REVIEW, SYNTHESIZE, CONSOLIDATE, CODEREF_ECOSYSTEM_REVIEW) + getEcosystemPromptWithTags()
- **`packages/dashboard/src/components/PromptingWorkflow/types.ts`** - Workflow interface with reviewTitle field
- **`packages/dashboard/src/contexts/WorkflowContext.tsx`** - State management with localStorage

### Integration Files

- **`packages/dashboard/src/components/coderef/FileTreeNode.tsx`** - Right-click "Add to Prompt" (lines 163-196)
- **`packages/dashboard/src/components/coderef/FavoritesList.tsx`** - Right-click "Add to Prompt" from favorites

### Export Utilities

- **`packages/dashboard/src/components/PromptingWorkflow/utils/exportFormatter.ts`** - JSON and Markdown generation
- **`packages/dashboard/src/components/PromptingWorkflow/components/ExportMenu.tsx`** - Export buttons and handlers

---

## Recent Updates

**2026-01-02 (Commit 702e78d)** - BREAKING: CODEREF_ECOSYSTEM_REVIEW JSON output + review title workflow
- ✅ Changed output format from Markdown to JSON
- ✅ Created ReviewTitleModal component for user input before export
- ✅ Updated getEcosystemPromptWithTags() to accept reviewTitle parameter
- ✅ Added reviewTitle field to Workflow interface
- ✅ All export handlers show modal for key '0004' prompt
- ✅ Added agent coordination instructions (save to coderef/reviews/{title}/responses/)
- ✅ JSON structure: agent_metadata, component_overview, ecosystem_analysis
- ✅ Increased estimated tokens: 1100 → 1200

**2026-01-02 (Commit e2e376e)** - CODEREF_ECOSYSTEM_REVIEW prompt added
- ✅ Created `constants/ecosystem-tags.ts` with 10 ecosystem categories
- ✅ Added CODEREF_ECOSYSTEM_REVIEW prompt (key: '0004') with ~1100 tokens
- ✅ Implemented getEcosystemPromptWithTags() function for tag interpolation
- ✅ Updated `PromptSelector.tsx` with ecosystem tag chip rendering (lines 120-154)
- ✅ Added 8 new Lucide icons (FileText, Code2, GitBranch, Plug, Ruler, Users, Database, FileOutput)
- ✅ Ecosystem tags use same visual styling as CODE_REVIEW tags

**2026-01-01 (Merge c4cb099)** - Tags implementation merged to main
- ✅ Created `constants/tags.ts` with 8 improvement categories
- ✅ Updated `PromptSelector.tsx` with tag chip rendering (lines 85-118)
- ✅ Updated `WorkflowContext.tsx` with tag state management (toggleTag, setSelectedTags)
- ✅ Added icon mapping for 8 Lucide icons
- ✅ Tag chips only show for CODE_REVIEW prompt (key: '0001')
- ✅ Active tags use `border-2 border-ind-accent` for visual distinction

**Known Issues:**
- Tags not displaying on web/electron (user testing in progress)
- Dev server may show stale cache (clear .next/ directory)

---

**Last Updated:** 2026-01-02
**Workorders:** WO-PROMPTING-WORKFLOW-TAGS-001, WO-DASHBOARD-ECOSYSTEM-REVIEW-001
**Features:** Tag-based code review filtering + CodeRef ecosystem component review

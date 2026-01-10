# Phase 7: Syntax Highlighting Integration

**Workorder:** WO-NOTEPAD-CLONE-001
**Phase:** 7 of 8
**Status:** Pending
**Dependencies:** Phase 3 (State Management), Phase 4 (File Operations)

---

## Overview

Integrate syntax highlighting into the Notepad editor using the existing `react-syntax-highlighter` library already installed in the coderef-dashboard. This will provide color-coded syntax for 30+ file types.

---

## Existing Infrastructure

### Library Already Installed

**Package:** `react-syntax-highlighter` v16.1.0
**Type Definitions:** `@types/react-syntax-highlighter` v15.5.13
**Location:** `packages/dashboard/package.json`

**No additional installation required** - the library is already available and in use.

---

## Reference Implementation

### FileViewer Component

**File:** `packages/dashboard/src/components/coderef/FileViewer.tsx`

**Import Pattern (lines 5-6):**
```typescript
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
```

**Usage for Source Code Files (lines 454-467):**
```typescript
<SyntaxHighlighter
  language={getLanguage(fileData.extension)}
  style={vscDarkPlus}
  customStyle={{
    margin: 0,
    padding: '1rem',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    lineHeight: '1.5',
  }}
  showLineNumbers
>
  {displayContent}
</SyntaxHighlighter>
```

**Usage for Markdown Code Blocks (lines 415-426):**
```typescript
<ReactMarkdown
  components={{
    code(props) {
      const { children, className, ...rest } = props;
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : 'text';
      const isInline = !match;

      return !isInline ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={language}
          PreTag="div"
          customStyle={{
            margin: 0,
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
          }}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...rest}>
          {children}
        </code>
      );
    },
  }}
>
  {displayContent}
</ReactMarkdown>
```

---

## Language Mapping

### Use Existing Language Map

**File:** `packages/dashboard/src/components/PromptingWorkflow/utils/languageMap.ts`

**Exports:**
- `languageMap` - Object mapping file extensions to Prism language identifiers
- `getLanguage(extension: string): string` - Helper function

**Supported Extensions (30+):**

```typescript
const languageMap: Record<string, string> = {
  // Web/TypeScript
  ts: 'typescript',
  tsx: 'tsx',
  js: 'javascript',
  jsx: 'jsx',
  html: 'markup',
  css: 'css',
  scss: 'scss',
  less: 'less',

  // Languages
  py: 'python',
  go: 'go',
  java: 'java',
  kotlin: 'kotlin',
  scala: 'scala',
  rb: 'ruby',
  php: 'php',
  cpp: 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  c: 'c',
  h: 'c',
  hpp: 'cpp',
  rs: 'rust',

  // Data/Config
  json: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  xml: 'markup',
  csv: 'csv',
  toml: 'toml',
  sql: 'sql',

  // Markdown/Text
  md: 'markdown',
  txt: 'text',

  // Shell/Build
  sh: 'bash',
  bash: 'bash',
  zsh: 'bash',
  gradle: 'groovy',
  maven: 'markup',
  docker: 'docker',
};

export function getLanguage(extension: string): string {
  const ext = extension.toLowerCase().replace(/^\./, '');
  return languageMap[ext] || 'text';
}
```

---

## Implementation Tasks

### 1. Import Dependencies

Add to `NotesWidget.tsx` or dedicated editor component:

```typescript
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getLanguage } from '@/components/PromptingWorkflow/utils/languageMap';
```

### 2. Detect File Extension

In the `useNotepadTabs` hook or tab state:

```typescript
interface OpenTab {
  id: string;
  filePath: string | null;
  content: string;
  isDirty: boolean;
  lastSaved?: Date;
  fileExtension?: string; // NEW: Track extension for syntax highlighting
}

// When opening a file:
const extension = filePath ? path.extname(filePath).slice(1) : 'md'; // Default to 'md'
```

### 3. Apply Syntax Highlighting to Editor

**Option A: Read-Only Display Mode**
Replace plain textarea with SyntaxHighlighter for read-only viewing:

```typescript
{isEditMode ? (
  <textarea
    value={activeTab.content}
    onChange={handleContentChange}
    className="..."
  />
) : (
  <SyntaxHighlighter
    language={getLanguage(activeTab.fileExtension || 'md')}
    style={vscDarkPlus}
    customStyle={{
      margin: 0,
      padding: '1rem',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      lineHeight: '1.5',
      height: '100%',
      overflow: 'auto',
    }}
    showLineNumbers
  >
    {activeTab.content}
  </SyntaxHighlighter>
)}
```

**Option B: Edit Mode with Syntax Highlighting**
For editable syntax highlighting, consider integrating a code editor library:
- **CodeMirror 6** (recommended for editing)
- **Monaco Editor** (VS Code's editor)
- **Ace Editor**

For MVP, use Option A (read-only syntax highlighting, plain textarea for editing).

### 4. Add Toggle for Edit/View Mode

Add a button in MenuBar or toolbar:

```typescript
const [isEditMode, setIsEditMode] = useState(true);

// In MenuBar:
<button
  onClick={() => setIsEditMode(!isEditMode)}
  className="..."
>
  {isEditMode ? 'Preview' : 'Edit'}
</button>
```

### 5. File Size Warning Dialog

Before loading a file, check size and show warning:

```typescript
async function handleOpenFile(filePath: string) {
  try {
    // Fetch file metadata first
    const metadata = await FileApi.getMetadata(filePath);

    // Check file size (1MB = 1,048,576 bytes)
    if (metadata.size > 1048576) {
      const confirmed = window.confirm(
        `This file is ${(metadata.size / 1048576).toFixed(2)}MB. ` +
        `Loading large files may impact performance. Continue?`
      );

      if (!confirmed) return;
    }

    // Proceed with loading
    const fileData = await FileApi.load(filePath);
    addTab({
      filePath,
      content: fileData.content,
      fileExtension: fileData.extension,
    });
  } catch (error) {
    console.error('Failed to open file:', error);
  }
}
```

### 6. Default New Files to .md

When creating a new file:

```typescript
function handleNewFile() {
  addTab({
    filePath: null, // Unsaved
    content: '',
    fileExtension: 'md', // Default to markdown
    isDirty: false,
  });
}
```

When saving an unsaved file, suggest `.md` extension in file picker.

---

## Styling Guidelines

### Theme

Use `vscDarkPlus` to match the industrial theme and existing FileViewer.

### Custom Styles

```typescript
const syntaxHighlighterStyle = {
  margin: 0,
  padding: '1rem',
  borderRadius: '0.5rem',
  fontSize: '0.875rem', // 14px
  lineHeight: '1.5',
  height: '100%',
  overflow: 'auto',
  backgroundColor: 'var(--ind-panel)', // Match industrial theme
};
```

### Line Numbers

Enable for better code navigation:

```typescript
<SyntaxHighlighter showLineNumbers>
  {content}
</SyntaxHighlighter>
```

---

## Pre-Phase 7 Requirements

**CRITICAL: Must complete before starting Phase 7:**

- [ ] Phase 1 complete: FileApi.save() and FileApi.open() methods exist
- [ ] Phase 3 complete: useNotepadTabs hook tracks fileExtension per tab
- [ ] Phase 4 complete: File operations working (Open/Save)
- [ ] Extension allowlist expanded in route.ts to support 30+ types

## Testing Checklist

- [ ] Syntax highlighting displays correctly for `.ts` files
- [ ] Syntax highlighting displays correctly for `.js` files
- [ ] Syntax highlighting displays correctly for `.py` files
- [ ] Syntax highlighting displays correctly for `.html` files
- [ ] Syntax highlighting displays correctly for `.css` files
- [ ] Syntax highlighting displays correctly for `.json` files
- [ ] Syntax highlighting displays correctly for `.md` files
- [ ] Plain text files (`.txt`) display without highlighting
- [ ] Unknown extensions default to plain text
- [ ] File size warning appears for files > 1MB
- [ ] User can cancel opening large files
- [ ] New files default to `.md` extension
- [ ] Edit/Preview toggle works correctly (if implemented)
- [ ] Line numbers display correctly
- [ ] Scrolling works for large files
- [ ] Theme matches industrial dashboard theme

---

## Performance Considerations

### Large Files

For files > 1MB:
- Show warning dialog before loading
- Consider limiting line count for syntax highlighting (e.g., first 10,000 lines)
- Fall back to plain textarea for extremely large files

### Virtualization

For future optimization, consider:
- **react-window** or **react-virtualized** for rendering only visible lines
- CodeMirror 6 has built-in virtualization for large documents

---

## Alternative: Full Code Editor Integration

For a richer editing experience with syntax highlighting while editing, consider:

**CodeMirror 6:**
```bash
npm install @codemirror/state @codemirror/view @codemirror/lang-javascript @codemirror/lang-python
```

**Monaco Editor:**
```bash
npm install @monaco-editor/react
```

**Decision:** Use read-only syntax highlighting for MVP (Phase 7), defer full code editor to future enhancement.

---

## References

- **FileViewer Implementation:** `packages/dashboard/src/components/coderef/FileViewer.tsx`
- **Language Map:** `packages/dashboard/src/components/PromptingWorkflow/utils/languageMap.ts`
- **react-syntax-highlighter Docs:** https://github.com/react-syntax-highlighter/react-syntax-highlighter
- **Prism Languages:** https://prismjs.com/#supported-languages

---

**Created:** 2026-01-10
**Status:** Ready for Implementation
**Next Phase:** Phase 8 - Electron Window Pop-out

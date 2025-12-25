# Schema & Data Model

## Core Types (from packages/core)

### CodeRefCore Global Interface
```typescript
Window.CodeRefCore?: {
  api?: {
    openFile(options?: FileOptions): Promise<FileHandle | null>,
    selectDirectory(): Promise<string | null>,
    isElectron(): boolean
  },
  hooks?: Record<string, any>,
  utils?: {
    clipboard?: {
      writeText(text: string): Promise<void>,
      readText(): Promise<string>
    },
    fileHandlers?: Record<string, any>
  },
  version?: string
}
```

## PromptingWorkflow Component Data Model

### Workflow Session
```typescript
interface WorkflowSession {
  id: string;
  prompt: PreloadedPrompt;
  attachments: Attachment[];
  finalResult: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### Preloaded Prompts
```typescript
interface PreloadedPrompt {
  id: 'code-review' | 'synthesize' | 'consolidate';
  name: string;
  content: string;
  description: string;
}
```

### Attachments
```typescript
interface Attachment {
  id: string;
  filename: string;
  content: string;
  language: string;
  size: number;
  addedAt: Date;
}
```

### Workflow Export
```typescript
interface WorkflowExport {
  format: 'json' | 'markdown' | 'clipboard';
  content: string;
  timestamp: Date;
}
```

## Database/Storage
- No persistent database; all data is in-memory React state
- Clipboard operations for export/import
- File system access via CodeRefCore.api (Electron) or browser File API

## Package Dependencies

### Root Workspaces
- `packages/core` - No external dependencies, only TS/build tools
- `packages/dashboard` - Next.js 16.1.1, React 19, esbuild
- `packages/electron-app` - Electron, electron-builder
- `packages/widgets/@coderef-dashboard/widget-prompting-workflow` - (to be removed)

### Key Versions
- Node.js: >=18.0.0
- npm: >=9.0.0
- TypeScript: 5.3.3
- Next.js: 16.1.1
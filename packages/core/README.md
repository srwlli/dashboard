# CodeRef Dashboard Core

Shared core library providing common functionality to all CodeRef Dashboard widgets.

## What's Included

### API Client
- Session management
- Attachment operations
- Response collection
- Preloaded prompts
- Export utilities
- Configuration

### Hooks
- `useSession` - React hook for session state
- `useSessionRefresh` - Listen to session refresh events

### Utilities
- `clipboard` - Read/write clipboard
- `fileHandlers` - Open files (Electron + Web)

## Usage in Widgets

```typescript
// Widgets access core via global namespace
const { api, hooks, utils } = window.CodeRefCore;

// Use API
const session = await api.getSession();

// Use hooks
const { useSession } = hooks;

// Use utilities
await utils.clipboard.write('text');
```

## Building

Core is built as an IIFE bundle and loaded globally in the dashboard layout:

```bash
npm run build:widgets  # Builds core.js first, then all widgets
```

Output: `packages/dashboard/public/widgets/core.js`

## Version

1.0.0

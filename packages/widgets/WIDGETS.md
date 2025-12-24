# CodeRef Dashboard Widget System

Complete guide for creating, developing, and integrating widgets into the CodeRef Dashboard.

> **Note:** Dashboard settings (theme toggle, preferences) are implemented as a dedicated `/settings` page route, not as a widget. This allows settings to use React Context and integrate seamlessly with the Next.js app architecture. Widgets are best suited for dashboard content that displays dynamically loaded information.

### Understanding the Dual Core Architecture

CodeRef Dashboard uses **two separate "cores"** for different purposes:

**1. @coderef-dashboard/core (NPM Package)**
- **Location:** `packages/core/dist/` (pre-compiled TypeScript)
- **Purpose:** Framework types and components for the dashboard app
- **Exports:** `ErrorBoundary`, `WidgetConfig`, `IScriptboardWidget` interfaces
- **Used by:** Dashboard app (WidgetLoader, layout, page components)
- **Role:** Defines the contract and structure for widgets at build time

**2. packages/core/src → core.js (Widget Runtime)**
- **Location:** `packages/core/src/` (TypeScript source)
- **Purpose:** Shared runtime library bundled as `core.js` for widgets to use
- **Exports:** `api` (17 methods), `hooks` (useSession, useSessionRefresh), `utils` (clipboard, fileHandlers)
- **Used by:** All widgets via `window.CodeRefCore` global
- **Role:** Provides common functionality to reduce code duplication in widgets

**Why Two Cores?**
- The NPM package provides TypeScript types and framework components (for development)
- The runtime core provides shared functionality (for production widget execution)
- Widgets don't use the NPM package directly; they use the bundled `core.js` at runtime
- This separation allows widgets to be lightweight bundles while the framework remains feature-rich

**For Widget Developers:**
- Don't import from `@coderef-dashboard/core` in widgets
- Use `window.CodeRefCore` in widgets to access the shared runtime
- The build system automatically bundles core.js before widgets

## Table of Contents

1. [Widget Architecture](#widget-architecture)
2. [Creating a New Widget](#creating-a-new-widget)
3. [Widget Interface (IScriptboardWidget)](#widget-interface-iscriptboardwidget)
4. [Lifecycle Hooks](#lifecycle-hooks)
5. [Build & Bundling](#build--bundling)
6. [Configuration](#configuration)
7. [Testing](#testing)
8. [Examples](#examples)

---

## Widget Architecture

The CodeRef Dashboard uses a modular widget system that allows you to build independent, reusable UI components that can be:

- **Enabled/Disabled** via configuration file
- **Dynamically Loaded** at runtime (no rebuild required)
- **Lifecycle Managed** with hooks for initialization and cleanup
- **Error Isolated** with automatic error boundaries
- **Settings Aware** with ability to respond to configuration changes

### How It Works

```
┌─────────────────────────────────────────────────────────┐
│         CodeRef Dashboard (Next.js PWA)                 │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  page.tsx                                         │ │
│  │  - Loads coderef-dashboard.config.json            │ │
│  │  - Filters enabled widgets                        │ │
│  │  - Renders WidgetLoader for each                  │ │
│  └─────────────────────────────┬─────────────────────┘ │
│                                │                        │
│  ┌─────────────────────────────▼─────────────────────┐ │
│  │  WidgetLoader (components/WidgetLoader.tsx)      │ │
│  │  - Injects script dynamically                     │ │
│  │  - Retrieves widget from global namespace        │ │
│  │  - Calls lifecycle hooks (onEnable/onDisable)    │ │
│  │  - Wraps in ErrorBoundary for isolation          │ │
│  └─────────────────────────────┬─────────────────────┘ │
│                                │                        │
│  ┌─────────────────────────────▼─────────────────────┐ │
│  │  /public/widgets/coming-soon.js (IIFE Bundle)    │ │
│  │  - Standalone JavaScript bundle                  │ │
│  │  - Exports via global: CodeRefWidget_coming_soon │ │
│  └─────────────────────────────────────────────────┘ │
│                                                         │
│  ┌─────────────────────────────────────────────────┐ │
│  │  /public/widgets/terminal-manager.js (Future)   │ │
│  │  /public/widgets/file-manager.js (Future)       │ │
│  │  /public/widgets/system-monitor.js (Future)     │ │
│  └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Widget Bundle Output

Each widget compiles to a single JavaScript file using esbuild:

- **Location**: `packages/dashboard/public/widgets/{widget-id}.js`
- **Format**: IIFE (Immediately Invoked Function Expression)
- **Global Pattern**: `CodeRefWidget_{widget-id-with-underscores}`
- **Size**: ~7kb (coming-soon example, with sourcemap)
- **Dependencies**: React/React-DOM marked as external (not bundled)

---

## Creating a New Widget

### Step 1: Create Widget Package

Create a new directory in `packages/widgets/@coderef-dashboard/`:

```bash
mkdir -p packages/widgets/@coderef-dashboard/widget-my-feature
cd packages/widgets/@coderef-dashboard/widget-my-feature
```

### Step 2: Initialize Package

Create `package.json`:

```json
{
  "name": "@coderef-dashboard/widget-my-feature",
  "version": "0.1.0",
  "description": "My Feature Widget for CodeRef Dashboard",
  "type": "module",
  "main": "src/index.ts",
  "files": ["src"],
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@coderef-dashboard/core": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
```

### Step 3: Create Source Files

Create directory structure:

```
widget-my-feature/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts           # Widget export
    ├── MyFeature.tsx      # Main component
    └── types.ts           # TypeScript interfaces (optional)
```

**tsconfig.json:**

```json
{
  "extends": "../../../dashboard/tsconfig.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 4: Implement Widget

Create `src/index.ts` - This is the widget entry point:

```typescript
import React from 'react';
import { IScriptboardWidget, WidgetSettingsChangePayload } from '@coderef-dashboard/core';
import { MyFeatureComponent } from './MyFeature';

export const MyFeatureWidget: IScriptboardWidget = {
  // Required fields
  id: 'my-feature',
  name: 'My Feature',
  version: '0.1.0',

  // Optional fields
  description: 'Description of what this widget does',
  settings: {
    // Default settings - customize as needed
    theme: 'dark',
    autoRefresh: true,
    refreshInterval: 5000,
  },

  // Render method - returns React component
  render(): React.ReactNode {
    return React.createElement(MyFeatureComponent, {
      settings: this.settings,
    });
  },

  // Lifecycle: Called when widget loads
  async onEnable(): Promise<void> {
    console.log(`[${this.name}] Widget enabled - initializing...`);
    // Initialize resources:
    // - Connect to APIs
    // - Start polling timers
    // - Register event listeners
    // - Load data
  },

  // Lifecycle: Called when widget unmounts
  async onDisable(): Promise<void> {
    console.log(`[${this.name}] Widget disabled - cleaning up...`);
    // Clean up resources:
    // - Stop polling timers
    // - Close connections
    // - Remove event listeners
    // - Abort pending requests
  },

  // Lifecycle: Called when settings change
  async onSettingsChange(payload: WidgetSettingsChangePayload): Promise<void> {
    console.log(`[${this.name}] Settings changed:`, payload);
    // Respond to configuration changes:
    if ('theme' in payload && this.settings) {
      this.settings.theme = payload.theme;
      // Re-render or update theme
    }
    if ('autoRefresh' in payload && this.settings) {
      this.settings.autoRefresh = payload.autoRefresh;
      // Update polling behavior
    }
  },

  // Error handler
  onError(error: Error): boolean {
    console.error(`[${this.name}] Error occurred:`, error.message);
    // Return true to handle error (prevent error boundary)
    // Return false to show error UI
    return false;
  },
};

// Export as default for bundling
export default MyFeatureWidget;
```

Create `src/MyFeature.tsx` - Your actual UI component:

```typescript
import React from 'react';

interface MyFeatureComponentProps {
  settings?: Record<string, any>;
}

export function MyFeatureComponent({ settings }: MyFeatureComponentProps) {
  return (
    <div className="bg-ind-panel border-2 border-ind-border p-6 rounded">
      <h2 className="text-xl font-bold text-ind-text mb-4 uppercase tracking-wider">
        My Feature Widget
      </h2>
      <p className="text-ind-text-muted">
        Theme: {settings?.theme || 'not set'}
      </p>
      {/* Your widget UI here */}
    </div>
  );
}
```

### Step 5: Add to Configuration

Update `coderef-dashboard.config.json` in the root:

```json
{
  "widgets": [
    {
      "id": "coming-soon",
      "package": "@coderef-dashboard/widget-coming-soon",
      "enabled": true,
      "settings": { "showDetails": true }
    },
    {
      "id": "my-feature",
      "package": "@coderef-dashboard/widget-my-feature",
      "enabled": true,
      "settings": {
        "theme": "dark",
        "autoRefresh": true,
        "refreshInterval": 5000
      }
    }
  ]
}
```

### Step 6: Install Dependencies

```bash
npm install
```

### Step 7: Build & Test

```bash
# Build all widgets
npm run build:widgets

# Or build dashboard specifically
npm run build:dashboard

# Test in development
npm run dev

# Test in Electron
npm run dev:electron
```

---

## Widget Interface (IScriptboardWidget)

The complete TypeScript interface your widget must implement:

```typescript
interface IScriptboardWidget {
  // Required: Unique identifier (kebab-case, no spaces)
  id: string;

  // Required: Display name
  name: string;

  // Required: Semantic version (e.g., "0.1.0")
  version: string;

  // Optional: One-line description
  description?: string;

  // Optional: Configuration object
  settings?: Record<string, any>;

  // Required: Render method - must return React element or null
  render(): React.ReactNode;

  // Optional: Called when widget loads
  onEnable?(): Promise<void>;

  // Optional: Called when widget unmounts
  onDisable?(): Promise<void>;

  // Optional: Called when settings change
  onSettingsChange?(payload: WidgetSettingsChangePayload): Promise<void>;

  // Optional: Error handler
  onError?(error: Error): boolean;
}

interface WidgetSettingsChangePayload {
  [key: string]: any;
}

type WidgetConfig = {
  id: string;
  package: string;
  enabled: boolean;
  settings?: Record<string, any>;
};
```

---

## Lifecycle Hooks

### onEnable()

Called once when the widget first loads. Use this to:

```typescript
async onEnable(): Promise<void> {
  // Initialize state
  this.state = { loaded: false };

  // Connect to backend
  const response = await fetch('/api/my-feature/init');
  const data = await response.json();

  // Start polling timers
  this.pollInterval = setInterval(async () => {
    const updates = await fetch('/api/my-feature/updates');
    // Handle updates
  }, 5000);

  // Register event listeners
  window.addEventListener('resize', this.handleResize);

  console.log('[MyWidget] Initialization complete');
}
```

**Common Tasks:**
- API initialization and first data fetch
- Starting timers/polling
- Registering event listeners
- Opening WebSocket connections
- Loading persisted user preferences

### onDisable()

Called when the widget unmounts. Use this to:

```typescript
async onDisable(): Promise<void> {
  // Stop timers
  if (this.pollInterval) {
    clearInterval(this.pollInterval);
  }

  // Close connections
  if (this.websocket) {
    this.websocket.close();
  }

  // Remove listeners
  window.removeEventListener('resize', this.handleResize);

  // Abort pending requests
  this.abortController?.abort();

  console.log('[MyWidget] Cleanup complete');
}
```

**Common Tasks:**
- Clearing timers/intervals
- Closing connections (WebSocket, etc.)
- Removing event listeners
- Aborting pending requests
- Persisting widget state

### onSettingsChange(payload)

Called when settings are updated via config change:

```typescript
async onSettingsChange(payload: WidgetSettingsChangePayload): Promise<void> {
  // Update settings
  if ('theme' in payload && this.settings) {
    this.settings.theme = payload.theme;
    // Re-render with new theme
  }

  // Update polling
  if ('refreshInterval' in payload) {
    clearInterval(this.pollInterval);
    this.pollInterval = setInterval(() => {
      // Fetch with new interval
    }, payload.refreshInterval);
  }

  console.log('[MyWidget] Settings updated:', payload);
}
```

**When It's Called:**
- Dashboard config file is updated and widget reloads
- User changes widget settings in dashboard UI (future feature)
- Admin updates widget configuration

---

## Build & Bundling

### Automatic Build Process

When you run `npm run build:widgets`:

1. **Scan** `packages/widgets/@coderef-dashboard/` for `widget-*` directories
2. **Build** each widget using esbuild:
   - Entry point: `src/index.ts`
   - Format: IIFE (Immediately Invoked Function Expression)
   - Output: `packages/dashboard/public/widgets/{widget-id}.js`
   - Sourcemap: Included for debugging
3. **Extract** global name: `CodeRefWidget_{widget-id-with-underscores}`
4. **Mark External**: React/React-DOM not bundled (app provides them)

### Esbuild Configuration

From `scripts/build-widgets.js`:

```javascript
await esbuild.build({
  entryPoints: [entryPoint],
  bundle: true,
  outfile: outputFile,
  format: 'iife',  // Global variable export
  globalName: `CodeRefWidget_${widgetId.replace(/-/g, '_')}`,
  platform: 'browser',
  target: 'es2020',
  sourcemap: true,
  external: ['react', 'react-dom'],  // Not bundled
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});
```

### Build Output

Each widget generates two files:

```
packages/dashboard/public/widgets/
├── coming-soon.js         (7.2 KB - minified + compressed)
├── coming-soon.js.map     (7.5 KB - source map)
├── my-feature.js          (Your widget)
├── my-feature.js.map
└── ... (more widgets)
```

### Customizing Build

To add custom esbuild options, edit `scripts/build-widgets.js`:

```javascript
// Add plugins, loaders, or other options:
await esbuild.build({
  entryPoints: [entryPoint],
  bundle: true,
  outfile: outputFile,
  format: 'iife',
  globalName: `CodeRefWidget_${widgetId.replace(/-/g, '_')}`,

  // Custom options:
  minify: process.env.NODE_ENV === 'production',
  plugins: [myCustomPlugin],
  loader: { '.svg': 'dataurl' },

  // ... rest of config
});
```

---

## Configuration

### coderef-dashboard.config.json

Located at: `packages/dashboard/public/coderef-dashboard.config.json`

```json
{
  "widgets": [
    {
      "id": "coming-soon",
      "package": "@coderef-dashboard/widget-coming-soon",
      "enabled": true,
      "settings": {
        "showDetails": true,
        "title": "More Widgets Coming Soon"
      }
    },
    {
      "id": "terminal-manager",
      "package": "@coderef-dashboard/widget-terminal-manager",
      "enabled": true,
      "settings": {
        "theme": "dark",
        "fontSize": 12,
        "fontFamily": "JetBrains Mono"
      }
    },
    {
      "id": "file-manager",
      "package": "@coderef-dashboard/widget-file-manager",
      "enabled": false,  // Disabled - won't load
      "settings": {}
    }
  ]
}
```

### Configuration Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique widget identifier (must match widget's `id` field) |
| `package` | string | Yes | NPM package name (currently informational) |
| `enabled` | boolean | Yes | Whether widget should load (true/false) |
| `settings` | object | No | Initial configuration passed to widget |

### How Config Is Used

1. **Dashboard loads** `coderef-dashboard.config.json` on startup
2. **Filters widgets** where `enabled: true`
3. **Renders WidgetLoader** for each enabled widget
4. **WidgetLoader injects script** for widget bundle
5. **Widget receives settings** in its `settings` property

### Enabling/Disabling Widgets

To disable a widget, set `enabled: false`:

```json
{
  "id": "coming-soon",
  "enabled": false,  // Won't load
  "settings": {}
}
```

To enable a widget, set `enabled: true`:

```json
{
  "id": "file-manager",
  "enabled": true,  // Will load
  "settings": { "startPath": "/home/user" }
}
```

---

## Testing

### Development Testing

Run the development server:

```bash
npm run dev
```

This:
- Starts Next.js dev server on `localhost:3000`
- Watches widget source files
- Auto-rebuilds on changes
- Keeps hot module replacement

### Testing Widget Changes

1. **Edit widget source** in `packages/widgets/@coderef-dashboard/widget-my-feature/src/`
2. **Rebuild widget bundle**:
   ```bash
   npm run build:widgets
   ```
3. **Refresh browser** at `localhost:3000`
4. **Check for errors** in browser console and dev tools

### Electron Testing

Test in Electron wrapper:

```bash
npm run dev:electron
```

This:
- Starts Electron app pointing to `localhost:3000`
- Uses development build
- Opens DevTools for debugging

### Production Testing

Build and test production package:

```bash
# Build everything
npm run build

# Test production build locally
npm run build:electron

# Package Windows executable
npm run package:win
```

### Debugging Tips

**Browser DevTools:**
- Check Console tab for widget errors
- Check Network tab to verify widget scripts load from `/widgets/`
- Check Application tab > Local Storage for persisted widget state

**Widget Console Logs:**
```typescript
async onEnable(): Promise<void> {
  console.log('[MyWidget] Initializing...'); // Easily identifiable in logs
  console.log('[MyWidget] Settings:', this.settings);
  console.log('[MyWidget] Ready');
}
```

**Error Handling:**
- Widgets wrap in `ErrorBoundary` automatically
- Errors show with "Widget Error" message
- "Retry" button re-mounts widget
- `onError` hook called before error boundary

**Network Requests:**
- Use `AbortController` to cancel pending requests on unmount
- Test offline behavior
- Check CORS headers for API requests

---

## Examples

### Example 1: Coming Soon Widget (Reference)

See `packages/widgets/@coderef-dashboard/widget-coming-soon/src/index.ts`

Simple widget showing placeholder content with customizable message.

**Features:**
- Custom settings (title, description, ETA)
- Settings change handler
- Lifecycle logging
- Error handling

### Example 2: Terminal Manager Widget (Future)

Structure for Terminal Manager as a widget:

```typescript
// packages/widgets/@coderef-dashboard/widget-terminal-manager/src/index.ts
import { IScriptboardWidget } from '@coderef-dashboard/core';
import { TerminalManager } from './TerminalManager';
import React from 'react';

export const TerminalManagerWidget: IScriptboardWidget = {
  id: 'terminal-manager',
  name: 'Terminal Manager',
  version: '0.1.0',
  description: 'Execute commands and manage terminal sessions',

  settings: {
    theme: 'dark',
    fontSize: 12,
    fontFamily: 'JetBrains Mono',
    commandHistory: true,
  },

  render(): React.ReactNode {
    return React.createElement(TerminalManager, {
      settings: this.settings,
    });
  },

  async onEnable(): Promise<void> {
    console.log('[TerminalManager] Initializing terminal...');
    // Initialize terminal backend connection
    // Start listening for command results
  },

  async onDisable(): Promise<void> {
    console.log('[TerminalManager] Closing terminal...');
    // Close terminal connections
    // Kill running processes
  },

  async onSettingsChange(payload): Promise<void> {
    console.log('[TerminalManager] Settings changed:', payload);
    // Handle theme/font changes
    // Update terminal UI
  },
};

export default TerminalManagerWidget;
```

### Example 3: File Manager Widget (Future)

Structure for File Manager as a widget:

```typescript
// packages/widgets/@coderef-dashboard/widget-file-manager/src/index.ts
import { IScriptboardWidget } from '@coderef-dashboard/core';
import { FileManager } from './FileManager';
import React from 'react';

export const FileManagerWidget: IScriptboardWidget = {
  id: 'file-manager',
  name: 'File Manager',
  version: '0.1.0',
  description: 'Browse and manage files on the system',

  settings: {
    startPath: '/',
    theme: 'dark',
    showHidden: false,
  },

  render(): React.ReactNode {
    return React.createElement(FileManager, {
      startPath: this.settings?.startPath || '/',
      settings: this.settings,
    });
  },

  async onEnable(): Promise<void> {
    console.log('[FileManager] Initializing file browser...');
    // Load initial directory
    // Set up file system watcher
  },

  async onDisable(): Promise<void> {
    console.log('[FileManager] Closing file browser...');
    // Stop watching file system
  },
};

export default FileManagerWidget;
```

### Example 4: System Monitor Widget (Future)

Structure for System Monitor with polling:

```typescript
export const SystemMonitorWidget: IScriptboardWidget = {
  id: 'system-monitor',
  name: 'System Monitor',
  version: '0.1.0',

  settings: {
    refreshInterval: 1000,
    theme: 'dark',
  },

  pollInterval: null as any,

  render(): React.ReactNode {
    return React.createElement(SystemMonitor, {
      settings: this.settings,
    });
  },

  async onEnable(): Promise<void> {
    // Start polling system stats
    this.pollInterval = setInterval(async () => {
      const stats = await fetch('/api/system/stats');
      // Update widget with stats
    }, this.settings?.refreshInterval || 1000);
  },

  async onDisable(): Promise<void> {
    // Stop polling
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  },

  async onSettingsChange(payload): Promise<void> {
    // Update polling interval
    if ('refreshInterval' in payload) {
      clearInterval(this.pollInterval);
      this.pollInterval = setInterval(() => {
        // Fetch with new interval
      }, payload.refreshInterval);
    }
  },
};
```

---

## Troubleshooting

### Widget Not Loading

**Symptom:** "Failed to load widget script" or widget doesn't appear

**Solutions:**
1. Check bundle exists: `ls packages/dashboard/public/widgets/`
2. Verify config has `enabled: true`
3. Check widget ID matches: `coderef-dashboard.config.json` should have `id: "my-feature"` and widget should export with matching id
4. Open browser DevTools Console tab - check for errors
5. Check Network tab - verify `/widgets/my-feature.js` loads

### Settings Not Updating

**Symptom:** Widget receives initial settings but changes don't apply

**Solutions:**
1. Implement `onSettingsChange` hook in your widget
2. Trigger settings update in config file
3. Widget needs to explicitly update its internal state in the hook

### Build Failures

**Symptom:** `npm run build:widgets` fails

**Solutions:**
1. Ensure `src/index.ts` exists in widget package
2. Check TypeScript errors: `npm run type-check`
3. Verify React imports: `import React from 'react'`
4. Check for missing dependencies in `package.json`

### Performance Issues

**Symptom:** Dashboard slow with many widgets

**Solutions:**
1. Use `React.memo()` in widget components to prevent re-renders
2. Implement `useMemo()` for expensive calculations
3. Cancel polling timers in `onDisable()`
4. Use `AbortController` to cancel pending requests

### Electron Blank Screen

**Symptom:** Widget loads in dev but not in packaged Electron app

**Solutions:**
1. Ensure `npm run build:widgets` was run
2. Check `packages/dashboard/public/widgets/` has bundled files
3. Verify `npm run build:dashboard` generated static export
4. Check Electron dev tools (Ctrl+I) for errors

### Common Widget Loading Errors

**Error: `(0, import_jsx_runtime.jsx) is not a function`**

**Cause:** Widget is using modern JSX transform (`jsx: "react-jsx"`), which requires `react/jsx-runtime` functions that aren't available in bundled widgets.

**Solution:** Change widget's `tsconfig.json` to use classic JSX transform:
```json
{
  "compilerOptions": {
    "jsx": "react",  // NOT "react-jsx"
  }
}
```

Classic JSX transform uses `React.createElement` which is available from the shared React global.

**Error: `Dynamic require of "react" is not supported`**

**Cause:** esbuild marks React/React-DOM as external (not bundled) to reduce size, but browsers don't have a `require()` function.

**Solution:** This is handled automatically by the build system:
- `scripts/build-widgets.js` injects a require() shim at the top of each widget bundle
- `WidgetLoader.tsx` exposes React/ReactDOM as `window.React` and `window.ReactDOM`
- The shim maps `require('react')` → `window.React`

No action needed - just ensure your widget uses the correct jsx transform (above).

**Error: `Invalid widget: must export a widget object with a render() method`**

**Cause:** Widget bundle isn't exporting the widget object correctly, or the module structure is wrong.

**Solutions:**
1. Ensure `src/index.ts` has `export default` for the widget object:
   ```typescript
   export const MyWidget: IScriptboardWidget = { ... };
   export default MyWidget;
   ```
2. Verify widget object has `render()` method (required)
3. Check that esbuild build succeeds: `npm run build:widgets`

**Error: `Widget not found in global namespace: CodeRefWidget_*`**

**Cause:** Widget script loaded but didn't create the expected global variable.

**Solutions:**
1. Check browser Network tab - verify widget .js file downloaded
2. Check browser Console for JavaScript errors in the bundle
3. Verify widget ID matches between config and export:
   - Config: `"id": "my-widget"`
   - Widget: `id: 'my-widget'` (must match exactly)
4. Global name pattern is `CodeRefWidget_{id-with-underscores}`
   - `my-widget` → `CodeRefWidget_my_widget`

---

## Quick Reference

### Create New Widget Checklist

- [ ] Create directory: `packages/widgets/@coderef-dashboard/widget-{name}`
- [ ] Add `package.json` with correct dependencies
- [ ] Add `tsconfig.json` extending dashboard config
  - **CRITICAL:** Set `"jsx": "react"` (NOT `"react-jsx"`) for bundled widget compatibility
- [ ] Create `src/index.ts` exporting widget object
  - Must have: `export default WidgetObject`
  - Widget must implement `IScriptboardWidget` interface
  - Widget must have `render()` method
- [ ] Add lifecycle hooks (onEnable/onDisable) as needed
- [ ] Run `npm install`
- [ ] Run `npm run build:widgets`
  - Verify widget appears in `packages/dashboard/public/widgets/{widget-id}.js`
- [ ] Add to `coderef-dashboard.config.json` with `"enabled": true`
- [ ] Test with `npm run dev`
  - Check browser DevTools Console for widget loading errors
  - Verify Network tab shows widget .js file loaded
- [ ] Test with `npm run dev:electron`

### Build Commands

```bash
# Build all widgets
npm run build:widgets

# Build everything (widgets + dashboard + electron)
npm run build

# Development server
npm run dev

# Electron development
npm run dev:electron

# Production build
npm run build:dashboard
npm run build:electron

# Windows package
npm run package:win
```

### Key Files

| File | Purpose |
|------|---------|
| `scripts/build-widgets.js` | Widget bundler script |
| `packages/widgets/@coderef-dashboard/` | Widget packages root |
| `packages/dashboard/public/widgets/` | Bundled widget output |
| `coderef-dashboard.config.json` | Widget configuration |
| `packages/dashboard/src/components/WidgetLoader.tsx` | Widget runtime loader |

---

## Support & Questions

For questions about the widget system:
1. Check this documentation
2. Review example widgets
3. Check browser console for error messages
4. Review TypeScript errors: `npm run type-check`

For bugs or feature requests, create an issue in the project repository.

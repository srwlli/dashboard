# CodeRef Dashboard

**A modular widget system with PWA and Electron support for tracking workorders and stubs across multiple projects**

**Version:** 0.8.0
**Date:** 2026-01-11
**Maintainer:** CodeRef Team

## What's New in 0.8.0

🧠 **CodeRef-Powered Context Discovery** - Intelligent semantic file discovery for session planning
- Replaced keyword matching with 4-dimension semantic scoring (pattern similarity, dependencies, complexity, coverage)
- Discovers 5 new file categories: components, hooks, API routes, utils, tests
- Processes 5,151 indexed elements from `.coderef/` scan
- Graph-based relationship awareness for 5x smarter file suggestions
- Comprehensive test coverage with 28 test cases
- Full API documentation for `/api/sessions/context-discovery` endpoint

---

## Overview

CodeRef Dashboard is a unified interface for aggregating and visualizing workorder and stub data from multiple software projects. It provides a read-only dashboard that scans project directories to display active work (workorders) and backlog items (stubs) in a clean, responsive UI.

**Core Features:**
- 📊 Aggregate workorders from multiple projects
- 📋 Centralized stub (backlog) management
- 🎨 Dark mode with customizable accent colors
- 📱 Responsive design (mobile, tablet, desktop)
- 💻 PWA support for web deployment
- 🖥️ Electron app for desktop distribution

---

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Projects configured with `coderef/workorder/` directories

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/coderef-dashboard.git
cd coderef-dashboard

# Install dependencies
npm install

# Run development server
npm run dev
```

The dashboard will start at `http://localhost:3000`.

---

## Project Structure

```
coderef-dashboard/
├── packages/
│   ├── core/           # Shared library (hooks, utils, types)
│   ├── dashboard/      # Next.js web application
│   └── electron-app/   # Electron desktop wrapper
├── scripts/            # Build scripts
├── package.json        # Root workspace config
└── README.md           # This file
```

---

## Usage

### Web Application (Development)

```bash
# Start Next.js dev server
npm run dev

# Open browser
# Navigate to http://localhost:3000
```

### Electron Desktop App (Development)

```bash
# Start Electron app
npm run dev:electron
```

### Production Build

```bash
# Build all packages
npm run build

# Build dashboard only
npm run build:dashboard

# Build Electron app
npm run build:electron

# Package Windows executable
npm run package:win
```

---

## Configuration

### projects.config.json

Create a `projects.config.json` file outside the codebase to configure project directories:

**Location:** `C:\Users\<username>\Desktop\assistant\projects.config.json` (or custom path)

**Example:**
```json
{
  "projects": [
    {
      "id": "project-alpha",
      "name": "Project Alpha",
      "path": "C:\\path\\to\\project-alpha",
      "workorder_dir": "coderef/workorder"
    },
    {
      "id": "project-beta",
      "name": "Project Beta",
      "path": "C:\\path\\to\\project-beta",
      "workorder_dir": "coderef/workorder"
    }
  ],
  "centralized": {
    "stubs_dir": "C:\\Users\\willh\\Desktop\\assistant\\stubs"
  }
}
```

**Update API routes to use your config path:**
Edit `packages/dashboard/src/app/api/workorders/route.ts` and `packages/dashboard/src/app/api/stubs/route.ts`:

```typescript
const configPath = 'YOUR_PATH_TO_projects.config.json';
```

---

## Development Workflow

### Running Tests

```bash
npm test
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

---

## Documentation

Comprehensive documentation is available in the `coderef/foundation-docs/` directory:

| Document | Description |
|----------|-------------|
| [API.md](coderef/foundation-docs/API.md) | REST API endpoints and data models |
| [SCHEMA.md](coderef/foundation-docs/SCHEMA.md) | TypeScript interfaces and schemas |
| [COMPONENTS.md](coderef/foundation-docs/COMPONENTS.md) | UI component library reference |
| [ARCHITECTURE.md](coderef/foundation-docs/ARCHITECTURE.md) | System design and architecture |

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Language:** TypeScript 5.3.3

### Backend
- **API:** Next.js API Routes
- **Data Layer:** File System (JSON + Markdown)
- **Desktop:** Electron

### Build Tools
- **Package Manager:** npm (Workspaces)
- **Bundler:** Next.js (Turbopack) + esbuild
- **Electron Packaging:** electron-builder

---

## API Endpoints

### GET /api/workorders

Fetch all workorders from configured projects.

**Response:**
```json
{
  "success": true,
  "data": {
    "workorders": [ /* array of workorder objects */ ],
    "total": 15,
    "by_project": { "project-alpha": 5, "project-beta": 10 },
    "by_status": { "implementing": 8, "complete": 5, "pending_plan": 2 }
  },
  "timestamp": "2025-12-28T15:00:00.000Z"
}
```

### GET /api/workorders/:workorderId

Fetch specific workorder details.

### GET /api/stubs

Fetch all stubs from centralized directory.

**See [API.md](coderef/foundation-docs/API.md) for complete API reference.**

---

## Troubleshooting

### Issue: Config file not found

**Error:**
```
CONFIG_MISSING: projects.config.json not found or invalid
```

**Solution:**
1. Create `projects.config.json` file
2. Update API route file paths to reference your config location
3. Ensure JSON is valid (use a JSON validator)

---

### Issue: No workorders showing

**Possible Causes:**
1. Projects not configured in `projects.config.json`
2. `coderef/workorder/` directories don't exist
3. Workorder folders missing `communication.json`

**Solution:**
1. Verify project paths in config
2. Ensure workorder directories exist
3. Check browser DevTools Network tab for API errors

---

### Issue: Type errors during build

**Error:**
```
Type error: Property 'CodeRefCore' does not exist on type 'Window'
```

**Solution:**
1. Run `npm run type-check` to identify issues
2. Ensure all packages have matching TypeScript versions
3. Clean install: `rm -rf node_modules && npm install`

---

### Issue: Electron app won't start

**Solution:**
1. Build dashboard first: `npm run build:dashboard`
2. Ensure Electron app has access to built files
3. Check Electron console for errors (View > Toggle Developer Tools)

---

## Contributing

### Code Style

- Use TypeScript for all new files
- Follow existing component patterns
- Use Tailwind CSS utilities (avoid custom CSS)
- Add `'use client'` directive for client components

### Component Guidelines

1. Create components in `packages/dashboard/src/components/`
2. Define TypeScript prop interfaces
3. Export from `index.tsx` for clean imports
4. Use `ind-*` design tokens for theming

### Pull Request Process

1. Create feature branch from `main`
2. Make changes with descriptive commits
3. Run tests and type checking
4. Submit PR with description of changes

---

## Deployment

### Web (Vercel/Netlify)

```bash
# Build for production
npm run build:dashboard

# Deploy built files from packages/dashboard/.next
```

### Desktop (Windows)

```bash
# Package Windows executable
npm run package:win

# Output: packages/electron-app/dist/CodeRef-Dashboard-Setup.exe
```

---

## Roadmap

### v0.2.0 (Next Release)
- [ ] Add workorder filtering by project/status
- [ ] Implement stub detail view
- [ ] Add authentication (JWT)
- [ ] Real-time workorder updates (WebSockets)

### v1.0.0 (Future)
- [ ] Add database (PostgreSQL/SQLite)
- [ ] GraphQL API layer
- [ ] User management
- [ ] Comments on workorders
- [ ] Full-text search

---

## License

[MIT License](LICENSE)

---

## Support

- **Issues:** [GitHub Issues](https://github.com/your-org/coderef-dashboard/issues)
- **Documentation:** [coderef/foundation-docs/](coderef/foundation-docs/)
- **Email:** support@coderef.dev

---

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Electron](https://www.electronjs.org/)
- [Lucide Icons](https://lucide.dev/)

---

## Quick Stats

| Metric | Value |
|--------|-------|
| **Language** | TypeScript |
| **Framework** | Next.js 14 (App Router) |
| **UI Library** | React 19 |
| **Styling** | Tailwind CSS |
| **Package Manager** | npm (Workspaces) |
| **Node Version** | >= 18.0.0 |
| **Build Tool** | Turbopack + esbuild |
| **Desktop Platform** | Electron |

---

**AI Integration Notes:**

When working with this codebase:

1. **Config Path:** Update API routes with absolute path to `projects.config.json`
2. **File Reading:** All data read from file system, no database
3. **Type Safety:** Use TypeScript interfaces from `@coderef-dashboard/core`
4. **Component Pattern:** Client components need `'use client'` directive
5. **Styling:** Use `ind-*` Tailwind tokens for theming

**Common Tasks:**
- Add new page: Create file in `packages/dashboard/src/app/`
- Add new component: Create folder in `packages/dashboard/src/components/`
- Add new API endpoint: Create route in `packages/dashboard/src/app/api/`
- Add new type: Export from `packages/core/src/types/`

---

*Generated: 2025-12-28*
*This documentation is part of the CodeRef Dashboard foundation docs suite.*

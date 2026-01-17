# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Directory Purpose

**Location:** `/packages/dashboard/src/app/resources/`

This directory contains the **Resources Page** - a comprehensive reference UI for CodeRef commands, MCP tools, workflows, and documentation.

**Route:** `/resources` in the dashboard

**Purpose:** Single-page documentation viewer with 6 tabs displaying all CodeRef ecosystem commands and tools.

---

## Architecture

### Page Structure

```
resources/
├── page.tsx              # Main page component with tab navigation
└── (related components in src/components/resources/)
    ├── CommandsTab.tsx   # Slash commands organized by category
    ├── ToolsTab.tsx      # MCP server tools grid
    ├── ScriptsTab.tsx    # Automation scripts
    ├── WorkflowsTab.tsx  # Common workflows
    ├── SetupTab.tsx      # Setup instructions
    └── OutputTab.tsx     # Output examples
```

### Component Pattern

**page.tsx** is a client component that:
1. Manages tab state with `useState`
2. Renders `TabNavigation` component with 6 tabs
3. Conditionally renders tab content based on `activeTab`
4. Wrapped in `PageLayout` > `PageCard` for consistent styling

```tsx
'use client';

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState<string>('commands');

  const tabs = [
    { id: 'commands', label: 'Commands', icon: Terminal },
    { id: 'tools', label: 'Tools', icon: Wrench },
    { id: 'scripts', label: 'Scripts', icon: FileCode },
    { id: 'workflows', label: 'Workflows', icon: GitBranch },
    { id: 'setup', label: 'Setup', icon: Settings },
    { id: 'output', label: 'Output', icon: FileOutput },
  ];

  return (
    <PageLayout>
      <PageCard>
        <TabNavigation tabs={tabs} activeTabId={activeTab} onTabChange={setActiveTab} />
        {activeTab === 'commands' && <CommandsTab />}
        {/* ... other tabs */}
      </PageCard>
    </PageLayout>
  );
}
```

---

## Tab Components

### 1. CommandsTab.tsx

**Purpose:** Display 70+ slash commands organized by 8 categories

**Data Structure:**
```typescript
interface Command {
  name: string;           // e.g., '/list-templates'
  description: string;    // What it does
  component: string;      // 'Docs', 'Workflow', 'Orchestrator'
  mcpTool: string;        // Corresponding MCP tool name
}

interface CommandCategory {
  name: string;           // e.g., 'Documentation & Standards'
  count: number;          // Number of commands in category
  commands: Command[];
}
```

**Categories:**
- Documentation & Standards (10 commands)
- Planning & Workflow (14 commands)
- Deliverables & Tracking (6 commands)
- Multi-Agent Coordination (6 commands)
- Personas (11 commands)
- Code Intelligence (12 commands)
- Testing & Quality (8 commands)
- UI/UX & Deployment (3 commands)

**UI Pattern:**
- Collapsible sections per category
- Command cards with name, description, component badge, MCP tool mapping
- Search/filter functionality
- Responsive grid layout

### 2. ToolsTab.tsx

**Purpose:** Display MCP server tools in grid cards

**Data Structure:**
```typescript
const mcpServers = [
  {
    name: 'coderef-context',
    description: 'Code Intelligence',
    toolCount: 12,
    tools: ['coderef_scan', 'coderef_query', ...]
  },
  // ... 5 total servers
];
```

**MCP Servers:**
- coderef-context (12 tools) - Code intelligence & scanning
- coderef-workflow (23 tools) - Planning & workflow management
- coderef-personas (7 tools) - Persona management
- testing (18 tools) - Test automation
- chrome-devtools (11 tools) - Browser debugging

**Total:** 71+ tools across 5 servers

**UI Pattern:**
- Stats header showing total tool count
- Grid of server cards (3 columns on large screens)
- Each card shows server name, description, tool count badge, and sample tools
- Hover effects with accent color

### 3. ScriptsTab.tsx

**Purpose:** Display automation scripts with examples

**UI Pattern:**
- Script cards with syntax highlighting
- Copy-to-clipboard functionality
- Example usage and output

### 4. WorkflowsTab.tsx

**Purpose:** Display common CodeRef workflows step-by-step

**UI Pattern:**
- Workflow cards with numbered steps
- Visual flow diagrams
- Links to related commands

### 5. SetupTab.tsx

**Purpose:** Setup instructions for CodeRef ecosystem

**UI Pattern:**
- Installation steps
- Configuration examples
- Prerequisites checklist

### 6. OutputTab.tsx

**Purpose:** Example outputs from commands and tools

**UI Pattern:**
- Output examples with syntax highlighting
- Before/after comparisons
- Expected output formats

---

## Common Patterns

### Adding a New Command

1. **Update CommandsTab.tsx:**
   ```typescript
   const commandCategories: CommandCategory[] = [
     {
       name: 'Your Category',
       count: X,
       commands: [
         {
           name: '/your-command',
           description: 'What it does',
           component: 'Workflow', // or 'Docs', 'Orchestrator'
           mcpTool: 'corresponding_mcp_tool'
         },
       ],
     },
   ];
   ```

2. **Update category count** when adding to existing category

3. **Test responsive layout** on mobile/tablet/desktop

### Adding a New MCP Server

1. **Update ToolsTab.tsx:**
   ```typescript
   const mcpServers = [
     {
       name: 'your-server-name',
       description: 'Brief description',
       toolCount: X,
       tools: ['tool1', 'tool2', ...]
     },
   ];
   ```

2. **Update total tool count** in stats header

### Styling Guidelines

**Colors:**
- Background: `bg-ind-panel` (cards), `bg-ind-bg` (sections)
- Borders: `border-ind-border`
- Text: `text-ind-text` (primary), `text-ind-text-muted` (secondary)
- Accent: `text-ind-accent`, `bg-ind-accent/10`

**Spacing:**
- Outer container: `space-y-6`
- Card padding: `p-4`
- Grid gaps: `gap-4`

**Responsive:**
- Mobile: Single column
- Tablet (md): 2 columns
- Desktop (lg): 3 columns

---

## Data Sources

**Static Data:** All command/tool data is currently hardcoded in tab components

**Future Enhancement:** Could pull from:
- CSV files (e.g., `coderef/tools-and-commands.csv`)
- JSON API endpoints
- MCP server introspection

---

## Related Files

- **Components:** `src/components/resources/*.tsx`
- **Layout:** `src/components/PageLayout.tsx`, `src/components/PageCard.tsx`
- **Navigation:** `src/components/TabNavigation.tsx`
- **Icons:** Using `lucide-react` (Terminal, Wrench, FileCode, etc.)

---

## Testing

When making changes:

1. **Test all tabs render correctly:**
   ```bash
   npm run dev
   # Navigate to http://localhost:3004/resources
   # Click through all 6 tabs
   ```

2. **Test responsive layouts:**
   - Mobile (xs): 320px
   - Tablet (md): 768px
   - Desktop (xl): 1280px

3. **Check for:**
   - Tab switching works smoothly
   - Cards render correctly in grid
   - Text truncation/overflow handled
   - Hover states on interactive elements
   - Accent color theming applied

---

## Common Tasks

### Update Command Count

When adding/removing commands in CommandsTab.tsx:
1. Update the `count` field in the category object
2. Update total count in header/stats section (if exists)

### Add New Tab

1. Create new component: `src/components/resources/YourTab.tsx`
2. Import in `page.tsx`
3. Add to `tabs` array with icon
4. Add conditional render: `{activeTab === 'your-tab' && <YourTab />}`
5. Update Sidebar/MobileNav if needed

### Update Tool Counts

When MCP servers add/remove tools:
1. Update `toolCount` in ToolsTab.tsx
2. Update `tools` array
3. Recalculate total in stats header

---

## Notes

- **Client Component:** Page must be client component for tab state management
- **Icons:** All icons from `lucide-react` for consistency
- **No API calls:** Currently all data is static (future: could integrate with CodeRef MCP server for live data)
- **Searchable:** Consider adding search/filter for commands (future enhancement)

---

**Last Updated:** 2026-01-16

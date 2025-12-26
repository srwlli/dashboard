# Sidebar Navigation Implementation Specifications (Updated)

**Workorder:** WO-SIDEBAR-001
**Feature:** sidebar
**Created:** 2025-12-26
**Updated:** 2025-12-26
**Status:** Planning

**Key Changes from Initial:**
- Single toggle button in SIDEBAR ONLY (not in header)
- Use lucide-react icons (ChevronLeft/ChevronRight) instead of emojis
- Header is STICKY positioned
- Header contains ONLY: CodeRef branding, page title, user avatar (NO toggle)

---

## 1. Overview

Add a collapsible sidebar navigation to the CodeRef Dashboard with an integrated sticky header containing CodeRef branding, page title, and user profile avatar. Use professional icon library (lucide-react) for the collapse toggle.

### Layout Structure

```
┌────────────────────────────────────────────────────────────┐
│ CodeRef Dashboard                               [👤]      │  Sticky Header
├────────────────────────────────────────────────────────────┤
│      │                                                      │
│ ◄ ►  │  [Page Content - PageLayout + Component]           │
│ 📊   │  (ComingSoon, PromptingWorkflow, ThemePanel, etc)  │
│ 📝   │                                                      │
│ ⚙️   │                                                      │
│      │                                                      │
└────────────────────────────────────────────────────────────┘
 Sidebar  Main Content Area
(toggle   (scrollable, header stays at top)
at top)
```

---

## 2. Sidebar Component

### File Location
`packages/dashboard/src/components/Sidebar/index.tsx`

### Dimensions
- **Expanded:** `w-64` (250px)
- **Collapsed:** `w-20` (80px)
- **Height:** `h-screen` (full viewport height)
- **Animation:** `transition-all duration-300` (smooth 300ms transition)
- **Position:** `sticky` or `relative` (not fixed)

### Styling
```
Background: bg-ind-panel
Border: border-r border-ind-border
Text: text-ind-text
Padding: p-4
Overflow: overflow-y-auto
```

### Structure

**EXPANDED VIEW (Default)**
```
┌──────────────────────────┐
│ ◄ (ChevronLeft)          │ ← SINGLE Toggle button
├──────────────────────────┤
│ 📊 Dashboard             │ ← Nav item (icon + label)
│ 📝 Prompts               │
│ ⚙️  Settings             │
│                          │
│ (empty space below)      │
└──────────────────────────┘
```

**COLLAPSED VIEW**
```
┌────┐
│ ► │ ← SINGLE Toggle button (ChevronRight)
├────┤
│ 📊 │ ← Nav item (icon only, tooltip on hover)
│ 📝 │ ← Tooltip: "Prompts"
│ ⚙️  │
│    │
│    │
└────┘
```

### Toggle Button (SINGLE POINT)
- **Position:** Top of sidebar only (NOT in header)
- **Width:** Full width (w-full)
- **Padding:** `px-4 py-3`
- **Icon:** ChevronLeft (◄, collapse) / ChevronRight (►, expand) from lucide-react
- **Icon Size:** size-5 (20px)
- **Color:** `text-ind-accent`
- **Hover:** `hover:bg-ind-bg`
- **Border Bottom:** `border-b border-ind-border`
- **Tooltip:** None (clean icon only, self-explanatory)
- **Cursor:** `cursor-pointer`
- **Transition:** Smooth width change when sidebar collapses
- **Library:** lucide-react

### Navigation Items
- 3 items total: Dashboard, Prompts, Settings
- Icons: 📊, 📝, ⚙️ (can use lucide-react icons if needed)
- Uses NavItem sub-component (see section 3)

---

## 3. NavItem Component

### File Location
`packages/dashboard/src/components/Sidebar/NavItem.tsx`

### Props
```typescript
interface NavItemProps {
  icon: string;           // e.g., "📊"
  label: string;          // e.g., "Dashboard"
  href: string;           // e.g., "/"
  isActive: boolean;      // Detected via usePathname()
  isCollapsed: boolean;   // From SidebarContext
}
```

### Expanded State
```
┌─────────────────────────┐
│ 📊 Dashboard            │ ← Icon + Label
│ (active: accent color)  │ ← Accent text + bg highlight
└─────────────────────────┘
```

- Padding: `px-4 py-3`
- Text: `text-sm font-mono`
- Color (inactive): `text-ind-text-muted` hover:`hover:bg-ind-bg`
- Color (active): `text-ind-accent` + `bg-ind-bg`
- Transition: `transition-colors duration-200`
- Icon Size: Text-base
- Gap between icon and label: `gap-3`

### Collapsed State
```
┌────┐
│ 📊 │ ← Icon only, centered
└────┘
  Tooltip: "Dashboard" (on hover)
```

- Icon centered: `flex justify-center`
- Tooltip appears on hover (group-hover)
- Tooltip styling: See section 6 (Tooltips)

### Active State Detection
- Use `usePathname()` hook
- Compare current pathname with `href` prop
- Apply accent color + background highlight
- Examples:
  - Route `/`: Dashboard active
  - Route `/prompts`: Prompts active
  - Route `/settings`: Settings active
  - Route `/user-settings`: None active (not in sidebar)

---

## 4. Header Component (Sticky)

### File Location
`packages/dashboard/src/components/Header/index.tsx`

### Layout
```
┌─────────────────────────────────────────────────────┐
│ CodeRef Dashboard                           [👤]    │
└─────────────────────────────────────────────────────┘
  Brand  Title                             Avatar
```

### Styling
- **Position:** `sticky top-0` (stays at top during scroll)
- **Z-Index:** `z-40` (stays above content)
- **Background:** `bg-ind-panel`
- **Border:** `border-b border-ind-border`
- **Padding:** `p-4`
- **Flex:** `flex items-center justify-between`
- **Height:** Auto (content-based)

### Left Section (Flex)
```
CodeRef | Dashboard
```

- **Container:** `flex items-center gap-4`

#### CodeRef Branding
- Text: `CodeRef`
- Styling: `text-lg font-bold uppercase tracking-wider text-ind-text`
- Static: Never changes
- Responsive: Show on desktop, may hide on mobile (lg: breakpoint)

#### Page Title (Dynamic)
- Source: `usePathname()` hook
- Mapping:
  - `/` → "Dashboard"
  - `/prompts` → "Prompts"
  - `/settings` → "Settings"
  - `/user-settings` → "User Settings"
  - (default) → "Page"
- Styling: `text-sm text-ind-text-muted font-mono`
- Responsive: Show on desktop, may hide on small mobile

### Right Section
- **User Avatar Component** (see section 5)

### IMPORTANT: NO TOGGLE BUTTON IN HEADER
- Toggle button is ONLY in Sidebar (at top)
- Header contains: CodeRef + page title + avatar only

---

## 5. UserAvatar Component

### File Location
`packages/dashboard/src/components/UserAvatar/index.tsx`

### Visual
```
    ┌─────┐
    │ 👤  │
    └─────┘
  User Settings (tooltip on hover)
```

### Styling
- **Container:** Button element
- **Size:** `w-10 h-10` (40px x 40px)
- **Shape:** `rounded-full` (circular)
- **Border:** `border-2 border-ind-accent`
- **Background:** `bg-ind-bg`
- **Icon:** `👤` (emoji, text-lg)
- **Icon Color:** `text-ind-text`

### Hover State
- **Scale:** `hover:scale-105` (slight zoom)
- **Shadow:** `hover:shadow-lg hover:shadow-ind-accent/30`
- **Transition:** `transition-all duration-200`
- **Cursor:** `cursor-pointer`

### Tooltip
- **Text:** "User Settings"
- **Display:** Only on hover, desktop only (`hidden lg:block`)
- **Styling:** See section 6 (Tooltips)

### On Click Behavior
- Navigate to `/user-settings` page
- Use Next.js `Link` or `useRouter()` hook
- No page reload needed (client-side navigation)

---

## 6. Tooltips

### Implementation Strategy
Use Tailwind `group-hover` pattern for hover-based tooltips.

### Styling
```css
/* Tooltip container */
className="absolute left-20 top-1/2 -translate-y-1/2
           bg-ind-accent text-black
           px-3 py-1 rounded text-xs font-mono whitespace-nowrap
           opacity-0 group-hover:opacity-100 transition-opacity
           pointer-events-none hidden lg:block"
```

### Tooltip Locations
1. **Nav Items (when collapsed)**
   - Position: Right of icon (left-20 offset)
   - Text: "Dashboard", "Prompts", "Settings"
   - Only visible when sidebar collapsed AND on hover

2. **User Avatar**
   - Position: Below avatar
   - Text: "User Settings"
   - Always visible on hover (desktop)

### Mobile Behavior
- **Hide tooltips:** `hidden lg:block` (hide below lg breakpoint)
- **Reason:** Too much screen clutter on mobile, sidebar likely not visible

---

## 7. SidebarContext

### File Location
`packages/dashboard/src/contexts/SidebarContext.tsx`

### Interface
```typescript
interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

interface SidebarProviderProps {
  children: React.ReactNode;
}
```

### Functionality
- **State:** `isCollapsed` boolean (default: false = expanded)
- **Function:** `toggleSidebar()` toggles the state and updates localStorage
- **Persistence:** Saved to localStorage as `coderef-dashboard-sidebar-collapsed`
- **Sync:** Optional: listen to storage events to sync across tabs

### localStorage Key
```
coderef-dashboard-sidebar-collapsed = "false" (expanded) | "true" (collapsed)
```

### Usage
```typescript
const { isCollapsed, toggleSidebar } = useSidebar();
```

---

## 8. RootClientWrapper Updates

### Current Layout
```tsx
<main className="p-4">
  <div className="max-w-6xl mx-auto">
    <div className="grid gap-6">
      {children}
    </div>
  </div>
</main>
```

### New Layout
```tsx
<div className="flex h-screen bg-ind-bg">
  {/* Sidebar - Collapsible */}
  <Sidebar />

  {/* Main Content Area */}
  <div className="flex-1 flex flex-col overflow-hidden">
    {/* Sticky Header */}
    <Header />

    {/* Scrollable Content */}
    <main className="flex-1 overflow-y-auto p-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid gap-6">
          {children}
        </div>
      </div>
    </main>
  </div>
</div>
```

### Key Changes
1. Root element: `flex` layout, `h-screen` (full height)
2. Sidebar: Left column, width changes based on `isCollapsed`
3. Main content: `flex-1` (fill remaining space), `flex flex-col` (stack header + content)
4. Header: Full width of main content, sticky positioned with `z-40`
5. Content: `flex-1 overflow-y-auto` (scrollable, fills remaining space)

---

## 9. User Settings Page

### File Location
`packages/dashboard/src/app/user-settings/page.tsx`

### Content
```tsx
<PageLayout title="CodeRef User Settings" accent={false}>
  <ComingSoon
    title="User Profile"
    description="Manage your user account, preferences, and profile information."
    eta="Q1 2025"
  />
</PageLayout>
```

### Route
- Path: `/user-settings`
- Accessible via: User avatar click in header

### Future Enhancements
- Account settings
- Preferences
- Profile information
- API integrations

---

## 10. lucide-react Integration

### Installation
- Add `lucide-react` to `packages/dashboard/package.json` dependencies
- Run `npm install`

### Icons Used
- **ChevronLeft** - collapse/chevron left icon (◄)
- **ChevronRight** - expand/chevron right icon (►)

### Implementation Pattern
```tsx
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Conditional rendering
{isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
```

### Sizing
- Toggle button icon: `size-5` (20px)
- Other icons: `size-4` (16px) or as needed

### Styling
- Color: `text-ind-accent` (uses CSS variables)
- Hover: `hover:text-ind-accent-hover` (optional)
- Classes: `transition-colors duration-200`

---

## 11. Responsive Behavior

### Desktop (lg breakpoint and up: 1024px+)
- **Sidebar:** Visible, collapsible with toggle button
- **Header:** Full width, all elements visible, sticky
- **Tooltips:** Show on hover (enabled)
- **Layout:** Sidebar + Main content side-by-side

### Tablet (768px - 1023px)
- **Sidebar:** Visible, collapsible
- **Header:** Full width, all elements visible, sticky
- **Tooltips:** Show on hover (enabled)
- **Layout:** Sidebar + Main content (may need to adjust widths)

### Mobile (below 768px)
- **Sidebar:** Hidden by default (future: hamburger menu)
- **Header:** Full width, essentials only, sticky
- **Tooltips:** Hidden (too cluttered)
- **Layout:** Full-width main content
- **Note:** Current implementation assumes desktop/tablet first

---

## 12. Color & Theming

### Theme Variables Used
```
ind-bg         = Background color (dark: #0c0c0e, light: #f4f4f5)
ind-panel      = Panel/card background (dark: #141416, light: #ffffff)
ind-border     = Border color (dark: #3f3f46, light: #e4e4e7)
ind-accent     = Accent color (dynamic: 6 neon options)
ind-text       = Text color (dark: #f4f4f5, light: #1f1f1f)
ind-text-muted = Muted text (dark: #71717a, light: #a1a1a1)
```

### Dark Mode (Default)
```
Sidebar: bg-ind-panel (#141416), text-ind-text (#f4f4f5)
Header: bg-ind-panel (#141416), border-ind-border (#3f3f46), sticky
Nav items (inactive): text-ind-text-muted (#71717a)
Nav items (active): text-ind-accent (dynamic), bg-ind-bg (#0c0c0e)
Avatar: border-ind-accent (dynamic)
lucide-react icons: text-ind-accent (dynamic)
```

### Light Mode
```
Sidebar: bg-ind-panel (#ffffff), text-ind-text (#1f1f1f)
Header: bg-ind-panel (#ffffff), border-ind-border (#e4e4e7), sticky
Nav items (inactive): text-ind-text-muted (#a1a1a1)
Nav items (active): text-ind-accent (dynamic), bg-ind-bg (#f4f4f5)
Avatar: border-ind-accent (dynamic)
lucide-react icons: text-ind-accent (dynamic)
```

### Accent Colors (6 Neon Options)
```
red:    #FF1744
orange: #FF6600
yellow: #FFFF00
green:  #00FF41
purple: #BB00FF
blue:   #00D4FF
```

---

## 13. File Structure

```
components/
├── Sidebar/
│   ├── index.tsx (main Sidebar component)
│   └── NavItem.tsx (individual nav item component)
├── Header/
│   └── index.tsx (sticky top header with branding and avatar)
├── UserAvatar/
│   └── index.tsx (user avatar button)
└── RootClientWrapper.tsx (UPDATED)

contexts/
├── SidebarContext.tsx (NEW - sidebar state management)
└── (existing: ThemeContext, AccentColorContext)

app/
├── layout.tsx (root layout - wrap with SidebarProvider)
├── page.tsx (Dashboard)
├── prompts/
│   └── page.tsx (Prompts)
├── settings/
│   └── page.tsx (Settings)
└── user-settings/
    └── page.tsx (NEW - User Settings)
```

---

## 14. Key Implementation Notes

**Single Toggle Point:**
- Toggle button ONLY in Sidebar (at top)
- NO toggle in header
- Cleaner UX, single source of truth

**Sticky Header:**
- Header uses `sticky top-0 z-40`
- Stays at top during content scroll
- No fixed positioning (allows parent flex layout to work)

**lucide-react Icons:**
- ChevronLeft (collapse): ◄ pointing left
- ChevronRight (expand): ► pointing right
- Professional appearance, scalable, color-aware

**No Emoji Icons:**
- Replaced « » with lucide-react ChevronLeft/ChevronRight
- Replaced 📊, 📝, ⚙️ optionally (can stay as is or use lucide-react)
- More professional, consistent sizing, better theming

---

## 15. Testing Checklist

### Functionality Tests
- [ ] Sidebar toggle (SINGLE button) expands/collapses
- [ ] Toggle button is ONLY in sidebar (verify not in header)
- [ ] Toggle button has NO tooltip
- [ ] Sidebar state persists on page reload
- [ ] Active nav item highlights on correct page
- [ ] Page title updates dynamically
- [ ] User avatar navigates to /user-settings
- [ ] All routes accessible and load correctly

### Visual Tests
- [ ] Sidebar styling matches spec (colors, spacing, sizing)
- [ ] Header styling matches spec, sticky positioning works
- [ ] Avatar styling matches spec
- [ ] Nav item tooltips show on hover when collapsed (desktop only)
- [ ] lucide-react icons display correctly
- [ ] Animations smooth and fluid
- [ ] No visual glitches or overlaps

### Sticky Header Tests
- [ ] Header stays at top when scrolling content
- [ ] Header doesn't push content down (uses sticky, not fixed)
- [ ] Z-index correct (no overlap with sidebar or content)
- [ ] No layout shift when header becomes sticky
- [ ] Works on all screen sizes

### Responsive Tests
- [ ] Desktop (1920x1080): All elements visible and functional
- [ ] Tablet (768x1024): Layout works correctly
- [ ] Mobile (375x667): Layout doesn't break

### Theme Tests
- [ ] Dark mode: All colors correct, icons visible
- [ ] Light mode: All colors correct, icons visible
- [ ] Accent color change: Active nav items and avatar update
- [ ] lucide-react icons visible in both modes

### Performance Tests
- [ ] Sidebar toggle has no lag
- [ ] Navigation is instant (client-side)
- [ ] Sticky header doesn't cause scroll jank
- [ ] Build completes successfully
- [ ] No console errors or warnings

---

**End of Specifications Document**

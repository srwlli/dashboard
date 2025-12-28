# Deliverables: migrate-to-coderef-dashboard

**Workorder:** WO-MIGRATION-001
**Created:** 2025-12-28
**Status:** PENDING

---

## Implementation Tracking

### Phase 1: Setup & Foundation
- [ ] Directory structure created
- [ ] TypeScript types defined
- [ ] IndexedDB utilities implemented
- [ ] SETUP-001: Create directory structure
- [ ] SETUP-002: Add File System Access API types
- [ ] SETUP-003: Create shared TypeScript interfaces
- [ ] SETUP-004: Set up IndexedDB utilities

### Phase 2: Core Components (Isolated)
- [ ] ProjectSelector component
- [ ] FileTree + FileTreeNode components
- [ ] FileViewer component
- [ ] Tailwind styling applied
- [ ] COMP-001: Create ProjectSelector.tsx
- [ ] COMP-002: Create FileTreeNode.tsx
- [ ] COMP-003: Create FileTree.tsx
- [ ] COMP-004: Create FileViewer.tsx
- [ ] COMP-005: Style with Tailwind

### Phase 3: File System Access API Mode (Local)
- [ ] local-access.ts utilities
- [ ] ProjectManager component
- [ ] Permission handling logic
- [ ] Local mode fully functional
- [ ] LOCAL-001: Create local-access.ts
- [ ] LOCAL-002: Create ProjectManager.tsx
- [ ] LOCAL-003: Implement permission checking
- [ ] LOCAL-004: Wire IndexedDB storage
- [ ] LOCAL-005: Integrate with FileTree

### Phase 4: Next.js API Routes (Server Mode)
- [ ] 5 API routes created
- [ ] api-access.ts fetch utilities
- [ ] Error handling implemented
- [ ] API-001: Create projects route (GET, POST)
- [ ] API-002: Create projects/[id] route (DELETE)
- [ ] API-003: Create tree route (GET)
- [ ] API-004: Create file route (GET)
- [ ] API-005: Add error handling
- [ ] API-006: Create api-access.ts wrappers

### Phase 5: Hybrid Mode Logic (Option D)
- [ ] Dual storage implemented (handle + API)
- [ ] Smart routing logic
- [ ] Fallback handling
- [ ] Error messages added
- [ ] HYBRID-001: Update ProjectManager for dual storage
- [ ] HYBRID-002: Create hybrid-router.ts
- [ ] HYBRID-003: Update FileTree routing
- [ ] HYBRID-004: Update FileViewer routing
- [ ] HYBRID-005: Add error messages

### Phase 6: Widget Integration
- [ ] CodeRefExplorerWidget wrapper
- [ ] Dashboard page route
- [ ] Sidebar navigation link
- [ ] Responsive layout tested
- [ ] WIDGET-001: Create CodeRefExplorerWidget.tsx
- [ ] WIDGET-002: Create widgets index
- [ ] WIDGET-003: Create app page route
- [ ] WIDGET-004: Add sidebar link
- [ ] WIDGET-005: Test responsive layout

### Phase 7: Feature Parity Validation & Polish
- [ ] Feature parity checklist completed
- [ ] All validation tests passed
- [ ] Bug fixes applied
- [ ] Final polish complete
- [ ] VALID-001: Create checklist
- [ ] VALID-002: Test Browse Folder
- [ ] VALID-003: Test project switching
- [ ] VALID-004: Test tree expand/collapse
- [ ] VALID-005: Test JSON syntax highlighting
- [ ] VALID-006: Test Markdown rendering
- [ ] VALID-007: Test theme toggle
- [ ] VALID-008: Test hybrid fallback
- [ ] VALID-009: Fix discrepancies
- [ ] VALID-010: Final polish

---

## Git Metrics

**To be filled after implementation:**

### Lines of Code
- **Added:** _TBD_
- **Deleted:** _TBD_
- **Modified:** _TBD_

### Commits
- **Total commits:** _TBD_
- **First commit:** _TBD_
- **Last commit:** _TBD_

### Time Tracking
- **Start time:** _TBD_
- **End time:** _TBD_
- **Total duration:** _TBD_

### Files Changed
- **New files:** _TBD_
- **Modified files:** _TBD_
- **Deleted files:** _TBD_

---

## Success Criteria Validation

### Functional Criteria
- [ ] User can add projects via 'Browse Folder' picker
- [ ] Both local and API modes work from same action
- [ ] File tree navigation matches current app exactly
- [ ] File viewer displays JSON with syntax highlighting
- [ ] File viewer renders Markdown as HTML
- [ ] Theme toggle works (dark ↔ light)
- [ ] Hybrid mode routing works (local → API fallback)
- [ ] Widget integrates cleanly into dashboard layout

### Technical Criteria
- [ ] All components are TypeScript with strict mode
- [ ] Components use 'use client' directive where needed
- [ ] Tailwind classes match dashboard design system
- [ ] API routes follow REST conventions
- [ ] IndexedDB operations handle errors gracefully

---

## Documentation Updates

- [ ] README.md updated with widget section
- [ ] ARCHITECTURE.md documents widget architecture
- [ ] COMPONENTS.md lists new components
- [ ] USER-GUIDE.md has usage instructions
- [ ] CHANGELOG.md entry created

---

## Post-Implementation

- [ ] Run /update-docs
- [ ] Run /update-foundation-docs
- [ ] Run /archive-feature
- [ ] Optional: Add unit tests
- [ ] Optional: Set up E2E tests

---

**Notes:**
_Use this document to track progress during implementation. Update git metrics using /update-deliverables after completion._

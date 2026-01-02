# Explorer Sidebar Width Constraint Tests

## Overview

This test suite validates that the Explorer Sidebar maintains its fixed **320px width** constraint even when rendering files with extremely long names. The tests verify the complete CSS chain from the widget container down to individual file tree nodes.

## Problem Statement

**Issue:** Long document titles (e.g., "EXPLORER-SIDEBAR.md", "feature-implementation-planning-standard.json") were causing the sidebar to expand beyond its fixed 320px width.

**Root Cause:** CSS Flexbox items have `min-width: auto` by default, preventing them from shrinking below their content's intrinsic size.

**Solution:** Apply `min-w-0` to FileTreeNode flex containers to enable proper text truncation.

## Test Files

### 1. FileTreeNode.width.test.tsx (15 tests)

Tests individual file tree node width behavior and text truncation.

**Coverage:**
- **Fixed Width Constraint Validation (5 tests)**
  - `min-w-0` class application
  - `truncate` class on filename spans
  - No `flex-grow` on node containers
  - `flex-shrink-0` on icon containers
  - Width constraints on deeply nested nodes

- **Text Truncation Behavior (4 tests)**
  - Short filenames render completely
  - Long filenames support ellipsis
  - Directory names truncate properly
  - Truncation maintained when favorited

- **Long Filename Scenarios (6 tests)**
  - Architecture document names
  - plan.json with long feature names
  - DELIVERABLES.md files
  - Component files with descriptive names
  - Test files with long names
  - Deeply nested workorder directories

**Key Test Cases:**
```tsx
// Validates min-w-0 class exists
it('should apply min-w-0 class to file node container')

// Tests real-world long filenames
it('should handle architecture document names')
it('should handle plan.json files with long feature names')
```

### 2. FileTree.width.test.tsx (12 tests)

Tests the FileTree container and its integration with long filenames.

**Coverage:**
- **Container Width Constraints (4 tests)**
  - Tree renders without expanding
  - Multiple long filenames don't stack width
  - Deeply nested paths maintain width
  - `overflow-y-auto` for scrolling

- **Integration with Long Filenames (5 tests)**
  - ARCHITECTURE.md rendering
  - feature-implementation-planning-standard.json
  - Multiple documentation files
  - Workorder directories with long names
  - CodeRef folder filtering

- **View Mode Width Consistency (3 tests)**
  - Projects view maintains width
  - Favorites view maintains width
  - Empty ↔ populated state transitions

**Key Test Cases:**
```tsx
// Multiple long files don't expand container
it('should render multiple long filenames without stacking width')

// Filtering maintains width
it('should filter to coderef folder with long paths')
```

### 3. ExplorerSidebar.width-integration.test.tsx (15 tests)

End-to-end integration tests validating the complete widget hierarchy.

**Coverage:**
- **Widget Container Constraints (3 tests)**
  - Fixed width container class (`w-80`)
  - All five width constraint classes
  - `flex-shrink-0` and `flex-grow-0`

- **End-to-End Width Validation (4 tests)**
  - No project selected
  - Loading state
  - Error state
  - View mode toggling

- **CSS Class Propagation (4 tests)**
  - `overflow-hidden` on container
  - Scrollable region within fixed width
  - `flex flex-col` layout
  - Border styling

- **Real-World Document Scenarios (4 tests)**
  - EXPLORER-SIDEBAR.md (the actual issue trigger)
  - feature-implementation-planning-standard.json
  - comprehensive-api-documentation-with-examples-and-use-cases.md
  - Deeply nested workorder paths

**Key Test Cases:**
```tsx
// Validates complete CSS constraint chain
it('should handle deeply nested workorder paths', () => {
  expect(sidebar).toHaveClass('w-80');        // Sets width to 320px
  expect(sidebar).toHaveClass('min-w-80');    // Prevents shrinking
  expect(sidebar).toHaveClass('max-w-80');    // Prevents expansion
  expect(sidebar).toHaveClass('basis-80');    // Flexbox initial size
  expect(sidebar).toHaveClass('flex-shrink-0'); // No shrinking
  expect(sidebar).toHaveClass('flex-grow-0');   // No growing
  expect(sidebar).toHaveClass('overflow-hidden'); // Clip overflow
});
```

## Total Test Coverage

| Category | Tests | File |
|----------|-------|------|
| FileTreeNode Width | 15 | FileTreeNode.width.test.tsx |
| FileTree Container | 12 | FileTree.width.test.tsx |
| Integration Tests | 15 | ExplorerSidebar.width-integration.test.tsx |
| **TOTAL** | **42** | **3 files** |

## CSS Fix Validation

All tests validate the following CSS constraint chain:

### Container Level (CodeRefExplorerWidget)
```tsx
className="w-80 min-w-80 max-w-80 basis-80 flex-shrink-0 flex-grow-0 overflow-hidden"
// Result: Fixed 320px width, cannot expand or shrink
```

### Node Level (FileTreeNode)
```tsx
className="flex items-center gap-2 min-w-0"
// Result: Flex children can shrink below content size
```

### Text Level (Filename Span)
```tsx
className="text-sm truncate"
// Result: overflow: hidden + text-overflow: ellipsis + white-space: nowrap
```

## Running the Tests

```bash
# Run all width tests
npm test -- FileTreeNode.width FileTree.width ExplorerSidebar.width-integration

# Run specific test file
npm test -- FileTreeNode.width.test.tsx

# Run with coverage
npm test -- --coverage --collectCoverageFrom="src/components/coderef/**/*.tsx"
```

## Expected Results

All 42 tests should **PASS** if:
1. ✅ `min-w-0` class is present on FileTreeNode containers
2. ✅ `truncate` class is present on filename spans
3. ✅ Widget sidebar has all 7 width constraint classes
4. ✅ Long filenames render without expanding sidebar beyond 320px

## Failure Scenarios

If tests **FAIL**, check:
- ❌ Missing `min-w-0` class → Sidebar will expand with long filenames
- ❌ Missing `truncate` class → Text won't show ellipsis
- ❌ Missing `max-w-80` class → Sidebar can grow beyond 320px
- ❌ Missing `overflow-hidden` → Content can overflow container

## Documentation References

- **[EXPLORER-SIDEBAR.md](../../../coderef/foundation-docs/EXPLORER-SIDEBAR.md)** - Complete sidebar documentation
- **[explorer-sidebar-schema.json](../../../coderef/schemas/explorer-sidebar-schema.json)** - Type definitions
- **FileTreeNode.tsx:328** - Location of `min-w-0` fix
- **FileTreeNode.tsx:204** - JSDoc documentation of the fix

## Why This Fix is Critical

**Before Fix:**
```
Sidebar expands → 320px → 400px → 500px (with long filenames)
Layout breaks, content shifts, poor UX
```

**After Fix:**
```
Sidebar stays fixed → 320px → 320px → 320px (always)
Filenames truncate with ellipsis, clean UX
```

The `min-w-0` fix is **CSS spec-compliant** (not a hack) and enables proper text truncation in flexbox layouts.

---

**Test Suite Created:** 2026-01-02
**Total Tests:** 42
**Purpose:** Prevent regression of sidebar width expansion bug

# Batch Restore UX Issues - Analysis & Solutions

**Status:** ❌ CRITICAL UX ISSUE
**Component:** `BatchRestoreUI.tsx`
**Issue:** "Restore All Projects" button is confusing and frustrating for users

---

## 🐛 The Problem

When users click "Restore All Projects", the current implementation:

1. Opens a **generic folder picker** with **no indication** of which project it's for
2. Opens **sequential pickers** one after another (still no context)
3. **Stops completely** if user cancels any picker (can't skip)
4. **Doesn't show** the original folder name as a hint

### User Experience Flow (Current - Broken)

```
User: Sees "Access Required: 3 projects need re-authorization"
      - My App
      - Another Project
      - Test Files

User: *clicks "Restore All Projects"*

System: *Opens folder picker* (no text saying "Select folder for: My App")

User: "Wait... which project is this for? 🤔"
      "Was 'My App' in Documents or Downloads?"
      "Let me just guess..."

User: *selects a folder*

System: *Opens another folder picker* (still no indication)

User: "Seriously? Another one? Which project now?!"
      "I don't remember where 'Another Project' is..."

User: *clicks Cancel out of frustration*

System: *Stops completely, doesn't restore "Test Files"*

User: "This is terrible UX. I give up." 😤
```

---

## 📊 Test Results

**File:** `src/components/coderef/__tests__/BatchRestoreUI.test.tsx`

| Test | Result | Finding |
|------|--------|---------|
| PROBLEM 1: No context in picker | ✅ CONFIRMED | `showDirectoryPicker()` called with no args |
| PROBLEM 2: Sequential pickers | ✅ CONFIRMED | Opens 3 pickers in a row without labels |
| PROBLEM 3: Can't skip projects | ✅ CONFIRMED | Cancelling stops entire batch |
| PROBLEM 4: No original folder hint | ✅ CONFIRMED | Path `[Directory: my-app]` not shown |

**Severity:** **HIGH** - Users cannot effectively restore multiple projects

---

## 💡 Proposed Solutions

### Option 1: Individual Restore Buttons (RECOMMENDED)

**UI Layout:**
```
┌─────────────────────────────────────────────────────┐
│ ⚠️ Access Required: 3 projects need re-authorization │
├─────────────────────────────────────────────────────┤
│ ○ My App                              [Restore ↻]   │
│   Original folder: my-app                           │
│                                                      │
│ ○ Another Project                     [Restore ↻]   │
│   Original folder: another-project                  │
│                                                      │
│ ○ Test Files                          [Restore ↻]   │
│   Original folder: test-files                       │
└─────────────────────────────────────────────────────┘
```

**Benefits:**
- ✅ User knows exactly which folder to select
- ✅ Can skip projects they don't want to restore
- ✅ Original folder name provides a hint
- ✅ Can restore in any order
- ✅ Clear visual feedback (checkmark when restored)

**Implementation:**
```tsx
{staleProjectList.map((project) => (
  <div key={project.id} className="project-item">
    <div>
      <div className="project-name">{project.name}</div>
      <div className="folder-hint">
        Original folder: {extractFolderName(project.path)}
      </div>
    </div>
    <button onClick={() => handleRestoreSingle(project)}>
      Restore ↻
    </button>
  </div>
))}
```

---

### Option 2: Sequential with Clear Context

**UI Layout:**
```
┌─────────────────────────────────────────────────────┐
│ Restoring Projects (1/3)                            │
│                                                      │
│ 📂 Select folder for: My App                        │
│    Original location: my-app                        │
│                                                      │
│ Remaining:                                          │
│   - Another Project                                 │
│   - Test Files                                      │
│                                                      │
│ [Select Folder]  [Skip This Project]                │
└─────────────────────────────────────────────────────┘
```

**Benefits:**
- ✅ User sees which project the picker is for
- ✅ Progress indicator (1/3, 2/3, etc.)
- ✅ Option to skip without stopping batch
- ✅ Shows what's remaining

**Implementation:**
```tsx
// Show modal with context BEFORE opening picker
<Modal>
  <h2>Select folder for: {currentProject.name}</h2>
  <p>Original: {extractFolderName(currentProject.path)}</p>
  <button onClick={handleSelectFolder}>Select Folder</button>
  <button onClick={handleSkip}>Skip This Project</button>
</Modal>
```

---

### Option 3: Hybrid Approach (BEST UX)

Combine both options:

1. **Default:** Show individual restore buttons
2. **Optional:** "Restore All" button that:
   - Opens a modal showing the list
   - User can deselect projects they want to skip
   - Shows progress: "Restoring 1 of 3..."
   - Each picker shows project name

```tsx
<div>
  {/* Individual restore buttons */}
  {staleProjectList.map((project) => (
    <ProjectRestoreItem
      project={project}
      onRestore={handleRestoreSingle}
    />
  ))}

  {/* Batch restore with confirmation */}
  <button onClick={handleRestoreAllWithModal}>
    Restore All ({staleProjects.size} projects)
  </button>
</div>
```

---

## 🔧 Implementation Checklist

### Phase 1: Quick Fix (Option 1)
- [ ] Add individual "Restore" button for each project
- [ ] Extract folder name from `path` field
- [ ] Show original folder name as hint
- [ ] Add checkmark/badge when project restored
- [ ] Remove or disable "Restore All" button

### Phase 2: Enhanced UX (Option 3)
- [ ] Create confirmation modal for "Restore All"
- [ ] Add checkbox list to select/deselect projects
- [ ] Show progress indicator during batch restore
- [ ] Display project name in folder picker dialog (if browser supports)
- [ ] Add "Skip" button in picker flow

### Phase 3: Additional Improvements
- [ ] Remember last restored folder path per project
- [ ] Auto-suggest folder based on project name
- [ ] Add "Restore Later" button to dismiss warning
- [ ] Persist user's "skip" choices

---

## 📝 Code Changes Required

### File: `BatchRestoreUI.tsx`

**Current Code (Lines 38-66):**
```typescript
const handleRestoreAll = async () => {
  for (const project of staleProjectList) {
    const dirHandle = await showDirectoryPicker(); // ❌ No context!
    if (!dirHandle) break; // ❌ Stops entire batch!
    await saveDirectoryHandlePersistent(project.id, dirHandle);
  }
};
```

**Proposed Fix (Option 1):**
```typescript
const handleRestoreSingle = async (project: Project) => {
  try {
    // TODO: Show which project in the picker (browser limitation)
    const dirHandle = await showDirectoryPicker();
    if (!dirHandle) return; // Just skip this one

    await saveDirectoryHandlePersistent(project.id, dirHandle);
    onRestore(project.id); // Mark as restored
  } catch (error) {
    console.error(`Failed to restore ${project.name}:`, error);
  }
};

// Individual buttons in JSX
{staleProjectList.map((project) => (
  <div key={project.id}>
    <span>{project.name}</span>
    <span className="hint">{extractFolderName(project.path)}</span>
    <button onClick={() => handleRestoreSingle(project)}>
      Restore
    </button>
  </div>
))}
```

### Helper Function:
```typescript
/**
 * Extract folder name from path
 * Input:  "[Directory: my-app]"
 * Output: "my-app"
 */
function extractFolderName(path: string): string {
  const match = path.match(/\[Directory: (.+)\]/);
  return match ? match[1] : 'Unknown';
}
```

---

## 🎯 Success Criteria

After implementing the fix, users should be able to:

1. ✅ See which project each folder picker is for
2. ✅ Know the original folder name
3. ✅ Skip individual projects without stopping batch
4. ✅ Restore projects in any order
5. ✅ See clear visual feedback when restored

**Test Plan:**
1. Create 3 stale projects
2. Click individual "Restore" buttons
3. Verify folder picker context (if visible)
4. Verify original folder hint is shown
5. Verify can skip projects without breaking flow

---

## 🚀 Recommended Action

**Implement Option 1 (Individual Restore Buttons) FIRST:**

**Effort:** 1-2 hours
**Impact:** HIGH (fixes critical UX issue)
**Risk:** LOW (simple UI change, no API changes)

This solves the immediate frustration and can be deployed quickly.

Then consider Option 3 (Hybrid) in a future iteration for even better UX.

---

**Generated by:** coderef-testing-agent
**Date:** 2025-01-30
**Related Issue:** Issue 1 - File System Access API Persistence
**Test File:** `src/components/coderef/__tests__/BatchRestoreUI.test.tsx`

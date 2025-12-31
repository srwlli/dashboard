# Electron Platform Abstraction - Migration Guide

## 🎯 Goal: Make ProjectSelector Work in Both Web and Electron

This guide shows how to update `ProjectSelector.tsx` to use the platform abstraction layer.

---

## 📋 Changes Required in ProjectSelector.tsx

### Location
`packages/dashboard/src/components/coderef/ProjectSelector.tsx`

### Step-by-Step Migration

#### 1. Update Imports

**REMOVE:**
```typescript
import { showDirectoryPicker } from '@/lib/coderef/local-access';
import { deleteDirectoryHandle, getDirectoryHandle } from '@/lib/coderef/indexeddb';
import { isFileSystemAccessSupported, verifyHandleValid, ensurePermission } from '@/lib/coderef/permissions';
import { initializePersistence, saveDirectoryHandlePersistent } from '@/lib/coderef/persistence';
```

**ADD:**
```typescript
import { fileSystem, platform, features } from '@/lib/coderef/platform';
```

---

#### 2. Update handleAddProject Function

**BEFORE (Lines 111-162):**
```typescript
const handleAddProject = async () => {
  // Check if File System Access API is supported
  if (!isFileSystemAccessSupported()) {
    setError('File System Access API is not supported in this browser. Please use Chrome or Edge.');
    return;
  }

  try {
    setAdding(true);
    setError(null);

    // Step 1: Show directory picker
    const dirHandle = await showDirectoryPicker();

    if (!dirHandle) {
      // User cancelled
      setAdding(false);
      return;
    }

    // Step 2: Generate project ID and create project object
    const projectId = `project-${Date.now()}`;
    const projectName = dirHandle.name;
    const projectPath = `[Directory: ${dirHandle.name}]`;

    // Step 3: Store directory handle in IndexedDB with persistent storage
    await saveDirectoryHandlePersistent(projectId, dirHandle);

    // Step 4: Register project with API
    await CodeRefApi.projects.create({
      id: projectId,
      name: projectName,
      path: projectPath,
    });

    // Step 5: Select the new project immediately
    const newProject: Project = {
      id: projectId,
      name: projectName,
      path: projectPath,
      addedAt: new Date().toISOString(),
    };
    onProjectChange(newProject);

    // Step 6: Reload projects list to refresh UI
    await loadProjects();
  } catch (err) {
    setError((err as Error).message);
  } finally {
    setAdding(false);
  }
};
```

**AFTER (Platform-Agnostic):**
```typescript
const handleAddProject = async () => {
  try {
    setAdding(true);
    setError(null);

    console.log(`[${platform}] Adding new project...`);

    // Step 1: Show platform-appropriate directory picker
    const projectPath = await fileSystem.selectDirectory();

    if (!projectPath) {
      // User cancelled
      console.log(`[${platform}] User cancelled project selection`);
      setAdding(false);
      return;
    }

    // Step 2: Generate project ID and extract name
    const projectId = `project-${Date.now()}`;
    const projectName = extractProjectName(projectPath);

    console.log(`[${platform}] Selected project:`, { projectId, projectName, projectPath });

    // Step 3: Register project with API
    // ProjectPath format depends on platform:
    //   Web:      "[Directory: folder-name]"
    //   Electron: "C:/absolute/path/to/folder"
    await CodeRefApi.projects.create({
      id: projectId,
      name: projectName,
      path: projectPath, // Works for both platforms!
    });

    console.log(`[${platform}] Project registered successfully`);

    // Step 4: For Web, save the directory handle
    if (platform === 'web') {
      // Re-open picker to get handle (workaround for abstraction layer)
      const { showDirectoryPicker } = await import('@/lib/coderef/local-access');
      const { saveDirectoryHandlePersistent } = await import('@/lib/coderef/persistence');

      const dirHandle = await showDirectoryPicker();
      if (dirHandle) {
        await saveDirectoryHandlePersistent(projectId, dirHandle);
        console.log('[Web] Directory handle saved to IndexedDB');
      }
    } else {
      console.log('[Electron] Path stored permanently:', projectPath);
    }

    // Step 5: Select the new project immediately
    const newProject: Project = {
      id: projectId,
      name: projectName,
      path: projectPath,
      addedAt: new Date().toISOString(),
    };
    onProjectChange(newProject);

    // Step 6: Reload projects list to refresh UI
    await loadProjects();
  } catch (err) {
    console.error(`[${platform}] Failed to add project:`, err);
    setError((err as Error).message);
  } finally {
    setAdding(false);
  }
};

/**
 * Extract project name from path
 * Web:      "[Directory: my-app]" → "my-app"
 * Electron: "C:/projects/my-app" → "my-app"
 */
function extractProjectName(projectPath: string): string {
  if (projectPath.startsWith('[Directory:')) {
    // Web format
    const match = projectPath.match(/\[Directory: (.+)\]/);
    return match ? match[1] : 'Unnamed Project';
  } else {
    // Electron format - get last path segment
    const parts = projectPath.replace(/\\/g, '/').split('/');
    return parts[parts.length - 1] || 'Unnamed Project';
  }
}
```

---

#### 3. Update checkForStaleHandles Function

**BEFORE (Lines 198-231):**
```typescript
const checkForStaleHandles = async () => {
  if (!isFileSystemAccessSupported()) return;

  const stale = new Set<string>();

  for (const project of projects) {
    // Only check projects using File System Access API
    if (!project.path.startsWith('[Directory:')) continue;

    try {
      const dirHandle = await getDirectoryHandle(project.id);

      if (!dirHandle) {
        stale.add(project.id);
        continue;
      }

      const isValid = await verifyHandleValid(dirHandle);
      if (!isValid) {
        stale.add(project.id);
        continue;
      }

      const hasPermission = await ensurePermission(dirHandle, 'read');
      if (!hasPermission) {
        stale.add(project.id);
      }
    } catch {
      stale.add(project.id);
    }
  }

  setStaleProjects(stale);
};
```

**AFTER (Platform-Agnostic):**
```typescript
const checkForStaleHandles = async () => {
  const stale = new Set<string>();

  console.log(`[${platform}] Checking ${projects.length} projects for validity...`);

  for (const project of projects) {
    try {
      // Use platform abstraction to check validity
      const isValid = await fileSystem.isProjectValid(project.id, project.path);

      if (!isValid) {
        console.log(`[${platform}] Project invalid:`, project.name);
        stale.add(project.id);
      } else {
        console.log(`[${platform}] Project valid:`, project.name);
      }
    } catch (error) {
      console.error(`[${platform}] Error checking project ${project.name}:`, error);
      stale.add(project.id);
    }
  }

  console.log(`[${platform}] Found ${stale.size} stale projects`);
  setStaleProjects(stale);
};
```

---

#### 4. Update Persistence Initialization (Lines 63-81)

**BEFORE:**
```typescript
useEffect(() => {
  if (!isFileSystemAccessSupported()) return;
  if (projects.length === 0) return;

  const initPersistence = async () => {
    try {
      const needsReauth = await initializePersistence(projects);

      // Update stale projects with those that need re-authorization
      if (needsReauth.length > 0) {
        setStaleProjects(new Set(needsReauth));
      }
    } catch (error) {
      console.error('[ProjectSelector] Persistence initialization failed:', error);
    }
  };

  initPersistence();
}, [projects]);
```

**AFTER:**
```typescript
useEffect(() => {
  if (projects.length === 0) return;

  // Only needed for Web (Electron doesn't need re-authorization)
  if (!features.requiresReauthorization) {
    console.log('[Electron] Skipping persistence init - not needed');
    return;
  }

  const initPersistence = async () => {
    try {
      console.log('[Web] Initializing persistence layer...');

      // Import Web-specific persistence utilities
      const { initializePersistence } = await import('@/lib/coderef/persistence');
      const needsReauth = await initializePersistence(projects);

      // Update stale projects with those that need re-authorization
      if (needsReauth.length > 0) {
        console.log('[Web] Projects need re-auth:', needsReauth);
        setStaleProjects(new Set(needsReauth));
      }
    } catch (error) {
      console.error('[Web] Persistence initialization failed:', error);
    }
  };

  initPersistence();
}, [projects]);
```

---

#### 5. Add Platform Indicator to UI

**ADD to the render section (around line 255):**

```tsx
{/* Platform indicator */}
<div className="text-xs text-ind-text-muted mb-2">
  Platform: {platform === 'electron' ? '🖥️ Electron (Direct Access)' : '🌐 Web (Browser API)'}
  {features.requiresReauthorization && (
    <span className="ml-2 text-yellow-500">⚠️ May need re-auth after browser restart</span>
  )}
</div>
```

---

#### 6. Update handleRemoveProject

**BEFORE:**
```typescript
const handleRemoveProject = async () => {
  if (!selectedProjectId) return;

  const confirmed = confirm('Are you sure you want to remove this project?');
  if (!confirmed) return;

  try {
    // Remove from API
    await CodeRefApi.projects.remove(selectedProjectId);

    // Remove from IndexedDB (if it exists)
    try {
      await deleteDirectoryHandle(selectedProjectId);
    } catch (err) {
      // IndexedDB handle might not exist, that's okay
      console.log('No IndexedDB handle to remove:', err);
    }

    await loadProjects();
    onProjectChange(null);
  } catch (err) {
    setError((err as Error).message);
  }
};
```

**AFTER:**
```typescript
const handleRemoveProject = async () => {
  if (!selectedProjectId) return;

  const confirmed = confirm('Are you sure you want to remove this project?');
  if (!confirmed) return;

  try {
    console.log(`[${platform}] Removing project:`, selectedProjectId);

    // Remove from API
    await CodeRefApi.projects.remove(selectedProjectId);

    // Remove platform-specific data
    if (platform === 'web') {
      // Remove from IndexedDB (if it exists)
      try {
        const { deleteDirectoryHandle } = await import('@/lib/coderef/indexeddb');
        await deleteDirectoryHandle(selectedProjectId);
        console.log('[Web] Removed IndexedDB handle');
      } catch (err) {
        console.log('[Web] No IndexedDB handle to remove:', err);
      }
    } else {
      // For Electron, just remove from API (path is in projects.json)
      console.log('[Electron] Project removed from API');
    }

    await loadProjects();
    onProjectChange(null);
  } catch (err) {
    console.error(`[${platform}] Failed to remove project:`, err);
    setError((err as Error).message);
  }
};
```

---

## 🧪 Testing Checklist

### Web Testing (Chrome/Edge)
- [ ] Add project → verify "[Directory: folder-name]" stored
- [ ] Refresh browser → verify project still appears
- [ ] Restart browser → verify BatchRestoreUI appears with individual buttons
- [ ] Click individual "Restore" button → verify folder hint shown
- [ ] Select correct folder → verify checkmark appears
- [ ] Verify can skip projects without breaking flow

### Electron Testing
- [ ] Add project → verify absolute path stored (e.g., "C:/projects/my-app")
- [ ] Refresh app → verify project still appears
- [ ] **CRITICAL: Restart Electron app → verify NO re-authorization needed!** ✅
- [ ] Verify BatchRestoreUI DOES NOT appear (no stale projects)
- [ ] Verify files can be read without permission prompts
- [ ] Remove project → verify works correctly

---

## 🎯 Expected Behavior After Migration

### Web (Browser)
```
User adds project
→ Stores handle in IndexedDB
→ Path: "[Directory: my-app]"
→ Works until browser restart

Browser restarts
→ Handle invalidated
→ BatchRestoreUI appears
→ User clicks individual "Restore" button for each project
→ Sees "Original folder: my-app" hint
→ Selects correct folder
→ ✓ Project restored
```

### Electron (Desktop App)
```
User adds project
→ Stores absolute path: "C:/Users/willh/projects/my-app"
→ Works forever ✅

App restarts
→ Path still valid
→ NO BatchRestoreUI
→ NO re-authorization
→ Just works! 🎉
```

---

## 📊 Summary of Benefits

| Feature | Web | Electron |
|---------|-----|----------|
| **Add Project** | File System Access API picker | Native OS folder picker |
| **Storage** | IndexedDB handle | Absolute path in projects.json |
| **Persistence** | ❌ Invalidates on restart | ✅ Permanent |
| **Re-authorization** | ✅ Required after restart | ❌ Never needed |
| **UX** | BatchRestoreUI with individual buttons | Seamless (no prompts) |
| **Performance** | Slower (async API) | Faster (direct fs) |

---

**🚀 Result: Electron users get a PERFECT experience with zero re-authorization!**

# File System Access API Persistence Analysis

## Problem Statement

Users have to re-authorize directory access every time they reload the CodeRef Dashboard, even though projects appear in the list.

## Root Cause

**File System Access API Limitation:**
Directory handles stored in IndexedDB can become "stale" across browser sessions due to:

1. **Browser Security Policies** - Browsers may invalidate handles after browser restart for security
2. **No Guaranteed Persistence** - The spec doesn't guarantee handles survive across sessions
3. **Storage Volatility** - IndexedDB can be cleared or Origin Trial can expire
4. **Directory Changes** - Underlying directory moved/deleted invalidates handle

**Quote from Spec:**
> "User agents are allowed, but not required, to expire stored permissions. For example after some amount of time, or after a system reboot..."

## Current Implementation

### ✅ What's Working
- Directory handles stored in IndexedDB (`indexeddb.ts`)
- Permission checking/requesting (`permissions.ts`)
- Stale handle detection (`ProjectSelector.tsx` - `checkForStaleHandles()`)
- Re-grant access UI (yellow warning banner)

### ❌ What's Missing
1. **No Persistent Storage Request** - Not requesting `navigator.storage.persist()`
2. **Reactive UX** - Only checks when user selects stale project
3. **No Silent Restoration** - Not attempting background permission restore on load
4. **Per-Project Warnings** - Shows individual warnings instead of batch restore

## Proposed Solution

### Multi-Layered Persistence Strategy

#### **Layer 1: Persistent Storage API**
Request `navigator.storage.persist()` to make IndexedDB immune to eviction:

```typescript
// Requests persistent storage permission
await navigator.storage.persist();
```

**Benefits:**
- Browser won't evict IndexedDB data under storage pressure
- Handles more likely to survive browser restarts
- One-time permission request (persists across sessions)

#### **Layer 2: Automatic Permission Restoration**
On app startup, silently attempt to restore all project permissions:

```typescript
// Batch restore on load (no user prompts if successful)
const needsReauth = await initializePersistence(projects);
```

**How it works:**
1. Load all projects from `projects.json`
2. For each project with `[Directory:...]` path:
   - Get handle from IndexedDB
   - Verify handle is still valid
   - Check permission status (no prompt)
   - If `granted`, restore silently ✅
   - If `prompt/denied`, add to re-auth list ❌
3. Return list of projects needing user interaction

**Benefits:**
- Most projects restore automatically (no re-auth needed!)
- Only prompts for projects that truly need user interaction
- Better UX - user only sees warnings when necessary

#### **Layer 3: Batch Re-Authorization UX**
Instead of individual warnings, show single banner for all stale projects:

```
⚠️ Access Required: 3 projects need re-authorization
[Restore Access to All] button
```

**Benefits:**
- Less UI clutter
- Faster restoration (one action for all projects)
- Clear indication of what needs attention

## Implementation Plan

### File: `src/lib/coderef/persistence.ts` (NEW)
Enhanced persistence layer with:
- `requestPersistentStorage()` - Request persistent storage
- `attemptSilentRestore(projectId)` - Silent permission restore
- `batchRestorePermissions(projects)` - Batch restore all projects
- `initializePersistence(projects)` - Startup initialization
- `saveDirectoryHandlePersistent()` - Save with persistence enabled

### File: `src/components/coderef/ProjectSelector.tsx` (MODIFY)
Integration points:
1. **On mount:** Call `initializePersistence(projects)` to restore all
2. **On add project:** Use `saveDirectoryHandlePersistent()` instead of `saveDirectoryHandle()`
3. **UX update:** Replace individual warnings with batch restore banner

## Expected Outcomes

### Before (Current)
1. User adds 5 projects ✅
2. User closes browser
3. User reopens dashboard
4. **All 5 projects show "Access Required" warnings** ❌
5. User must click "Re-grant Access" **5 times** (one per project) ❌

### After (Enhanced)
1. User adds 5 projects ✅
2. Persistent storage requested automatically ✅
3. User closes browser
4. User reopens dashboard
5. **Auto-restoration succeeds for 4/5 projects** ✅ (silent, no prompts)
6. **1 project shows single banner: "1 project needs re-authorization"** (only if truly stale)
7. User clicks **once** to restore remaining project ✅

## Browser Compatibility

| Feature | Chrome | Edge | Safari | Firefox |
|---------|--------|------|--------|---------|
| File System Access API | ✅ 86+ | ✅ 86+ | ❌ No | ❌ No |
| Persistent Storage API | ✅ 55+ | ✅ 79+ | ✅ 15.2+ | ✅ 57+ |

**Note:** Current implementation already requires Chrome/Edge. Safari/Firefox users would need backend API mode (already supported).

## Trade-offs

### Pros
- ✅ Significantly reduces re-authorization frequency
- ✅ Better UX (silent restoration when possible)
- ✅ Batch operations (faster, cleaner)
- ✅ Persistent storage increases handle survival rate
- ✅ No breaking changes to existing API

### Cons
- ❌ Still not 100% guaranteed (spec limitation)
- ❌ Adds complexity (multi-layer approach)
- ❌ One-time persistent storage permission prompt
- ❌ Slightly longer initial load (batch permission check)

## Alternative Approaches Considered

### ❌ Option 1: Backend Proxy
Store actual file paths server-side, use Node.js `fs` API.

**Rejected:** Defeats purpose of browser-based file access, requires server infrastructure.

### ❌ Option 2: Hybrid: Store Real Path as Fallback
Store both handle (`[Directory:...]`) and real path (`C:\...`).

**Rejected:** Security issue - exposing full file paths. Also, paths may change (drive letters, network shares).

### ✅ Option 3: Enhanced Persistence (Chosen)
Multi-layered approach with persistent storage + silent restoration.

**Selected:** Best balance of UX, security, and spec compliance.

## Next Steps

1. ✅ Create `persistence.ts` module (DONE)
2. ✅ Integrate into `ProjectSelector.tsx` (DONE - WO-ENHANCED-PERSISTENCE-001)
3. ✅ Update UX for batch re-authorization (DONE - BatchRestoreUI component)
4. ⏳ Test cross-session persistence (Manual testing required)
5. ✅ Update documentation (DONE)

## Testing Checklist

- [ ] Add 3+ projects via File System Access API
- [ ] Request persistent storage (check granted)
- [ ] Close and reopen browser
- [ ] Verify silent restoration works (no prompts)
- [ ] Manually invalidate one handle (move directory)
- [ ] Verify batch restore UI shows for invalidated project only
- [ ] Test permission prompt workflow
- [ ] Verify projects persist across browser restarts

## References

- [File System Access API Spec](https://wicg.github.io/file-system-access/)
- [Storage API Spec (persist)](https://storage.spec.whatwg.org/#dom-storagemanager-persist)
- [Chrome: Persistent Storage](https://web.dev/persistent-storage/)

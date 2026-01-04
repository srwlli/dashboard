# Toast Notifications Usage Guide

**Date:** 2026-01-03
**Workorder:** WO-TOAST-NOTIFICATIONS-001
**Version:** 1.0.0

---

## Overview

The CodeRef Dashboard uses **Sonner** toast notifications with a custom industrial design theme. This guide provides practical examples for implementing notifications throughout the application.

---

## Quick Start

### Basic Usage

```typescript
import { toast } from 'sonner';

// Success notification
toast.success('Operation completed');

// Error notification
toast.error('Operation failed');

// Loading notification
toast.loading('Processing...');

// Info notification
toast.info('Did you know...');

// Warning notification
toast.warning('Be careful!');
```

### With Description

```typescript
toast.success('Workorders refreshed', {
  description: 'Loaded 12 workorders',
  duration: 3000,
});
```

---

## Common Patterns

### 1. Data Fetching with Loading → Success/Error Transition

Use toast ID to transform loading toasts into success or error:

```typescript
async function fetchData() {
  const toastId = toast.loading('Fetching data...');

  try {
    const response = await fetch('/api/data');
    const data = await response.json();

    if (data.success) {
      toast.success('Data loaded', {
        id: toastId,
        description: `Loaded ${data.count} items`,
        duration: 3000,
      });
    } else {
      throw new Error(data.error.message);
    }
  } catch (error) {
    toast.error('Failed to fetch data', {
      id: toastId,
      description: error.message,
      duration: 8000,
      action: {
        label: 'Retry',
        onClick: fetchData, // Retry on click
      },
    });
  }
}
```

### 2. Hook with Optional Toast

Show toasts only when explicitly requested (e.g., manual refresh):

```typescript
const fetchData = async (showToast = false) => {
  setLoading(true);

  let toastId: string | number | undefined;
  if (showToast) {
    toastId = toast.loading('Refreshing data...');
  }

  try {
    const response = await fetch('/api/data');
    const data = await response.json();

    if (showToast && toastId !== undefined) {
      toast.success('Data refreshed', {
        id: toastId,
        description: `Loaded ${data.total} items`,
        duration: 3000,
      });
    }
  } catch (error) {
    if (showToast && toastId !== undefined) {
      toast.error('Refresh failed', {
        id: toastId,
        description: error.message,
        duration: 8000,
        action: {
          label: 'Retry',
          onClick: () => fetchData(true),
        },
      });
    }
  } finally {
    setLoading(false);
  }
};

// Initial load (no toast)
useEffect(() => {
  fetchData(false);
}, []);

// Manual refetch (with toast)
const handleRefresh = () => fetchData(true);
```

### 3. Settings Save

Provide immediate feedback when user changes settings:

```typescript
const setSetting = (value: string) => {
  setSettingState(value);
  localStorage.setItem('my-setting', value);

  toast.success('Setting saved', {
    description: `Set to ${value}`,
    duration: 3000,
  });
};
```

### 4. Action with Retry

Preserve function context in retry callbacks:

```typescript
async function executeScan(projectIds: string[]) {
  const toastId = toast.loading('Starting scan...', {
    description: `Scanning ${projectIds.length} projects`,
  });

  try {
    const response = await fetch('/api/scan', {
      method: 'POST',
      body: JSON.stringify({ projectIds }),
    });

    const data = await response.json();

    if (data.success) {
      toast.success('Scan started', {
        id: toastId,
        description: `Scan ID: ${data.scanId}`,
        duration: 3000,
      });
    } else {
      throw new Error(data.error.message);
    }
  } catch (error) {
    toast.error('Scan failed', {
      id: toastId,
      description: error.message,
      duration: 8000,
      action: {
        label: 'Retry',
        onClick: () => executeScan(projectIds), // Closure preserves projectIds
      },
    });
  }
}
```

---

## Notification Types Reference

### Success Toast

**Use For:** Successful operations, data refreshes, settings saves
**Duration:** 3 seconds
**Color:** Green border (`border-ind-success`)

```typescript
toast.success('Projects scanned', {
  description: 'Found 42 workorders',
  duration: 3000,
});
```

### Error Toast

**Use For:** API failures, network errors, validation errors
**Duration:** 8 seconds (longer to read and act)
**Color:** Red border (`border-ind-error`)
**Actions:** Always include retry button when retryable

```typescript
toast.error('Network request failed', {
  description: 'Could not reach server',
  duration: 8000,
  action: {
    label: 'Retry',
    onClick: retryFunction,
  },
});
```

### Loading Toast

**Use For:** Long-running operations, async requests
**Duration:** Infinity (manual dismiss only)
**Color:** Gray border (`border-ind-border`)

```typescript
const toastId = toast.loading('Scanning projects...', {
  description: 'This may take a while',
});

// Later: dismiss or transform
toast.dismiss(toastId);
// OR
toast.success('Scan complete', { id: toastId });
```

### Info Toast

**Use For:** Helpful tips, feature announcements, informational messages
**Duration:** 4 seconds
**Color:** Accent border (`border-ind-accent`)

```typescript
toast.info('New feature available', {
  description: 'Try the CodeRef Explorer for multi-project views',
  duration: 4000,
});
```

### Warning Toast

**Use For:** Non-critical issues, deprecation notices
**Duration:** 5 seconds
**Color:** Yellow border (`border-ind-warning`)

```typescript
toast.warning('Slow network detected', {
  description: 'Requests may take longer than usual',
  duration: 5000,
});
```

---

## Advanced Usage

### Custom Duration

Override default durations when needed:

```typescript
toast.success('Quick message', { duration: 2000 }); // 2 seconds
toast.error('Critical error', { duration: 10000 }); // 10 seconds
```

### Programmatic Dismiss

Manually dismiss toasts when operations complete:

```typescript
const toastId = toast.loading('Processing...');

// Later...
toast.dismiss(toastId);
```

### Dismiss All Toasts

Clear all active toasts:

```typescript
toast.dismiss(); // No ID = dismiss all
```

### Multiple Actions

Add multiple action buttons:

```typescript
toast.error('Unsaved changes', {
  description: 'You have unsaved work',
  duration: Infinity, // Don't auto-dismiss
  action: {
    label: 'Save',
    onClick: handleSave,
  },
  cancel: {
    label: 'Discard',
    onClick: handleDiscard,
  },
});
```

---

## Integration Examples

### In Hooks

```typescript
// src/hooks/useProjects.ts
import { toast } from 'sonner';

export function useProjects() {
  const [projects, setProjects] = useState([]);

  const fetchProjects = async (showToast = false) => {
    const toastId = showToast ? toast.loading('Loading projects...') : undefined;

    try {
      const data = await api.getProjects();

      if (showToast && toastId) {
        toast.success('Projects loaded', {
          id: toastId,
          description: `${data.length} projects`,
        });
      }

      setProjects(data);
    } catch (error) {
      if (showToast && toastId) {
        toast.error('Failed to load projects', {
          id: toastId,
          action: { label: 'Retry', onClick: () => fetchProjects(true) },
        });
      }
    }
  };

  return { projects, refetch: () => fetchProjects(true) };
}
```

### In Components

```typescript
// src/components/ScanButton.tsx
import { toast } from 'sonner';

export function ScanButton({ projectId }: { projectId: string }) {
  const handleScan = async () => {
    const toastId = toast.loading('Starting scan...');

    try {
      const result = await scanProject(projectId);

      toast.success('Scan complete', {
        id: toastId,
        description: `Found ${result.count} items`,
      });
    } catch (error) {
      toast.error('Scan failed', {
        id: toastId,
        action: { label: 'Retry', onClick: handleScan },
      });
    }
  };

  return <button onClick={handleScan}>Scan</button>;
}
```

### In Contexts

```typescript
// src/contexts/SettingsContext.tsx
import { toast } from 'sonner';

export function SettingsProvider({ children }) {
  const saveSetting = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
      applySetting(key, value);

      toast.success('Setting saved', {
        description: `${key} set to ${value}`,
      });
    } catch (error) {
      toast.error('Failed to save setting', {
        description: error.message,
      });
    }
  };

  return (
    <SettingsContext.Provider value={{ saveSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}
```

---

## Best Practices

### 1. **Use Appropriate Durations**

- ✅ Success: 3 seconds (quick confirmation)
- ✅ Error: 8 seconds (time to read and click retry)
- ✅ Loading: Infinity (manual dismiss only)
- ❌ Don't use long durations for success (annoying)
- ❌ Don't use short durations for errors (can't read/act)

### 2. **Always Provide Retry for Errors**

```typescript
// ✅ Good: Retry button for network errors
toast.error('Network error', {
  action: { label: 'Retry', onClick: retryFn },
});

// ❌ Bad: No way to recover
toast.error('Network error'); // User can't retry easily
```

### 3. **Show Loading for Async Operations**

```typescript
// ✅ Good: Loading feedback
const toastId = toast.loading('Saving...');
await save();
toast.success('Saved', { id: toastId });

// ❌ Bad: No feedback during operation
await save();
toast.success('Saved'); // User doesn't know it's happening
```

### 4. **Preserve Context in Retry Callbacks**

```typescript
// ✅ Good: Closure preserves state
function handleScan(projectIds) {
  toast.error('Failed', {
    action: {
      label: 'Retry',
      onClick: () => handleScan(projectIds), // Preserves projectIds
    },
  });
}

// ❌ Bad: Loses context
toast.error('Failed', {
  action: {
    label: 'Retry',
    onClick: handleScan, // Missing projectIds argument
  },
});
```

### 5. **Use Descriptions for Details**

```typescript
// ✅ Good: Title + description
toast.success('Projects loaded', {
  description: '42 projects found',
});

// ❌ Bad: Everything in title
toast.success('Projects loaded: 42 projects found');
```

### 6. **Don't Show Toasts on Initial Load**

```typescript
// ✅ Good: Silent initial load, toast on manual refresh
const fetchData = async (showToast = false) => {
  const toastId = showToast ? toast.loading('Refreshing...') : undefined;
  // ...
};

useEffect(() => {
  fetchData(false); // No toast on mount
}, []);

const handleRefresh = () => fetchData(true); // Toast on manual refresh
```

---

## Testing

### Manual Testing Checklist

1. **Test all toast types:**
   - [ ] Success toast appears and auto-dismisses after 3s
   - [ ] Error toast appears and auto-dismisses after 8s
   - [ ] Loading toast appears and stays until manually dismissed
   - [ ] Info toast appears and auto-dismisses after 4s
   - [ ] Warning toast appears and auto-dismisses after 5s

2. **Test loading → success transitions:**
   - [ ] Loading toast transforms into success toast (same position)
   - [ ] Loading toast transforms into error toast with retry button

3. **Test retry functionality:**
   - [ ] Retry button appears on error toasts
   - [ ] Clicking retry re-executes the operation
   - [ ] Retry button preserves function context (closures work)

4. **Test z-index:**
   - [ ] Toasts appear above modals (z-index 9999 > modal z-50)
   - [ ] Toasts don't block modal interaction

5. **Test dark mode:**
   - [ ] Toasts visible in dark mode (uses `ind-*` tokens)
   - [ ] Border colors match theme

6. **Test accessibility:**
   - [ ] Screen readers announce toast messages
   - [ ] Toasts dismissible with keyboard (Escape key)

---

## Troubleshooting

### Toast Not Appearing

**Issue:** `toast.success()` called but nothing appears
**Solution:** Ensure `<ToasterWrapper />` is in `layout.tsx`

```typescript
// packages/dashboard/src/app/layout.tsx
import { ToasterWrapper } from '@/components/ToasterWrapper';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <ToasterWrapper /> {/* Must be here */}
      </body>
    </html>
  );
}
```

### Toast Behind Modal

**Issue:** Toast appears behind modal dialog
**Solution:** Check z-index values. ToasterWrapper should have `z-index: 9999`, modals should be `z-50`

```typescript
// ToasterWrapper.tsx
<Toaster style={{ zIndex: 9999 }} /> {/* Higher than modals */}
```

### Retry Button Not Working

**Issue:** Clicking retry doesn't re-execute function
**Solution:** Use arrow function to preserve context

```typescript
// ❌ Wrong: Loses context
onClick: handleScan

// ✅ Correct: Preserves context
onClick: () => handleScan(projectIds)
```

### Toast Doesn't Transform

**Issue:** Loading toast doesn't become success toast
**Solution:** Pass `id` to success/error toast

```typescript
const toastId = toast.loading('Loading...');

toast.success('Done', { id: toastId }); // ✅ Transforms
toast.success('Done'); // ❌ Creates new toast
```

---

## Related Documentation

- **ARCHITECTURE.md** - Notification system architecture
- **ToastTheme.tsx** - Industrial design theme configuration
- **Sonner Docs** - https://sonner.emilkowal.ski/

---

**Last Updated:** 2026-01-03
**Workorder:** WO-TOAST-NOTIFICATIONS-001

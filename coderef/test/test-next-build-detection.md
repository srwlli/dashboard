# Test: Next.js Build Detection Issue

**Issue:** Electron app fails to start with "Could not find a production build in the '.next' directory"

**Error:**
```
Unhandled Rejection: Error: Could not find a production build in the '.next' directory.
Try building your app with 'next build' before starting the production server.
```

**Root Cause:** The Electron main process is trying to start Next.js in production mode, but the Next.js build hasn't been created yet.

---

## Test Cases

### Test 1: Verify .next Directory Exists
**Purpose:** Check if Next.js build output exists

**Steps:**
```bash
# Navigate to web-app package
cd C:\Users\willh\Desktop\coderef-dashboard\packages\web-app

# Check if .next directory exists
ls -la .next

# Expected: .next directory with build-manifest.json
```

**Expected Result:** `.next` directory exists with build artifacts

**Actual Result (Current):** `.next` directory missing or incomplete

**Status:** L FAIL

---

### Test 2: Run Next.js Build Manually
**Purpose:** Verify Next.js can build successfully

**Steps:**
```bash
# Navigate to web-app
cd C:\Users\willh\Desktop\coderef-dashboard\packages\web-app

# Run Next.js build
npm run build

# Check output
ls -la .next
```

**Expected Result:** Build succeeds, `.next` directory populated with:
- `build-manifest.json`
- `server/`
- `static/`
- `cache/`

**Pass Criteria:**
- Build completes without errors
- `.next/BUILD_ID` file exists

---

### Test 3: Verify package.json Scripts
**Purpose:** Check if build scripts are configured correctly

**Steps:**
```bash
# Read web-app package.json
cat C:\Users\willh\Desktop\coderef-dashboard\packages\web-app\package.json | grep -A 5 "scripts"

# Read electron-app package.json
cat C:\Users\willh\Desktop\coderef-dashboard\packages\electron-app\package.json | grep -A 5 "scripts"
```

**Expected web-app scripts:**
```json
{
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start"
  }
}
```

**Expected electron-app scripts:**
```json
{
  "scripts": {
    "dev": "electron .",
    "prebuild": "npm run build -w packages/web-app",
    "build": "npm run build -w packages/electron-app"
  }
}
```

**Pass Criteria:**
- `build` script exists in web-app
- `prebuild` or dependency on web-app build exists in electron-app

---

### Test 4: Check Electron Main Process Code
**Purpose:** Verify how Electron starts Next.js server

**Steps:**
```bash
# Read electron main.js or dist/main.js
cat C:\Users\willh\Desktop\coderef-dashboard\packages\electron-app\dist\main.js | grep -A 10 "startNextServer"
```

**Expected Behavior:**
- In **dev mode**: Should run `next dev` (development server, no .next required)
- In **prod mode**: Should run `next start` (requires .next build)

**Common Issue:**
```javascript
// L WRONG - Always uses production mode
const nextApp = next({ dev: false, dir: './packages/web-app' });

//  CORRECT - Uses dev mode in development
const isDev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev: isDev, dir: './packages/web-app' });
```

**Pass Criteria:**
- Main process uses `dev: true` when running `npm run dev:electron`
- Main process uses `dev: false` only for production builds

---

### Test 5: Environment Variables Check
**Purpose:** Verify NODE_ENV is set correctly

**Steps:**
```bash
# Check if NODE_ENV is set in dev:electron script
cat C:\Users\willh\Desktop\coderef-dashboard\package.json | grep "dev:electron"
```

**Expected:**
```json
{
  "scripts": {
    "dev:electron": "cross-env NODE_ENV=development npm run dev -w packages/electron-app"
  }
}
```

**Pass Criteria:**
- `NODE_ENV=development` is set for dev script
- Electron main process reads `process.env.NODE_ENV`

---

## Debugging Steps

### Step 1: Check Current State
```bash
# Check if .next exists
ls C:\Users\willh\Desktop\coderef-dashboard\packages\web-app\.next

# Check if build script exists
cat C:\Users\willh\Desktop\coderef-dashboard\packages\web-app\package.json | grep "\"build\""
```

### Step 2: Manual Build Test
```bash
# Build Next.js manually
cd C:\Users\willh\Desktop\coderef-dashboard\packages\web-app
npm run build

# Verify output
ls .next/BUILD_ID
```

### Step 3: Check Electron Main Code
```bash
# Find where Next.js is started
cd C:\Users\willh\Desktop\coderef-dashboard\packages\electron-app
cat dist/main.js | grep -B 5 -A 10 "next("
```

### Step 4: Add Logging
Add debug logging to Electron main process:

```javascript
// packages/electron-app/src/main.js (or similar)

const isDev = process.env.NODE_ENV !== 'production';
console.log('= DEBUG: NODE_ENV =', process.env.NODE_ENV);
console.log('= DEBUG: isDev =', isDev);
console.log('= DEBUG: Next.js dir =', nextDir);

const nextApp = next({
  dev: isDev,  // Use dev mode in development
  dir: nextDir
});
```

### Step 5: Fix Dev Script
Update `package.json` to use dev mode:

```json
{
  "scripts": {
    "dev:electron": "cross-env NODE_ENV=development electron .",
    "build:electron": "npm run build -w packages/web-app && electron-builder"
  }
}
```

---

## Expected Fix

### Option 1: Use Dev Mode (Recommended for dev:electron)
Modify Electron main process to detect dev vs prod:

```javascript
// packages/electron-app/src/main.ts or main.js

const isDev = process.env.NODE_ENV !== 'production';
const nextDir = path.join(__dirname, '../../web-app');

async function startNextServer() {
  const app = next({
    dev: isDev,  //  Use dev server during development
    dir: nextDir
  });

  await app.prepare();
  const handle = app.getRequestHandler();

  // ... rest of server setup
}
```

### Option 2: Pre-build (For production electron builds)
Add prebuild step:

```json
{
  "scripts": {
    "dev:electron": "npm run dev -w packages/electron-app",
    "build:electron": "npm run build -w packages/web-app && npm run build -w packages/electron-app && electron-builder"
  }
}
```

---

## Verification

After applying fix, test:

```bash
# Should work without manual build
npm run dev:electron

# Should see:
# - Next.js dev server starts on port 3000
# - Electron window opens
# - No ".next directory not found" error
```

**Success Criteria:**
-  `npm run dev:electron` starts without errors
-  Electron window loads Next.js app
-  Hot reload works (edit file, see changes without restart)
-  No manual `npm run build` required for dev mode

---

## Related Files to Check

1. `packages/electron-app/dist/main.js` - Electron main process (where error occurs)
2. `packages/electron-app/src/main.ts` - Source file (if TypeScript)
3. `packages/web-app/package.json` - Next.js scripts
4. `package.json` (root) - Workspace scripts
5. `packages/electron-app/package.json` - Electron scripts

---

**Created:** 2025-12-30
**Issue:** Next.js production mode check in dev environment
**Resolution:** Set `dev: true` for Next.js in development, only use `dev: false` for production builds

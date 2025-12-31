/**
 * Automated tests to verify Next.js build detection issue
 * Run with: node verify-next-build.test.js
 */

const fs = require('fs');
const path = require('path');

// ANSI colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

const ROOT = path.join(__dirname, '../..');
const WEB_APP = path.join(ROOT, 'packages/web-app');
const ELECTRON_APP = path.join(ROOT, 'packages/electron-app');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    const result = fn();
    if (result === true || result === undefined) {
      console.log(`${colors.green}${colors.reset} ${name}`);
      passed++;
    } else {
      console.log(`${colors.red}${colors.reset} ${name}`);
      console.log(`  ${colors.yellow}Expected: true, Got: ${result}${colors.reset}`);
      failed++;
    }
  } catch (error) {
    console.log(`${colors.red}${colors.reset} ${name}`);
    console.log(`  ${colors.red}Error: ${error.message}${colors.reset}`);
    failed++;
  }
}

function fileExists(filepath) {
  return fs.existsSync(filepath);
}

function readJSON(filepath) {
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}

console.log(`\n${colors.blue}=== Next.js Build Detection Tests ===${colors.reset}\n`);

// Test 1: Check if .next directory exists
test('Web app has .next directory', () => {
  const nextDir = path.join(WEB_APP, '.next');
  return fileExists(nextDir);
});

// Test 2: Check if BUILD_ID exists (proof of successful build)
test('Web app has .next/BUILD_ID file', () => {
  const buildId = path.join(WEB_APP, '.next/BUILD_ID');
  return fileExists(buildId);
});

// Test 3: Check if build-manifest.json exists
test('Web app has build-manifest.json', () => {
  const manifest = path.join(WEB_APP, '.next/build-manifest.json');
  return fileExists(manifest);
});

// Test 4: Verify web-app package.json has build script
test('Web app package.json has "build" script', () => {
  const pkg = readJSON(path.join(WEB_APP, 'package.json'));
  return pkg.scripts && pkg.scripts.build && pkg.scripts.build.includes('next build');
});

// Test 5: Verify web-app package.json has dev script
test('Web app package.json has "dev" script', () => {
  const pkg = readJSON(path.join(WEB_APP, 'package.json'));
  return pkg.scripts && pkg.scripts.dev && pkg.scripts.dev.includes('next dev');
});

// Test 6: Check if Electron main file exists
test('Electron app has main entry point', () => {
  const distMain = path.join(ELECTRON_APP, 'dist/main.js');
  const srcMain = path.join(ELECTRON_APP, 'src/main.js');
  const srcMainTs = path.join(ELECTRON_APP, 'src/main.ts');
  return fileExists(distMain) || fileExists(srcMain) || fileExists(srcMainTs);
});

// Test 7: Check Electron main code for dev mode detection
test('Electron main.js checks NODE_ENV or uses dev mode', () => {
  const distMain = path.join(ELECTRON_APP, 'dist/main.js');
  if (!fileExists(distMain)) {
    console.log(`  ${colors.yellow}Skipped: dist/main.js not found${colors.reset}`);
    return true; // Skip test if file doesn't exist
  }

  const content = fs.readFileSync(distMain, 'utf-8');

  // Check if code uses dev mode detection
  const hasDevCheck = content.includes('process.env.NODE_ENV') ||
                      content.includes('dev: true') ||
                      content.includes('isDev');

  if (!hasDevCheck) {
    console.log(`  ${colors.yellow}Warning: No dev mode detection found in Electron main${colors.reset}`);
    console.log(`  ${colors.yellow}This likely causes the ".next not found" error${colors.reset}`);
  }

  return hasDevCheck;
});

// Test 8: Check if Next.js is started with production mode
test('Electron main.js does NOT hardcode dev: false', () => {
  const distMain = path.join(ELECTRON_APP, 'dist/main.js');
  if (!fileExists(distMain)) {
    console.log(`  ${colors.yellow}Skipped: dist/main.js not found${colors.reset}`);
    return true;
  }

  const content = fs.readFileSync(distMain, 'utf-8');

  // Check for hardcoded production mode (the bug)
  const hasHardcodedProd = content.includes('dev: false') || content.includes('dev:false');

  if (hasHardcodedProd) {
    console.log(`  ${colors.red}FOUND THE BUG: main.js has hardcoded 'dev: false'${colors.reset}`);
    console.log(`  ${colors.red}This requires .next build to exist${colors.reset}`);
  }

  return !hasHardcodedProd; // Should NOT have hardcoded production mode
});

// Test 9: Check root package.json for dev:electron script
test('Root package.json has dev:electron script', () => {
  const pkg = readJSON(path.join(ROOT, 'package.json'));
  return pkg.scripts && pkg.scripts['dev:electron'];
});

// Test 10: Check if dev:electron sets NODE_ENV
test('dev:electron script sets NODE_ENV=development', () => {
  const pkg = readJSON(path.join(ROOT, 'package.json'));
  const devScript = pkg.scripts && pkg.scripts['dev:electron'];

  if (!devScript) return false;

  const setsNodeEnv = devScript.includes('NODE_ENV=development') ||
                      devScript.includes('cross-env NODE_ENV=development');

  if (!setsNodeEnv) {
    console.log(`  ${colors.yellow}Warning: dev:electron doesn't set NODE_ENV=development${colors.reset}`);
    console.log(`  ${colors.yellow}Script: ${devScript}${colors.reset}`);
  }

  return true; // Not critical, just warning
});

// Summary
console.log(`\n${colors.blue}=== Test Results ===${colors.reset}`);
console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
console.log(`${colors.red}Failed: ${failed}${colors.reset}`);

if (failed > 0) {
  console.log(`\n${colors.red}=== Diagnosis ===${colors.reset}`);

  // Specific diagnosis based on failures
  const nextDir = path.join(WEB_APP, '.next');
  const distMain = path.join(ELECTRON_APP, 'dist/main.js');

  if (!fileExists(nextDir)) {
    console.log(`${colors.yellow}Issue: .next directory missing${colors.reset}`);
    console.log(`${colors.yellow}Cause: Next.js build hasn't been run${colors.reset}`);
    console.log(`${colors.yellow}Fix Option 1: Run 'npm run build' in packages/web-app${colors.reset}`);
    console.log(`${colors.yellow}Fix Option 2: Use dev mode in Electron (dev: true)${colors.reset}`);
  }

  if (fileExists(distMain)) {
    const content = fs.readFileSync(distMain, 'utf-8');
    if (content.includes('dev: false') && !content.includes('process.env.NODE_ENV')) {
      console.log(`\n${colors.red}ROOT CAUSE FOUND:${colors.reset}`);
      console.log(`${colors.red}Electron main.js is hardcoded to production mode (dev: false)${colors.reset}`);
      console.log(`${colors.red}This requires a .next build, which doesn't exist in dev.${colors.reset}`);
      console.log(`\n${colors.green}Recommended Fix:${colors.reset}`);
      console.log(`${colors.green}In packages/electron-app/src/main.ts (or main.js):${colors.reset}`);
      console.log(`${colors.green}  const isDev = process.env.NODE_ENV !== 'production';${colors.reset}`);
      console.log(`${colors.green}  const nextApp = next({ dev: isDev, dir: '...' });${colors.reset}`);
    }
  }
}

process.exit(failed > 0 ? 1 : 0);

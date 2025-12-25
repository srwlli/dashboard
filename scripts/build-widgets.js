#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const CORE_DIR = path.join(__dirname, '../packages/core');
const WIDGETS_DIR = path.join(__dirname, '../packages/widgets/@coderef-dashboard');
const OUTPUT_DIR = path.join(__dirname, '../packages/dashboard/public/widgets');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`Created directory: ${OUTPUT_DIR}`);
}

// Build core first
async function buildCore() {
  const coreEntryPoint = path.join(CORE_DIR, 'src/index.ts');
  const coreOutputFile = path.join(OUTPUT_DIR, 'core.js');

  if (!fs.existsSync(coreEntryPoint)) {
    console.warn(`⚠️  Core not found at ${coreEntryPoint}`);
    return false;
  }

  console.log('\n🏗️  Building core library...');

  try {
    const coreBanner = `
var process = { env: { NODE_ENV: 'production' } };
var require = (function() {
  const modules = {
    'react': window.React,
    'react-dom': window.ReactDOM,
  };
  return function(id) {
    if (id in modules) return modules[id];
    throw new Error('[CodeRefCore] Cannot find module: ' + id);
  };
})();`;

    await esbuild.build({
      entryPoints: [coreEntryPoint],
      bundle: true,
      outfile: coreOutputFile,
      format: 'iife',
      globalName: 'CodeRefCore',
      platform: 'browser',
      target: 'es2020',
      sourcemap: false,
      external: ['react', 'react-dom'],
      banner: {
        js: coreBanner,
      },
      define: {
        'process.env.NODE_ENV': '"production"',
      },
      logLevel: 'info',
    });

    console.log(`✅ Core built: ${coreOutputFile}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to build core:`, error.message);
    process.exit(1);
  }
}

// Find all widget packages
const widgetDirs = fs.readdirSync(WIDGETS_DIR).filter(name =>
  name.startsWith('widget-') &&
  fs.statSync(path.join(WIDGETS_DIR, name)).isDirectory()
);

console.log(`Found ${widgetDirs.length} widget(s): ${widgetDirs.join(', ')}`);

// Build each widget
async function buildWidgets() {
  for (const dir of widgetDirs) {
    const widgetPath = path.join(WIDGETS_DIR, dir);
    const entryPoint = path.join(widgetPath, 'src/index.ts');
    const widgetId = dir.replace('widget-', '');
    const outputFile = path.join(OUTPUT_DIR, `${widgetId}.js`);

    if (!fs.existsSync(entryPoint)) {
      console.warn(`⚠️  Skipping ${dir}: entry point not found at ${entryPoint}`);
      continue;
    }

    console.log(`\n📦 Building widget: ${dir}...`);

    try {
      // Banner provides require() shim for external dependencies
      const banner = `
var process = { env: { NODE_ENV: 'production' } };
var require = (function() {
  const modules = {
    'react': window.React,
    'react-dom': window.ReactDOM,
    'react/jsx-runtime': {
      jsx: window.React.jsx || function(type, props) {
        return window.React.createElement(type, props);
      },
      jsxs: window.React.jsxs || function(type, props) {
        return window.React.createElement(type, props);
      },
      Fragment: window.React.Fragment
    },
    'CodeRefCore': window.CodeRefCore,
  };
  return function(id) {
    if (id in modules) return modules[id];
    throw new Error('[WidgetLoader] Cannot find module: ' + id);
  };
})();`;

      await esbuild.build({
        entryPoints: [entryPoint],
        bundle: true,
        outfile: outputFile,
        format: 'iife',
        globalName: `CodeRefWidget_${widgetId.replace(/-/g, '_')}`,
        platform: 'browser',
        target: 'es2020',
        sourcemap: true,
        external: ['react', 'react-dom', 'CodeRefCore'],
        loader: {
          '.css': 'css',
          '.module.css': 'local-css',
        },
        banner: {
          js: banner,
        },
        define: {
          'process.env.NODE_ENV': '"production"',
        },
        logLevel: 'info',
      });

      console.log(`✅ Built: ${outputFile}`);
    } catch (error) {
      console.error(`❌ Failed to build ${dir}:`, error.message);
      process.exit(1);
    }
  }

  console.log(`\n✨ All widgets built successfully!\n`);
}

// Main build process
async function build() {
  try {
    // Build core first
    await buildCore();

    // Then build widgets
    await buildWidgets();

    console.log('\n🎉 Build complete!\n');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();

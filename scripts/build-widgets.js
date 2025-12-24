#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const WIDGETS_DIR = path.join(__dirname, '../packages/widgets/@coderef-dashboard');
const OUTPUT_DIR = path.join(__dirname, '../packages/dashboard/public/widgets');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`Created directory: ${OUTPUT_DIR}`);
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
      await esbuild.build({
        entryPoints: [entryPoint],
        bundle: true,
        outfile: outputFile,
        format: 'iife',
        globalName: `CodeRefWidget_${widgetId.replace(/-/g, '_')}`,
        platform: 'browser',
        target: 'es2020',
        sourcemap: true,
        external: ['react', 'react-dom'],
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

buildWidgets().catch(error => {
  console.error('Build failed:', error);
  process.exit(1);
});

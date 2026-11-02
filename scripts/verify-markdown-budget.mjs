// Collect the Markdown route's statically imported Vite chunks, excluding
// lazily imported Mermaid/other renderers and the separate Universal Reader route.
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const manifest = JSON.parse(readFileSync('dist/.vite/manifest.json', 'utf8'));
const entry = 'index.html';
const markdown = 'src/MarkdownWorkbench.tsx';
if (!manifest[entry] || !manifest[markdown]) {
  throw new Error('Vite manifest missing the initial entry or the Markdown route');
}
const visited = new Set();
const files = new Set();
function collect(key) {
  if (visited.has(key)) return;
  visited.add(key);
  const item = manifest[key];
  if (!item?.file) throw new Error('Invalid static import in manifest: ' + key);
  if (item.file.endsWith('.js')) files.add(item.file);
  for (const imported of item.imports ?? []) collect(imported);
  // Do NOT include dynamicImports: they are intentionally lazy loaded.
}
collect(entry);
collect(markdown);
let total = 0;
for (const asset of [...files].sort()) {
  const bytes = gzipSync(readFileSync(join('dist', asset)), { level: 9 }).length;
  total += bytes;
  console.log(asset + ': ' + (bytes / 1024).toFixed(1) + ' KiB gzip');
}
const budget = 300 * 1024;
console.log('Markdown initial route: ' + (total / 1024).toFixed(1) + ' KiB gzip (budget 300 KiB)');
if (total > budget) {
  console.error('FAIL: Markdown initial JavaScript exceeds the documented 300 KiB budget');
  process.exitCode = 1;
}

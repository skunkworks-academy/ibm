import fs from 'node:fs';
import path from 'node:path';

const buildDir = path.resolve('build');
if (!fs.existsSync(buildDir)) {
  console.error('build/ not found. Run npm run build first.');
  process.exit(1);
}

const htmlFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.endsWith('.html')) htmlFiles.push(full);
  }
}
walk(buildDir);

const failures = [];
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  if (!/<title[^>]*>.+?<\/title>/i.test(html)) failures.push(`${file}: missing title`);
  if (!/<meta[^>]+name=["']description["'][^>]+content=["'][^"']+/i.test(html) && !/<meta[^>]+content=["'][^"']+["'][^>]+name=["']description["']/i.test(html)) failures.push(`${file}: missing description`);
  if (!/rel=["']canonical["']/i.test(html)) failures.push(`${file}: missing canonical link`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`SEO check passed for ${htmlFiles.length} generated HTML files.`);

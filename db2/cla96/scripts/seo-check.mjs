import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const buildRoot = path.join(projectRoot, 'build');

function walk(directory) {
  return fs.readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function normalizeSpace(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function count(pattern, value) {
  return [...value.matchAll(pattern)].length;
}

if (!fs.existsSync(buildRoot)) {
  console.error('SEO check failed: build/ does not exist. Run npm run build first.');
  process.exit(1);
}

const sitemap = path.join(buildRoot, 'sitemap.xml');
const htmlFiles = walk(buildRoot).filter((file) => file.endsWith('.html'));
const errors = [];
const warnings = [];

if (!fs.existsSync(sitemap)) {
  errors.push('Missing sitemap.xml');
}

if (htmlFiles.length === 0) {
  errors.push('No rendered HTML files found in build/.');
}

for (const file of htmlFiles) {
  const relative = path.relative(buildRoot, file).replaceAll(path.sep, '/');
  const html = fs.readFileSync(file, 'utf8');
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '';
  const description = html.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i)?.[1]
    ?? html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i)?.[1]
    ?? '';
  const canonical = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)?.[1]
    ?? html.match(/<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i)?.[1]
    ?? '';
  const lang = html.match(/<html\s+[^>]*lang=["']([^"']+)["']/i)?.[1] ?? '';
  const h1Count = count(/<h1(?:\s|>)/gi, html);
  const noindex = /<meta\s+[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)
    || /<meta\s+[^>]*content=["'][^"']*noindex[^"']*["'][^>]*name=["']robots["']/i.test(html);

  if (!normalizeSpace(title)) errors.push(`${relative}: missing <title>.`);
  if (normalizeSpace(title).length > 65) warnings.push(`${relative}: title is ${normalizeSpace(title).length} characters.`);
  if (!normalizeSpace(description)) errors.push(`${relative}: missing meta description.`);
  if (normalizeSpace(description).length > 180) warnings.push(`${relative}: meta description is ${normalizeSpace(description).length} characters.`);
  if (!canonical) errors.push(`${relative}: missing canonical URL.`);
  if (!lang) errors.push(`${relative}: missing html[lang].`);
  if (h1Count !== 1) errors.push(`${relative}: expected exactly one <h1>, found ${h1Count}.`);
  if (noindex) errors.push(`${relative}: contains noindex.`);

  const images = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
  images.forEach((image, index) => {
    if (!/\balt=["'][^"']*["']/i.test(image)) {
      errors.push(`${relative}: image ${index + 1} is missing alt text.`);
    }
    if (/\bwidth=["']?[1-9]\d{3,}/i.test(image)) {
      warnings.push(`${relative}: review oversized intrinsic image dimensions.`);
    }
  });
}

const homeFile = htmlFiles.find((file) => path.relative(buildRoot, file).replaceAll(path.sep, '/') === 'index.html');
if (homeFile) {
  const home = fs.readFileSync(homeFile, 'utf8');
  if (!/"@type"\s*:\s*"Course"/.test(home)) {
    errors.push('index.html: missing Course structured data.');
  }
}

if (warnings.length) {
  console.warn('\nSEO warnings:');
  warnings.forEach((warning) => console.warn(`- ${warning}`));
}

if (errors.length) {
  console.error('\nSEO validation failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  console.error(`\nChecked ${htmlFiles.length} rendered HTML files.`);
  process.exit(1);
}

console.log(`SEO validation passed for ${htmlFiles.length} rendered HTML files.`);
console.log('Validated: title, meta description, canonical, lang, one H1, indexability, image alt text, sitemap and Course JSON-LD.');

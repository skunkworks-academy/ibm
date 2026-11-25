#!/usr/bin/env node
'use strict';

// Real browser interactions against the final Pages artifact. Canonical shell
// assets come from the reviewed Academy commit; course/content assets come from
// the staged IBM artifact. This keeps external CDN availability out of CI.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {execFileSync} = require('node:child_process');
const {chromium} = require('playwright');

const root = path.resolve(__dirname, '..');
const site = path.join(root, '_site');
const referenceRoot = path.resolve(process.env.IBM_REFERENCE_ROOT || path.join(root, '_reference-www'));
const reference = JSON.parse(fs.readFileSync(path.join(root, 'assets/ibm-reference.json'), 'utf8'));
const output = path.join(root, 'test-results');
const axePath = require.resolve('axe-core/axe.min.js');
const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
};
const templates = [
  {name: 'catalogue', route: '/', audit: true},
  {name: 'infrastructure-hub', route: '/infrastructure-power/', audit: true},
  {name: 'ftm', route: '/ftm/'},
  {name: 'storage-scale-lesson', route: '/Storage%20Scale%204.4/day1/unit1-overview.html'},
  {name: 'websphere-lesson', route: '/we7531/we7531.html'},
  {name: 'lab-plan', route: '/lab-environment-build-plan.html'},
  {name: 'cla96-home', route: '/db2/cla96/'},
  {name: 'cla96-lesson', route: '/db2/cla96/course/part-1', audit: true, course: true},
  {name: 'zbsec1-home', route: '/db2/zbsec1/'},
  {name: 'zbsec1-lesson', route: '/db2/zbsec1/course/module-1-architecture-threat-model', audit: true, course: true},
  {name: 'cla96-static-lesson', route: '/db2/cla96/part-1.html'},
];
const report = {referenceCommit: reference.sourceCommit, cases: [], behavior: [], accessibility: [], failures: []};
fs.mkdirSync(output, {recursive: true});

function resolveFile(directory, pathname) {
  const file = path.resolve(directory, '.' + decodeURIComponent(pathname));
  if (file !== directory && !file.startsWith(directory + path.sep)) return null;
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) return path.join(file, 'index.html');
  if (fs.existsSync(file)) return file;
  if (!path.extname(file) && fs.existsSync(file + '.html')) return file + '.html';
  return null;
}

async function serveSite() {
  const server = http.createServer((request, response) => {
    const requested = new URL(request.url, 'http://localhost').pathname;
    const file = resolveFile(site, requested);
    if (!file || !fs.existsSync(file)) {response.writeHead(404); response.end('Not found'); return;}
    response.writeHead(200, {'Content-Type': mime[path.extname(file)] || 'application/octet-stream'});
    fs.createReadStream(file).pipe(response);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return {server, origin: 'http://127.0.0.1:' + server.address().port};
}

async function fixture(context, origin) {
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    const academy = ['www.skunkworksacademy.com', 'skunkworksacademy.com'].includes(url.hostname);
    const publicAsset = /^\/(assets|images)\//.test(url.pathname);
    // The canonical shell chooses same-origin paths on localhost. Resolve only
    // missing shared assets there, never substitute IBM course/content files.
    const localMissingAsset = url.origin === origin && publicAsset && !resolveFile(site, url.pathname);
    if (publicAsset && (academy || localMissingAsset)) {
      const file = resolveFile(referenceRoot, url.pathname);
      if (file && fs.existsSync(file)) {
        await route.fulfill({path: file, contentType: mime[path.extname(file)] || 'application/octet-stream', headers: {'Access-Control-Allow-Origin': '*'}});
      } else {
        await route.fulfill({status: 404, body: 'Pinned Academy asset not found: ' + url.pathname});
      }
      return;
    }
    await route.continue();
  });
}

async function ready(page, theme) {
  await page.locator('.swa-global-nav').waitFor({state: 'visible'});
  await page.locator('.swa-global-footer').waitFor({state: 'visible'});
  await page.waitForFunction(expected => document.documentElement.dataset.theme === expected, theme);
  await page.waitForFunction(() => document.fonts.status === 'loaded');
}

async function layout(page, theme) {
  assert.equal(await page.locator('.swa-global-nav:visible').count(), 1, 'Exactly one Academy header must be visible.');
  // A footer nested inside a lesson can hold its previous/next controls. It is
  // contextual course navigation, not a competing global contentinfo region.
  assert.equal(await page.locator('body > footer:visible, #__docusaurus footer.footer:visible').count(), 1, 'Exactly one global footer must be visible, including on React courses.');
  assert.equal(await page.locator('.swa-global-footer:visible').count(), 1, 'The visible footer must be canonical.');
  const metrics = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    return {
      viewport: innerWidth, width: document.documentElement.scrollWidth,
      theme: document.documentElement.dataset.theme,
      background: body.backgroundColor, foreground: body.color, font: body.fontFamily,
      overflow: [...document.querySelectorAll('body *')].filter(node => {
        const bounds = node.getBoundingClientRect();
        return bounds.width && bounds.right > innerWidth + 2 && getComputedStyle(node).position !== 'fixed';
      }).slice(0, 8).map(node => ({tag: node.tagName, class: node.className, right: node.getBoundingClientRect().right})),
      brokenImages: [...document.images].filter(image => {
        const bounds = image.getBoundingClientRect();
        return bounds.width && bounds.height && bounds.top < innerHeight && bounds.bottom > 0 && image.complete && !image.naturalWidth;
      }).map(image => image.src),
    };
  });
  assert.ok(metrics.width <= metrics.viewport + 1, 'Page scrolls horizontally: ' + JSON.stringify(metrics));
  assert.equal(metrics.theme, theme);
  assert.equal(metrics.background, theme === 'dark' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)', 'Content canvas must match the reference palette.');
  assert.equal(metrics.foreground, theme === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(17, 17, 17)', 'Content text must follow the selected theme.');
  assert.match(metrics.font, /IBM Plex Portal/, 'Shared IBM content typography must be applied.');
  assert.deepEqual(metrics.brokenImages, [], 'Visible images must load.');
  return metrics;
}

async function accessibility(page, name, context) {
  await page.addScriptTag({path: axePath});
  const results = await page.evaluate(async selector => window.axe.run(selector || document, {
    runOnly: {type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa']},
  }), context || null);
  const violations = results.violations.map(item => ({id: item.id, impact: item.impact, help: item.help, helpUrl: item.helpUrl,
    nodes: item.nodes.map(node => ({target: node.target, summary: node.failureSummary}))}));
  report.accessibility.push({name, violations, incomplete: results.incomplete.map(item => ({id: item.id, nodes: item.nodes.map(node => node.target)}))});
  fs.writeFileSync(path.join(output, name + '-axe.json'), JSON.stringify(results, null, 2));
  // The release changes themes across existing course content. Every detected
  // AA text-contrast violation blocks release; pre-existing content semantics
  // are retained in the full report for review without hiding their findings.
  const contrast = violations.filter(item => item.id === 'color-contrast');
  assert.deepEqual(contrast, [], 'WCAG AA contrast failures: ' + JSON.stringify(contrast));
}

async function catalogueBehavior(page) {
  await page.locator('#ibm-results .ibm-course').first().waitFor();
  await page.locator('#ibm-status').selectOption('all');
  await page.getByLabel('Search courses', {exact: true}).fill('CL722G');
  await page.waitForFunction(() => document.querySelectorAll('#ibm-results .ibm-course').length === 1);
  assert.match(await page.locator('#ibm-results').innerText(), /Db2 11\.5 for LUW: SQL Workshop/);
  await page.getByRole('button', {name: 'Save CL722G to shortlist', exact: true}).click();
  assert.equal(await page.locator('#ibm-saved-count').innerText(), '1');
  await page.getByRole('button', {name: 'View course CL722G', exact: true}).click();
  await page.locator('#ibm-detail').waitFor({state: 'visible'});
  const enquiry = new URL(await page.locator('#ibm-detail-enquiry').getAttribute('href'));
  assert.equal(enquiry.origin, 'https://www.skunkworksacademy.com');
  assert.equal(enquiry.pathname, '/course-registration/');
  assert.equal(enquiry.searchParams.get('courseId'), 'CL722G');
  await page.keyboard.press('Escape');
  await page.locator('#ibm-detail').waitFor({state: 'hidden'});
  await page.reload();
  await page.locator('#ibm-results .ibm-course').first().waitFor();
  assert.equal(await page.locator('#ibm-saved-count').innerText(), '1', 'Shortlist must survive reload.');
  await page.locator('#ibm-shortlist-toggle').click();
  assert.equal(await page.locator('#ibm-shortlist-toggle').getAttribute('aria-pressed'), 'true');
  assert.equal(await page.locator('#ibm-results .ibm-course').count(), 1);
  const team = new URL(await page.locator('#ibm-team-enquiry').getAttribute('href'));
  assert.equal(team.origin, enquiry.origin);
  assert.equal(team.searchParams.get('courseId'), 'CL722G');
  report.behavior.push('Catalogue search, details, Escape dismissal, absolute enquiry and persistent shortlist passed.');
}

async function toggleTheme(page, initial) {
  const next = initial === 'light' ? 'dark' : 'light';
  await page.locator('.swa-global-nav__theme').click();
  await page.waitForFunction(expected => document.documentElement.dataset.theme === expected, next);
  await layout(page, next);
  return next;
}

async function courseBehavior(page, name, theme, width) {
  if (width === 390) {
    const toggle = page.getByRole('button', {name: 'Toggle navigation bar', exact: true});
    await toggle.click();
    assert.equal(await toggle.getAttribute('aria-expanded'), 'true', 'Course navigation must open independently of the Academy menu.');
    await page.locator('.navbar-sidebar').waitFor({state: 'visible'});
    assert.ok(await page.locator('.navbar-sidebar a[href*="/course/"]:visible').count() > 0, 'Mobile course navigation must expose lesson links.');
    await page.getByRole('button', {name: 'Close navigation bar', exact: true}).click();
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
  }
  const scenario = page.locator('.scenario-card').first();
  await scenario.locator('.scenario-choice').first().click();
  assert.equal(await scenario.locator('.scenario-choice--active').count(), 1, 'Scenario selection must update after React hydration.');
  await scenario.locator('.quiz-feedback, .feedback').waitFor({state: 'visible'});
  const feedback = await scenario.locator('.quiz-feedback, .feedback').innerText();
  assert.ok(feedback.length > 25, 'Selecting a scenario must reveal explanatory feedback.');
  const next = await toggleTheme(page, theme);
  assert.equal(await scenario.locator('.scenario-choice--active').count(), 1, 'Theme toggling must preserve React exercise state.');
  assert.equal(await scenario.locator('.quiz-feedback, .feedback').innerText(), feedback);
  await scenario.scrollIntoViewIfNeeded();
  await page.screenshot({path: path.join(output, name + '-scenario-' + next + '.png'), animations: 'disabled'});
  await accessibility(page, name + '-scenario-' + next, '.scenario-card');
  report.behavior.push(name + ': mobile course menu, scenario feedback and theme-preserved exercise state passed.');
}

async function main() {
  assert.ok(fs.existsSync(path.join(site, 'ibm-release.json')), 'Build and stage the IBM artifact before browser checks.');
  const actualReference = execFileSync('git', ['-C', referenceRoot, 'rev-parse', 'HEAD'], {encoding: 'utf8'}).trim();
  assert.equal(actualReference, reference.sourceCommit, 'Browser shell fixture must use the exact reviewed Academy commit.');
  const {server, origin} = await serveSite();
  let browser;
  try {
    browser = await chromium.launch({headless: true});
    for (const width of [390, 768, 1440]) {
      for (const theme of ['light', 'dark']) {
        const context = await browser.newContext({viewport: {width, height: 1000}, colorScheme: theme, locale: 'en-ZA', timezoneId: 'Africa/Johannesburg', reducedMotion: 'reduce'});
        context.setDefaultTimeout(15000);
        await context.addInitScript(mode => {localStorage.setItem('swa-theme', mode);}, theme);
        await fixture(context, origin);
        for (const template of templates) {
          const name = template.name + '-' + width + '-' + theme;
          const page = await context.newPage();
          const errors = [], resourceErrors = [];
          page.on('pageerror', error => errors.push(error.message));
          page.on('response', response => {
            const url = new URL(response.url());
            if (response.status() >= 400 && (url.origin === origin || ['www.skunkworksacademy.com', 'skunkworksacademy.com'].includes(url.hostname)) && /\/(assets|images|data)\//.test(url.pathname)) {
              resourceErrors.push(response.status() + ' ' + response.url());
            }
          });
          try {
            const response = await page.goto(origin + template.route, {waitUntil: 'load'});
            assert.equal(response.status(), 200, 'Published route must load directly.');
            await ready(page, theme);
            if (template.name === 'catalogue') await page.locator('#ibm-results .ibm-course').first().waitFor();
            const metrics = await layout(page, theme);
            await page.screenshot({path: path.join(output, name + '.png'), animations: 'disabled'});
            if (template.audit && width !== 768) await accessibility(page, name);
            if (template.name === 'catalogue' && width === 390 && theme === 'light') {
              await catalogueBehavior(page);
              await toggleTheme(page, theme);
              await toggleTheme(page, 'dark');
            }
            if (template.course && width === 390) await courseBehavior(page, name, theme, width);
            assert.deepEqual(errors, [], 'Page JavaScript errors must be fixed: ' + JSON.stringify(errors));
            assert.deepEqual(resourceErrors, [], 'Missing publication resources: ' + JSON.stringify(resourceErrors));
            report.cases.push({name, status: 'passed', route: template.route, metrics});
            console.log('PASS ' + name);
          } catch (error) {
            report.failures.push({name, message: error.message, pageErrors: errors, resourceErrors});
            report.cases.push({name, status: 'failed', route: template.route});
            await page.screenshot({path: path.join(output, name + '-failed.png'), animations: 'disabled'}).catch(() => {});
            console.error('FAIL ' + name + ': ' + error.message);
          } finally {
            await page.close();
            fs.writeFileSync(path.join(output, 'ibm-browser-report.json'), JSON.stringify(report, null, 2));
          }
        }
        await context.close();
      }
    }
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
  console.log(`${report.cases.length - report.failures.length}/${report.cases.length} responsive/theme cases passed; ${report.behavior.length} behavior checks recorded.`);
  if (report.failures.length) process.exitCode = 1;
}

main().catch(error => {
  report.failures.push({name: 'setup', message: error.stack || error.message});
  fs.writeFileSync(path.join(output, 'ibm-browser-report.json'), JSON.stringify(report, null, 2));
  console.error(error);
  process.exitCode = 1;
});

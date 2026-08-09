# CLA96G Docusaurus self-paced course

This directory now contains a Docusaurus 3 source project for the CLA96G self-paced learning experience while the legacy static LMS files remain in place during migration.

## Why the migration is isolated here

The parent `skunkworks-academy/ibm` repository hosts the wider static IBM Training site at `ibm.skunkworksacademy.com`. The Docusaurus project therefore uses:

- production URL: `https://ibm.skunkworksacademy.com`
- base URL: `/db2/cla96/`
- docs route: `/db2/cla96/course/...`

Do not deploy the Docusaurus `build/` directory as the domain root. Doing so would replace the rest of the IBM Training hub. Instead, overlay the contents of this project's `build/` directory into `/db2/cla96/` within the existing site release artifact.

## Learning architecture

The course is structured as a 36-hour self-paced pathway:

1. Orientation — 1 hour
2. Part 1: foundations, configuration, storage and data movement — 9 hours
3. Part 2: recovery, utilities, maintenance and availability — 8 hours
4. Part 3: security, access control and concurrency — 8 hours
5. Part 4: statistics, optimization, monitoring and performance — 8 hours
6. Final assessment — 2 hours

The learning experience includes:

- responsive Docusaurus docs navigation and search-engine-friendly static rendering;
- browser-local progress tracking;
- optional SCORM 1.2 lesson status and assessment reporting when an LMS API is present;
- safe browser-based Db2 command simulations that never execute shell/database commands;
- knowledge checks and scenario decisions with immediate feedback;
- practical evidence checklists;
- 16-question final assessment with a 75% mastery threshold;
- downloadable browser-local completion evidence;
- reduced-motion support and keyboard-friendly native controls;
- light/dark color modes;
- sitemap, canonical URLs, metadata and Course structured data.

## Local development

Requires Node.js 20 or newer.

```bash
cd db2/cla96
npm install
npm start
```

Docusaurus will serve the course in development mode. Production routes are generated under `/db2/cla96/`.

## Production build

```bash
cd db2/cla96
npm install
npm run typecheck
npm run build
npm run seo:check
```

The generated site is written to `db2/cla96/build/`.

## Lighthouse validation

Lighthouse CI is configured in `.lighthouserc.json` and evaluates representative pages:

- course landing page;
- orientation;
- performance module;
- final assessment.

Thresholds:

| Category | Minimum |
| --- | ---: |
| Performance | 90% (warning threshold) |
| Accessibility | 95% |
| Best Practices | 95% |
| SEO | 95% |

Run after a successful production build:

```bash
npm run lighthouse
```

The GitHub Actions quality workflow runs these checks automatically for relevant pull requests and pushes.

## Technical SEO validation

`scripts/seo-check.mjs` validates every rendered HTML page for:

- document title;
- meta description;
- canonical URL;
- `html[lang]`;
- exactly one H1;
- no accidental `noindex`;
- alt text on images;
- sitemap output;
- Course JSON-LD on the landing page.

This is a build-time technical gate. A Semrush Site Audit remains useful after the generated site is published because it evaluates the deployed site in its real crawl environment.

## Safe deployment into the existing IBM site

Recommended release sequence:

```text
1. Build the existing IBM static-site release staging directory.
2. Build db2/cla96 with Docusaurus.
3. Remove the legacy CLA96 files from the staged /db2/cla96/ path only.
4. Copy db2/cla96/build/* into the staged /db2/cla96/ path.
5. Preserve the repository/root CNAME, .nojekyll and all unrelated IBM site paths.
6. Run link, SEO and Lighthouse checks against the staged artifact.
7. Publish the combined site artifact.
```

Do not copy `db2/cla96/build/` over the repository root.

## Migration and rollback

The existing legacy static CLA96 files are intentionally retained on the source branch until the site release mechanism is updated to serve the generated Docusaurus output. This provides a simple rollback path during review.

Once the Docusaurus deployment is confirmed in production, the legacy implementation can be archived or removed in a follow-up change.

## Course-content policy

This is an independent Skunkworks Academy learning companion aligned to publicly described IBM Db2 training objectives. It does not reproduce official IBM courseware and does not claim to issue an IBM certification or official IBM completion credential.

Exact command syntax, parameter behavior, compatibility and supported configurations should be validated against current IBM Db2 12.1 documentation before use in a real environment.

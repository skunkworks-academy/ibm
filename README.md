# Skunkworks Academy IBM Training

Public static site for the Skunkworks Academy IBM Training hub at:

https://ibm.skunkworksacademy.com/

## Purpose

This repository hosts the IBM-focused Academy catalogue, domain hubs and learning material for enterprise training, technical enablement and custom workshops.

The page positions Skunkworks Academy delivery across:

- IBM Power Systems, AIX, PowerVM and HMC operations
- LinuxONE and IBM Z enablement
- Db2, DataStage, information governance and lineage
- IBM MQ, App Connect and DataPower integration
- Guardium, QRadar and Verify security training
- Cloud Pak, OpenShift-aligned and hybrid cloud enablement

## Published self-paced courses

- `db2/cla96/` — IBM Db2 relational DBA self-paced learning experience
- `db2/zbsec1/` — **ZBSEC1 · IBM Db2 for z/OS Banking Security**, including theory, Mermaid security architecture diagrams, labs, playbooks, tabletop exercises, compliance mapping, synthetic evidence and an 80% mastery assessment

## Site architecture

The site is intentionally static and GitHub Pages friendly.

Core files:

- `index.html` — IBM catalogue, domain pathways and learning-resource landing page
- `assets/ibm-learning.css` — the canonical Academy IBM component design
- `assets/ibm-hubs.css` — domain-hub and resource-card extensions
- `assets/ibm-site.css` — the same design applied to existing course and lab templates
- `assets/ibm-reference.json` — reference commit, adaptations and asset checksums
- `data/ibm-learning/catalogue.json` — the same course-reference snapshot as the main Academy IBM page
- `404.html` — branded fallback page
- `CNAME` — custom domain configuration for `ibm.skunkworksacademy.com`
- `.nojekyll` — disables Jekyll processing for predictable static hosting
- `db2/zbsec1/index.html` — generated ZBSEC1 Docusaurus entry point

## Design alignment

The design reference for **every page** is [the Academy IBM page](https://www.skunkworksacademy.com/ibm/).

- White/blue light mode and black/blue dark mode, with IBM Plex body typography and the Academy display family.
- Square Carbon controls, flat cards, restrained headings and responsive content gutters.
- Exactly one shared Academy header and footer. Course-specific lesson navigation remains available, including its mobile sidebar control.
- Direct canonical `www` UI, footer and v11 navigation runtimes. Do not reintroduce the `academy-navigation.js` compatibility loader: it selects a different Learn theme on this hostname.
- The final publication pass adds the shared IBM styles and checks their presence on every HTML route, including generated Docusaurus lessons.

The catalogue stylesheet, Carbon components, fonts, licence notices and dataset are copied from a reviewed `skunkworks-academy/www` commit. To refresh those assets from a local checkout:

```bash
python3 scripts/sync-ibm-reference.py --source ../academy-www
```

Review the resulting `assets/ibm-reference.json` and page behaviour before merging. The only catalogue-module adaptation uses the absolute Academy registration URL so enquiries from the subdomain reach the correct form. Refreshing reference assets does not overwrite the domain curriculum or existing course material.

## Release verification

Build both course projects with `npm run quality` in their own directories, then compose the complete site:

```bash
python3 scripts/stage-ibm-site.py --output _site
python3 scripts/check-ibm-site.py _site
```

For a quick local preview using the previously committed course output, add `--use-existing-courses` to staging. Production always uses fresh course builds.

The Pages workflow tests the final artifact on pull requests before deployment. Its browser gate covers 11 page templates at 390px, 768px and 1440px in light and dark modes, along with catalogue enquiries, shortlist persistence, mobile lesson navigation and interactive exercise state. Screenshots and accessibility findings are retained in the `ibm-browser-evidence` artifact. Contrast failures, missing assets, duplicate global chrome or horizontal page overflow stop publication.

To run that same browser gate locally, check out `skunkworks-academy/www` at the commit recorded in `assets/ibm-reference.json` into `_reference-www`, then run:

```bash
npm ci
npx playwright install chromium
npm run test:browser
```

After deployment, `verify-ibm-live.py` verifies the exact release commit, every non-404 public route and the shared stylesheets. Docusaurus provider bridges keep course diagrams and React exercises aligned with the Academy's theme controls.

## Maintenance notes

When updating the page:

1. Keep the direct canonical shell and shared IBM style contract included. Do not add a second global header/footer or a separate local theme.
2. Preserve the canonical URL: `https://ibm.skunkworksacademy.com/`.
3. Keep IBM vendor names factual and avoid implying direct vendor ownership unless contractually approved.
4. Validate the staged site, both colour modes, mobile layout, course navigation and catalogue enquiries before publishing.
5. For generated Docusaurus payloads committed by GitHub Actions, explicitly request a GitHub Pages rebuild after the payload reaches `main`; commits made with the workflow `GITHUB_TOKEN` do not themselves trigger a Pages build.

## Contact

Training requests: training@skunkworks.africa

Skunkworks Academy: https://skunkworksacademy.com/

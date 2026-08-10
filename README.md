# Skunkworks Academy IBM Training

Public static site for the Skunkworks Academy IBM Training hub at:

https://ibm.skunkworksacademy.com/

## Purpose

This repository hosts the IBM-focused Academy landing page for enterprise training, technical enablement and custom workshops.

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

- `index.html` — primary IBM Training landing page
- `404.html` — branded fallback page
- `CNAME` — custom domain configuration for `ibm.skunkworksacademy.com`
- `.nojekyll` — disables Jekyll processing for predictable static hosting
- `db2/zbsec1/index.html` — generated ZBSEC1 Docusaurus entry point

## Design alignment

The page uses the same Skunkworks Academy ecosystem design language as the wider Academy web estate:

- global Academy navigation from `https://skunkworksacademy.com/assets/academy-navigation.js`
- IBM Plex Sans typography
- dark radial background system
- rounded card surfaces
- responsive grid layout
- Academy favicon assets from `skunkworks-academy/.github`

## Maintenance notes

When updating the page:

1. Keep the global navigation script included.
2. Preserve the canonical URL: `https://ibm.skunkworksacademy.com/`.
3. Keep IBM vendor names factual and avoid implying direct vendor ownership unless contractually approved.
4. Validate the page locally before publishing.
5. For generated Docusaurus payloads committed by GitHub Actions, explicitly request a GitHub Pages rebuild after the payload reaches `main`; commits made with the workflow `GITHUB_TOKEN` do not themselves trigger a Pages build.

## Contact

Training requests: training@skunkworks.africa

Skunkworks Academy: https://skunkworksacademy.com/

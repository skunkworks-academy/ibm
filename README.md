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

## Site architecture

The site is intentionally static and GitHub Pages friendly.

Core files:

- `index.html` — primary IBM Training landing page
- `404.html` — branded fallback page
- `CNAME` — custom domain configuration for `ibm.skunkworksacademy.com`
- `.nojekyll` — disables Jekyll processing for predictable static hosting

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

## Contact

Training requests: training@skunkworks.africa

Skunkworks Academy: https://skunkworksacademy.com/

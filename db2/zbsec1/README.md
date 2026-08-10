# ZBSEC1 — IBM Db2 for z/OS Banking Security

Independent Skunkworks Academy self-paced Docusaurus course for securing IBM Db2 for z/OS 13 in banking environments.

## Course profile

- **Code:** ZBSEC1
- **Path:** `/db2/zbsec1/`
- **Duration:** 48 guided hours
- **Level:** Intermediate to advanced
- **Modules:** 12
- **Practical labs:** 12 + synthetic evidence datasets
- **Playbooks:** 7
- **Final assessment:** 24 scenario questions
- **Mastery threshold:** 80%

## Learning scope

1. z/OS/Db2 banking architecture and threat model
2. SAF/RACF identity and authorization IDs
3. Db2 administrative authorities, roles, privileges and separation of duties
4. Packages, plans, static SQL, CICS, IMS and batch identities
5. DDF/DRDA, AT-TLS and distributed access
6. Trusted contexts, row permissions and column masks
7. DFSMS encryption, ICSF and key/recovery design
8. Db2 audit, IFCIDs, SMF, RACF evidence and SIEM
9. OWASP-informed application/database security
10. South African financial-sector, POPIA and PCI DSS control mapping
11. PAM, break-glass and incident-response tabletops
12. Northstar Digital Bank capstone

## Local development

```bash
cd db2/zbsec1
npm install --no-audit --no-fund
npm run start
```

Quality checks:

```bash
npm run typecheck
npm run build
npm run seo:check
```

or:

```bash
npm run quality
```

## Deployment

`.github/workflows/zbsec1-ci-deploy.yml` performs type checking, static build and SEO validation. On `main`, it overlays the generated Docusaurus output into `db2/zbsec1/` so the repository's existing static hosting model can serve the course under the configured base URL.

## Course content vs IBM courseware

This course is original Skunkworks Academy learning content. It may use IBM product names and links to authoritative IBM documentation but must not reproduce proprietary IBM training manuals/slides. The existing CLA96G material in this repository is useful as a Db2 LUW conceptual foundation; ZBSEC1 deliberately focuses on the different Db2 for z/OS security operating model.

## Regulatory maintenance

Regulatory mappings are educational. Before production use, the relevant legal/compliance/privacy/PCI owners must validate scope and current requirements.

Review at least quarterly for:

- current Db2 13 function levels and security APARs/PTFs;
- IBM z/OS/RACF/ICSF security guidance;
- South African financial-sector regulatory changes;
- POPIA regulator guidance;
- PCI DSS/PCI SSC updates;
- OWASP Top 10/Cheat Sheet updates;
- NIST CSF/cybersecurity guidance updates.

## Key external references

- IBM Db2 for z/OS 13: https://www.ibm.com/docs/en/db2-for-zos/13.0.0
- IBM z/OS Security Server RACF: https://www.ibm.com/docs/en/zos/3.1.0?topic=server-security-racf
- IBM ICSF: https://www.ibm.com/docs/en/zos/3.1.0?topic=zos-integrated-cryptographic-service-facility
- OWASP Top 10: https://owasp.org/Top10/
- PCI SSC: https://www.pcisecuritystandards.org/
- NIST CSF: https://www.nist.gov/cyberframework
- South African Reserve Bank: https://www.resbank.co.za/
- FSCA: https://www.fsca.co.za/
- Information Regulator: https://inforegulator.org.za/

## Safety

All included datasets are fictional. Live labs must be performed only in an explicitly authorised sandbox or non-production environment. Do not store real customer data, passwords, tokens, private keys or cryptographic key material in course submissions.

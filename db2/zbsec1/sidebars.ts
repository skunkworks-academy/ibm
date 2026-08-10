import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  courseSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Part 1 · Architecture, threats & identity',
      collapsed: false,
      items: [
        'module-1-architecture-threat-model',
        'module-2-racf-saf-identity',
        'module-3-db2-authorities-sod',
      ],
    },
    {
      type: 'category',
      label: 'Part 2 · Application and data access security',
      collapsed: false,
      items: [
        'module-4-packages-cics-ims',
        'module-5-ddf-drda-network-security',
        'module-6-trusted-context-rcac',
      ],
    },
    {
      type: 'category',
      label: 'Part 3 · Cryptography, audit & secure engineering',
      collapsed: false,
      items: [
        'module-7-cryptography-key-management',
        'module-8-audit-smf-monitoring',
        'module-9-owasp-application-security',
      ],
    },
    {
      type: 'category',
      label: 'Part 4 · Compliance, operations & resilience',
      collapsed: false,
      items: [
        'module-10-compliance-regulatory',
        'module-11-incident-response-tabletops',
        'module-12-capstone',
      ],
    },
    'lab-centre',
    'playbooks',
    'final-assessment',
    {
      type: 'category',
      label: 'Reference toolkit',
      collapsed: true,
      items: ['reference-architecture', 'glossary'],
    },
  ],
};

export default sidebars;

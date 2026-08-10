import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'ZBSEC1 · Db2 for z/OS Banking Security',
  titleDelimiter: '·',
  tagline: 'Secure mission-critical Db2 for z/OS banking workloads with identity, least privilege, cryptography, audit and incident readiness.',
  url: 'https://ibm.skunkworksacademy.com',
  baseUrl: '/db2/zbsec1/',
  organizationName: 'skunkworks-academy',
  projectName: 'ibm',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  favicon: 'img/favicon.svg',
  markdown: {mermaid: true},
  themes: ['@docusaurus/theme-mermaid'],
  i18n: {defaultLocale: 'en', locales: ['en']},
  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: 'course',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/skunkworks-academy/ibm/tree/main/db2/zbsec1/',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        },
        blog: false,
        sitemap: {changefreq: 'weekly', priority: 0.8, ignorePatterns: ['/course/tags/**']},
        theme: {customCss: ['./src/css/custom.css']},
      } satisfies Preset.Options,
    ],
  ],
  headTags: [
    {
      tagName: 'script',
      attributes: {type: 'application/ld+json'},
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: 'ZBSEC1 — IBM Db2 for z/OS Banking Security',
        description: 'A 48-hour self-paced security course covering Db2 for z/OS 13, SAF/RACF, Db2 authorities, packages, DDF, trusted contexts, row permissions, column masks, cryptography, SMF audit, OWASP guidance, banking compliance and incident response.',
        provider: {'@type': 'EducationalOrganization', name: 'Skunkworks Academy', url: 'https://skunkworksacademy.com/'},
        educationalLevel: 'Intermediate to advanced',
        timeRequired: 'PT48H',
        inLanguage: 'en',
      }),
    },
  ],
  themeConfig: {
    metadata: [
      {name: 'description', content: 'ZBSEC1 self-paced IBM Db2 for z/OS banking security course with labs, knowledge checks, tabletop exercises, playbooks and mastery assessment.'},
      {name: 'keywords', content: 'IBM Db2 for z/OS, Db2 13, RACF, SAF, DDF, DRDA, AT-TLS, ICSF, SMF, SECADM, banking cybersecurity, PCI DSS, POPIA, cyber resilience'},
      {name: 'robots', content: 'index,follow,max-image-preview:large'},
    ],
    colorMode: {defaultMode: 'dark', disableSwitch: false, respectPrefersColorScheme: true},
    announcementBar: {
      id: 'zbsec1-2026',
      content: '<strong>ZBSEC1</strong> · 48-hour guided path · safe simulations · practical evidence labs · 80% mastery target',
      backgroundColor: '#0f62fe',
      textColor: '#ffffff',
      isCloseable: true,
    },
    navbar: {
      title: 'ZBSEC1 · Banking Security',
      hideOnScroll: true,
      items: [
        {type: 'docSidebar', sidebarId: 'courseSidebar', position: 'left', label: 'Course'},
        {to: '/course/lab-centre', label: 'Lab Centre', position: 'left'},
        {to: '/course/playbooks', label: 'Playbooks', position: 'left'},
        {to: '/course/final-assessment', label: 'Assessment', position: 'left'},
        {href: 'https://www.ibm.com/docs/en/db2-for-zos/13.0.0', label: 'IBM Docs', position: 'right'},
        {href: 'https://github.com/skunkworks-academy/ibm/tree/main/db2/zbsec1', label: 'GitHub', position: 'right'},
      ],
    },
    docs: {sidebar: {hideable: true, autoCollapseCategories: false}},
    footer: {
      style: 'dark',
      links: [
        {title: 'Learn', items: [
          {label: 'Start ZBSEC1', to: '/course/intro'},
          {label: 'Lab Centre', to: '/course/lab-centre'},
          {label: 'Security playbooks', to: '/course/playbooks'},
          {label: 'Final assessment', to: '/course/final-assessment'},
        ]},
        {title: 'Reference', items: [
          {label: 'IBM Db2 for z/OS 13 documentation', href: 'https://www.ibm.com/docs/en/db2-for-zos/13.0.0'},
          {label: 'OWASP', href: 'https://owasp.org/'},
          {label: 'PCI Security Standards Council', href: 'https://www.pcisecuritystandards.org/'},
          {label: 'South African Reserve Bank', href: 'https://www.resbank.co.za/'},
        ]},
        {title: 'Skunkworks Academy', items: [
          {label: 'Academy', href: 'https://skunkworksacademy.com/'},
          {label: 'IBM learning hub', href: 'https://ibm.skunkworksacademy.com/'},
        ]},
      ],
      copyright: 'Independent learning content by Skunkworks Academy. IBM, Db2, z/OS and RACF are trademarks of International Business Machines Corporation. Regulatory mappings are educational and require organisation-specific legal, risk and compliance validation.',
    },
    prism: {additionalLanguages: ['bash', 'sql', 'json']},
    mermaid: {theme: {light: 'neutral', dark: 'dark'}},
  } satisfies Preset.ThemeConfig,
};

export default config;

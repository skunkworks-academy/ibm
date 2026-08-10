import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'CLA96G',
  titleDelimiter: '·',
  tagline: 'A practical, self-paced DBA learning path from Skunkworks Academy',
  url: 'https://ibm.skunkworksacademy.com',
  baseUrl: '/db2/cla96/',
  organizationName: 'skunkworks-academy',
  projectName: 'ibm',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  favicon: 'img/favicon.svg',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: 'course',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/skunkworks-academy/ibm/tree/main/db2/cla96/',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        },
        blog: false,
        sitemap: {
          changefreq: 'weekly',
          priority: 0.7,
          ignorePatterns: ['/course/tags/**'],
        },
        theme: {
          customCss: ['./src/css/custom.css', './src/css/accessibility.css', './src/css/learning-v2.css', './src/css/learning-v3.css'],
        },
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
        name: 'CLA96G — IBM Db2 12.1 Foundation for Relational DBAs: Self-Paced Learning Companion',
        description:
          'An independent self-paced learning companion aligned to the four-part CLA96G structure, with objective mapping, mastery gates, stateful Db2 simulations, production-style incidents and assessment.',
        provider: {
          '@type': 'EducationalOrganization',
          name: 'Skunkworks Academy',
          url: 'https://skunkworksacademy.com/',
        },
        educationalLevel: 'Intermediate',
        timeRequired: 'PT36H',
        inLanguage: 'en',
        teaches: [
          'IBM Db2 12.1 administration',
          'data movement, backup and recovery',
          'security and concurrency',
          'statistics, query optimization and monitoring',
          'evidence-driven database incident response',
        ],
      }),
    },
  ],
  themeConfig: {
    metadata: [
      {
        name: 'description',
        content:
          'Interactive self-paced CLA96G learning companion for IBM Db2 12.1 relational database administrators, with objective mapping, mastery gates, stateful labs, incidents and randomized assessment.',
      },
      {
        name: 'keywords',
        content:
          'CLA96G, IBM Db2 12.1, Db2 DBA, database administration, backup recovery, HADR, RCAC, LBAC, RUNSTATS, REORG, EXPLAIN, Db2 performance, Db2 incident response',
      },
      {name: 'robots', content: 'index,follow,max-image-preview:large'},
    ],
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    announcementBar: {
      id: 'cla96g-learning-v3-2026',
      content:
        '<strong>Learning experience v3</strong> · official Part/Unit crosswalk · enforced mastery · stateful Db2 simulator · 12 DBA incidents · randomized objective-balanced assessment.',
      backgroundColor: '#0f62fe',
      textColor: '#ffffff',
      isCloseable: true,
    },
    navbar: {
      title: 'CLA96G · Db2 12.1',
      hideOnScroll: true,
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'courseSidebar',
          position: 'left',
          label: 'Course',
        },
        {to: '/course/objective-crosswalk', label: 'Objectives', position: 'left'},
        {to: '/course/incident-centre', label: 'Incident Centre', position: 'left'},
        {to: '/course/final-assessment', label: 'Assessment', position: 'left'},
        {to: '/course/next-steps', label: 'Next steps', position: 'left'},
        {
          href: 'https://www.ibm.com/training/course/ibm-db2-12-foundation-for-relational-dbas-CLA96G',
          label: 'IBM course page',
          position: 'right',
        },
        {
          href: 'https://github.com/skunkworks-academy/ibm/tree/main/db2/cla96',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: false,
      },
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Learn',
          items: [
            {label: 'Start course', to: '/course/intro'},
            {label: 'Objective crosswalk', to: '/course/objective-crosswalk'},
            {label: 'DBA Incident Centre', to: '/course/incident-centre'},
            {label: 'Final assessment', to: '/course/final-assessment'},
            {label: 'Next steps', to: '/course/next-steps'},
          ],
        },
        {
          title: 'Reference',
          items: [
            {label: 'IBM Db2 documentation', href: 'https://www.ibm.com/docs/en/db2/12.1'},
            {label: 'IBM Training', href: 'https://www.ibm.com/training/'},
          ],
        },
        {
          title: 'Skunkworks Academy',
          items: [
            {label: 'Academy', href: 'https://skunkworksacademy.com/'},
            {label: 'IBM training hub', href: 'https://ibm.skunkworksacademy.com/'},
          ],
        },
      ],
      copyright:
        'Independent learning companion by Skunkworks Academy. IBM and Db2 are trademarks of International Business Machines Corporation. This site does not reproduce official IBM courseware.',
    },
    prism: {
      additionalLanguages: ['bash', 'sql', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

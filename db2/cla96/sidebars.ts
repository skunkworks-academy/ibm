import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  courseSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Part 1 · Foundations & data management',
      collapsed: false,
      items: ['theory-part-1', 'part-1'],
    },
    {
      type: 'category',
      label: 'Part 2 · Recovery, utilities & availability',
      collapsed: false,
      items: ['theory-part-2', 'part-2'],
    },
    {
      type: 'category',
      label: 'Part 3 · Security & concurrency',
      collapsed: false,
      items: ['theory-part-3', 'part-3'],
    },
    {
      type: 'category',
      label: 'Part 4 · Performance & monitoring',
      collapsed: false,
      items: ['theory-part-4', 'part-4'],
    },
    'incident-centre',
    'final-assessment',
    {
      type: 'category',
      label: 'Reference toolkit',
      collapsed: true,
      items: ['command-library', 'glossary'],
    },
    'next-steps',
  ],
};

export default sidebars;

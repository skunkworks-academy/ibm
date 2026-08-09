import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  courseSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Part 1 · Foundations & data management',
      collapsed: false,
      items: ['part-1'],
    },
    {
      type: 'category',
      label: 'Part 2 · Recovery, utilities & availability',
      collapsed: false,
      items: ['part-2'],
    },
    {
      type: 'category',
      label: 'Part 3 · Security & concurrency',
      collapsed: false,
      items: ['part-3'],
    },
    {
      type: 'category',
      label: 'Part 4 · Performance & monitoring',
      collapsed: false,
      items: ['part-4'],
    },
    'final-assessment',
    'next-steps',
  ],
};

export default sidebars;

import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  courseSidebar: [
    'intro',
    'objective-crosswalk',
    {
      type: 'category',
      label: 'Part 1 · Essentials for Relational DBAs',
      collapsed: false,
      items: ['theory-part-1', 'part-1'],
    },
    {
      type: 'category',
      label: 'Part 2 · Data Management & Recovery',
      collapsed: false,
      items: ['theory-part-2', 'part-2'],
    },
    {
      type: 'category',
      label: 'Part 3 · Security & Concurrency',
      collapsed: false,
      items: ['theory-part-3', 'part-3'],
    },
    {
      type: 'category',
      label: 'Part 4 · Performance & Tuning Optimization',
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

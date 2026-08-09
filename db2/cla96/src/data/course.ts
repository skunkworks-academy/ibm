export type CourseLesson = {
  id: string;
  title: string;
  shortTitle: string;
  href: string;
  durationHours: number;
  outcomes: string[];
};

export const COURSE_STORAGE_KEY = 'cla96g-docusaurus-progress-v1';
export const ASSESSMENT_STORAGE_KEY = 'cla96g-docusaurus-assessment-v1';

export const lessons: CourseLesson[] = [
  {
    id: 'intro',
    title: 'Orientation, environment and DBA operating model',
    shortTitle: 'Orientation',
    href: '/course/intro',
    durationHours: 1,
    outcomes: [
      'Map the 36-hour learning path to your role and environment.',
      'Prepare a safe Db2 practice environment and evidence notebook.',
      'Adopt a baseline → change → validate → document operating discipline.',
    ],
  },
  {
    id: 'part-1',
    title: 'Part 1 · Foundations, configuration, storage and data movement',
    shortTitle: 'Part 1',
    href: '/course/part-1',
    durationHours: 9,
    outcomes: [
      'Explain Db2 12.1 architecture and version/service terminology.',
      'Configure instances and databases using controlled command-line workflows.',
      'Create and manage storage, database objects and data movement utilities.',
    ],
  },
  {
    id: 'part-2',
    title: 'Part 2 · Recovery, utilities, maintenance and availability',
    shortTitle: 'Part 2',
    href: '/course/part-2',
    durationHours: 8,
    outcomes: [
      'Design backup, restore and rollforward recovery procedures.',
      'Operate LOAD, IMPORT, EXPORT and maintenance utilities safely.',
      'Use monitoring evidence to validate utility and recovery states.',
    ],
  },
  {
    id: 'part-3',
    title: 'Part 3 · Security, access control and concurrency',
    shortTitle: 'Part 3',
    href: '/course/part-3',
    durationHours: 8,
    outcomes: [
      'Diagnose locking, deadlocks, timeouts and isolation behavior.',
      'Apply least-privilege authorities, roles and object privileges.',
      'Differentiate RCAC, LBAC, trusted contexts, encryption and auditing controls.',
    ],
  },
  {
    id: 'part-4',
    title: 'Part 4 · Statistics, optimization, monitoring and performance',
    shortTitle: 'Part 4',
    href: '/course/part-4',
    durationHours: 8,
    outcomes: [
      'Use statistics, indexes and EXPLAIN to reason about access plans.',
      'Apply Design Advisor and monitoring data to evidence-based tuning.',
      'Use Db2 AI Query Optimizer concepts responsibly with workload baselines.',
    ],
  },
  {
    id: 'incident-centre',
    title: 'DBA Incident Centre · Production-style simulations',
    shortTitle: 'Incidents',
    href: '/course/incident-centre',
    durationHours: 0,
    outcomes: [
      'Investigate lock contention using evidence before intervention.',
      'Protect recoverability while responding to archive-log capacity pressure.',
      'Diagnose query-plan regression after material data-distribution changes.',
    ],
  },
  {
    id: 'final-assessment',
    title: 'Final assessment · Production-readiness scenarios',
    shortTitle: 'Assessment',
    href: '/course/final-assessment',
    durationHours: 2,
    outcomes: [
      'Demonstrate integrated DBA judgment across administration, recovery, security and performance.',
      'Achieve at least 75% on scenario-based questions.',
      'Export a portable completion record for review or LMS evidence.',
    ],
  },
];

export const TOTAL_HOURS = lessons.reduce((sum, lesson) => sum + lesson.durationHours, 0);
export const PASS_SCORE = 75;

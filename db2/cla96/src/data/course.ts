export type CourseLesson = {
  id: string;
  title: string;
  shortTitle: string;
  href: string;
  durationHours: number;
  outcomes: string[];
};

export const COURSE_STORAGE_KEY = 'cla96g-docusaurus-progress-v1';
export const ASSESSMENT_STORAGE_KEY = 'cla96g-docusaurus-assessment-v2';

export const lessons: CourseLesson[] = [
  {
    id: 'intro',
    title: 'Orientation, environment and DBA operating model',
    shortTitle: 'Orientation',
    href: '/course/intro',
    durationHours: 1,
    outcomes: [
      'Map the guided self-paced path to the official CLA96G Part and Unit architecture.',
      'Prepare a safe Db2 practice environment and evidence notebook.',
      'Adopt a baseline → change → validate → document operating discipline.',
    ],
  },
  {
    id: 'part-1',
    title: 'Part 1 · Essentials for Relational DBAs',
    shortTitle: 'Part 1',
    href: '/course/part-1',
    durationHours: 8,
    outcomes: [
      'Explain Db2 12.1 platforms, editions, service levels, installation and connectivity.',
      'Operate CLP/CLPPlus/DMC and manage the Db2 database manager instance.',
      'Create databases and objects and perform foundational recovery/troubleshooting tasks.',
    ],
  },
  {
    id: 'part-2',
    title: 'Part 2 · Data Management and Recovery for Relational DBAs',
    shortTitle: 'Part 2',
    href: '/course/part-2',
    durationHours: 7,
    outcomes: [
      'Choose and operate SQL and utility-based data movement methods including LOAD and INGEST.',
      'Design and execute backup, recovery and HADR procedures.',
      'Perform maintenance, monitoring and problem determination using Db2 tools.',
    ],
  },
  {
    id: 'part-3',
    title: 'Part 3 · Security and Concurrency',
    shortTitle: 'Part 3',
    href: '/course/part-3',
    durationHours: 6,
    outcomes: [
      'Diagnose locking, isolation, waits, timeouts, deadlocks and escalation.',
      'Apply authentication, authorities, privileges and roles using least privilege.',
      'Use RCAC, LBAC, trusted contexts, encryption and auditing controls appropriately.',
    ],
  },
  {
    id: 'part-4',
    title: 'Part 4 · Performance and Tuning Optimization',
    shortTitle: 'Part 4',
    href: '/course/part-4',
    durationHours: 7,
    outcomes: [
      'Use statistics and query optimization concepts to explain access-path choices.',
      'Design and validate indexing strategies and Design Advisor recommendations.',
      'Use EXPLAIN, monitoring SQL, db2pd, dmctop and DMC for evidence-driven tuning.',
    ],
  },
  {
    id: 'incident-centre',
    title: 'DBA Incident Centre · Production-style simulations',
    shortTitle: 'Incidents',
    href: '/course/incident-centre',
    durationHours: 5,
    outcomes: [
      'Prioritize relevant evidence under a constrained investigation budget.',
      'Choose minimum-blast-radius actions across administration, recovery, security and performance incidents.',
      'Build repeatable incident evidence and remediation habits.',
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
    title: 'Final assessment · Objective-balanced production-readiness scenarios',
    shortTitle: 'Assessment',
    href: '/course/final-assessment',
    durationHours: 2,
    outcomes: [
      'Demonstrate integrated DBA judgment across all four official CLA96G parts.',
      'Achieve at least 75% overall with no part below the minimum domain floor.',
      'Use remediation results to target weak units before another attempt.',
    ],
  },
];

export const OFFICIAL_GUIDED_HOURS = 28;
export const TOTAL_HOURS = lessons.reduce((sum, lesson) => sum + lesson.durationHours, 0);
export const PASS_SCORE = 75;
export const PART_SCORE_FLOOR = 60;

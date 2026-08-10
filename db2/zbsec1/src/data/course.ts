export type Lesson = {
  id: string;
  title: string;
  shortTitle: string;
  href: string;
  durationHours: number;
  domain: string;
};

export const lessons: Lesson[] = [
  {id: 'm1', title: 'Architecture, banking threat model & Db2 13 baseline', shortTitle: 'Architecture', href: '/course/module-1-architecture-threat-model', durationHours: 4, domain: 'Architecture'},
  {id: 'm2', title: 'SAF/RACF identity and authorization IDs', shortTitle: 'RACF/SAF', href: '/course/module-2-racf-saf-identity', durationHours: 4, domain: 'Identity'},
  {id: 'm3', title: 'Db2 authorities, roles, privileges & separation of duties', shortTitle: 'Authorities', href: '/course/module-3-db2-authorities-sod', durationHours: 4, domain: 'Authorization'},
  {id: 'm4', title: 'Packages, plans, static SQL, CICS, IMS & batch identities', shortTitle: 'Packages', href: '/course/module-4-packages-cics-ims', durationHours: 4, domain: 'Applications'},
  {id: 'm5', title: 'DDF, DRDA, AT-TLS & network security', shortTitle: 'DDF/DRDA', href: '/course/module-5-ddf-drda-network-security', durationHours: 4, domain: 'Network'},
  {id: 'm6', title: 'Trusted contexts, roles, row permissions & column masks', shortTitle: 'Fine-grained access', href: '/course/module-6-trusted-context-rcac', durationHours: 4, domain: 'Data access'},
  {id: 'm7', title: 'DFSMS encryption, ICSF, keys, HSM & recovery', shortTitle: 'Cryptography', href: '/course/module-7-cryptography-key-management', durationHours: 4, domain: 'Cryptography'},
  {id: 'm8', title: 'Audit policies, IFCIDs, SMF, RACF evidence & SIEM', shortTitle: 'Audit', href: '/course/module-8-audit-smf-monitoring', durationHours: 4, domain: 'Detection'},
  {id: 'm9', title: 'OWASP-informed secure application engineering', shortTitle: 'OWASP', href: '/course/module-9-owasp-application-security', durationHours: 4, domain: 'Application security'},
  {id: 'm10', title: 'Banking compliance and regulatory control mapping', shortTitle: 'Compliance', href: '/course/module-10-compliance-regulatory', durationHours: 4, domain: 'Governance'},
  {id: 'm11', title: 'Incident response, PAM, break-glass & tabletop exercises', shortTitle: 'Response', href: '/course/module-11-incident-response-tabletops', durationHours: 4, domain: 'Operations'},
  {id: 'm12', title: 'Capstone: secure a fictional digital bank', shortTitle: 'Capstone', href: '/course/module-12-capstone', durationHours: 4, domain: 'Integration'},
];

export const totalHours = lessons.reduce((sum, lesson) => sum + lesson.durationHours, 0);

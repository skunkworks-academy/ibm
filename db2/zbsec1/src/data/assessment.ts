export type AssessmentQuestion = {
  id: string;
  domain: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  rationale: string;
};

export const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: 'a01', domain: 'Architecture',
    prompt: 'A bank wants one control statement that describes the full access chain for a remote Java application. Which sequence is most complete?',
    options: [
      'JDBC → table → disk',
      'Network trust → DDF → authenticated identity → Db2 authorization → package/object access → row/column controls → audit evidence',
      'RACF password → SYSADM → table',
      'Firewall → database backup → SIEM',
    ],
    correctIndex: 1,
    rationale: 'Banking security needs layered identity, transport, authorization, data-level enforcement and evidence; no single Db2 GRANT is the whole control chain.',
  },
  {
    id: 'a02', domain: 'Identity',
    prompt: 'Why must a security review consider both primary and secondary authorization IDs?',
    options: [
      'Secondary IDs only affect storage allocation',
      'Effective authority can be inherited through groups or other authorization context, so the primary ID alone may understate access',
      'Primary IDs are never used for Db2',
      'Secondary IDs only exist for distributed users',
    ],
    correctIndex: 1,
    rationale: 'An access review must determine the effective privilege set, not merely the login name.',
  },
  {
    id: 'a03', domain: 'Authorization',
    prompt: 'Which design best supports separation of duties for a production banking database?',
    options: [
      'Every DBA receives unrestricted data access because they administer the subsystem',
      'Security administration, system/database administration and application data access are separated and individually auditable',
      'One shared SYSADM account is used for all support work',
      'Developers receive production SELECT so they can troubleshoot faster',
    ],
    correctIndex: 1,
    rationale: 'Banking operations should separate administration from business-data access and preserve individual accountability.',
  },
  {
    id: 'a04', domain: 'Authorization',
    prompt: 'What is the key security value of SEPARATE_SECURITY=YES in a properly designed Db2 for z/OS environment?',
    options: [
      'It encrypts every table automatically',
      'It prevents security administration from being implicitly collapsed into SYSADM and supports stronger separation of duties',
      'It disables RACF',
      'It prevents all dynamic SQL',
    ],
    correctIndex: 1,
    rationale: 'The control is about authority separation, especially around security objects and grants, rather than encryption or SQL mode.',
  },
  {
    id: 'a05', domain: 'Applications',
    prompt: 'Why can static SQL packages reduce the need for broad direct table privileges in banking applications?',
    options: [
      'Static SQL removes the need for authorization',
      'Controlled EXECUTE authority can be granted on bound application packages while underlying access is governed by package ownership and bind-time/runtime rules',
      'Packages bypass auditing',
      'Packages automatically mask all columns',
    ],
    correctIndex: 1,
    rationale: 'Package-mediated access can narrow the application interface, but package ownership, bind authority and runtime context still require careful governance.',
  },
  {
    id: 'a06', domain: 'Applications',
    prompt: 'A CICS region uses a shared application identity to reach Db2. What is the main security question?',
    options: [
      'Whether the region has enough CPU',
      'Whether user identity and accountability are preserved or intentionally mapped through the middleware security design',
      'Whether the table is compressed',
      'Whether the database has a clustering index',
    ],
    correctIndex: 1,
    rationale: 'Shared middleware identities can obscure the actor unless identity propagation, transaction security and audit attribution are deliberately designed.',
  },
  {
    id: 'a07', domain: 'Network',
    prompt: 'Which control set best protects DDF traffic from an external application tier?',
    options: [
      'Open listener port and application password only',
      'Network segmentation, authenticated endpoints, protected credentials, approved TLS/AT-TLS policy, certificate lifecycle controls and Db2 authorization checks',
      'Database REORG and RUNSTATS',
      'SMF retention without transport encryption',
    ],
    correctIndex: 1,
    rationale: 'DDF security spans network path, TLS policy, authentication, authorization and lifecycle management.',
  },
  {
    id: 'a08', domain: 'Network',
    prompt: 'A production DDF certificate expires in 12 hours. Which response is best?',
    options: [
      'Disable TLS permanently to avoid an outage',
      'Use the approved certificate-renewal/change playbook, validate trust chains and dependent clients, and retain evidence of the change',
      'Grant SYSADM to the application team',
      'Wait for the outage to prove the certificate is used',
    ],
    correctIndex: 1,
    rationale: 'Certificate expiry is an operational security event that should be remediated through controlled change and dependency validation, not by weakening transport controls.',
  },
  {
    id: 'a09', domain: 'Data access',
    prompt: 'A teller should see only customers in the teller’s branch. Which Db2 control most directly enforces this close to the data?',
    options: ['Column mask', 'Row permission', 'Buffer pool', 'Archive log'],
    correctIndex: 1,
    rationale: 'Row permissions filter which rows are visible to a context; column masks transform visibility of a column value.',
  },
  {
    id: 'a10', domain: 'Data access',
    prompt: 'A call-centre user may see only the last four digits of a payment card number. Which control is most directly applicable?',
    options: ['Column mask', 'Row permission', 'Package cache', 'DDF secure port'],
    correctIndex: 0,
    rationale: 'A column mask can present a context-dependent representation of a sensitive column while keeping policy enforcement in Db2.',
  },
  {
    id: 'a11', domain: 'Data access',
    prompt: 'What problem does a trusted context solve most directly?',
    options: [
      'Disk failure',
      'Controlled trust and privilege/role mapping for known connection characteristics in multi-tier environments',
      'Index fragmentation',
      'Backup compression',
    ],
    correctIndex: 1,
    rationale: 'Trusted contexts address controlled identity/role use under defined connection attributes; they are not a storage or performance feature.',
  },
  {
    id: 'a12', domain: 'Cryptography',
    prompt: 'Why is “the Db2 data sets are encrypted” not enough for a banking cryptography review?',
    options: [
      'Encryption has no security value',
      'The review must also cover key ownership, ICSF/key access, rotation, recovery-site availability, backup handling and revocation procedures',
      'Only application passwords matter',
      'Db2 data sets cannot be encrypted',
    ],
    correctIndex: 1,
    rationale: 'Cryptographic protection is only as resilient as the key-management lifecycle and recovery design that supports it.',
  },
  {
    id: 'a13', domain: 'Cryptography',
    prompt: 'A disaster-recovery LPAR has the restored encrypted Db2 data sets but cannot open them. Which investigation should be prioritized?',
    options: [
      'Add more buffer pool memory',
      'Verify the required cryptographic keys/key labels, ICSF availability and security profiles are present and authorized at DR',
      'Drop the indexes',
      'Disable audit',
    ],
    correctIndex: 1,
    rationale: 'Encrypted recovery depends on both the data and the cryptographic/security services required to use its keys.',
  },
  {
    id: 'a14', domain: 'Detection',
    prompt: 'A DBA queried a high-risk customer table at 02:13. What is the strongest investigation approach?',
    options: [
      'Ask the DBA whether it happened and close the ticket',
      'Correlate Db2 audit/IFCID and SMF evidence with RACF identity, application/session context, PAM/change records and network evidence',
      'Check only CPU metrics',
      'Revoke every DBA account immediately without preserving evidence',
    ],
    correctIndex: 1,
    rationale: 'Privileged investigations require cross-source evidence, time correlation and preservation before conclusions or disruptive remediation.',
  },
  {
    id: 'a15', domain: 'Detection',
    prompt: 'Which principle makes an audit control useful to banking operations?',
    options: [
      'Capture as much data as possible with no retention plan',
      'Capture security-relevant events with attributable identity, protected retention, time consistency, review/alert logic and tested retrieval',
      'Record only successful logins',
      'Let administrators erase their own history to save space',
    ],
    correctIndex: 1,
    rationale: 'Audit effectiveness requires attributable, protected and reviewable evidence, not merely raw log volume.',
  },
  {
    id: 'a16', domain: 'OWASP',
    prompt: 'What is the preferred first-line application control against SQL injection?',
    options: [
      'String concatenation plus blacklist filters',
      'Prepared/parameterized statements with least-privilege database access and input validation appropriate to the field',
      'Granting wider privileges so failed statements succeed',
      'Turning off database errors',
    ],
    correctIndex: 1,
    rationale: 'Parameterized interfaces separate data from SQL structure. Least privilege limits impact if another control fails.',
  },
  {
    id: 'a17', domain: 'OWASP',
    prompt: 'A long-lived shared service credential is embedded in application source. What is the strongest remediation direction?',
    options: [
      'Rename the account',
      'Move the secret to an approved secrets/identity mechanism, rotate it, reduce privilege and lifetime, remove it from history where feasible, and monitor use',
      'Base64-encode the password',
      'Document it in the README for support staff',
    ],
    correctIndex: 1,
    rationale: 'Non-human identities require lifecycle, secret protection, rotation, privilege minimization and observability.',
  },
  {
    id: 'a18', domain: 'Governance',
    prompt: 'What is the correct way to use PCI DSS, POPIA, banking cyber-resilience standards and NIST/OWASP guidance together?',
    options: [
      'Treat them as identical legal requirements',
      'Map applicable obligations and contractual requirements to technical/operational controls, use frameworks as implementation guidance, and have legal/risk owners validate scope',
      'Choose only the shortest framework',
      'Use OWASP as a substitute for the bank’s regulator',
    ],
    correctIndex: 1,
    rationale: 'Different sources have different legal status and scope. A defensible control framework maps them explicitly rather than conflating them.',
  },
  {
    id: 'a19', domain: 'Governance',
    prompt: 'A bank stores cardholder data on a mainframe. Which assumption is unsafe?',
    options: [
      'Mainframe cardholder data can still be in PCI DSS scope',
      'Because the platform is a mainframe, PCI DSS storage controls do not apply',
      'Scope depends on the cardholder-data environment and applicable controls',
      'Evidence should demonstrate how the control objective is met on the actual platform',
    ],
    correctIndex: 1,
    rationale: 'Platform type does not create a blanket exemption from cardholder-data protection obligations.',
  },
  {
    id: 'a20', domain: 'Governance',
    prompt: 'Which statement best reflects POPIA security safeguards in a Db2 banking context?',
    options: [
      'A single annual penetration test is sufficient',
      'The organization should identify foreseeable risks, establish and verify safeguards, and maintain them as risks and practices change',
      'Encryption removes all other obligations',
      'Only the database vendor is responsible for safeguards',
    ],
    correctIndex: 1,
    rationale: 'Security safeguards are risk-based and ongoing, spanning technical and organisational measures.',
  },
  {
    id: 'a21', domain: 'Operations',
    prompt: 'A privileged emergency change is required during a payment outage. Which break-glass model is strongest?',
    options: [
      'A shared permanent emergency password known by the DBA team',
      'Individually attributable, time-bound elevated access with approval/justification, session evidence, post-use review and rapid credential/entitlement revocation',
      'Disable auditing during the emergency',
      'Give all responders SYSADM for the rest of the month',
    ],
    correctIndex: 1,
    rationale: 'Emergency access should increase operational speed without sacrificing accountability, time bounds or post-event review.',
  },
  {
    id: 'a22', domain: 'Operations',
    prompt: 'A suspected compromised application ID is actively making unusual queries. What should happen before destructive remediation where operationally feasible?',
    options: [
      'Preserve relevant evidence and establish scope while using containment that minimizes additional damage',
      'Delete all audit data',
      'Drop the production database',
      'Post the credentials in the incident chat so everyone can test them',
    ],
    correctIndex: 0,
    rationale: 'Incident handling balances evidence preservation, containment, service impact and coordinated remediation.',
  },
  {
    id: 'a23', domain: 'Integration',
    prompt: 'Which evidence bundle best proves least privilege for a production banking application?',
    options: [
      'A screenshot showing the application logged in',
      'Business role definition, identity/group/role mapping, effective Db2 privileges, package/object grants, row/column policy, approved exceptions, recertification record and audit evidence',
      'A database size report',
      'A list of all employees',
    ],
    correctIndex: 1,
    rationale: 'Least privilege is a traceable chain from business need through identity and technical entitlements to periodic validation and runtime evidence.',
  },
  {
    id: 'a24', domain: 'Integration',
    prompt: 'What is the strongest capstone design principle for securing Db2 for z/OS in a bank?',
    options: [
      'Rely on the mainframe perimeter and minimize internal controls',
      'Design overlapping preventive, detective and recovery controls so identity, authorization, data protection, transport, audit and incident processes reinforce one another',
      'Grant broad access and depend on annual audit',
      'Focus exclusively on SQL injection',
    ],
    correctIndex: 1,
    rationale: 'Banking security is defense in depth: no single control should be treated as the entire security boundary.',
  },
];

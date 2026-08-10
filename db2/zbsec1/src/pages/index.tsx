import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {lessons, totalHours} from '../data/course';
import {CourseProgress, ResumeLearning} from '../components/LearningWidgets';

const descriptions: Record<string, string> = {
  m1: 'Map the banking attack surface across z/OS, Db2 subsystems, applications, identities, data and recovery dependencies.',
  m2: 'Trace SAF/RACF authentication into primary and secondary Db2 authorization IDs and effective access.',
  m3: 'Separate security, system administration and data access using Db2 13 authority design and evidence.',
  m4: 'Secure static SQL, packages, plans and transaction managers without collapsing every action into a shared identity.',
  m5: 'Protect distributed access through DDF/DRDA, network segmentation, TLS/AT-TLS and credential lifecycle controls.',
  m6: 'Apply trusted contexts, roles, row permissions and column masks to keep policy close to sensitive data.',
  m7: 'Design encryption and key-management controls spanning DFSMS, ICSF, HSM-backed keys, backup and disaster recovery.',
  m8: 'Turn Db2/RACF activity into attributable, retained and actionable evidence with IFCIDs, SMF and SIEM correlation.',
  m9: 'Translate OWASP guidance into secure SQL, non-human identity, secret, error-handling and logging controls.',
  m10: 'Map technical controls to South African financial-sector standards, POPIA, PCI DSS and recognised security frameworks.',
  m11: 'Practice containment, break-glass access, evidence preservation and regulatory decision-making through table-top scenarios.',
  m12: 'Produce a defensible target architecture, control matrix, test plan and incident-ready evidence pack for a fictional digital bank.',
};

export default function Home(): React.JSX.Element {
  return (
    <Layout title="ZBSEC1 · IBM Db2 for z/OS Banking Security" description="48-hour self-paced IBM Db2 for z/OS banking security course.">
      <main>
        <section className="course-hero">
          <div className="container course-hero__grid">
            <div>
              <span className="eyebrow">Skunkworks Academy · ZBSEC1</span>
              <h1>Db2 for z/OS banking security, end to end.</h1>
              <p className="course-hero__lead">Build the control chain from RACF identity to Db2 authorization, application packages, DDF transport, row/column policy, cryptography, audit evidence, compliance and incident response.</p>
              <div className="course-hero__actions">
                <Link className="button button--primary button--lg" to="/course/intro">Start the course →</Link>
                <Link className="button button--secondary button--lg" to="/course/lab-centre">Open Lab Centre</Link>
              </div>
            </div>
            <div className="hero-facts" aria-label="Course facts">
              <div className="hero-fact"><strong>{totalHours} hours</strong><span>12 guided security modules</span></div>
              <div className="hero-fact"><strong>24 questions</strong><span>scenario-based final assessment</span></div>
              <div className="hero-fact"><strong>80% mastery</strong><span>with domain-level remediation</span></div>
              <div className="hero-fact"><strong>Safe labs</strong><span>browser simulation + authorised z/OS practice track</span></div>
            </div>
          </div>
        </section>

        <section className="course-section">
          <div className="container">
            <ResumeLearning />
            <CourseProgress />
          </div>
        </section>

        <section className="course-section">
          <div className="container">
            <div className="section-heading"><div><span className="eyebrow">Learning path</span><h2>12 modules. One defensible control model.</h2></div></div>
            <div className="learning-grid">
              {lessons.map((lesson, index) => (
                <Link className="learning-card" to={lesson.href} key={lesson.id}>
                  <div className="learning-card__meta"><span>Module {index + 1}</span><span>{lesson.durationHours}h · {lesson.domain}</span></div>
                  <h3>{lesson.title}</h3>
                  <p>{descriptions[lesson.id]}</p>
                  <span className="learning-card__cta">Open module →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="course-section">
          <div className="container control-grid">
            <div className="control-card"><span className="eyebrow">Practice</span><strong>Evidence labs</strong><p>Review synthetic RACF, privilege, DDF and SMF evidence; then repeat the workflow in an authorised non-production z/OS environment.</p></div>
            <div className="control-card"><span className="eyebrow">Operate</span><strong>Banking playbooks</strong><p>Work through compromised identities, privileged-access anomalies, TLS expiry, key failure, SQL injection and audit-gap scenarios.</p></div>
            <div className="control-card"><span className="eyebrow">Prove</span><strong>Compliance mapping</strong><p>Connect technical evidence to PCI DSS, POPIA, South African financial-sector cyber-resilience requirements and risk frameworks.</p></div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

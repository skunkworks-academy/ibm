import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {CourseProgress} from '../components/LearningWidgets';
import {lessons, TOTAL_HOURS} from '../data/course';

export default function Home(): JSX.Element {
  return (
    <Layout
      title="Self-paced Db2 12.1 DBA course"
      description="Interactive self-paced CLA96G learning companion for IBM Db2 12.1 relational database administrators.">
      <main>
        <section className="course-hero">
          <div className="container course-hero__grid">
            <div>
              <span className="eyebrow">CLA96G · IBM Db2 12.1 · Intermediate</span>
              <h1>Operate Db2 like a production DBA.</h1>
              <p className="course-hero__lead">
                A scenario-driven, self-paced learning companion for relational DBAs. Build operational judgment across configuration,
                utilities, recovery, security, concurrency, monitoring and query performance — with safe simulations, checkpoints and a
                production-readiness assessment.
              </p>
              <div className="course-hero__actions">
                <Link className="button button--primary button--lg" to="/course/intro">Start learning →</Link>
                <Link className="button button--secondary button--lg" to="/course/final-assessment">View assessment</Link>
              </div>
            </div>
            <aside className="course-hero__facts" aria-label="Course facts">
              <div className="hero-fact"><strong>{TOTAL_HOURS} hours</strong><span>Recommended guided learning time</span></div>
              <div className="hero-fact"><strong>4 technical parts</strong><span>Administration · recovery · security · performance</span></div>
              <div className="hero-fact"><strong>75% mastery</strong><span>Scenario-based final assessment threshold</span></div>
              <div className="hero-fact"><strong>SCORM-aware</strong><span>Browser progress works standalone; SCORM 1.2 reports when available</span></div>
            </aside>
          </div>
        </section>

        <section className="course-section">
          <div className="container">
            <CourseProgress />
          </div>
        </section>

        <section className="course-section">
          <div className="container">
            <div className="course-section__header">
              <div>
                <span className="eyebrow">Learning path</span>
                <h2>From baseline to production judgment.</h2>
              </div>
              <p>Each milestone combines explanation, operational patterns, a safe command lab, scenarios and knowledge checks.</p>
            </div>
            <div className="learning-path-grid">
              {lessons.map((lesson, index) => (
                <Link className="learning-card" key={lesson.id} to={lesson.href}>
                  <div className="learning-card__meta">
                    <span>{String(index + 1).padStart(2, '0')} / {String(lessons.length).padStart(2, '0')}</span>
                    <span>{lesson.durationHours}h</span>
                  </div>
                  <h3>{lesson.title}</h3>
                  <ul>
                    {lesson.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}
                  </ul>
                  <span className="learning-card__cta">Open milestone →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="course-section">
          <div className="container">
            <div className="course-section__header">
              <div>
                <span className="eyebrow">Operating model</span>
                <h2>Evidence before intervention.</h2>
              </div>
            </div>
            <div className="command-sequence" aria-label="DBA operating sequence">
              <div><strong>01 · Baseline</strong><span>Capture version, configuration, workload and current state.</span></div>
              <div><strong>02 · Hypothesis</strong><span>Define what signal or mechanism you believe explains the symptom.</span></div>
              <div><strong>03 · Change</strong><span>Apply the smallest justified change with known scope and rollback.</span></div>
              <div><strong>04 · Validate</strong><span>Compare technical and user-facing outcomes against the baseline.</span></div>
              <div><strong>05 · Document</strong><span>Retain commands, evidence, decisions and follow-up actions.</span></div>
            </div>
          </div>
        </section>

        <section className="course-section">
          <div className="container callout-grid">
            <div className="callout-card">
              <strong>Independent learning companion</strong>
              <p>This site aligns to publicly described CLA96G skills but does not reproduce official IBM courseware.</p>
            </div>
            <div className="callout-card">
              <strong>Safe by design</strong>
              <p>Browser labs simulate output. Run real commands only in an authorized Db2 lab or governed production change.</p>
            </div>
            <div className="callout-card">
              <strong>Performance-conscious</strong>
              <p>System fonts, limited dependencies, reduced-motion support and CI Lighthouse thresholds keep the learning UI fast.</p>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

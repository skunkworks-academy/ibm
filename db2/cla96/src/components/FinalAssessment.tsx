import React, {useEffect, useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import {ASSESSMENT_STORAGE_KEY, COURSE_STORAGE_KEY, PASS_SCORE} from '../data/course';
import {scormReport} from '../utils/scorm';

type Question = {
  prompt: string;
  options: string[];
  correctIndex: number;
  rationale: string;
  domain: string;
};

const questions: Question[] = [
  {
    domain: 'Versioning',
    prompt: 'A change record says “Db2 12.1” but does not identify the installed service level. What should the DBA establish before assessing an upgrade or defect fix?',
    options: [
      'Only the database name',
      'The exact installed mod/fix/service level and the target level, including compatibility and prerequisites',
      'The number of schemas',
      'Whether the application uses JDBC',
    ],
    correctIndex: 1,
    rationale: 'Version alone is insufficient for change planning. Establish the exact service level, prerequisites, compatibility and rollback path.',
  },
  {
    domain: 'Configuration',
    prompt: 'You need to change a database configuration parameter in production. Which workflow is strongest?',
    options: [
      'UPDATE DB CFG immediately and restart until the symptom disappears',
      'Capture GET DB CFG baseline, confirm scope/dynamic behavior, change one justified value, validate, document and retain rollback values',
      'Change the equivalent instance parameter instead',
      'Use AUTOCONFIGURE and accept every recommendation automatically',
    ],
    correctIndex: 1,
    rationale: 'Controlled administration starts with scope, baseline, change intent, validation and rollback readiness.',
  },
  {
    domain: 'Utilities',
    prompt: 'A LOAD was started by an overnight batch and users now report an unavailable table. What should you inspect first?',
    options: [
      'Drop and recreate the table',
      'LIST UTILITIES / MON_GET_UTILITY / LOAD_QUERY plus utility messages and table state',
      'Increase sortheap',
      'Run RUNSTATS repeatedly',
    ],
    correctIndex: 1,
    rationale: 'Utility state and message evidence tells you whether the load is active, failed, pending, or requires follow-up action.',
  },
  {
    domain: 'Recovery',
    prompt: 'A restore completed successfully but the database remains in rollforward pending. What is the correct interpretation?',
    options: [
      'The restore image is corrupt',
      'Recovery is incomplete; required logs must be applied and rollforward ended at the intended recovery point',
      'The database requires REORG',
      'The instance must always be recreated',
    ],
    correctIndex: 1,
    rationale: 'A successful restore does not necessarily complete recovery. Rollforward pending explicitly signals more recovery work.',
  },
  {
    domain: 'Logging',
    prompt: 'A recurring batch causes log-full events. What is the best first response?',
    options: [
      'Disable logging',
      'Measure transaction/log generation, archive throughput and capacity; then adjust log sizing or batch design based on evidence',
      'Drop indexes without analysis',
      'Increase bufferpool memory',
    ],
    correctIndex: 1,
    rationale: 'Log pressure is a capacity/workload/recovery-design problem. Measure before changing configuration.',
  },
  {
    domain: 'Concurrency',
    prompt: 'CPU is normal, application latency is high, and lock waits suddenly increase. What is the priority investigation?',
    options: [
      'Add CPU',
      'Identify the blocking chain, root blocker, held/requested lock modes and transaction context',
      'Collect more frequent RUNSTATS',
      'Disable locking',
    ],
    correctIndex: 1,
    rationale: 'Lock waits point to contention. Root-blocker analysis gives a causal path and avoids unrelated tuning.',
  },
  {
    domain: 'Isolation',
    prompt: 'Which statement best describes the trade-off when moving a workload toward stricter isolation?',
    options: [
      'Stricter isolation can improve consistency guarantees but may reduce concurrency and increase locking pressure',
      'Stricter isolation always increases throughput',
      'Isolation only changes authentication behavior',
      'Isolation has no effect on data visibility',
    ],
    correctIndex: 0,
    rationale: 'Isolation is a correctness/concurrency policy. Stronger guarantees generally have a concurrency cost that must be understood.',
  },
  {
    domain: 'Authorities',
    prompt: 'An application support team needs to create and maintain objects in one controlled schema but should not administer database security. What is the best principle?',
    options: [
      'Grant SECADM to simplify support',
      'Grant SYSADM to avoid future tickets',
      'Use least-privilege schema/object privileges and roles; keep security administration duties separated',
      'Grant DATAACCESS to PUBLIC',
    ],
    correctIndex: 2,
    rationale: 'Separation of duties and least privilege reduce blast radius and support auditability.',
  },
  {
    domain: 'Fine-grained access',
    prompt: 'You must let different users see different rows from the same table based on policy. Which Db2 capability is the most direct fit?',
    options: ['RCAC row permissions', 'REORGCHK', 'HADR peer window', 'LOGSECOND'],
    correctIndex: 0,
    rationale: 'Row and Column Access Control can enforce row permissions and column masks within Db2.',
  },
  {
    domain: 'Statistics',
    prompt: 'A bulk data change materially shifts value distribution and query plans regress. What is a sensible evidence-driven sequence?',
    options: [
      'Add several indexes immediately',
      'Refresh appropriate statistics, compare EXPLAIN/cardinality estimates, then change indexes only if the evidence supports it',
      'Restart Db2',
      'Disable the optimizer',
    ],
    correctIndex: 1,
    rationale: 'Stale or incomplete statistics can mislead the optimizer. Validate estimates before structural changes.',
  },
  {
    domain: 'EXPLAIN',
    prompt: 'EXPLAIN estimates 100 rows but runtime monitoring consistently shows 4 million. What should you investigate early?',
    options: [
      'Whether statistics/selectivity assumptions are inaccurate or stale',
      'Whether the terminal font is correct',
      'Whether the backup directory is empty',
      'Whether all users have DBADM',
    ],
    correctIndex: 0,
    rationale: 'Large estimated-versus-actual cardinality gaps are a strong signal to inspect statistics, skew, predicates and parameter sensitivity.',
  },
  {
    domain: 'Design Advisor',
    prompt: 'Design Advisor recommends a new index. What makes the recommendation production-ready?',
    options: [
      'The recommendation alone',
      'Testing against representative workload, validating read benefit and write/storage cost, and keeping a rollback plan',
      'Creating every suggested index',
      'Disabling existing indexes first',
    ],
    correctIndex: 1,
    rationale: 'Advisor output is evidence, not an automatic change. Validate the net workload effect.',
  },
  {
    domain: 'Monitoring',
    prompt: 'What is the strongest 10-minute performance triage approach?',
    options: [
      'Change configuration until users stop complaining',
      'Correlate workload rate, waits, top SQL, locks, I/O, logging, memory and recent changes against a baseline',
      'Focus only on CPU',
      'Collect a full support bundle before checking current state',
    ],
    correctIndex: 1,
    rationale: 'Correlation across workload, resource and wait signals narrows the causal domain quickly and safely.',
  },
  {
    domain: 'AI Query Optimizer',
    prompt: 'How should a DBA treat AI-driven optimizer recommendations in a governed production environment?',
    options: [
      'As automatic authority to change production',
      'As an additional decision signal that still requires workload baselines, validation, change control and rollback readiness',
      'As a replacement for statistics',
      'As a replacement for monitoring',
    ],
    correctIndex: 1,
    rationale: 'AI-assisted optimization should strengthen evidence, not bypass operational governance.',
  },
  {
    domain: 'Recovery validation',
    prompt: 'Which statement is the strongest recovery assurance?',
    options: [
      'The backup command returned successfully',
      'The backup file exists',
      'A representative restore and recovery test met the documented RPO/RTO and application validation criteria',
      'The archive filesystem has free space',
    ],
    correctIndex: 2,
    rationale: 'Recovery capability is proven by tested restore/recovery outcomes against service objectives, not backup existence alone.',
  },
  {
    domain: 'Operational governance',
    prompt: 'A DBA wants to restart the instance immediately during an incident. What should happen first when service impact allows?',
    options: [
      'Capture time-correlated diagnostic evidence and current state so restart does not erase the strongest clues',
      'Delete db2diag.log',
      'Reset all configuration',
      'Run REORG on every table',
    ],
    correctIndex: 0,
    rationale: 'Evidence before intervention is central to reliable root-cause analysis and prevents destructive troubleshooting.',
  },
];

type StoredAssessment = {
  bestScore: number;
  latestScore: number;
  attempts: number;
  passed: boolean;
  updatedAt: string;
};

function readStored(): StoredAssessment | null {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(window.localStorage.getItem(ASSESSMENT_STORAGE_KEY) ?? 'null') as StoredAssessment | null;
  } catch {
    return null;
  }
}

function markCourseCompleteIfPassed(score: number) {
  if (typeof window === 'undefined' || score < PASS_SCORE) return;
  try {
    const progress = JSON.parse(window.localStorage.getItem(COURSE_STORAGE_KEY) ?? '{"completed":[]}') as {completed?: string[]};
    const completed = Array.from(new Set([...(progress.completed ?? []), 'final-assessment']));
    const next = {completed, updatedAt: new Date().toISOString()};
    window.localStorage.setItem(COURSE_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('cla96-progress', {detail: next}));
  } catch {
    // Assessment record remains available even if progress storage is unavailable.
  }
}

export default function FinalAssessment() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [stored, setStored] = useState<StoredAssessment | null>(null);

  useEffect(() => setStored(readStored()), []);

  const answeredCount = Object.keys(answers).length;
  const score = useMemo(() => {
    const correct = questions.reduce((total, question, index) => total + (answers[index] === question.correctIndex ? 1 : 0), 0);
    return Math.round((correct / questions.length) * 100);
  }, [answers]);

  const submit = () => {
    if (answeredCount !== questions.length) return;
    const previous = readStored();
    const bestScore = Math.max(previous?.bestScore ?? 0, score);
    const record: StoredAssessment = {
      bestScore,
      latestScore: score,
      attempts: (previous?.attempts ?? 0) + 1,
      passed: bestScore >= PASS_SCORE,
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(record));
    setStored(record);
    setLatestScore(score);
    setSubmitted(true);
    markCourseCompleteIfPassed(bestScore);
    scormReport({score: bestScore, status: bestScore >= PASS_SCORE ? 'passed' : 'failed', lessonLocation: window.location.pathname});
  };

  const resetAttempt = () => {
    setAnswers({});
    setSubmitted(false);
    setLatestScore(null);
  };

  const exportRecord = () => {
    const record = readStored();
    const payload = {
      course: 'CLA96G — IBM Db2 12.1 Foundation for Relational DBAs self-paced companion',
      passScore: PASS_SCORE,
      assessment: record,
      exportedAt: new Date().toISOString(),
      note: 'Browser-local learner evidence. Identity verification and proctoring are not provided by this self-paced companion.',
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'cla96g-completion-record.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="assessment-shell">
      <div className="assessment-summary">
        <div><span className="eyebrow">Pass threshold</span><strong>{PASS_SCORE}%</strong></div>
        <div><span className="eyebrow">Answered</span><strong>{answeredCount}/{questions.length}</strong></div>
        <div><span className="eyebrow">Best score</span><strong>{stored?.bestScore ?? 0}%</strong></div>
        <div><span className="eyebrow">Attempts</span><strong>{stored?.attempts ?? 0}</strong></div>
      </div>

      {questions.map((question, index) => {
        const chosen = answers[index];
        const isCorrect = chosen === question.correctIndex;
        return (
          <section className="assessment-question" key={`${question.domain}-${index}`}>
            <div className="assessment-question__meta"><span>Question {index + 1}</span><span>{question.domain}</span></div>
            <h3>{question.prompt}</h3>
            <div className="knowledge-check__options" role="radiogroup" aria-label={`Question ${index + 1}`}>
              {question.options.map((option, optionIndex) => (
                <label className="quiz-option" key={option}>
                  <input
                    type="radio"
                    name={`assessment-${index}`}
                    checked={chosen === optionIndex}
                    disabled={submitted}
                    onChange={() => setAnswers((current) => ({...current, [index]: optionIndex}))}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            {submitted && (
              <div className={isCorrect ? 'quiz-feedback quiz-feedback--good' : 'quiz-feedback quiz-feedback--retry'}>
                <strong>{isCorrect ? 'Correct.' : `Correct answer: ${question.options[question.correctIndex]}.`}</strong> {question.rationale}
              </div>
            )}
          </section>
        );
      })}

      <div className="assessment-actions">
        {!submitted ? (
          <button className="button button--primary button--lg" type="button" disabled={answeredCount !== questions.length} onClick={submit}>
            Submit assessment
          </button>
        ) : (
          <button className="button button--secondary button--lg" type="button" onClick={resetAttempt}>Start another attempt</button>
        )}
        {stored && <button className="button button--secondary button--lg" type="button" onClick={exportRecord}>Export completion record</button>}
      </div>

      {submitted && latestScore !== null && (
        <div className={latestScore >= PASS_SCORE ? 'assessment-result assessment-result--pass' : 'assessment-result assessment-result--retry'} role="status">
          <span className="eyebrow">Latest result</span>
          <h2>{latestScore}% · {latestScore >= PASS_SCORE ? 'Pass' : 'Review and retry'}</h2>
          <p>{latestScore >= PASS_SCORE ? 'You met the mastery threshold for this learning companion.' : 'Use the rationales above to target your review. Your best score is retained.'}</p>
          {latestScore >= PASS_SCORE && <Link className="button button--primary" to="/course/next-steps">Continue to next steps →</Link>}
        </div>
      )}
    </div>
  );
}

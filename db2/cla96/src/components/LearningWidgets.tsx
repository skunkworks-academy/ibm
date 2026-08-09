import React, {useEffect, useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import {COURSE_STORAGE_KEY, lessons} from '../data/course';
import {scormReport} from '../utils/scorm';

type ProgressState = {
  completed: string[];
  updatedAt: string;
};

const emptyProgress = (): ProgressState => ({completed: [], updatedAt: new Date().toISOString()});

function readProgress(): ProgressState {
  if (typeof window === 'undefined') return emptyProgress();
  try {
    const raw = window.localStorage.getItem(COURSE_STORAGE_KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      completed: Array.isArray(parsed.completed) ? parsed.completed.filter(Boolean) : [],
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return emptyProgress();
  }
}

function writeProgress(progress: ProgressState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(COURSE_STORAGE_KEY, JSON.stringify(progress));
  window.dispatchEvent(new CustomEvent('cla96-progress', {detail: progress}));
}

export function CourseProgress({compact = false}: {compact?: boolean}) {
  const [progress, setProgress] = useState<ProgressState>(emptyProgress());

  useEffect(() => {
    const refresh = () => setProgress(readProgress());
    refresh();
    window.addEventListener('cla96-progress', refresh as EventListener);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('cla96-progress', refresh as EventListener);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const completed = useMemo(
    () => lessons.filter((lesson) => progress.completed.includes(lesson.id)),
    [progress],
  );
  const percentage = Math.round((completed.length / lessons.length) * 100);
  const hoursCompleted = completed.reduce((sum, lesson) => sum + lesson.durationHours, 0);
  const hoursTotal = lessons.reduce((sum, lesson) => sum + lesson.durationHours, 0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    scormReport({
      lessonLocation: window.location.pathname,
      status: percentage === 100 ? 'completed' : 'incomplete',
    });
  }, [percentage]);

  return (
    <section className={compact ? 'course-progress course-progress--compact' : 'course-progress'} aria-label="Course progress">
      <div className="course-progress__header">
        <div>
          <span className="eyebrow">Your progress</span>
          <strong>{percentage}% complete</strong>
        </div>
        <span>{hoursCompleted} / {hoursTotal} guided hours</span>
      </div>
      <div className="progress-track" aria-label={`${percentage}% complete`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage}>
        <span style={{width: `${percentage}%`}} />
      </div>
      {!compact && (
        <div className="progress-milestones">
          {lessons.map((lesson) => (
            <Link key={lesson.id} to={lesson.href} className={progress.completed.includes(lesson.id) ? 'milestone milestone--done' : 'milestone'}>
              <span aria-hidden="true">{progress.completed.includes(lesson.id) ? '✓' : '○'}</span>
              {lesson.shortTitle}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export function LessonComplete({lessonId, nextHref, nextLabel = 'Continue'}: {lessonId: string; nextHref?: string; nextLabel?: string}) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDone(readProgress().completed.includes(lessonId));
  }, [lessonId]);

  const markComplete = () => {
    const current = readProgress();
    const completed = Array.from(new Set([...current.completed, lessonId]));
    const next = {completed, updatedAt: new Date().toISOString()};
    writeProgress(next);
    setDone(true);
    scormReport({lessonLocation: typeof window !== 'undefined' ? window.location.pathname : lessonId, status: 'incomplete'});
  };

  return (
    <div className="lesson-complete">
      <div>
        <strong>{done ? 'Lesson recorded' : 'Ready to move on?'}</strong>
        <p>{done ? 'This milestone is included in your course progress.' : 'Mark the lesson complete after you finish its lab and knowledge checks.'}</p>
      </div>
      <div className="lesson-complete__actions">
        <button className="button button--primary" type="button" onClick={markComplete} disabled={done}>
          {done ? 'Completed ✓' : 'Mark complete'}
        </button>
        {nextHref && <Link className="button button--secondary" to={nextHref}>{nextLabel} →</Link>}
      </div>
    </div>
  );
}

export function KnowledgeCheck({
  id,
  question,
  options,
  correctIndex,
  explanation,
}: {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const correct = checked && selected === correctIndex;

  return (
    <section className="knowledge-check" aria-labelledby={`${id}-title`}>
      <span className="eyebrow">Knowledge check</span>
      <h3 id={`${id}-title`}>{question}</h3>
      <div role="radiogroup" aria-label={question} className="knowledge-check__options">
        {options.map((option, index) => (
          <label className="quiz-option" key={option}>
            <input
              type="radio"
              name={id}
              checked={selected === index}
              onChange={() => {
                setSelected(index);
                setChecked(false);
              }}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
      <button className="button button--primary" type="button" disabled={selected === null} onClick={() => setChecked(true)}>
        Check answer
      </button>
      {checked && (
        <div className={correct ? 'quiz-feedback quiz-feedback--good' : 'quiz-feedback quiz-feedback--retry'} role="status">
          <strong>{correct ? 'Correct.' : 'Reconsider that choice.'}</strong> {explanation}
        </div>
      )}
    </section>
  );
}

export type ScenarioOption = {
  label: string;
  correct: boolean;
  feedback: string;
};

export function ScenarioDecision({title, prompt, options}: {title: string; prompt: string; options: ScenarioOption[]}) {
  const [choice, setChoice] = useState<number | null>(null);
  const selected = choice === null ? null : options[choice];

  return (
    <section className="scenario-card">
      <span className="eyebrow">Scenario lab</span>
      <h3>{title}</h3>
      <p>{prompt}</p>
      <div className="scenario-actions">
        {options.map((option, index) => (
          <button
            type="button"
            className={choice === index ? 'scenario-choice scenario-choice--active' : 'scenario-choice'}
            key={option.label}
            onClick={() => setChoice(index)}>
            {option.label}
          </button>
        ))}
      </div>
      {selected && (
        <div className={selected.correct ? 'quiz-feedback quiz-feedback--good' : 'quiz-feedback quiz-feedback--retry'} role="status">
          <strong>{selected.correct ? 'Best next action.' : 'Higher-risk choice.'}</strong> {selected.feedback}
        </div>
      )}
    </section>
  );
}

const simulatedResponses: Array<{match: RegExp; output: string}> = [
  {
    match: /db2level/i,
    output: `DB21085I  This instance uses "64" bits and Db2 code release "SQL12010".\nInformational tokens identify Db2 12.1 level details.\n\nLearning note: confirm exact fix pack / mod pack details against your installed environment before change planning.`,
  },
  {
    match: /get\s+db\s+cfg/i,
    output: `Database Configuration for Database SAMPLE\n\n Log retain for recovery status                          = RECOVERY\n First log archive method                 (LOGARCHMETH1) = DISK:/db2archive\n Log file size (4KB)                         (LOGFILSIZ) = 8192\n Number of primary log files                (LOGPRIMARY) = 20\n Number of secondary log files               (LOGSECOND) = 10\n\nLearning note: compare values with workload, RPO/RTO, archive throughput, and filesystem capacity before changing them.`,
  },
  {
    match: /list\s+utilities|mon_get_utility|load_query/i,
    output: `ID                               = 23\nType                             = LOAD\nDatabase Name                    = SAMPLE\nState                            = Executing\nProgress                         = 71%\n\nLearning note: monitor utility state and messages; never assume a bulk operation completed cleanly because the client command returned.`,
  },
  {
    match: /db2pd.*locks|locks.*db2pd/i,
    output: `Database Member 0 -- Active -- Up 2 days\nLocks: waiting application handle 211, holder 184\nLock mode requested: X\nObject: table SALES.ORDERS\n\nLearning note: identify the root blocker, capture transaction context, then choose the least disruptive remediation.`,
  },
  {
    match: /runstats/i,
    output: `RUNSTATS simulated successfully.\nStatistics refreshed for table and indexes.\n\nLearning note: collect only the statistics justified by workload characteristics, then validate access plans rather than assuming improvement.`,
  },
  {
    match: /reorgchk|reorg/i,
    output: `REORGCHK simulation: review F1/F2/F3 indicators and object health before scheduling maintenance.\n\nLearning note: REORG has operational cost; schedule and validate it based on evidence, not habit.`,
  },
  {
    match: /explain|db2exfmt|db2expln/i,
    output: `EXPLAIN simulation\nAccess plan: IXSCAN -> FETCH -> RETURN\nEstimated rows: 128\nKey signal: predicate selectivity and clustering drive the cost model.\n\nLearning note: compare estimated vs actual cardinality and confirm statistics freshness before adding indexes.`,
  },
  {
    match: /backup|restore|rollforward/i,
    output: `Recovery simulation\nCommand accepted in training sandbox.\n\nLearning note: capture backup timestamp, image location, log chain, target recovery point, and validation evidence. A backup is not proven until restore/recovery is tested.`,
  },
];

export function Db2Terminal({suggestions = ['db2level', 'db2 get db cfg for SAMPLE', 'db2 list utilities show detail']}: {suggestions?: string[]}) {
  const [command, setCommand] = useState('db2level');
  const [output, setOutput] = useState('Type a supported training command and select Run simulation.');

  const run = () => {
    const entry = simulatedResponses.find((candidate) => candidate.match.test(command));
    setOutput(
      entry?.output ??
        `No destructive command was executed.\n\nThis browser terminal is a safe simulator, not a live Db2 shell. Try one of the suggested commands or run the command in your authorized lab environment.`,
    );
  };

  return (
    <section className="terminal-lab" aria-label="Db2 command simulator">
      <div className="terminal-lab__title">
        <div>
          <span className="eyebrow">Safe command lab</span>
          <h3>Db2 terminal simulator</h3>
        </div>
        <span className="simulation-badge">SIMULATION ONLY</span>
      </div>
      <div className="terminal-suggestions">
        {suggestions.map((suggestion) => (
          <button type="button" key={suggestion} onClick={() => setCommand(suggestion)}>{suggestion}</button>
        ))}
      </div>
      <label className="terminal-input-label">
        Command
        <div className="terminal-input-row">
          <span>$</span>
          <input value={command} onChange={(event) => setCommand(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && run()} />
          <button className="button button--primary" type="button" onClick={run}>Run simulation</button>
        </div>
      </label>
      <pre className="terminal-output" aria-live="polite"><code>{output}</code></pre>
    </section>
  );
}

export function PracticeChecklist({title, items}: {title: string; items: string[]}) {
  const [checked, setChecked] = useState<boolean[]>(() => items.map(() => false));
  const count = checked.filter(Boolean).length;

  return (
    <section className="practice-checklist">
      <div className="practice-checklist__header">
        <div>
          <span className="eyebrow">Hands-on checkpoint</span>
          <h3>{title}</h3>
        </div>
        <strong>{count}/{items.length}</strong>
      </div>
      {items.map((item, index) => (
        <label key={item} className="check-item">
          <input
            type="checkbox"
            checked={checked[index]}
            onChange={() => setChecked((current) => current.map((value, itemIndex) => itemIndex === index ? !value : value))}
          />
          <span>{item}</span>
        </label>
      ))}
    </section>
  );
}

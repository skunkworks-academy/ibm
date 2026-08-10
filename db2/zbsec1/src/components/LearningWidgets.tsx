import React, {useEffect, useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import {lessons, totalHours} from '../data/course';
import {
  LEARNING_EVENT,
  emptyLearningState,
  markLessonComplete,
  readLearningState,
  recordCheck,
  recordChecklist,
  rememberLocation,
} from '../utils/learningState';

function useLearningState() {
  const [state, setState] = useState(emptyLearningState());
  useEffect(() => {
    const refresh = () => setState(readLearningState());
    refresh();
    window.addEventListener(LEARNING_EVENT, refresh as EventListener);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(LEARNING_EVENT, refresh as EventListener);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  return state;
}

export function LearningLocationTracker() {
  useEffect(() => rememberLocation(window.location.pathname), []);
  return null;
}

export function CourseProgress({compact = false}: {compact?: boolean}) {
  const state = useLearningState();
  const completed = useMemo(() => lessons.filter((lesson) => state.completed.includes(lesson.id)), [state.completed]);
  const percentage = Math.round((completed.length / lessons.length) * 100);
  const completedHours = completed.reduce((sum, lesson) => sum + lesson.durationHours, 0);
  const checksMastered = Object.values(state.checks).filter((item) => item.correct).length;

  return (
    <section className={compact ? 'progress-card progress-card--compact' : 'progress-card'} aria-label="Course progress">
      <div className="widget-row">
        <div><span className="eyebrow">Your progress</span><strong>{percentage}% milestone completion</strong></div>
        <span>{completedHours} / {totalHours} guided hours</span>
      </div>
      <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage}>
        <span style={{width: `${percentage}%`}} />
      </div>
      {!compact && (
        <>
          <div className="metric-grid">
            <div><strong>{completed.length}/12</strong><span>modules complete</span></div>
            <div><strong>{checksMastered}</strong><span>checks mastered</span></div>
            <div><strong>{state.assessmentBest ?? 0}%</strong><span>best assessment</span></div>
          </div>
          <div className="milestone-row">
            {lessons.map((lesson) => (
              <Link key={lesson.id} to={lesson.href} className={state.completed.includes(lesson.id) ? 'milestone milestone--done' : 'milestone'}>
                {state.completed.includes(lesson.id) ? '✓' : '○'} {lesson.shortTitle}
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export function ResumeLearning() {
  const state = useLearningState();
  const hasStarted = Boolean(state.lastLocation || state.completed.length || Object.keys(state.checks).length);
  const target = state.lastLocation || '/course/intro';
  return (
    <section className="resume-card">
      <div>
        <span className="eyebrow">{hasStarted ? 'Continue learning' : 'Start here'}</span>
        <h2>{hasStarted ? 'Resume your ZBSEC1 path.' : 'Build the security control chain end-to-end.'}</h2>
        <p>{hasStarted ? `${state.completed.length}/12 modules are recorded complete.` : 'Progress, knowledge checks and lab checklists are stored locally in this browser.'}</p>
      </div>
      <Link className="button button--primary button--lg" to={target}>{hasStarted ? 'Resume course →' : 'Start course →'}</Link>
    </section>
  );
}

export function KnowledgeCheck({id, question, options, correctIndex, explanation}: {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}) {
  const state = useLearningState();
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const isCorrect = checked && selected === correctIndex;
  const previous = state.checks[id];

  const submit = () => {
    if (selected === null) return;
    recordCheck(id, selected === correctIndex);
    setChecked(true);
  };

  return (
    <section className="knowledge-card" aria-labelledby={`${id}-title`}>
      <div className="widget-row"><span className="eyebrow">Knowledge check</span>{previous?.correct && <span className="mastery-badge">Mastered ✓</span>}</div>
      <h3 id={`${id}-title`}>{question}</h3>
      <div className="option-grid" role="radiogroup" aria-label={question}>
        {options.map((option, index) => (
          <label className="quiz-option" key={option}>
            <input type="radio" name={id} checked={selected === index} onChange={() => {setSelected(index); setChecked(false);}} />
            <span>{option}</span>
          </label>
        ))}
      </div>
      <button className="button button--primary" type="button" disabled={selected === null} onClick={submit}>Check answer</button>
      {previous && <span className="attempt-note"> Recorded attempts: {previous.attempts}</span>}
      {checked && <div className={isCorrect ? 'feedback feedback--good' : 'feedback feedback--retry'} role="status"><strong>{isCorrect ? 'Correct.' : 'Review the control chain.'}</strong> {explanation}</div>}
    </section>
  );
}

export function PracticeChecklist({id, title, items}: {id: string; title: string; items: string[]}) {
  const state = useLearningState();
  const stored = state.checklists[id] ?? [];
  const [checked, setChecked] = useState<boolean[]>(() => items.map((_, index) => stored.includes(index)));

  useEffect(() => setChecked(items.map((_, index) => (state.checklists[id] ?? []).includes(index))), [id, items.length, state.checklists]);

  const toggle = (index: number) => {
    const next = checked.map((value, itemIndex) => itemIndex === index ? !value : value);
    setChecked(next);
    recordChecklist(id, next.flatMap((value, itemIndex) => value ? [itemIndex] : []));
  };

  const complete = checked.filter(Boolean).length;
  return (
    <section className="practice-card">
      <div className="widget-row"><div><span className="eyebrow">Evidence checklist</span><h3>{title}</h3></div><strong>{complete}/{items.length}</strong></div>
      {items.map((item, index) => (
        <label className="check-item" key={item}>
          <input type="checkbox" checked={checked[index] ?? false} onChange={() => toggle(index)} />
          <span>{item}</span>
        </label>
      ))}
    </section>
  );
}

export type ScenarioOption = {label: string; correct: boolean; feedback: string};
export function ScenarioDecision({title, prompt, options}: {title: string; prompt: string; options: ScenarioOption[]}) {
  const [choice, setChoice] = useState<number | null>(null);
  const selected = choice === null ? undefined : options[choice];
  return (
    <section className="scenario-card">
      <span className="eyebrow">Decision scenario</span>
      <h3>{title}</h3>
      <p>{prompt}</p>
      <div className="scenario-actions">
        {options.map((option, index) => <button type="button" key={option.label} className={choice === index ? 'scenario-choice scenario-choice--active' : 'scenario-choice'} onClick={() => setChoice(index)}>{option.label}</button>)}
      </div>
      {selected && <div className={selected.correct ? 'feedback feedback--good' : 'feedback feedback--retry'}><strong>{selected.correct ? 'Best controlled action.' : 'Higher-risk action.'}</strong> {selected.feedback}</div>}
    </section>
  );
}

const evidence: Record<string, string> = {
  'RACF identity review': `USER=BANKTELL\nDEFAULT-GROUP=TELLERS\nSPECIAL=NO  OPERATIONS=NO  AUDITOR=NO\n\nTraining interpretation:\n- business identity is not privileged\n- group membership must map to a documented job function\n- verify secondary authorization IDs before concluding effective Db2 privilege`,
  'Db2 privilege review': `GRANTEE      OBJECT              PRIVILEGE\n------------ ------------------- ---------\nBANK_APP_R   BANK.CUSTOMER_V     SELECT\nBANK_APP_R   COLL.BANKAPI        EXECUTE\nDBA_PROD     BANK.CUSTOMER       NONE\n\nTraining interpretation:\nPrefer package/view/role-mediated access and keep data access separate from administration where the operating model permits it.`,
  'DDF security review': `DDF STATUS: STARTED\nSECURE PORT: configured\nTLS POLICY: protected path expected\nREMOTE AUTHENTICATION: enforce approved mechanism\n\nTraining interpretation:\nValidate the network path, server identity, credential protection, cipher policy, certificate lifecycle and the authorization ID seen by Db2.`,
  'SMF audit sample': `TIME       AUTHID     EVENT                OBJECT\n10:14:12   DBAADM1    ADMIN_OPERATION      BANK.CUSTOMER\n10:14:18   BANKAPP    SELECT               BANK.CUSTOMER_V\n10:15:01   SECADM1    PRIVILEGE_CHANGE     BANK_APP_R\n\nTraining interpretation:\nCorrelate Db2 audit evidence with RACF, network, application and change-management context.`,
};

export function EvidenceConsole({commands = Object.keys(evidence)}: {commands?: string[]}) {
  const [selected, setSelected] = useState(commands[0] ?? '');
  const output = evidence[selected] ?? 'No simulated evidence is defined for this selection.';
  return (
    <section className="terminal-card">
      <div className="widget-row"><div><span className="eyebrow">Safe evidence lab</span><h3>Banking security evidence console</h3></div><span className="simulation-badge">SIMULATION ONLY</span></div>
      <div className="terminal-suggestions">{commands.map((command) => <button type="button" key={command} onClick={() => setSelected(command)}>{command}</button>)}</div>
      <pre className="terminal-output"><code>{output}</code></pre>
    </section>
  );
}

export function Tabletop({title, injects, questions}: {title: string; injects: string[]; questions: string[]}) {
  const [stage, setStage] = useState(0);
  const shown = injects.slice(0, stage + 1);
  return (
    <section className="tabletop-card">
      <span className="eyebrow">Tabletop exercise</span>
      <h3>{title}</h3>
      <div className="inject-stack">{shown.map((inject, index) => <div className="inject" key={inject}><strong>Inject {index + 1}</strong><p>{inject}</p></div>)}</div>
      {stage < injects.length - 1 && <button type="button" className="button button--secondary" onClick={() => setStage((value) => value + 1)}>Reveal next inject</button>}
      <details className="facilitator-questions"><summary>Facilitator questions</summary><ol>{questions.map((question) => <li key={question}>{question}</li>)}</ol></details>
    </section>
  );
}

export function LessonComplete({lessonId, nextHref, nextLabel = 'Continue'}: {lessonId: string; nextHref?: string; nextLabel?: string}) {
  const state = useLearningState();
  const done = state.completed.includes(lessonId);
  return (
    <section className="lesson-complete">
      <div><strong>{done ? 'Module recorded complete' : 'Finished the theory, lab and checks?'}</strong><p>Record completion only after you can explain the control decisions and retain the requested evidence.</p></div>
      <div className="lesson-actions">
        <button type="button" className="button button--primary" disabled={done} onClick={() => markLessonComplete(lessonId)}>{done ? 'Completed ✓' : 'Mark complete'}</button>
        {nextHref && <Link className="button button--secondary" to={nextHref}>{nextLabel} →</Link>}
      </div>
    </section>
  );
}

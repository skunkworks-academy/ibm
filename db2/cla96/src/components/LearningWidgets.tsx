import React, {useEffect, useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import {lessons} from '../data/course';
import {partMasteryRequirements} from '../data/objectives';
import {createSimulatorState, executeDb2Command, SimulatorScenario} from '../utils/db2Simulator';
import {scormReport} from '../utils/scorm';
import {
  LEARNING_EVENT,
  LearningState,
  emptyLearningState,
  markLessonComplete,
  readLearningState,
  recordCheck,
  recordChecklist,
  rememberLocation,
} from '../utils/learningState';

function useLearningState() {
  const [state, setState] = useState<LearningState>(emptyLearningState());

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

function partMastery(partId: string, state: LearningState) {
  const requirement = partMasteryRequirements[partId];
  if (!requirement) return null;
  const checksMastered = requirement.checkIds.filter((id) => state.checks[id]?.correct).length;
  const practicalSteps = state.checklists[requirement.checklistId]?.checked.length ?? 0;
  return {
    checksMastered,
    checkTotal: requirement.checkIds.length,
    practicalSteps,
    practicalTotal: requirement.checklistCount,
    passed: checksMastered === requirement.checkIds.length && practicalSteps >= requirement.checklistCount,
  };
}

export function LearningLocationTracker() {
  useEffect(() => {
    rememberLocation(window.location.pathname);
  }, []);
  return null;
}

export function CourseProgress({compact = false}: {compact?: boolean}) {
  const progress = useLearningState();
  const completed = useMemo(
    () => lessons.filter((lesson) => progress.completed.includes(lesson.id)),
    [progress.completed],
  );
  const percentage = Math.round((completed.length / lessons.length) * 100);
  const hoursCompleted = completed.reduce((sum, lesson) => sum + lesson.durationHours, 0);
  const hoursTotal = lessons.reduce((sum, lesson) => sum + lesson.durationHours, 0);
  const checksMastered = Object.values(progress.checks).filter((check) => check.correct).length;
  const checklistSteps = Object.values(progress.checklists).reduce((sum, checklist) => sum + checklist.checked.length, 0);
  const partsMastered = ['part-1', 'part-2', 'part-3', 'part-4'].filter((partId) => partMastery(partId, progress)?.passed).length;

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
          <strong>{percentage}% milestone completion</strong>
        </div>
        <span>{hoursCompleted} / {hoursTotal} guided hours</span>
      </div>
      <div className="progress-track" aria-label={`${percentage}% complete`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage}>
        <span style={{width: `${percentage}%`}} />
      </div>
      {!compact && (
        <>
          <div className="progress-detail-grid" aria-label="Detailed learning activity">
            <div><strong>{partsMastered}/4</strong><span>technical parts mastered</span></div>
            <div><strong>{checksMastered}</strong><span>knowledge checks mastered</span></div>
            <div><strong>{checklistSteps}</strong><span>practical steps recorded</span></div>
          </div>
          <div className="progress-milestones">
            {lessons.map((lesson) => (
              <Link key={lesson.id} to={lesson.href} className={progress.completed.includes(lesson.id) ? 'milestone milestone--done' : 'milestone'}>
                <span aria-hidden="true">{progress.completed.includes(lesson.id) ? '✓' : '○'}</span>
                {lesson.shortTitle}
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
  const target = state.lastLocation || '/course/intro';
  const hasStarted = Boolean(state.lastLocation || state.completed.length || Object.keys(state.checks).length);
  const completedLessons = lessons.filter((lesson) => state.completed.includes(lesson.id)).length;
  const remainingHours = lessons
    .filter((lesson) => !state.completed.includes(lesson.id))
    .reduce((sum, lesson) => sum + lesson.durationHours, 0);

  return (
    <section className="resume-panel" aria-label="Resume learning">
      <div>
        <span className="eyebrow">{hasStarted ? 'Welcome back' : 'Your learning path'}</span>
        <h2>{hasStarted ? 'Continue where you left off.' : 'Start with orientation.'}</h2>
        <p>
          {hasStarted
            ? `${completedLessons}/${lessons.length} milestones recorded · approximately ${remainingHours} guided hours remain.`
            : 'Your progress, checks, practical steps and incident results are saved locally as you work.'}
        </p>
      </div>
      <Link className="button button--primary button--lg" to={target}>
        {hasStarted ? 'Resume course →' : 'Start course →'}
      </Link>
    </section>
  );
}

export function LessonComplete({lessonId, nextHref, nextLabel = 'Continue'}: {lessonId: string; nextHref?: string; nextLabel?: string}) {
  const state = useLearningState();
  const done = state.completed.includes(lessonId);
  const mastery = partMastery(lessonId, state);
  const canComplete = !mastery || mastery.passed;

  const markComplete = () => {
    if (!canComplete) return;
    markLessonComplete(lessonId);
    scormReport({lessonLocation: typeof window !== 'undefined' ? window.location.pathname : lessonId, status: 'incomplete'});
  };

  return (
    <div className="lesson-complete">
      <div className="lesson-complete__content">
        <strong>{done ? 'Milestone recorded' : mastery ? (mastery.passed ? 'Mastery evidence complete' : 'Mastery gate') : 'Ready to move on?'}</strong>
        {done ? (
          <p>This milestone is included in your course progress.</p>
        ) : mastery ? (
          <>
            <p>Part completion unlocks only when the official-unit knowledge checks and required practical evidence are complete.</p>
            <div className="mastery-gate" aria-label="Part mastery requirements">
              <span className={mastery.checksMastered === mastery.checkTotal ? 'mastery-gate__done' : ''}>
                Knowledge checks <strong>{mastery.checksMastered}/{mastery.checkTotal}</strong>
              </span>
              <span className={mastery.practicalSteps >= mastery.practicalTotal ? 'mastery-gate__done' : ''}>
                Practical evidence <strong>{mastery.practicalSteps}/{mastery.practicalTotal}</strong>
              </span>
            </div>
          </>
        ) : (
          <p>Record this milestone after completing its required learning activity.</p>
        )}
      </div>
      <div className="lesson-complete__actions">
        <button className="button button--primary" type="button" onClick={markComplete} disabled={done || !canComplete}>
          {done ? 'Completed ✓' : canComplete ? 'Record mastery' : 'Complete requirements first'}
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
  const state = useLearningState();
  const previous = state.checks[id];
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const correct = checked && selected === correctIndex;

  const checkAnswer = () => {
    if (selected === null) return;
    const isCorrect = selected === correctIndex;
    setChecked(true);
    recordCheck(id, isCorrect);
  };

  return (
    <section className="knowledge-check" aria-labelledby={`${id}-title`}>
      <div className="widget-heading-row">
        <span className="eyebrow">Knowledge check</span>
        {previous?.correct && <span className="mastery-badge">Mastered ✓</span>}
      </div>
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
      <button className="button button--primary" type="button" disabled={selected === null} onClick={checkAnswer}>
        Check answer
      </button>
      {previous && <span className="attempt-note"> Recorded attempts: {previous.attempts}</span>}
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

const simulatorScenarios: Array<{id: SimulatorScenario; label: string}> = [
  {id: 'baseline', label: 'Healthy baseline'},
  {id: 'load', label: 'LOAD state'},
  {id: 'recovery', label: 'Recovery pending'},
  {id: 'plan', label: 'Plan regression'},
  {id: 'locking', label: 'Lock contention'},
];

export function Db2Terminal({suggestions = ['db2level', 'db2 get db cfg for SAMPLE', 'status']}: {suggestions?: string[]}) {
  const [command, setCommand] = useState('status');
  const [output, setOutput] = useState('Stateful training simulator ready. Inspect the current state or load a scenario.');
  const [history, setHistory] = useState<string[]>([]);
  const [simState, setSimState] = useState(() => createSimulatorState('baseline'));

  const run = () => {
    const normalized = command.trim();
    if (!normalized) return;
    const result = executeDb2Command(simState, normalized);
    setSimState(result.state);
    setOutput(result.output);
    setHistory((current) => [normalized, ...current.filter((item) => item !== normalized)].slice(0, 7));
  };

  const loadScenario = (scenario: SimulatorScenario) => {
    const next = createSimulatorState(scenario);
    setSimState(next);
    setCommand('status');
    setOutput(`Scenario loaded: ${scenario}.\nRun “status” and then diagnose/remediate the state with the suggested commands.`);
  };

  return (
    <section className="terminal-lab" aria-label="Stateful Db2 command simulator">
      <div className="terminal-lab__title">
        <div>
          <span className="eyebrow">Safe stateful command lab</span>
          <h3>Db2 terminal simulator</h3>
        </div>
        <span className="simulation-badge">SIMULATION ONLY</span>
      </div>

      <div className="simulator-state-grid" aria-label="Current simulator state">
        <div><span>Scenario</span><strong>{simState.scenario}</strong></div>
        <div><span>Database</span><strong>{simState.databaseState}</strong></div>
        <div><span>APP.ORDERS</span><strong>{simState.tableState}</strong></div>
        <div><span>Statistics</span><strong>{simState.statistics}</strong></div>
        <div><span>Lock wait</span><strong>{simState.lockWait ? `Holder ${simState.blockerHandle}` : 'None'}</strong></div>
      </div>

      <div className="simulator-scenarios" aria-label="Load a simulator scenario">
        {simulatorScenarios.map((scenario) => (
          <button
            type="button"
            className={simState.scenario === scenario.id ? 'scenario-choice scenario-choice--active' : 'scenario-choice'}
            key={scenario.id}
            onClick={() => loadScenario(scenario.id)}>
            {scenario.label}
          </button>
        ))}
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
          <input aria-label="Db2 simulator command" value={command} onChange={(event) => setCommand(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && run()} />
          <button className="button button--primary" type="button" onClick={run}>Run simulation</button>
        </div>
      </label>
      <pre className="terminal-output" aria-live="polite"><code>{output}</code></pre>
      {history.length > 0 && (
        <div className="command-history"><strong>Recent commands</strong>{history.map((item) => <button key={item} type="button" onClick={() => setCommand(item)}>{item}</button>)}</div>
      )}
    </section>
  );
}

function checklistId(title: string) {
  return `checklist-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
}

export function PracticeChecklist({title, items, id}: {title: string; items: string[]; id?: string}) {
  const key = id ?? checklistId(title);
  const state = useLearningState();
  const stored = state.checklists[key]?.checked ?? [];
  const [checked, setChecked] = useState<boolean[]>(() => items.map((_, index) => stored.includes(index)));

  useEffect(() => {
    setChecked(items.map((_, index) => (state.checklists[key]?.checked ?? []).includes(index)));
  }, [key, items.length, state.checklists]);

  const count = checked.filter(Boolean).length;
  const toggle = (index: number) => {
    const next = checked.map((value, itemIndex) => itemIndex === index ? !value : value);
    setChecked(next);
    recordChecklist(key, next.flatMap((value, itemIndex) => value ? [itemIndex] : []));
  };

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
          <input type="checkbox" checked={checked[index]} onChange={() => toggle(index)} />
          <span>{item}</span>
        </label>
      ))}
      {count === items.length && <div className="quiz-feedback quiz-feedback--good"><strong>Practical checkpoint complete.</strong> This evidence is saved in your browser.</div>}
    </section>
  );
}
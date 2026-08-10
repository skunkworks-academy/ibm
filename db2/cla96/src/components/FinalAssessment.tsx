import React, {useEffect, useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import {ASSESSMENT_STORAGE_KEY, PART_SCORE_FLOOR, PASS_SCORE} from '../data/course';
import {AssessmentPartId, AssessmentQuestion, assessmentBankSize, buildBalancedAssessment} from '../data/assessmentBank';
import {officialParts, partMasteryRequirements} from '../data/objectives';
import {markLessonComplete, readLearningState} from '../utils/learningState';
import {scormReport} from '../utils/scorm';

type AttemptQuestion = {
  question: AssessmentQuestion;
  optionOrder: number[];
};

type StoredAssessment = {
  bestScore: number;
  latestScore: number;
  attempts: number;
  passed: boolean;
  partScores: Record<AssessmentPartId, number>;
  updatedAt: string;
};

const partIds: AssessmentPartId[] = ['part-1', 'part-2', 'part-3', 'part-4'];

function shuffleNumbers(length: number): number[] {
  const values = Array.from({length}, (_, index) => index);
  for (let index = values.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [values[index], values[target]] = [values[target], values[index]];
  }
  return values;
}

function createAttempt(): AttemptQuestion[] {
  return buildBalancedAssessment(6).map((question) => ({
    question,
    optionOrder: shuffleNumbers(question.options.length),
  }));
}

function readStored(): StoredAssessment | null {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(window.localStorage.getItem(ASSESSMENT_STORAGE_KEY) ?? 'null') as StoredAssessment | null;
  } catch {
    return null;
  }
}

function masteryPrerequisites() {
  const state = readLearningState();
  return partIds.map((partId) => {
    const requirement = partMasteryRequirements[partId];
    const checks = requirement.checkIds.filter((id) => state.checks[id]?.correct).length;
    const practical = state.checklists[requirement.checklistId]?.checked.length ?? 0;
    const mastered = checks === requirement.checkIds.length && practical >= requirement.checklistCount;
    return {partId, mastered, checks, checkTotal: requirement.checkIds.length, practical, practicalTotal: requirement.checklistCount};
  });
}

function questionIsCorrect(item: AttemptQuestion, displayedChoice: number | undefined): boolean {
  if (displayedChoice === undefined) return false;
  return item.optionOrder[displayedChoice] === item.question.correctIndex;
}

function scoreAttempt(attempt: AttemptQuestion[], answers: Record<number, number>) {
  const correct = attempt.reduce((total, item, index) => total + (questionIsCorrect(item, answers[index]) ? 1 : 0), 0);
  const overall = Math.round((correct / attempt.length) * 100);
  const partScores = Object.fromEntries(partIds.map((partId) => {
    const partQuestions = attempt.map((item, index) => ({item, index})).filter(({item}) => item.question.partId === partId);
    const partCorrect = partQuestions.reduce((total, {item, index}) => total + (questionIsCorrect(item, answers[index]) ? 1 : 0), 0);
    return [partId, Math.round((partCorrect / partQuestions.length) * 100)];
  })) as Record<AssessmentPartId, number>;
  const passed = overall >= PASS_SCORE && partIds.every((partId) => partScores[partId] >= PART_SCORE_FLOOR);
  return {overall, partScores, passed};
}

export default function FinalAssessment() {
  const [attempt, setAttempt] = useState<AttemptQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [latest, setLatest] = useState<ReturnType<typeof scoreAttempt> | null>(null);
  const [stored, setStored] = useState<StoredAssessment | null>(null);
  const [prerequisites, setPrerequisites] = useState<ReturnType<typeof masteryPrerequisites>>([]);

  useEffect(() => {
    setStored(readStored());
    setPrerequisites(masteryPrerequisites());
    setAttempt(createAttempt());
  }, []);

  const answeredCount = Object.keys(answers).length;
  const unlocked = prerequisites.length === 4 && prerequisites.every((part) => part.mastered);

  const missedByUnit = useMemo(() => {
    if (!submitted) return new Map<string, number>();
    const misses = new Map<string, number>();
    attempt.forEach((item, index) => {
      if (!questionIsCorrect(item, answers[index])) {
        misses.set(item.question.unitId, (misses.get(item.question.unitId) ?? 0) + 1);
      }
    });
    return misses;
  }, [answers, attempt, submitted]);

  const submit = () => {
    if (!unlocked || attempt.length === 0 || answeredCount !== attempt.length) return;
    const result = scoreAttempt(attempt, answers);
    const previous = readStored();
    const record: StoredAssessment = {
      bestScore: Math.max(previous?.bestScore ?? 0, result.overall),
      latestScore: result.overall,
      attempts: (previous?.attempts ?? 0) + 1,
      passed: Boolean(previous?.passed || result.passed),
      partScores: result.partScores,
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(record));
    setStored(record);
    setLatest(result);
    setSubmitted(true);
    if (result.passed) markLessonComplete('final-assessment');
    scormReport({score: result.overall, status: result.passed ? 'passed' : 'failed', lessonLocation: window.location.pathname});
  };

  const resetAttempt = () => {
    setAttempt(createAttempt());
    setAnswers({});
    setSubmitted(false);
    setLatest(null);
    setPrerequisites(masteryPrerequisites());
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const exportRecord = () => {
    const record = readStored();
    const payload = {
      course: 'CLA96G — IBM Db2 12.1 Foundation for Relational DBAs self-paced companion',
      assessmentBankSize,
      attemptQuestionCount: 24,
      passScore: PASS_SCORE,
      partScoreFloor: PART_SCORE_FLOOR,
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

  if (attempt.length === 0) return <div className="assessment-shell"><p>Preparing randomized assessment…</p></div>;

  if (!unlocked) {
    return (
      <section className="assessment-gate" aria-label="Assessment mastery prerequisites">
        <span className="eyebrow">Mastery prerequisite</span>
        <h2>Master all four technical parts before the final assessment.</h2>
        <p>The assessment is intentionally gated by the official-unit checks and required practical evidence. This prevents a manual completion click from bypassing learning requirements.</p>
        <div className="assessment-prerequisite-grid">
          {prerequisites.map((part) => {
            const definition = officialParts.find((item) => item.id === part.partId);
            return (
              <Link key={part.partId} to={definition?.href ?? '/course/intro'} className={part.mastered ? 'assessment-prerequisite assessment-prerequisite--done' : 'assessment-prerequisite'}>
                <strong>Part {definition?.number}: {definition?.shortTitle}</strong>
                <span>Checks {part.checks}/{part.checkTotal} · Practical {part.practical}/{part.practicalTotal}</span>
                <span>{part.mastered ? 'Mastered ✓' : 'Complete requirements →'}</span>
              </Link>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <div className="assessment-shell">
      <div className="assessment-summary assessment-summary--v3">
        <div><span className="eyebrow">Question bank</span><strong>{assessmentBankSize}</strong></div>
        <div><span className="eyebrow">This attempt</span><strong>{attempt.length}</strong></div>
        <div><span className="eyebrow">Answered</span><strong>{answeredCount}/{attempt.length}</strong></div>
        <div><span className="eyebrow">Best score</span><strong>{stored?.bestScore ?? 0}%</strong></div>
        <div><span className="eyebrow">Attempts</span><strong>{stored?.attempts ?? 0}</strong></div>
      </div>

      <div className="assessment-blueprint">
        <strong>Blueprint:</strong> 6 randomized questions per Part · all official units represented where the Part size permits · answer order randomized · pass = {PASS_SCORE}% overall and at least {PART_SCORE_FLOOR}% in every Part.
      </div>

      {attempt.map((item, index) => {
        const question = item.question;
        const chosen = answers[index];
        const isCorrect = questionIsCorrect(item, chosen);
        return (
          <section className="assessment-question" key={question.id}>
            <div className="assessment-question__meta">
              <span>Question {index + 1}</span>
              <span>{question.unitId.toUpperCase()} · {question.difficulty}</span>
            </div>
            <h3>{question.prompt}</h3>
            <div className="knowledge-check__options" role="radiogroup" aria-label={`Question ${index + 1}`}>
              {item.optionOrder.map((originalIndex, displayedIndex) => (
                <label className="quiz-option" key={`${question.id}-${originalIndex}`}>
                  <input
                    type="radio"
                    name={`assessment-${index}`}
                    checked={chosen === displayedIndex}
                    disabled={submitted}
                    onChange={() => setAnswers((current) => ({...current, [index]: displayedIndex}))}
                  />
                  <span>{question.options[originalIndex]}</span>
                </label>
              ))}
            </div>
            {submitted && (
              <div className={isCorrect ? 'quiz-feedback quiz-feedback--good' : 'quiz-feedback quiz-feedback--retry'}>
                <strong>{isCorrect ? 'Correct.' : `Correct answer: ${question.options[question.correctIndex]}.`}</strong> {question.rationale}
                <div className="assessment-objective-id">Coverage: {question.objectiveId} · {question.unitId.toUpperCase()}</div>
              </div>
            )}
          </section>
        );
      })}

      <div className="assessment-actions">
        {!submitted ? (
          <button className="button button--primary button--lg" type="button" disabled={answeredCount !== attempt.length} onClick={submit}>
            Submit assessment
          </button>
        ) : (
          <button className="button button--secondary button--lg" type="button" onClick={resetAttempt}>Start randomized attempt</button>
        )}
        {stored && <button className="button button--secondary button--lg" type="button" onClick={exportRecord}>Export completion record</button>}
      </div>

      {submitted && latest && (
        <section className={latest.passed ? 'assessment-result assessment-result--pass' : 'assessment-result assessment-result--retry'} role="status">
          <span className="eyebrow">Latest result</span>
          <h2>{latest.overall}% · {latest.passed ? 'Mastery threshold met' : 'Targeted review required'}</h2>
          <div className="assessment-domain-grid">
            {officialParts.map((part) => {
              const partScore = latest.partScores[part.id];
              const weakUnits = part.units
                .map((unit) => ({unit, misses: missedByUnit.get(unit.id) ?? 0}))
                .filter((entry) => entry.misses > 0)
                .sort((a, b) => b.misses - a.misses);
              const remediation = weakUnits[0]?.unit;
              return (
                <article className={partScore >= PART_SCORE_FLOOR ? 'assessment-domain assessment-domain--pass' : 'assessment-domain assessment-domain--weak'} key={part.id}>
                  <span>Part {part.number}</span>
                  <strong>{partScore}%</strong>
                  <p>{part.shortTitle}</p>
                  {remediation ? <Link to={`${part.href}#${remediation.anchor}`}>Review {remediation.title} →</Link> : <span>No misses in this attempt.</span>}
                </article>
              );
            })}
          </div>
          <p>{latest.passed
            ? 'You met the overall threshold and the minimum Part floor. Your completion milestone has been recorded.'
            : `Reach ${PASS_SCORE}% overall while keeping every Part at or above ${PART_SCORE_FLOOR}%. Use the weakest-unit links above before the next randomized attempt.`}</p>
          {latest.passed && <Link className="button button--primary" to="/course/next-steps">Continue to next steps →</Link>}
        </section>
      )}
    </div>
  );
}

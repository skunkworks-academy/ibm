import React, {useMemo, useState} from 'react';
import {assessmentQuestions} from '../data/assessment';
import {recordAssessment} from '../utils/learningState';

const PASS_MARK = 80;

export default function Assessment() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => {
    const correct = assessmentQuestions.filter((question) => answers[question.id] === question.correctIndex).length;
    const score = Math.round((correct / assessmentQuestions.length) * 100);
    const domainMap = new Map<string, {correct: number; total: number}>();
    assessmentQuestions.forEach((question) => {
      const current = domainMap.get(question.domain) ?? {correct: 0, total: 0};
      current.total += 1;
      if (answers[question.id] === question.correctIndex) current.correct += 1;
      domainMap.set(question.domain, current);
    });
    return {correct, score, domains: Array.from(domainMap.entries())};
  }, [answers]);

  const submit = () => {
    setSubmitted(true);
    recordAssessment(result.score);
    window.setTimeout(() => document.getElementById('assessment-result')?.scrollIntoView({behavior: 'smooth'}), 50);
  };

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  return (
    <div className="assessment-shell">
      <section className="assessment-summary">
        <div><strong>{assessmentQuestions.length}</strong><span>scenario questions</span></div>
        <div><strong>{PASS_MARK}%</strong><span>mastery threshold</span></div>
        <div><strong>{Object.keys(answers).length}</strong><span>answered</span></div>
        <div><strong>{submitted ? `${result.score}%` : '—'}</strong><span>current result</span></div>
      </section>

      {assessmentQuestions.map((question, questionIndex) => {
        const selected = answers[question.id];
        const correct = submitted && selected === question.correctIndex;
        return (
          <section className="assessment-question" key={question.id}>
            <div className="assessment-question__meta"><span>Question {questionIndex + 1} of {assessmentQuestions.length}</span><span>{question.domain}</span></div>
            <h3>{question.prompt}</h3>
            <div className="option-grid">
              {question.options.map((option, optionIndex) => (
                <label className="quiz-option" key={option}>
                  <input
                    type="radio"
                    name={question.id}
                    checked={selected === optionIndex}
                    disabled={submitted}
                    onChange={() => setAnswers((current) => ({...current, [question.id]: optionIndex}))}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            {submitted && (
              <div className={correct ? 'feedback feedback--good' : 'feedback feedback--retry'}>
                <strong>{correct ? 'Correct.' : `Correct answer: ${question.options[question.correctIndex]}`}</strong> {question.rationale}
              </div>
            )}
          </section>
        );
      })}

      {!submitted && (
        <button className="button button--primary button--lg" type="button" disabled={Object.keys(answers).length !== assessmentQuestions.length} onClick={submit}>
          Submit final assessment
        </button>
      )}

      {submitted && (
        <section id="assessment-result" className={result.score >= PASS_MARK ? 'assessment-result assessment-result--pass' : 'assessment-result assessment-result--retry'}>
          <span className="eyebrow">Final result</span>
          <h2>{result.score >= PASS_MARK ? 'Mastery threshold achieved' : 'Remediation required'}</h2>
          <p><strong>{result.score}%</strong> · {result.correct}/{assessmentQuestions.length} correct.</p>
          <div className="domain-results">
            {result.domains.map(([domain, value]) => {
              const percent = Math.round((value.correct / value.total) * 100);
              return <div key={domain}><span>{domain}</span><strong>{percent}%</strong></div>;
            })}
          </div>
          {result.score < PASS_MARK && <p>Revisit domains below 80%, repeat the relevant evidence labs/tabletops, then retake the assessment.</p>}
          <button className="button button--secondary" type="button" onClick={reset}>Retake assessment</button>
        </section>
      )}
    </div>
  );
}

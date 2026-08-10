import React, {useMemo, useState} from 'react';
import {recordIncident, readLearningState} from '../utils/learningState';

type Evidence = {command: string; output: string; insight: string};
type Decision = {label: string; correct: boolean; feedback: string};

export type IncidentDefinition = {
  id: string;
  title: string;
  severity: string;
  brief: string;
  objective: string;
  evidence: Evidence[];
  decisions: Decision[];
};

export function IncidentLab({incident}: {incident: IncidentDefinition}) {
  const previous = typeof window === 'undefined' ? undefined : readLearningState().incidents[incident.id];
  const [revealed, setRevealed] = useState<number[]>([]);
  const [decision, setDecision] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const evidenceScore = Math.round((revealed.length / incident.evidence.length) * 50);
  const decisionCorrect = decision !== null && incident.decisions[decision]?.correct;
  const score = useMemo(() => Math.min(100, evidenceScore + (decisionCorrect ? 50 : 0)), [evidenceScore, decisionCorrect]);

  const inspect = (index: number) => setRevealed((current) => Array.from(new Set([...current, index])));

  const submit = () => {
    if (decision === null) return;
    setSubmitted(true);
    recordIncident(incident.id, score, Boolean(decisionCorrect && revealed.length >= Math.ceil(incident.evidence.length / 2)));
  };

  const reset = () => {
    setRevealed([]);
    setDecision(null);
    setSubmitted(false);
  };

  return (
    <section className="incident-lab" aria-labelledby={`${incident.id}-title`}>
      <div className="incident-header">
        <div>
          <span className="eyebrow">DBA Incident Centre · {incident.severity}</span>
          <h2 id={`${incident.id}-title`}>{incident.title}</h2>
        </div>
        {previous?.completed && <span className="mastery-badge">Solved · {previous.score}%</span>}
      </div>
      <div className="incident-brief">
        <strong>Incident brief</strong>
        <p>{incident.brief}</p>
        <strong>Objective</strong>
        <p>{incident.objective}</p>
      </div>

      <h3>1. Gather evidence</h3>
      <p>Choose the evidence you would collect before intervening. Each command reveals a simulated production signal.</p>
      <div className="incident-evidence-grid">
        {incident.evidence.map((item, index) => (
          <div className={revealed.includes(index) ? 'evidence-card evidence-card--open' : 'evidence-card'} key={item.command}>
            <button type="button" onClick={() => inspect(index)} disabled={revealed.includes(index)}>
              <code>{item.command}</code>
              <span>{revealed.includes(index) ? 'Collected ✓' : 'Collect evidence'}</span>
            </button>
            {revealed.includes(index) && (
              <div className="evidence-output">
                <pre><code>{item.output}</code></pre>
                <p><strong>Signal:</strong> {item.insight}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <h3>2. Choose the next action</h3>
      <div className="scenario-actions">
        {incident.decisions.map((item, index) => (
          <button
            type="button"
            className={decision === index ? 'scenario-choice scenario-choice--active' : 'scenario-choice'}
            key={item.label}
            disabled={submitted}
            onClick={() => setDecision(index)}>
            {item.label}
          </button>
        ))}
      </div>

      <div className="incident-score-row">
        <span>Evidence collected: {revealed.length}/{incident.evidence.length}</span>
        <span>Current score: {score}%</span>
      </div>
      {!submitted ? (
        <button className="button button--primary" type="button" disabled={decision === null} onClick={submit}>Submit incident response</button>
      ) : (
        <>
          <div className={decisionCorrect ? 'quiz-feedback quiz-feedback--good' : 'quiz-feedback quiz-feedback--retry'} role="status">
            <strong>{decisionCorrect ? 'Decision is operationally sound.' : 'Decision needs revision.'}</strong>{' '}
            {decision !== null ? incident.decisions[decision].feedback : ''}
            {revealed.length < Math.ceil(incident.evidence.length / 2) && ' Collect more evidence before declaring the incident solved.'}
          </div>
          <button className="button button--secondary" type="button" onClick={reset}>Run incident again</button>
        </>
      )}
    </section>
  );
}

export const incidents: IncidentDefinition[] = [
  {
    id: 'incident-lock-chain',
    title: 'Application latency spikes while CPU stays normal',
    severity: 'SEV-2',
    brief: 'At 08:05, checkout latency rises from 180 ms to 8.7 s. CPU is 34%, storage latency is normal, and users report intermittent timeouts.',
    objective: 'Determine whether contention is causal, identify the root blocker, and choose the least disruptive next action.',
    evidence: [
      {command: 'db2pd -db PROD -locks show detail', output: 'Waiter AppHandl 211 -> Holder AppHandl 184\nObject SALES.ORDERS\nRequested mode X', insight: 'A blocking relationship exists on SALES.ORDERS.'},
      {command: 'db2pd -db PROD -applications', output: '184 UOW age 00:17:42  RowsRead 12  RowsModified 8432\n211 UOW waiting 00:02:11', insight: 'The holder has a long-running unit of work and substantial modifications.'},
      {command: 'db2 "select * from table(mon_get_activity(NULL,-2))"', output: 'App 184: UPDATE SALES.ORDERS ...\nApp 211: SELECT ... FOR UPDATE', insight: 'The SQL context connects the blocker to a large update transaction.'},
      {command: 'db2pd -db PROD -transactions', output: 'App 184 log space 612 MB; status Active', insight: 'The blocking transaction is still active; intervention has recovery and business impact.'},
    ],
    decisions: [
      {label: 'Restart the Db2 instance immediately', correct: false, feedback: 'A restart has a much larger blast radius and destroys useful incident state.'},
      {label: 'Confirm business ownership of App 184, capture evidence, then coordinate commit/rollback or targeted termination if approved', correct: true, feedback: 'This addresses the root blocker while preserving evidence and minimizing collateral impact.'},
      {label: 'Increase CPU allocation', correct: false, feedback: 'CPU is not the limiting signal in the evidence.'},
      {label: 'Run RUNSTATS on SALES.ORDERS', correct: false, feedback: 'Statistics do not resolve an active blocking transaction.'},
    ],
  },
  {
    id: 'incident-log-pressure',
    title: 'Archive-log filesystem approaching capacity',
    severity: 'SEV-2',
    brief: 'The archive-log filesystem is 91% full and rising. The overnight settlement batch is still running, but no database outage has occurred yet.',
    objective: 'Establish whether the risk is generation rate, archival failure, retention pressure, or an abnormal transaction before changing log configuration.',
    evidence: [
      {command: 'db2 get db cfg for PROD | grep -i log', output: 'LOGARCHMETH1 = DISK:/archive/db2\nLOGPRIMARY = 30\nLOGSECOND = 20\nLOGFILSIZ = 16384', insight: 'Archive logging is enabled; active-log sizing alone does not explain archive capacity.'},
      {command: 'du -sh /archive/db2 && df -h /archive/db2', output: '1.82T /archive/db2\n/dev/archive 2.0T 1.82T 180G 91%', insight: 'The capacity alert is real and close to an operational threshold.'},
      {command: 'db2pd -db PROD -transactions', output: 'App 707 UOW age 02:21:07 log space 18.4 GB', insight: 'One long transaction is generating/retaining substantial log volume.'},
      {command: 'db2pd -db PROD -logs', output: 'Current LSN advancing normally\nArchive method operational\nNo archive failure flagged', insight: 'Archival is functioning; generation/retention pressure is the stronger hypothesis.'},
    ],
    decisions: [
      {label: 'Delete the oldest archive logs immediately', correct: false, feedback: 'Deleting logs without validating recovery dependencies can destroy recoverability.'},
      {label: 'Protect recovery requirements, investigate the long transaction and generation rate, then reclaim or extend capacity through the governed retention path', correct: true, feedback: 'This preserves the recovery chain while addressing the causal workload and capacity risk.'},
      {label: 'Disable archive logging', correct: false, feedback: 'That changes the recovery model during an incident and can violate RPO requirements.'},
      {label: 'Increase bufferpool memory', correct: false, feedback: 'Bufferpool memory is unrelated to archive filesystem capacity.'},
    ],
  },
  {
    id: 'incident-plan-regression',
    title: 'Critical report regresses after a bulk data change',
    severity: 'SEV-3',
    brief: 'A report that normally completes in 14 seconds now takes more than 6 minutes. The slowdown began after a bulk load changed the distribution of STATUS values.',
    objective: 'Use optimizer evidence to distinguish stale statistics from an index or infrastructure problem.',
    evidence: [
      {command: 'db2exfmt -d PROD -1 -o plan.txt', output: 'TBSCAN SALES.ORDERS\nEstimated rows: 820\nPredicate STATUS = ?', insight: 'The optimizer expects a small result and chooses a plan based on that estimate.'},
      {command: 'db2 "select count(*) from SALES.ORDERS where STATUS=\'OPEN\'"', output: '1\n-----------\n4821931', insight: 'Actual cardinality is several orders of magnitude above the estimate.'},
      {command: 'db2 "select stats_time from syscat.tables where tabschema=\'SALES\' and tabname=\'ORDERS\'"', output: '2026-07-28-02.14.18', insight: 'Statistics predate the bulk data change.'},
      {command: 'db2 reorgchk current statistics on table SALES.ORDERS', output: 'Statistics currentness warning; distribution changed materially', insight: 'Statistics freshness/distribution is the first corrective target.'},
    ],
    decisions: [
      {label: 'Create three new indexes immediately', correct: false, feedback: 'Index changes are premature while cardinality evidence is clearly stale.'},
      {label: 'Collect appropriate RUNSTATS including distribution where justified, re-EXPLAIN, then measure runtime before structural changes', correct: true, feedback: 'This fixes the optimizer input first and validates whether further tuning is necessary.'},
      {label: 'Restart the instance', correct: false, feedback: 'A restart does not correct stale optimizer statistics.'},
      {label: 'Increase sortheap by 10×', correct: false, feedback: 'The evidence points to cardinality estimation, not a demonstrated sort-memory constraint.'},
    ],
  },
];

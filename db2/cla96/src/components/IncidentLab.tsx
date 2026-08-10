import React, {useMemo, useState} from 'react';
import {officialParts} from '../data/objectives';
import {recordIncident, readLearningState} from '../utils/learningState';

type Evidence = {command: string; output: string; insight: string; relevant: boolean};
type Decision = {label: string; correct: boolean; feedback: string};

export type IncidentDefinition = {
  id: string;
  title: string;
  severity: string;
  partId: 'part-1' | 'part-2' | 'part-3' | 'part-4';
  objectiveIds: string[];
  brief: string;
  objective: string;
  evidenceBudget: number;
  evidence: Evidence[];
  decisions: Decision[];
};

export function IncidentLab({incident}: {incident: IncidentDefinition}) {
  const previous = typeof window === 'undefined' ? undefined : readLearningState().incidents[incident.id];
  const [revealed, setRevealed] = useState<number[]>([]);
  const [decision, setDecision] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const relevantTotal = incident.evidence.filter((item) => item.relevant).length;
  const relevantCollected = revealed.filter((index) => incident.evidence[index]?.relevant).length;
  const noiseCollected = revealed.length - relevantCollected;
  const evidenceScore = Math.max(0, Math.min(50, Math.round((relevantCollected / relevantTotal) * 50) - noiseCollected * 5));
  const decisionCorrect = decision !== null && incident.decisions[decision]?.correct;
  const score = useMemo(() => Math.min(100, evidenceScore + (decisionCorrect ? 50 : 0)), [evidenceScore, decisionCorrect]);
  const budgetRemaining = incident.evidenceBudget - revealed.length;
  const part = officialParts.find((item) => item.id === incident.partId);

  const inspect = (index: number) => {
    if (submitted || revealed.includes(index) || revealed.length >= incident.evidenceBudget) return;
    setRevealed((current) => [...current, index]);
  };

  const submit = () => {
    if (decision === null) return;
    setSubmitted(true);
    recordIncident(incident.id, score, Boolean(decisionCorrect && score >= 75));
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
          <span className="eyebrow">Part {part?.number} · DBA Incident Centre · {incident.severity}</span>
          <h2 id={`${incident.id}-title`}>{incident.title}</h2>
        </div>
        {previous?.completed && <span className="mastery-badge">Solved · {previous.score}%</span>}
      </div>
      <div className="incident-brief">
        <strong>Incident brief</strong><p>{incident.brief}</p>
        <strong>Objective</strong><p>{incident.objective}</p>
      </div>

      <div className="incident-coverage-row">
        <span><strong>Course coverage:</strong> {incident.objectiveIds.join(' · ')}</span>
        <span><strong>Evidence budget:</strong> {budgetRemaining}/{incident.evidenceBudget} actions remaining</span>
      </div>

      <h3>1. Gather evidence under budget</h3>
      <p>You cannot inspect everything. Choose the signals most likely to discriminate between competing hypotheses. Irrelevant evidence consumes budget and reduces the evidence score.</p>
      <div className="incident-evidence-grid">
        {incident.evidence.map((item, index) => {
          const collected = revealed.includes(index);
          const budgetExhausted = !collected && budgetRemaining <= 0;
          return (
            <div className={collected ? 'evidence-card evidence-card--open' : 'evidence-card'} key={`${incident.id}-${item.command}`}>
              <button type="button" onClick={() => inspect(index)} disabled={collected || budgetExhausted || submitted}>
                <code>{item.command}</code>
                <span>{collected ? 'Collected ✓' : budgetExhausted ? 'Budget exhausted' : 'Collect evidence'}</span>
              </button>
              {collected && (
                <div className="evidence-output">
                  <pre><code>{item.output}</code></pre>
                  <p><strong>Interpretation:</strong> {item.insight}</p>
                </div>
              )}
            </div>
          );
        })}
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
        <span>Relevant evidence: {relevantCollected}/{relevantTotal} · Noise: {noiseCollected}</span>
        <span>Evidence score: {evidenceScore}/50 · Current total: {score}%</span>
      </div>
      {!submitted ? (
        <button className="button button--primary" type="button" disabled={decision === null} onClick={submit}>Submit incident response</button>
      ) : (
        <>
          <div className={decisionCorrect && score >= 75 ? 'quiz-feedback quiz-feedback--good' : 'quiz-feedback quiz-feedback--retry'} role="status">
            <strong>{decisionCorrect ? 'Decision is operationally sound.' : 'Decision needs revision.'}</strong>{' '}
            {decision !== null ? incident.decisions[decision].feedback : ''}{' '}
            {score < 75 && 'The incident is not solved yet: improve evidence prioritization and rerun the scenario.'}
          </div>
          <button className="button button--secondary" type="button" onClick={reset}>Run incident again</button>
        </>
      )}
    </section>
  );
}

export const incidents: IncidentDefinition[] = [
  {
    id: 'incident-wrong-instance', title: 'Change executed against the wrong Db2 instance', severity: 'SEV-3', partId: 'part-1', objectiveIds: ['p1u3-o3', 'p1u3-o4'],
    brief: 'A DBA changed a database configuration value during a maintenance window. The intended database shows no change, while another application team reports unexpected behavior on the same host.',
    objective: 'Prove the execution context before making any additional change and contain the blast radius.', evidenceBudget: 3,
    evidence: [
      {command: 'echo $DB2INSTANCE && db2 get instance', output: 'DB2INSTANCE=inst_test\nThe current database manager instance is: inst_test', insight: 'The shell is attached to a different instance than the approved change target.', relevant: true},
      {command: 'db2 list db directory', output: 'Database alias = APPTEST\nDatabase alias = REPORTING', insight: 'The current instance catalog does not contain the intended production database alias.', relevant: true},
      {command: 'grep DB2INSTANCE change-window.env', output: 'DB2INSTANCE=inst_prod', insight: 'The approved runbook expected inst_prod, confirming an execution-context mismatch.', relevant: true},
      {command: 'db2 reorgchk current statistics on table all', output: 'Several tables report normal REORGCHK indicators.', insight: 'Physical organization does not explain why the approved configuration target did not change.', relevant: false},
      {command: 'df -h /backup', output: '/backup 42% used', insight: 'Backup capacity is healthy and unrelated to the wrong-instance symptom.', relevant: false},
    ],
    decisions: [
      {label: 'Stop, document the unintended change, capture both instance baselines, restore the unintended value if approved, then re-run only in the verified target context', correct: true, feedback: 'This contains the scope error, preserves evidence and makes remediation explicit before the intended change resumes.'},
      {label: 'Immediately apply the same change to inst_prod and investigate inst_test later', correct: false, feedback: 'That compounds change risk before the unintended change is understood and rolled back.'},
      {label: 'Restart the host so every instance reads the same environment', correct: false, feedback: 'A host restart has a much larger blast radius and does not correct an operator context error.'},
      {label: 'Run RUNSTATS on both instances to synchronize configuration', correct: false, feedback: 'RUNSTATS affects optimizer statistics, not instance selection or DB CFG values.'},
    ],
  },
  {
    id: 'incident-instance-listener', title: 'Applications cannot connect after a server patch', severity: 'SEV-2', partId: 'part-1', objectiveIds: ['p1u3-o2', 'p1u3-o4'],
    brief: 'Multiple databases in the same instance become unreachable immediately after an operating-system patch. Hosts respond to ping, but clients receive connection-refused errors.', objective: 'Determine whether the failure is at the shared instance/listener boundary before touching individual databases.', evidenceBudget: 3,
    evidence: [
      {command: 'db2 get instance && db2pd -edus', output: 'The current database manager instance is: db2inst1\nSQL1032N No start database manager command was issued.', insight: 'The shared instance runtime is not started.', relevant: true},
      {command: 'ss -lntp | grep 50000', output: '(no output)', insight: 'Nothing is listening on the expected Db2 TCP port.', relevant: true},
      {command: 'journalctl -u db2inst1 --since "20 min ago"', output: 'post-patch startup task failed: dependent mount /db2home unavailable at boot', insight: 'A host dependency prevented the instance startup sequence.', relevant: true},
      {command: 'db2 "select count(*) from syscat.tables"', output: 'SQL1024N A database connection does not exist.', insight: 'This confirms no connection but does not distinguish the shared startup cause by itself.', relevant: false},
      {command: 'ls -lh /backup/latest', output: 'backup image present, 148G', insight: 'Backup availability is important generally but does not explain connection refused across all databases.', relevant: false},
    ],
    decisions: [
      {label: 'Restore the missing mount/dependency, start the instance through the approved service procedure, verify the listener, then validate database connections', correct: true, feedback: 'The evidence identifies a shared startup dependency and supports the smallest corrective action.'},
      {label: 'Restore every database from backup', correct: false, feedback: 'There is no evidence of database corruption or data loss.'},
      {label: 'Recreate the database catalog entries', correct: false, feedback: 'The instance is not running; catalog changes do not address the startup dependency.'},
      {label: 'Increase database connection limits', correct: false, feedback: 'Connection refused indicates the service is not listening rather than an exhausted database connection limit.'},
    ],
  },
  {
    id: 'incident-rollforward-pending', title: 'Restore completed, service still unavailable', severity: 'SEV-2', partId: 'part-1', objectiveIds: ['p1u6-o2', 'p1u6-o3', 'p1u6-o4'],
    brief: 'A recovery operator reports that RESTORE returned success. Application reconnects fail and an engineer proposes another restore with a different image.', objective: 'Interpret the database recovery state and avoid repeating a successful phase unnecessarily.', evidenceBudget: 3,
    evidence: [
      {command: 'db2 connect to PROD', output: 'SQL1117N Connection cannot be made because the database is ROLL-FORWARD PENDING.', insight: 'The restore phase succeeded but recovery is not complete.', relevant: true},
      {command: 'db2 list history backup all for PROD', output: 'Backup image 20260809... ONLINE\nFirst active log S0004812.LOG', insight: 'Recovery history identifies the base image and log-chain context.', relevant: true},
      {command: 'ls /archive/prod/S00048*.LOG | tail', output: 'S0004812.LOG ... S0004874.LOG', insight: 'The required archive-log sequence appears available for continued recovery.', relevant: true},
      {command: 'db2 reorgchk current statistics on table all', output: 'No critical reorganization recommendations.', insight: 'Physical organization is unrelated to rollforward-pending state.', relevant: false},
      {command: 'db2pd -db PROD -locks', output: 'Database PROD not active.', insight: 'No active locks are expected while the database is pending recovery; this is not the discriminating signal.', relevant: false},
    ],
    decisions: [
      {label: 'Continue roll-forward recovery using the required logs to the governed recovery point, stop/complete rollforward, then validate the database and application', correct: true, feedback: 'The evidence shows the base restore is complete and the remaining recovery phase is log application and validation.'},
      {label: 'Repeat RESTORE with a newer image without checking the requested recovery point', correct: false, feedback: 'Repeating a successful phase can move the recovery base and complicate the intended recovery objective.'},
      {label: 'Run REORG on catalog tables', correct: false, feedback: 'REORG does not transition a database out of rollforward pending.'},
      {label: 'Force applications to clear the pending state', correct: false, feedback: 'The database is pending recovery, not blocked by an application transaction.'},
    ],
  },
  {
    id: 'incident-load-state', title: 'Morning application outage after bulk LOAD', severity: 'SEV-2', partId: 'part-2', objectiveIds: ['p2u1-o2', 'p2u1-o3'],
    brief: 'The scheduler marked a large overnight LOAD job successful. At 06:00, queries against APP.ORDERS fail while other tables remain available.', objective: 'Determine the target table state and the required follow-up instead of treating utility return code as completion.', evidenceBudget: 3,
    evidence: [
      {command: 'db2 load query table APP.ORDERS', output: 'Number rows loaded=1250000\nTablestate: Set Integrity Pending', insight: 'The table requires integrity processing before normal application use.', relevant: true},
      {command: 'db2 list utilities show detail', output: 'No active utilities.', insight: 'LOAD is no longer executing; the problem is the resulting object state.', relevant: true},
      {command: 'cat orders_load.msg | tail -20', output: 'SQL3601W Table placed in Set Integrity Pending due to constraint processing requirements.', insight: 'The utility message explains the required post-load condition.', relevant: true},
      {command: 'db2pd -db PROD -locks', output: 'No significant lock waits on APP.ORDERS.', insight: 'Lock contention does not explain the table-state error.', relevant: false},
      {command: 'vmstat 1 5', output: 'CPU idle 61%, no swap pressure.', insight: 'Host capacity is not the cause of an object-state failure.', relevant: false},
    ],
    decisions: [
      {label: 'Follow the governed SET INTEGRITY/exception handling path, validate constraints and table state, then refresh statistics if justified by the data change', correct: true, feedback: 'This addresses the actual post-LOAD object state and validates readiness before returning service.'},
      {label: 'Restart Db2 so pending table states clear automatically', correct: false, feedback: 'Restart does not substitute for required integrity processing.'},
      {label: 'Drop and recreate APP.ORDERS from the source file', correct: false, feedback: 'That creates unnecessary data-loss and recovery risk before using the supported state-resolution workflow.'},
      {label: 'Increase LOGPRIMARY and retry application queries', correct: false, feedback: 'Log sizing is not the cause shown by LOAD_QUERY and the utility messages.'},
    ],
  },
  {
    id: 'incident-log-pressure', title: 'Archive-log filesystem approaching capacity', severity: 'SEV-2', partId: 'part-2', objectiveIds: ['p2u2-o1', 'p2u2-o2'],
    brief: 'The archive-log filesystem is 91% full and rising during settlement. No database outage has occurred yet.', objective: 'Distinguish archival failure from generation/retention pressure and protect the recovery chain.', evidenceBudget: 3,
    evidence: [
      {command: 'db2pd -db PROD -logs', output: 'Current LSN advancing normally\nArchive method operational\nNo archive failure flagged', insight: 'Archival is functioning; the stronger hypothesis is generation/retention pressure.', relevant: true},
      {command: 'db2pd -db PROD -transactions', output: 'App 707 UOW age 02:21:07 log space 18.4 GB', insight: 'A long unit of work is generating/retaining substantial log volume.', relevant: true},
      {command: 'df -h /archive/db2', output: '/dev/archive 2.0T 1.82T 180G 91%', insight: 'The capacity risk is real and close to the operational threshold.', relevant: true},
      {command: 'db2exfmt -d PROD -1', output: 'Latest explained report query uses IXSCAN.', insight: 'The access plan does not discriminate between archival failure and log-generation pressure.', relevant: false},
      {command: 'db2 "select count(*) from syscat.tables"', output: '428', insight: 'Catalog object count is unrelated to the immediate archive-capacity mechanism.', relevant: false},
    ],
    decisions: [
      {label: 'Protect required recovery logs, coordinate the long transaction/workload, extend or reclaim capacity through the governed retention path, then correct sizing/batch design', correct: true, feedback: 'This preserves recoverability while addressing both immediate capacity and causal workload pressure.'},
      {label: 'Delete the oldest archive logs immediately', correct: false, feedback: 'Uncontrolled deletion can destroy recovery dependencies.'},
      {label: 'Disable archive logging until the batch finishes', correct: false, feedback: 'Changing the recovery model during an incident can violate RPO requirements.'},
      {label: 'Increase bufferpool memory to reduce archive usage', correct: false, feedback: 'Bufferpool memory does not directly solve archive-log filesystem capacity.'},
    ],
  },
  {
    id: 'incident-hadr-lag', title: 'HADR standby falling behind during peak load', severity: 'SEV-2', partId: 'part-2', objectiveIds: ['p2u2-o4'],
    brief: 'The primary remains available, but the HADR standby replay gap grows steadily during peak processing. Operations wants to force a takeover “to reset HADR.”', objective: 'Identify whether transport, replay capacity or primary generation is driving the lag before changing roles.', evidenceBudget: 3,
    evidence: [
      {command: 'db2pd -db PROD -hadr', output: 'HADR_STATE=REMOTE_CATCHUP\nHADR_LOG_GAP=38 GB\nLOG_HADR_WAIT_CUR=0', insight: 'The standby is behind, but the primary is not currently waiting on HADR transport.', relevant: true},
      {command: 'standby: iostat -x 1 5', output: 'data volume await=38ms util=99%', insight: 'Standby storage is saturated, supporting replay-side capacity as a cause.', relevant: true},
      {command: 'primary: db2pd -db PROD -logs', output: 'Log generation 420 MB/s during batch; archive healthy.', insight: 'Peak log generation is high and must be compared with standby replay capacity.', relevant: true},
      {command: 'primary: db2 reorgchk current statistics on table all', output: 'No urgent REORG indicators.', insight: 'Table organization does not explain HADR replay lag.', relevant: false},
      {command: 'standby: ls -l /etc/ssl/certs | wc -l', output: '164', insight: 'Certificate file count is unrelated to the observed replay/storage bottleneck.', relevant: false},
    ],
    decisions: [
      {label: 'Keep roles stable while capacity is investigated; address standby replay/storage throughput or workload generation, then verify the HADR gap returns to policy bounds', correct: true, feedback: 'Takeover does not fix a replay-capacity bottleneck and can increase risk while the standby is behind.'},
      {label: 'Force takeover immediately so the lag counter resets', correct: false, feedback: 'A lagging standby is a poor takeover target unless a real failover decision and data-risk assessment justify it.'},
      {label: 'Disable logging on the primary', correct: false, feedback: 'HADR depends on logs and disabling the recovery mechanism is not a tuning action.'},
      {label: 'Drop primary indexes to reduce HADR network traffic without workload testing', correct: false, feedback: 'This changes application performance and write behavior without evidence that indexes are the HADR bottleneck.'},
    ],
  },
  {
    id: 'incident-lock-chain', title: 'Application latency spikes while CPU stays normal', severity: 'SEV-2', partId: 'part-3', objectiveIds: ['p3u1-o3', 'p3u1-o4'],
    brief: 'Checkout latency rises from 180 ms to 8.7 s. CPU is 34%, storage latency is normal, and users report intermittent timeouts.', objective: 'Determine whether contention is causal, identify the root blocker and choose the least disruptive action.', evidenceBudget: 3,
    evidence: [
      {command: 'db2pd -db PROD -locks show detail', output: 'Waiter AppHandl 211 -> Holder AppHandl 184\nObject SALES.ORDERS\nRequested mode X', insight: 'A blocking relationship exists on SALES.ORDERS.', relevant: true},
      {command: 'db2pd -db PROD -applications', output: '184 UOW age 00:17:42 RowsModified 8432\n211 UOW waiting 00:02:11', insight: 'The holder has a long-running unit of work and substantial modifications.', relevant: true},
      {command: 'db2 "select * from table(mon_get_activity(NULL,-2))"', output: 'App 184: UPDATE SALES.ORDERS ...\nApp 211: SELECT ... FOR UPDATE', insight: 'SQL context connects the blocker to a large update transaction.', relevant: true},
      {command: 'db2 list history backup all for PROD', output: 'Last online backup 02:00 successful.', insight: 'Backup status does not explain a live blocking chain.', relevant: false},
      {command: 'db2 "select stats_time from syscat.tables where tabname=\'ORDERS\'"', output: 'Statistics collected yesterday.', insight: 'Fresh statistics do not resolve the active transaction dependency shown by lock evidence.', relevant: false},
    ],
    decisions: [
      {label: 'Confirm business ownership of App 184, preserve evidence, then coordinate commit/rollback or targeted termination if approved', correct: true, feedback: 'This addresses the root blocker while minimizing collateral impact.'},
      {label: 'Restart the Db2 instance immediately', correct: false, feedback: 'A restart has a much larger blast radius and destroys useful incident state.'},
      {label: 'Increase CPU allocation', correct: false, feedback: 'CPU is not the limiting signal.'},
      {label: 'Run RUNSTATS on SALES.ORDERS', correct: false, feedback: 'Statistics do not resolve an active blocking transaction.'},
    ],
  },
  {
    id: 'incident-deadlock-escalation', title: 'Deadlocks surge after transaction scope changed', severity: 'SEV-3', partId: 'part-3', objectiveIds: ['p3u1-o2', 'p3u1-o3', 'p3u1-o4'],
    brief: 'After an application release, deadlock victims increase from near zero to dozens per hour. The application team requests a much larger LOCKTIMEOUT.', objective: 'Distinguish deadlocks from timeouts and identify transaction/lock ordering before tuning wait duration.', evidenceBudget: 3,
    evidence: [
      {command: 'locking event monitor: latest deadlock', output: 'App A holds ROW ORDERS/41, requests INVENTORY/9\nApp B holds ROW INVENTORY/9, requests ORDERS/41', insight: 'The applications form a lock dependency cycle; this is a deadlock, not a simple long wait.', relevant: true},
      {command: 'release diff: transaction module', output: 'New code updates ORDERS then INVENTORY in path A; INVENTORY then ORDERS in path B.', insight: 'Inconsistent object access order explains the new deadlock cycle.', relevant: true},
      {command: 'db2 get db cfg for PROD | grep -E "LOCKTIMEOUT|MAXLOCKS|LOCKLIST"', output: 'LOCKTIMEOUT=30\nMAXLOCKS=AUTOMATIC\nLOCKLIST=AUTOMATIC', insight: 'Increasing wait duration would not remove the circular dependency.', relevant: true},
      {command: 'df -h /archive/db2', output: '/archive 52% used', insight: 'Archive capacity is healthy and unrelated to deadlock formation.', relevant: false},
      {command: 'db2exfmt -d PROD -1', output: 'Top reporting query uses expected IXSCAN.', insight: 'The reporting access plan does not explain the transaction deadlock cycle.', relevant: false},
    ],
    decisions: [
      {label: 'Fix transaction access ordering/scope in the application, keep deadlock diagnostics enabled during validation, and adjust lock configuration only if separate evidence justifies it', correct: true, feedback: 'The root cause is the circular dependency introduced by inconsistent transaction ordering.'},
      {label: 'Increase LOCKTIMEOUT from 30 seconds to 10 minutes', correct: false, feedback: 'Deadlocks are cycles; waiting longer does not make the cycle resolvable.'},
      {label: 'Set every query to UR isolation', correct: false, feedback: 'Changing application correctness semantics globally is not a valid deadlock fix.'},
      {label: 'Disable deadlock detection', correct: false, feedback: 'Deadlock detection protects progress by selecting a victim; disabling evidence/control worsens the problem.'},
    ],
  },
  {
    id: 'incident-authorization-path', title: 'Payroll access denied after role cleanup', severity: 'SEV-3', partId: 'part-3', objectiveIds: ['p3u2-o1', 'p3u2-o3', 'p3u3-o2'],
    brief: 'A payroll analyst authenticates and connects normally but receives SQL0551N on one secured view after a role cleanup. Other reporting views still work.', objective: 'Trace effective authorization and fine-grained policy before granting broad authority.', evidenceBudget: 3,
    evidence: [
      {command: 'catalog query: role authorizations for ANALYST7', output: 'REPORT_READER granted\nPAYROLL_READER not granted', insight: 'The identity lost the application-specific role required by the secured data path.', relevant: true},
      {command: 'catalog query: privileges on HR.PAYROLL_SECURE_V', output: 'SELECT granted to ROLE PAYROLL_READER', insight: 'The object privilege exists through a role the user no longer holds.', relevant: true},
      {command: 'catalog query: RCAC permissions on HR.PAYROLL', output: 'ROW permission ACTIVE for REGION_CONTEXT', insight: 'RCAC remains active and must be considered after the role path is restored; it does not explain the missing view privilege by itself.', relevant: true},
      {command: 'ping db2prod', output: '0% packet loss', insight: 'Connectivity is healthy and the user already authenticated, so network evidence does not discriminate authorization causes.', relevant: false},
      {command: 'db2pd -db PROD -logs', output: 'Log utilization normal.', insight: 'Logging health is unrelated to the authorization error.', relevant: false},
    ],
    decisions: [
      {label: 'Restore the approved PAYROLL_READER role membership after change verification, then test the RCAC-constrained result set with the analyst identity', correct: true, feedback: 'This repairs the intended least-privilege path and validates the fine-grained policy instead of granting broad authority.'},
      {label: 'Grant DBADM to the analyst so future role cleanup cannot affect access', correct: false, feedback: 'DBADM far exceeds the described business duty and weakens separation of duties.'},
      {label: 'Disable RCAC on the payroll table', correct: false, feedback: 'The evidence first shows a missing role path; disabling data policy would broaden exposure unnecessarily.'},
      {label: 'Reset the analyst password', correct: false, feedback: 'Authentication already succeeds; the failure is authorization/policy.'},
    ],
  },
  {
    id: 'incident-plan-regression', title: 'Critical report regresses after a bulk data change', severity: 'SEV-3', partId: 'part-4', objectiveIds: ['p4u1-o1', 'p4u1-o3', 'p4u3-o3'],
    brief: 'A report that normally completes in 14 seconds now takes more than 6 minutes. The slowdown began after a bulk load changed STATUS distribution.', objective: 'Use optimizer evidence to distinguish stale statistics from an immediate index or infrastructure problem.', evidenceBudget: 3,
    evidence: [
      {command: 'db2exfmt -d PROD -1 -o plan.txt', output: 'TBSCAN SALES.ORDERS\nEstimated rows: 820\nPredicate STATUS = ?', insight: 'The optimizer expects a small result based on its current model.', relevant: true},
      {command: 'runtime count for STATUS=OPEN', output: '4,821,931 rows', insight: 'Actual cardinality is several orders of magnitude above the estimate.', relevant: true},
      {command: 'select stats_time from syscat.tables ...', output: '2026-07-28-02.14.18', insight: 'Statistics predate the bulk distribution change.', relevant: true},
      {command: 'db2pd -db PROD -hadr', output: 'HADR_STATE=PEER, gap=0', insight: 'HADR health does not explain the query cardinality mismatch.', relevant: false},
      {command: 'free -g', output: '42 GB available memory', insight: 'Free memory does not explain why estimated rows differ from actual by orders of magnitude.', relevant: false},
    ],
    decisions: [
      {label: 'Collect appropriate statistics including distribution where justified, re-EXPLAIN, then measure runtime before structural changes', correct: true, feedback: 'This corrects optimizer input first and tests whether further tuning is still required.'},
      {label: 'Create three new indexes immediately', correct: false, feedback: 'Index changes are premature while cardinality evidence is clearly stale.'},
      {label: 'Restart the instance', correct: false, feedback: 'A restart does not correct stale optimizer statistics.'},
      {label: 'Increase sortheap by 10×', correct: false, feedback: 'The evidence points to cardinality estimation, not a demonstrated sort-memory constraint.'},
    ],
  },
  {
    id: 'incident-index-regression', title: 'New index fixes report, hurts transaction latency', severity: 'SEV-3', partId: 'part-4', objectiveIds: ['p4u2-o2', 'p4u2-o3', 'p4u2-o5'],
    brief: 'A Design Advisor recommendation was implemented. The target report is 6× faster, but peak INSERT/UPDATE latency rises by 38% and the batch LOAD window expands.', objective: 'Evaluate the recommendation as a workload trade-off and decide whether to keep, redesign or roll back the index.', evidenceBudget: 3,
    evidence: [
      {command: 'MON_GET_INDEX for new index', output: 'INDEX_SCANS=18450\nROWS_READ=22M', insight: 'The index is heavily used by the read workload and is not simply unused overhead.', relevant: true},
      {command: 'before/after transaction KPI', output: 'p95 write latency 42ms -> 58ms\nLOAD 31min -> 44min', insight: 'The index has measurable write and utility cost across production workloads.', relevant: true},
      {command: 'db2advis workload comparison', output: 'Estimated report benefit 84%; disk +12GB; workload sample contained no batch LOAD statements.', insight: 'The advisor workload omitted an important production cost domain.', relevant: true},
      {command: 'db2 list history backup all for PROD', output: 'Nightly backups successful.', insight: 'Backup success does not determine whether the index is a net workload improvement.', relevant: false},
      {command: 'db2pd -db PROD -hadr', output: 'PEER, gap 0', insight: 'HADR health does not explain the observed write-maintenance overhead.', relevant: false},
    ],
    decisions: [
      {label: 'Evaluate net service impact and alternative index/query designs; keep the index only if read benefit justifies measured write/LOAD cost, otherwise roll back or redesign', correct: true, feedback: 'Physical design should optimize the whole representative workload with explicit guardrails.'},
      {label: 'Keep it unconditionally because the target report improved', correct: false, feedback: 'Single-query success is insufficient when other service objectives regress materially.'},
      {label: 'Add more covering indexes until write latency improves', correct: false, feedback: 'Additional indexes generally add write maintenance rather than remove it.'},
      {label: 'Disable transaction logging to compensate for index cost', correct: false, feedback: 'Logging is a recovery mechanism and not a valid compensation for physical-design overhead.'},
    ],
  },
  {
    id: 'incident-temp-capacity', title: 'Sort workload drives temporary table space toward exhaustion', severity: 'SEV-2', partId: 'part-4', objectiveIds: ['p4u4-o2', 'p4u4-o3', 'p4u4-o5'],
    brief: 'A month-end analytics job causes temporary table-space utilization to jump from 28% to 93%. CPU is moderate and user queries begin failing with temporary-space allocation errors.', objective: 'Correlate workload and temporary-space evidence before making broad memory or storage changes.', evidenceBudget: 3,
    evidence: [
      {command: 'MON_GET_TABLESPACE for TEMPSPACE1', output: 'used_pages=1,860,000\nusable_pages=2,000,000\nutilization=93%', insight: 'Temporary table-space pressure is confirmed and close to exhaustion.', relevant: true},
      {command: 'MON_GET_PKG_CACHE_STMT top sorts', output: 'MONTH_END_FACT query: total_sorts=1,842\nsort_overflows=611\nrows_read=3.2B', insight: 'One analytics statement dominates sort/temp demand and overflows.', relevant: true},
      {command: 'db2exfmt for MONTH_END_FACT', output: 'Large SORT after join; estimated rows 18M, actual runtime 240M', insight: 'The plan/cardinality gap explains why temporary demand is much larger than expected.', relevant: true},
      {command: 'db2pd -db PROD -locks', output: 'No lock waits.', insight: 'Locking is healthy but does not explain temporary-space exhaustion.', relevant: false},
      {command: 'df -h /archive/db2', output: 'Archive filesystem 47% used.', insight: 'Archive-log capacity is unrelated to temporary table-space pressure in this incident.', relevant: false},
    ],
    decisions: [
      {label: 'Protect immediate temp capacity if needed, then correct the dominant SQL/cardinality/sort mechanism and validate temp/sort guardrails under representative month-end load', correct: true, feedback: 'This addresses both the immediate resource risk and the workload mechanism driving it.'},
      {label: 'Increase every database memory parameter by 4×', correct: false, feedback: 'Broad memory changes do not test the demonstrated cardinality/sort mechanism and can shift pressure elsewhere.'},
      {label: 'Force all month-end queries to UR isolation', correct: false, feedback: 'Isolation does not resolve the sort/temp demand shown by the evidence.'},
      {label: 'Delete archive logs to free temporary table-space pages', correct: false, feedback: 'Archive-log storage and database temporary table space are different resources.'},
    ],
  },
];

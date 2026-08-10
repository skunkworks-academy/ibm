export type SimulatorScenario = 'baseline' | 'load' | 'recovery' | 'plan' | 'locking';

export type SimulatorState = {
  scenario: SimulatorScenario;
  instanceStarted: boolean;
  connected: boolean;
  databaseState: 'ACTIVE' | 'ROLLFORWARD_PENDING';
  tableState: 'NORMAL' | 'LOAD_PENDING' | 'SET_INTEGRITY_PENDING';
  statistics: 'CURRENT' | 'STALE';
  lockWait: boolean;
  blockerHandle: number | null;
  archivePct: number;
  backupAvailable: boolean;
};

export type SimulatorResult = {
  state: SimulatorState;
  output: string;
};

const clone = (state: SimulatorState): SimulatorState => ({...state});

export function createSimulatorState(scenario: SimulatorScenario = 'baseline'): SimulatorState {
  const base: SimulatorState = {
    scenario,
    instanceStarted: true,
    connected: true,
    databaseState: 'ACTIVE',
    tableState: 'NORMAL',
    statistics: 'CURRENT',
    lockWait: false,
    blockerHandle: null,
    archivePct: 54,
    backupAvailable: true,
  };

  if (scenario === 'load') return {...base, tableState: 'SET_INTEGRITY_PENDING', statistics: 'STALE'};
  if (scenario === 'recovery') return {...base, databaseState: 'ROLLFORWARD_PENDING', connected: false};
  if (scenario === 'plan') return {...base, statistics: 'STALE'};
  if (scenario === 'locking') return {...base, lockWait: true, blockerHandle: 184};
  return base;
}

function scenarioFromCommand(command: string): SimulatorScenario | null {
  const value = command.toLowerCase().replace(/^scenario\s+/, '').trim();
  if (['baseline', 'load', 'recovery', 'plan', 'locking'].includes(value)) return value as SimulatorScenario;
  return null;
}

function snapshot(state: SimulatorState): string {
  return [
    `Scenario        = ${state.scenario}`,
    `Instance        = ${state.instanceStarted ? 'STARTED' : 'STOPPED'}`,
    `Connection      = ${state.connected ? 'SAMPLE' : 'NONE'}`,
    `Database state  = ${state.databaseState}`,
    `APP.ORDERS      = ${state.tableState}`,
    `Statistics      = ${state.statistics}`,
    `Lock wait       = ${state.lockWait ? `YES (holder ${state.blockerHandle})` : 'NO'}`,
    `Archive usage   = ${state.archivePct}%`,
  ].join('\n');
}

export function executeDb2Command(current: SimulatorState, rawCommand: string): SimulatorResult {
  const command = rawCommand.trim();
  const lower = command.toLowerCase();
  let state = clone(current);

  if (!command) return {state, output: 'Enter a command.'};

  if (lower.startsWith('scenario ')) {
    const scenario = scenarioFromCommand(lower);
    if (!scenario) return {state, output: 'Unknown scenario. Use: scenario baseline | load | recovery | plan | locking'};
    state = createSimulatorState(scenario);
    return {state, output: `Scenario loaded: ${scenario}\n\n${snapshot(state)}\n\nThe simulator state has changed. Diagnose it with Db2 commands.`};
  }

  if (/\bstatus\b/.test(lower)) return {state, output: snapshot(state)};

  if (/db2level/.test(lower)) {
    return {state, output: 'DB21085I  This instance uses "64" bits and Db2 code release "SQL12010".\nService level = DB2 v12.1 training simulation\n\nOperational note: production maintenance requires the exact installed Mod/Fix/service level and platform prerequisites.'};
  }

  if (/\bdb2stop\b/.test(lower)) {
    state.instanceStarted = false;
    state.connected = false;
    return {state, output: 'SQL1064N  DB2STOP processing was successful.\n\nState transition: instance STARTED → STOPPED; existing simulated connection cleared.'};
  }

  if (/\bdb2start\b/.test(lower)) {
    state.instanceStarted = true;
    return {state, output: 'SQL1063N  DB2START processing was successful.\n\nState transition: instance → STARTED.'};
  }

  if (/connect\s+to\s+sample/.test(lower)) {
    if (!state.instanceStarted) return {state, output: 'SQL1032N  No start database manager command was issued. SQLSTATE=57019'};
    if (state.databaseState === 'ROLLFORWARD_PENDING') return {state, output: 'SQL1117N  A connection to or activation of database "SAMPLE" cannot be made because of ROLL-FORWARD PENDING. SQLSTATE=57019'};
    state.connected = true;
    return {state, output: 'Database Connection Information\nDatabase server = DB2/LINUXX8664 12.1\nDatabase alias  = SAMPLE'};
  }

  if (/terminate|connect\s+reset/.test(lower)) {
    state.connected = false;
    return {state, output: 'DB20000I  The command completed successfully.\nConnection state → NONE.'};
  }

  if (/get\s+db\s+cfg/.test(lower)) {
    return {state, output: `Database Configuration for Database SAMPLE\n\n First log archive method (LOGARCHMETH1) = DISK:/db2archive\n Log file size (4KB) (LOGFILSIZ)          = 8192\n Number of primary log files (LOGPRIMARY) = 20\n Number of secondary log files (LOGSECOND)= 10\n Database state                            = ${state.databaseState}\n Archive filesystem usage                  = ${state.archivePct}%`};
  }

  if (/list\s+tablespaces|mon_get_tablespace/.test(lower)) {
    return {state, output: 'TBSP_NAME        STATE       USED_PAGES  FREE_PAGES\nSYSCATSPACE      NORMAL      1840        510\nUSERSPACE1       NORMAL      74210       21180\nTEMPSPACE1       NORMAL      1290        18710\n\nLearning note: capacity evidence must be interpreted with active/archive logs and backup storage.'};
  }

  if (/\bload\s+from\b/.test(lower)) {
    if (!state.instanceStarted || !state.connected) return {state, output: 'SQL1024N  A database connection does not exist. SQLSTATE=08003'};
    state.tableState = 'SET_INTEGRITY_PENDING';
    state.statistics = 'STALE';
    return {state, output: 'SQL3109N  The utility is beginning to load data.\nSQL3110N  The utility has completed processing.\nRows loaded = 125000\n\nState transition: APP.ORDERS → SET_INTEGRITY_PENDING\nStatistics → STALE\n\nThe client command completed, but the table is not yet application-ready.'};
  }

  if (/load\s+query\s+table|list\s+utilities|mon_get_utility/.test(lower)) {
    return {state, output: `Utility status\nDatabase = SAMPLE\nObject   = APP.ORDERS\nActive utility = NONE\nTable state    = ${state.tableState}\nStatistics    = ${state.statistics}\n\nInterpret the resulting object state; utility completion alone is not operational completion.`};
  }

  if (/set\s+integrity\s+for\s+app\.orders/.test(lower)) {
    if (state.tableState === 'NORMAL') return {state, output: 'APP.ORDERS is already in NORMAL state.'};
    state.tableState = 'NORMAL';
    return {state, output: 'DB20000I  The SQL command completed successfully.\nState transition: APP.ORDERS → NORMAL.\n\nStatistics remain STALE until refreshed when justified.'};
  }

  if (/backup\s+db\s+sample/.test(lower)) {
    state.backupAvailable = true;
    return {state, output: 'Backup successful. Timestamp for this backup image is : 20260809214500\n\nTraining note: the image is only one input to recovery; restore/recovery validation still matters.'};
  }

  if (/restore\s+db\s+sample/.test(lower)) {
    if (!state.backupAvailable) return {state, output: 'SQL2570N  No matching backup image is available in the simulated catalog.'};
    state.databaseState = 'ROLLFORWARD_PENDING';
    state.connected = false;
    return {state, output: 'DB20000I  The RESTORE DATABASE command completed successfully.\n\nState transition: SAMPLE → ROLLFORWARD_PENDING\nConnection cleared. Apply the required log chain and explicitly complete rollforward.'};
  }

  if (/rollforward\s+db\s+sample/.test(lower) && /(stop|complete|end\s+of\s+logs)/.test(lower)) {
    state.databaseState = 'ACTIVE';
    return {state, output: 'Rollforward Status\nInput database alias = SAMPLE\nStatus = not pending\n\nState transition: SAMPLE → ACTIVE. Validate application/database state before declaring recovery complete.'};
  }

  if (/runstats\s+on\s+table\s+app\.orders/.test(lower)) {
    state.statistics = 'CURRENT';
    return {state, output: 'DB20000I  The RUNSTATS command completed successfully.\nState transition: APP.ORDERS statistics STALE → CURRENT.\n\nRe-EXPLAIN and measure runtime; statistics refresh is not proof of performance improvement.'};
  }

  if (/reorgchk/.test(lower)) {
    return {state, output: 'REORGCHK simulation\nAPP.ORDERS: F1=0 F2=0 F3=0\nNo automatic REORG decision is implied. Use object/workload evidence before scheduling physical maintenance.'};
  }

  if (/db2exfmt|db2expln|explain\s+plan/.test(lower)) {
    if (state.statistics === 'STALE') {
      return {state, output: 'EXPLAIN simulation\nAccess plan: TBSCAN APP.ORDERS\nEstimated rows: 820\nObserved rows in scenario: 4,821,931\nStatistics: STALE\n\nSignal: the large estimate/actual gap makes statistics and selectivity the first hypothesis.'};
    }
    return {state, output: 'EXPLAIN simulation\nAccess plan: IXSCAN ORDERS_STATUS_IX → FETCH → RETURN\nEstimated rows: 4,760,000\nObserved rows in scenario: 4,821,931\nStatistics: CURRENT\n\nSignal: cardinality is now close enough to compare access-path cost and workload trade-offs.'};
  }

  if (/db2pd.*locks/.test(lower)) {
    if (!state.lockWait) return {state, output: 'Locks being waited on: none.'};
    return {state, output: `Locks being waited on\nWaiter AppHandl 211 -> Holder AppHandl ${state.blockerHandle}\nObject APP.ORDERS\nRequested mode X\nStatus WAIT\n\nNext evidence: application/UOW age and SQL context.`};
  }

  if (/db2pd.*applications|mon_get_activity/.test(lower)) {
    if (!state.lockWait) return {state, output: 'Applications active: 7\nNo application is currently waiting on a lock in this scenario.'};
    return {state, output: `App ${state.blockerHandle}: UOW age 00:17:42 RowsModified 8432 SQL=UPDATE APP.ORDERS ...\nApp 211: WAITING 00:02:11 SQL=SELECT ... FOR UPDATE`};
  }

  if (/force\s+application\s*\(\s*184\s*\)/.test(lower)) {
    if (!state.lockWait) return {state, output: 'SQL0100W  No matching blocker is active in the current simulator state.'};
    state.lockWait = false;
    state.blockerHandle = null;
    return {state, output: 'DB20000I  FORCE APPLICATION simulated successfully.\nState transition: lock wait → cleared.\n\nOperational warning: targeted termination can roll back work; business ownership and approval are part of the real decision.'};
  }

  if (/select\s+.*app\.orders/.test(lower)) {
    if (!state.connected) return {state, output: 'SQL1024N  A database connection does not exist. SQLSTATE=08003'};
    if (state.tableState !== 'NORMAL') return {state, output: `SQL0668N  Operation not allowed for reason code "1" on table "APP.ORDERS".\nSimulated table state = ${state.tableState}.`};
    if (state.lockWait) return {state, output: `Statement is waiting on holder application ${state.blockerHandle}.\nUse db2pd / monitoring SQL to inspect the dependency before intervening.`};
    return {state, output: 'ID       STATUS      AMOUNT\n-------- ----------- ----------\n1001     OPEN        219.40\n1002     CLOSED      81.25\n\n2 record(s) selected.'};
  }

  if (/values\s+current\s+isolation/.test(lower)) return {state, output: '1\n--\nCS\n\n1 record(s) selected.'};
  if (/db2diag/.test(lower)) return {state, output: `db2diag training extract\n2026-08-09-21.45.00 Database SAMPLE state=${state.databaseState}\n2026-08-09-21.45.01 APP.ORDERS table_state=${state.tableState}\n2026-08-09-21.45.02 lock_wait=${state.lockWait}`};

  return {state, output: `Command not modeled: ${command}\n\nNo destructive command was executed. Use “status” to inspect simulator state or load one of: scenario baseline | load | recovery | plan | locking.`};
}

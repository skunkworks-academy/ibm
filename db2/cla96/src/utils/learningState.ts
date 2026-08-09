import {COURSE_STORAGE_KEY} from '../data/course';

export type CheckResult = {
  correct: boolean;
  attempts: number;
  updatedAt: string;
};

export type ChecklistResult = {
  checked: number[];
  updatedAt: string;
};

export type IncidentResult = {
  completed: boolean;
  score: number;
  attempts: number;
  updatedAt: string;
};

export type LearningState = {
  completed: string[];
  updatedAt: string;
  lastLocation?: string;
  lastVisitedAt?: string;
  checks: Record<string, CheckResult>;
  checklists: Record<string, ChecklistResult>;
  incidents: Record<string, IncidentResult>;
};

export const LEARNING_EVENT = 'cla96-progress';

export function emptyLearningState(): LearningState {
  return {
    completed: [],
    updatedAt: new Date().toISOString(),
    checks: {},
    checklists: {},
    incidents: {},
  };
}

export function readLearningState(): LearningState {
  if (typeof window === 'undefined') return emptyLearningState();
  try {
    const parsed = JSON.parse(window.localStorage.getItem(COURSE_STORAGE_KEY) ?? '{}') as Partial<LearningState>;
    return {
      completed: Array.isArray(parsed.completed) ? parsed.completed.filter(Boolean) : [],
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
      lastLocation: parsed.lastLocation,
      lastVisitedAt: parsed.lastVisitedAt,
      checks: parsed.checks && typeof parsed.checks === 'object' ? parsed.checks : {},
      checklists: parsed.checklists && typeof parsed.checklists === 'object' ? parsed.checklists : {},
      incidents: parsed.incidents && typeof parsed.incidents === 'object' ? parsed.incidents : {},
    };
  } catch {
    return emptyLearningState();
  }
}

export function writeLearningState(next: LearningState) {
  if (typeof window === 'undefined') return;
  const state = {...next, updatedAt: new Date().toISOString()};
  window.localStorage.setItem(COURSE_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(LEARNING_EVENT, {detail: state}));
}

export function patchLearningState(patch: Partial<LearningState>) {
  const current = readLearningState();
  writeLearningState({...current, ...patch});
}

export function rememberLocation(pathname: string) {
  if (!pathname || pathname.endsWith('/final-assessment')) return;
  const current = readLearningState();
  writeLearningState({
    ...current,
    lastLocation: pathname,
    lastVisitedAt: new Date().toISOString(),
  });
}

export function markLessonComplete(lessonId: string) {
  const current = readLearningState();
  writeLearningState({
    ...current,
    completed: Array.from(new Set([...current.completed, lessonId])),
  });
}

export function recordCheck(id: string, correct: boolean) {
  const current = readLearningState();
  const previous = current.checks[id];
  writeLearningState({
    ...current,
    checks: {
      ...current.checks,
      [id]: {
        correct,
        attempts: (previous?.attempts ?? 0) + 1,
        updatedAt: new Date().toISOString(),
      },
    },
  });
}

export function recordChecklist(id: string, checked: number[]) {
  const current = readLearningState();
  writeLearningState({
    ...current,
    checklists: {
      ...current.checklists,
      [id]: {checked: Array.from(new Set(checked)).sort((a, b) => a - b), updatedAt: new Date().toISOString()},
    },
  });
}

export function recordIncident(id: string, score: number, completed: boolean) {
  const current = readLearningState();
  const previous = current.incidents[id];
  writeLearningState({
    ...current,
    incidents: {
      ...current.incidents,
      [id]: {
        completed: previous?.completed || completed,
        score: Math.max(previous?.score ?? 0, score),
        attempts: (previous?.attempts ?? 0) + 1,
        updatedAt: new Date().toISOString(),
      },
    },
  });
}

export function granularProgress(state: LearningState) {
  const lessonWeight = 5;
  const checkWeight = 1;
  const checklistWeight = 2;
  const incidentWeight = 3;
  const lessonsDone = state.completed.length * lessonWeight;
  const checksDone = Object.values(state.checks).filter((result) => result.correct).length * checkWeight;
  const checklistDone = Object.values(state.checklists).reduce((sum, result) => sum + result.checked.length, 0) * checklistWeight;
  const incidentsDone = Object.values(state.incidents).filter((result) => result.completed).length * incidentWeight;
  return lessonsDone + checksDone + checklistDone + incidentsDone;
}

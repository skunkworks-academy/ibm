export const STORAGE_KEY = 'skunkworks-zbsec1-learning-v1';
export const LEARNING_EVENT = 'zbsec1-learning-state';

export type CheckRecord = {correct: boolean; attempts: number};
export type LearningState = {
  completed: string[];
  checks: Record<string, CheckRecord>;
  checklists: Record<string, number[]>;
  lastLocation?: string;
  assessmentBest?: number;
};

export const emptyLearningState = (): LearningState => ({completed: [], checks: {}, checklists: {}});

export function readLearningState(): LearningState {
  if (typeof window === 'undefined') return emptyLearningState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? {...emptyLearningState(), ...JSON.parse(raw)} : emptyLearningState();
  } catch {
    return emptyLearningState();
  }
}

function writeLearningState(state: LearningState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(LEARNING_EVENT));
}

export function rememberLocation(pathname: string) {
  const state = readLearningState();
  writeLearningState({...state, lastLocation: pathname});
}

export function markLessonComplete(id: string) {
  const state = readLearningState();
  if (!state.completed.includes(id)) state.completed.push(id);
  writeLearningState(state);
}

export function recordCheck(id: string, correct: boolean) {
  const state = readLearningState();
  const current = state.checks[id] ?? {correct: false, attempts: 0};
  state.checks[id] = {correct: current.correct || correct, attempts: current.attempts + 1};
  writeLearningState(state);
}

export function recordChecklist(id: string, checked: number[]) {
  const state = readLearningState();
  state.checklists[id] = checked;
  writeLearningState(state);
}

export function recordAssessment(score: number) {
  const state = readLearningState();
  state.assessmentBest = Math.max(state.assessmentBest ?? 0, score);
  writeLearningState(state);
}

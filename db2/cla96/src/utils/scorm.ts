type Scorm12Api = {
  LMSInitialize: (value: string) => string;
  LMSFinish: (value: string) => string;
  LMSGetValue: (element: string) => string;
  LMSSetValue: (element: string, value: string) => string;
  LMSCommit: (value: string) => string;
};

declare global {
  interface Window {
    API?: Scorm12Api;
  }
}

let initialized = false;

function locateApi(start: Window | null): Scorm12Api | null {
  if (typeof window === 'undefined') return null;
  let current = start;
  let depth = 0;

  while (current && depth < 12) {
    try {
      if (current.API) return current.API;
      if (current.parent === current) break;
      current = current.parent;
    } catch {
      break;
    }
    depth += 1;
  }

  try {
    if (window.opener?.API) return window.opener.API;
  } catch {
    // Cross-origin opener: ignore and stay browser-local.
  }

  return null;
}

function api(): Scorm12Api | null {
  return locateApi(typeof window === 'undefined' ? null : window);
}

export function scormInitialize(): boolean {
  const target = api();
  if (!target) return false;
  if (initialized) return true;

  try {
    initialized = target.LMSInitialize('') === 'true';
    return initialized;
  } catch {
    return false;
  }
}

export function scormReport(input: {
  lessonLocation?: string;
  score?: number;
  status?: 'incomplete' | 'completed' | 'passed' | 'failed';
}): void {
  const target = api();
  if (!target || !scormInitialize()) return;

  try {
    if (input.lessonLocation) {
      target.LMSSetValue('cmi.core.lesson_location', input.lessonLocation);
    }
    if (typeof input.score === 'number') {
      const score = Math.max(0, Math.min(100, Math.round(input.score)));
      target.LMSSetValue('cmi.core.score.min', '0');
      target.LMSSetValue('cmi.core.score.max', '100');
      target.LMSSetValue('cmi.core.score.raw', String(score));
    }
    if (input.status) {
      target.LMSSetValue('cmi.core.lesson_status', input.status);
    }
    target.LMSCommit('');
  } catch {
    // SCORM is an optional enhancement. Browser-local progress remains authoritative.
  }
}

export function scormFinish(): void {
  const target = api();
  if (!target || !initialized) return;
  try {
    target.LMSCommit('');
    target.LMSFinish('');
  } finally {
    initialized = false;
  }
}

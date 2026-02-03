(function () {
  const STORAGE_KEY = "ss44_progress_v1";

  const DEFAULT_STATE = {
    // Keys you’ll reference in HTML via data-check="..."
    checks: {},
    // Optional: store timestamps
    meta: {}
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(DEFAULT_STATE);
      const parsed = JSON.parse(raw);
      // Merge to avoid breaking changes later
      return {
        ...structuredClone(DEFAULT_STATE),
        ...parsed,
        checks: { ...(DEFAULT_STATE.checks), ...(parsed.checks || {}) },
        meta: { ...(DEFAULT_STATE.meta), ...(parsed.meta || {}) }
      };
    } catch {
      return structuredClone(DEFAULT_STATE);
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function calcScore(scope = "day1") {
    // All checkboxes included in the current page (or scope) contribute
    const items = Array.from(document.querySelectorAll(`[data-scope="${scope}"][data-check]`));
    const total = items.length;
    if (total === 0) return { done: 0, total: 0, pct: 0 };
    const done = items.filter(el => el.checked).length;
    const pct = Math.round((done / total) * 100);
    return { done, total, pct };
  }

  function updateScoreUI(scope = "day1") {
    const score = calcScore(scope);
    const pctEl = document.querySelector(`[data-score="${scope}"]`);
    const barEl = document.querySelector(`[data-scorebar="${scope}"]`);
    const textEl = document.querySelector(`[data-scoretext="${scope}"]`);

    if (pctEl) pctEl.textContent = `${score.pct}%`;
    if (textEl) textEl.textContent = `${score.done}/${score.total} checkpoints complete`;
    if (barEl) barEl.style.width = `${score.pct}%`;

    // Unlock logic: elements declare what they require
    unlockLinks(scope, score);
  }

  function setLocked(el, locked) {
    el.classList.toggle("locked", locked);
    el.setAttribute("aria-disabled", locked ? "true" : "false");
    if (locked) {
      el.setAttribute("tabindex", "-1");
    } else {
      el.removeAttribute("tabindex");
    }
  }

  function unlockLinks(scope, scoreObj) {
    // Rule type 1: Requires score >= X
    document.querySelectorAll(`[data-requires-score][data-scope-lock="${scope}"]`).forEach(el => {
      const min = parseInt(el.getAttribute("data-requires-score") || "0", 10);
      const locked = scoreObj.pct < min;
      setLocked(el, locked);
    });

    // Rule type 2: Requires specific check keys completed
    document.querySelectorAll(`[data-requires-checks][data-scope-lock="${scope}"]`).forEach(el => {
      const required = (el.getAttribute("data-requires-checks") || "")
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);

      const state = loadState();
      const locked = required.some(k => state.checks[`${scope}:${k}`] !== true);
      setLocked(el, locked);
    });
  }

  function bindTracker(scope = "day1") {
    const state = loadState();

    // Restore checkbox states
    document.querySelectorAll(`[data-scope="${scope}"][data-check]`).forEach(cb => {
      const key = `${scope}:${cb.getAttribute("data-check")}`;
      cb.checked = state.checks[key] === true;
    });

    // On change: persist + score + unlock
    document.querySelectorAll(`[data-scope="${scope}"][data-check]`).forEach(cb => {
      cb.addEventListener("change", (e) => {
        const state = loadState();
        const key = `${scope}:${cb.getAttribute("data-check")}`;
        state.checks[key] = !!cb.checked;
        state.meta[key] = nowIso();
        saveState(state);
        updateScoreUI(scope);
      });
    });

    // Reset button (optional)
    const resetBtn = document.querySelector(`[data-reset="${scope}"]`);
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        const state = loadState();
        // Remove only the scope keys
        Object.keys(state.checks).forEach(k => {
          if (k.startsWith(scope + ":")) delete state.checks[k];
        });
        Object.keys(state.meta).forEach(k => {
          if (k.startsWith(scope + ":")) delete state.meta[k];
        });
        saveState(state);
        // Uncheck on page
        document.querySelectorAll(`[data-scope="${scope}"][data-check]`).forEach(cb => cb.checked = false);
        updateScoreUI(scope);
      });
    }

    updateScoreUI(scope);
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Autoload Day 1 tracker if present
    if (document.querySelector('[data-progress-scope="day1"]')) {
      bindTracker("day1");
    }
  });
})();

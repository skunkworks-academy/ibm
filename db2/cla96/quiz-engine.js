// =========================
// Unified Quiz Engine
// Data contract: window.CLA96G_DATA[partKey] = { id,title,units:[{id,title,summary,topics,takeaways,risks,questions:[...]}] }
// Question contract: {id,prompt,options:[{text,correct,explain}], difficulty, tags }
// =========================

window.LMS = window.LMS || {};

(function(){
  function nowISO(){ return new Date().toISOString(); }

  function fisherYates(arr){
    const a = arr.slice();
    for(let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }

  function getPartData(partKey){
    const d = (window.CLA96G_DATA || {})[partKey];
    if(!d) throw new Error("Missing data for " + partKey);
    return d;
  }

  function defaultPartState(partKey, totalQuestions){
    return {
      version: 3,
      partKey,
      startedAt: Date.now(),
      savedAt: nowISO(),
      submitted: false,
      masteryThreshold: 75,
      totalQuestions,
      answered: 0,
      correct: 0,
      completionPct: 0,
      scorePct: 0,
      masteryPassed: false,
      answers: {},
      order: {}
    };
  }

  function computeCounts(partData, state){
    let answered=0, correct=0, total=0;

    for(const unit of partData.units){
      const qids = state.order[unit.id] || unit.questions.map(q=>q.id);
      for(const qid of qids){
        total++;
        if(state.answers[qid] !== undefined){
          answered++;
          const q = unit.questions.find(x=>x.id===qid);
          const idx = state.answers[qid];
          if(q && q.options[idx] && q.options[idx].correct) correct++;
        }
      }
    }
    const completionPct = percentage(answered, total);
    const scorePct = percentage(correct, total);
    const masteryPassed = (completionPct === 100) && (scorePct >= (state.masteryThreshold||75));
    return {answered, correct, total, completionPct, scorePct, masteryPassed};
  }

  function renderToolbar(container, cfg, state){
    const bar = document.createElement("div");
    bar.className = "card";
    bar.innerHTML = `
      <div class="row">
        <div class="badges">
          <span class="badge"><strong>Answered:</strong> <span id="lmsAnswered">0</span>/<span id="lmsTotal">0</span></span>
          <span class="badge"><strong>Score:</strong> <span id="lmsScore">0%</span></span>
          <span class="badge"><strong>Completion:</strong> <span id="lmsCompletion">0%</span></span>
          <span class="badge"><strong>Mastery:</strong> <span id="lmsMastery">—</span></span>
          <span class="badge"><strong>Saved:</strong> <span id="lmsSaved">—</span></span>
          <span class="timerBox" id="lmsTimerBox">⏱ <span id="lmsTimer">00:00</span></span>
        </div>
        <div class="row" style="justify-content:flex-end">
          ${cfg.enableTimed ? `<button class="primary" id="btnTimed">Enable Timed Mode</button>` : ``}
          <button id="btnPrint">Print / Export PDF</button>
          <button id="btnExpand">Expand All</button>
          <button id="btnCollapse">Collapse All</button>
          <button class="danger" id="btnReset">Reset</button>
        </div>
      </div>
      <div style="margin-top:12px">
        <div class="progress-bar"><span id="lmsBar"></span></div>
        <div class="notice" id="lmsNotice">
          Mastery threshold: <strong>${state.masteryThreshold}%</strong>. Complete all questions to calculate mastery.
        </div>
      </div>
    `;
    container.appendChild(bar);

    bar.querySelector("#btnPrint").addEventListener("click", () => {
      document.querySelectorAll(".card.unit").forEach(c => c.classList.add("active"));
      logEvent("ui_print_pdf", {page: cfg.pageName});
      window.print();
    });

    bar.querySelector("#btnExpand").addEventListener("click", () => {
      document.querySelectorAll(".card.unit").forEach(c => c.classList.add("active"));
      logEvent("ui_expand_all", {page: cfg.pageName});
    });
    bar.querySelector("#btnCollapse").addEventListener("click", () => {
      document.querySelectorAll(".card.unit").forEach(c => c.classList.remove("active"));
      logEvent("ui_collapse_all", {page: cfg.pageName});
    });

    bar.querySelector("#btnReset").addEventListener("click", () => {
      if(!confirm("Reset progress for " + cfg.pageName + "?")) return;
      save(cfg.storageKey, null);
      logEvent("attempt_reset", {page: cfg.pageName});
      location.reload();
    });

    return bar;
  }

  function attachTimedMode(toolbar, cfg, state){
    if(!cfg.enableTimed) return;

    const timerBox = toolbar.querySelector("#lmsTimerBox");
    const timerEl = toolbar.querySelector("#lmsTimer");
    const btn = toolbar.querySelector("#btnTimed");

    let enabled = false;
    let durationSec = cfg.defaultMinutes * 60;
    let remainingSec = durationSec;
    let handle = null;

    function fmt(secs){
      const m = Math.floor(secs/60);
      const s = secs%60;
      return String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
    }

    function saveTimer(){
      state.timed = { enabled, durationSec, remainingSec };
      save(cfg.storageKey, state);
    }

    function stop(){
      if(handle){ clearInterval(handle); handle=null; }
    }

    function submitDueToTime(){
      state.submitted = true;
      stop();
      saveTimer();
      logEvent("timed_expired_submit", {page: cfg.pageName});
      document.querySelectorAll('input[type="radio"]').forEach(r => r.disabled = true);
      btn.disabled = true;
      cfg.onStateChange();
      alert("Time expired. Attempt submitted.");
    }

    function tick(){
      if(state.submitted) return;
      remainingSec--;
      timerEl.textContent = fmt(Math.max(0, remainingSec));
      saveTimer();
      if(remainingSec <= 0) submitDueToTime();
    }

    function start(){
      stop();
      timerEl.textContent = fmt(remainingSec);
      handle = setInterval(tick, 1000);
    }

    function enable(){
      if(state.submitted){
        alert("This attempt is already submitted. Reset to try again.");
        return;
      }
      const mins = parseInt(prompt("Timed duration (minutes)", String(cfg.defaultMinutes)) || String(cfg.defaultMinutes), 10);
      durationSec = (Number.isFinite(mins) && mins>0) ? mins*60 : cfg.defaultMinutes*60;
      remainingSec = durationSec;
      enabled = true;
      timerBox.style.display = "inline-flex";
      btn.textContent = "Disable Timed Mode";
      logEvent("timed_enabled", {page: cfg.pageName, minutes: durationSec/60});
      saveTimer();
      start();
    }

    function disable(){
      enabled = false;
      timerBox.style.display = "none";
      btn.textContent = "Enable Timed Mode";
      logEvent("timed_disabled", {page: cfg.pageName});
      stop();
      saveTimer();
    }

    btn.addEventListener("click", () => {
      enabled ? disable() : enable();
    });

    if(state.timed && state.timed.enabled && !state.submitted){
      enabled = true;
      durationSec = state.timed.durationSec || durationSec;
      remainingSec = state.timed.remainingSec || remainingSec;
      timerBox.style.display = "inline-flex";
      btn.textContent = "Disable Timed Mode";
      start();
    }
  }

  function renderUnitCard(unit, state, cfg, idx){
    const card = document.createElement("div");
    card.className = "card unit active";
    card.dataset.unit = unit.id;

    const header = document.createElement("div");
    header.className = "unitHeader";
    header.innerHTML = `
      <div>
        <h2>${esc(unit.title)}</h2>
        <div class="unitMeta">${esc(unit.summary || "")}</div>
      </div>
      <div class="tog">+</div>
    `;
    header.addEventListener("click", () => {
      card.classList.toggle("active");
      logEvent("ui_toggle_card", {page: cfg.pageName, unit: unit.id, active: card.classList.contains("active")});
    });

    const body = document.createElement("div");
    body.className = "unitBody";

    const cols = document.createElement("div");
    cols.className = "cols";
    cols.innerHTML = `
      <div class="panel">
        <h3>Unit topics</h3>
        <ul>${(unit.topics||[]).map(t=>`<li>${esc(t)}</li>`).join("")}</ul>
      </div>
      <div class="panel">
        <h3>DBA takeaways</h3>
        <ul>${(unit.takeaways||[]).map(t=>`<li>${esc(t)}</li>`).join("")}</ul>
      </div>
    `;

    const risks = document.createElement("div");
    risks.className = "panel";
    risks.style.marginTop = "12px";
    risks.innerHTML = `
      <h3>Operational risks & warnings</h3>
      <ul>${(unit.risks||[]).map(t=>`<li>${esc(t)}</li>`).join("")}</ul>
    `;

    const quiz = document.createElement("div");
    quiz.className = "quiz";
    quiz.innerHTML = `<h3>Knowledge check (Unit ${idx+1})</h3>`;

    const qidsDefault = unit.questions.map(q=>q.id);
    if(!state.order[unit.id]){
      state.order[unit.id] = fisherYates(qidsDefault);
      save(cfg.storageKey, state);
    }

    const qids = state.order[unit.id];

    qids.forEach((qid) => {
      const q = unit.questions.find(x=>x.id===qid);
      if(!q) return;

      const qWrap = document.createElement("div");
      qWrap.className = "q";
      qWrap.dataset.qid = q.id;

      const savedIdx = state.answers[q.id];

      qWrap.innerHTML = `
        <p>${esc(q.prompt)}</p>
        ${q.options.map((opt, i)=>`
          <label class="opt">
            <input type="radio" name="${esc(q.id)}" value="${i}" ${savedIdx===i ? "checked":""} ${state.submitted ? "disabled":""}/>
            <div>${esc(opt.text)}</div>
          </label>
        `).join("")}
        <div class="fb" id="fb_${esc(q.id)}"></div>
      `;

      function renderFeedback(selectedIdx){
        const fb = qWrap.querySelector(`#fb_${CSS.escape(q.id)}`);
        if(selectedIdx === undefined) return;

        const selected = q.options[selectedIdx];
        const correctOpt = q.options.find(o=>o.correct);
        const correctText = correctOpt ? correctOpt.explain : "Correct choice.";

        if(selected && selected.correct){
          fb.textContent = "Correct. " + (selected.explain || correctText || "");
          fb.className = "fb good";
        }else{
          fb.textContent = "Incorrect. " + (correctText || "Review the unit content above.");
          fb.className = "fb bad";
        }
      }

      if(savedIdx !== undefined){
        renderFeedback(savedIdx);
      }

      qWrap.querySelectorAll('input[type="radio"]').forEach(r => {
        r.addEventListener("change", () => {
          if(state.submitted){
            r.checked = false;
            return;
          }
          const idx = parseInt(r.value, 10);

          // single-answer mode
          if(state.answers[q.id] !== undefined){
            const saved = state.answers[q.id];
            const keep = qWrap.querySelector(`input[value="${saved}"]`);
            if(keep) keep.checked = true;
            return;
          }

          state.answers[q.id] = idx;
          logEvent("answer", {page: cfg.pageName, unit: unit.id, qid: q.id, correct: !!q.options[idx].correct});
          save(cfg.storageKey, state);

          renderFeedback(idx);
          cfg.onStateChange();
        });
      });

      quiz.appendChild(qWrap);
    });

    body.appendChild(cols);
    body.appendChild(risks);
    body.appendChild(quiz);

    card.appendChild(header);
    card.appendChild(body);
    return card;
  }

  function updateToolbar(toolbar, cfg, state, partData){
    const counts = computeCounts(partData, state);
    state.answered = counts.answered;
    state.correct = counts.correct;
    state.totalQuestions = counts.total;
    state.completionPct = counts.completionPct;
    state.scorePct = counts.scorePct;
    state.masteryPassed = counts.masteryPassed;
    state.savedAt = nowISO();

    save(cfg.storageKey, state);

    toolbar.querySelector("#lmsAnswered").textContent = counts.answered;
    toolbar.querySelector("#lmsTotal").textContent = counts.total;
    toolbar.querySelector("#lmsScore").textContent = counts.scorePct + "%";
    toolbar.querySelector("#lmsCompletion").textContent = counts.completionPct + "%";
    toolbar.querySelector("#lmsMastery").textContent = counts.masteryPassed ? "PASSED" : "Not yet";
    toolbar.querySelector("#lmsSaved").textContent = "Saved";

    toolbar.querySelector("#lmsBar").style.width = counts.completionPct + "%";

    if(window.SCORM){
      const status = counts.masteryPassed ? "completed" : (state.submitted ? "failed" : "incomplete");
      SCORM.update(counts.scorePct, counts.completionPct, status);
    }
  }

  LMS.renderPart = function(cfg){
    const partData = getPartData(cfg.partKey);

    cfg = Object.assign({
      containerId: "content",
      pageName: cfg.partKey,
      enableTimed: false,
      defaultMinutes: 15,
      masteryThreshold: 75
    }, cfg);

    const root = document.getElementById(cfg.containerId);
    if(!root) throw new Error("Missing container #" + cfg.containerId);

    const totalQuestions = partData.units.reduce((n,u)=>n + (u.questions?.length||0), 0);

    let state = load(cfg.storageKey) || defaultPartState(cfg.partKey, totalQuestions);
    state.masteryThreshold = cfg.masteryThreshold;

    logEvent("page_view", {page: cfg.pageName});

    const toolbar = renderToolbar(root, cfg, state);
    cfg.onStateChange = () => updateToolbar(toolbar, cfg, state, partData);

    attachTimedMode(toolbar, cfg, state);

    const grid = document.createElement("div");
    grid.className = "grid";
    root.appendChild(grid);

    partData.units.forEach((unit, idx) => {
      const card = renderUnitCard(unit, state, cfg, idx);
      grid.appendChild(card);
    });

    if(state.submitted){
      document.querySelectorAll('input[type="radio"]').forEach(r => r.disabled = true);
      const btnTimed = toolbar.querySelector("#btnTimed");
      if(btnTimed) btnTimed.disabled = true;
    }

    cfg.onStateChange();
  };

  // -------------------------
  // Assessment engine
  // -------------------------
  function defaultAssessmentState(total){
    return {
      version: 3,
      startedAt: Date.now(),
      savedAt: nowISO(),
      submitted: false,
      masteryThreshold: 75,
      questionCount: total,
      pool: [],
      order: [],
      answers: {},
      scorePct: 0
    };
  }

  function buildAssessmentPool(parts){
    const pool = [];
    for(const partKey of parts){
      const pd = getPartData(partKey);
      for(const unit of pd.units){
        for(const q of unit.questions){
          pool.push({ partKey, unitId: unit.id, qid: q.id });
        }
      }
    }
    return pool;
  }

  function findQuestion(ref){
    const pd = getPartData(ref.partKey);
    const unit = pd.units.find(u=>u.id===ref.unitId);
    if(!unit) return null;
    return unit.questions.find(q=>q.id===ref.qid) || null;
  }

  LMS.renderAssessment = function(cfg){
    cfg = Object.assign({
      containerId: "content",
      pageName: "assessment",
      storageKey: LMS_KEYS.assessment,
      masteryThreshold: 75,
      defaultQuestionCount: 24,
      parts: ["part1","part2","part3","part4"]
    }, cfg);

    const root = document.getElementById(cfg.containerId);
    if(!root) throw new Error("Missing container #" + cfg.containerId);

    logEvent("page_view", {page: cfg.pageName});

    const fullPool = buildAssessmentPool(cfg.parts);

    let state = load(cfg.storageKey);
    if(!state){
      state = defaultAssessmentState(cfg.defaultQuestionCount);
      state.masteryThreshold = cfg.masteryThreshold;

      const shuffled = fisherYates(fullPool);
      state.pool = shuffled.slice(0, cfg.defaultQuestionCount);
      state.order = [...Array(state.pool.length).keys()];
      save(cfg.storageKey, state);
    }

    const top = document.createElement("div");
    top.className = "card";
    top.innerHTML = `
      <div class="row">
        <div>
          <h2>Final Assessment</h2>
          <div class="unitMeta">Randomized exam generated from Parts 1–4. Mastery threshold: <strong>${state.masteryThreshold}%</strong>.</div>
        </div>
        <div class="row">
          <button id="btnSubmit" class="primary">Submit</button>
          <button id="btnNew" class="danger">New Attempt (Reset)</button>
          <button id="btnPrint">Print / Export PDF</button>
        </div>
      </div>
      <div style="margin-top:12px">
        <div class="badges">
          <span class="badge"><strong>Questions:</strong> ${state.pool.length}</span>
          <span class="badge"><strong>Status:</strong> <span id="assessStatus">${state.submitted ? "Submitted" : "In progress"}</span></span>
          <span class="badge"><strong>Score:</strong> <span id="assessScore">${state.scorePct || 0}%</span></span>
          <span class="badge"><strong>Result:</strong> <span id="assessResult">—</span></span>
        </div>
      </div>
    `;
    root.appendChild(top);

    const list = document.createElement("div");
    list.className = "card";
    list.innerHTML = `<h3 style="margin-bottom:10px">Questions</h3>`;
    root.appendChild(list);

    function setResultUI(scorePct, submitted){
      const pass = submitted && scorePct >= state.masteryThreshold;
      top.querySelector("#assessScore").textContent = scorePct + "%";
      top.querySelector("#assessStatus").textContent = submitted ? "Submitted" : "In progress";
      top.querySelector("#assessResult").textContent = submitted ? (pass ? "PASS" : "FAIL") : "—";
      top.querySelector("#assessResult").style.color = submitted ? (pass ? "var(--success)" : "var(--danger)") : "var(--muted)";

      if(window.SCORM){
        SCORM.update(scorePct, 100, pass ? "passed" : "failed");
      }
    }

    function grade(){
      let correct=0;
      for(const ref of state.pool){
        const q = findQuestion(ref);
        if(!q) continue;
        const idx = state.answers[q.id];
        if(idx === undefined) continue;
        if(q.options[idx] && q.options[idx].correct) correct++;
      }
      const scorePct = percentage(correct, state.pool.length);
      state.scorePct = scorePct;
      state.savedAt = nowISO();
      save(cfg.storageKey, state);
      return scorePct;
    }

    function render(){
      // remove existing q blocks
      list.querySelectorAll(".q").forEach(n => n.remove());

      state.order.forEach((poolIdx, n) => {
        const ref = state.pool[poolIdx];
        const q = findQuestion(ref);
        if(!q) return;

        const savedIdx = state.answers[q.id];
        const qWrap = document.createElement("div");
        qWrap.className = "q";
        qWrap.dataset.qid = q.id;

        qWrap.innerHTML = `
          <p>Q${n+1}. ${esc(q.prompt)}</p>
          ${q.options.map((opt, i)=>`
            <label class="opt">
              <input type="radio" name="${esc(q.id)}" value="${i}" ${savedIdx===i ? "checked":""} ${state.submitted ? "disabled":""}/>
              <div>${esc(opt.text)}</div>
            </label>
          `).join("")}
          <div class="fb" id="fb_${esc(q.id)}"></div>
        `;

        function renderFeedback(idx){
          const fb = qWrap.querySelector(`#fb_${CSS.escape(q.id)}`);
          if(idx === undefined) return;

          const selected = q.options[idx];
          const correctOpt = q.options.find(o=>o.correct);
          const correctExplain = (correctOpt && correctOpt.explain) ? correctOpt.explain : "Review the concept.";

          if(selected && selected.correct){
            fb.textContent = "Correct. " + (selected.explain || correctExplain);
            fb.className = "fb good";
          }else{
            fb.textContent = "Incorrect. " + correctExplain;
            fb.className = "fb bad";
          }
        }

        if(state.submitted && savedIdx !== undefined){
          renderFeedback(savedIdx);
        }

        qWrap.querySelectorAll('input[type="radio"]').forEach(r => {
          r.addEventListener("change", () => {
            if(state.submitted){
              r.checked = false;
              return;
            }
            const idx = parseInt(r.value, 10);
            state.answers[q.id] = idx;
            state.savedAt = nowISO();
            save(cfg.storageKey, state);
            logEvent("answer", {page: cfg.pageName, qid: q.id, correct: !!q.options[idx].correct});
          });
        });

        list.appendChild(qWrap);
      });

      setResultUI(state.scorePct || 0, state.submitted);
    }

    top.querySelector("#btnPrint").addEventListener("click", () => window.print());

    top.querySelector("#btnNew").addEventListener("click", () => {
      if(!confirm("Reset assessment and generate a new randomized attempt?")) return;
      save(cfg.storageKey, null);
      logEvent("attempt_reset", {page: cfg.pageName});
      location.reload();
    });

    top.querySelector("#btnSubmit").addEventListener("click", () => {
      if(state.submitted){
        alert("Already submitted. Use 'New Attempt' to reset.");
        return;
      }
      const answeredCount = Object.keys(state.answers).length;
      if(answeredCount < state.pool.length){
        if(!confirm(`You answered ${answeredCount}/${state.pool.length}. Submit anyway?`)) return;
      }
      state.submitted = true;
      const scorePct = grade();

      document.querySelectorAll('input[type="radio"]').forEach(r => r.disabled = true);

      // show feedback for answered questions
      document.querySelectorAll(".q").forEach(qEl=>{
        const qid = qEl.dataset.qid;
        const ref = state.pool.find(x=>x.qid===qid) || null;
        const q = ref ? findQuestion(ref) : null;
        if(!q) return;
        const idx = state.answers[qid];
        const fb = qEl.querySelector(`#fb_${CSS.escape(qid)}`);
        if(idx === undefined){ fb.textContent="Not answered."; fb.className="fb"; return; }

        const selected = q.options[idx];
        const correctOpt = q.options.find(o=>o.correct);
        const correctExplain = (correctOpt && correctOpt.explain) ? correctOpt.explain : "Review the concept.";

        if(selected && selected.correct){
          fb.textContent = "Correct. " + (selected.explain || correctExplain);
          fb.className = "fb good";
        }else{
          fb.textContent = "Incorrect. " + correctExplain;
          fb.className = "fb bad";
        }
      });

      const pass = scorePct >= state.masteryThreshold;
      logEvent("assessment_submit", {scorePct, pass, threshold: state.masteryThreshold});

      setResultUI(scorePct, true);

      alert(pass ? `PASS (${scorePct}%). Mastery threshold met.` : `FAIL (${scorePct}%). Threshold is ${state.masteryThreshold}%.`);
    });

    render();
  };

  // -------------------------
  // Portal summary
  // -------------------------
  LMS.getSummary = function(){
    const parts = ["part1","part2","part3","part4"];
    const res = [];
    for(const p of parts){
      const st = load(LMS_KEYS[p]);
      if(!st){
        res.push({partKey:p, answered:0, correct:0, total:0, completionPct:0, scorePct:0, masteryPassed:false});
        continue;
      }
      res.push({
        partKey:p,
        answered: st.answered||0,
        correct: st.correct||0,
        total: st.totalQuestions||0,
        completionPct: st.completionPct||0,
        scorePct: st.scorePct||0,
        masteryPassed: !!st.masteryPassed
      });
    }
    const assess = load(LMS_KEYS.assessment);
    const assessment = assess ? { submitted: !!assess.submitted, scorePct: assess.scorePct||0, threshold: assess.masteryThreshold||75 } : { submitted:false, scorePct:0, threshold:75 };

    const totalQ = res.reduce((s,x)=>s+(x.total||0),0);
    const totalA = res.reduce((s,x)=>s+(x.answered||0),0);
    const totalC = res.reduce((s,x)=>s+(x.correct||0),0);
    const completionPct = percentage(totalA,totalQ);
    const scorePct = percentage(totalC,totalQ);

    const coursePassed = assessment.submitted && assessment.scorePct >= assessment.threshold;

    return { parts:res, assessment, completionPct, scorePct, coursePassed };
  };

})();
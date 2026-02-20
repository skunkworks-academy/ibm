// =========================
// SCORM 1.2 Minimal Wrapper
// - Sets score + status
// - Uses passed/failed when provided
// =========================
(function(){
  function findAPI(win){
    let tries=0;
    while(win && tries<500){
      if(win.API) return win.API;
      tries++;
      win = win.parent;
      if(win === win.parent) break;
    }
    return null;
  }

  const API = findAPI(window);

  function call(fn,a,b){
    try{ return API && API[fn] ? API[fn](a,b) : null; }
    catch{ return null; }
  }

  function init(){ call("LMSInitialize",""); }
  function set(k,v){ call("LMSSetValue", k, String(v)); }
  function commit(){ call("LMSCommit",""); }
  function finish(){ call("LMSFinish",""); }

  function normalizeStatus(status){
    const ok = ["passed","failed","completed","incomplete"];
    if(!status) return null;
    status = String(status).toLowerCase();
    return ok.includes(status) ? status : null;
  }

  window.SCORM = {
    APIExists: !!API,
    init,
    commit,
    finish,
    update(scorePct, completionPct, status){
      if(!API) return;

      const s = Math.max(0, Math.min(100, Number(scorePct ?? 0)));
      const c = Math.max(0, Math.min(100, Number(completionPct ?? 0)));

      set("cmi.core.score.raw", s);
      set("cmi.core.score.min", 0);
      set("cmi.core.score.max", 100);

      const st = normalizeStatus(status);
      if(st){
        set("cmi.core.lesson_status", st);
      }else{
        set("cmi.core.lesson_status", c >= 90 ? "completed" : "incomplete");
      }

      set("cmi.suspend_data", JSON.stringify({ s, c, t: Date.now() }).slice(0, 3900));
      commit();
    }
  };

  init();
  window.addEventListener("beforeunload", () => {
    try{ commit(); finish(); }catch{}
  });
})();

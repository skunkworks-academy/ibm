(function(){
  function findAPI(win){
    let tries=0;
    while(win && tries<500){
      if(win.API) return win.API;
      tries++;
      win = win.parent;
      if(win===win.parent) break;
    }
    return null;
  }

  const API=findAPI(window);

  function call(fn,a,b){
    try{ return API && API[fn] ? API[fn](a,b) : null; }
    catch{ return null; }
  }

  function init(){ call("LMSInitialize",""); }
  function set(k,v){ call("LMSSetValue",k,String(v)); }
  function commit(){ call("LMSCommit",""); }
  function finish(){ call("LMSFinish",""); }

  function updateLMS(score,completion){
    if(!API) return;
    set("cmi.core.lesson_status", completion>=90 ? "completed" : "incomplete");
    set("cmi.core.score.raw", score);
    set("cmi.core.score.min", 0);
    set("cmi.core.score.max", 100);
    commit();
  }

  window.SCORM = { init, updateLMS, commit, finish, APIExists: !!API };

  init();
})();

// =========================
// CLA96G Unified LMS Helpers
// =========================

const LMS_KEYS = {
  part1: "cla96g_part1_v3",
  part2: "cla96g_part2_v3",
  part3: "cla96g_part3_v3",
  part4: "cla96g_part4_v3",
  assessment: "cla96g_assessment_v3",
  analytics: "cla96g_analytics_v1"
};

function save(key, data){
  if(data === null || data === undefined){
    localStorage.removeItem(key);
    return;
  }
  localStorage.setItem(key, JSON.stringify(data));
}

function load(key){
  try{
    return JSON.parse(localStorage.getItem(key) || "null");
  }catch{
    return null;
  }
}

function percentage(a,b){
  return b ? Math.round((a/b)*100) : 0;
}

// -------------------------
// Analytics (local, client)
// -------------------------
function logEvent(type, data={}){
  let log = load(LMS_KEYS.analytics) || { events: [] };
  log.events.push({ ts: new Date().toISOString(), type, data });

  // keep last 3000 events
  if(log.events.length > 3000) log.events = log.events.slice(-3000);

  save(LMS_KEYS.analytics, log);
}

// -------------------------
// Safe HTML escaping
// -------------------------
function esc(s){
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

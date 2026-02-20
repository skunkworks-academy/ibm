const LMS_KEYS = {
  part1: "cla96g_part1",
  part2: "cla96g_part2",
  part3: "cla96g_part3",
  part4: "cla96g_part4",
  assessment: "cla96g_assessment",
  analytics: "cla96g_analytics"
};

function save(key,data){
  localStorage.setItem(key, JSON.stringify(data));
}

function load(key){
  try{
    return JSON.parse(localStorage.getItem(key)||"null");
  }catch{
    return null;
  }
}

function logEvent(type,data={}){
  let log = load(LMS_KEYS.analytics) || {events:[]};
  log.events.push({
    ts:new Date().toISOString(),
    type,
    data
  });
  if(log.events.length>2000){
    log.events=log.events.slice(-2000);
  }
  save(LMS_KEYS.analytics,log);
}

function percentage(a,b){
  return b ? Math.round((a/b)*100) : 0;
}

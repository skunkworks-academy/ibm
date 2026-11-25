import {filterCourses,isCurrent,enquiryUrl} from './ibm-learning-model.mjs';
const byId=id=>document.getElementById('ibm-'+id);
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
const params=new URLSearchParams(location.search),pageSize=12;
let courses=[],page=1,savedOnly=false,saved=[],lastTrigger=null;
try {const value=JSON.parse(localStorage.getItem('academy-ibm-shortlist')||'[]');if(Array.isArray(value))saved=value.filter(x=>typeof x==='string').slice(0,30);}catch{}
for(const [key,id] of [['q','search'],['family','family'],['level','level'],['status','status']])if(params.has(key))byId(id).value=params.get(key);
if(!byId('status').value)byId('status').value='current';
function state(){return {query:byId('search').value,family:byId('family').value,level:byId('level').value,status:byId('status').value,savedOnly,saved};}
function updateUrl(){const url=new URL(location.href);for(const [key,value]of Object.entries({q:byId('search').value,family:byId('family').value,level:byId('level').value,status:byId('status').value==='all'?'all':''})){if(value)url.searchParams.set(key,value);else url.searchParams.delete(key);}history.replaceState(null,'',url);}
function updateSaved(){
 byId('saved-count').textContent=saved.length;
 byId('shortlist-toggle').setAttribute('aria-pressed',String(savedOnly));
 const selected=courses.filter(c=>saved.includes(c.code));
 byId('team-enquiry').href=enquiryUrl(selected);
 byId('shortlist-note').textContent=selected.length?`${selected.length} saved course${selected.length===1?'':'s'} will be included in your enquiry. Saved on this browser only.`:'Save courses to include them in your enquiry.';
}
function toggleSaved(c,button){
 if(saved.includes(c.code))saved=saved.filter(x=>x!==c.code);
 else if(saved.length<30)saved.push(c.code);
 else {byId('results-count').textContent='Your shortlist holds up to 30 courses. Remove one to add another.';return;}
 try{localStorage.setItem('academy-ibm-shortlist',JSON.stringify(saved));}catch{byId('shortlist-note').textContent='Shortlist saved for this visit only; browser storage is unavailable.';}
 updateSaved();if(savedOnly)render();else {button.setAttribute('aria-pressed',String(saved.includes(c.code)));button.textContent=saved.includes(c.code)?'✓ Saved':'+ Save';}
}
function openDetail(c,trigger){
 lastTrigger=trigger;byId('detail-code').textContent=c.code+' / '+c.family;byId('detail-title').textContent=c.title;
 const body=byId('detail-content');body.replaceChildren();
 body.append(el('p',`${c.level} · ${c.duration}`,'ibm-detail-meta'));
 const current=isCurrent(c);body.append(el('p',current?'Dates, delivery format, price and lab access will be confirmed by Skunkworks before booking.':`Reference course — current delivery is not confirmed.${c.replacedBy?' IBM replacement: '+c.replacedBy+'.':''}${c.retireReason?' '+c.retireReason:''} Ask us about an alternative.`,'ibm-notice'));
 for(const [title,value]of [['Overview',c.overview],['Who it’s for',c.audience],['Before you start',c.prerequisites],['What you’ll learn',c.objectives],['Course topics',c.topics]]){body.append(el('h3',title),el('p',value||'Not specified in the IBM feed. We will confirm this with you.'));}
 byId('detail-enquiry').textContent=current?'Request this training ↗':'Ask about alternatives ↗';byId('detail-enquiry').href=enquiryUrl([c]);byId('detail-source').href=c.url;
 const url=new URL(location.href);url.searchParams.set('course',c.code);history.replaceState(null,'',url);
 if(!byId('detail').open)byId('detail').showModal();byId('detail').scrollTop=0;byId('detail-close').focus();
}
function card(c){
 const article=el('article',undefined,'ibm-course'),top=el('div',undefined,'ibm-course-top'),save=el('button',saved.includes(c.code)?'✓ Saved':'+ Save','ibm-save');
 save.type='button';save.setAttribute('aria-label','Save '+c.code+' to shortlist');save.setAttribute('aria-pressed',String(saved.includes(c.code)));save.addEventListener('click',()=>toggleSaved(c,save));top.append(el('span',c.code,'ibm-code'),save);
 const heading=el('h3'),title=el('button',c.title);title.addEventListener('click',()=>openDetail(c,title));heading.append(title);
 const tags=el('div',undefined,'ibm-course-tags');tags.append(el('span',c.family,'cds--tag cds--tag--blue'),el('span',c.level,'cds--tag cds--tag--gray'));
 const bottom=el('div',undefined,'ibm-course-bottom'),details=el('button','View course →');details.setAttribute('aria-label','View course '+c.code);details.addEventListener('click',()=>openDetail(c,details));bottom.append(el('span',isCurrent(c)?c.duration:'Reference / retired'),details);
 article.append(top,heading,el('p',c.overview||'Explore the course details and discuss delivery options with our team.','ibm-course-description'),tags,bottom);return article;
}
function render(){
 const results=filterCourses(courses,state()).sort((a,b)=>a[byId('sort').value].localeCompare(b[byId('sort').value]));
 const total=Math.max(1,Math.ceil(results.length/pageSize));page=Math.min(page,total);
 byId('results').replaceChildren(...results.slice((page-1)*pageSize,page*pageSize).map(card));
 byId('results-count').textContent=`${results.length} matching course${results.length===1?'':'s'}${savedOnly?' in your shortlist':''} · ${courses.length} IBM catalogue references`;
 byId('empty').hidden=results.length>0;byId('pagination').hidden=results.length<=pageSize;byId('page').textContent=`Page ${page} of ${total}`;byId('prev').disabled=page===1;byId('next').disabled=page===total;
 updateSaved();updateUrl();
}
function reset(){byId('search').value='';byId('family').value='';byId('level').value='';byId('status').value='current';savedOnly=false;page=1;render();}
byId('filters').addEventListener('submit',e=>e.preventDefault());
byId('filters').addEventListener('reset',e=>{e.preventDefault();reset();});
byId('empty-reset').addEventListener('click',reset);
for(const id of ['search','family','level','status','sort'])byId(id).addEventListener(id==='search'?'input':'change',()=>{page=1;render();});
for(const [id,delta] of [['prev',-1],['next',1]])byId(id).addEventListener('click',()=>{page+=delta;render();byId('catalogue-title').setAttribute('tabindex','-1');byId('catalogue-title').focus();});
byId('shortlist-toggle').addEventListener('click',()=>{savedOnly=!savedOnly;if(savedOnly){byId('search').value='';byId('family').value='';byId('level').value='';byId('status').value='all';}page=1;render();byId('catalogue').scrollIntoView();});
document.querySelectorAll('[data-family]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();reset();byId('family').value=a.dataset.family;render();byId('catalogue').scrollIntoView();byId('search').focus({preventScroll:true});}));
byId('detail-close').addEventListener('click',()=>byId('detail').close());
byId('detail').addEventListener('close',()=>{const u=new URL(location.href);u.searchParams.delete('course');history.replaceState(null,'',u);lastTrigger?.focus();});
async function load(){
 byId('error').hidden=true;byId('results').setAttribute('aria-busy','true');byId('results-count').textContent='Loading the IBM catalogue…';
 try{
  const response=await fetch('/data/ibm-learning/catalogue.json',{signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('Catalogue unavailable');
  const payload=await response.json();if(!Array.isArray(payload.courses)||!payload.courses.length)throw Error('Invalid catalogue');
  courses=payload.courses;saved=saved.filter(code=>courses.some(c=>c.code===code));render();
  const date=new Date(payload.retrievedAt),stale=(Date.now()-date.getTime())>30*86400000;
  byId('source-date').textContent=`Source: IBM Global Training course feed · Retrieved ${date.toLocaleDateString('en-ZA',{year:'numeric',month:'long',day:'numeric'})}.${stale?' This snapshot is over 30 days old; confirm current course details with our team.':''}`;
  const selected=courses.find(c=>c.code===params.get('course'));if(selected)openDetail(selected,null);
 }catch{byId('error').hidden=false;byId('results-count').textContent='Catalogue temporarily unavailable.';}finally{byId('results').setAttribute('aria-busy','false');}
}
byId('retry').addEventListener('click',load);load();

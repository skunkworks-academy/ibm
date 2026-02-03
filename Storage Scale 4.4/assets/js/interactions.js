(function(){
  const qs = (s, el=document)=>el.querySelector(s);
  const qsa = (s, el=document)=>Array.from(el.querySelectorAll(s));

  function setMode(mode, on){
    // mode: "lab" or "exam"
    qsa(`[data-mode="${mode}"]`).forEach(el=>{
      el.classList.toggle('hidden', !on);
    });
    // content tagged as "normal" should hide when lab-only is enabled
    if(mode === "lab"){
      qsa(`[data-mode="normal"]`).forEach(el=>{
        el.classList.toggle('hidden', on);
      });
    }
  }

  function loadModeState(){
    const lab = localStorage.getItem('mode_lab') === '1';
    const exam = localStorage.getItem('mode_exam') === '1';
    const labToggle = qs('#toggleLab');
    const examToggle = qs('#toggleExam');
    if(labToggle) labToggle.checked = lab;
    if(examToggle) examToggle.checked = exam;
    setMode('lab', lab);
    setMode('exam', exam);
  }

  function bindModeToggles(){
    const labToggle = qs('#toggleLab');
    const examToggle = qs('#toggleExam');

    if(labToggle){
      labToggle.addEventListener('change', (e)=>{
        const on = !!e.target.checked;
        localStorage.setItem('mode_lab', on ? '1':'0');
        setMode('lab', on);
      });
    }
    if(examToggle){
      examToggle.addEventListener('change', (e)=>{
        const on = !!e.target.checked;
        localStorage.setItem('mode_exam', on ? '1':'0');
        setMode('exam', on);
      });
    }
  }

  function bindActiveNav(){
    const path = location.pathname;
    qsa('a[data-nav]').forEach(a=>{
      const href = a.getAttribute('href') || '';
      if(href && path.endsWith(href.replace('./','/'))){
        a.classList.add('active');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    bindModeToggles();
    loadModeState();
    bindActiveNav();
  });
})();

function friendly(val) {
  if (val > 0.8) return "Very High";
  if (val > 0.6) return "High";
  if (val > 0.4) return "Moderate";
  if (val > 0.2) return "Low";
  return "Very Low";
}

function render(){
  const[dk,dv]=dominant(),em=EM[dk];
  const d=getDyad(),def=getDefense(),tr=getTrend(),dev=getDevStage();

  // Header & Identity
  document.getElementById('av').textContent=em.icon;
  document.getElementById('av').style.borderColor=em.c+'88';
  document.getElementById('status').textContent = (NARRATIVE_SELF.strength > 0.2 ? '"'+p(NARRATIVE_SELF.phrases)+'"' : FUNC[dk]);
  document.getElementById('dev-stage').textContent = `${dev.name} · ${eventCount} events experienced`;

  // Basic State
  document.getElementById('ds').textContent = em.label;
  document.getElementById('tv').textContent = tr.l;
  
  // Body Stats (Human friendly)
  const bodyText = BODY.isAsleep ? '<span style="color:#5b8fb9">Sleeping</span>' : 'Awake';
  const stressText = BODY.fatigue > 70 ? 'Exhausted' : BODY.fatigue > 30 ? 'Tired' : 'Rested';
  document.getElementById('dev-plasticity').innerHTML = `${bodyText} (${stressText})`;

  // Caregiver & Attachment
  const att = getAttachmentStyle();
  const iwmEl = document.getElementById('cg-iwm');
  if(IWM.sampleCount < 3) {
    iwmEl.textContent = 'Social bonds are forming...';
  } else {
    iwmEl.innerHTML = `<b style="color:${att.color}">${att.name} Attachment</b> — ${att.desc}`;
  }

  // Caregiver Grid (Technical)
  const cgg = document.getElementById('cg-grid'); cgg.innerHTML='';
  const cgItems = [
    { label:'C.G. Stress', val: CAREGIVER.stress },
    { label:'C.G. Mood', val: CAREGIVER.mood },
  ];
  cgItems.forEach(item => {
    const el = document.createElement('div'); el.className='stat-card';
    el.innerHTML=`<div class="stat-label">${item.label}</div><div class="stat-val">${friendly(item.val)}</div>`;
    cgg.appendChild(el);
  });

  // Temperament Grid (Human words)
  const tg = document.getElementById('temp-grid'); tg.innerHTML='';
  const TEMP_DEFS = [
    { key:'negAffect', label:'Sensitivity' },
    { key:'surgency', label:'Sociability' },
    { key:'effortControl',label:'Self-Regulation' },
    { key:'orientSens', label:'Curiosity' },
  ];
  TEMP_DEFS.forEach(td => {
    const el = document.createElement('div'); el.className='stat-card';
    el.innerHTML=`<div class="stat-label">${td.label}</div><div class="stat-val">${friendly(TEMP[td.key])}</div>`;
    tg.appendChild(el);
  });

  // Schemas (Only show the ones that have actually formed)
  const schg=document.getElementById('schema-grid'); schg.innerHTML='';
  Object.values(SCHEMAS).forEach(s=>{
    if (s.strength > 0.1) {
      const el=document.createElement('div'); el.className='stat-card';
      el.innerHTML=`<div class="stat-label">Belief</div><div class="stat-val">${s.label}</div>`;
      schg.appendChild(el);
    }
  });
}
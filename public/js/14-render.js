function friendly(val) {
  if (val > 0.8) return "Very High";
  if (val > 0.6) return "High";
  if (val > 0.4) return "Moderate";
  if (val > 0.2) return "Low";
  return "Very Low";
}

function render(){
  const[dk,dv]=dominant(),em=EM[dk];
  const tr=getTrend(),dev=getDevStage();

  // Basic Header Info
  const av = document.getElementById('av');
  if(av) {
    av.textContent=em.icon;
    av.style.borderColor=em.c+'88';
  }

  const status = document.getElementById('status');
  if(status) status.textContent = (NARRATIVE_SELF.strength > 0.2 ? '"'+p(NARRATIVE_SELF.phrases)+'"' : FUNC[dk]);

  const devStage = document.getElementById('dev-stage');
  if(devStage) devStage.textContent = `${dev.name} · ${eventCount} events`;

  // Vital Signs
  const ds = document.getElementById('ds');
  if(ds) ds.textContent = em.label;

  const tv = document.getElementById('tv');
  if(tv) tv.textContent = tr.l;
  
  const devPlas = document.getElementById('dev-plasticity');
  if(devPlas) {
    const bodyText = BODY.isAsleep ? 'Sleeping' : 'Awake';
    const stressText = BODY.fatigue > 70 ? 'Exhausted' : BODY.fatigue > 30 ? 'Tired' : 'Rested';
    devPlas.textContent = `${bodyText} (${stressText})`;
  }

  // Caregiver / Attachment
  const att = getAttachmentStyle();
  const iwmEl = document.getElementById('cg-iwm');
  if(iwmEl) iwmEl.innerHTML = (IWM.sampleCount < 3) ? 'Social bonds forming...' : `<b style="color:${att.color}">${att.name}</b>: ${att.desc}`;

  const cgg = document.getElementById('cg-grid');
  if(cgg) {
    cgg.innerHTML=`<div class="stat-card"><div class="stat-l">C.G. Stress</div><div class="stat-v">${friendly(CAREGIVER.stress)}</div></div>` +
                  `<div class="stat-card"><div class="stat-l">C.G. Mood</div><div class="stat-v">${friendly(CAREGIVER.mood)}</div></div>`;
  }

  // Temperament
  const tg = document.getElementById('temp-grid');
  if(tg) {
    tg.innerHTML='';
    const TEMP_DEFS = [
      { key:'negAffect', label:'Sensitivity' },
      { key:'surgency', label:'Sociability' },
      { key:'effortControl',label:'Regulation' },
      { key:'orientSens', label:'Curiosity' },
    ];
    TEMP_DEFS.forEach(td => {
      const el = document.createElement('div'); el.className='stat-card';
      el.innerHTML=`<div class="stat-l">${td.label}</div><div class="stat-v">${friendly(TEMP[td.key])}</div>`;
      tg.appendChild(el);
    });
  }

  // Schemas
  const schg=document.getElementById('schema-grid');
  if(schg) {
    schg.innerHTML='';
    Object.values(SCHEMAS).forEach(s=>{
      if (s.strength > 0.1) {
        const el=document.createElement('div'); el.className='stat-card';
        el.innerHTML=`<div class="stat-l">Belief</div><div class="stat-v">${s.label}</div>`;
        schg.appendChild(el);
      }
    });
  }
}
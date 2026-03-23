function friendly(val) {
  if (val > 0.8) return "Very High";
  if (val > 0.6) return "High";
  if (val > 0.4) return "Moderate";
  if (val > 0.2) return "Low";
  return "Very Low";
}

function render(){
  const[dk,dv]=dominant(),em=EM[dk];
  const tr=getTrend(),dev=getDevStage(),def=getDefense();

  const setT = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
  const setH = (id, val) => { const el = document.getElementById(id); if(el) el.innerHTML = val; };

  setT('ds', em.label);
  setT('dn', tier(dk,dv));
  setT('tv', tr.l);
  setT('ts2', tr.s);
  setT('dev-stage', dev.name);
  setT('status', (NARRATIVE_SELF.strength > 0.2 ? '"'+p(NARRATIVE_SELF.phrases)+'"' : FUNC[dk]));
  
  const av = document.getElementById('av');
  if(av){ av.textContent = em.icon; av.style.borderColor = em.c+'88'; av.style.opacity = BODY.isAsleep ? '0.3' : '1'; }

  setH('dev-plasticity', (BODY.isAsleep ? 'SLEEPING' : 'AWAKE') + ' · ' + (BODY.fatigue > 70 ? 'Exhausted' : BODY.fatigue > 30 ? 'Tired' : 'Rested'));

  // Emotion Bars
  const egrid = document.getElementById('egrid');
  if(egrid) {
    egrid.innerHTML = '';
    Object.entries(EM).forEach(([k,e])=>{
        const v = Math.round(state[k]);
        const el = document.createElement('div'); el.className='ebar';
        el.innerHTML = `<div class="el">${e.label}</div><div class="ei">${tier(k,v)}</div><div class="et"><div class="ef" style="width:${v}%;background:${e.c}"></div></div><div class="ev">${v}</div>`;
        egrid.appendChild(el);
    });
  }

  // Semantic Grid
  const sgrid = document.getElementById('sem-grid');
  if(sgrid) {
    sgrid.innerHTML = '';
    Object.values(nodes).forEach(n => {
        const el = document.createElement('div'); el.className='sem-node';
        const alpha = n.activation > 0.1 ? 0.3 : 0.05;
        el.style.background = n.isBelief ? 'rgba(68,148,188,0.2)' : `rgba(255,255,255,${alpha})`;
        el.textContent = (n.isBelief ? '★ ' : '') + n.id.toLowerCase();
        sgrid.appendChild(el);
    });
  }

  // Caregiver
  const cgrid = document.getElementById('cg-grid');
  if(cgrid) {
    cgrid.innerHTML = `<div class="tbar"><div class="tbar-label">Stress: ${friendly(CAREGIVER.stress)}</div><div class="tbar-track"><div class="tbar-fill" style="width:${CAREGIVER.stress*100}%;background:#a84040"></div></div></div>` +
                      `<div class="tbar"><div class="tbar-label">Mood: ${friendly(CAREGIVER.mood)}</div><div class="tbar-track"><div class="tbar-fill" style="width:${CAREGIVER.mood*100}%;background:#4a9e6b"></div></div></div>`;
  }
  setT('cg-iwm', getAttachmentStyle().name + ': ' + getAttachmentStyle().desc);

  // Temperament
  const tgrid = document.getElementById('temp-grid');
  if(tgrid) {
    tgrid.innerHTML = '';
    Object.entries(TEMP).forEach(([k,v]) => {
        if(k==='noiseFloor') return;
        const el = document.createElement('div'); el.className='tbar';
        el.innerHTML = `<div class="tbar-label">${k}: ${friendly(v)}</div><div class="tbar-track"><div class="tbar-fill" style="width:${v*100}%;background:#5b7fc4"></div></div>`;
        tgrid.appendChild(el);
    });
  }

  // Needs
  const ngrid = document.getElementById('need-row');
  if(ngrid) {
    ngrid.innerHTML = '';
    Object.values(NEEDS).forEach(n => {
        const el = document.createElement('div'); el.className='need-item';
        el.innerHTML = `<div class="need-label">${n.label}</div><div class="need-track"><div class="need-fill" style="width:${n.val}%;background:${n.color}"></div></div>`;
        ngrid.appendChild(el);
    });
  }

  // Schemas
  const sgh = document.getElementById('schema-grid');
  if(sgh) {
    sgh.innerHTML = '';
    Object.values(SCHEMAS).forEach(s => {
        if(s.strength < 0.1) return;
        const el = document.createElement('div'); el.className='si';
        el.innerHTML = `<div class="sl">${s.label}</div><div class="st"><div class="sf" style="width:${s.strength*100}%;background:${s.color}"></div></div>`;
        sgh.appendChild(el);
    });
  }

  setT('defn', def ? def.def : 'none');
  setT('tom-display', tomState ? tomState.label : 'no social modeling yet');
}
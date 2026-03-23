function friendly(val) {
  if (val > 0.75) return "Very High";
  if (val > 0.55) return "High";
  if (val > 0.4) return "Moderate";
  if (val > 0.2) return "Low";
  return "Very Low";
}

function render(){
  const[dk,dv]=dominant(),em=EM[dk];
  const tr=getTrend(),dev=getDevStage(),def=getDefense();

  // 1. Header & Identity
  const av = document.getElementById('av');
  if(av) { av.textContent = em.icon; av.style.borderColor = em.c+'88'; av.style.opacity = BODY.isAsleep ? '0.3' : '1'; }
  const status = document.getElementById('status');
  if(status) status.textContent = `${FUNC[dk]} — ${dev.desc} (${eventCount} events)` + (NARRATIVE_SELF.strength > 0.2 ? ' · "'+p(NARRATIVE_SELF.phrases)+'"' : '');

  // 2. State Cards
  const setEl = (id, txt) => { const el = document.getElementById(id); if(el) el.textContent = txt; };
  setEl('ds', em.label);
  setEl('dn', tier(dk,dv));
  setEl('tv', tr.l);
  setEl('ts2', tr.s);
  setEl('dev-stage', dev.name);
  setEl('dev-plasticity', (BODY.isAsleep ? 'SLEEPING' : 'AWAKE') + ' · ' + (BODY.fatigue > 70 ? 'Exhausted' : BODY.fatigue > 30 ? 'Tired' : 'Rested'));

  // 3. Emotion Bars
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

  // 4. Memory & Abstracted Beliefs
  const mlist = document.getElementById('mem-list');
  if(mlist) {
    mlist.innerHTML = '';
    // Episodic
    episodicMemory.forEach(ep => {
      const el = document.createElement('div'); el.className = 'mem-item';
      el.innerHTML = `<div class="mem-dot" style="background:${EM[ep.emo]?.c || '#666'}"></div> <span>${ep.label}</span>`;
      mlist.appendChild(el);
    });
    // Abstracted Beliefs
    const beliefs = Object.values(semanticBeliefs);
    if(beliefs.length > 0) {
      mlist.innerHTML += `<div style="margin-top:10px; font-size:8px; color:var(--t3); text-transform:uppercase;">Abstracted Beliefs</div>`;
      beliefs.forEach(b => {
        const el = document.createElement('div'); el.className = 'mem-item'; el.style.fontStyle = 'italic';
        el.innerHTML = `<div class="mem-dot" style="background:${b.color}"></div> <span>${b.label} (${friendly(b.strength)})</span>`;
        mlist.appendChild(el);
      });
    }
  }
  setEl('mem-count', `${episodicMemory.length} eps, ${Object.keys(semanticBeliefs).length} beliefs`);

  // 5. Psychological Needs
  const ngrid = document.getElementById('need-row');
  if(ngrid) {
    ngrid.innerHTML = '';
    Object.values(NEEDS).forEach(n => {
        const el = document.createElement('div'); el.className='need-item';
        el.innerHTML = `<div class="need-label">${n.label}: ${friendly(n.val/100)}</div><div class="need-track"><div class="need-fill" style="width:${n.val}%;background:${n.color}"></div></div>`;
        ngrid.appendChild(el);
    });
  }

  // 6. Caregiver & Attachment
  const cgrid = document.getElementById('cg-grid');
  if(cgrid) {
    cgrid.innerHTML = `<div class="tbar"><div class="tbar-label">Stress: ${friendly(CAREGIVER.stress)}</div><div class="tbar-track"><div class="tbar-fill" style="width:${CAREGIVER.stress*100}%;background:#a84040"></div></div></div>` +
                      `<div class="tbar"><div class="tbar-label">Mood: ${friendly(CAREGIVER.mood)}</div><div class="tbar-track"><div class="tbar-fill" style="width:${CAREGIVER.mood*100}%;background:#4a9e6b"></div></div></div>`;
  }
  const iwm = document.getElementById('cg-iwm');
  const att = getAttachmentStyle();
  if(iwm) iwm.innerHTML = `<span style="color:${att.color}">${att.name}</span>: ${att.desc}`;

  // 7. Temperament
  const tgrid = document.getElementById('temp-grid');
  if(tgrid) {
    tgrid.innerHTML = '';
    const defs = [{k:'negAffect', l:'Sensitivity'}, {k:'surgency', l:'Sociability'}, {k:'effortControl', l:'Regulation'}, {k:'orientSens', l:'Curiosity'}];
    defs.forEach(d => {
        const val = TEMP[d.k];
        const el = document.createElement('div'); el.className='tbar';
        el.innerHTML = `<div class="tbar-label">${d.l}: ${friendly(val)}</div><div class="tbar-track"><div class="tbar-fill" style="width:${val*100}%;background:#5b7fc4"></div></div>`;
        tgrid.appendChild(el);
    });
  }

  // 8. Core Beliefs (Schemas)
  const sgrid = document.getElementById('schema-grid');
  if(sgrid) {
    sgrid.innerHTML = '';
    Object.values(SCHEMAS).forEach(s => {
        if(s.strength < 0.1) return;
        const el = document.createElement('div'); el.className='si';
        el.innerHTML = `<div class="sl">${s.label}</div><div class="st"><div class="sf" style="width:${s.strength*100}%;background:${s.color}"></div></div>`;
        sgrid.appendChild(el);
    });
  }

  // 9. Semantic Network Cloud
  const semGrid = document.getElementById('sem-grid');
  if(semGrid) {
    semGrid.innerHTML = '';
    Object.values(nodes).filter(n => n.activation > 0.08 || n.isBelief).forEach(n => {
        const el = document.createElement('div'); el.className = 'sem-node';
        const alpha = Math.max(0.1, n.activation * 0.5);
        el.style.background = n.isBelief ? 'rgba(68,148,188,0.2)' : `rgba(255,255,255,${alpha})`;
        el.textContent = (n.isBelief ? '★ ' : '') + n.id.toLowerCase();
        semGrid.appendChild(el);
    });
  }

  // 10. ToM & Defense
  setEl('defn', def ? def.def : 'none');
  const dStyle = document.getElementById('def-style');
  if(dStyle) dStyle.textContent = "Style forming...";
  setEl('tom-display', tomState ? tomState.label : 'no other-modeling yet');
}
function render(){
  const[dk,dv]=dominant(),em=EM[dk];
  const d=getDyad(),def=getDefense(),tr=getTrend(),dev=getDevStage();

  // Avatar and Status
  document.getElementById('av').textContent=em.icon;
  document.getElementById('av').style.borderColor=em.c+'88';
  document.getElementById('av').style.opacity = BODY.isAsleep ? '0.3' : '1';
  document.getElementById('status').textContent= (NARRATIVE_SELF.strength > 0.2 ? ' "'+p(NARRATIVE_SELF.phrases)+'"' : FUNC[dk]);

  // State Cards
  document.getElementById('ds').textContent=em.label;
  document.getElementById('dn').textContent=tier(dk,dv);
  document.getElementById('tv').textContent=tr.l;
  document.getElementById('ts2').textContent=tr.s;
  document.getElementById('dev-stage').textContent=dev.name;
  
  // Body Stats in the Identity Card
  document.getElementById('dev-plasticity').textContent = 
    (BODY.isAsleep ? 'SLEEPING' : 'AWAKE') + ' · ' +
    (BODY.fatigue > 70 ? 'Exhausted' : BODY.fatigue > 30 ? 'Tired' : 'Rested');

  // Emotion Bars
  const g=document.getElementById('egrid');g.innerHTML='';
  Object.entries(EM).forEach(([k,e])=>{
    const v=Math.round(state[k]);
    const el=document.createElement('div');el.className='ebar';
    el.innerHTML=`<div class="el">${e.label}</div><div class="ei">${tier(k,v)}</div>
      <div class="et"><div class="ef" style="width:${v}%;background:${e.c}"></div></div>
      <div class="ev">${v}</div>`;
    g.appendChild(el);
  });

  // Semantic Grid
  const sg=document.getElementById('sem-grid');sg.innerHTML='';
  Object.values(nodes).filter(n => n.activation > 0.05).forEach(n=>{
    const el=document.createElement('div');el.className='sem-node';
    el.style.background = `rgba(255,255,255,${n.activation*0.2})`;
    el.textContent=n.id.toLowerCase();
    sg.appendChild(el);
  });

  // Caregiver Panel
  const cgg = document.getElementById('cg-grid'); cgg.innerHTML='';
  [{l:'Stress',v:CAREGIVER.stress,c:'#a84040'},{l:'Mood',v:CAREGIVER.mood,c:'#4a9e6b'}].forEach(item => {
    const el = document.createElement('div'); el.className='tbar';
    const pct = Math.round(item.v * 100);
    el.innerHTML=`<div class="tbar-label">${item.l}</div><div class="tbar-track"><div class="tbar-fill" style="width:${pct}%;background:${item.c}"></div></div>`;
    cgg.appendChild(el);
  });
  document.getElementById('cg-iwm').textContent = getAttachmentStyle().name + ': ' + getAttachmentStyle().desc;

  // Temperament Panel
  const tg = document.getElementById('temp-grid'); tg.innerHTML='';
  Object.entries(TEMP).forEach(([k,v]) => {
    if(k==='noiseFloor') return;
    const el = document.createElement('div'); el.className='tbar';
    el.innerHTML=`<div class="tbar-label">${k}</div><div class="tbar-track"><div class="tbar-fill" style="width:${Math.round(v*100)}%;background:#5b7fc4"></div></div>`;
    tg.appendChild(el);
  });

  // Needs Row
  const nr=document.getElementById('need-row');nr.innerHTML='';
  Object.values(NEEDS).forEach(n=>{
    const el=document.createElement('div');el.className='need-item';
    el.innerHTML=`<div class="need-label">${n.label}</div><div class="need-track"><div class="need-fill" style="width:${Math.round(n.val)}%;background:${n.color}"></div></div>`;
    nr.appendChild(el);
  });

  // Schemas
  const schg=document.getElementById('schema-grid');schg.innerHTML='';
  Object.values(SCHEMAS).forEach(s=>{
    if(s.strength < 0.1) return;
    const el=document.createElement('div');el.className='si';
    el.innerHTML=`<div class="sl">${s.label}</div><div class="st"><div class="sf" style="width:${Math.round(s.strength*100)}%;background:${s.color}"></div></div>`;
    schg.appendChild(el);
  });

  // Defense
  document.getElementById('defn').textContent = def ? def.def : 'none';
  document.getElementById('defn').style.color = def ? def.c : 'var(--t3)';
  
  // ToM
  document.getElementById('tom-display').textContent = tomState ? tomState.label : 'no other-modeling yet';
}
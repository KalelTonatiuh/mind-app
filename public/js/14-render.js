// ═══════════════════════════════════════════════════════
// RENDER — updates all UI panels from current state
// ═══════════════════════════════════════════════════════
function render(){
  const[dk,dv]=dominant(),em=EM[dk];
  const d=getDyad(),def=getDefense(),tr=getTrend(),dev=getDevStage();
  const plasticity=getPlasticity();

  // Header
  document.getElementById('av').textContent=em.icon;
  document.getElementById('av').style.borderColor=em.c+'88';
  document.getElementById('av').style.background=em.c+'14';
  document.getElementById('status').textContent=FUNC[dk]+' — '+dev.desc+' ('+eventCount+' events)'
    + (NARRATIVE_SELF.strength > 0.2 ? ' · "'+p(NARRATIVE_SELF.phrases)+'"' : '');

  // State cards
  document.getElementById('dn').textContent=tier(dk,dv);
  document.getElementById('ds').textContent=em.label+' '+Math.round(dv)+'/100';
  document.getElementById('bn').textContent=d?d.n:'—';
  document.getElementById('bs').textContent=d?d.a+' + '+d.b:'—';
  document.getElementById('tv').textContent=tr.l;
  document.getElementById('ts2').textContent=tr.s;
  document.getElementById('dev-stage').textContent=dev.name;
  document.getElementById('dev-plasticity').textContent=
    'lang '+Math.round(dev.langProb*100)+'% · '+
    (dev.tomBasic?'ToM':'no ToM')+
    (dev.tomFull?' (full)':'')+
    ' · NA:'+Math.round(TEMP.negAffect*100)+
    ' S:'+Math.round(TEMP.surgency*100)+
    ' EC:'+Math.round(TEMP.effortControl*100)+
    ' OS:'+Math.round(TEMP.orientSens*100);

  // Defense
  if(def){
    document.getElementById('defn').textContent=def.def;
    document.getElementById('defn').style.color=def.c;
    document.getElementById('defd').textContent=def.dd;
  } else {
    document.getElementById('defn').textContent='none';
    document.getElementById('defn').style.color='var(--t3)';
    document.getElementById('defd').textContent='';
  }
  const topDef = Object.entries(DEFENSE_USAGE).sort((a,b)=>b[1]-a[1])[0];
  const totalUses = Object.values(DEFENSE_USAGE).reduce((a,b)=>a+b,0);
  const defStyleEl = document.getElementById('def-style');
  if(totalUses > 3 && topDef[1] > 0) {
    const dominance = Math.round(topDef[1]/totalUses*100);
    defStyleEl.textContent = `style: ${topDef[0]} (${dominance}%)`;
  } else {
    defStyleEl.textContent = 'style forming...';
  }

  // Emotion bars
  const g=document.getElementById('egrid');g.innerHTML='';
  Object.entries(EM).forEach(([k,e])=>{
    const v=Math.round(state[k]);
    const el=document.createElement('div');el.className='ebar';
    el.innerHTML=`<div class="el">${e.label}</div><div class="ei">${tier(k,v)}</div>
      <div class="et"><div class="ef" style="width:${v}%;background:${e.c}"></div></div>
      <div class="ev">${v}</div>`;
    g.appendChild(el);
  });

  // Semantic network
  const sg=document.getElementById('sem-grid');sg.innerHTML='';
  const allNodes=Object.values(nodes).sort((a,b)=>{
    if(b.activation!==a.activation)return b.activation-a.activation;
    return a.isPrime?-1:1;
  });
  allNodes.forEach(n=>{
    const a=n.activation;
    const alpha=Math.max(0.12,a);
    const bg=n.isPrime?`rgba(100,100,120,${alpha})`:(n.valence>0.2?`rgba(58,138,94,${alpha})`:n.valence<-0.2?`rgba(168,44,44,${alpha})`:`rgba(80,80,100,${alpha})`);
    const border=a>0.3?`rgba(255,255,255,${a*0.5})`:'var(--b)';
    const el=document.createElement('div');el.className='sem-node';
    el.style.background=bg;el.style.borderColor=border;el.style.color=a>0.25?'var(--t)':'var(--t3)';
    el.textContent=n.id.toLowerCase().replace('dont','!');
    sg.appendChild(el);
  });

  // Caregiver panel
  const cgg = document.getElementById('cg-grid'); cgg.innerHTML='';
  const cgItems = [
    { label:'Stress',     val: CAREGIVER.stress,    color:'#a84040', desc: v => v>0.6?'overwhelmed':v>0.35?'moderate stress':'calm' },
    { label:'Depletion',  val: CAREGIVER.depletion, color:'#8b6914', desc: v => v>0.6?'exhausted':v>0.35?'worn down':'resourced' },
    { label:'Mood',       val: CAREGIVER.mood,      color:'#4a9e6b', desc: v => v>0.65?'warm & present':v>0.4?'okay':'withdrawn' },
    { label:'Responsiveness', val: getCaregiverResponsiveness(), color:'#5b7fc4', desc: v => v>0.65?'responsive':v>0.4?'inconsistent':'unavailable' },
  ];
  cgItems.forEach(item => {
    const pct = Math.round(item.val * 100);
    const el = document.createElement('div'); el.className='tbar';
    el.innerHTML=`<div class="tbar-label">${item.label}</div>` +
      `<div class="tbar-track"><div class="tbar-fill" style="width:${pct}%;background:${item.color}88"></div></div>` +
      `<div class="tbar-desc">${item.desc(item.val)}</div>`;
    cgg.appendChild(el);
  });

  // IWM / attachment
  const att = getAttachmentStyle();
  const iwmEl = document.getElementById('cg-iwm');
  if(IWM.sampleCount < 3) {
    iwmEl.textContent = 'attachment forming... ('+IWM.sampleCount+' interactions)';
  } else {
    const consolidation = Math.min(100, Math.round(
      (Math.abs(IWM.otherTrust - 0.5) * 2) * 50 +
      Math.min(IWM.sampleCount / 200, 1) * 50
    ));
    const adultEvents = Math.max(0, IWM.sampleCount - CAREGIVER.totalInteractions);
    iwmEl.innerHTML =
      `<span style="color:${att.color}">${att.name}</span> — ${att.desc} · ` +
      `self-worth ${Math.round(IWM.selfWorth*100)} · other-trust ${Math.round(IWM.otherTrust*100)} · ` +
      `consolidation ${consolidation}%` +
      (adultEvents > 0 ? ` · ${adultEvents} adult social events` : '');
  }

  // Temperament
  const tg = document.getElementById('temp-grid'); tg.innerHTML='';
  const TEMP_DEFS = [
    { key:'negAffect',    label:'Neg. Affectivity', color:'#a84040',
      desc: v => v>0.65 ? 'high — fear & sadness fire strongly' : v<0.35 ? 'low — resilient baseline' : 'moderate' },
    { key:'surgency',     label:'Surgency', color:'#4a9e6b',
      desc: v => v>0.65 ? 'high — joy & anticipation amplified' : v<0.35 ? 'low — reserved approach' : 'moderate' },
    { key:'effortControl',label:'Effortful Control', color:'#5b7fc4',
      desc: v => v>0.65 ? 'high — quick emotional regulation' : v<0.35 ? 'low — emotions run hot & long' : 'moderate' },
    { key:'orientSens',   label:'Orienting Sensitivity', color:'#9b6dc4',
      desc: v => v>0.65 ? 'high — surprise amplified, learns fast' : v<0.35 ? 'low — less reactive to novelty' : 'moderate' },
  ];
  TEMP_DEFS.forEach(td => {
    const val = TEMP[td.key];
    const pct = Math.round(val * 100);
    const el = document.createElement('div'); el.className='tbar';
    el.innerHTML=`<div class="tbar-label">${td.label}</div>` +
      `<div class="tbar-track"><div class="tbar-fill" style="width:${pct}%;background:${td.color}88"></div></div>` +
      `<div class="tbar-desc">${td.desc(val)} (${pct})</div>`;
    tg.appendChild(el);
  });

  // Semantic network stats
  const learnedCount=Object.values(nodes).filter(n=>!n.isPrime&&n.expCount>2).length;
  document.getElementById('sem-count').textContent=`— ${Object.keys(nodes).length} nodes, ${learnedCount} developing`;
  document.getElementById('sem-plasticity').textContent=`plasticity ${Math.round(plasticity*100)}% · ${Object.values(nodes).reduce((s,n)=>s+Object.keys(n.connections).length,0)} connections`;

  // Needs
  const nr=document.getElementById('need-row');nr.innerHTML='';
  Object.values(NEEDS).forEach(n=>{
    const el=document.createElement('div');el.className='need-item';
    const pct=Math.round(n.val);
    el.innerHTML=`<div class="need-label">${n.label}</div>
      <div class="need-track"><div class="need-fill" style="width:${pct}%;background:${n.color}"></div></div>
      <div class="need-val">${pct}</div>`;
    nr.appendChild(el);
  });

  // Schemas
  const schg=document.getElementById('schema-grid');schg.innerHTML='';
  Object.values(SCHEMAS).forEach(s=>{
    const pct=Math.round(s.strength*100);
    const isEarly = s.formationEvent && s.formationEvent < 20;
    const resistance = s.strength>0.05 ? (1 + s.strength*1.5 + Math.min(s.age/100,1) * (isEarly?1.8:1)).toFixed(1) : '—';
    const tag = isEarly && s.strength>0.3 ? ' ⚠' : '';
    const el=document.createElement('div');el.className='si';
    el.innerHTML=`<div class="sl" title="${s.label} | age:${s.age} resist:${resistance}${isEarly?' unconditional':''}">${s.label}${tag}</div>
      <div class="st"><div class="sf" style="width:${pct}%;background:${s.color}"></div></div>
      <div class="sv">${pct}</div>`;
    schg.appendChild(el);
  });
  const maxStr=Math.max(...Object.values(SCHEMAS).map(s=>s.strength));
  document.getElementById('schema-age').textContent=['— forming','— early','— developing','— established','— deep','— defining'][Math.min(5,~~(maxStr*6))];

  // Episodic memory
  const ml=document.getElementById('mem-list');ml.innerHTML='';
  if(!episodicMemory.length){
    ml.innerHTML='<div style="font-size:10px;color:var(--t3);font-family:var(--m)">no memories yet</div>';
  } else {
    episodicMemory.forEach(ep=>{
      const div=document.createElement('div');div.className='mem-item';
      div.innerHTML=`<div class="mem-dot" style="background:${EM[ep.emo]?.c||'#666'}88"></div>`+
        `<div style="font-size:10px;color:var(--t3);font-family:var(--m);flex-shrink:0;min-width:16px">${ep.age}</div>`+
        `<div style="font-size:10px;color:var(--t3);font-family:var(--m);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${ep.label}</div>`;
      ml.appendChild(div);
    });
  }

  // Semantic beliefs
  const beliefs = Object.values(semanticBeliefs);
  if(beliefs.length) {
    const sep = document.createElement('div');
    sep.style.cssText='font-size:9px;color:var(--t3);font-family:var(--m);text-transform:uppercase;letter-spacing:.08em;margin:5px 0 3px;opacity:.6';
    sep.textContent='abstracted beliefs';
    ml.appendChild(sep);
    beliefs.sort((a,b)=>b.strength-a.strength).forEach(b=>{
      const div=document.createElement('div');div.className='mem-item';
      div.innerHTML=`<div class="mem-dot" style="background:${b.color}88"></div>`+
        `<div style="font-size:10px;color:var(--t3);font-family:var(--m);flex-shrink:0;min-width:22px">${Math.round(b.strength*100)}</div>`+
        `<div style="font-size:10px;color:var(--t2);font-family:var(--m);flex:1;font-style:italic">${b.label}</div>`;
      ml.appendChild(div);
    });
  }
  const beliefCount = Object.keys(semanticBeliefs).length;
  document.getElementById('mem-count').textContent=episodicMemory.length
    ?`— ${episodicMemory.length} ep${beliefCount?`, ${beliefCount} beliefs`:''}`
    :'— empty';
    // --- ADD THIS AT THE END OF THE RENDER FUNCTION ---
  const bodyStatus = document.getElementById('dev-plasticity');
  if (bodyStatus) {
    bodyStatus.innerHTML += `<br><b>Body:</b> Hunger ${Math.round(BODY.hunger)}% · ` +
      `Fatigue ${Math.round(BODY.fatigue)}% · ` +
      `${BODY.isAsleep ? '<span style="color:#4494bc">SLEEPING</span>' : 'AWAKE'}`;
  }
}

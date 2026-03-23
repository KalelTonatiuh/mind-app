

// ═══════════════════════════════════════════════════════
// RNG UTILITIES
// Fast LCG — consistent, seedable pseudo-random
// ═══════════════════════════════════════════════════════
let _s=Date.now()&0x7fffffff;
function r(){_s=(_s*1664525+1013904223)&0xffffffff;return Math.abs(_s)/2147483648;}
function p(arr){return arr[~~(r()*arr.length)];}

// ═══════════════════════════════════════════════════════
// INIT — runs once on page load
// ═══════════════════════════════════════════════════════
function init() {
  buildNetwork();
  initEventButtons();
  document.getElementById('ci').addEventListener('keydown', e => {
    if(e.key === 'Enter') sendCustom();
  });
  render();
}

// ═══════════════════════════════════════════════════════
// MAIN LOOP — fires every 4.5s
// ═══════════════════════════════════════════════════════
setInterval(()=>{
  updateBody(); 
  updateChemistry();
  updateHeartbreak();
  updateWindows(); // ADD THIS LINE HERE
  
  // ... rest of code

  // ADD 'lastRegulationBonus' TO THIS MATH:
  const decayRate = 0.88 + TEMP.effortControl * 0.08 + lastRegulationBonus; 
  // ... rest of code
  // ... rest of your code
  const baseline = 5;

  // --- ADD THIS LOGIC ---
  // If asleep, the mind ignores external events and focuses on rest
  if (BODY.isAsleep) {
     Object.keys(state).forEach(k => {
       state[k] = state[k] * 0.85 + baseline * 0.15; // Faster decay to calm
     });
     render();
     return; // Skip the rest of the logic while sleeping
  }

  Object.keys(state).forEach(k=>{
    prev[k]=state[k];
    const granBonus = getGranularityRegulationBonus(k);
    state[k]=state[k]*(decayRate + granBonus)+baseline*(1-decayRate-granBonus);
  });
  Object.values(NEEDS).forEach(n=>{n.val=n.val*0.98+50*0.02;});
  Object.values(nodes).forEach(n=>{n.activation*=0.7;});
  updateCaregiver();
  addBiologicalNoise();
  offlineConsolidation();
  generateSpontaneousThoughts();
  render();
}, 4500);

// ═══════════════════════════════════════════════════════
// RESET
// ═══════════════════════════════════════════════════════
function resetMind(){
  Object.keys(state).forEach(k=>{state[k]=5;prev[k]=5;});
  Object.values(SCHEMAS).forEach(s=>{s.strength=0;s.age=0;s.formationCount=0;s.formationEvent=undefined;});
  Object.values(NEEDS).forEach(n=>{n.val=50;});
  episodicMemory.length=0;
  Object.keys(semanticBeliefs).forEach(k=>delete semanticBeliefs[k]);
  lastEventNodePattern = [];
  NARRATIVE_SELF.valence=0; NARRATIVE_SELF.theme='undefined';
  NARRATIVE_SELF.strength=0; NARRATIVE_SELF.phrases=[]; NARRATIVE_SELF.eventCount=0;
  tomState=null; eventCount=0; thoughtQ=[]; clearTimeout(thoughtTimer); thoughtTimer=null;
  TEMP = generateTemperament();
  CAREGIVER = generateCaregiver();
  IWM.selfWorth = 0.5; IWM.otherTrust = 0.5; IWM.sampleCount = 0;
  Object.keys(DEFENSE_USAGE).forEach(k=>DEFENSE_USAGE[k]=0);
  Object.keys(nodes).forEach(k=>delete nodes[k]);
  buildNetwork();
  document.getElementById('stream').innerHTML='<div class="thought nv"><span class="ts">—</span><span class="tx">pre-verbal. no concepts yet. only sensation.</span></div>';
  document.getElementById('tom-display').textContent='no social event yet';
  document.getElementById('ff-progress').textContent='';
  render();
}

// ═══════════════════════════════════════════════════════
// PANEL TOGGLE
// ═══════════════════════════════════════════════════════
function togglePanel(pid, bid) {
  const body = document.getElementById(bid);
  const parent = document.getElementById(pid);
  const tog = parent.querySelector('.ptog');
  if (body.style.display === 'none') {
    body.style.display = 'block';
    if (tog) tog.textContent = '▾';
  } else {
    body.style.display = 'none';
    if (tog) tog.textContent = '▸';
  }
}

function init() {
  buildNetwork();
  initEventButtons();
  document.getElementById('ci').addEventListener('keydown', e => { if(e.key === 'Enter') sendCustom(); });
  render();
}

init(); // Start it up
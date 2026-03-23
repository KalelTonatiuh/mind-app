// ═══════════════════════════════════════════════════════
// RNG UTILITIES
// Fast LCG — consistent, seedable pseudo-random
// ═══════════════════════════════════════════════════════
let _s = Date.now() & 0x7fffffff;
function r() { 
  _s = (_s * 1664525 + 1013904223) & 0xffffffff; 
  return Math.abs(_s) / 2147483648; 
}
function p(arr) { return arr[~~(r() * arr.length)]; }

// ═══════════════════════════════════════════════════════
// INIT — runs once on page load
// ═══════════════════════════════════════════════════════
function init() {
  buildNetwork();
  initEventButtons();
  const ci = document.getElementById('ci');
  if(ci) {
    ci.addEventListener('keydown', e => {
      if(e.key === 'Enter') sendCustom();
    });
  }
  render();
}

// ═══════════════════════════════════════════════════════
// MAIN LOOP — fires every 4.5s
// ═══════════════════════════════════════════════════════
setInterval(() => {
  // 1. BIOLOGICAL & DEVELOPMENTAL UPDATES
  updateBody(); 
  updateChemistry();
  updateHeartbreak();
  updateWindows();
  updatePeers();
  runSynapticPruning();
  
  const baseline = 5;

  // 2. SLEEP GATING
  if (BODY.isAsleep) {
     Object.keys(state).forEach(k => {
       state[k] = state[k] * 0.85 + baseline * 0.15; // Rapid decay to calm during sleep
     });
     render();
     return; // Skip active psyche logic while sleeping
  }

  // 3. ACTIVE AGENCY: THE LEASH (Circle of Security)
  // Exploration drive increments if the mind feels safe (Oxytocin high, Cortisol low)
  if (CHEM.oxytocin > 0.7 && CHEM.cortisol < 0.3) {
      NEEDS.drives.exploration = (NEEDS.drives.exploration || 0) + 0.12;
      if (NEEDS.drives.exploration > 1.0) {
          // Mind "clicks its own button" to explore
          applyEffects({joy: 8, anticipation: 12}, 'play', 'exploring the environment');
          NEEDS.drives.exploration = 0;
      }
  } else if (CHEM.cortisol > 0.6) {
      // Return to safety: exploration drive resets when scared
      NEEDS.drives.exploration = 0;
      
      // SOCIAL SIGNALING: Mind "cries" out when stressed
      // This should affect the Caregiver's state
      let response = receiveSignal('cry');
      if (response === 'warm') {
          applyEffects({trust: 10, joy: 5}, 'kindness', 'caregiver provides comfort');
      }
  }

  // 4. INTROJECTION (The Inner Voice)
  // High stress triggers internal "ghost voices" stored from caregiver reactions
  if (CHEM.cortisol > 0.7 && CAREGIVER.introjects.length > 0 && r() < 0.25) {
      let voice = p(CAREGIVER.introjects);
      sched({text: `[Inner Voice]: "${voice}"`, cls: 'rum'}, 400);
  }

  // 5. SHADOW DYNAMICS: Biological Noise Leak
  // Repressed (hidden) nodes physically vibrate the system as unexplained anxiety
  let hiddenNodes = Object.values(nodes).filter(n => n.isHidden);
  if (hiddenNodes.length > 0 && r() < 0.15) {
      const spike = 5 + (r() * 10);
      state.fear = Math.min(100, state.fear + spike);
      CHEM.cortisol = Math.min(1, CHEM.cortisol + 0.1);
      sched({text: "unexplained somatic tension...", cls: 'nv'}, 0);
  }

  // 6. GOAL ORIENTATION
  // Re-evaluate the "Life Theme" based on the most neglected need
  evaluateGoals();

  // 7. EMOTIONAL DECAY & HOMEOSTASIS (Your Core Math)
  const decayRate = 0.88 + TEMP.effortControl * 0.08 + lastRegulationBonus; 
  
  Object.keys(state).forEach(k => {
    prev[k] = state[k];
    const granBonus = getGranularityRegulationBonus(k);
    state[k] = state[k] * (decayRate + granBonus) + baseline * (1 - decayRate - granBonus);
  });

  // 8. NEED DECAY
  Object.values(NEEDS).forEach(n => {
    if (n.val !== undefined) {
        n.val = n.val * 0.98 + 50 * 0.02;
    }
  });

  // 9. NODE DECAY
  Object.values(nodes).forEach(n => { n.activation *= 0.7; });

  // 10. EXTERNAL SYSTEM UPDATES
  updateCaregiver();
  addBiologicalNoise();
  offlineConsolidation();
  generateSpontaneousThoughts();
  render();
}, 4500);

// ═══════════════════════════════════════════════════════
// RESET MIND
// ═══════════════════════════════════════════════════════
function resetMind(){
  Object.keys(state).forEach(k => { state[k] = 5; prev[k] = 5; });
  Object.values(SCHEMAS).forEach(s => { 
    s.strength = 0; s.age = 0; s.formationCount = 0; s.formationEvent = undefined; 
  });
  Object.values(NEEDS).forEach(n => { if (n.val !== undefined) n.val = 50; });
  
  episodicMemory.length = 0;
  Object.keys(semanticBeliefs).forEach(k => delete semanticBeliefs[k]);
  
  lastEventNodePattern = [];
  NARRATIVE_SELF.valence = 0; 
  NARRATIVE_SELF.theme = 'undefined';
  NARRATIVE_SELF.lifeTheme = 'unformed';
  NARRATIVE_SELF.strength = 0; 
  NARRATIVE_SELF.phrases = []; 
  NARRATIVE_SELF.eventCount = 0;
  
  tomState = null; 
  eventCount = 0; 
  thoughtQ = []; 
  clearTimeout(thoughtTimer); 
  thoughtTimer = null;
  
  TEMP = generateTemperament();
  CAREGIVER = generateCaregiver();
  IWM.selfWorth = 0.5; 
  IWM.otherTrust = 0.5; 
  IWM.sampleCount = 0;
  
  Object.keys(DEFENSE_USAGE).forEach(k => DEFENSE_USAGE[k] = 0);
  Object.keys(nodes).forEach(k => delete nodes[k]);
  
  buildNetwork();
  
  const stream = document.getElementById('stream');
  if (stream) stream.innerHTML = '<div class="thought nv"><span class="ts">—</span><span class="tx">pre-verbal. no concepts yet. only sensation.</span></div>';
  
  const tomDisp = document.getElementById('tom-display');
  if (tomDisp) tomDisp.textContent = 'no social event yet';
  
  const ffProg = document.getElementById('ff-progress');
  if (ffProg) ffProg.textContent = '';
  
  render();
}

// ═══════════════════════════════════════════════════════
// UI UTILITIES
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

// Initialize on Load
init();
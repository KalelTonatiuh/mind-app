// 13-events.js - Semantic Parsing & Event Application
// This file handles turning text/buttons into chemical and emotional spikes.

// 1. PRIME ACTIVATION MAPS
const EVENT_PRIMES = {
    achievement: { GOOD: 0.9, I: 0.8, CAN: 0.8, DO: 0.7 },
    kindness: { GOOD: 0.8, SOMEONE: 0.8, WANT: 0.5, NEAR: 0.4 },
    betrayal: { BAD: 0.9, SOMEONE: 0.8, NOT: 0.6, TRUE: 0.2 },
    threat: { BAD: 0.8, HAPPEN: 0.7, DONTWANT: 0.9, NOW: 0.6 },
    alone: { FAR: 0.8, DONTWANT: 0.7, SOMEONE: 0.5, NOT: 0.5 },
    sudden: { HAPPEN: 0.9, NOW: 0.8, SURPRISE: 0.7 }
};

// 2. UI BUTTON CONFIGURATION
const EVENTS = [
  {l:'🏆 Goal achieved',      fx:{joy:32,trust:10,anticipation:12},cat:'achievement',lbl:'goal achieved'},
  {l:'💔 Someone leaves',     fx:{sadness:38,anger:14,fear:10},   cat:'alone',       lbl:'someone left'},
  {l:'👁️ Being judged',       fx:{fear:22,anticipation:18,anger:8},cat:'judged',     lbl:'being judged'},
  {l:'🎁 Unexpected kindness',fx:{surprise:28,joy:18,trust:14},   cat:'kindness',    lbl:'unexpected kindness'},
  {l:'🚨 Threat appears',     fx:{fear:38,anger:18,anticipation:12},cat:'threat',    lbl:'threat appeared'},
  {l:'🤝 Given trust',        fx:{trust:32,anticipation:18,joy:10},cat:'given trust',lbl:'given responsibility'}
];

/**
 * Initializes the buttons in the UI
 */
function initEventButtons() {
  const eg = document.getElementById('evgrid');
  if(!eg) return;
  eg.innerHTML = '';
  EVENTS.forEach(ev => {
    const b = document.createElement('button');
    b.className = 'evbtn';
    b.textContent = ev.l;
    b.onclick = () => applyEffects(ev.fx, ev.cat, ev.lbl);
    eg.appendChild(b);
  });
}

/**
 * Parses raw text into semantic categories and emotion spikes
 */
function parseInputSemantically(text) {
    const lower = text.toLowerCase();
    const seeds = {};
    
    // Mapping words to Primes
    if (lower.includes('mom') || lower.includes('mother')) seeds.MOTHER = 0.9;
    if (lower.includes('dad') || lower.includes('father')) seeds.FATHER = 0.9;
    if (lower.includes('hurt') || lower.includes('pain') || lower.includes('hit')) seeds.PAIN = 0.9;
    if (lower.includes('leave') || lower.includes('away')) seeds.FAR = 0.8;
    if (lower.includes('hug') || lower.includes('love') || lower.includes('smile')) seeds.GOOD = 0.8;
    if (lower.includes('no') || lower.includes('stop')) seeds.NOT = 0.7;

    // Default if no words match
    if (Object.keys(seeds).length === 0) return { fx: { surprise: 15 }, cat: 'sudden' };

    // Spread activation through the network (defined in 02-network.js)
    spreadActivation(seeds);
    
    // Determine category based on node activation
    let cat = 'sudden';
    if (nodes['BAD']?.activation > 0.3) cat = 'threat';
    if (nodes['FAR']?.activation > 0.4) cat = 'alone';
    if (nodes['GOOD']?.activation > 0.4) cat = 'kindness';
    if (nodes['DO']?.activation > 0.4) cat = 'achievement';

    // Calculate emotion spikes
    let fx = { joy: 0, fear: 0, trust: 0, sadness: 0, surprise: 0 };
    if (cat === 'kindness') { fx.trust = 20; fx.joy = 10; }
    if (cat === 'threat') { fx.fear = 30; fx.anger = 10; }
    if (cat === 'alone') { fx.sadness = 25; fx.fear = 10; }
    if (cat === 'achievement') { fx.joy = 25; fx.anticipation = 10; }
    if (cat === 'sudden') { fx.surprise = 20; }

    return { fx, cat };
}

/**
 * The core function that applies an event to the Mind
 */
function applyEffects(fx, cat, label) {
    // 1. Determine valence for Chemistry (Gottman 5:1 Bias)
    const isPositive = ['kindness', 'achievement', 'play', 'joyful'].includes(cat);
    const valence = isPositive ? 1 : -1;
    
    // 2. Biological Updates
    checkPredictionError(fx, valence);
    updateChemistry(valence);

    // 3. Social Feedback Loop (If the event is social)
    // SOCIAL_CATS is defined in 05-caregiver.js
    if (typeof SOCIAL_CATS !== 'undefined' && SOCIAL_CATS.has(cat)) {
        let resp = getCaregiverResponsiveness();
        updateIWM(resp);
        
        // Introjection logic (Ghost Voices)
        if (valence < 0 && resp < 0.4) CAREGIVER.introjects.push("you are being difficult");
        if (valence > 0 && resp > 0.6) CAREGIVER.introjects.push("good job");
        
        // Social modeling
        processToM(cat);
    }

    // 4. Apply the spikes to the actual emotional state
    Object.entries(fx).forEach(([emo, value]) => {
        if (state[emo] !== undefined) {
            state[emo] = Math.min(100, Math.max(0, state[emo] + value));
        }
    });

    // 5. Psychological Hardening
    conditionSchemas(cat, state);
    
    // 6. Memory Encoding
    const semPattern = Object.values(nodes)
        .filter(n => n.activation > 0.3 && !n.isHidden)
        .map(n => n.id);
    
    encodeEpisode(label, dominant()[0], dominant()[1], semPattern);
    
    // 7. Increment Global History
    eventCount++;
    
    // 8. Generate Outputs
    generateThoughts(cat);
    render();
}

/**
 * THE FUNCTION YOUR HTML IS LOOKING FOR
 * Connects the text input box to the simulation
 */
function sendCustom() {
    const el = document.getElementById('ci');
    if (!el) return;
    
    const text = el.value.trim();
    if (!text) return;
    
    // Clear input box immediately
    el.value = '';
    
    // Process text
    const { fx, cat } = parseInputSemantically(text);
    
    // Apply to simulation
    applyEffects(fx, cat, text);
}
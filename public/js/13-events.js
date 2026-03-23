// 13-events.js - Full Fixed Version
const EVENT_PRIMES = {
    achievement: { GOOD: 0.9, I: 0.8, CAN: 0.8, DO: 0.7 },
    kindness: { GOOD: 0.8, SOMEONE: 0.8, WANT: 0.5, NEAR: 0.4 },
    betrayal: { BAD: 0.9, SOMEONE: 0.8, NOT: 0.6, TRUE: 0.2 },
    threat: { BAD: 0.8, HAPPEN: 0.7, DONTWANT: 0.9, NOW: 0.6 },
    alone: { FAR: 0.8, DONTWANT: 0.7, SOMEONE: 0.5, NOT: 0.5 }
};

const EVENTS = [
  {l:'🏆 Goal achieved',      fx:{joy:32,trust:10,anticipation:12},cat:'achievement',lbl:'goal achieved'},
  {l:'💔 Someone leaves',     fx:{sadness:38,anger:14,fear:10},   cat:'alone',       lbl:'someone left'},
  {l:'👁️ Being judged',       fx:{fear:22,anticipation:18,anger:8},cat:'judged',     lbl:'being judged'},
  {l:'🎁 Unexpected kindness',fx:{surprise:28,joy:18,trust:14},   cat:'kindness',    lbl:'unexpected kindness'},
  {l:'🚨 Threat appears',     fx:{fear:38,anger:18,anticipation:12},cat:'threat',    lbl:'threat appeared'},
  {l:'🤝 Given trust',        fx:{trust:32,anticipation:18,joy:10},cat:'given trust',lbl:'given responsibility'}
];

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

function parseInputSemantically(text) {
    const lower = text.toLowerCase();
    const seeds = {};
    if (lower.includes('mom') || lower.includes('mother')) seeds.MOTHER = 0.9;
    if (lower.includes('hurt') || lower.includes('pain')) seeds.PAIN = 0.9;
    
    spreadActivation(seeds);
    let cat = nodes['BAD']?.activation > 0.4 ? 'threat' : 'achievement';
    return { fx: { joy: 10 }, cat: cat };
}

function applyEffects(fx, cat, label) {
    const val = ['kindness', 'achievement'].includes(cat) ? 1 : -1;
    updateChemistry(val);

    if (SOCIAL_CATS.has(cat)) {
        let resp = getCaregiverResponsiveness();
        updateIWM(resp);
        processToM(cat);
    }

    Object.entries(fx).forEach(([k, v]) => {
        state[k] = Math.min(100, Math.max(0, (state[k] || 0) + v));
    });

    conditionSchemas(cat, state);
    const semPattern = Object.values(nodes).filter(n => n.activation > 0.3).map(n => n.id);
    encodeEpisode(label, dominant()[0], dominant()[1], semPattern);
    
    eventCount++;
    generateThoughts(cat);
    render();
}
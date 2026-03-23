// 13-events.js - Semantic Parsing & Event Application
const EVENT_PRIMES = {
    achievement: { GOOD: 0.9, I: 0.8, CAN: 0.8, DO: 0.7 },
    kindness: { GOOD: 0.8, SOMEONE: 0.8, WANT: 0.5, NEAR: 0.4 },
    betrayal: { BAD: 0.9, SOMEONE: 0.8, NOT: 0.6, TRUE: 0.2 },
    threat: { BAD: 0.8, HAPPEN: 0.7, DONTWANT: 0.9, NOW: 0.6 },
    alone: { FAR: 0.8, DONTWANT: 0.7, SOMEONE: 0.5, NOT: 0.5 }
};

const WORD_MAP = [
    { w: ['mom', 'mother', 'mama', 'parent'], p: { MOTHER: 0.9, SOMEONE: 0.5 } },
    { w: ['hit', 'hurt', 'pain', 'punch'], p: { PAIN: 0.9, BAD: 0.8 } },
    { w: ['leave', 'left', 'gone', 'bye'], p: { FAR: 0.8, NOT: 0.5 } },
    { w: ['hug', 'hold', 'warm', 'soft'], p: { WARM: 0.8, GOOD: 0.5 } }
];

function parseInputSemantically(text) {
    const lower = text.toLowerCase();
    const seeds = {};
    
    WORD_MAP.forEach(m => {
        if (m.w.some(word => lower.includes(word))) {
            Object.entries(m.p).forEach(([prime, val]) => seeds[prime] = (seeds[prime] || 0) + val);
        }
    });

    if (Object.keys(seeds).length === 0) return { fx: { surprise: 10 }, cat: 'sudden' };

    spreadActivation(seeds);
    
    // Categorize
    let cat = 'achievement';
    if (nodes['BAD']?.activation > 0.4) cat = 'threat';
    if (nodes['FAR']?.activation > 0.4) cat = 'alone';
    if (nodes['SOMEONE']?.activation > 0.4 && nodes['BAD']?.activation > 0.4) cat = 'betrayal';
    if (nodes['SOMEONE']?.activation > 0.4 && nodes['GOOD']?.activation > 0.4) cat = 'kindness';

    // Simple FX mapping
    let fx = { joy: 0, fear: 0, trust: 0, sadness: 0 };
    if (cat === 'kindness') fx.trust = 25;
    if (cat === 'threat') fx.fear = 30;
    if (cat === 'alone') fx.sadness = 25;
    if (cat === 'achievement') fx.joy = 20;

    return { fx, cat };
}

function applyEffects(fx, cat, label) {
    const val = ['kindness', 'achievement', 'morning'].includes(cat) ? 1 : -1;
    
    checkPredictionError(fx, val);
    updateChemistry(val);

    // Social Feedback Loop
    if (SOCIAL_CATS.has(cat)) {
        let resp = getCaregiverResponsiveness();
        updateIWM(resp);
        
        // Introjection: Store the caregiver's reaction as a ghost voice
        if (val < 0 && resp < 0.4) CAREGIVER.introjects.push("you're being too much");
        if (val > 0 && resp > 0.6) CAREGIVER.introjects.push("I'm proud of you");
        
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

function sendCustom() {
    const el = document.getElementById('ci');
    const text = el.value.trim();
    if (!text) return;
    el.value = '';
    const { fx, cat } = parseInputSemantically(text);
    applyEffects(fx, cat, text);
}
// 08-memory.js - Memory & Narrative Self
const NARRATIVE_SELF = { 
    valence: 0, 
    theme: 'undefined', 
    lifeTheme: 'unformed', 
    strength: 0, 
    phrases: [], 
    eventCount: 0 
};

const episodicMemory = [];
const semanticBeliefs = {};

function encodeEpisode(label, domEmo, intensity, semPattern) {
    const ep = {
        id: Date.now(), label, age: 0, emo: domEmo, intensity,
        semPattern: [...semPattern], cat: label.split(' ')[0],
    };
    episodicMemory.unshift(ep);
    if (episodicMemory.length > 25) episodicMemory.pop();
    if (eventCount % 50 === 0 && eventCount > 0) generateNarrativeJournal();
    checkSemantization(domEmo, ep.cat, intensity, semPattern);
}

function retrieveSimilar(emo, intensity) {
    const cands = episodicMemory.filter(e => e.emo === emo);
    if (cands.length) {
        let mem = cands.sort((a,b) => b.intensity - a.intensity)[0];
        if (CHEM.oxytocin > 0.7 && (mem.emo === 'fear' || mem.emo === 'sadness')) {
            mem.intensity *= 0.7; 
            sched({text: "re-evaluating that old memory...", cls: 'mem'}, 500);
        }
        return mem;
    }
    return null;
}

function dreamCycle() {
    if (episodicMemory.length < 5 || r() > 0.4) return;
    let m1 = p(episodicMemory);
    let m2 = p(episodicMemory);
    if (m1.semPattern.length > 0 && m2.semPattern.length > 0) {
        let n1 = p(m1.semPattern);
        let n2 = p(m2.semPattern);
        if (nodes[n1] && nodes[n2]) {
            nodes[n1].connections[n2] = Math.min(1, (nodes[n1].connections[n2] || 0) + 0.3);
            nodes[n2].connections[n1] = Math.min(1, (nodes[n2].connections[n1] || 0) + 0.3);
        }
        sched({text: `dream: ${n1.toLowerCase()} fused with ${n2.toLowerCase()}`, cls: 'mem'}, 100);
    }
}

function generateNarrativeJournal() {
    let recent = episodicMemory.slice(0, 10);
    let dom = dominant();
    let theme = NARRATIVE_SELF.lifeTheme || "survival";
    let entry = `It feels like my life is becoming about ${theme}. Lately, ${dom[0]} has been dominant.`;
    const journ = document.getElementById('b-journal');
    if (journ) journ.innerHTML = `<em>"${entry}"</em>`;
}

function checkSemantization(emo, cat, intensity, semPattern) {
    // Basic semantization placeholder to prevent errors
    const key = emo + ':' + cat;
    if (intensity > 80) semanticBeliefs[key] = { label: `always ${emo} with ${cat}`, strength: 0.5 };
}

function updateNarrativeSelf() {
  if(eventCount < 5) return;
  // Narrative logic
  NARRATIVE_SELF.eventCount = eventCount;
  NARRATIVE_SELF.strength = Math.min(1, eventCount / 500);
}
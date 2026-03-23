// 08-memory.js - Memory, Reconsolidation & Dreams
const episodicMemory = [];
const semanticBeliefs = {};

function encodeEpisode(label, emoSnapshot, domEmo, intensity, needChanges, semPattern) {
    const ep = {
        id: Date.now(), label, age: 0, emo: domEmo, intensity,
        fingerprint: {...emoSnapshot}, needChanges: {...needChanges},
        semPattern: [...semPattern], cat: label.split(' ')[0],
    };
    episodicMemory.unshift(ep);
    if (episodicMemory.length > 25) episodicMemory.pop();
    
    // FEATURE: Narrative Narration (updates journal every 50 events)
    if (eventCount % 50 === 0 && eventCount > 0) generateNarrativeJournal();
    
    checkSemantization(domEmo, ep.cat, intensity, semPattern);
}

// FEATURE: Memory Reconsolidation (Nader, 2000)
function retrieveSimilar(emo, intensity) {
    const cands = episodicMemory.filter(e => e.age > 0 && e.emo === emo);
    if (cands.length) {
        let mem = cands.sort((a,b) => b.intensity - a.intensity)[0];
        
        // If recalled while feeling safe (Oxytocin high), permanent fear reduction
        if (CHEM.oxytocin > 0.7 && (mem.emo === 'fear' || mem.emo === 'sadness')) {
            mem.intensity *= 0.7; // The memory is "rewritten" as less scary
            sched({text: "re-evaluating that old memory...", cls: 'mem'}, 500);
        }
        return mem;
    }
    return null;
}

// FEATURE: Sleep Architecture (Activation-Synthesis)
function dreamCycle() {
    if (episodicMemory.length < 5 || r() > 0.4) return;
    
    // Pick two random episodic concepts and fuse them
    let m1 = p(episodicMemory);
    let m2 = p(episodicMemory);
    
    if (m1.semPattern.length > 0 && m2.semPattern.length > 0) {
        let n1 = p(m1.semPattern);
        let n2 = p(m2.semPattern);
        
        // Physically wire them together in the network
        if (nodes[n1] && nodes[n2]) {
            nodes[n1].connections[n2] = Math.min(1, (nodes[n1].connections[n2] || 0) + 0.3);
            nodes[n2].connections[n1] = Math.min(1, (nodes[n2].connections[n1] || 0) + 0.3);
        }
        sched({text: `dream: ${n1.toLowerCase()} fused with ${n2.toLowerCase()}`, cls: 'mem'}, 100);
    }
}

// FEATURE: Narrative Narration (First-person Journaling)
function generateNarrativeJournal() {
    let recent = episodicMemory.slice(0, 10);
    let dom = dominant();
    let theme = NARRATIVE_SELF.lifeTheme || "survival";
    
    let entry = `It feels like my life is becoming about ${theme}. `;
    entry += `Lately, ${dom[0]} has been the strongest feeling. `;
    if (recent.length > 0) entry += `I can't stop thinking about ${recent[0].label}.`;
    
    const journ = document.getElementById('b-journal');
    if (journ) journ.innerHTML = `<em>"${entry}"</em>`;
}

// ... existing checkSemantization logic ...
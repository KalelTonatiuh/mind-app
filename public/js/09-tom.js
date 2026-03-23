// 09-tom.js - Theory of Mind (Developmental Stages 0-7)
let tomState = { agent: null, knew: null, intent: null, label: 'none' };

function getToMDepth() {
    const omd = nodes['SOMEONE']?.expCount || 0;
    const lp = getDevStage().langProb;
    
    // Stage Gates (Wellman & Liu 2004)
    if (omd < 15) return 0; // No social modeling
    if (omd < 30) return 1; // Diverse Desires (Wants)
    if (omd < 50) return 2; // Diverse Beliefs (Thoughts)
    if (omd < 75) return 3; // Knowledge Access (Knowing vs Not Knowing)
    if (omd < 100) return 4; // False Belief (Standard ToM)
    if (omd < 130) return 5; // Hidden Emotion (Masking)
    if (omd < 160 && lp > 0.5) return 6; // Second-order (He thinks that she thinks)
    return 7; // Recursive / Subtle (Social nuance)
}

const TOM_PROFILES = {
    betrayal: { intent: 'harmful', label: 'they knew it would hurt', mod: { anger: 15, disgust: 10 } },
    kindness: { intent: 'generous', label: 'they wanted to help', mod: { trust: 12, joy: 8 } },
    judged: { intent: 'evaluative', label: 'they are watching me', mod: { fear: 10, anticipation: 8 } },
    threat: { intent: 'hostile', label: 'they want to cause harm', mod: { fear: 15, anger: 10 } },
    'given trust': { intent: 'generous', label: 'they believe in me', mod: { trust: 15, joy: 5 } }
};

const TOM_WORDS = {
    d1: ["they wanted something", "their own needs", "different wants"],
    d2: ["they think it's okay", "their version", "in their mind"],
    d3: ["they didn't know", "they were unaware", "did they see?"],
    d4: ["they believe a lie", "they're mistaken", "wrong idea"],
    d5: ["they're hiding it", "masking the feeling", "underneath the face"],
    d6: ["they think I don't know", "knowing what they think", "double layers"],
    d7: ["recursive loops", "social chess", "subtle layers"]
};

function processToM(cat) {
    const depth = getFunctionalToMDepth(); // Obeys cognitive flooding
    const profile = TOM_PROFILES[cat];
    
    if (!profile || depth === 0) {
        tomState = { agent: null, label: 'no social modeling' };
        return;
    }

    // Biased Attribution based on IWM
    let label = profile.label;
    if (IWM.otherTrust < 0.4 && r() < 0.5) {
        label = "what are they actually planning?";
        state.fear += 5;
    }

    tomState = {
        agent: cat,
        intent: profile.intent,
        depth: depth,
        label: label,
        words: TOM_WORDS[`d${Math.min(7, depth)}`] || TOM_WORDS.d1
    };

    // Apply social emotion modifications
    Object.entries(profile.mod).forEach(([emo, val]) => {
        state[emo] = Math.min(100, (state[emo] || 0) + val);
    });
}
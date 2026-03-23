// 10-defense.js - Mature vs Primitive Defense
function getDefense() {
    const [dk, dv] = dominant();
    if (dv < 50) return null;

    // FEATURE: Sublimation (Mature Defense)
    // If high anger/sadness but high competence need, turn it into work
    if (NEEDS.competence.val < 40 && (dk === 'anger' || dk === 'sadness') && dv > 70) {
        sublimate(dk);
        return { def: "Sublimation", c: "#4a9e6b" };
    }

    // FEATURE: Shadow Dynamics (Repression)
    // High fear/disgust leads to "Shadowing" a concept
    if (dk === 'disgust' && dv > 80) {
        repressShadow();
        return { def: "Repression", c: "#a84040" };
    }

    return { def: EM[dk].def, c: EM[dk].c };
}

function sublimate(emo) {
    CHEM.dopamine = Math.min(1, CHEM.dopamine + 0.4);
    NEEDS.competence.val = Math.min(100, NEEDS.competence.val + 20);
    sched({text: `pouring my ${emo} into creation...`, cls: 'need'}, 200);
}

function repressShadow() {
    // Pick the most active non-prime node and hide it
    let top = Object.values(nodes)
        .filter(n => !n.isPrime && n.activation > 0.4 && !n.isHidden)
        .sort((a,b) => b.activation - a.activation)[0];
    
    if (top) {
        top.isHidden = true; // FEATURE: Shadow node physically hidden from UI and activation
        sched({text: `I don't want to think about ${top.id.toLowerCase()}...`, cls: 'rum'}, 100);
    }
}
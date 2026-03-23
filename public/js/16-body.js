// 16-body.js - Somatic State & Clock
const BODY = {
    hunger: 10,
    fatigue: 10,
    somaticDamage: 0,
    clock: 8.0, // 0-24
    isAsleep: false
};

function updateBody() {
    // 1. Circadian Cycle (0.5 hours per tick)
    BODY.clock = (BODY.clock + 0.5) % 24;
    BODY.isAsleep = (BODY.clock > 22 || BODY.clock < 6);
    
    // Melatonin peaks in dark hours
    CHEM.melatonin = (BODY.clock > 21 || BODY.clock < 7) ? 0.8 : 0.1;

    // 2. Metabolic Decay influenced by Somatic Illness
    // High damage = faster fatigue, slower recovery
    let illnessPenalty = 1 + (BODY.somaticDamage * 2.5);
    
    if (!BODY.isAsleep) {
        BODY.hunger = Math.min(100, BODY.hunger + 1.2 * illnessPenalty);
        BODY.fatigue = Math.min(100, BODY.fatigue + 1.0 * illnessPenalty);
    } else {
        BODY.fatigue = Math.max(0, BODY.fatigue - (10 / illnessPenalty));
    }
}
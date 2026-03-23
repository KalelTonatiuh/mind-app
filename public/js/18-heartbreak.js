// 18-heartbreak.js - PDD Trauma Model (Bowlby)
const HEARTBREAK = {
    distressTimer: 0,
    stage: 'Stable', // Stable, Protest, Despair, Detached
};

function updateHeartbreak() {
    // If the mind is highly distressed (Sadness or Fear > 50)
    const isDistressed = (state.sadness > 50 || state.fear > 50);

    if (isDistressed && !BODY.isAsleep) {
        HEARTBREAK.distressTimer += 1;
    } else {
        // Recovery is much slower than the onset of trauma
        HEARTBREAK.distressTimer = Math.max(0, HEARTBREAK.distressTimer - 0.2);
    }

    // Logic Gates for Trauma Stages
    if (HEARTBREAK.distressTimer > 100) {
        HEARTBREAK.stage = 'Detached';
    } else if (HEARTBREAK.distressTimer > 60) {
        HEARTBREAK.stage = 'Despair';
    } else if (HEARTBREAK.distressTimer > 20) {
        HEARTBREAK.stage = 'Protest';
    } else {
        HEARTBREAK.stage = 'Stable';
    }

    applyHeartbreakEffects();
}

function applyHeartbreakEffects() {
    if (HEARTBREAK.stage === 'Protest') {
        // High arousal, scanning for caregiver
        state.anticipation = Math.min(100, state.anticipation + 5);
    }
    
    if (HEARTBREAK.stage === 'Despair') {
        // System shutdown to conserve energy
        BODY.fatigue = Math.min(100, BODY.fatigue + 5);
        CHEM.dopamine *= 0.8; 
        state.joy *= 0.5;
    }

    if (HEARTBREAK.stage === 'Detached') {
        // Emotional "Flatness" - inability to feel social connection
        CHEM.oxytocin = 0;
        // Physical connection to MOTHER prime is weakened in the network
        if (nodes['MOTHER']) {
            nodes['MOTHER'].activation *= 0.2;
            // High probability of forming a "Cannot Trust" schema
            if (r() < 0.1) SCHEMAS.cannotTrust.strength = Math.min(1, SCHEMAS.cannotTrust.strength + 0.05);
        }
    }
}
// 17-chemistry.js - Neurochemistry & Negativity Bias
const CHEM = {
    cortisol: 0.2,
    oxytocin: 0.2,
    dopamine: 0.5,
    serotonin: 0.5,
    melatonin: 0.0
};

function updateChemistry() {
    // 1. Dopamine/Serotonin Baselines
    const reward = (state.joy + state.anticipation) / 200;
    CHEM.dopamine = CHEM.dopamine * 0.9 + reward * 0.1;
    
    // 2. FEATURE: Negativity Bias (Gottman 5:1)
    // One bad event (Fear/Anger/Sadness) triggers 5x more cortisol than Joy triggers Oxytocin
    const stressSum = (state.fear + state.anger + state.sadness) / 300;
    const positivitySum = (state.joy + state.trust) / 200;
    
    let cortisolRise = stressSum * 0.15 * 5.0; // The 5.0 Multiplier
    let oxytocinRise = positivitySum * 0.1;
    
    // Oxytocin acts as a physical shield against Cortisol
    const shield = CHEM.oxytocin * 0.7;
    CHEM.cortisol = Math.max(0, Math.min(1, (CHEM.cortisol * 0.95) + cortisolRise - (shield * 0.05)));
    CHEM.oxytocin = Math.min(1, CHEM.oxytocin * 0.95 + oxytocinRise);

    // 3. FEATURE: Somatic Illness
    // Chronic high cortisol damages the body bars permanently
    if (CHEM.cortisol > 0.8) {
        BODY.somaticDamage = Math.min(1, (BODY.somaticDamage || 0) + 0.005);
    }
}
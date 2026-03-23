// 22-dualprocess.js - Cognitive Flooding Logic
function getCognitiveState() {
    // If Cortisol is high (> 0.7), logic is disabled (Flooding)
    if (CHEM.cortisol > 0.7) return 'Flooded';
    
    // If Fatigue is high, system 2 is weak
    if (BODY.fatigue > 85) return 'Depleted';
    
    return 'Integrated';
}

function getFunctionalToMDepth() {
    const actualDepth = getToMDepth(); // From 09-tom.js
    const state = getCognitiveState();

    if (state === 'Flooded') {
        // Regression: Under stress, you lose empathy and higher social logic
        // You can only understand "Wants" (Stage 1), not "Beliefs" (Stage 2+)
        return Math.min(1, actualDepth);
    }
    
    if (state === 'Depleted') {
        // When tired, recursive thinking (he thinks that she thinks) is too hard
        return Math.min(3, actualDepth);
    }

    return actualDepth;
}
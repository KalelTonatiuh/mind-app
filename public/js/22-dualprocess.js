// ═══════════════════════════════════════════════════════
// DUAL PROCESS THEORY (System 1 vs System 2)
// ═══════════════════════════════════════════════════════
function getCognitiveState() {
  // If Cortisol is high (> 0.7), System 2 (Logic) is disabled.
  // The Mind enters a "Flooded" state.
  if (CHEM.cortisol > 0.7) return 'Flooded';
  
  // If Fatigue is high, System 2 is weak.
  if (BODY.fatigue > 80) return 'Depleted';
  
  return 'Integrated';
}

function getFunctionalToMDepth() {
  const actualDepth = getToMDepth();
  const state = getCognitiveState();

  if (state === 'Flooded') {
    // Under extreme stress, you lose high-level social modeling.
    // You can only understand basic "Wants," not complex "Beliefs."
    return Math.min(1, actualDepth);
  }
  
  if (state === 'Depleted') {
    // When tired, you lose the energy for recursive thinking.
    return Math.min(3, actualDepth);
  }

  return actualDepth;
}
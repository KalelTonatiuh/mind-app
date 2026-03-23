// ═══════════════════════════════════════════════════════
// NEURO-CHEMISTRY & PROTEST SIGNALING
// ═══════════════════════════════════════════════════════
const CHEM = {
  dopamine: 0.5, // Reward/Learning (0-1)
  cortisol: 0.2, // Stress/Survival (0-1)
};

function updateChemistry() {
  const [dk, dv] = dominant();
  
  // 1. Dopamine: Joy and Achievement boost learning
  const rewardSignal = (state.joy + state.anticipation) / 200;
  CHEM.dopamine = CHEM.dopamine * 0.9 + rewardSignal * 0.1;

  // 2. Cortisol: Fear, Anger, and Caregiver stress keep the mind on edge
  const stressSignal = (state.fear + state.anger + (CAREGIVER.stress * 100)) / 300;
  CHEM.cortisol = CHEM.cortisol * 0.95 + stressSignal * 0.05;

  // 3. The Protest Signal (The "Cry")
  // If the mind is very sad or lonely, it "protests"
  if (state.sadness > 60 || state.fear > 60) {
    // This makes the caregiver more stressed but forces her to notice
    CAREGIVER.stress = Math.min(1, CAREGIVER.stress + 0.05);
    if (Math.random() < 0.3) {
        // Occasionally, the protest works and the caregiver responds
        applyEffects({trust: 10, joy: 5}, 'kindness', 'protest heard', true);
    }
  }

  applyChemicalEffects();
}

function applyChemicalEffects() {
  // Cortisol shrinks the Mind's capabilities
  if (CHEM.cortisol > 0.6) {
    // High stress lowers self-regulation (effortControl)
    TEMP.effortControl = Math.max(0.1, TEMP.effortControl - 0.001);
  }

  // Dopamine boosts Plasticity (the ability to learn)
  // Low dopamine makes the mind "stagnant"
}
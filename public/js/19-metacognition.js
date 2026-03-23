// ═══════════════════════════════════════════════════════
// METACOGNITION & PREDICTION ERROR
// ═══════════════════════════════════════════════════════
let lastRegulationBonus = 0;

function checkPredictionError(eventFx, eventCat) {
  // If a Secure mind gets a sudden Threat, or a Sad mind gets sudden Joy
  // the brain triggers a "Jolt" of adrenaline (Biological Noise)
  const eventValence = (eventFx.joy || eventFx.trust || 0) > (eventFx.fear || eventFx.sadness || 0) ? 1 : -1;
  const predictionMatch = NARRATIVE_SELF.valence * eventValence;

  if (predictionMatch < -0.4) {
    // PREDICTION ERROR: The world doesn't match my story.
    // Trigger a massive spike in biological noise (The Jolt)
    const jolt = 20; 
    Object.keys(state).forEach(k => {
      state[k] = Math.min(100, state[k] + (Math.random() * jolt));
    });
    // This makes the mind "shaky" for a few seconds
    CHEM.cortisol = Math.min(1, CHEM.cortisol + 0.15);
  }
}

function applyAffectLabeling(emoKey) {
  // Lieberman (2007): Putting feelings into words reduces distress.
  // If the mind is developed enough to use "High Granularity" words,
  // it gets a regulation bonus (it calms down faster).
  const gran = getGranularity(emoKey);
  
  if (gran > 0.6) {
    // The mind "names the monster," which makes it shrink.
    lastRegulationBonus = 0.08; 
  } else {
    lastRegulationBonus = 0;
  }
}
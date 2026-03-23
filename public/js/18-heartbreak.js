// ═══════════════════════════════════════════════════════
// ATTACHMENT STAGES (PDD Model - Bowlby/Robertson)
// ═══════════════════════════════════════════════════════
const HEARTBREAK = {
  distressTimer: 0,
  stage: 'Stable', // Stable -> Protest -> Despair -> Detached
};

function updateHeartbreak() {
  // If the mind is very sad, lonely, or scared
  const isDistressed = (state.sadness > 50 || state.fear > 50 || state.alone > 50);

  if (isDistressed && !BODY.isAsleep) {
    HEARTBREAK.distressTimer++;
  } else {
    // Very slow recovery if the distress stops
    HEARTBREAK.distressTimer = Math.max(0, HEARTBREAK.distressTimer - 0.5);
  }

  // Define Stages
  if (HEARTBREAK.distressTimer > 60) {
    HEARTBREAK.stage = 'Detached'; // The "System Crash"
  } else if (HEARTBREAK.distressTimer > 30) {
    HEARTBREAK.stage = 'Despair';  // Giving up
  } else if (HEARTBREAK.distressTimer > 10) {
    HEARTBREAK.stage = 'Protest';  // Crying out
  } else {
    HEARTBREAK.stage = 'Stable';
  }

  applyHeartbreakEffects();
}

function applyHeartbreakEffects() {
  if (HEARTBREAK.stage === 'Despair') {
    // Massive fatigue - the mind has no energy to think
    BODY.fatigue = Math.min(100, BODY.fatigue + 2);
    CHEM.dopamine *= 0.8; // Lose all motivation
  }

  if (HEARTBREAK.stage === 'Detached') {
    // The mind goes "Cold" to protect itself
    // It physically weakens the connection to the "MOTHER" and "TRUST" nodes
    if (nodes['MOTHER']) nodes['MOTHER'].activation *= 0.5;
    if (nodes['TRUST']) nodes['TRUST'].activation *= 0.5;
    
    // It becomes much harder to feel Joy
    state.joy *= 0.9;
    
    // If this lasts, the mind starts deleting positive schemas
    if (Math.random() < 0.1) {
       if (SCHEMAS.worthLove.strength > 0) SCHEMAS.worthLove.strength -= 0.01;
    }
  }
}
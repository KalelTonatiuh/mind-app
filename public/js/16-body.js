// ═══════════════════════════════════════════════════════
// BODY STATE & CIRCADIAN GATING
// ═══════════════════════════════════════════════════════
const BODY = {
  hunger: 10,     // 0-100
  fatigue: 10,    // 0-100
  isAsleep: false,
  cycleTick: 0    // Tracks day/night
};

function updateBody() {
  // Hunger and fatigue grow naturally over time
  BODY.hunger = Math.min(100, BODY.hunger + 1.5);
  BODY.fatigue = Math.min(100, BODY.fatigue + 1.2);
  BODY.cycleTick++;

  // 24-tick cycle (approx 1.8 minutes real time)
  // Ticks 0-15: Awake | Ticks 16-23: Asleep
  if (BODY.cycleTick > 23) BODY.cycleTick = 0;
  
  const previouslyAsleep = BODY.isAsleep;
  BODY.isAsleep = BODY.cycleTick >= 16;

  if (BODY.isAsleep) {
    // While sleeping, hunger grows slower, fatigue drops fast
    BODY.hunger -= 0.5; 
    BODY.fatigue = Math.max(0, BODY.fatigue - 8);
    
    // Boost memory processing during sleep
    for (let i = 0; i < 3; i++) {
      offlineConsolidation();
    }
  }

  applySomaticMarkers();
}

// How the body changes the mind's math
function applySomaticMarkers() {
  // If very hungry, Anger baseline rises (irritability)
  if (BODY.hunger > 70) {
    state.anger = Math.min(100, state.anger + (BODY.hunger - 70) * 0.1);
  }
  
  // If very tired, Coping ability drops (everything feels harder)
  if (BODY.fatigue > 60) {
    Object.values(SCHEMAS).forEach(s => {
      if (s.bias) {
        // High fatigue makes negative biases 20% stronger
        s.strength = Math.min(1, s.strength + 0.001);
      }
    });
  }
}
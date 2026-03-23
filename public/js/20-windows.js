// ═══════════════════════════════════════════════════════
// CRITICAL PERIODS (Neuroplasticity Windows)
// ═══════════════════════════════════════════════════════
const WINDOWS = {
  attachment: 1.0, // Window for IWM (0-150 events)
  language:   1.0, // Window for Semantic Primes (0-400 events)
};

function updateWindows() {
  // 1. Attachment Window (Bowlby/Ainsworth)
  // Closest to 1.0 in early life, drops to 0.1 (rigid) after 150 events
  if (eventCount < 150) {
    WINDOWS.attachment = 1.0 - (eventCount / 200); 
  } else {
    WINDOWS.attachment = 0.1; // The window is "closed" (earned security is slow)
  }

  // 2. Language/Concept Window
  // High plasticity for words early on, slows down significantly after 400 events
  if (eventCount < 400) {
    WINDOWS.language = 1.0 - (eventCount / 500);
  } else {
    WINDOWS.language = 0.2;
  }
}

// How much can a new event change the "Internal Working Model"?
function getAttachmentPlasticity() {
  // Oxytocin (love/safety) keeps the brain plastic
  // Even if the window is closing, high oxytocin allows for "Earned Security"
  const safetyBonus = CHEM.oxytocin * 0.3;
  return Math.min(1.0, WINDOWS.attachment + safetyBonus);
}
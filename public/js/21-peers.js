// ═══════════════════════════════════════════════════════
// PEER RELATIONSHIPS & ATTACHMENT TRANSFER
// ═══════════════════════════════════════════════════════
const PEER = {
  proximity: 0, // How close we are to a "Significant Other"
  trust: 0.5,
  isPrimary: false // Does this person replace the Caregiver?
};

function updatePeers() {
  const dev = getDevStage();
  
  // Transition starts when the Mind reaches the "Reflective" stage
  // and has experienced enough life (over 150 events)
  if (dev.name === 'Reflective' && eventCount > 150) {
    PEER.isPrimary = true;
    
    // When a Peer becomes primary, the Caregiver's state 
    // matters less, and the Peer's trust matters more.
    if (nodes['SOMEONE']) {
        nodes['SOMEONE'].activation = Math.min(1, nodes['SOMEONE'].activation + 0.2);
    }
  }
}

// This overrides the social logic for adults
function getSocialResponse() {
  if (PEER.isPrimary) {
    // Adult relationships are more "give and take"
    // If the mind is Secure, it expects Peer trust to be high
    return PEER.trust * (0.8 + IWM.selfWorth * 0.4);
  }
  return getCaregiverResponsiveness();
}
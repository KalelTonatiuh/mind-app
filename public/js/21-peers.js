// 21-peers.js - Adult Bonds & Attachment Transfer
const PEER = { proximity: 0, trust: 0.5, isPrimary: false };

function updatePeers() {
    const dev = getDevStage();
    
    // Transfer logic: once Reflective stage is reached and life experience is high
    if (dev.name === 'Reflective' && eventCount > 180) {
        if (!PEER.isPrimary) {
            PEER.isPrimary = true;
            sched({ text: "looking for connection elsewhere...", cls: 'need' }, 1000);
        }
        
        // Peer trust begins to override IWM base
        if (nodes['SOMEONE']) {
            nodes['SOMEONE'].activation = Math.min(1, nodes['SOMEONE'].activation + 0.1);
        }
    }
}

function getSocialResponse() {
    // If an adult peer is now primary, they replace the caregiver in the logic
    if (PEER.isPrimary) {
        return PEER.trust * (0.7 + IWM.selfWorth * 0.3);
    }
    return getCaregiverResponsiveness();
}
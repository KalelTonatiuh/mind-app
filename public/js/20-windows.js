// 20-windows.js - Neuroplasticity Windows
const WINDOWS = {
    attachment: 1.0, // Initial plasticity
    language: 1.0
};

function updateWindows() {
    // Attachment window closes significantly after 150 events
    if (eventCount < 150) {
        WINDOWS.attachment = 1.0 - (eventCount / 200);
    } else {
        // Window is "Hardened" but remains slightly open for Earned Security
        WINDOWS.attachment = 0.15;
    }

    // Language/Semantic window closes after 400 events
    if (eventCount < 400) {
        WINDOWS.language = 1.0 - (eventCount / 500);
    } else {
        WINDOWS.language = 0.2;
    }
}

function getAttachmentPlasticity() {
    // Oxytocin (social safety) keeps the brain plastic even in old age
    const safetyBonus = CHEM.oxytocin * 0.4;
    return Math.min(1.0, WINDOWS.attachment + safetyBonus);
}
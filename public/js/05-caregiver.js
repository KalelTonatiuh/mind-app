// 05-caregiver.js - Full Fixed Version
function generateCaregiver() {
  const gauss = () => (Math.random()+Math.random()+Math.random()+Math.random()-2)/2;
  return {
    baseWarmth:   Math.max(0.1, Math.min(1, 0.65 + gauss()*0.2)),
    consistency:  Math.max(0.1, Math.min(1, 0.6  + gauss()*0.25)),
    stressCap:    Math.max(0.2, Math.min(1, 0.5  + gauss()*0.2)),
    recoveryRate: Math.max(0.1, Math.min(1, 0.5  + gauss()*0.2)),
    stress:    0.15,
    depletion: 0.1,
    mood:      0.7,
    respondedCount:    0,
    missedCount:       0,
    totalInteractions: 0,
    introjects: ["it's okay", "i'm here", "you're fine"]
  };
}

let CAREGIVER = generateCaregiver();

// GLOBAL CONSTANT - Shared with 13-events.js
const SOCIAL_CATS = new Set(['social','comfort','warmth','caregiver','separation','alone','rejected','praise','criticism','conflict','play','kindness','given trust','betrayal','humiliation','judged']);

function receiveSignal(signal) {
    if (signal === 'cry') {
        CAREGIVER.stress = Math.min(1, CAREGIVER.stress + 0.15);
        return CAREGIVER.stress > 0.7 ? "frustrated" : "warm";
    } else if (signal === 'smile') {
        CAREGIVER.mood = Math.min(1, CAREGIVER.mood + 0.1);
        CAREGIVER.stress = Math.max(0, CAREGIVER.stress - 0.1);
        return "joyful";
    }
}

function updateCaregiver() {
  CAREGIVER.stress = Math.max(0, CAREGIVER.stress * 0.9);
  CAREGIVER.mood = Math.max(0, Math.min(1, CAREGIVER.mood * 0.95 + CAREGIVER.baseWarmth * 0.05));
}

function getCaregiverResponsiveness() {
  return Math.max(0, Math.min(1, CAREGIVER.baseWarmth - (CAREGIVER.stress * 0.5)));
}

const IWM = { selfWorth: 0.5, otherTrust: 0.5, sampleCount: 0 };

function updateIWM(responsiveness) {
  const lr = 0.1 * getAttachmentPlasticity();
  IWM.selfWorth = Math.max(0, Math.min(1, IWM.selfWorth + (responsiveness - 0.5) * lr));
  IWM.otherTrust = Math.max(0, Math.min(1, IWM.otherTrust + (responsiveness - 0.5) * lr));
  IWM.sampleCount++;
}
// ═══════════════════════════════════════════════════════
// CAREGIVER (Bowlby 1969, Ainsworth 1978, Tronick 2018)
// The primary attachment figure. Has her own state — stress,
// depletion, mood — that fluctuates independently of the infant.
// ═══════════════════════════════════════════════════════
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
  };
}

let CAREGIVER = generateCaregiver();

function updateCaregiver() {
  const stressorChance = 0.3;
  if(Math.random() < stressorChance) {
    const stressor = (Math.random() * 0.12);
    CAREGIVER.stress = Math.min(1, CAREGIVER.stress + stressor);
    CAREGIVER.depletion = Math.min(1, CAREGIVER.depletion + stressor * 0.4);
  }
  CAREGIVER.stress    = Math.max(0, CAREGIVER.stress    * (0.82 + CAREGIVER.recoveryRate * 0.1));
  CAREGIVER.depletion = Math.max(0, CAREGIVER.depletion * (0.96 + CAREGIVER.recoveryRate * 0.02));
  const moodTarget = CAREGIVER.baseWarmth * (1 - CAREGIVER.stress * 0.6);
  CAREGIVER.mood = CAREGIVER.mood * 0.85 + moodTarget * 0.15 + (Math.random()-0.5)*0.06;
  CAREGIVER.mood = Math.max(0, Math.min(1, CAREGIVER.mood));
}

function getCaregiverResponsiveness() {
  const base = CAREGIVER.baseWarmth;
  const stressImpact = CAREGIVER.stress * 0.5;
  const depletionImpact = CAREGIVER.depletion * 0.3;
  const noiseScale = (1 - CAREGIVER.consistency) * 0.4;
  const noise = (Math.random() - 0.5) * noiseScale;
  return Math.max(0, Math.min(1, base - stressImpact - depletionImpact + noise));
}

// ─── INTERNAL WORKING MODEL ───────────────────────────
// Bowlby (1969): two dimensions — self-worth + other-trust
const IWM = {
  selfWorth:  0.5,
  otherTrust: 0.5,
  sampleCount: 0,
};

function updateIWM(responsiveness) {
  const lr = Math.max(0.02, 0.15 * Math.exp(-IWM.sampleCount / 30));
  const signal = responsiveness - 0.5;
  IWM.selfWorth  = Math.max(0, Math.min(1, IWM.selfWorth  + signal * lr * 0.8));
  IWM.otherTrust = Math.max(0, Math.min(1, IWM.otherTrust + signal * lr));
  IWM.sampleCount++;
  if(responsiveness > 0.55) CAREGIVER.respondedCount++;
  else CAREGIVER.missedCount++;
  CAREGIVER.totalInteractions++;
}

// Adult IWM updates — much slower, confirmation-biased
// (Kirkpatrick & Hazan / Davila 1999, Chopik 2024)
function updateIWMFromAdultEvent(cat, caregiverResponsiveness) {
  if(IWM.sampleCount < 5) return;
  const consolidation = Math.min(1,
    (Math.abs(IWM.otherTrust - 0.5) * 2) * 0.5 +
    Math.min(IWM.sampleCount / 200, 0.5)
  );
  const lr = Math.max(0.003, 0.025 * (1 - consolidation * 0.7));
  let signal = caregiverResponsiveness - 0.5;
  const att = getAttachmentStyle();
  if(att.name === 'Anxious') {
    if(signal > 0) signal *= 0.3;
    else signal *= 1.4;
  } else if(att.name === 'Avoidant') {
    signal *= 0.2;
  } else if(att.name === 'Disorganized') {
    signal += (Math.random() - 0.5) * 0.3;
  }
  IWM.selfWorth  = Math.max(0, Math.min(1, IWM.selfWorth  + signal * lr * 0.8));
  IWM.otherTrust = Math.max(0, Math.min(1, IWM.otherTrust + signal * lr));
  IWM.sampleCount++;
}

// Derive attachment style from IWM (Ainsworth 1978)
function getAttachmentStyle() {
  const w = IWM.selfWorth;
  const t = IWM.otherTrust;
  const n = IWM.sampleCount;
  if(n < 5) return { name:'Forming', desc:'too early to tell', color:'#666' };
  if(w > 0.55 && t > 0.55) return { name:'Secure',      desc:'safe base established',        color:'#4a9e6b' };
  if(w < 0.45 && t > 0.5)  return { name:'Anxious',     desc:'hypervigilant, escalates',      color:'#d4a020' };
  if(w > 0.5  && t < 0.4)  return { name:'Avoidant',    desc:'needs suppressed, self-reliant', color:'#5b7fc4' };
  if(w < 0.4  && t < 0.4)  return { name:'Disorganized',desc:'no coherent strategy',           color:'#a84040' };
  return { name:'Insecure', desc:'mixed signals', color:'#888' };
}

const SOCIAL_CATS = new Set(['social','comfort','warmth','caregiver','separation','alone','rejected','praise','criticism','conflict','play']);

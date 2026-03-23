// ═══════════════════════════════════════════════════════
// TEMPERAMENT (Kagan 1994, Rothbart 2004, Thomas & Chess 1977)
// Constitutional parameters set at birth. Not learned.
// Individual variance — each mind gets different values.
// ═══════════════════════════════════════════════════════
function generateTemperament() {
  const gauss = () => (Math.random()+Math.random()+Math.random()+Math.random()-2)/2;
  return {
    negAffect:     Math.max(0, Math.min(1, 0.5 + gauss()*0.25)),
    surgency:      Math.max(0, Math.min(1, 0.5 + gauss()*0.25)),
    effortControl: Math.max(0, Math.min(1, 0.5 + gauss()*0.25)),
    orientSens:    Math.max(0, Math.min(1, 0.5 + gauss()*0.25)),
    noiseFloor:    Math.max(0.02, Math.min(0.12, 0.05 + gauss()*0.02)),
  };
}

let TEMP = generateTemperament();

// Apply temperament to base emotion effects
function applyTemperament(fx) {
  const out = {...fx};
  const inhibScale = 0.7 + TEMP.negAffect * 0.6;
  if(out.fear)    out.fear    *= inhibScale;
  if(out.sadness) out.sadness *= inhibScale;
  if(out.disgust) out.disgust *= (0.8 + TEMP.negAffect * 0.4);
  const frustScale = 0.6 + (1 - TEMP.effortControl) * 0.7;
  if(out.anger) out.anger *= frustScale;
  const posScale = 0.7 + TEMP.surgency * 0.6;
  if(out.joy)          out.joy          *= posScale;
  if(out.anticipation) out.anticipation *= posScale;
  if(out.trust)        out.trust        *= (0.8 + TEMP.surgency * 0.4);
  if(out.surprise) out.surprise *= (0.6 + TEMP.orientSens * 0.8);
  return out;
}

// Biological noise — spontaneous neural activity
// (Raichle 2010, Fox & Raichle 2007)
function addBiologicalNoise() {
  const baseNoise = TEMP.noiseFloor;
  const networkRichness = Math.min(1, Object.values(nodes).filter(n=>n.expCount>0).length / 80);
  const noise = baseNoise * (0.5 + networkRichness * 0.5);
  Object.values(nodes).forEach(n => {
    const bias = n.expCount > 0 ? 0.15 + networkRichness * 0.1 : 0.03;
    if(Math.random() < noise * bias) {
      n.activation = Math.min(1, n.activation + Math.random() * noise * 0.35);
    }
  });
  Object.keys(state).forEach(k => {
    const drift = (Math.random()-0.5) * noise * 6;
    const negBias = ['fear','sadness','disgust'].includes(k) ? TEMP.negAffect * 0.5 : 0;
    const posBias = ['joy','trust','anticipation'].includes(k) ? TEMP.surgency * 0.3 : 0;
    state[k] = Math.max(0, Math.min(100, state[k] + drift + negBias - posBias * 0.5));
  });
}

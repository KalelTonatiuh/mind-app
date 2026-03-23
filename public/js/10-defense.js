// ═══════════════════════════════════════════════════════
// DEFENSE MECHANISMS (Cramer 2015, Vaillant 1992)
// Defenses used repeatedly become characteristic style.
// Attachment style biases initial selection.
// ═══════════════════════════════════════════════════════
const DEFENSE_USAGE = {
  'Repression':          0,
  'Denial':              0,
  'Reaction formation':  0,
  'Regression':          0,
  'Compensation':        0,
  'Projection':          0,
  'Displacement':        0,
  'Intellectualization': 0,
};

function getAttachmentDefenseBias() {
  const att = getAttachmentStyle();
  const biases = {
    'Secure':       { 'Compensation':0.3, 'Denial':0.1, 'Displacement':0.1 },
    'Avoidant':     { 'Repression':0.6, 'Intellectualization':0.5, 'Denial':0.4 },
    'Anxious':      { 'Projection':0.5, 'Displacement':0.4, 'Reaction formation':0.4 },
    'Disorganized': { 'Regression':0.4, 'Projection':0.3, 'Repression':0.3 },
    'Insecure':     { 'Displacement':0.3, 'Repression':0.2 },
    'Forming':      {},
  };
  return biases[att.name] || {};
}

function selectDefense(dominantEmoKey, intensity) {
  if(intensity < 55) return null;
  const allDefenses = Object.keys(DEFENSE_USAGE);
  const attachBias = getAttachmentDefenseBias();
  const emotionDefault = EM[dominantEmoKey]?.def;
  const weights = {};
  allDefenses.forEach(def => {
    let w = 0.5;
    const uses = DEFENSE_USAGE[def];
    w += uses * 0.15;
    if(attachBias[def]) w += attachBias[def];
    if(def === emotionDefault) w += 0.8;
    weights[def] = Math.max(0, w);
  });
  const total = Object.values(weights).reduce((a,b)=>a+b, 0);
  let rand = Math.random() * total;
  for(const [def, w] of Object.entries(weights)) {
    rand -= w;
    if(rand <= 0) {
      DEFENSE_USAGE[def]++;
      const em = Object.values(EM).find(e=>e.def===def) || EM[dominantEmoKey];
      return { def, dd: em?.dd || '', c: em?.c || '#888', key: dominantEmoKey };
    }
  }
  DEFENSE_USAGE[emotionDefault]++;
  return { def: emotionDefault, dd: EM[dominantEmoKey]?.dd||'', c: EM[dominantEmoKey]?.c||'#888', key: dominantEmoKey };
}

function getDefense(){const[k,v]=dominant();return selectDefense(k,v);}

function applyDefense(def,text){
  switch(def){
    case 'Repression':          return text.split(/\s+/).slice(0,~~(text.split(/\s+/).length*0.6)).join(' ')+'—';
    case 'Displacement':        return text+' '+p(['the light in here','something else','never mind']);
    case 'Projection':          return text.replace(/\bi\b/g,'they').replace(/\bmy\b/g,'their');
    case 'Denial':              return p(['fine','it\'s fine','not happening','completely fine']);
    case 'Intellectualization': return p(['probably just','objectively,','the pattern here is'])+' '+text;
    case 'Regression':          return p(['don\'t want to','make it stop','too much'])+' '+text.split(/\s+/).slice(0,2).join(' ');
    case 'Compensation':        return text+' '+p(['work harder','prove it','show them']);
    case 'Reaction formation':  return p(['fine actually','don\'t care','glad, even','not bothered']);
    default:return text;
  }
}

// ═══════════════════════════════════════════════════════
// DEVELOPMENTAL DENSITY FUNCTIONS
// Language, social, other-model, episodic cluster densities
// ═══════════════════════════════════════════════════════
function getSocialDensity() {
  const social = ['SOMEONE','MOTHER','FATHER','FACE','PEOPLE','NAME'];
  return social.reduce((s,id) => s + (nodes[id]?.expCount||0), 0);
}

function getLangDensity() {
  const langNodes = ['WORDS','SAY','SOUND','HEAR','NAME'];
  const socialNodes = ['SOMEONE','MOTHER','FATHER','PEOPLE'];
  const langExp = langNodes.reduce((s,id) => s+(nodes[id]?.expCount||0), 0);
  const socExp  = socialNodes.reduce((s,id) => s+(nodes[id]?.expCount||0), 0);
  return Math.min(langExp, socExp) * 0.5 + Math.max(0, langExp - socExp) * 0.1;
}

function getOtherModelDensity() {
  const otherNodes = ['SOMEONE','OTHER','PEOPLE','THINK','WANT','FEEL'];
  return otherNodes.reduce((s,id) => s+(nodes[id]?.expCount||0), 0);
}

function getEpisodicClusterDensity() {
  const counts = {};
  episodicMemory.forEach(ep => {
    const key = ep.emo + ':' + ep.label.split(' ')[0];
    counts[key] = (counts[key]||0) + 1;
  });
  return Object.values(counts).filter(c=>c>=2).length;
}

function getLangProbability() {
  const ld = getLangDensity();
  return 1 / (1 + Math.exp(-(ld - 60) / 20));
}

function getSchemaFormationActive() {
  return getEpisodicClusterDensity() >= 1;
}

function getToMBasicActive() {
  return getOtherModelDensity() >= 15;
}

function getToMFullActive() {
  return getLangProbability() > 0.35 && getOtherModelDensity() >= 60;
}

function getDevStage() {
  const lp = getLangProbability();
  const tomB = getToMBasicActive();
  const tomF = getToMFullActive();

  let name, desc;
  if (lp < 0.08)       { name='Pre-verbal';  desc='sensation only'; }
  else if (lp < 0.25)  { name='Pre-verbal';  desc='concepts forming, no language yet'; }
  else if (lp < 0.50)  { name='Emerging';    desc='language beginning to form'; }
  else if (!tomB)      { name='Pre-social';  desc='language active, no other-modeling yet'; }
  else if (!tomF)      { name='Social';      desc='modeling desires and intents'; }
  else                 { name='Reflective';  desc='full theory of mind active'; }

  return {
    name, desc,
    langProb:   lp,
    schemaActive: getSchemaFormationActive(),
    tomBasic:   tomB,
    tomFull:    tomF,
    langActive: lp > 0.15,
    tomActive:  tomB,
    langDensity: getLangDensity(),
    socialDensity: getSocialDensity(),
  };
}

// ═══════════════════════════════════════════════════════
// EMOTIONAL GRANULARITY (Barrett 2004, Kashdan et al. 2015)
// ═══════════════════════════════════════════════════════
const GRANULARITY_NODES = {
  fear:        ['PAIN','BAD','DONTWANT','MAYBE','BODY','FAR','HAPPEN','NOT'],
  sadness:     ['PAIN','BAD','FAR','BEFORE','SOMEONE','DONTWANT','FEEL','LONGTIME'],
  anger:       ['BAD','DO','NOT','WANT','SOMEONE','DONTWANT','HAPPEN','OTHER'],
  joy:         ['GOOD','WANT','NOW','FEEL','HERE','NEAR','LIVE','DO'],
  trust:       ['GOOD','SOMEONE','NEAR','FEEL','WANT','KNOW','TRUE'],
  disgust:     ['BAD','NOT','DONTWANT','BODY','SOMEONE','FEEL','HAPPEN'],
  anticipation:['WANT','MAYBE','AFTER','HAPPEN','FEEL','CAN','DO','IF'],
  surprise:    ['HAPPEN','NOW','MAYBE','NOT','FEEL','NEAR','HEAR'],
};

function getGranularity(emoKey) {
  const nodeIds = GRANULARITY_NODES[emoKey] || [];
  if(!nodeIds.length) return 0.2;
  const totalExp = nodeIds.reduce((s,id) => s + (nodes[id]?.expCount||0), 0);
  const maxExp = nodeIds.length * 30;
  const base = Math.min(1, totalExp / maxExp);
  const negEmos = ['fear','sadness','anger','disgust'];
  const posEmos = ['joy','trust','anticipation'];
  let tempBoost = 0;
  if(negEmos.includes(emoKey)) tempBoost = TEMP.negAffect * 0.2;
  if(posEmos.includes(emoKey)) tempBoost = TEMP.surgency * 0.2;
  const orientBoost = TEMP.orientSens * 0.1;
  return Math.min(1, base + tempBoost + orientBoost);
}

const GRANULAR_VOCAB = {
  fear: [
    ['something wrong','bad','not right','wait','stop'],
    ['scared','afraid','what if something','danger','threat','not safe','the fear'],
    ['the specific dread of this','what i can\'t control here','the kind of fear that watches','anticipatory dread','the thing i can\'t unsee'],
  ],
  sadness: [
    ['bad','heavy','not good','gone','—'],
    ['sad','the loss','what\'s missing','grief','it hurts','alone in this','that kind of empty'],
    ['the kind of tired that isn\'t about sleep','what absence feels like','grief that doesn\'t announce itself','the weight of what\'s not there','mourning without a name for it'],
  ],
  anger: [
    ['wrong','bad','no','stop','not okay'],
    ['angry','it\'s not right','they shouldn\'t','unfair','this shouldn\'t happen'],
    ['the specific injustice of this','cold controlled fury','the anger that knows exactly what it\'s about','righteous and focused','not rage — just clarity about the wrong'],
  ],
  joy: [
    ['good','yes','okay','here','fine'],
    ['happy','this is good','glad','warm','something right'],
    ['the particular warmth of this moment','lightness that doesn\'t need a reason','quiet satisfaction','the kind of okay that\'s actually everything','joy that just is'],
  ],
  trust: [
    ['okay','safe','good','fine'],
    ['safe with them','trust this','they\'re here','this is solid'],
    ['the specific safety of being known','trusting not because of proof but pattern','the ease of not having to perform','genuine — not performed safety'],
  ],
  disgust: [
    ['wrong','bad','no','yuck','not right'],
    ['disgusting','this is wrong','contaminated','shouldn\'t be','revolting'],
    ['moral revulsion distinct from fear','the deep wrongness that touches identity','not just unpleasant — fundamentally off','visceral rejection of what this is'],
  ],
  anticipation: [
    ['waiting','maybe','if','when','soon'],
    ['looking forward','or dreading','anticipating','readying','something coming'],
    ['the specific tension of not-yet','alert to what\'s coming without knowing its shape','readiness that isn\'t certainty','the forward lean of wanting'],
  ],
  surprise: [
    ['what','wait','oh','—','huh'],
    ['didn\'t expect this','surprising','sudden','not what i thought','strange'],
    ['the disorientation of a broken expectation','reality updating faster than the model','the specific strangeness of being wrong about something familiar'],
  ],
};

function getGranularVocab(emoKey, granularity) {
  const tiers = GRANULAR_VOCAB[emoKey];
  if(!tiers) return null;
  const langProb = getLangProbability();
  if(langProb < 0.2 || granularity < 0.15) return tiers[0];
  if(granularity < 0.5) return [...tiers[0], ...tiers[1]];
  if(granularity < 0.8) return [...tiers[1], ...tiers[2]];
  return tiers[2];
}

function getGranularityRegulationBonus(emoKey) {
  const g = getGranularity(emoKey);
  return g * 0.04;
}

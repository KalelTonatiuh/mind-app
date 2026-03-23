// ═══════════════════════════════════════════════════════
// THEORY OF MIND — DEVELOPMENTAL STAGES
// Wellman & Liu (2004): DD > DB > KA > FB > HE sequence
// Perner & Wimmer (1985): second-order ~age 8
// Valle et al. (2015): third-order through adolescence
// ═══════════════════════════════════════════════════════
let tomState=null;

function getToMDepth() {
  const omd = getOtherModelDensity();
  const lp  = getLangProbability();
  if(omd < 15)  return 0;
  if(omd < 25)  return 1;
  if(omd < 40)  return 2;
  if(omd < 60)  return 3;
  if(omd < 80)  return 4;
  if(omd < 110) return 5;
  if(omd < 150 && lp > 0.5) return 6;
  if(lp > 0.75) return 7;
  return Math.min(6, Math.floor(omd / 25));
}

const TOM_PROFILES={
  betrayal:    {agent:'the person who betrayed',   knew:true,  intent:'harmful',   label:'they knew exactly what they were doing',    emotionMod:{anger:+15,disgust:+10}},
  humiliation: {agent:'the person who humiliated', knew:true,  intent:'harmful',   label:'they chose to do that in front of everyone',emotionMod:{anger:+12,disgust:+8}},
  judged:      {agent:'the people watching',       knew:false, intent:'evaluative',label:'they\'re forming a picture of me right now', emotionMod:{fear:+10,anticipation:+8}},
  kindness:    {agent:'the stranger',              knew:false, intent:'generous',  label:'they didn\'t have to do that',               emotionMod:{trust:+12,surprise:+6}},
  'given trust':{agent:'the person who trusted',  knew:true,  intent:'generous',  label:'they chose me specifically',                 emotionMod:{trust:+10,joy:+8}},
  threat:      {agent:'the threat',               knew:false, intent:'impersonal',label:'it doesn\'t know i exist',                   emotionMod:{fear:+8}},
  achievement: {agent:null,knew:null,intent:null,label:'no other agent',emotionMod:{}},
  failure:     {agent:null,knew:null,intent:null,label:'circumstances',emotionMod:{}},
  alone:       {agent:null,knew:null,intent:null,label:'absence',emotionMod:{}},
  morning:     {agent:null,knew:null,intent:null,label:'—',emotionMod:{}},
  sudden:      {agent:null,knew:null,intent:null,label:'—',emotionMod:{}},
};

const TOM_WORDS={
  d1_harmful:   ['they wanted something i didn\'t','they needed this to go differently','their wants aren\'t mine'],
  d1_generous:  ['they wanted to help','something in them needed to give this'],
  d1_evaluative:['they\'re looking for something specific','what they want to see'],
  d1_impersonal:['no one wanted this','it just happened'],
  d2_harmful:   ['they see it differently than i do','they think this is okay','their version of this'],
  d2_generous:  ['they think this matters','they believe this helps'],
  d2_evaluative:['what they think they see','their idea of what\'s happening'],
  d2_impersonal:['this happened regardless of what anyone thought'],
  d3_harmful:   ['they knew','they didn\'t know','could they have known'],
  d3_generous:  ['they didn\'t know what it meant to me','they couldn\'t have known'],
  d3_evaluative:['they don\'t have the full picture','what they don\'t know'],
  d3_impersonal:['no one knew this was coming'],
  harmful_knew:    ['they knew','they chose this','they saw me and decided','they wanted this'],
  harmful_unkn:    ['did they know','did they mean to','maybe they didn\'t'],
  generous_knew:   ['they chose to','they didn\'t have to','they saw me'],
  generous_unkn:   ['they didn\'t know what that meant','just like that'],
  evaluative:      ['what do they think','they\'re deciding','what they see'],
  impersonal:      ['it doesn\'t care','no one chose this','just circumstance'],
  d5_harmful:   ['what they showed wasn\'t what they felt','underneath that','they were hiding something'],
  d5_generous:  ['what they showed was real','they meant it','underneath — warmth'],
  d5_evaluative:['what\'s behind that expression','what they\'re not showing'],
  d5_mask:      ['they masked it','what they were covering','the face they put on'],
  d6_harmful:   ['they think i think it was an accident','they know i know','they wanted me to think'],
  d6_generous:  ['they thought i needed it','they knew what i\'d feel','they read it correctly'],
  d6_evaluative:['they think i don\'t see them watching','they think i\'m not aware'],
  d7_any:       ['she thinks he thinks i don\'t know','they think i think they don\'t see','layered'],
};

function biasedToMAttribution(profile, depth) {
  if(!profile || !profile.agent) return profile;
  const out = {...profile};
  if(IWM.sampleCount >= 5) {
    const trustDeficit = 0.5 - IWM.otherTrust;
    if(trustDeficit > 0.15 && profile.intent === 'generous') {
      if(Math.random() < trustDeficit * 0.6) {
        out.label = depth >= 5 ? 'what are they hiding behind this' : 'why would they do that';
        out.emotionMod = {...profile.emotionMod, trust: (profile.emotionMod.trust||0) * 0.4, anticipation: +6};
      }
    }
    if(trustDeficit > 0.2 && profile.intent === 'evaluative') {
      out.emotionMod = {...profile.emotionMod, fear: (profile.emotionMod.fear||0) + trustDeficit * 20};
    }
  }
  const cantTrust = SCHEMAS.cannotTrust?.strength || 0;
  if(cantTrust > 0.4 && profile.intent !== 'harmful' && Math.random() < cantTrust * 0.5) {
    out.label = 'what they\'re actually after';
    out.emotionMod = {...out.emotionMod, fear: (out.emotionMod.fear||0) + 8, trust: (out.emotionMod.trust||0) - 10};
  }
  if(depth >= 5) {
    const worthless = SCHEMAS.worthless?.strength || 0;
    if(worthless > 0.5 && profile.intent === 'generous' && Math.random() < worthless * 0.4) {
      out.label = 'they\'re being kind but it feels like pity';
      out.emotionMod = {...out.emotionMod, sadness: +8, disgust: +4};
    }
  }
  return out;
}

function getToMWords(profile, depth) {
  if(!profile) return null;
   const functionalDepth = getFunctionalToMDepth(); 
  depth = functionalDepth; 
  const intent = profile.intent || 'impersonal';
  const knew = profile.knew;
  if(depth >= 7) return TOM_WORDS.d7_any;
  if(depth >= 6) return TOM_WORDS[`d6_${intent}`] || TOM_WORDS.d6_evaluative;
  if(depth >= 5) return knew ? TOM_WORDS[`d5_${intent}`] : TOM_WORDS.d5_mask;
  if(depth >= 4) {
    if(intent==='harmful') return knew?TOM_WORDS.harmful_knew:TOM_WORDS.harmful_unkn;
    if(intent==='generous') return knew?TOM_WORDS.generous_knew:TOM_WORDS.generous_unkn;
    if(intent==='evaluative') return TOM_WORDS.evaluative;
    return TOM_WORDS.impersonal;
  }
  if(depth >= 3) return TOM_WORDS[`d3_${intent}`] || TOM_WORDS.d3_impersonal;
  if(depth >= 2) return TOM_WORDS[`d2_${intent}`] || TOM_WORDS.d2_impersonal;
  if(depth >= 1) return TOM_WORDS[`d1_${intent}`] || TOM_WORDS.d1_impersonal;
  return null;
}

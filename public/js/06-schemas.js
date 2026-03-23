// ═══════════════════════════════════════════════════════
// SCHEMAS (Young 1994, 2003; Beck 1976)
// Core beliefs formed from repeated experience.
// Highly resistant to change once consolidated.
// ═══════════════════════════════════════════════════════
const SCHEMAS={
  notSafe:       {label:'I am not safe',           strength:0,valence:-1,color:'#a82c2c',
                  age:0, formationCount:0,
                  bias:{fear:{at:+.3,co:-.3},anticipation:{at:+.2}},
                  confirms:['threat','betrayal','humiliation','failure','alone'],
                  disconfirms:['kindness','given trust','achievement'],
                  amplifies:{fear:1.4,anger:1.2},
                  schemaWords:['again','knew it','never safe','always the same']},
  notEnough:     {label:'I am not enough',          strength:0,valence:-1,color:'#4d6b98',
                  age:0, formationCount:0,
                  bias:{joy:{pl:-.2,co:-.1},sadness:{ce:+.1},anticipation:{co:-.2}},
                  confirms:['failure','humiliation','judged'],
                  disconfirms:['achievement','given trust','kindness'],
                  amplifies:{sadness:1.5,fear:1.2},
                  schemaWords:['never enough','too much','of course','always']},
  worthless:     {label:'I am worthless',           strength:0,valence:-1,color:'#7258ab',
                  age:0, formationCount:0,
                  bias:{joy:{pl:-.3},trust:{pl:-.2,co:-.2},sadness:{ce:+.2,co:-.1}},
                  confirms:['humiliation','betrayal','failure','alone'],
                  disconfirms:['achievement','kindness','given trust'],
                  amplifies:{sadness:1.6,disgust:1.3},
                  schemaWords:['what did i expect','nobody','of course','never did']},
  worldDangerous:{label:'World is dangerous',       strength:0,valence:-1,color:'#30755a',
                  age:0, formationCount:0,
                  bias:{fear:{at:+.25,ce:+.2},trust:{pl:-.2,co:-.2}},
                  confirms:['threat','betrayal','sudden'],
                  disconfirms:['morning','kindness','given trust'],
                  amplifies:{fear:1.5,anticipation:1.3},
                  schemaWords:['of course','always something','never lasts','knew it']},
  cannotTrust:   {label:'Others can\'t be trusted', strength:0,valence:-1,color:'#7258ab',
                  age:0, formationCount:0,
                  bias:{trust:{pl:-.3,co:-.3},disgust:{ce:+.15}},
                  confirms:['betrayal','humiliation','judged'],
                  disconfirms:['kindness','given trust'],
                  amplifies:{disgust:1.4,anger:1.3},
                  schemaWords:['of course they did','never trust','again']},
  capable:       {label:'I am capable',             strength:0,valence:+1,color:'#3a8a5e',
                  age:0, formationCount:0,
                  bias:{joy:{co:+.2},anticipation:{co:+.2,sa:+.1}},
                  confirms:['achievement','given trust'],
                  disconfirms:['failure','humiliation'],
                  amplifies:{joy:1.3,anticipation:1.2},
                  schemaWords:['i can do this','ready','yes','got it']},
  worthLove:     {label:'I am worthy of love',      strength:0,valence:+1,color:'#c4911a',
                  age:0, formationCount:0,
                  bias:{trust:{pl:+.2,co:+.1},joy:{pl:+.15}},
                  confirms:['kindness','given trust'],
                  disconfirms:['betrayal','alone','humiliation'],
                  amplifies:{trust:1.3,joy:1.2},
                  schemaWords:['they mean it','this is real','for me']},
};

function conditionSchemas(cat,emoState) {
  const dev=getDevStage();
  if(!dev.schemaActive) return;

  Object.values(SCHEMAS).forEach(s=>{
    if(s.strength > 0.05) s.age++;

    if(s.confirms.includes(cat)){
      const intensity = Math.max(...Object.keys(s.amplifies||{}).map(e=>emoState[e]||0))/100;
      const rawGain = 0.05 + intensity * 0.07;
      const isEarly = s.formationEvent && s.formationEvent < 20;
      let confirmResistance = 1.0;
      if(s.strength > 0.5) confirmResistance += (s.strength - 0.5) * 1.2;
      if(s.age > 60)       confirmResistance += Math.min(s.age / 150, 0.8);
      if(isEarly)          confirmResistance *= 0.6;
      const gain = rawGain / confirmResistance;
      s.strength = Math.min(1, s.strength + gain);
      s.formationCount++;
      if(!s.formationEvent && s.strength > 0.2) s.formationEvent = eventCount;
    }

    if(s.disconfirms.includes(cat)){
      const isEarly = s.formationEvent && s.formationEvent < 20;
      let resistance = 1.0;
      resistance += s.strength * 1.5;
      resistance += Math.min(s.age / 100, 1.0);
      if(isEarly) resistance *= 1.8;
      const change = 0.04 / resistance;
      s.strength = Math.max(0, s.strength - change);
    }

    if(s.strength > 0.1 && s.amplifies){
      const activation = Object.keys(s.amplifies)
        .reduce((sum,e) => sum + (emoState[e]||0), 0) / 100;
      if(activation > 0.4){
        const maintenanceGain = 0.008 * s.strength * (activation - 0.4);
        s.strength = Math.min(1, s.strength + maintenanceGain);
      }
    }
  });
}

function applySchemaAmplification(fx) {
  const out={...fx};
  Object.values(SCHEMAS).forEach(s=>{
    if(s.strength<0.1||!s.amplifies)return;
    Object.entries(s.amplifies).forEach(([e,m])=>{if(out[e])out[e]=out[e]+out[e]*(m-1)*s.strength;});
  });
  return out;
}

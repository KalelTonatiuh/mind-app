// ═══════════════════════════════════════════════════════
// PSYCHOLOGICAL NEEDS (Deci & Ryan SDT 2000)
// Autonomy, competence, relatedness — universal basic needs.
// ═══════════════════════════════════════════════════════
const NEEDS={
  autonomy:    {val:50,label:'Autonomy',   color:'#bc5c14',
    satisfies:['achievement','morning','given trust'],
    frustrates:['judged','humiliation','threat'],
    emotionWhenFrustrated:{fear:+8,anger:+10},
    emotionWhenSatisfied:{joy:+6,anticipation:+5}},
  competence:  {val:50,label:'Competence', color:'#3a8a5e',
    satisfies:['achievement','given trust'],
    frustrates:['failure','humiliation'],
    emotionWhenFrustrated:{sadness:+10,fear:+6},
    emotionWhenSatisfied:{joy:+8,trust:+4}},
  relatedness: {val:50,label:'Relatedness',color:'#4d6b98',
    satisfies:['kindness','given trust','achievement'],
    frustrates:['betrayal','alone','humiliation'],
    emotionWhenFrustrated:{sadness:+12,anger:+6},
    emotionWhenSatisfied:{trust:+8,joy:+5}},
};

function applyNeedEffects(cat,fx) {
  const needChanges={};
  Object.entries(NEEDS).forEach(([key,need])=>{
    if(need.satisfies.includes(cat)){
      const d=8+Math.random()*6;
      need.val=Math.min(100,need.val+d);
      needChanges[key]=+d;
      Object.entries(need.emotionWhenSatisfied).forEach(([e,v])=>fx[e]=(fx[e]||0)+v);
    }
    if(need.frustrates.includes(cat)){
      const d=10+Math.random()*8;
      need.val=Math.max(0,need.val-d);
      needChanges[key]=-d;
      Object.entries(need.emotionWhenFrustrated).forEach(([e,v])=>fx[e]=(fx[e]||0)+v);
    }
  });
  return needChanges;
}

// ═══════════════════════════════════════════════════════
// SEMANTIC DOMAIN POOLS (for thought generation)
// ═══════════════════════════════════════════════════════
const D={
  focal_threat:  ['it','the sound','where','what\'s out there','the space','how close'],
  focal_neutral: ['it','this','that','something','the feeling','everything','all of it'],
  focal_pleasant:['this','right here','this moment','all of it'],
  body:          ['chest','throat','hands','breath','jaw','stomach','back of neck','face','pulse','eyes','legs'],
  other_subj:    ['they','them','this person','people','everyone','no one'],
  self_hi_cope:  ['i','whether i can','what i can do','i need to','i can'],
  self_lo_cope:  ['i','i can\'t','i don\'t','i won\'t','i never'],
  loss_ref:      ['it','what was there','what\'s gone','that','before'],
  cert_low:      ['if','what if','unless','maybe','or','—'],
  cope_hi:       ['need to','have to','want to','going to','will','can','keep'],
  cope_lo:       ["can't","won't","don't","never","not"],
  cope_mid:      ['might','could','might not','not sure if i can'],
  scenario:      ['what if','if it','when it','once','before','not yet','still'],
  bare_neg:      ['no','stop','not this','away','wrong','gone','never','—'],
  bare_pos:      ['yes','okay','good','enough','here','now','—'],
  bare_uncertain:['wait','—','or','if','what'],
};

// ═══════════════════════════════════════════════════════
// SPONTANEOUS ATTACHMENT-DRIVEN THOUGHTS
// ═══════════════════════════════════════════════════════
const SPONTANEOUS_POOLS = {
  anxious_vigilance: [
    'are they still there','what if they don\'t come back',
    'did i say something wrong','they haven\'t responded',
    'what if this is the last time','maybe they\'re tired of me',
    'i should check','why is it quiet','something feels off',
    'what if i pushed them away','they seemed distant',
    'i need to know they\'re okay with me',
  ],
  anxious_rumination: [
    'i keep thinking about it','it keeps coming back',
    'what did i do','why did that happen',
    'if i had said something different','i can\'t stop',
    'it replays','over and over','why','what if',
    'i should have','i shouldn\'t have',
  ],
  anxious_worstcase: [
    'what if it ends','what if they leave',
    'i couldn\'t handle that','what if i\'m too much',
    'what if they find someone better','what if i\'m alone',
    'worst case','if it goes wrong','what then',
  ],
  avoidant_detach: [
    'fine','doesn\'t matter','—',
    'don\'t need this','better alone','cleaner this way',
    'not thinking about it','moving on',
  ],
  disorganized_flood: [
    'don\'t go','but don\'t stay','—',
    'i want','i don\'t','both','neither',
    'something\'s wrong','not sure what','everything',
  ],
  secure_background: [
    'okay','here','this is fine','—',
    'present','grounded','enough',
  ],
  schema_intrusion: [
    'never safe','knew it','again','always the same',
    'not enough','of course','never did','what did i expect',
  ],
};

function generateSpontaneousThoughts() {
  const dev = getDevStage();
  if(dev.langProb < 0.25) return;
  if(thoughtQ.length > 0) return;

  const att = getAttachmentStyle();
  const [dk, dv] = dominant();
  let pool = null;
  let prob = 0;
  let cls = 'need';

  if(att.name === 'Anxious') {
    const relNeed = NEEDS.relatedness.val;
    const negEmo = (state.fear||0) + (state.sadness||0) + (state.anger||0);
    prob = 0.25 + (50 - relNeed) / 200 + negEmo / 800;
    if(dv > 50 && ['fear','sadness'].includes(dk)) {
      pool = Math.random() < 0.5
        ? SPONTANEOUS_POOLS.anxious_vigilance
        : SPONTANEOUS_POOLS.anxious_rumination;
    } else if(Math.random() < 0.3) {
      pool = SPONTANEOUS_POOLS.anxious_worstcase;
    } else {
      pool = SPONTANEOUS_POOLS.anxious_vigilance;
    }
    cls = 'need';
  } else if(att.name === 'Avoidant') {
    const relNeed = NEEDS.relatedness.val;
    prob = relNeed < 20 ? 0.08 : 0.02;
    pool = SPONTANEOUS_POOLS.avoidant_detach;
    cls = '';
  } else if(att.name === 'Disorganized') {
    prob = Math.random() < 0.5 ? 0.3 : 0.02;
    pool = SPONTANEOUS_POOLS.disorganized_flood;
    cls = 'rum';
  } else if(att.name === 'Secure') {
    prob = 0.06;
    pool = SPONTANEOUS_POOLS.secure_background;
    cls = '';
  } else {
    prob = 0.08;
    pool = SPONTANEOUS_POOLS.anxious_vigilance;
    cls = 'need';
  }

  const schemaBoost = (SCHEMAS.cannotTrust?.strength||0) * 0.15
                    + (SCHEMAS.notSafe?.strength||0)    * 0.12;
  prob = Math.min(0.6, prob + schemaBoost);

  if(pool && Math.random() < prob) {
    const useSchema = schemaBoost > 0.1 && Math.random() < schemaBoost * 0.4;
    const text = useSchema ? p(SPONTANEOUS_POOLS.schema_intrusion) : p(pool);
    sched({text, cls, tag:null, defKey:null, defColor:null},
      200 + ~~(Math.random() * 600));
  }
}

// ═══════════════════════════════════════════════════════
// THOUGHT QUEUE
// ═══════════════════════════════════════════════════════
let thoughtQ=[],thoughtTimer=null;
function sched(data,delay){thoughtQ.push({data,delay});if(!thoughtTimer)drain();}
function drain(){if(!thoughtQ.length){thoughtTimer=null;return;}const item=thoughtQ.shift();thoughtTimer=setTimeout(()=>{push(item.data);drain();},item.delay);}
function push({text, cls, tag, defKey, defColor}) {
  const stream = document.getElementById('stream');
  const now = new Date();
  const ts = now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');
  
  const div = document.createElement('div');
  // cls will be 'nv', 'sem', 'mem', 'tom', 'need', or 'rum'
  div.className = 'thought' + (cls ? ` ${cls}` : '');
  
  let inner = `<span class="ts">${ts}</span><span class="tx">${text}</span>`;
  if (defKey) inner += `<span class="dtag" style="background:${defColor}22;color:${defColor}">${defKey}</span>`;
  
  div.innerHTML = inner;
  stream.insertBefore(div, stream.firstChild);
  while (stream.children.length > 55) stream.removeChild(stream.lastChild);
}

// ═══════════════════════════════════════════════════════
// THOUGHT GENERATION
// ═══════════════════════════════════════════════════════
function buildThought(emoKey,intensity,blendEmo,blendRatio,defenseKey,isSocial=false) {
  const ap=getModulatedAP(emoKey, isSocial);
  const t=intensity/100;
  const dev=getDevStage();
  const parts=[];

  const gran = getGranularity(emoKey);
  const granVocab = getGranularVocab(emoKey, gran);

  if(r() > dev.langProb) {
    return {text:p(D.body),cls:'nv',tag:null};
  }

  // Schema intrusion
  const domSchemas=Object.entries(SCHEMAS).filter(([,s])=>s.strength>0.15).sort((a,b)=>b[1].strength-a[1].strength);
  if(domSchemas.length&&r()<0.25){const[,schema]=domSchemas[0];if(r()<schema.strength&&schema.schemaWords)return{text:p(schema.schemaWords),cls:'',tag:null};}

  // Semantic intrusion
  const topSemNode=Object.values(nodes).filter(n=>!n.isPrime&&n.activation>0.3).sort((a,b)=>b.activation-a.activation)[0];
  if(topSemNode&&r()<0.2&&dev.langActive){
    const semWords={MOTHER:['her','mom','she','like with her'],FATHER:['him','dad'],FOOD:['something to eat','food','something good'],PAIN:['pain','hurts','it hurts'],WARM:['warm','warmth','warm like that'],HOME:['home','that place','where i belong'],SLEEP:['tired','rest','like sleeping']};
    const sw=semWords[topSemNode.id];
    if(sw)return{text:p(sw),cls:'sem',tag:null};
  }

  if(ap.co<0.2&&ap.at>0.8&&r()<0.55)return{text:p(D.body),cls:'nv',tag:null};
  if(t>0.85&&r()<0.5){
    if(ap.pl<0.2)return{text:p(D.bare_neg),cls:'rum',tag:null};
    if(ap.pl>0.7)return{text:p(D.bare_pos),cls:'',tag:null};
    return{text:p(D.bare_uncertain),cls:'rum',tag:null};
  }

  if(ap.ce<0.15)parts.push(p(D.cert_low.filter(x=>x)));
  else if(ap.ce<0.45&&r()<0.35)parts.push(p(D.cert_low));

  if(granVocab && gran > 0.3 && r() < 0.5 + gran * 0.3) {
    parts.push(p(granVocab));
  } else if(ap.oa>0.7&&r()<0.6) {
    parts.push(p(D.other_subj));
  } else if(ap.sa>0.5&&ap.co>0.6&&r()<0.5) {
    parts.push(p(D.self_hi_cope));
  } else if(ap.sa>0.3&&ap.co<0.3&&r()<0.45) {
    parts.push(p(D.self_lo_cope));
  } else if(ap.at>0.75) {
    parts.push(p(ap.co<0.2?D.focal_threat:D.focal_neutral));
  } else if(ap.pl>0.6) {
    parts.push(p(D.focal_pleasant));
  } else if(ap.ce>0.8&&ap.pl<0.1&&ap.sa<0.2&&ap.oa<0.2) {
    parts.push(p(D.loss_ref));
  }

  const last=parts[parts.length-1]||'';
  const hasVerb=/\b(need|can|will|want|have|going|never|don't|can't|won't)\b/.test(last);
  if(!hasVerb){
    if(ap.co>0.65)parts.push(p(D.cope_hi));
    else if(ap.co<0.25)parts.push(p(D.cope_lo));
    else parts.push(p(D.cope_mid));
  }

  if(r()<0.38){
    if(ap.fu>0.65&&r()<0.5)parts.push(p(D.scenario));
    else if(ap.co>0.6&&ap.ce>0.6)parts.push(p(['this','the problem','what to do']));
    else if(ap.oa>0.6&&r()<0.4)parts.push(p(['what they did','why they','what they wanted']));
    else if(ap.pl>0.6)parts.push(p(D.focal_pleasant));
    else parts.push(p(D.focal_neutral));
  }

  if(blendEmo&&blendRatio>0.4&&r()<0.25){
    const ap2=getModulatedAP(blendEmo);
    let inj='';
    if(ap2.co<0.2&&ap2.at>0.8)inj=p(D.body);
    else if(ap2.oa>0.7)inj=p(D.other_subj);
    else if(ap2.fu>0.6)inj=p(D.scenario);
    else inj=p(D.focal_neutral);
    if(inj)parts.push(p(['—','but','and','still']),inj);
  }

  let text=parts.filter(x=>x&&x!=='').join(' ').trim();
  if(!text)text=p(D.focal_neutral);

  const isRum=t>0.68;
  if(t>0.72&&r()<0.38){const frag=text.split(/\s+/).slice(0,2).join(' ');if(frag.length>1)text=text+' '+frag;}
  if(defenseKey&&r()<0.38)text=applyDefense(defenseKey,text);
  return{text,cls:isRum?'rum':'',tag:null};
}

function generateThoughts(cat) {
  const[dk,dv]=dominant();
  const dyad=getDyad();const def=getDefense();const em=EM[dk];
  const dev=getDevStage();
  const isSocial = SOCIAL_CATS.has(cat);
  let blendEmo=null,blendRatio=0;
  if(dyad){blendEmo=dyad.a===dk?dyad.b:dyad.a;blendRatio=state[blendEmo]/dv;}

  if(r()<0.12)sched({text:p(D.body),cls:'nv',tag:null,defKey:null,defColor:null},150);

// Main thought
  const{text,cls,tag}=buildThought(dk,dv,blendEmo,blendRatio,def?def.def:null,isSocial);
  applyAffectLabeling(dk); // ADD THIS LINE HERE
  sched({text,cls,tag,defKey:def?def.def:null,defColor:def?em.c:null},280+~~(r()*150));
  if(dev.langProb > 0.15){
    const past = retrieveNarrativeConsistentEpisode(dk);
    if(past&&r()<0.45){
      const age=past.age;const timeRef=age<=1?'just now':age<=3?'recently':age<=6?'a while ago':'before';
      sched({text:p([`${timeRef} — ${past.label.replace(/^[^\s]+ /,'')}`,`this again`,`like ${timeRef}`,`${timeRef} it was like this`]),cls:'mem',tag:null,defKey:null,defColor:null},650+~~(r()*700));
    }

    const belief = getActiveBelief(dk);
    if(belief && r() < 0.5) {
      sched({text: belief.label, cls:'sem', tag:'belief', defKey:null, defColor:null},
        900 + ~~(r()*600));
    }

    if(NARRATIVE_SELF.strength > 0.25 && NARRATIVE_SELF.phrases.length > 0
       && r() < NARRATIVE_SELF.strength * 0.25) {
      const phrase = p(NARRATIVE_SELF.phrases);
      sched({text: phrase, cls:'sem', tag:'self', defKey:null, defColor:null},
        1300 + ~~(r()*800));
    }
  }

  const tomDepth = getToMDepth();
  if(tomDepth >= 1 && tomState && tomState.agent && r() < 0.4) {
    const biasedProfile = biasedToMAttribution(tomState, tomDepth);
    const tomPool = getToMWords(biasedProfile, tomDepth);
    if(tomPool) sched({text:p(tomPool),cls:'tom',tag:null,defKey:null,defColor:null},1100+~~(r()*1100));
    if(tomDepth >= 6 && r() < 0.5) {
      const d6pool = TOM_WORDS[`d6_${biasedProfile.intent}`] || TOM_WORDS.d6_evaluative;
      sched({text:p(d6pool),cls:'tom',tag:null,defKey:null,defColor:null},1800+~~(r()*800));
    }
  }

  const[fnk,fn]=Object.entries(NEEDS).sort((a,b)=>a[1].val-b[1].val)[0];
  if(fn.val<30&&dev.langProb>0.2&&r()<0.32){
    const nw={autonomy:['not in control','no choice','this isn\'t mine'],competence:['not good enough','can\'t do this','should be able to'],relatedness:['nobody sees this','alone in this','no one knows']};
    const nwl=nw[fnk];if(nwl)sched({text:p(nwl),cls:'need',tag:null,defKey:null,defColor:null},1600+~~(r()*1400));
  }

  if(dev.langProb>0.15&&r()<0.28){
    const{text:t2,cls:c2}=buildThought(dk,dv,blendEmo,blendRatio,null,isSocial);
    sched({text:t2,cls:c2,tag:null,defKey:null,defColor:null},2200+~~(r()*2000));
  }
}

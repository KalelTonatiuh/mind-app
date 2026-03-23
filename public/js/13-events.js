// ═══════════════════════════════════════════════════════
// EVENT → PRIME ACTIVATION MAPS
// ═══════════════════════════════════════════════════════
const EVENT_PRIMES={
  achievement:  {GOOD:.9,DO:.8,I:.8,WANT:.7,CAN:.8,MORE:.7,NOW:.6,AFTER:.5},
  alone:        {SOMEONE:.8,FAR:.9,BEFORE:.7,DONTWANT:.8,FEEL:.8,NOT:.7,NOW:.6,BAD:.5},
  judged:       {SOMEONE:.8,SEE:.8,MAYBE:.7,FEEL:.7,I:.6,THINK:.6,BAD:.4,NOW:.6},
  kindness:     {SOMEONE:.9,GOOD:.8,FEEL:.8,NOW:.7,DONTWANT:.2,WANT:.5,TOUCH:.4},
  threat:       {HAPPEN:.9,BAD:.9,NOW:.9,DONTWANT:.9,FEEL:.8,MOVE:.6,I:.7,NOT:.5},
  betrayal:     {SOMEONE:.9,BAD:.9,DO:.8,FEEL:.8,DONTWANT:.8,TRUE:.4,NOT:.7,BEFORE:.5},
  morning:      {GOOD:.7,NOW:.7,FEEL:.6,SEE:.6,HERE:.6,WANT:.5,WARM:.5,DAY:.7},
  failure:      {BAD:.8,HAPPEN:.8,DO:.7,I:.7,NOT:.6,FEEL:.7,DONTWANT:.7,BEFORE:.5},
  'given trust':{SOMEONE:.9,GOOD:.8,WANT:.7,DO:.7,I:.7,CAN:.6,FEEL:.7,NEAR:.5},
  humiliation:  {SOMEONE:.9,BAD:.9,FEEL:.9,PEOPLE:.8,SEE:.8,DO:.7,DONTWANT:.9,I:.8},
  sudden:       {HAPPEN:.9,NOW:.9,HEAR:.8,FEEL:.7,MAYBE:.6,MOVE:.5,NEAR:.5},
};

// ═══════════════════════════════════════════════════════
// SEMANTIC EVENT PARSING (word → prime → activation → emotion)
// ═══════════════════════════════════════════════════════
const WORD_PRIME_MAP = [
  {w:['i ','me ','my ','myself'],                     p:{I:0.9}},
  {w:['you','your','they','them','their','he ','she ','him','her'],p:{YOU:0.7,SOMEONE:0.7}},
  {w:['people','everyone','crowd','group','others','classmates','friends'],p:{PEOPLE:0.8,SOMEONE:0.5}},
  {w:['thing','object','item','it ','something'],     p:{SOMETHING:0.7}},
  {w:['body','physical','chest','stomach','pain','hurt','head','hands','blood'],p:{BODY:0.8}},
  {w:['good','great','wonderful','beautiful','perfect','amazing','nice','love','lovely','best','well','right'],p:{GOOD:0.9}},
  {w:['bad','terrible','awful','horrible','wrong','worst','evil','vile','gross'],p:{BAD:0.9}},
  {w:['think','thought','believe','wonder','consider','realize','understand','know'],p:{THINK:0.8,KNOW:0.6}},
  {w:['know','knew','aware','certain','sure','recognize','remember'],p:{KNOW:0.9}},
  {w:['want','wish','desire','need','hope','crave','miss','long'],p:{WANT:0.8}},
  {w:['don\'t want','unwant','avoid','refuse','reject','hate','loathe'],p:{DONTWANT:0.8}},
  {w:['feel','felt','emotion','mood','sense','experience'],p:{FEEL:0.8}},
  {w:['see','saw','look','watch','notice','observe','witness','visible'],p:{SEE:0.8}},
  {w:['hear','heard','sound','noise','loud','voice','say','said','tell','told','talk','speak'],p:{HEAR:0.7,SAY:0.6,WORDS:0.5}},
  {w:['do','did','done','make','made','act','action','cause','create','build','work','try'],p:{DO:0.8}},
  {w:['happen','happened','occur','event','suddenly','just','then'],p:{HAPPEN:0.8}},
  {w:['move','moved','run','walk','go','came','leave','left','fall','jump'],p:{MOVE:0.7}},
  {w:['here','near','close','next','beside','with','together','inside','home','room'],p:{HERE:0.7,NEAR:0.8,INSIDE:0.6}},
  {w:['far','away','gone','distance','leave','apart','lost','alone','isolated'],p:{FAR:0.8,NOT:0.4}},
  {w:['above','high','up','sky','top'],               p:{ABOVE:0.7}},
  {w:['below','down','ground','under','low','floor'],  p:{BELOW:0.7,GROUND:0.6}},
  {w:['touch','touched','contact','hold','held','grab','hug','hit'],p:{TOUCH:0.8}},
  {w:['now','right now','today','currently','moment','still','already'],p:{NOW:0.9,MOMENT:0.7}},
  {w:['before','ago','used to','once','old','past','earlier','yesterday','last'],p:{BEFORE:0.8}},
  {w:['after','later','future','soon','tomorrow','next','will','going to'],p:{AFTER:0.8}},
  {w:['long','always','forever','never','years','entire','whole','all day'],p:{LONGTIME:0.8}},
  {w:['quick','sudden','short','fast','instant','brief','second'],p:{SHORTTIME:0.7,MOMENT:0.5}},
  {w:['not','no','never','didn\'t','don\'t','can\'t','isn\'t','wasn\'t','without','nothing'],p:{NOT:0.9}},
  {w:['maybe','might','could','perhaps','possibly','unclear','unsure','if ','whether'],p:{MAYBE:0.7,IF:0.6}},
  {w:['can','able','capable','possible','allowed','have the'],p:{CAN:0.8}},
  {w:['because','so ','therefore','reason','why','caused','led to','result'],p:{BECAUSE:0.8}},
  {w:['very','really','so much','extremely','incredibly','deeply','completely'],p:{VERY:0.8}},
  {w:['more','most','even more','better','increase','extra','further'],p:{MORE:0.7}},
  {w:['like','as if','similar','reminded','felt like','same as'],p:{LIKE:0.7,SAME:0.5}},
  {w:['mom','mother','mama','mum','parent','caregiver'],p:{MOTHER:0.9,SOMEONE:0.5}},
  {w:['dad','father','papa','parent'],                p:{FATHER:0.9,SOMEONE:0.5}},
  {w:['child','kid','baby','infant','young','little'], p:{CHILD:0.8,SMALL:0.6}},
  {w:['food','eat','ate','meal','hungry','feed','snack','drink','water','thirst'],p:{FOOD:0.7,WATER:0.5,WANT:0.4}},
  {w:['pain','hurt','ache','sore','wound','injur','bleed'],p:{PAIN:0.9,BAD:0.6,BODY:0.7}},
  {w:['warm','cozy','comfort','soft','gentle','tender'],p:{WARM:0.8,GOOD:0.4}},
  {w:['cold','freeze','chill','numb','ice','winter'],  p:{COLD:0.7}},
  {w:['sleep','tired','exhausted','rest','asleep','wake','dream'],p:{SLEEP:0.8,BODY:0.4}},
  {w:['sound','noise','music','hear','ring','alarm','voice'],p:{SOUND:0.8,HEAR:0.6}},
  {w:['face','eye','look','expression','smile','frown','stare'],p:{FACE:0.7,SEE:0.6,SOMEONE:0.4}},
  {w:['home','house','room','safe place','inside','belong'],p:{HOME:0.8,NEAR:0.5,GOOD:0.3}},
  {w:['fire','burn','flame','hot','danger','destroy'],  p:{FIRE:0.7,BAD:0.5}},
  {w:['animal','dog','cat','creature','wild','beast'],  p:{ANIMAL:0.7,LIVE:0.5}},
  {w:['name','called','known as','identified','label'], p:{NAME:0.7,WORDS:0.5}},
  {w:['win','won','succeed','success','achiev','accomplish','beat','first','champion'],p:{GOOD:0.8,DO:0.7,WANT:0.6,CAN:0.7,I:0.6}},
  {w:['fail','failed','lose','lost','couldn\'t','mistake','wrong','missed'],p:{BAD:0.8,DO:0.6,NOT:0.7,DONTWANT:0.5}},
  {w:['danger','threat','attack','chase','scare','terrif','afraid','frightened','panic'],p:{BAD:0.8,HAPPEN:0.7,DONTWANT:0.9,NOW:0.6,FAR:0.3}},
  {w:['safe','protect','secure','shield','guard','save'],p:{GOOD:0.7,NEAR:0.6,CAN:0.5}},
  {w:['betray','lied','cheat','deceiv','manipulat','backstab'],p:{BAD:0.9,SOMEONE:0.8,NOT:0.6,DONTWANT:0.7,TRUE:0.2}},
  {w:['kind','generous','help','support','care','give','gift'],p:{GOOD:0.8,SOMEONE:0.8,WANT:0.5,NEAR:0.4}},
  {w:['alone','lonely','abandon','reject','ignor','left out','nobody'],p:{FAR:0.8,DONTWANT:0.7,SOMEONE:0.5,NOT:0.5}},
  {w:['humiliat','embarrass','ashamed','mock','ridicul','shame'],p:{BAD:0.8,PEOPLE:0.7,SEE:0.7,DONTWANT:0.8,I:0.6}},
  {w:['proud','honor','respect','impress','admire'],   p:{GOOD:0.7,SOMEONE:0.5,DO:0.5,I:0.5}},
  {w:['sudden','unexpect','shock','wow','whoa','surprise','realiz','discover'],p:{HAPPEN:0.8,NOW:0.7,MAYBE:0.4,NOT:0.3}},
  {w:['excit','looking forward','plan','goal','ready','prepare','upcoming','soon','next'],p:{AFTER:0.7,WANT:0.6,MAYBE:0.4,GOOD:0.3,CAN:0.4}},
  {w:['live','alive','surviv','exist','life'],          p:{LIVE:0.8}},
  {w:['die','death','dead','gone forever','end','kill','fatal'],p:{DIE:0.8,BAD:0.6,DONTWANT:0.7}},
];

const PRIME_EMOTION_SIGNATURES = {
  joy:          {GOOD:0.7, WANT:0.5, CAN:0.5, TRUE:0.4, DO:0.3, NOW:0.3},
  trust:        {GOOD:0.6, SOMEONE:0.7, NEAR:0.5, TRUE:0.5, KNOW:0.4, WANT:0.3},
  fear:         {BAD:0.5, DONTWANT:0.6, MAYBE:0.7, HAPPEN:0.5, NOW:0.5, NOT:0.4},
  surprise:     {HAPPEN:0.7, NOW:0.6, SOMEONE:0.4, NOT:0.5, MAYBE:0.4, BEFORE:0.3},
  sadness:      {BAD:0.5, FAR:0.6, BEFORE:0.5, DONTWANT:0.5, NOT:0.4},
  disgust:      {BAD:0.7, NOT:0.6, DONTWANT:0.6, TRUE:0.5, SOMEONE:0.3},
  anger:        {BAD:0.5, SOMEONE:0.6, DO:0.5, TRUE:0.5, NOT:0.4, DONTWANT:0.4},
  anticipation: {AFTER:0.6, WANT:0.6, MAYBE:0.4, CAN:0.4, IF:0.3},
};

function deriveCategoryFromActivation() {
  const a = id => nodes[id]?.activation || 0;
  const scores = {
    achievement:  a('GOOD')*0.6 + a('DO')*0.5 + a('CAN')*0.5 + a('WANT')*0.3,
    threat:       a('BAD')*0.6 + a('DONTWANT')*0.5 + a('HAPPEN')*0.4 + a('NOW')*0.3,
    betrayal:     a('BAD')*0.5 + a('SOMEONE')*0.6 + a('NOT')*0.4 + a('TRUE')*0.4,
    kindness:     a('GOOD')*0.5 + a('SOMEONE')*0.6 + a('NEAR')*0.4 + a('WANT')*0.2,
    alone:        a('FAR')*0.7 + a('NOT')*0.4 + a('DONTWANT')*0.3 + a('SOMEONE')*0.3,
    failure:      a('BAD')*0.5 + a('DO')*0.4 + a('NOT')*0.5 + a('DONTWANT')*0.3,
    humiliation:  a('BAD')*0.5 + a('PEOPLE')*0.5 + a('SEE')*0.5 + a('DONTWANT')*0.4,
    'given trust':a('GOOD')*0.4 + a('SOMEONE')*0.5 + a('I')*0.4 + a('CAN')*0.3,
    morning:      a('GOOD')*0.5 + a('NOW')*0.4 + a('SEE')*0.3 + a('WARM')*0.4,
    sudden:       a('HAPPEN')*0.6 + a('NOW')*0.6 + a('MAYBE')*0.3,
    neutral:      0.1,
  };
  return Object.entries(scores).sort((a,b)=>b[1]-a[1])[0][0];
}

function parseInputSemantically(text) {
  const lower = ' ' + text.toLowerCase() + ' ';
  const seeds = {};
  WORD_PRIME_MAP.forEach(entry => {
    entry.w.forEach(w => {
      if(lower.includes(w)) {
        Object.entries(entry.p).forEach(([prime, strength]) => {
          seeds[prime] = Math.min(1, (seeds[prime]||0) + strength * 0.7);
        });
      }
    });
  });
  if(Object.keys(seeds).length === 0) {
    return { fx: {surprise:+10, anticipation:+8}, cat:'neutral' };
  }
  spreadActivation(seeds, 2);
  const fx = {};
  let totalSignal = 0;
  Object.entries(PRIME_EMOTION_SIGNATURES).forEach(([emo, sig]) => {
    let score = 0;
    let count = 0;
    Object.entries(sig).forEach(([prime, weight]) => {
      const act = nodes[prime]?.activation || 0;
      score += act * weight;
      count++;
    });
    const avg = score / count;
    if(avg > 0.08) {
      const magnitude = Math.round(avg * 280);
      if(magnitude > 4) {
        fx[emo] = magnitude;
        totalSignal += magnitude;
      }
    }
  });
  if(totalSignal < 8) {
    fx.surprise = fx.surprise ? fx.surprise + 8 : 10;
    fx.anticipation = fx.anticipation ? fx.anticipation + 6 : 8;
  }
  const cat = deriveCategoryFromActivation();
  return { fx, cat };
}

// ═══════════════════════════════════════════════════════
// MAIN EVENT APPLICATION
// ═══════════════════════════════════════════════════════
function applyEffects(baseFx,cat,label,silent=false) {
  checkPredictionError(baseFx, cat); // ADD THIS LINE HERE
  Object.keys(state).forEach(k=>prev[k]=state[k]);
  // ... rest of code
  const tempFx = applyTemperament(baseFx);
  const fx={...tempFx};
  const isSocial = SOCIAL_CATS.has(cat);
  let careResp = 1.0;
  if(isSocial) {
    careResp = getCaregiverResponsiveness();
    updateIWM(careResp);
    updateIWMFromAdultEvent(cat, careResp);
    if(careResp > 0.6) {
      if(fx.fear)    fx.fear    *= (1 - (careResp - 0.6) * 0.8);
      if(fx.sadness) fx.sadness *= (1 - (careResp - 0.6) * 0.6);
      if(fx.joy)     fx.joy     *= (1 + (careResp - 0.5) * 0.4);
      if(fx.trust)   fx.trust   *= (1 + (careResp - 0.5) * 0.5);
    } else if(careResp < 0.4) {
      if(fx.fear)    fx.fear    = (fx.fear||0)    + (0.4 - careResp) * 18;
      if(fx.sadness) fx.sadness = (fx.sadness||0) + (0.4 - careResp) * 12;
      if(fx.anger)   fx.anger   = (fx.anger||0)   + (0.4 - careResp) * 8;
      if(fx.trust)   fx.trust   = (fx.trust||0)   - (0.4 - careResp) * 15;
      NEEDS.relatedness.val = Math.max(0, NEEDS.relatedness.val - (0.4 - careResp) * 20);
    }
    nodes['MOTHER'] && (nodes['MOTHER'].activation = Math.min(1, (nodes['MOTHER'].activation||0) + 0.6 * careResp));
    nodes['FACE']   && (nodes['FACE'].activation   = Math.min(1, (nodes['FACE'].activation||0)   + 0.4));
    nodes['SOMEONE']&& (nodes['SOMEONE'].activation= Math.min(1, (nodes['SOMEONE'].activation||0)+ 0.5));
  }

  const needChanges=applyNeedEffects(cat,fx);
  const ampFx=applySchemaAmplification(fx);

  Object.entries(ampFx).forEach(([k,v])=>{
    state[k]=Math.min(100,Math.max(0,state[k]+v));
    const opp=EM[k]?.opp;if(opp&&v>0)state[opp]=Math.max(0,state[opp]-v*0.3);
  });

  const primeSeed=EVENT_PRIMES[cat]||{HAPPEN:.7,FEEL:.6,NOW:.7};
  spreadActivation(primeSeed);
  hebbianUpdate();

  const dev=getDevStage();
  const tomDepth = getToMDepth();
  const tomProfile = TOM_PROFILES[cat];
  if(tomProfile && tomDepth >= 1) {
    const biased = biasedToMAttribution(tomProfile, tomDepth);
    tomState = biased;
    Object.entries(biased.emotionMod).forEach(([k,v])=>{state[k]=Math.min(100,Math.max(0,(state[k]||5)+v));});
    const depthLabel = ['','desires','beliefs','access','false belief','hidden','2nd-order','3rd-order'][Math.min(7,tomDepth)];
    document.getElementById('tom-display').textContent=`[${depthLabel}] ${biased.label||'—'}`;
  } else if(tomDepth === 0) {
    document.getElementById('tom-display').textContent='other-modeling not yet formed';
  }

  conditionSchemas(cat,state);
  updateNarrativeSelf();

  const semPattern=Object.values(nodes).filter(n=>n.activation>0.3).sort((a,b)=>b.activation-a.activation).slice(0,5).map(n=>n.id);
  const[dk,dv]=dominant();
  encodeEpisode(label||cat,state,dk,dv,needChanges,semPattern);
  recordEventPattern();
  eventCount++;
  render();
  if(!silent)generateThoughts(cat);
}

// ═══════════════════════════════════════════════════════
// FAST FORWARD
// ═══════════════════════════════════════════════════════
const FF_KEYWORDS={
  safe: {achievement:4,kindness:5,'given trust':4,morning:6,alone:1,failure:1,threat:1},
  hard: {betrayal:4,failure:5,humiliation:3,alone:5,threat:3,achievement:1,kindness:1},
  mixed:{achievement:3,kindness:3,'given trust':2,morning:4,failure:3,alone:3,betrayal:2,judged:3},
};

const EVENT_FX={
  achievement:  {joy:+32,trust:+10,anticipation:+12},
  alone:        {sadness:+38,anger:+14,fear:+10},
  judged:       {fear:+22,anticipation:+18,anger:+8},
  kindness:     {surprise:+28,joy:+18,trust:+14},
  threat:       {fear:+38,anger:+18,anticipation:+12},
  betrayal:     {anger:+28,disgust:+22,sadness:+12},
  morning:      {joy:+18,trust:+12,anticipation:+10},
  failure:      {sadness:+28,anger:+14,fear:+12},
  'given trust':{trust:+32,anticipation:+18,joy:+10},
  humiliation:  {disgust:+18,sadness:+28,anger:+22},
  sudden:       {surprise:+38,fear:+18},
};

function fastForwardPreset(preset){
  document.getElementById('ff-input').value='';
  runFFSequence(FF_KEYWORDS[preset]);
}

function fastForward(){
  const text=document.getElementById('ff-input').value.toLowerCase();
  if(!text)return;
  const weights={};
  const matchers=[
    {w:['warm','safe','loving','secure','protected'],    events:{kindness:4,morning:5,'given trust':3}},
    {w:['mother','mom','parent','family'],               events:{'given trust':3,kindness:3,morning:2}},
    {w:['friend','friendship','social'],                 events:{kindness:3,'given trust':2,achievement:2}},
    {w:['school','learn','education','study'],           events:{achievement:4,judged:3,failure:2}},
// Increase the counts for negative events so they take priority
    {w:['abuse','trauma','violence','hurt'],             events:{threat:12,humiliation:8,betrayal:6,alone:10}},
    {w:['neglect','alone','lonely','absent'],            events:{alone:15,failure:5}},
    {w:['loss','grief','death','died','die'],            events:{alone:20,sadness:15,fear:10,failure:5}},
    {w:['success','achieve','accomplish','good at'],     events:{achievement:5,kindness:2}},
    {w:['fail','struggle','difficult','hard'],           events:{failure:4,judged:3}},
    {w:['betray','trust broken','lied','cheat'],         events:{betrayal:4,alone:3}},
    {w:['conflict','fight','argument'],                  events:{anger:3,judged:3,failure:2}},
    {w:['move','moved','new place','relocated'],         events:{alone:2,surprise:2,morning:2}},
    {w:['loss','grief','death','died'],                  events:{alone:4,failure:2,sadness:3}},
    
  ];
  matchers.forEach(m=>{if(m.w.some(w=>text.includes(w))){Object.entries(m.events).forEach(([e,n])=>weights[e]=(weights[e]||0)+n);}});
  if(Object.keys(weights).length===0)weights.morning=5;
  runFFSequence(weights);
}

async function runFFSequence(weights){
  const progressEl=document.getElementById('ff-progress');
  const events=[];
  Object.entries(weights).forEach(([cat,count])=>{
    const fx=EVENT_FX[cat];if(!fx)return;
    for(let i=0;i<Math.round(count);i++)events.push({cat,fx,label:cat});
  });
  for(let i=events.length-1;i>0;i--){const j=~~(Math.random()*(i+1));[events[i],events[j]]=[events[j],events[i]];}
  progressEl.textContent=`Running ${events.length} events…`;
  for(let i=0;i<events.length;i++){
    const ev=events[i];
    applyEffects(ev.fx,ev.cat,ev.label,true);
    progressEl.textContent=`${i+1}/${events.length} — ${ev.cat}`;
    await new Promise(res=>setTimeout(res,60));
  }
  progressEl.textContent=`Done — ${events.length} events. Mind developed.`;
  setTimeout(()=>generateThoughts(events[events.length-1]?.cat||'morning'),400);
}

// ═══════════════════════════════════════════════════════
// EVENT BUTTONS
// ═══════════════════════════════════════════════════════
const EVENTS=[
  {l:'🏆 Goal achieved',      fx:{joy:+32,trust:+10,anticipation:+12},cat:'achievement',lbl:'goal achieved'},
  {l:'💔 Someone leaves',     fx:{sadness:+38,anger:+14,fear:+10},   cat:'alone',       lbl:'someone left'},
  {l:'👁️ Being judged',       fx:{fear:+22,anticipation:+18,anger:+8},cat:'judged',     lbl:'being judged'},
  {l:'🎁 Unexpected kindness',fx:{surprise:+28,joy:+18,trust:+14},   cat:'kindness',    lbl:'unexpected kindness'},
  {l:'🚨 Threat appears',     fx:{fear:+38,anger:+18,anticipation:+12},cat:'threat',    lbl:'threat appeared'},
  {l:'🤥 Betrayal found',     fx:{anger:+28,disgust:+22,sadness:+12}, cat:'betrayal',   lbl:'discovered betrayal'},
  {l:'🌅 Beautiful morning',  fx:{joy:+18,trust:+12,anticipation:+10},cat:'morning',    lbl:'beautiful morning'},
  {l:'❌ Repeated failure',    fx:{sadness:+28,anger:+14,fear:+12},   cat:'failure',     lbl:'failed again'},
  {l:'🤝 Given trust',        fx:{trust:+32,anticipation:+18,joy:+10},cat:'given trust',lbl:'given responsibility'},
  {l:'😳 Public humiliation', fx:{disgust:+18,sadness:+28,anger:+22}, cat:'humiliation',lbl:'publicly humiliated'},
  {l:'🌙 Alone at night',     fx:{sadness:+18,fear:+14,anticipation:+8},cat:'alone',   lbl:'alone at night'},
  {l:'⚡ Sudden loud noise',  fx:{surprise:+38,fear:+18},             cat:'sudden',     lbl:'sudden shock'},
];

function initEventButtons() {
  const eg=document.getElementById('evgrid');
  EVENTS.forEach(ev=>{
    const b=document.createElement('button');b.className='evbtn';b.textContent=ev.l;
    b.onclick=()=>applyEffects(ev.fx,ev.cat,ev.lbl);eg.appendChild(b);
  });
}

function sendCustom(){
  const el=document.getElementById('ci');const text=el.value.trim();if(!text)return;el.value='';
  const { fx, cat } = parseInputSemantically(text);
  applyEffects(fx, cat, text);
}

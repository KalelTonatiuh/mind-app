// ═══════════════════════════════════════════════════════
// EMOTION MODEL (Plutchik 1980)
// ═══════════════════════════════════════════════════════
const EM = {
  joy:          {c:'#c4911a',label:'Joy',         icon:'😄',tiers:['Serenity','Joy','Ecstasy'],          opp:'sadness',   def:'Reaction formation',dd:'turns feeling into its opposite'},
  trust:        {c:'#3a8a5e',label:'Trust',        icon:'🤝',tiers:['Acceptance','Trust','Admiration'],    opp:'disgust',   def:'Denial',            dd:'refuses to see what\'s there'},
  fear:         {c:'#30755a',label:'Fear',         icon:'😨',tiers:['Apprehension','Fear','Terror'],       opp:'anger',     def:'Repression',        dd:'pushes thought down, out'},
  surprise:     {c:'#4494bc',label:'Surprise',     icon:'😲',tiers:['Distraction','Surprise','Amazement'], opp:'anticipation',def:'Regression',      dd:'retreats to something simpler'},
  sadness:      {c:'#4d6b98',label:'Sadness',      icon:'😔',tiers:['Pensiveness','Sadness','Grief'],      opp:'joy',       def:'Compensation',      dd:'proves something elsewhere'},
  disgust:      {c:'#7258ab',label:'Disgust',      icon:'🤢',tiers:['Boredom','Disgust','Loathing'],       opp:'trust',     def:'Projection',        dd:'it\'s them, not me'},
  anger:        {c:'#a82c2c',label:'Anger',        icon:'😠',tiers:['Annoyance','Anger','Rage'],           opp:'fear',      def:'Displacement',      dd:'redirects onto something else'},
  anticipation: {c:'#bc5c14',label:'Anticipation', icon:'⚡',tiers:['Interest','Anticipation','Vigilance'],opp:'surprise',  def:'Intellectualization',dd:'reasons instead of feels'},
};

const DYADS=[
  {a:'joy',b:'trust',n:'Love'},{a:'trust',b:'fear',n:'Submission'},
  {a:'fear',b:'surprise',n:'Awe'},{a:'surprise',b:'sadness',n:'Disapproval'},
  {a:'sadness',b:'disgust',n:'Remorse'},{a:'disgust',b:'anger',n:'Contempt'},
  {a:'anger',b:'anticipation',n:'Aggressiveness'},{a:'anticipation',b:'joy',n:'Optimism'},
];

const FUNC={
  joy:'connecting',trust:'affiliating',fear:'protecting',surprise:'orienting',
  sadness:'reintegrating',disgust:'rejecting',anger:'removing obstacle',anticipation:'scanning',
};

// ═══════════════════════════════════════════════════════
// APPRAISAL PROFILES (Smith & Ellsworth 1985 → NSM primes)
// pl=pleasantness, ce=certainty, sa=self-agency,
// oa=other-agency, co=coping, at=attention, fu=future
// ═══════════════════════════════════════════════════════
const AP_BASE={
  joy:          {pl:1.0,ce:0.7,sa:0.6,oa:0.1,co:0.9,at:0.4,fu:0.9},
  trust:        {pl:0.8,ce:0.6,sa:0.3,oa:0.7,co:0.7,at:0.5,fu:0.7},
  fear:         {pl:0.0,ce:0.2,sa:0.1,oa:0.5,co:0.1,at:1.0,fu:0.1},
  surprise:     {pl:0.5,ce:0.0,sa:0.1,oa:0.3,co:0.5,at:1.0,fu:0.5},
  sadness:      {pl:0.0,ce:0.9,sa:0.1,oa:0.1,co:0.1,at:0.6,fu:0.1},
  disgust:      {pl:0.0,ce:0.9,sa:0.4,oa:0.6,co:0.6,at:0.7,fu:0.3},
  anger:        {pl:0.0,ce:0.9,sa:0.2,oa:0.9,co:0.8,at:0.8,fu:0.4},
  anticipation: {pl:0.6,ce:0.2,sa:0.7,oa:0.1,co:0.6,at:0.9,fu:0.8},
};

function getModulatedAP(emoKey, isSocial=false) {
  const base={...AP_BASE[emoKey]};
  Object.values(SCHEMAS).forEach(s=>{
    if(s.strength<0.05)return;
    const bias=s.bias?.[emoKey];if(!bias)return;
    const w=s.strength*Math.abs(s.valence);
    Object.entries(bias).forEach(([d,delta])=>{base[d]=Math.max(0,Math.min(1,base[d]+delta*w));});
  });
  const sm=getSemanticAppraisalMod();
  base.pl=Math.max(0,Math.min(1,base.pl+sm.pl_mod));
  base.ce=Math.max(0,Math.min(1,base.ce+sm.ce_mod));
  base.sa=Math.max(0,Math.min(1,base.sa+sm.sa_mod));
  base.oa=Math.max(0,Math.min(1,base.oa+sm.oa_mod));
  base.co=Math.max(0,Math.min(1,base.co+sm.co_mod));
  base.at=Math.max(0,Math.min(1,base.at+sm.at_mod));
  base.fu=Math.max(0,Math.min(1,base.fu+sm.fu_mod));
  if(IWM.sampleCount >= 3 && isSocial) {
    const threatBias = (0.5 - IWM.otherTrust) * 0.55;
    const worthBias  = (0.5 - IWM.selfWorth)  * 0.40;
    base.pl = Math.max(0, Math.min(1, base.pl - threatBias));
    base.co = Math.max(0, Math.min(1, base.co - threatBias * 0.6));
    base.ce = Math.max(0, Math.min(1, base.ce - Math.abs(threatBias) * 0.3));
    base.sa = Math.max(0, Math.min(1, base.sa - worthBias));
    base.fu = Math.max(0, Math.min(1, base.fu - worthBias));
  } else if(IWM.sampleCount >= 3 && !isSocial) {
    const worthBias = (0.5 - IWM.selfWorth) * 0.15;
    base.sa = Math.max(0, Math.min(1, base.sa - worthBias));
    base.fu = Math.max(0, Math.min(1, base.fu - worthBias * 0.5));
  }
  const emoValence = ['joy','trust','anticipation'].includes(emoKey) ? 1 : -1;
  return applyNarrativeCoherence(base, emoValence);
}

// Emotion state
const state={},prev={};
Object.keys(EM).forEach(k=>{state[k]=5;prev[k]=5;});

// Utility helpers
function dominant(){return Object.entries(state).sort((a,b)=>b[1]-a[1])[0];}
function tier(k,v){const t=EM[k].tiers;return v<33?t[0]:v<66?t[1]:t[2];}
function getDyad(){let best=null,bs=-1;DYADS.forEach(d=>{const s=(state[d.a]+state[d.b])/2,r2=Math.min(state[d.a],state[d.b])/Math.max(state[d.a],state[d.b]);if(s>22&&r2>0.45&&s>bs){bs=s;best=d;}});return best;}
function getTrend(){let rk=null,rd=0;Object.keys(state).forEach(k=>{const d=state[k]-prev[k];if(d>rd){rd=d;rk=k;}});if(rd>5&&rk)return{l:`↑ ${EM[rk].label}`,s:`+${Math.round(rd)}`};const[dk]=dominant();const fall=prev[dk]-state[dk];if(fall>3)return{l:'↓ settling',s:EM[dk].label+' fading'};return{l:'→ stable',s:'homeostasis'};}

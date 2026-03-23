// ═══════════════════════════════════════════════════════
// EPISODIC MEMORY + SEMANTICIZATION
// Tulving (1972), Baddeley (1988), Conway (2005)
// Royal Soc B (2024): gradual semanticization of episodes
// ═══════════════════════════════════════════════════════
const episodicMemory=[];
const semanticBeliefs = {};

function encodeEpisode(label,emoSnapshot,domEmo,intensity,needChanges,semPattern) {
  const ep = {
    id:Date.now(), label, age:0, emo:domEmo, intensity,
    fingerprint:{...emoSnapshot}, needChanges:{...needChanges},
    semPattern:[...semPattern],
    cat: label.split(' ')[0],
  };
  episodicMemory.unshift(ep);
  if(episodicMemory.length>14) episodicMemory.pop();
  episodicMemory.forEach((e,i)=>e.age=i);
  checkSemantization(domEmo, ep.cat, intensity, semPattern);
}

function checkSemantization(emo, cat, intensity, semPattern) {
  const key = emo + ':' + cat;
  const matching = episodicMemory.filter(e => e.emo === emo && e.cat === cat);
  if(matching.length >= 3) {
    const avgIntensity = matching.reduce((s,e)=>s+e.intensity,0)/matching.length/100;
    if(!semanticBeliefs[key]) {
      const emoData = EM[emo];
      const valence = ['joy','trust','anticipation'].includes(emo) ? 0.6 : -0.6;
      const beliefLabel = generateBeliefLabel(emo, cat);
      semanticBeliefs[key] = {
        key, emo, cat,
        label: beliefLabel,
        strength: 0.2 + avgIntensity * 0.3,
        valence,
        color: emoData?.c || '#888',
        episodeCount: matching.length,
        formationEvent: eventCount,
        nodeId: 'BELIEF_' + key.replace(':','_').toUpperCase(),
      };
      const sharedPrimes = getSharedPrimes(matching);
      nodes[semanticBeliefs[key].nodeId] = {
        id: semanticBeliefs[key].nodeId,
        isPrime: false,
        activation: 0,
        valence,
        connections: sharedPrimes,
        expCount: matching.length,
        isLearned: true,
        isBelief: true,
        beliefLabel: beliefLabel,
      };
    } else {
      const belief = semanticBeliefs[key];
      belief.strength = Math.min(1, belief.strength + 0.04 * avgIntensity);
      belief.episodeCount = matching.length;
      if(nodes[belief.nodeId]) {
        nodes[belief.nodeId].expCount = matching.length;
        nodes[belief.nodeId].valence = belief.valence * belief.strength;
      }
    }
  }
}

function getSharedPrimes(episodes) {
  const primeCounts = {};
  episodes.forEach(ep => {
    ep.semPattern.forEach(id => {
      if(nodes[id]?.isPrime) primeCounts[id] = (primeCounts[id]||0) + 1;
    });
  });
  const threshold = Math.ceil(episodes.length * 0.6);
  const shared = {};
  Object.entries(primeCounts).forEach(([id,count]) => {
    if(count >= threshold) shared[id] = 0.4 + (count/episodes.length)*0.3;
  });
  return shared;
}

function generateBeliefLabel(emo, cat) {
  const templates = {
    fear:    { threat:'danger finds me', alone:'i end up alone', betrayal:'they hurt you', default:'it goes wrong' },
    sadness: { alone:'i am alone', failure:'i fail', loss:'things are lost', default:'it ends badly' },
    anger:   { betrayal:'they betray', conflict:'it turns to conflict', default:'it turns against me' },
    joy:     { achievement:'i can do this', kindness:'people are good', default:'good things happen' },
    trust:   { kindness:'others come through', default:'it works out' },
    disgust: { betrayal:'they are not what they seemed', default:'things are rotten' },
    anticipation: { achievement:'i can handle it', default:'something is coming' },
    surprise:{ sudden:'things change suddenly', default:'it is never what i expect' },
  };
  const emoMap = templates[emo] || {};
  return emoMap[cat] || emoMap.default || emo + ' when ' + cat;
}

function retrieveSimilar(emo,intensity) {
  const cands=episodicMemory.filter(e=>e.age>0&&e.emo===emo&&Math.abs(e.intensity-intensity)<35);
  return cands.length?cands.sort((a,b)=>b.intensity-a.intensity)[0]:null;
}

function getActiveBelief(emo) {
  return Object.values(semanticBeliefs).find(b =>
    b.emo === emo && b.strength > 0.3 && Math.random() < b.strength * 0.4
  );
}

// ═══════════════════════════════════════════════════════
// NARRATIVE SELF (Conway & Pleydell-Pearce 2000)
// The working self — a coherent story about who this mind is.
// ═══════════════════════════════════════════════════════
const NARRATIVE_SELF = {
  valence: 0,
  theme: 'undefined',
  strength: 0,
  phrases: [],
  eventCount: 0,
};

function updateNarrativeSelf() {
  if(eventCount < 5) return;

  const posSchemaStrength = (SCHEMAS.capable?.strength||0) + (SCHEMAS.worthLove?.strength||0);
  const negSchemaStrength = (SCHEMAS.worthless?.strength||0) +
    (SCHEMAS.notEnough?.strength||0) + (SCHEMAS.notSafe?.strength||0) +
    (SCHEMAS.cannotTrust?.strength||0) + (SCHEMAS.worldDangerous?.strength||0);

  const beliefValence = Object.values(semanticBeliefs).reduce((sum, b) => {
    return sum + (b.valence * b.strength);
  }, 0) / Math.max(1, Object.keys(semanticBeliefs).length);

  const iwmContribution = IWM.sampleCount >= 5
    ? (IWM.selfWorth - 0.5) * 0.4 : 0;

  const rawValence = (posSchemaStrength - negSchemaStrength) * 0.4
    + beliefValence * 0.3 + iwmContribution;

  const narrativeLR = 0.05;
  NARRATIVE_SELF.valence = NARRATIVE_SELF.valence * (1-narrativeLR) + rawValence * narrativeLR;
  NARRATIVE_SELF.valence = Math.max(-1, Math.min(1, NARRATIVE_SELF.valence));

  const dominantSchema = Object.entries(SCHEMAS)
    .sort((a,b) => b[1].strength - a[1].strength)[0];
  const dominantBelief = Object.values(semanticBeliefs)
    .sort((a,b) => b.strength - a.strength)[0];

  if(dominantSchema && dominantSchema[1].strength > 0.3) {
    NARRATIVE_SELF.theme = dominantSchema[0];
  } else if(dominantBelief && dominantBelief.strength > 0.3) {
    NARRATIVE_SELF.theme = dominantBelief.emo;
  } else {
    NARRATIVE_SELF.theme = 'neutral';
  }

  const schemaConsistency = Math.abs(posSchemaStrength - negSchemaStrength);
  const beliefConsistency = Object.values(semanticBeliefs).filter(b => b.strength > 0.3).length;
  NARRATIVE_SELF.strength = Math.min(1,
    schemaConsistency * 0.3 + beliefConsistency * 0.08 + eventCount/500);

  NARRATIVE_SELF.phrases = generateNarrativePhrases();
  NARRATIVE_SELF.eventCount = eventCount;
}

function generateNarrativePhrases() {
  const theme = NARRATIVE_SELF.theme;
  const phraseSets = {
    notSafe:       ['things go wrong for me', 'danger finds me', 'i don\'t feel safe', 'it\'s not safe'],
    notEnough:     ['i\'m never enough', 'i fall short', 'i don\'t measure up', 'not enough'],
    worthless:     ['i don\'t matter', 'i\'m not worth it', 'nobody really sees me', 'i don\'t deserve'],
    worldDangerous:['the world is against me', 'things are dangerous', 'i can\'t trust it'],
    cannotTrust:   ['people let you down', 'you can\'t rely on others', 'i\'m better off alone'],
    capable:       ['i can handle things', 'i figure it out', 'i\'m capable', 'i manage'],
    worthLove:     ['people care about me', 'i\'m worth loving', 'i belong here', 'i matter'],
    fear:          ['i\'m always afraid', 'i worry', 'danger finds me'],
    sadness:       ['i carry loss', 'things end badly for me', 'i grieve things'],
    joy:           ['life is good to me', 'i find joy', 'things work out'],
    neutral:       ['i\'m okay', 'this is who i am', 'i get by'],
  };
  return phraseSets[theme] || phraseSets.neutral;
}

function applyNarrativeCoherence(ap, eventValence) {
  if(NARRATIVE_SELF.strength < 0.2 || eventCount < 10) return ap;
  const out = {...ap};
  const narrativeMatch = NARRATIVE_SELF.valence * eventValence;
  const coherenceBias = narrativeMatch * NARRATIVE_SELF.strength * 0.3;
  out.ce = Math.max(0, Math.min(1, out.ce + coherenceBias));
  if(NARRATIVE_SELF.valence < -0.3) {
    out.sa = Math.max(0, Math.min(1, out.sa - 0.1 * NARRATIVE_SELF.strength));
  }
  return out;
}

function retrieveNarrativeConsistentEpisode(emo) {
  if(NARRATIVE_SELF.strength < 0.2) return retrieveSimilar(emo, state[emo]||20);
  const narrativeEmo = NARRATIVE_SELF.valence < -0.3
    ? ['fear','sadness','disgust','anger']
    : NARRATIVE_SELF.valence > 0.3
    ? ['joy','trust','anticipation']
    : null;
  if(narrativeEmo && Math.random() < NARRATIVE_SELF.strength * 0.4) {
    const biasedEmo = narrativeEmo[~~(Math.random()*narrativeEmo.length)];
    const cands = episodicMemory.filter(e => e.age>0 && e.emo === biasedEmo);
    if(cands.length) return cands.sort((a,b)=>b.intensity-a.intensity)[0];
  }
  return retrieveSimilar(emo, state[emo]||20);
}

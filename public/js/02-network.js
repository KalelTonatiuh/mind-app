// ═══════════════════════════════════════════════════════
// SEMANTIC NETWORK
// ═══════════════════════════════════════════════════════
const nodes = {};

function buildNetwork() {
  Object.keys(PRIME_DEFS).forEach(p => {
    nodes[p] = {id:p, isPrime:true, activation:0, valence:PRIME_VALENCE[p]||0, connections:{}, expCount:0, isLearned:false};
  });
  Object.entries(MOLECULE_DEFS).forEach(([name,mol]) => {
    nodes[name] = {id:name, isPrime:false, activation:0, valence:mol.valence||0, connections:{...mol.primes}, expCount:0, isLearned:false};
    Object.keys(mol.primes).forEach(p => {
      if(nodes[p]) nodes[p].connections[name] = (nodes[p].connections[name]||0) + mol.primes[p]*0.4;
    });
  });
}

// ═══════════════════════════════════════════════════════
// SPREADING ACTIVATION (Collins & Loftus 1975)
// ═══════════════════════════════════════════════════════
function spreadActivation(sourceMap, hops=2) {
  Object.values(nodes).forEach(n => n.activation=0);
  Object.entries(sourceMap).forEach(([id,str]) => { if(nodes[id]) nodes[id].activation=Math.min(1,str); });
  for(let h=0;h<hops;h++) {
    const deltas={};
    Object.values(nodes).forEach(n => {
      if(n.activation<0.04) return;
      Object.entries(n.connections).forEach(([target,w]) => {
        deltas[target]=(deltas[target]||0)+n.activation*w*0.5;
      });
    });
    Object.entries(deltas).forEach(([id,delta]) => {
      if(nodes[id]) nodes[id].activation=Math.min(1,(nodes[id].activation||0)+delta);
    });
  }
}

// ═══════════════════════════════════════════════════════
// HEBBIAN LEARNING (Hebb 1949)
// Cells that fire together wire together.
// Rate decays with experience (developmental plasticity).
// ═══════════════════════════════════════════════════════
let eventCount = 0;

function getPlasticity() {
  const base = 0.018 + 0.10 * Math.exp(-eventCount/180);
  return Math.min(0.15, base * (0.8 + TEMP.orientSens * 0.4));
}

function hebbianUpdate() {
  const plasticity = getPlasticity();
  const active = Object.values(nodes).filter(n=>n.activation>0.12);
  active.forEach(n => { n.expCount++; });
  for(let i=0;i<active.length;i++) {
    for(let j=i+1;j<active.length;j++) {
      const a=active[i], b=active[j];
      const delta=plasticity*a.activation*b.activation;
      a.connections[b.id]=(a.connections[b.id]||0)+delta;
      b.connections[a.id]=(b.connections[a.id]||0)+delta;
      if(a.connections[b.id]>1)a.connections[b.id]=1;
      if(b.connections[a.id]>1)b.connections[a.id]=1;
    }
  }
  Object.values(nodes).forEach(n => {
    Object.keys(n.connections).forEach(target => {
      if(!nodes[target]||nodes[target].activation<0.04) {
        n.connections[target]*=0.998;
        if(n.connections[target]<0.01&&!nodes[target]?.isPrime) delete n.connections[target];
      }
    });
  });
  active.forEach(n => {
    if(!n.isPrime) {
      const goodAct=nodes['GOOD']?.activation||0;
      const badAct=nodes['BAD']?.activation||0;
      n.valence=Math.max(-1,Math.min(1,n.valence+(goodAct-badAct)*plasticity*0.5));
    }
  });
}

// ═══════════════════════════════════════════════════════
// SEMANTIC → APPRAISAL MODIFICATION
// Activated concept pattern shifts appraisal dimensions
// ═══════════════════════════════════════════════════════
function getSemanticAppraisalMod() {
  const act = (id) => nodes[id]?.activation||0;
  return {
    pl_mod:  (act('GOOD')-act('BAD'))*0.25 + act('WARM')*0.1 + act('HOME')*0.1,
    ce_mod:  (act('KNOW')+act('TRUE')-act('MAYBE')-act('IF'))*0.15,
    sa_mod:  (act('I')+act('CAN')+act('MINE'))*0.1 - act('NOT')*0.08,
    oa_mod:  (act('SOMEONE')+act('PEOPLE')+act('OTHER'))*0.1,
    co_mod:  (act('CAN')+act('GOOD')-act('BAD')-act('NOT'))*0.12,
    at_mod:  (act('NOW')+act('HAPPEN')+act('SOUND'))*0.1,
    fu_mod:  (act('AFTER')+act('WANT')-act('DONTWANT')-act('NOT'))*0.12,
  };
}

// Track which nodes were active in the most recent event for replay
let lastEventNodePattern = [];

function recordEventPattern() {
  lastEventNodePattern = Object.values(nodes)
    .filter(n => n.activation > 0.2)
    .map(n => n.id);
}

// ═══════════════════════════════════════════════════════
// OFFLINE CONSOLIDATION (Buzsáki 1989, Wilson & McNaughton 1994)
// Hippocampal replay during rest strengthens traces.
// ═══════════════════════════════════════════════════════
function offlineConsolidation() {
  if(eventCount < 3) return;
  const richness = Math.min(1, eventCount / 100);
  const consolidationStrength = 0.0015 * (0.5 + richness * 0.5);

  // 1. Hebbian drift on recent node pattern
  if(lastEventNodePattern.length > 1) {
    const active = lastEventNodePattern.filter(id => nodes[id]);
    for(let i = 0; i < active.length; i++) {
      for(let j = i+1; j < active.length; j++) {
        const a = nodes[active[i]], b = nodes[active[j]];
        if(!a || !b) continue;
        const currentStrength = a.connections[b.id] || 0;
        const weaknessBonus = currentStrength < 0.3 ? 2.0 : 0.5;
        const delta = consolidationStrength * weaknessBonus;
        a.connections[b.id] = Math.min(1, (a.connections[b.id]||0) + delta);
        b.connections[a.id] = Math.min(1, (b.connections[a.id]||0) + delta);
      }
    }
  }

  // 2. Episodic replay → semantic abstraction
  if(episodicMemory.length > 0) {
    const mostIntense = episodicMemory.reduce((best, ep) =>
      ep.intensity > best.intensity ? ep : best, episodicMemory[0]);
    if(mostIntense.semPattern && mostIntense.semPattern.length > 0) {
      mostIntense.semPattern.forEach(nodeId => {
        if(nodes[nodeId]) {
          nodes[nodeId].expCount = Math.min(200, (nodes[nodeId].expCount||0) + 0.3);
          nodes[nodeId].activation = Math.min(0.5,
            (nodes[nodeId].activation||0) + consolidationStrength * (mostIntense.intensity/100));
        }
      });
      checkSemantization(mostIntense.emo, mostIntense.cat,
        mostIntense.intensity, mostIntense.semPattern);
    }
  }

  // 3. Schema consolidation
  Object.values(SCHEMAS).forEach(s => {
    if(s.strength > 0.1 && s.age > 0) {
      const maturityFactor = Math.max(0, 1 - s.age / 300);
      s.strength = Math.min(1, s.strength + consolidationStrength * maturityFactor * 0.5);
      s.age++;
    }
  });

  // 4. Belief deepening
  Object.values(semanticBeliefs).forEach(b => {
    const ceiling = 0.2 + Math.min(1, b.episodeCount / 10) * 0.7;
    if(b.strength < ceiling) {
      b.strength = Math.min(ceiling, b.strength + consolidationStrength * 0.3);
      if(nodes[b.nodeId]) {
        nodes[b.nodeId].expCount = Math.min(200, (nodes[b.nodeId].expCount||0) + 0.2);
      }
    }
  });
}

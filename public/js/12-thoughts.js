// 12-thoughts.js - Multi-Pool Thought Generator
const D = {
    somatic: ["pulse in neck", "tightness", "breath shallow", "heaviness", "cold hands", "buzzing"],
    belief: ["it's always like this", "never safe", "I can handle it", "no one cares", "I matter"],
    need: ["I need to be seen", "not enough space", "want to do it myself", "missing something"],
    rumination: ["why did that happen?", "over and over", "can't stop thinking", "stop it", "no"]
};

let thoughtQ = [];
let thoughtTimer = null;

function sched(data, delay) {
    thoughtQ.push({ data, delay });
    if (!thoughtTimer) drain();
}

function drain() {
    if (!thoughtQ.length) {
        thoughtTimer = null;
        return;
    }
    const item = thoughtQ.shift();
    thoughtTimer = setTimeout(() => {
        push(item.data);
        drain();
    }, item.delay);
}

function push({ text, cls }) {
    const stream = document.getElementById('stream');
    const now = new Date();
    const ts = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    const div = document.createElement('div');
    div.className = `thought ${cls}`; // Classes: nv (grey), sem (teal), mem (amber), tom (blue), need (purple), rum (faded)
    div.innerHTML = `<span class="ts">${ts}</span><span class="tx">${text}</span>`;
    
    stream.insertBefore(div, stream.firstChild);
    if (stream.children.length > 40) stream.removeChild(stream.lastChild);
}

function generateThoughts(cat) {
    const [dk, dv] = dominant();
    const dev = getDevStage();
    const cog = getCognitiveState();

    // 1. Somatic Layer (Grey - nv)
    if (dv > 60 || cog === 'Flooded') {
        sched({ text: p(D.somatic), cls: 'nv' }, 100 + r() * 200);
    }

    // 2. Core Beliefs (Teal - sem)
    if (dev.langProb > 0.3 && r() < 0.4) {
        let activeSchema = Object.values(SCHEMAS).find(s => s.strength > 0.4);
        if (activeSchema) sched({ text: activeSchema.label.toLowerCase(), cls: 'sem' }, 400 + r() * 300);
    }

    // 3. Memory Replay (Amber - mem)
    if (r() < 0.3) {
        let past = retrieveSimilar(dk);
        if (past) sched({ text: `reminds me of ${past.label}`, cls: 'mem' }, 800 + r() * 400);
    }

    // 4. Theory of Mind (Blue - tom)
    if (tomState.agent && r() < 0.5) {
        let tomWord = p(tomState.words || ["thinking about them"]);
        sched({ text: tomWord, cls: 'tom' }, 1200 + r() * 500);
    }

    // 5. Psychological Needs (Purple - need)
    if (r() < 0.3) {
        sched({ text: p(D.need), cls: 'need' }, 1600 + r() * 600);
    }

    // 6. Defensive Distortion
    if (dv > 70) {
        let defense = getDefense();
        if (defense && r() < 0.5) {
            let distorted = applyDefense(dk + " is here", dk);
            sched({ text: distorted, cls: 'rum' }, 2000);
        }
    }
}
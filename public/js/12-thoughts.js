// 12-thoughts.js - Full Fixed Version
const D = {
    somatic: ["pulse in neck", "tightness", "breath shallow", "heaviness"],
    belief: ["it's always like this", "never safe", "I can handle it"],
    need: ["I need to be seen", "missing something"],
    rumination: ["why did that happen?", "can't stop thinking"]
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
    div.className = `thought ${cls || ''}`;
    div.innerHTML = `<span class="ts">${ts}</span><span class="tx">${text}</span>`;
    stream.insertBefore(div, stream.firstChild);
    if (stream.children.length > 40) stream.removeChild(stream.lastChild);
}

// THIS IS THE MISSING FUNCTION
function generateSpontaneousThoughts() {
    const [dk, dv] = dominant();
    if (dv > 40 && r() < 0.3) {
        sched({ text: p(D.rumination), cls: 'rum' }, 500);
    }
    if (CHEM.cortisol > 0.6 && r() < 0.2) {
        sched({ text: p(D.somatic), cls: 'nv' }, 100);
    }
}

function generateThoughts(cat) {
    const [dk, dv] = dominant();
    sched({ text: `Processing ${cat}...`, cls: 'sem' }, 200);
    if (dv > 60) sched({ text: p(D.somatic), cls: 'nv' }, 600);
}
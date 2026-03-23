// 14-render.js - High-Density Dashboard Engine
function friendly(val) {
    if (val > 0.75) return "Very High";
    if (val > 0.55) return "High";
    if (val > 0.4) return "Moderate";
    if (val > 0.2) return "Low";
    return "Very Low";
}

function render() {
    const [dk, dv] = dominant();
    const em = EM[dk];
    const tr = getTrend();
    const dev = getDevStage();
    const cogState = getCognitiveState(); 

    // Update Header & Status
    const setEl = (id, txt) => { const el = document.getElementById(id); if(el) el.textContent = txt; };
    setEl('ds', em.label);
    setEl('dn', tier(dk, dv));
    setEl('tv', tr.l);
    
    const devStageEl = document.getElementById('dev-stage');
    if(devStageEl) {
        devStageEl.textContent = `${dev.name} [${cogState}]`;
        devStageEl.style.color = cogState === 'Flooded' ? '#a84040' : 'var(--t)';
    }

    setEl('dev-plasticity', 
        (BODY.isAsleep ? 'SLEEPING' : 'AWAKE') + ' · ' + 
        `C:${Math.round(CHEM.cortisol*100)} O:${Math.round(CHEM.oxytocin*100)} · ` +
        `Time: ${Math.floor(BODY.clock)}:00`
    );

    // FEATURE: Life Timeline Visualizer
    const tl = document.getElementById('life-timeline');
    if (tl) {
        tl.innerHTML = episodicMemory.slice(0, 12).map(ep => `
            <div style="min-width:120px; border-left:1px solid var(--b); padding:5px; font-size:9px;">
                <div style="color:var(--t3); font-family:var(--m);">EVENT</div>
                <div style="color:${EM[ep.emo].c}">${ep.label}</div>
            </div>
        `).join('');
    }

    // FEATURE: Semantic Map Canvas
    const canvas = document.getElementById('semantic-map');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0,0, canvas.width, canvas.height);
        let active = Object.values(nodes).filter(n => n.activation > 0.05 && !n.isHidden);
        active.forEach((n, i) => {
            let x = 50 + (i * 60) % (canvas.width - 100);
            let y = 30 + (i * 20) % (canvas.height - 60);
            ctx.fillStyle = n.isBelief ? '#4a9e6b' : `rgba(255,255,255,${n.activation})`;
            ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI*2); ctx.fill();
            ctx.font = '9px Courier New';
            ctx.fillText(n.id.toLowerCase(), x+8, y+3);
        });
    }

    // Render Emotion Bars
    const egrid = document.getElementById('egrid');
    if(egrid) {
        egrid.innerHTML = '';
        Object.entries(EM).forEach(([k, e]) => {
            const v = Math.round(state[k]);
            const el = document.createElement('div'); el.className = 'ebar';
            el.innerHTML = `<div class="el">${e.label}</div><div class="et"><div class="ef" style="width:${v}%;background:${e.c}"></div></div>`;
            egrid.appendChild(el);
        });
    }

    // Render Needs
    const ngrid = document.getElementById('need-row');
    if(ngrid) {
        ngrid.innerHTML = '';
        Object.entries(NEEDS).filter(([k])=> k!=='drives').forEach(([k, n]) => {
            const el = document.createElement('div'); el.className = 'need-item';
            el.innerHTML = `<div class="need-label">${n.label}</div><div class="need-track"><div class="need-fill" style="width:${n.val}%;background:${n.color}"></div></div>`;
            ngrid.appendChild(el);
        });
    }

    // Caregiver & ToM
    setEl('defn', getDefense()?.def || 'none');
    setEl('tom-display', tomState ? tomState.label : 'no social modeling');
}
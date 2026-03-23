// 06-schemas.js - Core Beliefs & Shadow Dynamics
const SCHEMAS = {
  notSafe: { label:'I am not safe', strength:0, valence:-1, color:'#a82c2c', confirms:['threat','alone'], amplifies:{fear:1.5, anger:1.2} },
  worthless: { label:'I am worthless', strength:0, valence:-1, color:'#7258ab', confirms:['humiliation','alone'], amplifies:{sadness:1.6} },
  capable: { label:'I am capable', strength:0, valence:1, color:'#3a8a5e', confirms:['achievement'], amplifies:{joy:1.3} },
  worthLove: { label:'I am worth love', strength:0, valence:1, color:'#c4911a', confirms:['kindness'], amplifies:{trust:1.3} }
};

function conditionSchemas(cat, currentState) {
    Object.values(SCHEMAS).forEach(s => {
        if (s.confirms.includes(cat)) {
            // Schemas harden based on current emotion intensity
            const intensity = currentState[Object.keys(s.amplifies)[0]] / 100;
            s.strength = Math.min(1, s.strength + (0.05 * intensity));
        }
    });
}

function applySchemaAmplification(fx) {
    const out = { ...fx };
    Object.values(SCHEMAS).forEach(s => {
        if (s.strength > 0.2) {
            Object.entries(s.amplifies).forEach(([emo, multiplier]) => {
                if (out[emo]) {
                    // Physical amplification of the spike
                    out[emo] = out[emo] + (out[emo] * (multiplier - 1) * s.strength);
                }
            });
        }
    });
    return out;
}
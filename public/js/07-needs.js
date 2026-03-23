// 07-needs.js - SDT & Themes
const NEEDS = {
    autonomy: {val: 50, label: 'Autonomy', color: '#bc5c14'},
    competence: {val: 50, label: 'Competence', color: '#3a8a5e'},
    relatedness: {val: 50, label: 'Relatedness', color: '#4d6b98'},
    drives: { exploration: 0 }
};

function evaluateGoals() {
    // Choose a "Life Theme" based on the most neglected need
    let sorted = Object.entries(NEEDS)
        .filter(([k])=>k!=='drives')
        .sort((a,b) => a[1].val - b[1].val);
    
    let lowest = sorted[0][0];
    switch(lowest) {
        case 'autonomy': NARRATIVE_SELF.lifeTheme = "the quest for freedom"; break;
        case 'competence': NARRATIVE_SELF.lifeTheme = "the need to achieve"; break;
        case 'relatedness': NARRATIVE_SELF.lifeTheme = "the search for connection"; break;
    }
}
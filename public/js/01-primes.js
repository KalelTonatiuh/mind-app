// ═══════════════════════════════════════════════════════
// THE 65 SEMANTIC PRIMES (Wierzbicka & Goddard)
// Pre-installed at birth. Cannot be learned or lost.
// ═══════════════════════════════════════════════════════
const PRIME_DEFS = {
  I:true, YOU:true, SOMEONE:true, PEOPLE:true, SOMETHING:true, BODY:true,
  KIND:true, PART:true,
  THIS:true, SAME:true, OTHER:true,
  ONE:true, TWO:true, SOME:true, ALL:true, MUCH:true, LITTLE:true,
  GOOD:true, BAD:true,
  BIG:true, SMALL:true,
  THINK:true, KNOW:true, WANT:true, DONTWANT:true, FEEL:true, SEE:true, HEAR:true,
  SAY:true, WORDS:true, TRUE:true,
  DO:true, HAPPEN:true, MOVE:true,
  SOMEWHERE:true, THEREIS:true, MINE:true,
  LIVE:true, DIE:true,
  WHEN:true, NOW:true, BEFORE:true, AFTER:true, LONGTIME:true, SHORTTIME:true, MOMENT:true,
  WHERE:true, HERE:true, ABOVE:true, BELOW:true, FAR:true, NEAR:true, SIDE:true, INSIDE:true, TOUCH:true,
  NOT:true, MAYBE:true, CAN:true, BECAUSE:true, IF:true,
  VERY:true, MORE:true,
  LIKE:true
};

// ═══════════════════════════════════════════════════════
// NEAR-UNIVERSAL MOLECULES (Wierzbicka)
// Pre-installed with weak prime connections.
// ═══════════════════════════════════════════════════════
const MOLECULE_DEFS = {
  MOTHER: {primes:{SOMEONE:.9,GOOD:.7,FEEL:.7,NEAR:.8,LIVE:.6,WANT:.5},valence:0.7},
  FATHER: {primes:{SOMEONE:.9,GOOD:.5,FEEL:.6,NEAR:.6,LIVE:.5,WANT:.4},valence:0.5},
  CHILD:  {primes:{SOMEONE:.8,SMALL:.7,LIVE:.6,FEEL:.6,I:.5},valence:0.4},
  FOOD:   {primes:{SOMETHING:.9,GOOD:.6,WANT:.8,SMALL:.4,DO:.5,FEEL:.6},valence:0.5},
  WATER:  {primes:{SOMETHING:.8,GOOD:.5,WANT:.6,FEEL:.5,MOVE:.4},valence:0.3},
  PAIN:   {primes:{FEEL:.9,BAD:.9,BODY:.8,DONTWANT:.9,HAPPEN:.6,NOW:.7},valence:-0.9},
  WARM:   {primes:{FEEL:.7,GOOD:.6,NEAR:.5,BODY:.5,TOUCH:.5},valence:0.6},
  COLD:   {primes:{FEEL:.7,BAD:.4,FAR:.4,BODY:.5,NOT:.4},valence:-0.3},
  SLEEP:  {primes:{FEEL:.6,GOOD:.5,BODY:.7,DONTWANT:.2,LONGTIME:.5},valence:0.4},
  SOUND:  {primes:{HEAR:.9,HAPPEN:.6,SOMETHING:.6,NEAR:.5,NOW:.5},valence:0.0},
  FACE:   {primes:{BODY:.8,SEE:.8,SOMEONE:.7,FEEL:.5,NEAR:.5},valence:0.2},
  HAND:   {primes:{BODY:.9,DO:.7,TOUCH:.8,NEAR:.5,MINE:.5},valence:0.1},
  EYE:    {primes:{BODY:.9,SEE:.9,SOMEONE:.5,KNOW:.4},valence:0.1},
  HOME:   {primes:{WHERE:.8,NEAR:.8,GOOD:.7,MINE:.8,LIVE:.7,INSIDE:.7},valence:0.7},
  DAY:    {primes:{WHEN:.8,NOW:.5,SEE:.6,GOOD:.4,LONGTIME:.5},valence:0.3},
  NIGHT:  {primes:{WHEN:.8,NOT:.5,SEE:.4,BEFORE:.4,LONGTIME:.5},valence:-0.1},
  FIRE:   {primes:{SOMETHING:.8,WARM:.7,BAD:.5,HAPPEN:.7,MOVE:.5},valence:0.0},
  GROUND: {primes:{WHERE:.7,BELOW:.8,TOUCH:.6,BODY:.5,NEAR:.5},valence:0.0},
  ANIMAL: {primes:{SOMEONE:.5,LIVE:.8,MOVE:.7,FEEL:.5,OTHER:.5},valence:0.1},
  NAME:   {primes:{WORDS:.8,I:.7,SOMEONE:.7,SAY:.6,KNOW:.5},valence:0.2},
};

// Pre-installed valence for evaluator primes
const PRIME_VALENCE = {
  GOOD:0.8, BAD:-0.8, WANT:0.3, DONTWANT:-0.3,
  LIVE:0.4, DIE:-0.6, NEAR:0.2, FAR:-0.1, PAIN:-0.8
};

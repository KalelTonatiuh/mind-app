// ═══════════════════════════════════════════════════════
// SYNAPTIC PRUNING (Adolescent Hardening)
// ═══════════════════════════════════════════════════════
function runSynapticPruning() {
  // Pruning begins after the Mind has significant experience
  if (eventCount < 300) return;

  Object.values(nodes).forEach(n => {
    Object.keys(n.connections).forEach(target => {
      const strength = n.connections[target];
      
      // If a connection is weak (< 0.1), it is deleted forever
      if (strength < 0.1 && !nodes[target]?.isPrime) {
        delete n.connections[target];
      } else {
        // Strong connections become even stronger and more rigid
        n.connections[target] = Math.min(1, n.connections[target] + 0.01);
      }
    });
  });
}
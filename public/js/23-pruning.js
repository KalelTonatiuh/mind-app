// 23-pruning.js - Synaptic Pruning (Adolescent Hardening)
function runSynapticPruning() {
    // Pruning starts after the mind has consolidated significant data
    if (eventCount < 300) return;

    Object.values(nodes).forEach(n => {
        // Pruning does not affect Primes (Biological constants)
        if (n.isPrime) return;

        Object.keys(n.connections).forEach(target => {
            const weight = n.connections[target];
            
            if (weight < 0.1) {
                // FEATURE: Personality Hardening
                // If a connection is weak, it is deleted forever
                delete n.connections[target];
            } else {
                // Strong connections become even stronger (Heidigger's "Throwness")
                n.connections[target] = Math.min(1, n.connections[target] + 0.005);
            }
        });
    });
}
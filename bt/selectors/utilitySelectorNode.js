// UtilitySelectorNode bira dijete s najboljim scoreom i izvršava ga.
const { Node } = require('../behaviorTree');

class UtilitySelectorNode extends Node {
  constructor(name, candidates, fallbackNode = null) {
    super(name || 'UtilitySelector');
    this.candidates = candidates || [];
    this.fallbackNode = fallbackNode;
  }

  async tick(bot, state, config, depth = 0) {
    const indent = ' '.repeat(depth * 2);

    let bestCandidate = null;
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const candidate of this.candidates) {
      let score = Number.NEGATIVE_INFINITY;

      try {
        score = await Promise.resolve(candidate.scoreFn(bot, state, config));
      } catch (err) {
        console.log(`${indent}[Utility] ${candidate.name}: ERROR (${err.message})`);
      }

      console.log(`${indent}[Utility] ${candidate.name}: ${score}`);

      if (score > bestScore) {
        bestScore = score;
        bestCandidate = candidate;
      }
    }

    if (!bestCandidate || bestScore <= 0) {
      if (!this.fallbackNode) {
        return 'FAILURE';
      }

      return this.fallbackNode.tick(bot, state, config, depth + 1);
    }

    return bestCandidate.node.tick(bot, state, config, depth + 1);
  }
}

module.exports = UtilitySelectorNode;
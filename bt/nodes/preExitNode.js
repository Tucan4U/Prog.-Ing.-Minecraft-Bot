const { Node } = require('../behaviorTree');

// PreExitNode: ensures PvP and pathfinder are stopped before exit sequence
class PreExitNode extends Node {
  constructor() {
    super('PreExit');
  }

  async tick(bot, state) {
    try {
      if (bot.pvp && bot.pvp.target) {
        bot.pvp.stop();
      }
    } catch (err) {
      // ignore
    }

    try {
      if (bot.pathfinder && bot.pathfinder.setGoal) {
        bot.pathfinder.setGoal(null);
      }
    } catch (err) {
      // ignore
    }

    try {
      if (typeof bot.clearControlStates === 'function') {
        bot.clearControlStates();
      }
    } catch (err) {
      // ignore
    }

    console.log('[EXIT] PreExit: stopped PvP and cleared pathfinder');
    return 'SUCCESS';
  }
}

module.exports = PreExitNode;

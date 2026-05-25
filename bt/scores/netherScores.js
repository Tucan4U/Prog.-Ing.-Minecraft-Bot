const { getMissingEquipment } = require('../../utils/netherEquipment');

// Score function for Nether behavior. Returns high priority only when a Nether request is active and gear is ready.
function enterNetherScore(bot, state, config) {
  if (bot.game && bot.game.dimension === 'the_nether') {
    if (state.mission?.enterNetherRequested) {
      // Clear stale requests when already in the Nether.
      state.mission.enterNetherRequested = false;
    }
    return 0;
  }

  // Triggered via state flag
  if (!state.mission?.enterNetherRequested) return 0;

  const missing = getMissingEquipment(bot);
  if (missing.length > 0) {
    bot.chat(`Cannot enter Nether, missing: ${missing.join(', ')}`);
    return 0;
  }

  // High priority when requested and gear is ready
  return 200;
}

module.exports = { enterNetherScore };

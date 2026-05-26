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

function findFortressScore(bot, state, config) {
  // Only active when fortress search is requested AND bot is already in the Nether.
  // Returns 0 otherwise so other candidates can run.
  if (!state.mission?.findFortressRequested) return 0;
  if (!bot.game || bot.game.dimension !== 'the_nether') return 0;

  // Medium-high priority: run after entering Nether but lower than other potential activities.
  return 150;
}

function findBlazeSpawnerScore(bot, state, config) {
  // Only active when blaze spawner search is requested AND bot is already in the Nether.
  if (!state.mission?.findBlazeSpawnerRequested) return 0;
  if (!bot.game || bot.game.dimension !== 'the_nether') return 0;

  // If the bot already has 8 or more blaze rods, no need to search.
  const blazeCount = bot.inventory.items().reduce((s, it) => s + (it.name === 'blaze_rod' ? it.count || it.quantity || 0 : 0), 0);
  if (blazeCount >= 8) return 0;

  // Lower priority than fortress search because the bot should already be in a fortress.
  // So it does FOR SURE search for blaze spawner and not other spawners (magma cube)
  return 100;
}

module.exports = { enterNetherScore, findFortressScore, findBlazeSpawnerScore };

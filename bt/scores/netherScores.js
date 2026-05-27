const { getMissingEquipment } = require('../../utils/netherEquipment');
const { needsGold } = require('../../utils/inventory');


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

// function hasNearbyGoldItem(state, config) { //ignore for now
//   const items = state.sensors?.items || [];
//   if (!Array.isArray(items) || !items.length) return false;

//   const foodSet = new Set(config.ITEMS.GOLD.names || []);
//   return items.some((entity) => {
//     const item = entity.getDroppedItem?.();
//     return item && foodSet.has(item.name);
//   });
// }

function craftGoldNetherScore(bot, state, config){
  const goldCount = bot.inventory
    .items()
    .filter((i) => config.ITEMS.GOLD.names.includes(i.name))
    .reduce((sum, i) => sum + i.count, 0);

  return goldCount >= 9 ? 170 : 0;
}

function getGoldNetherScore(bot, state, config) {
  const goldCount = bot.inventory
    .items()
    .filter((i) => config.ITEMS.GOLD.names.includes(i.name))
    .reduce((sum, i) => sum + i.count, 0);

  return goldCount < 9 ? 180 : 0;
}

module.exports = { enterNetherScore, findFortressScore, getGoldNetherScore, craftGoldNetherScore };

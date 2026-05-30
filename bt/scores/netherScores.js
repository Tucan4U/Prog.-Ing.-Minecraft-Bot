const { getMissingEquipment } = require('../../utils/netherEquipment');
const { findMobs } = require('../../behaviors/findEnteties');
const { findItem } = require('../../behaviors/loot');
const { needsGold } = require('../../utils/inventory');


let blazeCountCache = 0; // Cache for the current blaze rod count to avoid expensive inventory checks every tick.
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

  // If the bot already has 8 or more blaze rods, no need to go to the fortress (AUTONOMOUS)
  if (!checkBlazeNeed(bot, state, config)) {
    bot.chat(`Already have ${blazeCountCache} blaze rods, skipping search.`);
    return 0;
  }

  if (state.isEating) return 0; // If bot is currently eating, pause fortress search to avoid pathfinding issues.

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
  if (!state.needsGold) return 0;

  const goldCountNuggets = bot.inventory
    .items()
    .filter((i) => config.ITEMS.GOLD_NUGGETS.names.includes(i.name))
    .reduce((sum, i) => sum + i.count, 0);

  const goldCountIngots = bot.inventory
    .items()
    .filter((i) => config.ITEMS.GOLD_INGOTS.names.includes(i.name))
    .reduce((sum, i) => sum + i.count, 0);

  if (goldCountNuggets >= 9 && goldCountIngots < state.neededGold){
    return 170;
  }else if (goldCountIngots >= state.neededGold){
    state.needsGold = false;
    state.neededGold = 16;
    return 0;
  }else{
    return 0;
  }
}

function getGoldNetherScore(bot, state, config) {
  if (!state.needsGold) return 0;
  
  const goldCount = bot.inventory
    .items()
    .filter((i) => config.ITEMS.GOLD_NUGGETS.names.includes(i.name))
    .reduce((sum, i) => sum + i.count, 0);

  return goldCount < 9 ? 180 : 0;
}

function moveToPiglinScore(bot, state, config) {
  if (!state.isBartering && !state.needsGold) return 160;
  return 0;
}

function barteringScore(bot, state, config){
  return 159;
}

function findBlazeSpawnerScore(bot, state, config) {
  // Only active when blaze spawner search is requested AND bot is already in the Nether.
  if (!state.mission?.findBlazeSpawnerRequested) return 0;
  if (!bot.game || bot.game.dimension !== 'the_nether') return 0;

  // If the bot already has 8 or more blaze rods, no need to search. (AUTONOMOUS)
  if (!checkBlazeNeed(bot, state, config)) {
    bot.chat(`Already have ${blazeCountCache} blaze rods, skipping search.`);
    return 0;
  }

  // Suppress searching while eating
  if (state.isEating) return 0;

  // Lower priority than fortress search because the bot should already be in a fortress.
  // So it does FOR SURE search for blaze spawner and not other spawners (magma cube)
  return 100;
}

function lootBlazeRodsScore(bot, state, config) {
  if (!state.mission?.blazeHuntingRequested) return 0;

  if (!checkBlazeNeed(bot, state, config)) {
    bot.chat(`Already have ${blazeCountCache} blaze rods, skipping looting.`);
    return 0;
  }

  // Stop looting while eating so the bot doesn't walk towards death
  if (state.isEating) return 0;

  // High priority: If there's a dropped rod, grab it immediately before it burns or despawns!
  const droppedRod = findItem(bot, config.BLAZE_RODS.names);
  return droppedRod ? 140 : 0; 

}

function huntBlazeScore(bot, state, config) {
  if (!state.mission?.blazeHuntingRequested) return 0;

  if (!checkBlazeNeed(bot, state, config)) {
    bot.chat(`Already have ${blazeCountCache} blaze rods, skipping hunting.`);
    return 0;
  }

  // Stop fighting while eating so the bot doesn't swing its sword
  if (state.isEating) return 0;
  
  // Medium-high priority: We need rods and we are hunting.
  const blazes = findMobs(bot, config.BLAZES, state.sensors?.entities);
  return blazes.length ? 120 : 0;
}



// Function check if there is a need for blaze rods:
// - there isn't: findFortressScore and findBlazeSpawnerScore will return 0 and flags for those will be resetted to false, 
//                skipping the Blaze part of the AUTONOMOUS run only
// - there is: returns true and the scores will return their normal values, triggering the searches.
function checkBlazeNeed(bot, state, config) {
  // Count number of blaze rods in posession
  const blazeRodItem = bot.registry.itemsByName['blaze_rod'];
  blazeCountCache = blazeRodItem ? bot.inventory.count(blazeRodItem.id, null) : 0;

  //if (state.mission.netherMode === config.NETHER_MODES.AUTONOMOUS && blazeCountCache >= 8) {
  if ((state.mission.netherMode === config.NETHER_MODES.AUTONOMOUS || state.mission?.blazeHuntingRequested) && blazeCountCache >= state.mission.targetBlazeRods) {
    // Clear the requests for findBlazeSpawner and findFortress and blazeHunting since we don't need to search anymore.
    state.mission.findFortressRequested = false;
    state.mission.fortressTarget = null;
    state.mission.findBlazeSpawnerRequested = false;
    state.mission.blazeHuntingRequested = false;
    return false; // No need for blaze rods
  }

  return true; // Needs blaze rods
}

module.exports = { barteringScore, moveToPiglinScore, enterNetherScore, findFortressScore, findBlazeSpawnerScore, getGoldNetherScore, craftGoldNetherScore, lootBlazeRodsScore, huntBlazeScore };
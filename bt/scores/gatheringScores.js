const {
  numOfBlocks,
  findInventoryItemByNames,
  countItemsByNames,
  getTotalFoodCount,
  shouldHuntForFood,
} = require("../../utils/inventory");

function gatherDirtScore(bot, state, cfg) {
  const dirtCount = numOfBlocks(bot, state, cfg, "DIRT");

  if (dirtCount <= 2) state.hasEnoughDirt = false;

  if (dirtCount >= 10) state.hasEnoughDirt = true;

  if (!state.hasEnoughDirt) return 50;

  return 0;
}

function gatherLogsScore(bot, state, cfg) {
  const logCount = numOfBlocks(bot, state, cfg, "LOGS");

  if (logCount <= 2) state.hasEnoughLogs = false;

  if (logCount >= 16) state.hasEnoughLogs = true;

  if (!state.hasEnoughLogs) return 40;

  return 0;
}

function gatherStoneScore(bot, state, config) {
  const stoneCount = numOfBlocks(bot, state, config, "STONE");

  if (stoneCount <= 3) state.hasEnoughStone = false;

  if (stoneCount >= 10) state.hasEnoughStone = true;

  if (
    findInventoryItemByNames(bot, config.PICKAXES) &&
    !state.hasEnoughStone
  ) {
    return 34;
  }

  return 0;
}

function gatherCoalScore(bot, state, config) {
  const furnacePresent = findInventoryItemByNames(bot, ["furnace"]) !== null || state.hasFurnace;
  if (!furnacePresent) return 0;

  // const rawFoodCount = countItemsByNames(bot, config.ITEMS.RAWFOOD.names || []);
  // const oreCount = countItemsByNames(bot, config.FURNACE?.GOLD_IRON?.names || []);

  // const totalFood = getTotalFoodCount(bot, config);
  // const foodNeedsFuel = !shouldHuntForFood(bot, state, config) && rawFoodCount > 0 && totalFood >= (config?.FOOD_THRESHOLDS?.HUNT_STOP_AT ?? 32);
  // const oreNeedsFuel = oreCount > 0;

  // if (!foodNeedsFuel && !oreNeedsFuel) return 0;

  // const itemsPerFuelUnit = config?.FURNACE?.ITEMS_PER_FUEL_UNIT || 8;
  // const foodFuelNeed = foodNeedsFuel
  //   ? Math.max(2, Math.ceil(rawFoodCount / itemsPerFuelUnit) + 1)
  //   : 0;
  // const oreFuelNeed = oreNeedsFuel
  //   ? Math.max(2, Math.ceil(oreCount / itemsPerFuelUnit) + 1)
  //   : 0;
  // const requiredFuel = Math.max(foodFuelNeed, oreFuelNeed);
  // const currentCoal = countItemsByNames(bot, config.FURNACE?.FUEL?.names || ["coal"]);

  // if (currentCoal >= requiredFuel) return 0;
  const coalCount = countItemsByNames(bot, config.ITEMS.COAL.names || ["coal"]);
  
  if (coalCount <= 8) state.hasEnoughCoal = false;

  if (coalCount >= 16) state.hasEnoughCoal = true;
  
  if(!state.hasEnoughCoal && furnacePresent && 
    (state.hasStonePickaxe || state.hasIronPickaxe || state.hasDiamondPickaxe)) return 29;

  return 0;
}

function gatherIronScore(bot, state, config) {
  const furnacePresent = findInventoryItemByNames(bot, ["furnace"]) !== null || state.hasFurnace;
  if (!furnacePresent) return 0;
  const rawIronCount = countItemsByNames(bot, config.FURNACE?.GOLD_IRON?.names || ["raw_iron"]);
  
  if (rawIronCount <= 0) state.hasEnoughRawIron = false;

  if (rawIronCount >= 30) state.hasEnoughRawIron = true;
  
  if(!state.hasEnoughRawIron && furnacePresent && 
    (state.hasStonePickaxe || state.hasIronPickaxe || state.hasDiamondPickaxe)) return 25;

  return 0;

}
module.exports = { gatherDirtScore, gatherLogsScore, gatherStoneScore, gatherCoalScore, gatherIronScore };

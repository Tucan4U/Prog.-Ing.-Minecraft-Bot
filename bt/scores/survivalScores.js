// Survival score funkcije procjenjuju prioritet hrane i preživljavanja.
const {
  countItemsByNames,
  getTotalFoodCount,
  getFoodHuntStopThreshold,
  findInventoryItemByNames,
  shouldHuntForFood,
} = require('../../utils/inventory');

function hasNearbyFoodItem(state, config) {
  const items = state.sensors?.items || [];
  if (!Array.isArray(items) || !items.length) return false;

  const foodSet = new Set(config.ITEMS.RAWFOOD.names || []);
  return items.some((entity) => {
    const item = entity.getDroppedItem?.();
    return item && foodSet.has(item.name);
  });
}

function pickUpFoodScore(bot, state, config) {
  if (!shouldHuntForFood(bot, state, config)) return 0;
  return hasNearbyFoodItem(state, config) ? 300 : 0;
}

function cookFoodScore(bot, state, config) {
  if (state.furnaceWorkflowStarted) return 400;
  const furnacePresent = findInventoryItemByNames(bot, ["furnace"]) !== null || state.hasFurnace;
  if (!furnacePresent) return 0;

  const rawFoodCount = countItemsByNames(bot, config.ITEMS.RAWFOOD.names || []);
  if (rawFoodCount <= 0) {
    //bot.chat("No raw food available to cook.");
    return 0;
  }
  
  if (shouldHuntForFood(bot, state, config)) {
    //bot.chat("Food levels are low, prioritizing hunting for food over cooking.");
    return 0;
  }

  const stopThreshold = getFoodHuntStopThreshold(config);
  if (getTotalFoodCount(bot, config) < stopThreshold) {
    //bot.chat("Food levels are lowwwwwwwww, prioritizing hunting for food over cooking.");
    return 0;
  }

  const totalFood = getTotalFoodCount(bot, config);
  const foodNeedsFuel = !shouldHuntForFood(bot, state, config) && totalFood >= (config?.FURNACE?.FOOD_THRESHOLDS?.HUNT_STOP_AT ?? 32);

  if (!foodNeedsFuel) {
    //bot.chat("Food does not need fuel to cook.");
    return 0;
  }

  const itemsPerFuelUnit = config?.FURNACE?.ITEMS_PER_FUEL_UNIT || 8;
  const foodFuelNeed = foodNeedsFuel
    ? Math.max(2, Math.ceil(rawFoodCount / itemsPerFuelUnit) + 1)
    : 0;
  const requiredFuel =foodFuelNeed;
  const currentCoal = countItemsByNames(bot, config.FURNACE?.FUEL?.names || ["coal"]);

  if (currentCoal < requiredFuel) {
    //bot.chat(`Current coal: ${currentCoal}, required fuel: ${requiredFuel}`);
    return 0;
  }

  return 49;
}

function smeltItemsScore(bot, state, config) {
  if (state.furnaceWorkflowStarted || state.furnaceLoadPhase) return 390;
  const ironTarget = config?.FURNACE?.SMELTING_THRESHOLDS?.IRON || 30;
  const goldTarget = config?.FURNACE?.SMELTING_THRESHOLDS?.GOLD || 5;

  const furnacePresent = findInventoryItemByNames(bot, ["furnace"]) !== null || state.hasFurnace;
  if (!furnacePresent) return 0;

  const ironCount = countItemsByNames(bot, ["iron_ingot"]);
  const goldCount = countItemsByNames(bot, ["gold_ingot"]);
  if (ironCount >= ironTarget && goldCount >= goldTarget) return 0;

  const oreNames = config.FURNACE?.GOLD_IRON?.names || ["raw_iron", "raw_gold"];
  const fuelNames = config.FURNACE?.FUEL?.names || [];

  const oreCount = countItemsByNames(bot, oreNames);
  if (oreCount <= 0) return 0;

  const oreNeedsFuel = oreCount > 0;
  if (!oreNeedsFuel) return 0;

  const itemsPerFuelUnit = config?.FURNACE?.ITEMS_PER_FUEL_UNIT || 8;
  const oreFuelNeed = oreNeedsFuel
    ? Math.max(2, Math.ceil(oreCount / itemsPerFuelUnit) + 1)
    : 0;
  const requiredFuel = oreFuelNeed;
  const currentCoal = countItemsByNames(bot, config.FURNACE?.FUEL?.names || ["coal"]);

  if (currentCoal < requiredFuel) return 0;

  return 40;
}

module.exports = {
  cookFoodScore,
  smeltItemsScore,
  pickUpFoodScore,
  hasNearbyFoodItem,
};
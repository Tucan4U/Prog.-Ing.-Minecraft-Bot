const {
  findInventoryItemByNames,
  countItemsByNames,
  getTotalFoodCount,
  shouldHuntForFood,
} = require("../../utils/inventory");


function gatherDirtScore(bot, state, cfg) {
  const dirtCount = countItemsByNames(bot, cfg.BLOCKS.DIRT.names || []);

  if (dirtCount <= cfg.ITEM_THRESHOLDS.DIRT_MIN) state.hasEnoughDirt = false;

  if (dirtCount >= cfg.ITEM_THRESHOLDS.DIRT_MAX) state.hasEnoughDirt = true;

  if (!state.hasEnoughDirt) return 80;

  return 0;
}

function gatherLogsScore(bot, state, cfg) {
  const logCount = countItemsByNames(bot, cfg.BLOCKS.LOGS.names || []);

  if (logCount <= cfg.ITEM_THRESHOLDS.LOGS_MIN) state.hasEnoughLogs = false;

  if (logCount >= cfg.ITEM_THRESHOLDS.LOGS_MAX) state.hasEnoughLogs = true;

  if (!state.hasEnoughLogs) return 79;

  return 0;
}

function gatherGravelScore(bot, state, cfg) {
  const flintCount = countItemsByNames(bot, ["flint"]);
  
  if (state.hasFlintAndSteel) return 0;

  if(countItemsByNames(bot, ["crafting_table"]) < 2) return 0;

  if (flintCount >= 1) state.hasFlint = true;
  else state.hasFlint = false;

  if (!state.hasFlint && flintCount === 0) return 64;

  return 0;
}

function gatherStoneScore(bot, state, config) {
  const stoneCount = countItemsByNames(bot, config.BLOCKS.STONE.names || []);

  if (stoneCount <= config.ITEM_THRESHOLDS.STONE_MIN) state.hasEnoughStone = false;

  if (stoneCount >= config.ITEM_THRESHOLDS.STONE_MAX) state.hasEnoughStone = true;

  if (
    findInventoryItemByNames(bot, config.PICKAXES) &&
    !state.hasEnoughStone
  ) {
    return 63;
  }

  return 0;
}

function gatherCoalScore(bot, state, config) {
  const furnacePresent = findInventoryItemByNames(bot, ["furnace"]) !== null || state.hasFurnace;
  if (!furnacePresent) return 0;

  const coalCount = countItemsByNames(bot, config.ITEMS.COAL.names || ["coal"]);
  
  if (coalCount <= config.ITEM_THRESHOLDS.COAL_MIN) state.hasEnoughCoal = false;

  if (coalCount >= config.ITEM_THRESHOLDS.COAL_MAX) state.hasEnoughCoal = true;
  
  if(!state.hasEnoughCoal && furnacePresent && 
    (state.hasStonePickaxe || state.hasIronPickaxe || state.hasDiamondPickaxe)) return 50;

  return 0;
}

function gatherIronScore(bot, state, config) {
  const furnacePresent = findInventoryItemByNames(bot, ["furnace"]) !== null || state.hasFurnace;
  if (!furnacePresent) return 0;
  
  if ((state.hasIronPickaxe || state.hasDiamondPickaxe) && state.hasBucket && state.hasWaterBucket && state.hasFlintAndSteel && state.hasShield) return 0;

  const rawIronCount = countItemsByNames(bot, ["raw_iron"]);
  const ironIngotCount = countItemsByNames(bot, ["iron_ingot"]);
  const totalIron = rawIronCount + ironIngotCount;

  if (rawIronCount <= config.ITEM_THRESHOLDS.RAW_IRON_MIN && totalIron <= 0) state.hasEnoughRawIron = false;
  
  if (totalIron >= config.ITEM_THRESHOLDS.RAW_IRON_MAX) state.hasEnoughRawIron = true;
  
  if(!state.hasEnoughRawIron &&
    (state.hasStonePickaxe || state.hasIronPickaxe || state.hasDiamondPickaxe)) return 45;
 
      
  return 0;
}

function gatherGoldScore(bot, state, config) {
  const furnacePresent = findInventoryItemByNames(bot, ["furnace"]) !== null || state.hasFurnace;
  if (!furnacePresent) return 0;
  if (state.hasGoldenHelmet) return 0;
  const rawGoldCount = countItemsByNames(bot, ["raw_gold"]);
  const goldIngotCount = countItemsByNames(bot, ["gold_ingot"]);
  const totalGold = rawGoldCount + goldIngotCount;

  if (rawGoldCount <= config.ITEM_THRESHOLDS.RAW_GOLD_MIN && totalGold <= 0) state.hasEnoughRawGold = false;

  if (totalGold >= config.ITEM_THRESHOLDS.RAW_GOLD_MAX) state.hasEnoughRawGold = true;
  
  if(!state.hasEnoughRawGold  && (state.hasIronPickaxe || state.hasDiamondPickaxe)) 
    return 44;

  return 0;
}

function gatherDiamondScore(bot, state, config) {
  //bot.chat(` has enough diamond: ${state.hasEnoughDiamond}, has diamond pickaxe: ${state.hasDiamondPickaxe}, has diamond sword: ${state.hasDiamondSword}, has diamond armor: ${state.hasDiamondArmor}`);
  if (state.hasDiamondPickaxe && state.hasDiamondSword && state.hasDiamondArmor) return 0;
  const diamondCount = countItemsByNames(bot, ["diamond"]);
  if (diamondCount <= config.ITEM_THRESHOLDS.DIAMOND_MIN) state.hasEnoughDiamond = false;

  if (diamondCount >= config.ITEM_THRESHOLDS.DIAMOND_MAX) state.hasEnoughDiamond = true;
  //bot.chat(`Diamond count: ${diamondCount}, has enough diamond: ${state.hasEnoughDiamond}, has diamond pickaxe: ${state.hasDiamondPickaxe}, has diamond sword: ${state.hasDiamondSword}, has diamond armor: ${state.hasDiamondArmor}`);
  if(!state.hasEnoughDiamond && (state.hasIronPickaxe || state.hasDiamondPickaxe)) return 33;

  return 0;
}

function gatherObsidianScore(bot, state, config) {
  const obsidianCount = countItemsByNames(bot, ["obsidian"]);
  if (state.buildingPortal || state.netherPortalBuilt) return 0;

  if (obsidianCount >= config.ITEM_THRESHOLDS.OBSIDIAN_MAX) state.hasEnoughObsidian = true;
  else state.hasEnoughObsidian = false;

  if(!state.hasEnoughObsidian && state.hasWaterBucket) return 31;

  return 0;
}
module.exports = { gatherDirtScore, gatherLogsScore, gatherGravelScore, gatherStoneScore, gatherCoalScore, gatherIronScore, gatherGoldScore, gatherDiamondScore, gatherObsidianScore };

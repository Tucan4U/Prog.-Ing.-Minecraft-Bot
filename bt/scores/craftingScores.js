const { WOOD_REQUIREMENTS } = require("../../config");
const {
  numOfBlocks,
  findInventoryItemByNames,
  countItemsByNames,
  hasAllItems,
} = require("../../utils/inventory");

function hasNearbyCraftingTableItem(state, config) {
  const items = state.sensors?.items || [];
  if (!Array.isArray(items) || !items.length) return false;
  const craftingTableNames = config.ITEMS.CRAFTING_TABLE.names;
  const craftingTableSet = new Set(craftingTableNames);
  return items.some((entity) => {
    const item = entity.getDroppedItem?.();
    return item && craftingTableSet.has(item.name);
  });
}

function pickUpCraftingTableScore(bot, state, config) {
  return hasNearbyCraftingTableItem(state, config) ? 300 : 0;
}

function craftCraftingTableScore(bot, state, config) {
  if (findInventoryItemByNames(bot, ["crafting_table"]) !== null || findInventoryItemByNames(bot, config.PICKAXES) !== null) {
    state.hasCraftingTable = true;
  } else {
    state.hasCraftingTable = false;
  }

  if (state.hasCraftingTable) return 0;

  const numberOfBlocks = numOfBlocks(bot, state, config, "LOGS");
  if (numberOfBlocks < 1) return 0;

  return 39;
}

function craftFurnaceScore(bot, state, config) {
  if (findInventoryItemByNames(bot, ["furnace"]) !== null) {
    state.hasFurnace = true;
  } else {
    state.hasFurnace = false;
  }

  if (state.hasFurnace) return 0;

  

  const stoneCount = countItemsByNames(bot, config.BLOCKS.STONE.names || []);
  if (stoneCount < 8) return 0;

  if (state.furnaceWorkflowStarted) return 0;

  return 33;
}

function craftWoodenPickaxeScore(bot, state, config) {
  if (findInventoryItemByNames(bot, ["wooden_pickaxe"]) !== null && findInventoryItemByNames(bot, ["crafting_table"]) !== null) {
    state.hasWoodenPickaxe = true;
  } else {
    state.hasWoodenPickaxe = false;
  }

  if (
    state.hasWoodenPickaxe ||
    state.hasStonePickaxe ||
    state.hasIronPickaxe ||
    state.hasDiamondPickaxe
  )
    return 0;
  

  const logCount = countItemsByNames(bot, config.BLOCKS.LOGS.names || []);
  if (logCount < 2) return 0;

  return 35;
}

function craftStonePickaxeScore(bot, state, config) {
  if (findInventoryItemByNames(bot, ["stone_pickaxe"]) !== null && findInventoryItemByNames(bot, ["crafting_table"]) !== null) {
    state.hasStonePickaxe = true;
  } else {
    state.hasStonePickaxe = false;
  }
  

  if (state.hasStonePickaxe || state.hasIronPickaxe || state.hasDiamondPickaxe)
    return 0;

  // INPUT : 3 COBBLESTONE + 1 LOG
  const stoneCount = countItemsByNames(bot, config.BLOCKS.STONE.names || []);
  if (stoneCount < 3) return 0;

  const logCount = countItemsByNames(bot, config.BLOCKS.LOGS.names || []);
  if (logCount < 1) return 0;
  //console.log("CRAFTING stone pickaxe");
  return 36;
}

function craftIronPickaxeScore(bot, state, config) {
  if (findInventoryItemByNames(bot, ["iron_pickaxe"]) !== null && findInventoryItemByNames(bot, ["crafting_table"]) !== null) {
    state.hasIronPickaxe = true;
  } else {
    state.hasIronPickaxe = false;
  }

  if (state.hasIronPickaxe || state.hasDiamondPickaxe) return 0;

  

  // INPUT : 3 IRON INGOTS + 1 LOG
  const ironCount = countItemsByNames(bot, ["iron_ingot"]);
  if (ironCount < 3) return 0;

  const logCount = countItemsByNames(bot, config.BLOCKS.LOGS.names || []);
  if (logCount < 1) return 0;

  return 37;
}
function craftBucketScore(bot, state, config) {
  if (findInventoryItemByNames(bot, ["bucket"]) !== null && findInventoryItemByNames(bot, ["crafting_table"]) !== null) {
    state.hasBucket = true;
  } else {
    state.hasBucket = false;
  }
  if (state.hasBucket) return 0;
  // INPUT : 3 IRON INGOTS + 1 LOG
  const ironCount = countItemsByNames(bot, ["iron_ingot"]);
  if (ironCount < 3) return 0;
  return 36;
}

function craftIronArmorScore(bot, state, config) {
  if(hasAllItems(bot, config.IRON_ARMOR) && findInventoryItemByNames(bot, ["crafting_table"]) !== null) {
    state.hasIronArmor = true;
  }
  if(state.hasIronArmor) return 0;

  if(!state.hasCraftingTable) return 0;

  const ironCount = countItemsByNames(bot, ["iron_ingot"]);
  if (ironCount < 19) return 0;

  return 36;
}

function craftDiamondPickaxeScore(bot, state, config) {
  if (findInventoryItemByNames(bot, ["diamond_pickaxe"]) !== null && findInventoryItemByNames(bot, ["crafting_table"]) !== null) {
    state.hasDiamondPickaxe = true;
  } else {
    state.hasDiamondPickaxe = false;
  }

  if (state.hasDiamondPickaxe) return 0;

  
  // INPUT : 3 DIAMONDS + 1 LOG
  const diamondCount = countItemsByNames(bot, ["diamond"]);
  if (diamondCount < 3) return 0;

  const logCount = countItemsByNames(bot, config.BLOCKS.LOGS.names || []);
  if (logCount < 1) return 0;

  return 38;
}

module.exports = {
  craftCraftingTableScore,
  craftFurnaceScore,
  pickUpCraftingTableScore,
  craftWoodenPickaxeScore,
  craftStonePickaxeScore,
  craftIronPickaxeScore,
  craftDiamondPickaxeScore,
  craftIronArmorScore,
  craftBucketScore,
};

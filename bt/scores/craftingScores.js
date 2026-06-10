const {
  findInventoryItemByNames,
  countItemsByNames,
  hasAllItems,
  hasAnyItem,
  checkOffhand,
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
  if (findInventoryItemByNames(bot, ["crafting_table"]) !== null) {
    state.hasCraftingTable = true;
  } else {
    state.hasCraftingTable = false;
  }

  if (state.hasCraftingTable) return 0;

  const logCount = countItemsByNames(bot, config.BLOCKS.LOGS.names || []);
  if (logCount < 2) return 0;

  return 69;
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

  return 62;
}

function craftWoodenPickaxeScore(bot, state, config) {
  if (findInventoryItemByNames(bot, ["wooden_pickaxe"]) !== null) {
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

  return 65;
}

function craftStonePickaxeScore(bot, state, config) {
  if (findInventoryItemByNames(bot, ["stone_pickaxe"]) !== null) {
    state.hasStonePickaxe = true;
  } else {
    state.hasStonePickaxe = false;
  }
  

  if (state.hasStonePickaxe || state.hasIronPickaxe || state.hasDiamondPickaxe || !state.hasCraftingTable)
    return 0;

  // INPUT : 3 COBBLESTONE + 1 LOG
  const stoneCount = countItemsByNames(bot, config.BLOCKS.STONE.names || []);
  if (stoneCount < 3) return 0;

  const logCount = countItemsByNames(bot, config.BLOCKS.LOGS.names || []);
  if (logCount < 1) return 0;
  //console.log("CRAFTING stone pickaxe");
  return 66;
}

function craftStoneAxeScore(bot, state, config) {
  if (findInventoryItemByNames(bot, ["stone_axe"]) !== null) {
    state.hasStoneAxe = true;
  } else {
    state.hasStoneAxe = false;
  }
  

  if (state.hasStoneAxe || !state.hasCraftingTable)
    return 0;

  // INPUT : 3 COBBLESTONE + 1 LOG
  const stoneCount = countItemsByNames(bot, config.BLOCKS.STONE.names || []);
  if (stoneCount < 3) return 0;

  const logCount = countItemsByNames(bot, config.BLOCKS.LOGS.names || []);
  if (logCount < 1) return 0;  
  return 61; 
}

function craftIronPickaxeScore(bot, state, config) {
  if (findInventoryItemByNames(bot, ["iron_pickaxe"]) !== null) {
    state.hasIronPickaxe = true;
  } else {
    state.hasIronPickaxe = false;
  }

  if (state.hasIronPickaxe || state.hasDiamondPickaxe || !state.hasCraftingTable) return 0;

  // INPUT : 3 IRON INGOTS + 1 LOG
  const ironCount = countItemsByNames(bot, ["iron_ingot"]);
  if (ironCount < 3) return 0;

  const logCount = countItemsByNames(bot, config.BLOCKS.LOGS.names || []);
  if (logCount < 1) return 0;

  return 67;
}
function craftBucketScore(bot, state, config) {
  if (findInventoryItemByNames(bot, ["bucket"]) !== null) {
    state.hasBucket = true;
  } else {
    state.hasBucket = false;
  }
  if (state.hasBucket || !state.hasCraftingTable || state.hasWaterBucket) return 0;
  // INPUT : 3 IRON INGOTS + 1 LOG
  const ironCount = countItemsByNames(bot, ["iron_ingot"]);
  if (ironCount < 3) return 0;
  return 39;
}

function craftFlintAndSteelScore(bot, state, config) {
  if (findInventoryItemByNames(bot, ["flint_and_steel"]) !== null) {
    state.hasFlintAndSteel = true;
  } else {
    state.hasFlintAndSteel = false;
  }
  if (state.hasFlintAndSteel || !state.hasCraftingTable) return 0;
  // INPUT : 1 FLINT + 1 IRON INGOT
  const flintCount = countItemsByNames(bot, ["flint"]);
  if (flintCount < 1) return 0;
  const ironCount = countItemsByNames(bot, ["iron_ingot"]);
  if (ironCount < 1) return 0;
  return 37;
}

function craftShieldScore(bot, state, config) {
  if (findInventoryItemByNames(bot, ["shield"]) !== null || hasAllItems(bot, ["shield"])) {
    state.hasShield = true;
  } else {
    state.hasShield = false;
  }
  if (state.hasShield || !state.hasCraftingTable) return 0;
  // INPUT : 1 IRON INGOT + 6 WOOD PLANKS
  const ironCount = countItemsByNames(bot, ["iron_ingot"]);
  if (ironCount < 1) return 0;
  const logCount = countItemsByNames(bot, config.BLOCKS.LOGS.names || []);
  if (logCount < 1) return 0;
  return 38;
}

function craftGoldenHelmetScore(bot, state, config) {
  if(hasAnyItem(bot, ["golden_helmet"]) || bot.entity.equipment[5]?.name === "golden_helmet") {
    state.hasGoldenHelmet = true;
  }
  if(state.hasGoldenHelmet || !state.hasCraftingTable) return 0;

  const goldCount = countItemsByNames(bot, ["gold_ingot"]);
  if (goldCount < 5) return 0;

  return 36;
}

function craftDiamondPickaxeScore(bot, state, config) {
  if (findInventoryItemByNames(bot, ["diamond_pickaxe"]) !== null) {
    state.hasDiamondPickaxe = true;
  } else {
    state.hasDiamondPickaxe = false;
  }

  if (state.hasDiamondPickaxe || !state.hasCraftingTable) return 0;
  
  // INPUT : 3 DIAMONDS + 1 LOG
  const diamondCount = countItemsByNames(bot, ["diamond"]);
  if (diamondCount < 3) return 0;

  const logCount = countItemsByNames(bot, config.BLOCKS.LOGS.names || []);
  if (logCount < 1) return 0;

  return 68;
}

function craftDiamondSwordScore(bot, state, config) {
  if (findInventoryItemByNames(bot, ["diamond_sword"]) !== null) {
    state.hasDiamondSword = true;
  } else {
    state.hasDiamondSword = false;
  }

  if (state.hasDiamondSword || !state.hasCraftingTable) return 0;
  
  // INPUT : 2 DIAMONDS + 1 LOG
  const diamondCount = countItemsByNames(bot, ["diamond"]);
  if (diamondCount < 2) return 0;

  const logCount = countItemsByNames(bot, config.BLOCKS.LOGS.names || []);
  if (logCount < 1) return 0;

  return 35;
}

function craftDiamondArmorScore(bot, state, config) {
  if(hasAllItems(bot, config.ARMOR.DIAMOND_ARMOR)) {
    state.hasDiamondArmor = true;
  } else {
    state.hasDiamondArmor = false;
  }
  //bot.chat(`has diamond armor: ${state.hasDiamondArmor}`);
  if(state.hasDiamondArmor || !state.hasCraftingTable) return 0;

  const diamondCount = countItemsByNames(bot, ["diamond"]);
  if (diamondCount < 19) return 0;

  return 34;
}

module.exports = {
  craftCraftingTableScore,
  craftFurnaceScore,
  pickUpCraftingTableScore,
  craftWoodenPickaxeScore,
  craftStonePickaxeScore,
  craftStoneAxeScore,
  craftIronPickaxeScore,
  craftDiamondPickaxeScore,
  craftShieldScore,
  craftGoldenHelmetScore,
  craftBucketScore,
  craftFlintAndSteelScore,
  craftDiamondSwordScore,
  craftDiamondArmorScore,
};

const { hasAnyItem } = require("../../utils/inventory");

function resetScore(bot, state, config) {
  state.hasCraftingTable = hasAnyItem(bot, ["crafting_table"]) || false;
  state.hasWoodenPickaxe = hasAnyItem(bot, ["wooden_pickaxe"]) || false;
  state.hasStonePickaxe = hasAnyItem(bot, ["stone_pickaxe"]) || false;
  state.hasIronPickaxe = hasAnyItem(bot, ["iron_pickaxe"]) || false;
  state.hasDiamondPickaxe = hasAnyItem(bot, ["diamond_pickaxe"]) || false;
  state.hasFurnace = hasAnyItem(bot, ["furnace"]) || false;
  
  return 1;
}

module.exports = { resetScore };
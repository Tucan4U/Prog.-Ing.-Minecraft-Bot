const { hasAnyItem, hasAllItems } = require("../../utils/inventory");

function resetScore(bot, state, config) {
  state.hasCraftingTable = hasAnyItem(bot, ["crafting_table"]) || false;
  state.hasFurnace = hasAnyItem(bot, ["furnace"]) || false;
  state.hasWoodenPickaxe = hasAnyItem(bot, ["wooden_pickaxe"]) || false;
  state.hasStonePickaxe = hasAnyItem(bot, ["stone_pickaxe"]) || false;
  state.hasStoneAxe = hasAnyItem(bot, ["stone_axe"]) || false;
  state.hasIronPickaxe = hasAnyItem(bot, ["iron_pickaxe"]) || false;
  state.hasDiamondPickaxe = hasAnyItem(bot, ["diamond_pickaxe"]) || false;
  state.hasDiamondSword = hasAnyItem(bot, ["diamond_sword"]) || false;

  state.hasIronArmor = hasAllItems(bot, config.ARMOR?.IRON_ARMOR) || false;
  state.hasGoldenHelmet = hasAnyItem(bot, ["golden_helmet"]) || false;
  state.hasBucket = hasAnyItem(bot, ["bucket"]) || false;
  return 1;
}

module.exports = { resetScore };
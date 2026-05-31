const {
  numOfBlocks,
  findInventoryItemByNames,
} = require("../../utils/inventory");

function craftWoodenPickaxeScore(bot, state, config) {
  if (state.mission.hasWoodenPickaxe) return 0;

  const numberOfBlocks = numOfBlocks(bot, state, config, "LOGS");
  if (numberOfBlocks < 5) return 0;
  console.log("state.digtask: ", state.digTask);
  if (
    findInventoryItemByNames(bot, ["wooden_pickaxe"]) !== null &&
    findInventoryItemByNames(bot, ["crafting_table"])
  )
    state.mission.hasWoodenPickaxe = true;
  return 140;
}

function craftCraftingTableScore(bot, state, config) {
  if (state.mission.hasCraftingTable) return 0;

  console.log(
    "Crafting table score: ",
    findInventoryItemByNames(bot, ["crafting_table"]),
  );

  if (findInventoryItemByNames(bot, ["crafting_table"]) !== null)
    state.mission.hasCraftingTable = true;

  const numberOfBlocks = numOfBlocks(bot, state, config, "LOGS");
  if (numberOfBlocks < 5) return 0;

  return 155;
}

function craftStonePickaxeScore(bot, state, config) {
  if (state.mission.hasStonePickaxe) return 0;

  const numberOfBlocks = numOfBlocks(bot, state, config, "STONE");
  if (numberOfBlocks < 3) return 0;

  if (
    findInventoryItemByNames(bot, ["stone_pickaxe"]) &&
    findInventoryItemByNames(bot, ["crafting_table"]) !== null
  )
    state.mission.hasStonePickaxe = true;

  return 145;
}

module.exports = {
  craftCraftingTableScore,
  craftWoodenPickaxeScore,
  craftStonePickaxeScore,
};

const {
  numOfBlocks,
  findInventoryItemByNames,
  numOfItems,
} = require("../../utils/inventory");
const { findItem } = require('../../behaviors/loot');


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

function tablePickUpScore(bot, state, config) {
  const droppedTable = findItem(bot, config.ITEMS.CRAFTING_TABLE.names);
  return droppedTable ? 190 : 0; 

}

function placeTableScore(bot, state, config){
  if (!state.needsGold) return 0;

  const tableCount = numOfItems(bot, state, config, "CRAFTING_TABLE");

  if (tableCount === 0) return 0;

  const goldCountNuggets = numOfItems(bot, state, config, "GOLD_NUGGETS");

  const goldCountIngots = numOfItems(bot, state, config, "GOLD_INGOTS");

  if (goldCountNuggets >= 9 && goldCountIngots < state.neededGold){
    return 189;
  }else if (goldCountIngots >= state.neededGold){
    state.needsGold = false;
    state.neededGold = 16;
    return 0;
  }else{
    return 0;
  }
}

function useTableScore(bot, state, config){
  if (!state.needsGold) return 0;

  const goldCountNuggets = numOfItems(bot, state, config, "GOLD_NUGGETS");

  const goldCountIngots = numOfItems(bot, state, config, "GOLD_INGOTS");

  if (goldCountNuggets >= 9 && goldCountIngots < state.neededGold){
    bot.chat(`I have ${goldCountIngots} golden ingots`);
    return 188;
  }else if (goldCountIngots >= state.neededGold){
    state.needsGold = false;
    state.neededGold = 16;
    return 0;
  }else{
    return 0;
  }
}

function breakTableScore(bot, state, config){
  if (!state.needsGold) return 0;

  

  const tableCount = numOfItems(bot, state, config, "CRAFTING_TABLE");

  if (tableCount === 0) {
    state.mission.placedItems["crafting_table"] = 0;
    return 187;
  }

  return 0;

}

module.exports = {
  craftCraftingTableScore,
  craftWoodenPickaxeScore,
  craftStonePickaxeScore,
  tablePickUpScore,
  placeTableScore,
  useTableScore,
  breakTableScore,
};

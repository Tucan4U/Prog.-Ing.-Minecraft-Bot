const { numOfBlocks, hasItemInInventory } = require("../../utils/inventory");

function craftWoodenPickaxeScore(bot, state, config) {
  const numberOfBlocks = numOfBlocks(bot, state, config, "LOGS");
  if (numberOfBlocks < 5) return 0;
  console.log("state.digtask: ", state.digTask);
  if (hasItemInInventory(bot, "wooden_pickaxe") && !state.digTask) return 0;
  return 140;
}

module.exports = { craftWoodenPickaxeScore };

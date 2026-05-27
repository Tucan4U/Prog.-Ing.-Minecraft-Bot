const { numOfBlocks } = require("../../utils/inventory");

function craftCraftingTableScore(bot, state, config) {
  const numberOfBlocks = numOfBlocks(bot, state, config, "LOGS");
  if (numberOfBlocks < 10) return 0;
  return 140;
}

module.exports = { craftCraftingTableScore };

const {
  numOfBlocks,
  findInventoryItemByNames,
} = require("../../utils/inventory");

function breakDirtScore(bot, state, cfg) {
  const dirtCount = numOfBlocks(bot, state, cfg, "DIRT");

  if (dirtCount <= 2) state.hasEnoughDirt = false;

  if (dirtCount >= 10) state.hasEnoughDirt = true;

  if (!state.hasEnoughDirt) return 250;

  return 0;
}

function breakLogsScore(bot, state, cfg) {
  const logCount = numOfBlocks(bot, state, cfg, "LOGS");

  if (logCount <= 2) state.hasEnoughLogs = false;

  if (logCount >= 10) state.hasEnoughLogs = true;

  if (!state.hasEnoughLogs) return 130;

  return 0;
}

function breakStoneScore(bot, state, config) {
  const stoneCount = numOfBlocks(bot, state, config, "STONE");

  if (stoneCount <= 3) state.hasEnoughStone = false;

  if (stoneCount >= 10) state.hasEnoughStone = true;

  if (
    findInventoryItemByNames(bot, ["wooden_pickaxe"]) &&
    !state.hasEnoughStone
  ) {
    return 120;
  }

  return 0;
}
module.exports = { breakLogsScore, breakStoneScore, breakDirtScore };

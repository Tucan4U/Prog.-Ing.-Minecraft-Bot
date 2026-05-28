const { numOfBlocks } = require("../../utils/inventory");

function breakLogsScore(bot, state, cfg) {
  const logCount = numOfBlocks(bot, state, cfg, "LOGS");

  if (logCount <= 2) state.hasEnoughLogs = false;

  if (logCount >= 10) state.hasEnoughLogs = true;

  if (!state.hasEnoughLogs) return 130;

  return 0;
}
module.exports = { breakLogsScore };

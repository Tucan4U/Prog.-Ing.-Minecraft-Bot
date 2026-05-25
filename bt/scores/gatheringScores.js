const { numOfBlocks } = require("../../utils/inventory");

function breakLogsScore(bot, state, cfg) {
  const logCount = numOfBlocks(bot, state, cfg, "LOGS");

  if (logCount <= 10) return 130;

  if (state["blockTarget"]) return 130;

  return 0;
}
module.exports = { breakLogsScore };
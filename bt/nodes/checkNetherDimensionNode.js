const { Node } = require("../behaviorTree");

// Detects whether the bot is already inside the Nether and cancels redundant enter requests.
// This avoids trying to re-enter a portal when the bot is already in the correct dimension.
class CheckNetherDimensionNode extends Node {
  constructor() {
    super("CheckNetherDimension");
    this.lastDimension = null;
  }

  async tick(bot, state) {
    const currentDim = bot.game ? bot.game.dimension : "unknown";
    
    if (currentDim === "the_nether") {
      if (this.lastDimension !== "the_nether") {
        bot.chat("I am already in the Nether. Nothing to do.");
      }
      this.lastDimension = currentDim;
      // Clear the enter request if the bot has already arrived in the Nether.
      if (state.mission?.enterNetherRequested) {
        state.mission.enterNetherRequested = false;
      }
      return "FAILURE";
    }
    
    // Reset flag when back in overworld
    this.lastDimension = currentDim;
    return "SUCCESS";
  }
}

module.exports = CheckNetherDimensionNode;

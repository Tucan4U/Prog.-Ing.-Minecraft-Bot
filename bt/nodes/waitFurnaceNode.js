const { Node } = require("../behaviorTree");

class WaitFurnaceNode extends Node {
  constructor(bufferMs = 2000) {
    super("WaitFurnace");
    this.bufferMs = bufferMs;
  }

  async tick(bot, state, config) {
    if (!state.furnaceExpectedCompleteAt) {
      bot.chat("WAIT FURNACE -> Missing expected completion time.");
      return "FAILURE";
    }

    // Drži bot u rupi malo duže od izračunatog vremena zbog sigurnosnog buffera.
    const readyAt = state.furnaceExpectedCompleteAt + this.bufferMs;
    const now = Date.now();

    if (now < readyAt) {
      const remainingMs = readyAt - now;
      console.log(`[WaitFurnace] RUNNING remaining=${Math.ceil(remainingMs / 1000)}s`);
      return "RUNNING";
    }

    console.log("[WaitFurnace] SUCCESS");
    return "SUCCESS";
  }
}

module.exports = WaitFurnaceNode;

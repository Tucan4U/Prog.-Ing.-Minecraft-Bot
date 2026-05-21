const { Node } = require("../behaviorTree");
const mcData = require("minecraft-data");

class FindLogNode extends Node {
  constructor() {
    super("FindLog");
    this.mcData = null;
  }

  async tick(bot, state, config) {
    if (!this.mcData) {
      this.mcData = mcData(bot.version);
    }

    let log = state.logTarget;

    if (log && !bot.blockAt(log.position)) {
      console.log("Log invalid");
      state.logTarget = null;
      log = null;
    }

    if (log) {
      return "SUCCESS";
    }

    const logs = bot.findBlocks({
      maxDistance: state.maxLogDistance,
      matching: config.LOGS.map(
        (name) => this.mcData.blocksByName[name]?.id,
      ).filter(Boolean),
      count: 1,
    });

    if (!logs.length) {
      console.log("No logs found nearby, expanding search radius");
      state.maxLogDistance *= 2;
      return "FAILURE";
    }
    state.maxLogDistance = 4;
    state.logTarget = bot.blockAt(logs[0]);
    console.log(`New log found: ${logs[0].x}, ${logs[0].y}, ${logs[0].z}`);
    return "SUCCESS";
  }
}

module.exports = FindLogNode;

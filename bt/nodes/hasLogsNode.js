const { Node } = require("../behaviorTree");

class HasLogsNode extends Node {
  constructor() {
    super("HasLogs");
  }

  async tick(bot, state, config) {
    const logCount = bot.inventory
      .items()
      .filter((item) => config.LOGS.includes(item.name))
      .reduce((count, item) => count + item.count, 0);

    return logCount >= config.LOG_COUNT ? "FAILURE" : "SUCCESS";
  }
}

module.exports = HasLogsNode;

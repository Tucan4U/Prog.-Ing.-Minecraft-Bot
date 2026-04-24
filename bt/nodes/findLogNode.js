const { Node } = require('../behaviorTree');

class FindLogNode extends Node {
  constructor() {
    super("FindLog");
  }

  async tick(bot, state, config) {
    const mcData = require('minecraft-data')(bot.version);

    // count logs already in inventory
    const currentLogs = bot.inventory
      .items()
      .filter((item) => item.name.endsWith('_log'))
      .reduce((sum, item) => sum + item.count, 0);

    if (currentLogs >= config.LOG_TARGET_COUNT) {
      console.log(`Have enough logs (${currentLogs}/${config.LOG_TARGET_COUNT})`);
      state.logTarget = null;
      return 'FAILURE';
    }

    // reuse existing valid target
    if (state.logTarget) {
      const stillThere = bot.blockAt(state.logTarget.position);
      if (stillThere && stillThere.name !== 'air') {
        return 'SUCCESS';
      }
      state.logTarget = null;
    }

    // gather all log block ids
    const logIds = mcData.blocksArray
      .filter((b) => b.name.endsWith('_log'))
      .map((b) => b.id);

    const block = bot.findBlock({
      matching: logIds,
      maxDistance: 64,
    });

    if (!block) {
      console.log("No logs found nearby");
      return 'FAILURE';
    }

    state.logTarget = block;
    console.log(`Found log at ${block.position}`);
    return 'SUCCESS';
  }
}

module.exports = FindLogNode;

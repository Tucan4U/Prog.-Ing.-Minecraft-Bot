const MoveToBlockNode = require('./moveToBlockNode');

// Specialized MoveToBlockNode for moving to blaze spawners. 
// Clears the search request and target from state upon success.
class MoveToBlazeSpawnerNode extends MoveToBlockNode {
  constructor() {
    super('blazeSpawnerBlock', 1, 3);
  }

  async tick(bot, state, config) {
    const result = await super.tick(bot, state, config);

    if (result === "SUCCESS") {
      bot.chat("Reached blaze spawner.");

      // Clear the blaze spawner search request and target from state to prevent repeated attempts.
      state.mission.findBlazeSpawnerRequested = false;
      state.blazeSpawnerBlock = null;
    }

    return result;
  }
}

module.exports = MoveToBlazeSpawnerNode;
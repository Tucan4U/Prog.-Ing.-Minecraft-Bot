const { Node } = require('../behaviorTree');
const { goals } = require('mineflayer-pathfinder');

class MoveToLogNode extends Node {
  constructor() {
    super("MoveToLog");

    this.lastGoal = null; // cache to avoid spamming pathfinder
  }

  async tick(bot, state) {
    const block = state.logTarget;

    if (!block) {
      return 'FAILURE';
    }

    // block was broken by someone else
    const current = bot.blockAt(block.position);
    if (!current || current.name === 'air') {
      state.logTarget = null;
      return 'FAILURE';
    }

    const dist = bot.entity.position.distanceTo(block.position);

    if (dist < 3) {
      return 'SUCCESS';
    }

    const goal = `${block.position.x}:${block.position.y}:${block.position.z}`;

    if (this.lastGoal !== goal) {
      bot.pathfinder.setGoal(new goals.GoalNear(
        block.position.x,
        block.position.y,
        block.position.z,
        2
      ));

      this.lastGoal = goal;
    }

    return 'RUNNING';
  }
}

module.exports = MoveToLogNode;

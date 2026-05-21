const { Node } = require("../behaviorTree");
const { goals } = require("mineflayer-pathfinder");

class MoveToBlockNode extends Node {
  constructor() {
    super("MoveToBlock");

    this.lastGoal = null; // cache da ne spamamo pathfinder
  }

  async tick(bot, state) {
    const target = state.logTarget;

    // nema targeta → ne možemo raditi
    if (!target) {
      return "FAILURE";
    }

    // block više ne postoji / nije validan
    const block = bot.blockAt(target.position);
    if (!block || block.type === 0) {
      state.logTarget = null;
      return "FAILURE";
    }

    const dist = bot.entity.position.distanceTo(block.position);

    // dovoljno blizu → gotovo kretanje
    if (dist < 6) {
      return "SUCCESS";
    }

    // postavi goal samo ako se promijenio
    const goal = `${block.position.x}:${block.position.y}:${block.position.z}`;

    if (this.lastGoal !== goal) {
      bot.pathfinder.setGoal(
        new goals.GoalNear(
          block.position.x,
          block.position.y,
          block.position.z,
          2,
        ),
      );

      this.lastGoal = goal;
    }

    return "RUNNING";
  }
}

module.exports = MoveToBlockNode;

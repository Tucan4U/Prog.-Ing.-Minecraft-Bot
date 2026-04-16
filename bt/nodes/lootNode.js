const { Node } = require('../behaviorTree');
const { goals } = require('mineflayer-pathfinder');
const { findFood } = require('../../behaviors/loot');

// za sada radi samo sa hranon, treba proširit na drugi loot (npr. iteme koje dropaju mobovi)
class LootNode extends Node {
  constructor() {
    super("LootNode");
  }
  async tick(bot, state, config) {
    const food = findFood(bot, config.FOOD);
    if (!food) return 'FAILURE';

    state.lootTarget = food;

    bot.pathfinder.setGoal(new goals.GoalBlock(
      food.position.x,
      food.position.y,
      food.position.z
    ));

    const dist = bot.entity.position.distanceTo(food.position);

    if (dist < 1.5) {
      state.lootTarget = null;
      return 'SUCCESS';
    }

    return 'RUNNING';
  }
}

module.exports = LootNode;
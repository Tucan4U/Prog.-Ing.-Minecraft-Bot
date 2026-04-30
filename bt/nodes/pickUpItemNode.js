const { Node } = require('../behaviorTree');
const { goals } = require('mineflayer-pathfinder');
const { findItem } = require('../../behaviors/loot');

// Prima listu itema iz configa koje treba pokupiti, traži ih u svijetu i ide prema njima. Kad je dovoljno blizu, 
// vraća SUCCESS da se može pokupiti
class PickUpItemNode extends Node {
  constructor(configKey) {
    super("PickUpItemNode");
    this.configKey = configKey;
  }
  async tick(bot, state, config) {
    const itemsCache = state.sensors?.items;
    const item = findItem(bot, config[this.configKey], itemsCache);
    if (!item) return 'FAILURE';

    state.lootTarget = item;

    bot.pathfinder.setGoal(new goals.GoalBlock(
      item.position.x,
      item.position.y,
      item.position.z
    ));

    const dist = bot.entity.position.distanceTo(item.position);

    if (dist < 1.5) {
      state.lootTarget = null;
      return 'SUCCESS';
    }

    return 'RUNNING';
  }
}

module.exports = PickUpItemNode;
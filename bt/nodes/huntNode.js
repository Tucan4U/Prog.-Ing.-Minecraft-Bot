const { Node } = require('../behaviorTree');
const { goals } = require('mineflayer-pathfinder');
const { findAnimals } = require('../../behaviors/findEnteties');
const { getClosestEntity } = require('../../utils/target');
const { equipBestWeapon } = require('../../utils/inventory');

class HuntNode extends Node {
  constructor() {
    super("HuntNode");
  }
  async tick(bot, state, config) {

    let target = state.currentTarget;

    // VALIDACIJA
    if (target && !bot.entities[target.id]) { // Ghost target
      state.currentTarget = null;
      target = null;
    }

    // NAĐI TARGET
    if (!target) {
      const animals = findAnimals(bot, config.ANIMALS);
      if (!animals.length) return 'FAILURE';

      target = getClosestEntity(bot, animals);
      state.currentTarget = target;
    }

    const dist = bot.entity.position.distanceTo(target.position);

    // MOVE
    if (dist > 3) {
      bot.pathfinder.setGoal(new goals.GoalNear(
        target.position.x,
        target.position.y,
        target.position.z,
        2
      ));
      console.log(`Target: ${state.currentTarget?.name || "none"}, Distance: @ ${Math.round(dist)} blocks`);
      return 'RUNNING';
    }

    // COMBAT
    state.equippedWeapon = null;
    await equipBestWeapon(bot, config.WEAPONS, state);
    console.log(`Target: ${state.currentTarget?.name || "none"}, Distance: @ ${Math.round(dist)} blocks`);
    bot.lookAt(target.position);
    bot.attack(target, true);

    return 'RUNNING';
  }
}

module.exports = HuntNode;
const { Node } = require('../behaviorTree');
const { equipBestWeapon } = require('../../utils/inventory');

class AttackNode extends Node {
  constructor() {
    super("Attack");
  }

  async tick(bot, state, config) {

    const target = state.currentTarget;

    // nema targeta
    if (!target) {
      return 'FAILURE';
    }

    // target više ne postoji (NAJBITNIJE za ghost bug), NE KORISTI target.isDead jer zbog nekeg razloga ne dela
    if (!bot.entities[target.id]) {
      console.log("Target disappeared");

      state.currentTarget = null;
      return 'FAILURE';
    }

    const dist = bot.entity.position.distanceTo(target.position);

    // predaleko → vrati na Move node
    if (dist > 4) {
      return 'FAILURE';
    }

    // opremi weapon (cache već imaš)
    await equipBestWeapon(bot, config.WEAPONS, state);

    await bot.lookAt(target.position, true);
    // napad (koristi cooldown)
    bot.attack(target, true);

    return 'RUNNING';
  }
}

module.exports = AttackNode;
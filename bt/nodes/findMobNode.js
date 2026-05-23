const { Node } = require('../behaviorTree');
const { findMobs } = require('../../behaviors/findEnteties');
const { getClosestEntity } = require('../../utils/target');

class FindMobNode extends Node {
  constructor(configKey, stateKey = 'currentTarget') {
    super('FindMob');
    this.configKey = configKey;
    this.stateKey = stateKey;
  }

  async tick(bot, state, config) {
    let target = state[this.stateKey];

    // Ghost target cleanup if entity despawned.
    if (target && !bot.entities[target.id]) {
      console.log('Target invalid');
      state[this.stateKey] = null;
      target = null;
    }

    if (target) {
      return 'SUCCESS';
    }

    const filter = config[this.configKey];
    const entitiesCache = state.sensors?.entities;
    const mobs = findMobs(bot, filter, entitiesCache);

    if (!mobs.length) {
      return 'FAILURE';
    }

    target = getClosestEntity(bot, mobs);
    state[this.stateKey] = target;

    console.log(`New target: ${target.name}`);
    bot.chat(`New target: ${target.name}`);

    return 'SUCCESS';
  }
}

module.exports = FindMobNode;
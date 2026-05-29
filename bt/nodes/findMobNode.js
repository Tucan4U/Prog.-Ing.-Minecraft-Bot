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
    if (state.isEating) return "FAILURE"; //  (prevents combat while eating)

    let currentTarget = state[this.stateKey];

    // Ghost target cleanup if entity despawned.
    if (currentTarget && !bot.entities[currentTarget.id]) {
      console.log('Target disappeared (Ghost clean)');
      state[this.stateKey] = null;
      currentTarget = null;
    }

    // if (target) {
    //   return 'SUCCESS';
    // }

    const filter = config[this.configKey];
    const entitiesCache = state.sensors?.entities;
    const mobs = findMobs(bot, filter, entitiesCache);

    if (!mobs.length) {

      if (currentTarget) {
        if (bot.pvp?.target) bot.pvp.stop();
        state[this.stateKey] = null;
      }

      return 'FAILURE';
    }

    const closestMob = getClosestEntity(bot, mobs);

    if (!currentTarget) {
      state[this.stateKey] = closestMob;
      console.log(`New target: ${closestMob.name}`);
    } else if (currentTarget.id !== closestMob.id) {
      const distToCurrent = bot.entity.position.distanceTo(currentTarget.position);
      const distToClosest = bot.entity.position.distanceTo(closestMob.position);

      if (distToCurrent - distToClosest > 2.5) { // Only switch if the new target is significantly closer
        console.log(`Switching target from ${currentTarget.name} to closer ${closestMob.name}`);

        if (bot.pvp?.target) {
          bot.pvp.stop(); // Stop current PvP if we are switching targets
        }

        state[this.stateKey] = closestMob;
      }
    }

    // DEBUG
    // console.log(`New target: ${target.name}`);
    // bot.chat(`New target: ${target.name}`);

    return 'SUCCESS';
  }
}

module.exports = FindMobNode;
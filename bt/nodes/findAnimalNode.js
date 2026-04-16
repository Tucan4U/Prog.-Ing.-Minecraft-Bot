const { Node } = require('../behaviorTree');
const { findAnimals } = require('../../behaviors/findEnteties');
const { getClosestEntity } = require('../../utils/target');

class FindAnimalNode extends Node {
  constructor() {
    super("FindAnimal");
  }

  async tick(bot, state, config) {

    let target = state.currentTarget;

    // VALIDACIJA
    if (target && !bot.entities[target.id]) { // Ghost target (postojalo je prije nego što je ubijeno ili despawnano, ali sada više ne postoji)
      console.log("Target invalid");
      state.currentTarget = null;
      target = null;
    }

    // AKO već imamo target → OK
    if (target) {
      return 'SUCCESS';
    }

    // TRAŽI NOVI
    const animals = findAnimals(bot, config.ANIMALS);

    if (!animals.length) {
      return 'FAILURE';
    }

    target = getClosestEntity(bot, animals);
    state.currentTarget = target;

    console.log(`New target: ${target.name}`);

    return 'SUCCESS';
  }
}

module.exports = FindAnimalNode;
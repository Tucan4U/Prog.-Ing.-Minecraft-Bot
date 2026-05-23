// Combat score funkcije procjenjuju isplativost lova na različite targete.
const { needsFood } = require('../../utils/inventory');
const { findMobs } = require('../../behaviors/findEnteties');

function huntAnimalsScore(bot, state, config) {
  if (!needsFood(bot, state, config)) return 0;

  const entities = state.sensors?.entities;
  const animals = findMobs(bot, config.ANIMALS, entities);
  return animals.length ? 80 : 0;
}

function huntHostileScore(bot, state, config) {
  const entities = state.sensors?.entities;
  const hostiles = findMobs(bot, config.HOSTILES, entities);
  return hostiles.length ? 100 : 0;
}

module.exports = {
  huntAnimalsScore,
  huntHostileScore,
};
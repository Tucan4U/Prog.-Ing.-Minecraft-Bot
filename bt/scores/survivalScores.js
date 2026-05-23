// Survival score funkcije procjenjuju prioritet hrane i preživljavanja.
const { needsFood } = require('../../utils/inventory');

function hasNearbyFoodItem(state, config) {
  const items = state.sensors?.items || [];
  if (!Array.isArray(items) || !items.length) return false;

  const foodSet = new Set(config.FOOD || []);
  return items.some((entity) => {
    const item = entity.getDroppedItem?.();
    return item && foodSet.has(item.name);
  });
}

function pickUpFoodScore(bot, state, config) {
  if (!needsFood(bot, state, config)) return 0;
  return hasNearbyFoodItem(state, config) ? 120 : 0;
}

module.exports = {
  pickUpFoodScore,
  hasNearbyFoodItem,
};
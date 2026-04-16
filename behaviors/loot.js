function findFood(bot, FOOD) {
  return Object.values(bot.entities).find(e => {
    if (e.name !== 'item') return false;
    const item = e.getDroppedItem?.();
    return item && FOOD.includes(item.name);
  });
}

module.exports = { findFood };
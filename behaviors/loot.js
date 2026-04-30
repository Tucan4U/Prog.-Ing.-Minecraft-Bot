function findItem(bot, filter, itemsOverride) {
  if (!Array.isArray(filter)) {
    return null;
  }

  const entities = Array.isArray(itemsOverride)
    ? itemsOverride
    : Object.values(bot.entities);

  return entities.find(e => {
    if (e.name !== 'item') return false;
    const item = e.getDroppedItem?.();
    return item && filter.includes(item.name);
  });
}

module.exports = { findItem };
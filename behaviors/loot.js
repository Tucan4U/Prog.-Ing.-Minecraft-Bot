function findItem(bot, ITEM_ARRAY) {
  return Object.values(bot.entities).find((e) => {
    if (e.name !== "item") return false;
    const item = e.getDroppedItem?.();
    return item && ITEM_ARRAY.includes(item.name);
  });
}

module.exports = { findItem };

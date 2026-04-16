function countItems(bot, name) {
  let total = 0;

  bot.inventory.items().forEach(item => {
    if (item.name === name) {
      total += item.count;
    }
  });

  return total;
}

module.exports = { countItems };
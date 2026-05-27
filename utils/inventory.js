async function equipBestWeapon(bot, weapons) {
  // Equipaj sljedeće najbolje oružje
  const currentItem = bot.heldItem?.name;

  for (const weapon of weapons) {
    const item = bot.inventory.items().find((i) => i.name === weapon);
    if (!item) continue;
    console.log(`Checking for ${weapon} in hand...`);
    if (currentItem !== weapon) {
      try {
        await bot.equip(item, "hand").then(() => {
          bot.chat(`Equipped ${weapon}`);
        });
        console.log(`Equipped ${weapon}`);
        return;
      } catch (err) {
        console.log(`Couldn't equip ${weapon}:`, err.message);
      }
    }

    console.log("No weapons available");
  }
}

function needsFood(bot, state, config) {
  const foodCount = bot.inventory
    .items()
    .filter((i) => config.FOOD.includes(i.name))
    .reduce((sum, i) => sum + i.count, 0);

  return foodCount < 32;
}

function numOfBlocks(bot, state, config, blocksKey) {
  const blockCount = bot.inventory
    .items()
    .filter((item) => config.BLOCKS[blocksKey]?.names?.includes(item.name))
    .reduce((count, item) => count + item.count, 0);
  return blockCount || 0;
}

function needsGold(bot, state, config) {
  const goldCount = bot.inventory
    .items()
    .filter((i) => config.ITEMS.GOLD.names.includes(i.name))
    .reduce((sum, i) => sum + i.count, 0);

  bot.chat(goldCount);
  return goldCount < 9;
} //temp value

module.exports = { equipBestWeapon, needsFood, numOfBlocks, needsGold };

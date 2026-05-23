async function equipBestWeapon(bot, weapons) {
  // Equipaj sljedeće najbolje oružje
  const currentItem = bot.heldItem?.name;

  for (const weapon of weapons) {
    const item = bot.inventory.items().find((i) => i.name === weapon);
    if (!item) continue;
    console.log(`Checking for ${weapon} in inventory...`);
    try {
      await bot.equip(item, "hand").then(() => {
        if (currentItem !== weapon) {
          bot.chat(`Equipped ${weapon}`);
        }
      });
      console.log(`Equipped ${weapon}`);
      return;
    } catch (err) {
      console.log(`Couldn't equip ${weapon}:`, err.message);
    }
  }

  console.log("No weapons available");
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
    .filter((item) => config.BLOCKS[blocksKey]?.names.includes(item.name))
    .reduce((count, item) => count + item.count, 0);
  return blockCount || 0;
}

module.exports = { equipBestWeapon, needsFood, numOfBlocks };

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
  const neededFood = config.FOOD || config.RAWFOOD;

  const foodCount = bot.inventory
    .items()
    .filter((i) => neededFood.includes(i.name)) //TODOO
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

function countItemsByNames(bot, names) {
  const nameSet = new Set(names || []);

  return bot.inventory
    .items()
    .filter((item) => nameSet.has(item.name))
    .reduce((sum, item) => sum + item.count, 0);
}

function findInventoryItemByNames(bot, names) {
  const nameSet = new Set(names || []);
  return bot.inventory.items().find((item) => nameSet.has(item.name)) || null;
}

function findBestInventoryItemByNames(
  bot,
  names,
  scoreFn = (item) => item.count,
) {
  const nameSet = new Set(names || []);
  let bestItem = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const item of bot.inventory.items()) {
    if (!nameSet.has(item.name)) continue;

    const score = scoreFn(item);
    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
    }
  }

  return bestItem;
}

function hasAnyItem(bot, names) {
  return Boolean(findInventoryItemByNames(bot, names));
}

module.exports = {
  equipBestWeapon,
  needsFood,
  numOfBlocks,
  countItemsByNames,
  findInventoryItemByNames,
  findBestInventoryItemByNames,
  hasAnyItem,
};

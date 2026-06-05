async function equipBestWeapon(bot, weapons) {
  // Equipaj sljedeće najbolje oružje
  const currentItem = bot.heldItem?.name;
  const bestAvailableWeapon = weapons.find((weapon) =>
    bot.inventory.items().some((item) => item.name === weapon),
  );

  if (!bestAvailableWeapon) {
    console.log("No weapons available");
    return;
  }

  if (currentItem === bestAvailableWeapon) {
    return;
  }

  for (const weapon of weapons) {
    const item = bot.inventory.items().find((i) => i.name === weapon);
    if (!item) continue;
    console.log(`Checking for ${weapon} in hand...`);
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
}

function getFoodHuntStartThreshold(config) {
  return config?.FURNACE?.FOOD_THRESHOLDS?.HUNT_START_AT ?? 10;
}

function getFoodHuntStopThreshold(config) {
  return config?.FURNACE?.FOOD_THRESHOLDS?.HUNT_STOP_AT ?? 32;
}

function getTotalFoodCount(bot, config) {
  const rawFoodNames = config?.ITEMS?.RAWFOOD?.names || [];
  const cookedFoodNames = config?.ITEMS?.COOKEDFOOD?.names || [];
  return countItemsByNames(bot, [...rawFoodNames, ...cookedFoodNames]);
}

function shouldHuntForFood(bot, state, config) {
  const totalFood = getTotalFoodCount(bot, config);
  const startThreshold = getFoodHuntStartThreshold(config);
  const stopThreshold = getFoodHuntStopThreshold(config);

  if (totalFood < startThreshold) {
    state.foodHuntActive = true;
  } else if (totalFood >= stopThreshold) {
    state.foodHuntActive = false;
  } else if (typeof state.foodHuntActive !== "boolean") {
    state.foodHuntActive = totalFood < stopThreshold;
  }

  return state.foodHuntActive;
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
  getFoodHuntStartThreshold,
  getFoodHuntStopThreshold,
  getTotalFoodCount,
  shouldHuntForFood,
  numOfBlocks,
  countItemsByNames,
  findInventoryItemByNames,
  findBestInventoryItemByNames,
  hasAnyItem,
};

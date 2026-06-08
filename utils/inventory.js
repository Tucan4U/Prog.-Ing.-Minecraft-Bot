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
// Finds the best item by names using a scoring function (default is count)
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

function getOffhandItem(bot) {
  // Broj slota za off-hand u kodu Mineflayera je obično 45 za novije verzije,
  // ali najsigurniji način je tražiti opremljeni predmet na "off-hand" lokaciji.
  return bot.inventory.equipped(10, null); 
}

function checkOffhand(bot, names) {
  const nameSet = new Set(names || []);
  const offhandItem = bot.inventory.equipped(10, null); // 10 označava off-hand opremu

  // Ako u ruci ima predmet i njegovo ime je u traženom setu, vraća taj predmet
  if (offhandItem && nameSet.has(offhandItem.name)) {
    return offhandItem;
  }
  
  return null; // Off-hand je prazan ili drži krivi predmet
}

function hasAnyItem(bot, names) {
  return Boolean(findInventoryItemByNames(bot, names));
}

function hasAllItems(bot, names) {
  if (!names || names.length === 0) return true;

  // 1. Izbroji koliko kojih predmeta bot mora imati
  const requiredCounts = {};
  for (const name of names) {
    requiredCounts[name] = (requiredCounts[name] || 0) + 1;
  }

  // 2. Izbroji sve predmete koje bot trenutno posjeduje
  const botCounts = {};
  
  // bot.inventory.slots sadrži apsolutno sve slotove (uključujući oklop)
  for (const item of bot.inventory.slots) {
    if (item) {
      botCounts[item.name] = (botCounts[item.name] || 0) + item.count;
    }
  }

  // 3. Provjeri ima li bot dovoljnu količinu za svaki traženi predmet
  for (const name in requiredCounts) {
    const requiredAmount = requiredCounts[name];
    const botAmount = botCounts[name] || 0;

    if (botAmount < requiredAmount) {
      return false; // Bot nema dovoljno ovih predmeta
    }
  }

  return true; // Bot ima sve tražene predmete u pravoj količini
}

module.exports = {
  equipBestWeapon,
  getFoodHuntStartThreshold,
  getFoodHuntStopThreshold,
  getTotalFoodCount,
  shouldHuntForFood,
  countItemsByNames,
  findInventoryItemByNames,
  findBestInventoryItemByNames,
  hasAnyItem,
  hasAllItems,
  getOffhandItem,
  checkOffhand,
};

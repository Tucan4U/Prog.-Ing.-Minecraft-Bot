async function equipBestWeapon(bot, weapons) {
  // Equipaj sljedeće najbolje oružje
  const currentItem = bot.heldItem?.name;


  for (const weapon of weapons) {
    const item = bot.inventory.items().find(i => i.name === weapon);
    if (!item) continue;
    console.log(`Checking for ${weapon} in inventory...`);
    try {
      if(currentItem !== weapon){
        bot.chat(`Equipped ${weapon}`);
      }
      await bot.equip(item, 'hand');
      console.log(`Equipped ${weapon}`);
      return;
    } catch (err) {
      console.log(`Couldn't equip ${weapon}:`, err.message);
    }
  }

  console.log('No weapons available');
}

function needsFood(bot, state, config) {
  const foodCount = bot.inventory.items()
    .filter(i => config.FOOD.includes(i.name))
    .reduce((sum, i) => sum + i.count, 0);

  return foodCount < 32;
}

module.exports = { equipBestWeapon, needsFood };
async function equipBestWeapon(bot, weapons, state) {
  // Equipaj sljedeće najbolje oružje
  const currentItem = bot.heldItem?.name;

  if (currentItem && weapons.includes(currentItem)) {
    return;
  }

  for (const weapon of weapons) {
    const item = bot.inventory.items().find(i => i.name === weapon);
    console.log(`Checking for ${weapon} in inventory...`);
    if (!item) continue;

    try {
      await bot.equip(item, 'hand');
      console.log(`Equipped ${weapon}`);
      return;
    } catch (err) {
      console.log(`Couldn't equip ${weapon}:`, err.message);
    }
  }

  console.log('No weapons available');
  state.equippedWeapon = null;
}

module.exports = { equipBestWeapon };
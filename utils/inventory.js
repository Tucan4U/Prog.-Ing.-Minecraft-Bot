async function equipBestWeapon(bot, weapons, state) {

    ///PROPALA IMPLEMENTACIJA - forsi u buducnosti, za sad rijeseno tako da se prije svakog napada resetira state.equippedWeapon
  
  state.equippedWeapon = null;
  // Provjeri što je trenutno equipano u ruci
  /* const currentlyEquipped = bot.entity.equipment?.[0];
  const currentItemName = currentlyEquipped?.name;

  // Ako je bot equippao nešto drugačije od state.equippedWeapon
  if (currentItemName && currentItemName !== state.equippedWeapon && state.equippedWeapon) {
    console.log(` Bot equipped ${currentItemName}, but it needs to equip ${state.equippedWeapon}`);

    // Pokušaj vratiti prethodno setano oružje ako postoji u inventoryu
    if (state.equippedWeapon) {
      const intendedWeapon = bot.inventory.items().find(i => i.name === state.equippedWeapon);
      if (intendedWeapon) {
        try {
          await bot.equip(intendedWeapon, 'hand');
          console.log(`Equipped ${state.equippedWeapon}`);
          return;
        } catch (err) {
          console.log(`Couldn't equip ${state.equippedWeapon}:`, err.message);
        }
      } else {
        console.log(`${state.equippedWeapon} not found in inventory`);
        state.equippedWeapon = null;
      }
    }
  }

  // Ako nije trebalo ništa promijeniti, return
  if (state.equippedWeapon === currentWeaponName && currentWeaponName) {
    return;
  } */

  // Equipaj sljedeće najbolje oružje
  console.log(state.equippedWeapon ? `Currently equipped: ${state.equippedWeapon}` : 'No weapon currently equipped');
  for (const weapon of weapons) {
    const item = bot.inventory.items().find(i => i.name === weapon);
    console.log(`Checking for ${weapon} in inventory...`);
    if (!item) continue;
    if (state.equippedWeapon === weapon) return;

    try {
      await bot.equip(item, 'hand');
      state.equippedWeapon = weapon;
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
const mcData = require('minecraft-data');

// Nether equipment helper functions: inventory checks, armor equip, and developer test gear.
function getOwnedItems(bot) {
  const inventoryItems = bot.inventory.items();
  const armorSlots = [5, 6, 7, 8];
  // The off-hand slot is slot 45 in the inventory representation
  // For shield holding
  const offhandSlot = 45;
  const equippedGear = [...armorSlots, offhandSlot]
    .map((slot) => bot.inventory.slots[slot])
    .filter(Boolean);
  return [...inventoryItems, ...equippedGear];
}

function getMissingEquipment(bot) {
  const ownedItems = getOwnedItems(bot);

  // List of required Nether gear. Missing items are reported back to the Nether sequence.
  const requirements = [
    { label: 'golden_helmet', match: (name) => name === 'golden_helmet' },
    {
      label: 'chestplate',
      match: (name) =>
        name.endsWith('_chestplate') && (name.includes('iron') || name.includes('diamond') || name.includes('netherite')),
    },
    {
      label: 'leggings',
      match: (name) =>
        name.endsWith('_leggings') && (name.includes('iron') || name.includes('diamond') || name.includes('netherite')),
    },
    {
      label: 'boots',
      match: (name) =>
        name.endsWith('_boots') && (name.includes('iron') || name.includes('diamond') || name.includes('netherite')),
    },
    {
      label: 'pickaxe',
      match: (name) => name.endsWith('_pickaxe') && !name.includes('wooden') && !name.includes('stone') && !name.includes('gold'),
    },
    {
      label: 'sword',
      match: (name) => name.endsWith('_sword') && !name.includes('wooden') && !name.includes('stone') && !name.includes('gold'),
    },
    { label: 'shield', match: (name) => name === 'shield' },
  ];

  return requirements
    .filter((r) => !ownedItems.some((item) => r.match(item.name)))
    .map((r) => r.label);
}

async function equipArmor(bot) {
  const items = bot.inventory.items();

  // Equip the best armor available, preferring netherite then diamond then iron.
  const findBest = (suffix) => {
    const candidates = items.filter((i) => i.name.endsWith(suffix));
    return candidates.find((i) => i.name.includes('netherite')) || candidates.find((i) => i.name.includes('diamond')) || candidates.find((i) => i.name.includes('iron')) || null;
  };

  const helmet = items.find((i) => i.name === 'golden_helmet');
  const chest = findBest('_chestplate');
  const legs = findBest('_leggings');
  const boots = findBest('_boots');
  const shield = items.find((i) => i.name === 'shield');

  const plan = [
    { item: helmet, dest: 'head' },
    { item: chest, dest: 'torso' },
    { item: legs, dest: 'legs' },
    { item: boots, dest: 'feet' },
    { item: shield, dest: 'off-hand' },
  ];

  for (const p of plan) {
    if (!p.item) continue;
    try {
      await bot.equip(p.item, p.dest);
    } catch (err) {
      bot.chat(`Failed to equip ${p.item.name}: ${err.message}`);
    }
  }
}

// Development helper: give a basic Nether-ready gear set using in-game commands.
function giveNetherEquipment(bot) {
  try {
    bot.chat('/clear ' + bot.username);
    bot.chat('/give ' + bot.username + ' golden_helmet');
    bot.chat('/give ' + bot.username + ' iron_chestplate');
    bot.chat('/give ' + bot.username + ' iron_leggings');
    bot.chat('/give ' + bot.username + ' iron_boots');
    bot.chat('/give ' + bot.username + ' iron_pickaxe');
    bot.chat('/give ' + bot.username + ' iron_sword');
    bot.chat('/give ' + bot.username + ' shield'); // Give shield
    bot.chat('/give ' + bot.username + ' cooked_beef 64'); // Added food for auto-eat plugin
    bot.chat('/give ' + bot.username + ' dirt 64'); // For building temporary structures if needed.

    // Ranged attack
    bot.chat('/give ' + bot.username + ' bow');
    bot.chat('/give ' + bot.username + ' arrow 64');
  } catch (err) {
    // ignore
  }
}

module.exports = { getMissingEquipment, equipArmor, giveNetherEquipment };

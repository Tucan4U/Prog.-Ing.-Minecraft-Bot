const {
  goals: { GoalNear },
} = require("mineflayer-pathfinder");

function getMissingEquipment(bot) {
  const items = bot.inventory.items();

  // 2. Get currently equipped armor
  const armorSlots = [5, 6, 7, 8];
  const equippedArmor = armorSlots
    .map(slot => bot.inventory.slots[slot])
    .filter(item => item !== null);

  const allOwnedItems = [...items, ...equippedArmor];
  
  // Define what we are looking for
  const requirements = [
    { label: 'Leggings', match: (name) => name.endsWith('_leggings') && (name.includes('iron') || name.includes('diamond') || name.includes('netherite')) },
    { label: 'Boots', match: (name) => name.endsWith('_boots') && (name.includes('iron') || name.includes('diamond') || name.includes('netherite')) },
    { label: 'Chestplate', match: (name) => name.endsWith('_chestplate') && (name.includes('iron') || name.includes('diamond') || name.includes('netherite')) },
    { label: 'Golden Helmet', match: (name) => name === 'golden_helmet' }, // Keep this strict for Piglin safety!
    { label: 'Pickaxe', match: (name) => name.endsWith('_pickaxe') && !name.includes('stone') && !name.includes('wooden') && !name.includes('gold') },
    { label: 'Sword', match: (name) => name.endsWith('_sword') && !name.includes('stone') && !name.includes('wooden') && !name.includes('gold') }
  ];
  // Check which required items are NOT in the inventory
  const missing = requirements
    .filter(req => !allOwnedItems.find(item => req.match(item.name)))
    .map(req => req.label);

  return missing;
}

async function equipArmor(bot) {
  // Get items
  const items = bot.inventory.items();

  // Helper to find the best item in inventory for a specific keyword
  const findBest = (keyword) => {
    const candidates = items.filter(i => i.name.endsWith(keyword));
    // Preference order: netherite > diamond > iron
    return candidates.find(i => i.name.includes('netherite')) || 
           candidates.find(i => i.name.includes('diamond')) || 
           candidates.find(i => i.name.includes('iron'));
  };

  // Map equipment
  const armorPlan = [
    { item: items.find(i => i.name === 'golden_helmet'), slot: 5, dest: 'head' },
    { item: findBest('_chestplate'), slot: 6, dest: 'torso' },
    { item: findBest('_leggings'), slot: 7, dest: 'legs' },
    { item: findBest('_boots'), slot: 8, dest: 'feet' }
  ];

  // Equip every part of appropriate armor
  for (const armor of armorPlan) {
    if (!armor.item) continue;
    
    const currentlyWearing = bot.inventory.slots[armor.slot];

    if (!currentlyWearing|| currentlyWearing.name !== armor.item.name) {
      try {
        bot.chat(`Equipping ${armor.item.name}`);
        await bot.equip(armor.item, armor.dest);
      } catch (err) {
        bot.chat(`Failed to equip ${armor.item.name}: ${err.message}`); 
      }
    }
  }
}

function getPortalBlocks(bot) {
  const mcData = require("minecraft-data")(bot.version);

  // Nether portal block
  const portalId = mcData.blocksByName.nether_portal.id;
    
  return portalId;
}

async function enterNether(bot) {

  // Check equipment and inventory
  const missingItems = getMissingEquipment(bot);

  if (missingItems.length > 0) {
    bot.chat(`I'm not ready! I am missing: ${missingItems.join(', ')}`);
    return; // Stops enterNether function
  }

  bot.chat("It seems I have evrything I need. Let's go!");

  // If Bot has everything, equip everything needed
  await equipArmor(bot);  
  
  // Finding closest nether portal
  const portalId = getPortalBlocks(bot);

  bot.chat("Searching for Nether portal...");

  // const portalBlock = bot.findBlock({
  //   matching: portalId,
  //   maxDistance: 128,
  // });

  // if (!portalBlock) {
  //   bot.chat("I can't find a Nether portal nearby.");
  //   return;
  // }
  //stavit da se povecava distance do 512

  let maxDistance = 128;
  let portalBlock = null;
  for (let i = 0; i < 3; i++) {
    console.log(`Searching within: ${maxDistance} blocks`)
    portalBlock = bot.findBlock({
      matching: portalId,
      maxDistance: maxDistance,
    });
    
    if (!portalBlock) {
      bot.chat("No nether portal found nearby, extending search radius...");
      maxDistance *= 2;
      // Wait for 1 tick to prevent ECONNRESET
      await new Promise(resolve => setTimeout(resolve, 50));
    } else {
      console.log(`Found nether portal block at ${portalBlock.position}`);
      break;
    }
  }

  if(!portalBlock) {
    bot.chat("I can't find a Nether portal nearby.");
    return;
  }

  bot.chat("Found portal! Heading there...");
  console.log(
        portalBlock.position.x,
        portalBlock.position.y,
        portalBlock.position.z,);

  try {
    // Move close to portal
    await bot.pathfinder.goto(
      new GoalNear(
        portalBlock.position.x,
        portalBlock.position.y,
        portalBlock.position.z,
        0
      )
    );

    bot.chat("Entering portal...");

    await bot.waitForTicks(90);

    const currDim = bot.game.dimension;
    bot.chat(currDim);
    if (currDim === "the_nether") {
      bot.chat("If everything worked, I should be in the Nether!");
    } else {
      bot.chat("Something went wrong!");
    }

  } catch (err) {
    
    if (err.message === 'Digging aborted' || err.message === 'Goal changed') {
        bot.chat("Activity stopped by user.");
    } else {
        bot.chat("Error entering portal: " + err);
    }
  }
}

async function goToPlayer(bot, username){
  bot.chat("/tp @s " + username);
}

function giveNetherEquipment(bot){
  bot.chat("/clear Bot");
  bot.chat("/give Bot golden_helmet");
  bot.chat("/give Bot iron_sword");
  bot.chat("/give Bot iron_pickaxe");
  bot.chat("/give Bot iron_boots");
  bot.chat("/give Bot iron_leggings");
  bot.chat("/give Bot iron_chestplate");
}

module.exports = {
  enterNether,
  goToPlayer,
  giveNetherEquipment
};

// Module for handling equipment checks, auto-equipping armor, 
// and navigating through Nether portals.

const {
  goals: { GoalNear },
} = require("mineflayer-pathfinder");


// Scans inventory and equipped slots to identify missing essentail gear.
// Returns array of items the bot still needs to find
function getMissingEquipment(bot) {
  // 1. Get current inventory
  const items = bot.inventory.items();

  // 2. Get currently equipped armor from specific armor slots (5-8)
  const armorSlots = [5, 6, 7, 8];
  const equippedArmor = armorSlots
    .map(slot => bot.inventory.slots[slot])
    .filter(item => item !== null);

  // Combine inventory and equipped items for a full list
  const allOwnedItems = [...items, ...equippedArmor];
  
  // 3. Requirements list
  const requirements = [
    { label: 'Leggings', match: (name) => name.endsWith('_leggings') && (name.includes('iron') || name.includes('diamond') || name.includes('netherite')) },
    { label: 'Boots', match: (name) => name.endsWith('_boots') && (name.includes('iron') || name.includes('diamond') || name.includes('netherite')) },
    { label: 'Chestplate', match: (name) => name.endsWith('_chestplate') && (name.includes('iron') || name.includes('diamond') || name.includes('netherite')) },
    { label: 'Golden Helmet', match: (name) => name === 'golden_helmet' }, // Keep this strict for Piglin safety!
    { label: 'Pickaxe', match: (name) => name.endsWith('_pickaxe') && !name.includes('stone') && !name.includes('wooden') && !name.includes('gold') },
    { label: 'Sword', match: (name) => name.endsWith('_sword') && !name.includes('stone') && !name.includes('wooden') && !name.includes('gold') }
  ];

  // 3. Filter requirements to find what is missing from bot's possession
  const missing = requirements
    .filter(req => !allOwnedItems.find(item => req.match(item.name)))
    .map(req => req.label);

  return missing;
}


// Automatically selects and equips the best available armor from inventory
// Except for helmet which must be golden
async function equipArmor(bot) {
  // Get inventory
  const items = bot.inventory.items();

  // Helper to filter and sort armor by material quality
  const findBest = (keyword) => {
    const candidates = items.filter(i => i.name.endsWith(keyword));
    // Preference order: netherite > diamond > iron
    return candidates.find(i => i.name.includes('netherite')) || 
           candidates.find(i => i.name.includes('diamond')) || 
           candidates.find(i => i.name.includes('iron'));
  };

  // Define the target layout for equipment
  const armorPlan = [
    { item: items.find(i => i.name === 'golden_helmet'), slot: 5, dest: 'head' },
    { item: findBest('_chestplate'), slot: 6, dest: 'torso' },
    { item: findBest('_leggings'), slot: 7, dest: 'legs' },
    { item: findBest('_boots'), slot: 8, dest: 'feet' }
  ];

  // Loop through the plan and equip items if they aren't already worn
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

//Retrieves the block ID for nether portals based on the current bot version
function getPortalBlocks(bot) {
  const mcData = require("minecraft-data")(bot.version);

  // Nether portal block ID
  const portalId = mcData.blocksByName.nether_portal.id;
    
  return portalId;
}


// Main logic to check gear, find a portal, and travel to the Nether
async function enterNether(bot) {

  // 1. Check equipment and inventory
  const missingItems = getMissingEquipment(bot);

  if (missingItems.length > 0) {
    bot.chat(`I'm not ready! I am missing: ${missingItems.join(', ')}`);
    return; // Stops enterNether function if not ready
  }

  bot.chat("It seems I have evrything I need. Let's go!");

  // If Bot has everything needed, equip everything needed
  await equipArmor(bot);  
  
  // 2. Find active Nether portal
  // Finding closest nether portal
  const portalId = getPortalBlocks(bot);

  bot.chat("Searching for Nether portal...");

  // Searches for portal block, widening search area on failed attempt up to 2 times
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
      // Wait for 1 tick to prevent getting kicked out for weird behavior
      await new Promise(resolve => setTimeout(resolve, 50));
    } else {
      console.log(`Found nether portal block at ${portalBlock.position}`);
      break;
    }
  }

  // If no portal found, give feedback and stop search
  if(!portalBlock) {
    bot.chat("I can't find a Nether portal nearby.");
    return;
  }

  bot.chat("Found portal! Heading there...");
  console.log(
        portalBlock.position.x,
        portalBlock.position.y,
        portalBlock.position.z,);

  // 3. Navigation and Dimension Change
  try {
    // navigate to portal
    await bot.pathfinder.goto(
      new GoalNear(
        portalBlock.position.x,
        portalBlock.position.y,
        portalBlock.position.z,
        0
      )
    );

    bot.chat("Entering portal...");

    // Wait for the required time to enter other dimension
    await bot.waitForTicks(100);

    // Verify if dimension change was successful
    const currDim = bot.game.dimension;
    if (currDim === "the_nether") {
      bot.chat("If everything worked, I should be in the Nether!");
    } else {
      bot.chat("Something went wrong!");
    }

  } catch (err) {
    
    // Check if pathfinder algorithm was stopped by error or user/player input
    if (err.message === 'Digging aborted' || err.message === 'Goal changed') {
        bot.chat("Activity stopped by user.");
    } else {
        bot.chat("Error entering portal: " + err);
    }
  }
}

// Teleports the bot to a specific player's location.
async function goToPlayer(bot, username){
  bot.chat("/tp @s " + username);
}


// Admin utility to instantly clear inventory and provide required
// equippment for development purposes
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

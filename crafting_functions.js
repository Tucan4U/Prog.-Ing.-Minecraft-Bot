const Vec3 = require("vec3");

async function findPlaceableSpot(bot) {
  const botPos = bot.entity.position;

  // Try a small box around the bot (±2 in x, z)
  for (let dx = -2; dx <= 2; dx++) {
    for (let dz = -2; dz <= 2; dz++) {
      if (dx === 0 && dz === 0) continue; // skip the block the bot is currently on

      // Stand position: just offset from bot
      const standPos = botPos.offset(dx, 0, dz);
      let blockAbove = bot.blockAt(standPos);
        if (blockAbove && blockAbove.name === "air"){
            const posUnder = botPos.offset(dx, -1, dz);
            let blockBelow = bot.blockAt(posUnder);
            if(blockBelow && blockBelow.name!=="air"){
                // return block;
                bot.chat(`Will place block at ${blockAbove}`); 
                return {
                    blockAbove,
                    blockBelow
                    };
            }
        }  
      }
    }
    bot.chat(`found no places`); 
    return null; // no suitable spot found
  }

async function placeCraftingTable(bot) {
  const mcData = require("minecraft-data")(bot.version);
  const craftingTableId = mcData.itemsByName.crafting_table.id;

  await bot.equip(craftingTableId, "hand");

  let block = await findPlaceableSpot(bot);

  if (block && block.blockAbove && block.blockAbove.name === "air" && block.blockBelow && block.blockBelow.name !== "air") {
    bot.chat(`${block.blockAbove.position} ${block.blockAbove.name}`); 
    // Place it on the block below
    bot.chat(`inside if`); 
    const below = bot.blockAt(bot.entity.position.offset(0, -1, 1));
    while(true){
        try {
        bot.chat(`Prije await`);  
        await bot.placeBlock(block.blockBelow, new Vec3(0, 1, 0));
        bot.chat(`Pole await`);  
      } catch (err) {
        console.log("Error placing crafting table:", err);
        bot.chat("Error placing crafting table:");
      }
      let newBlock = bot.blockAt(block.blockAbove.position);
      if(newBlock.name === "crafting_table"){
        break;
      }
    }    
  }
  bot.chat(`done`); 
}

async function craftGoldenIngots(bot) {
  const mcData = require("minecraft-data")(bot.version);

  // Find the golden_ingot item (output)
  const ingotItem = mcData.itemsByName.gold_ingot;
  if (!ingotItem) {
    bot.chat("golden_ingot not found in data!");
    return;
  }

  // Let the bot search for a crafting table (or workbench) in the world
  const tableId = mcData.blocksByName.crafting_table.id;
  const table = bot.findBlock({
    matching: tableId,
    maxDistance: 6
  });

  if (!table || table.name !== "crafting_table") {
    bot.chat("No crafting table found nearby.");
    return;
  }

  // Find a recipe for golden_ingot using gold nuggets, with the table
  const recipe = bot.recipesFor(ingotItem.id, null, 1, table)[0];
  bot.chat(`${recipe}`);

  if (!recipe) {
    bot.chat("No recipe to craft golden ingot with this table.");
    return;
  }

  try {
    await bot.craft(recipe, 1, table);
    bot.chat("Crafted a golden ingot!");
  } catch (err) {
    bot.chat("Crafting failed: " + err.message);
    console.log("Crafting failed: ", err);
  }
}

async function pickUpTable(bot) {
  let distance = 10;
  const mcData = require("minecraft-data")(bot.version);
  const tableId = mcData.blocksByName.crafting_table.id;

    bot.chat(`Looking for gold in radius ${distance}`);  

    const table = bot.findBlock({
      matching: tableId,
      maxDistance: distance
    });

    bot.chat(`Tried finding the table`);  

    if(table){
        bot.chat(`I found the table at ${table.position}`);    
        try {
            bot.chat(`Prije await`);  
            await bot.collectBlock.collect(table);
            bot.chat(`Pole await`);  
        } catch (err) {
            console.log("Error picking up table:", err);
            bot.chat("Error picking up table");
        } 
    }
}

module.exports = { placeCraftingTable, craftGoldenIngots, pickUpTable };
const mineflayer = require("mineflayer");
const { pathfinder, Movements } = require("mineflayer-pathfinder");
const Vec3 = require("vec3");
const bot = mineflayer.createBot({
  host: "localhost",
  port: 25565,
  username: "Bot",
});
//Loading all plugins, pathfinder, and collectblock
bot.loadPlugin(pathfinder);
bot.loadPlugin(require("mineflayer-collectblock").plugin);


let mcData;
bot.once("spawn", () => {
  mcData = require("minecraft-data")(bot.version);
});


function loadLogs() {
  let logs = [];
  mcData.blocksArray.forEach((block) => {
    if (block.displayName.endsWith("Log")) {
      logs.push(block.id);
    }
  });
  return logs;
}


async function breakLogs() {
  if (!mcData) {
    bot.chat("Not yet spawned!");
    return;
  }


  const logIds = loadLogs(); // tvoja postojeća funkcija


  // === set movements once ===
  if (!bot.pathfinder.movements) {
    bot.pathfinder.setMovements(new Movements(bot, mcData));
  }


  let currentLogs = bot.inventory
    .items()
    .filter((item) => item.displayName.endsWith("Log"))
    .reduce((sum, item) => sum + item.count, 0);
  const targetCount = 10;
  if (currentLogs >= targetCount) {
    bot.chat(`I have enough logs!`);
    return;
  }
  while (true) {
    // number of logs currently in inventory
    bot.chat(`I currently have ${currentLogs}/${targetCount} logs!`);

    if (currentLogs >= targetCount) {
      bot.chat(`Not breakings logs anymore!`);
      break;
    }

    // find nearest log block
    const block = bot.findBlock({
      matching: logIds,
      maxDistance: 64,
    });


    if (!block) {
      bot.chat("No logs found nearby... searching further.");
      await bot.waitForTicks(15); // delay that it doesn't spam chat
      continue;
    }


    bot.chat(`Found log at ${block.position}`);


    // equip axe if available
    const axe = bot.inventory.items().find(
      (item) =>
        item.displayName.includes("Axe") &&
        !item.displayName.includes("Netherite"), // ili bilo koji axe
    );
    if (axe) {
      await bot.equip(axe, "hand").catch(() => {});
    }


    try {
      // bolji način: collectBlock + error handling
      await bot.collectBlock.collect(block, {
        ignoreNoPath: true, // neće crashati ako nema put
      });
      // little delay so that the inventory updates
      await bot.waitForTicks(8);
    } catch (err) {
      console.log("Error with collectBlock:", err.message);
      bot.chat("Can't get to the log, skipping...");
      await bot.waitForTicks(20);
    }
    currentLogs = bot.inventory
      .items()
      .filter((item) => item.displayName.endsWith("Log"))
      .reduce((sum, item) => sum + item.count, 0);
  }
}


function findItems(itemName) {
  //Purpose of this function is to find all item ids of an argument
  let items = [];
  mcData.itemsArray.forEach((item) => {
    if (item.name.endsWith(itemName.toLowerCase())) {
      items.push(item.id);
    }
  });
  return items;
}


function craftPlank() {
  let items = findItems("planks");


  items.forEach(async (id) => {
    const recipe = bot.recipesFor(id, null, 1);
    if (recipe.length > 0) {
      try {
        await bot.craft(recipe[0], 1, null);
        bot.chat("I crafted planks");
      } catch (err) {
        bot.chat("Error crafting plank: " + err);
      }
    } else {
      console.log("No recipe found or not enough materials");
    }
  });
}


async function craftSticks() {
  let id = mcData.itemsByName.stick.id;
  const recipe = bot.recipesFor(id, null, 1);
  if (recipe.length > 0) {
    try {
      await bot.craft(recipe[0], 1, null);
      bot.chat("I crafted sticks");
    } catch (err) {
      bot.chat("Error crafting stick: " + err);
    }
  } else {
    console.log("Not enough materials for sticks");
  }
}


async function craftCraftingTable() {
  const craftingTableId = mcData.itemsByName.crafting_table.id;
  const recipe = bot.recipesFor(craftingTableId, null, 1);
  if (recipe.length > 0) {
    try {
      await bot.craft(recipe[0], 1, null);
      await bot.equip(craftingTableId, "hand");
      bot.chat("I crafted a crafting table!");
    } catch (err) {
      bot.chat("I can't craft a crafting table because: " + err);
    }
  } else {
    bot.chat("Not enough planks!");
    await bot.waitForTicks(5);
    craftPlank();
  }
}


async function craftWoodenPickaxe() {
  //This function is used for placing the crafting table
  //checking if you have enough materials to craft a wooden pickaxe
  //crafts the wooden pickaxe and then collects the crafting table back to inventory


  const pickaxeId = mcData.itemsByName.wooden_pickaxe.id;
  const craftingTableId = mcData.itemsByName.crafting_table.id;
  let blockPosition;
  try {
    await bot.equip(craftingTableId, "hand");
  } catch (err) {
    bot.chat("I don't have a crafting table to place!");
    return;
  }


  //This two arrays represent x and z coordinates for looking what are blocks around the bot
  const x = [0, 0, 1, -1];
  const z = [1, -1, 0, 0];
  for (let index = 0; index < x.length; index++) {
    //Which blocks are around the bot
    let block = bot.blockAt(bot.entity.position.offset(x[index], 0, z[index]));
    if (block && block.name === "air") {
      blockPosition = bot.entity.position.offset(x[index], -1, z[index]);
      block = bot.blockAt(blockPosition);
      if (block && block.name !== "air") {
        await bot.placeBlock(block, new Vec3(0, 1, 0));
        break;
      }
    }
  }
  const craftingTableBlock = bot.blockAt(blockPosition.offset(0, 1, 0));
  if(!craftingTableBlock) bot.chat("Can't find crafting table");
  const recipe = bot.recipesFor(pickaxeId, null, 1, craftingTableBlock);
  if (recipe.length > 0) {
    try {
      await bot.craft(recipe[0], 1, craftingTableBlock);
      bot.chat("I crafted a wooden pickaxe!");
      await bot.waitForTicks(5);
    } catch (err) {
      bot.chat("I can't craft a wooden pickaxe because: " + err);
    }
  } else {
    bot.chat("No recipe found or don't have materials!");
  }
  await bot.dig(craftingTableBlock);
  await bot.waitForTicks(10);
  if (recipe.length > 0) await bot.equip(pickaxeId, 'hand');
}

bot.on("chat", async (username, message) => {
  if (username === bot.username) return;
  if (message === "break logs") {
    breakLogs();
  }
  if (message === "inventory") {
    console.log(bot.inventory.items());
  }
  if (message === "craft planks") {
    craftPlank();
  }
  if (message === "craft sticks") {
    craftSticks();
  }
  if (message === "craft crafting table") {
    craftCraftingTable();
  }


  if (message === "craft wooden pickaxe") {
    craftWoodenPickaxe();
  }
});


// bot.on("diggingCompleted", async () => {
//   const mcData = require("minecraft-data")(bot.version);
//   await bot.waitForTicks(5);
//   const items = droppedItems();
//   if (items.length) {
//     bot.chat(items[0].id);
//   }
//   // bot.pathfinder.setMovements(new Movements(bot, mcData));
//   // await bot.pathfinder
//   //   .goto(
//   //     new GoalBlock(
//   //       items[0].position.x,
//   //       items[0].position.y,
//   //       items[0].position.z,
//   //     ),
//   //   )
//   //   .catch((err) => console.log("Error going to dropped item: " + err));
// });





const mineflayer = require("mineflayer");
const {
  pathfinder,
  Movements,
  goals: { GoalBlock, GoalNear, GoalFollow },
} = require("mineflayer-pathfinder");
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
  const logs = loadLogs(); // Loading all ids of logs
  let maxDistance = 16; // Initial search radius because findBlocks is buggy with bigger distances

  while (true) {
    let cnt = 0;
    bot.inventory.items().forEach((item) => {
      if (item.displayName.endsWith("Log")) {
        cnt += item.count;
      }
    });
    if (cnt >= 10) {
      bot.chat("I have enough logs!");
      break;
    } else {
      bot.chat(`I have ${cnt} logs, need 10`);
    }
    const block = bot.findBlock({
      matching: logs,
      maxDistance: maxDistance,
    });
    console.log(block);
    if (block) {
      console.log(`Found log block at ${block.position}`);
      maxDistance = 16;
    } else {
      console.log("No log blocks found nearby, extending search radius...");
      maxDistance *= 2;
      if (maxDistance > 512) {
        bot.chat("I can't find any logs within 512 blocks, giving up.");
        break;
      }
      continue;
    }
    try {
      await bot.collectBlock.collect(block);
    } catch (err) {
      console.log("Error breaking log:", err);
    }
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
      } catch (err) {
        bot.chat("Error crafting plank: " + err);
      }
    } else {
      console.log("No recipe found!");
    }
  });
}

async function craftSticks() {
  let id = mcData.itemsByName.stick.id;
  const recipe = bot.recipesFor(id, null, 1);
  if (recipe.length > 0) {
    try {
      await bot.craft(recipe[0], 1, null);
    } catch (err) {
      bot.chat("Error crafting stick: " + err);
    }
  } else {
    console.log("No recipe found!");
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
    bot.chat("No recipe found or don't have materials!");
  }
}

async function craftWoodenPickaxe() {
  //This function is used for placing the crafting table
  //checking if you have enough materials to craft a wooden pickaxe
  //crafts the wooden pickaxe and then collects the crafting table back to inventory
  const pickaxeId = mcData.itemsByName.wooden_pickaxe.id;
  const craftingTableId = mcData.itemsByName.crafting_table.id;
  let blockPosition;
  await bot.equip(craftingTableId, "hand");
  //This two arrays represent x and z coordinates for looking what are blocks around the bot
  const x = [0, 0, 1, -1];
  const z = [1, -1, 0, 0];
  for (let index = 0; index < x.length; index++) {
    //Which blocks are around the bot
    blockPosition = bot.entity.position.offset(x[index], -1, z[index]);
    let block = bot.blockAt(blockPosition);
    if (block && block.name !== "air") {
      await bot.placeBlock(block, new Vec3(0, 1, 0));
      break;
    }
  }
  const craftingTableBlock = bot.blockAt(blockPosition.offset(0, 1, 0));
  const recipe = bot.recipesFor(pickaxeId, null, 1, craftingTableBlock);
  console.log(recipe);
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
  await bot.collectBlock.collect(craftingTableBlock);
}

function droppedItems() {
  const mcData = require("minecraft-data")(bot.version);
  const pos = bot.players["pusimigaLOL"].entity.position;

  const items = Object.values(Object.values(bot.entities)).filter(
    (e) => e.name === "item",
  );
  if (items.length === 0) return null;

  let minDistance = Infinity;
  let closestItemIndex = null;

  items.forEach((item, index) => {
    let distance = item.position.distanceTo(pos);
    if (distance < minDistance) {
      minDistance = distance;
      closestItemIndex = index;
    }
  });

  console.log("Found closest dropped item:", items[closestItemIndex]);
  return items[closestItemIndex];
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

  if (message === "dropped") {
    droppedItems();
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

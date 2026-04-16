const mineflayer = require("mineflayer");
const { collectGoldNether } = require("./nether_gold_functions.js");
const { piglinBarter } = require("./piglin_functions.js")

const {
  pathfinder,
  Movements,
  goals: { GoalNear },
} = require("mineflayer-pathfinder");

const bot = mineflayer.createBot({
  host: "localhost",
  port: 25565,
  username: "Bot",
});

bot.loadPlugin(pathfinder);
bot.loadPlugin(require('mineflayer-collectblock').plugin)

bot.once("spawn", () => {
  const customMoves = new Movements(bot)
  // To make changes to the behaviour, customize the properties of the instance
  customMoves.scafoldingBlocks.push(bot.registry.itemsByName.netherrack.id)
  // Thing to note scaffoldingBlocks are an array while other namespaces are usually sets
  customMoves.blocksToAvoid.add(bot.registry.blocksByName.magma_block.id)

  // To initialize the new movements use the .setMovements method.
  bot.pathfinder.setMovements(customMoves)
});

function loadLogs() {
  let logs = [];
  const minecraftData = require("minecraft-data")(bot.version);
  minecraftData.blocksArray.forEach((block) => {
    if (block.displayName.endsWith("Log")) {
      logs.push(block.id);
    }
  });
  return logs;
}

async function breakLogs() {
  const logs = loadLogs();
  let maxDistance = 64;

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
    if (block) {
      console.log(`Found log block at ${block.position}`);
      maxDistance = 64;
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
      await bot.pathfinder.goto(
        new GoalNear(block.position.x, block.position.y, block.position.z, 2),
      );
      await bot.dig(block);
      await bot.waitForTicks(30);
    } catch (err) {
      console.log("Error breaking log:", err);
    }
  }
}

function findItems(itemName) {
  let items = [];
  const mcData = require("minecraft-data")(bot.version);

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

function craftSticks() {
  let items = findItems("stick");

  items.forEach(async (id) => {
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
  });
}

async function craftCraftingTable() {
  const mcData = require("minecraft-data")(bot.version);
  const craftingTableId = mcData.itemsByName.crafting_table.id;

  const recipe = bot.recipesFor(craftingTableId, null, 1);
  if (recipe.length > 0) {
    try {
      await bot.craft(recipe[0], 1, null);
      await bot.equip(craftingTableId, "hand");
    } catch (err) {
      bot.chat("I can't craft a crafting table because: " + err);
    }
  }
}

bot.on("chat", (username, message) => {
  if (username === bot.username) return;
  if (message === "break logs") {
    breakLogs();
  }
  if (message === "get gold nether") {
    collectGoldNether(bot, 64);
  }
  if (message === "inventory") {
    console.log(bot.inventory.items());
  }
  if (message === "craft a plank") {
    craftPlank();
  }
  if (message === "craft sticks") {
    craftSticks();
  }
  if (message === "craft crafting table") {
    craftCraftingTable();
  }
  if (message === "barter") {
    piglinBarter(bot, 500);
  }
});

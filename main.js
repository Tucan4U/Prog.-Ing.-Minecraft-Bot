const mineflayer = require("mineflayer");
// Function imports
const { collectGoldNether } = require("./nether_gold_functions.js");
const { piglinBarter } = require("./piglin_functions.js")
const { enterNether, goToPlayer, giveNetherEquipment } = require("./enterNether");
const { findNetherFortress } = require("./findFortress");

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

  // Provide required equippment for the Nether (development feature only)
  giveNetherEquipment(bot);
});

// Controller with functions to stop certain actions
const stopController = {
    stop: false,
    request() {
        this.stop = true;
        console.log("stopping...");
        bot.chat("Stopping...");

        bot.pathfinder.setGoal(null);
        bot.clearControlStates();

        bot.stopDigging?.();
    },
    reset() {
        this.stop = false;
    }
};

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
  stopController.reset();
  const logs = loadLogs();
  let maxDistance = 64;

  while (true) {
    if (stopController.stop) return;
    
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

      if (stopController.stop) return;
      await bot.dig(block);
      if (stopController.stop) return;
      await bot.waitForTicks(30);
    } catch (err) {
      if (err.message === "Digging aborted"){
        console.log("Ordered to stop!");
      } else {
        console.log("Error breaking log:", err);
      }
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
  // Mines for golden nuggets and crafts gold ingots
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

  // Greets player
  if (message === "hi") {
    bot.chat("Hello " + username);
  }
  // Stops certain actions
  if (message === "stop") {
    stopController.request();
  }
  // Checks for equippment, finds active Nether portal and enters dimension
  if (message === "enter nether") {
    enterNether(bot);
  }
  // Finds Nether fortress and travels there
  if (message === "find fortress") {
    findNetherFortress(bot);
  }
  // Teleports bot to player's location
  if (message === "come here") {
    goToPlayer(bot, username);
  }
  // Barters with Piglins in search of Ender pearls
  if (message === "barter") {
    piglinBarter(bot, 500);
  }
});

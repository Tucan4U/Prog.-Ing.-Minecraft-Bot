const mineflayer = require("mineflayer");
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

// F
const { enterNether, goToPlayer, giveNetherEquipment } = require("./enterNether");
const { findNetherFortress } = require("./findFortress");

// F
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
  stopController.reset(); //F
  const logs = loadLogs();
  let maxDistance = 64;

  while (true) {
    if (stopController.stop) return; //F
    
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

      if (stopController.stop) return; //F
      await bot.dig(block);
      if (stopController.stop) return; //F
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

bot.once("spawn", () => {
  giveNetherEquipment(bot);
});

bot.on("chat", (username, message) => {
  if (username === bot.username) return;
  if (message === "break logs") {
    breakLogs();
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

  // F
  if (message === "hi") {
    bot.chat("Hello " + username);
  }
  if (message === "stop") {
    stopController.request();
  }
  if (message === "enter nether") {
    enterNether(bot);
  }
  if (message === "find fortress") {
    findNetherFortress(bot);
  }
  if (message === "come here") {
    goToPlayer(bot, username);
  }
});

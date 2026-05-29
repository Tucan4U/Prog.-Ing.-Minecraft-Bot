// Glavni entrypoint: inicijalizira bota, senzore i pokreće top-level BT odluke.
const mineflayer = require("mineflayer");
const { pathfinder, Movements } = require("mineflayer-pathfinder");

const config = require("./config");
// State
const state = require("./state");
const resetState = require("./utils/resetState");

const UtilitySelectorNode = require("./bt/selectors/utilitySelectorNode");
const { createOverworldProfile } = require("./bt/profiles/overworldProfile");
const {
  createHostileCombatProfile,
} = require("./bt/profiles/hostileCombatProfile");
const { createNetherProfile } = require("./bt/profiles/netherProfile");
const { startWorldSensors } = require("./sensors/worldSensors");

// Decorators
const ConditionNode = require("./bt/decorators/conditionNode");

// Nether utils
const { giveNetherEquipment } = require('./utils/netherEquipment');
// Nether commands
const { netherMain,
  enterNetherCommand,
  findFortressCommand,
  findBlazeSpawnerCommand ,
  lootBlazeRodsCommand
} = require("./commands/netherCommands");

// PvP, auto-eat and Hawkeye plugins
const autoEat = require("mineflayer-auto-eat").loader;
const pvp = require("mineflayer-pvp").plugin;
const minecraftHawkEye = require("minecrafthawkeye").default;

const bot = mineflayer.createBot({
  host: "localhost",
  port: 25565,
  username: "IndexBot",
});

// Loading plugins
bot.loadPlugin(autoEat);
bot.loadPlugin(pvp);
bot.loadPlugin(minecraftHawkEye);

bot.loadPlugin(pathfinder);
let startFlag = false; // kontrola da li bot treba loviti ili ne
let worldSensors = null;

const overworldProfile = createOverworldProfile(config);
const hostileCombatProfile = createHostileCombatProfile(config);
const netherProfile = createNetherProfile(config);

const utilityTreesByProfile = {
  [config.PROFILES.OVERWORLD]: new UtilitySelectorNode(
    "OverworldUtility",
    overworldProfile.candidates,
    overworldProfile.fallbackNode,
  ),
  [config.PROFILES.HOSTILE_COMBAT]: new UtilitySelectorNode(
    "HostileCombatUtility",
    hostileCombatProfile.candidates,
    hostileCombatProfile.fallbackNode,
  ),
  [config.PROFILES.NETHER]: new UtilitySelectorNode(
    "NetherUtility",
    netherProfile.candidates,
    netherProfile.fallbackNode,
  ),
};

state.mission.activeProfile = config.PROFILES.OVERWORLD;

bot.once("spawn", () => {
  const mcData = require("minecraft-data")(bot.version);
  const defaultMove = new Movements(bot, mcData);

  // Set up pathfinding
  const logBlockIds = config.BLOCKS.LOGS.names
    .map((name) => bot.registry.itemsByName[name]?.id)
    .filter((id) => id !== undefined);
  logBlockIds.forEach((el) => defaultMove.scafoldingBlocks.push(el));

  bot.pathfinder.setMovements(defaultMove);

  // Passing movements to PvP plugin
  bot.pvp.movements = defaultMove;

  // --- NEW AUTO-EAT V4 CONFIGURATION ---
  bot.autoEat.setOpts({
    priority: "foodPoints",
    minHunger: 19,
    minHealth: 0,
    bannedFood: ["rotten_flesh", "pufferfish", "spider_eye"],
    offhand: false,
  });
  // MUST be explicitly enabled in v4!
  bot.autoEat.enableAuto();

  // Listeners update the centralized state module cleanly
  bot.autoEat.on("autoeat_started", (item) => {
    console.log(`[AUTO-EAT] Started eating ${item.name}`);
    state.isEating = true; // Updates the state module
    bot.pathfinder.setGoal(null); // Instantly stops pathfinding conflicts
  });

  bot.autoEat.on("autoeat_stopped", () => {
    console.log("[AUTO-EAT] Finished eating.");
    state.isEating = false; // Resets the state module
  });

  worldSensors = startWorldSensors(bot, state, {
    intervalMs: config.SENSORS.WORLD_UPDATE_MS,
  });

  console.log("Bot spawned. Survival plugins active.");

  startLoop();
});

async function startLoop() {
  while (true) {
    try {
      await loop();
    } catch (err) {
      console.log(err);
    }

    await new Promise((r) => setTimeout(r, 500));
  }
}

// glavni loop koji ticka behavior tree(BT)
// Ako nije ništa postavljeno, OVERWORLD profil se koristi kao default.
async function loop() {
  if (startFlag) {
    const profileKey =
      state.mission?.activeProfile || config.PROFILES.OVERWORLD;
    const activeTree =
      utilityTreesByProfile[profileKey] ||
      utilityTreesByProfile[config.PROFILES.OVERWORLD];
    await activeTree.tick(bot, state, config);
  }
}

// CHAT
bot.on("chat", (username, message) => {
  if (username === bot.username) return;
  if (message === "stop") {
    bot.chat("Stopping hunt!");
    bot.pathfinder.setGoal(null);
    startFlag = false;
    // Reset state vars and pathfinder
    resetState(bot);
  }
  if (message === "start") {
    bot.chat(`Starting BT!`);
    startFlag = true;
  }
  if (message === "profile overworld") {
    state.mission.activeProfile = config.PROFILES.OVERWORLD;
    bot.chat("Profile switched: OVERWORLD");
  }
  if (message === "profile hostile") {
    state.mission.activeProfile = config.PROFILES.HOSTILE_COMBAT;
    bot.chat("Profile switched: HOSTILE_COMBAT");
  }
  if (message === "profile nether") {
    state.mission.activeProfile = config.PROFILES.NETHER;
    bot.chat("Profile switched: NETHER");
  }
  if (message === "entities") {
    const filter = config.SLIMES;
    const allowedNames = new Set(filter.names);
    const entities = state.sensors?.entities || Object.values(bot.entities);
    
    bot.chat(
      `Entities: ${entities
        .filter(
          (entity) =>
            entity &&
          entity.type === filter.type &&
          allowedNames.has(entity.name),
        )
        .map((e) => e.name)
        .join(", ")}`,
      );
      
    const nearest = bot.nearestEntity();
    bot.chat(`${nearest?.name || "none"}`);
    bot.chat(`Type: ${nearest?.type || "none"}`);
  }
  if (message === "inventory") {
    console.log(bot.inventory.items());
  }

  // NETHER
  // Give nether equipment for testing purposes. In a real scenario, the bot would gather or craft this gear itself.
  if (message === "prep") {
    bot.chat("Giving bot equipment for nether...");
    giveNetherEquipment(bot);
  }
  // MAIN Nether run
  if (message === "nether") {
    netherMain(bot, state, config);
    startFlag = true;
  }
  // Enter nether command
  if (message === "enter nether") {
    enterNetherCommand(bot, state, config);
    startFlag = true;
  }
  // Find nether fortress command
  if (message === "find fortress") {
    findFortressCommand(bot, state, config);
    startFlag = true;
  }
  // Find blaze spawner command
  if (message === "find blaze spawner") {
    findBlazeSpawnerCommand(bot, state, config);
    startFlag = true;
  }
  // Kill Blazes and loot rods command
  // Message form: "collect rods x" -> where x is the number of rods to collect
  if (message.startsWith("collect rods")){
    lootBlazeRodsCommand(bot, state, config, message);
    startFlag = true;
  }

  if (message === "tp") {
    bot.chat("/tp @s " + username);
  }
});

//  ERROR
bot.on("error", (err) => console.log(" ERROR:", err.message));
bot.on("end", () => {
  if (worldSensors) {
    worldSensors.stop();
    worldSensors = null;
  }
  console.log("Bot disconnect!");
});


// DEBUG For health, hunger and saturation monitoring in terminal 
// bot.on('physicsTick', () => {
//   // Only log if the bot is actually spawned and has health data available
//   if (bot.health !== undefined) {
//     const health = bot.health;
//     const hunger = bot.food;
//     const saturation = bot.foodSaturation;

//     // Printing to your terminal console instead of game chat
//     console.log(`[STATUS] Health: ${health.toFixed(1)} | Hunger: ${hunger} | Saturation: ${saturation.toFixed(1)}`);
//   }
// });

console.log("=== BOT 1.21.11 ===");

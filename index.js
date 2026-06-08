// Glavni entrypoint: inicijalizira bota, senzore i pokreće top-level BT odluke.
const mineflayer = require("mineflayer");
const { pathfinder, Movements } = require("mineflayer-pathfinder");
const NetherPortalBuilder = require("./bt/nodes/buildNetherPortalNode");

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
const { giveNetherEquipment } = require("./utils/netherEquipment");
// Nether commands
const {
  netherMain,
  enterNetherCommand,
  findFortressCommand,
  findBlazeSpawnerCommand,
} = require("./commands/netherCommands");

const bot = mineflayer.createBot({
  host: "localhost",
  port: 25565,
  username: "IndexBot",
});

bot.loadPlugin(pathfinder);
let startFlag = false; // kontrola da li bot treba loviti ili ne
let worldSensors = null;

const overworldProfile = createOverworldProfile(bot, config);
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

  bot.pathfinder.setMovements(defaultMove);

  worldSensors = startWorldSensors(bot, state, {
    intervalMs: config.SENSORS.WORLD_UPDATE_MS,
  });

  console.log("Bot spawned");
  console.log("");

  startLoop();
});

async function startLoop() {
  while (true) {
    try {
      await loop();
    } catch (err) {
      console.log(err);
    }

    await new Promise((r) => setTimeout(r, state.tickSpeed));
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
bot.on("chat", async (username, message) => {
  if (username === bot.username) return;
  if (message === "stop") {
    bot.chat("Stopping Bot!");
    bot.pathfinder.setGoal(null);
    startFlag = false;
    // Reset state vars and pathfinder
    resetState(bot);
  }
  if (message === "start") {
    bot.chat(`Starting BT!`);
    startFlag = true;
  }
  if (message === "logs") {
    bot.chat("/clear");
    bot.chat("/give @s minecraft:diamond_axe");
    bot.chat("/give @s dirt 10");
    bot.chat("/give @s oak_log 14");
    startFlag = true;
  }
  if(message === "clear"){
    bot.chat("/clear");
  }

  if(message === "prp"){
    bot.chat("/clear");
    bot.chat("/give @s raw_iron 7");
    bot.chat("/give @s raw_gold 4");
    bot.chat("/give @s coal 8");
    bot.chat("/give @s dirt 15");
    bot.chat("/give @s oak_log 15");
    bot.chat("/give @s cobblestone 7");
    bot.chat("/give @s beef 1");
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
  // Give night vision effect
  if (message === "nv") {
    bot.chat("/effect give @a minecraft:night_vision infinite 1 true");
  }
  if (message === "tp") {
    bot.chat("/tp @s " + username);
  }
  if (message === "clear") {
    bot.chat("/clear @s");
  }
  if (message === "np") {
    const builder = new NetherPortalBuilder(bot);

    await builder.build();
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

console.log("=== BOT 1.21.11 ===");

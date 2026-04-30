// Glavni entrypoint: inicijalizira bota, senzore i pokreće top-level BT odluke.
const mineflayer = require('mineflayer');
const { pathfinder, Movements } = require('mineflayer-pathfinder');

const config = require('./config');
const state = require('./state');

const UtilitySelectorNode = require('./bt/selectors/utilitySelectorNode');
const { createOverworldProfile } = require('./bt/profiles/overworldProfile');
const { createHostileCombatProfile } = require('./bt/profiles/hostileCombatProfile');
const { startWorldSensors } = require('./sensors/worldSensors');

const bot = mineflayer.createBot({
  host: "localhost",
  port: 25565,
  username: "IndexBot",
});

bot.loadPlugin(pathfinder);
let huntFlag = false; // kontrola da li bot treba loviti ili ne
let worldSensors = null;

const overworldProfile = createOverworldProfile(config);
const hostileCombatProfile = createHostileCombatProfile(config);

const utilityTreesByProfile = {
  [config.PROFILES.OVERWORLD]: new UtilitySelectorNode(
    'OverworldUtility',
    overworldProfile.candidates,
    overworldProfile.fallbackNode
  ),
  [config.PROFILES.HOSTILE_COMBAT]: new UtilitySelectorNode(
    'HostileCombatUtility',
    hostileCombatProfile.candidates,
    hostileCombatProfile.fallbackNode
  ),
};

state.mission.activeProfile = config.PROFILES.OVERWORLD;


bot.once('spawn', () => {
  const mcData = require('minecraft-data')(bot.version);
  bot.pathfinder.setMovements(new Movements(bot, mcData));

  worldSensors = startWorldSensors(bot, state, {
    intervalMs: config.SENSORS.WORLD_UPDATE_MS,
  });
  
  console.log('Bot spawned');
  
  startLoop();
});

async function startLoop() {
  while (true) {
    try {
      await loop();
    } catch (err) {
      console.log(err);
    }

    await new Promise(r => setTimeout(r, 500));
  }
}
// glavni loop koji ticka behavior tree(BT)
async function loop() {
  if(huntFlag){
    const profileKey = state.mission?.activeProfile || config.PROFILES.OVERWORLD;
    const activeTree = utilityTreesByProfile[profileKey] || utilityTreesByProfile[config.PROFILES.OVERWORLD];
    await activeTree.tick(bot, state, config);
  }
}

// CHAT
bot.on('chat', (username, message) => {
  if (username === bot.username) return;
  if (message === 'stop') {
    bot.chat("Stopping hunt!");
    huntFlag = false;
  }
  if(message === 'start hunting'){
    bot.chat(`Starting hunt!`);
    huntFlag = true;
  }
  if (message === 'profile overworld') {
    state.mission.activeProfile = config.PROFILES.OVERWORLD;
    bot.chat('Profile switched: OVERWORLD');
  }
  if (message === 'profile hostile') {
    state.mission.activeProfile = config.PROFILES.HOSTILE_COMBAT;
    bot.chat('Profile switched: HOSTILE_COMBAT');
  }
  if(message === 'entities'){
    const filter = config.SLIMES;
    const allowedNames = new Set(filter.names);
    const entities = state.sensors?.entities || Object.values(bot.entities);

    bot.chat(`Entities: ${entities.filter((entity) =>
      entity && entity.type === filter.type && allowedNames.has(entity.name)
    ).map(e => e.name).join(', ')}`);

    const nearest = bot.nearestEntity();
    bot.chat(`${nearest?.name || "none"}`);
    bot.chat(`Type: ${nearest?.type || "none"}`);
  }
  if (message === "inventory") {
    console.log(bot.inventory.items());
  }
  if (message === "tp"){
    bot.chat("/tp @s " + username);
  }
});

//  ERROR
bot.on('error', err => console.log(' ERROR:', err.message));
bot.on('end', () => {
  if (worldSensors) {
    worldSensors.stop();
    worldSensors = null;
  }
  console.log('Bot disconnect!');
});

console.log('=== BOT 1.21.11 ===');
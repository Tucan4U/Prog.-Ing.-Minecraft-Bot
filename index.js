// Glavni entrypoint: inicijalizira bota, senzore i pokreće top-level BT odluke
const mineflayer = require('mineflayer')
const { pathfinder, Movements } = require('mineflayer-pathfinder')

const config = require('./config')
const state = require('./state')

const UtilitySelectorNode = require('./bt/selectors/utilitySelectorNode')
const { createEndProfile } = require('./bt/profiles/endProfile')
const { createOverworldProfile } = require('./bt/profiles/overworldProfile')
const { createHostileCombatProfile } = require('./bt/profiles/hostileCombatProfile')
const { startWorldSensors } = require('./sensors/worldSensors')

const bot = mineflayer.createBot({
    host: 'localhost',
    port: 25565,
    username: 'AnteBot',
})

bot.loadPlugin(pathfinder)

let huntFlag = false        // kontrolira treba li bot uopće "razmišljati"
let worldSensors = null

// Napravi profile i utility tree mapu
const endProfile = createEndProfile(config)
const overworldProfile = createOverworldProfile(config)
const hostileCombatProfile = createHostileCombatProfile(config)

const utilityTreesByProfile = {
    [config.PROFILES.END]: new UtilitySelectorNode(
        'EndUtility',
        endProfile.candidates,
        endProfile.fallbackNode,
    ),
    [config.PROFILES.OVERWORLD]: new UtilitySelectorNode(
        'OverworldUtility',
        overworldProfile.candidates,
        overworldProfile.fallbackNode,
    ),
    [config.PROFILES.HOSTILE_COMBAT]: new UtilitySelectorNode(
        'HostileCombatUtility',
        hostileCombatProfile.candidates,
        hostileCombatProfile.fallbackNode,
    ),

    // Po potrebi, samo dodaj još profila ovdje
}

// Default profil -- Za nas end dio
state.mission.activeProfile = config.PROFILES.END

bot.once('spawn', () => {
    const mcData = require('minecraft-data')(bot.version)
    const defaultMove = new Movements(bot, mcData)

    // Dozvoli botu da koristi logove kao scaffolding ako mora
    // Dodaj sve scaffolding blokove (dirt, cobble, logs, end_stone...) u movements
    const scaffoldingIds = config.BLOCKS.SCAFFOLDING
        .map(name => bot.registry.itemsByName[name]?.id)
        .filter(id => id !== undefined)
    scaffoldingIds.forEach(id => defaultMove.scafoldingBlocks.push(id))

    bot.pathfinder.setMovements(defaultMove)

    // Pokreni periodično snimanje svijeta
    worldSensors = startWorldSensors(bot, state, {
        intervalMs: config.SENSORS.WORLD_UPDATE_MS,
    })

    console.log('Bot spawned')
    bot.chat('Bot ready - reci "start" za pocetak!')

    startLoop()
})

// Loop koji svake 500ms tika aktivno BT stablo
async function startLoop() {
    while (true) {
        try {
            await loop()
        } catch (err) {
            console.log(err)
        }
        await new Promise(r => setTimeout(r, 500))
    }
}

async function loop() {
    if (!huntFlag) return

    const profileKey = state.mission?.activeProfile || config.PROFILES.END
    const activeTree = utilityTreesByProfile[profileKey] || utilityTreesByProfile[config.PROFILES.END]
    await activeTree.tick(bot, state, config)
}

// CHAT KOMANDE
bot.on('chat', (username, message) => {
    if (username === bot.username) return

    if (message === 'start') {
        bot.chat('Starting!')
        huntFlag = true
    }
    else if (message === 'stop') {
        bot.chat('Stopping!')
        bot.pathfinder.setGoal(null)
        huntFlag = false
    }
    else if (message === 'profile end') {
        state.mission.activeProfile = config.PROFILES.END
        bot.chat('Profile switched: END')
    }
    else if (message === 'inventory') {
        console.log(bot.inventory.items())
    }
    else if (message === 'tp') {
        bot.chat('/tp @s ' + username)
    }
    else if (message === 'help') {
        bot.chat('Komande: start, stop, profile end, inventory, tp')
    }
})

// CLEANUP
bot.on('error', (err) => console.log('ERROR:', err.message))
bot.on('end', () => {
    if (worldSensors) {
        worldSensors.stop()
        worldSensors = null
    }
    console.log('Bot disconnect!')
})

console.log('=== ANTE BOT 1.21.11 ===')
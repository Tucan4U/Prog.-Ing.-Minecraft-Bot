const resetState = require("../utils/resetState");
const { checkEnderEyesPosession, hasRequiredNetherItem } = require("../utils/netherUtils");

function netherMain(bot, state, config) {
    // Combined unified command: switch to Nether profile, request both enter and fortress search.
    // BT will first run EnterNether (score 200) to enter the Nether via portal,
    // then automatically switch to FindFortress (score 150) once in the Nether dimension.
    // then automatically switch to FindBlazeSpawner (score 100) once fortress is reached.

    state.mission.netherMode = config.NETHER_MODES.AUTONOMOUS; // Set mode to autonomous for the main nether run.
    state.mission.activeProfile = config.PROFILES.NETHER;  // Swith to Nether profile

    // If already have ender eyes, no need to enter the Nether. Notify and reset state.
    if (checkEnderEyesPosession(bot, state, config)) {
        if (bot.game && bot.game.dimension === 'the_nether') {
            state.mission.netherMode = config.NETHER_MODES.AUTONOMOUS; // Set mode to autonomous for the main nether run.
            bot.chat('I already have enough ender eyes, exiting the Nether to continue main run.');
            state.mission.exitNetherRequested = true;
        } else {
            bot.chat("I have enough ender eyes, no need to go in the Nether.");
            resetState(bot);
        }

    } else {
        
        state.mission.enterNetherRequested = true;
        state.mission.findFortressRequested = true;
        state.mission.fortressTarget = null;
        state.mission.findBlazeSpawnerRequested = true;
        state.blazeSpawnerBlock = null;
        
        // Blaze killing and blaze rod collection
        state.mission.blazeHuntingRequested = true;
        state.mission.targetBlazeRods = 10; // Set desired blaze rod count for hunting mode.
        
        state.mission.exitNetherRequested = true;

        state.mission.craftBlazePowderRequested = true; // Request crafting blaze powder after collecting rods.
        state.mission.targetBlazePowder = 20; // Set desired blaze powder count (from 10 rods) for crafting mode.

        state.mission.craftEnderEyesRequested = true; // Request crafting ender eyes after crafting blaze powder.
        state.mission.enderEyesTargetNumber = 12; // Set desired ender eye count for crafting mode.
    }
        
    if (bot.game && bot.game.dimension === 'the_nether') {
    bot.chat('Nether mode: already in Nether!');
    } else {
    bot.chat('Nether mode: switching profile and entering Nether.');
    }
}

function enterNetherCommand(bot, state, config) {
    // If we're already in the Nether, notify and clear the request

    state.mission.netherMode = config.NETHER_MODES.MANUAL; // Set mode to manual for single commands.

    if (bot.game && bot.game.dimension === 'the_nether') {
        state.mission.activeProfile = config.PROFILES.NETHER;
        state.mission.enterNetherRequested = false;
        bot.chat('I am already in the Nether.');
    } else {
        state.mission.activeProfile = config.PROFILES.NETHER;
        state.mission.enterNetherRequested = true;
        bot.chat('Switching to Nether profile and entering nether.');
    }
}

function exitNetherCommand(bot, state, config) {
    // If we're already outside the Nether, notify and clear the request

    state.mission.netherMode = config.NETHER_MODES.MANUAL; // Set mode to manual for single commands.

    if (bot.game && bot.game.dimension !== 'the_nether') {
        state.mission.activeProfile = config.PROFILES.NETHER;
        state.mission.exitNetherRequested = false;
        bot.chat('I am already outside the Nether.');
    } else {
        state.mission.activeProfile = config.PROFILES.NETHER;
        state.mission.exitNetherRequested = true;
        bot.chat('Switching to Nether profile and exiting nether.');
    }
}

function findFortressCommand(bot, state, config) {
    // Request a fortress search within the Nether profile. If not in the Nether, also request entry.

    state.mission.netherMode = config.NETHER_MODES.MANUAL;

    state.mission.activeProfile = config.PROFILES.NETHER;
    state.mission.findFortressRequested = true;
    state.mission.fortressTarget = null;

    if (bot.game && bot.game.dimension === 'the_nether') {
    bot.chat('Finding fortress in the Nether.');
    } else {
    state.mission.enterNetherRequested = true;
    bot.chat('Switching to Nether profile and finding fortress.');
    }
}

function findBlazeSpawnerCommand(bot, state, config) {
    // Request a blaze spawner search within the Nether profile.

    state.mission.netherMode = config.NETHER_MODES.MANUAL;

    state.mission.activeProfile = config.PROFILES.NETHER;
    state.mission.findFortressRequested = true; // Ensure fortress search is also requested since blaze spawners are in fortresses.
    state.mission.findBlazeSpawnerRequested = true;
    state.blazeSpawnerBlock = null;

    if (bot.game && bot.game.dimension === 'the_nether') {
    bot.chat('Searching for blaze spawner in the Nether.');
    } else {
    state.mission.enterNetherRequested = true;
    bot.chat('Switching to Nether profile and will search for blaze spawner after entering.');
    }
}

function lootBlazeRodsCommand(bot, state, config, message) {
    // Request a blaze spawner search within the Nether profile.

    state.mission.netherMode = config.NETHER_MODES.MANUAL;

    state.mission.activeProfile = config.PROFILES.NETHER;
    state.mission.findFortressRequested = true; // Ensure fortress search is also requested since blaze spawners are in fortresses.
    state.mission.findBlazeSpawnerRequested = true;
    state.blazeSpawnerBlock = null;

    // Blaze killing and looting
    state.mission.blazeHuntingRequested = true;
    const amountStr = message.split(" ")[2];
    const amount = parseInt(amountStr, 10);
    bot.chat(`Collect rods command received with amount: ${amount}.`);
    if (!isNaN(amount)) {
      state.mission.netherMode = config.NETHER_MODES.MANUAL;
      state.mission.activeProfile = config.PROFILES.NETHER;
      state.mission.blazeHuntingRequested = true;
      state.mission.targetBlazeRods = amount;
      bot.chat(`Roger that. Hunting until I have ${amount} blaze rods.`);
    } else {
        bot.chat('Invalid amount or no amount specified for blaze rods.');
        resetState(bot);
        return;
    }

    if (bot.game && bot.game.dimension === 'the_nether') {
    bot.chat('Searching for blaze spawner in the Nether.');
    } else {
    state.mission.enterNetherRequested = true;
    bot.chat('Switching to Nether profile and will search for blaze spawner after entering.');
    }
}

function craftBlazePowderCommand(bot, state, config) {
    // No need to be in the Nether for this one so no dimension check

    state.mission.netherMode = config.NETHER_MODES.MANUAL;
    state.mission.activeProfile = config.PROFILES.NETHER;

    const blazeRodCount = hasRequiredNetherItem(bot, state, config, 'blaze_rod');
    if (bot.game && blazeRodCount > 0) {
        bot.chat('Crafting blaze powder from blaze rods.');
        state.mission.craftBlazePowderRequested = true;
        state.mission.targetBlazePowder = blazeRodCount * 2; // Convert all available rods to blaze powder.
    } else {
        bot.chat('Not enough blaze rods to craft blaze powder.');
        state.mission.craftBlazePowderRequested = false;
    }
}

function craftEnderEyesCommand(bot, state, config) {
    // No need to be in the Nether for this one so no dimension check

    state.mission.netherMode = config.NETHER_MODES.MANUAL;
    state.mission.activeProfile = config.PROFILES.NETHER;

    const blazePowderCount = hasRequiredNetherItem(bot, state, config, 'blaze_powder');
    const enderPearlCount = hasRequiredNetherItem(bot, state, config, 'ender_pearl');
    if (bot.game && blazePowderCount > 0 && enderPearlCount > 0) {
        bot.chat('Crafting ender eyes from blaze powder and ender pearls.');
        state.mission.craftEnderEyesRequested = true;
        state.mission.enderEyesTargetNumber = Math.min(blazePowderCount, enderPearlCount);
    } else {
        bot.chat('Not enough blaze powder or ender pearls to craft ender eyes.');
        state.mission.craftEnderEyesRequested = false;
    }
}

module.exports = { netherMain, enterNetherCommand, findFortressCommand, findBlazeSpawnerCommand, lootBlazeRodsCommand, craftBlazePowderCommand, craftEnderEyesCommand, exitNetherCommand };
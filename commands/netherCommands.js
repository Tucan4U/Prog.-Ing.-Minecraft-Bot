function netherMain(bot, state, config) {
    // Combined unified command: switch to Nether profile, request both enter and fortress search.
    // BT will first run EnterNether (score 200) to enter the Nether via portal,
    // then automatically switch to FindFortress (score 150) once in the Nether dimension.
    // then automatically switch to FindBlazeSpawner (score 100) once fortress is reached.

    state.mission.netherMode = config.NETHER_MODES.AUTONOMOUS; // Set mode to autonomous for the main nether run.

    state.mission.activeProfile = config.PROFILES.NETHER;
    state.mission.enterNetherRequested = true;
    state.mission.findFortressRequested = true;
    state.mission.fortressTarget = null;
    state.mission.findBlazeSpawnerRequested = true;
    state.blazeSpawnerBlock = null;

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

module.exports = { netherMain, enterNetherCommand, findFortressCommand, findBlazeSpawnerCommand };
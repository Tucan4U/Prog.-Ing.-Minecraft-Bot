function destroyEndCrystalScore(bot, state, config) {
    if (state.mission?.phase !== 'END_FIGHT') {
        return 0
    }
    

    const crystals = Object.values(bot.entities).filter(entity =>
        entity &&
        entity.name === 'end_crystal'
    )

    if (crystals.length > 0) {
        console.log("[CRYSTALS]", crystals.length)
        return 300
    }

    return 0
}

module.exports = {
    destroyEndCrystalScore
}
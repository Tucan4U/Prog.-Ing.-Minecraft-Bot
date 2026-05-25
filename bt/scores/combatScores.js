const { needsFood } = require('../../utils/inventory')
const { findMobs } = require('../../behaviors/findEntities')

// Lov životinja (npr. chicken) - samo ako treba hrana
function huntAnimalsScore(bot, state, config) {
    if (!needsFood(bot, state, config)) return 0

    const animals = findMobs(bot, config.ANIMALS, state.sensors?.entities)
    return animals.length ? 80 : 0
}

// Lov hostile mobova - uvijek visok prioritet ako su blizu
function huntHostileScore(bot, state, config) {
    const hostiles = findMobs(bot, config.HOSTILES, state.sensors?.entities)
    return hostiles.length ? 100 : 0
}

module.exports = { huntAnimalsScore, huntHostileScore }
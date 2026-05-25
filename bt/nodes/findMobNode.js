const { Node } = require('../behaviorTree')
const { findMobs } = require('../../behaviors/findEntities')
const { getClosestEntity } = require('../../utils/target')

class FindMobNode extends Node {
    constructor(configKey, stateKey = 'currentTarget') {
        super('FindMob')
        this.configKey = configKey
        this.stateKey = stateKey
    }

    async tick(bot, state, config) {
        let target = state[this.stateKey]

        // Ako je target despawnao, počisti
        if (target && !bot.entities[target.id]) {
            state[this.stateKey] = null
            target = null
        }

        if (target) return 'SUCCESS'

        const filter = config[this.configKey]
        const mobs = findMobs(bot, filter, state.sensors?.entities)

        if (!mobs.length) return 'FAILURE'

        target = getClosestEntity(bot, mobs)
        state[this.stateKey] = target
        bot.chat(`New target: ${target.name}`)
        return 'SUCCESS'
    }
}

module.exports = FindMobNode
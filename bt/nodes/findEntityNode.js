const { Node } = require('../behaviorTree')
const { getClosestEntity } = require('../../utils/target')

class FindEntityNode extends Node {
    constructor(entityName, stateKey = 'currentTarget') {
        super('FindEntity')

        this.entityName = entityName
        this.stateKey = stateKey
    }

    async tick(bot, state, config) {
        let target = state[this.stateKey]

        // If entity disappeared, clear target
        if (target && !bot.entities[target.id]) {
            state[this.stateKey] = null
            target = null
        }

        // Reuse existing target
        if (target) {
            return 'SUCCESS'
        }

        // Find all matching entities
        const entities = Object.values(bot.entities).filter(entity =>
            entity &&
            entity.name === this.entityName
        )

        if (!entities.length) {
            return 'FAILURE'
        }

        // Select closest entity
        target = getClosestEntity(bot, entities)

        state[this.stateKey] = target

        bot.chat(`Found ${target.name}`)

        return 'SUCCESS'
    }
}

module.exports = FindEntityNode
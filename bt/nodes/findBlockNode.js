const { Node } = require('../behaviorTree')
const mcData = require('minecraft-data')

class FindBlockNode extends Node {
    constructor(configKey, stateKey = 'blockTarget', maxBlockDistance = 16) {
        super('FindBlock')
        this.mcData = null
        this.configKey = configKey
        this.stateKey = stateKey
        this.maxBlockDistance = maxBlockDistance
    }

    async tick(bot, state, config) {
        if (!this.mcData) this.mcData = mcData(bot.version)
        if (state.lootTarget) return 'SUCCESS'

        let block = state[this.stateKey]

        if (block) {
            const currentBlock = bot.blockAt(block.position)

            if (!currentBlock || currentBlock.name === 'air') {
                state[this.stateKey] = null
            }
        }

        if (state[this.stateKey]) return 'SUCCESS'

        const blocks = bot.findBlocks({
            maxDistance: this.maxBlockDistance,
            matching: config.BLOCKS[this.configKey].names
                .map(name => this.mcData.blocksByName[name]?.id)
                .filter(Boolean),
            count: 1,
        })

        if (!blocks.length) {
            this.maxBlockDistance *= 2
            return 'FAILURE'
        }

        state[this.stateKey] = bot.blockAt(blocks[0])
        this.maxBlockDistance = 16
        return 'SUCCESS'
    }
}

module.exports = FindBlockNode
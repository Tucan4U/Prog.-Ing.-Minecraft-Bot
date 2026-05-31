const { Node } = require('../behaviorTree')

class ShearPumpkinNode extends Node {
    constructor(stateKey = 'blockTarget') {
        super('ShearPumpkin')
        this.stateKey = stateKey
    }

    async tick(bot, state, config) {
        const target = state[this.stateKey]
        if (!target) return 'FAILURE'

        // Provjeri je li blok još pumpkin (mogao se već shearati prethodnim tickom)
        const block = bot.blockAt(target.position)
        if (!block) return 'FAILURE'

        // Ako je već carved_pumpkin, ne treba shearati — gotovo
        if (block.name === 'carved_pumpkin') {
            return 'SUCCESS'
        }

        // Ako blok više nije pumpkin (npr. zrak), failure
        if (block.name !== 'pumpkin') {
            state[this.stateKey] = null
            return 'FAILURE'
        }

        // Nađi shears u inventaru
        const shears = bot.inventory.items().find(item => item.name === 'shears')
        if (!shears) {
            bot.chat("I do not have shears, Bob!")
            return 'FAILURE'
        }

        try {
            await bot.equip(shears, 'hand')
            await bot.lookAt(block.position.offset(0.5, 0.5, 0.5))
            await bot.activateBlock(block)
            bot.chat("Pumpkin sheared!")
            return 'SUCCESS'
        } catch (err) {
            console.log("Shear error:", err.message)
            return 'FAILURE'
        }
    }
}

module.exports = ShearPumpkinNode
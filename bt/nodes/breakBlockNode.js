const { Node } = require('../behaviorTree')
const { equipBestWeapon } = require('../../utils/inventory')

class BreakBlockNode extends Node {
    constructor(stateKey, reachDistance, tools) {
        super('BreakBlock')
        this.stateKey = stateKey
        this.reachDistance = reachDistance
        this.tools = tools
    }

    async tick(bot, state, config) {
        if (state.lootTarget) return 'SUCCESS'
        const targetBlock = state[this.stateKey]
        if (!targetBlock) return 'FAILURE'

        const block = bot.blockAt(targetBlock.position)
        if (block.name === 'air') {
            state.digTask = null
            state[this.stateKey] = null
            return 'SUCCESS'
        }

        const dist = bot.entity.position.distanceTo(block.position)
        if (dist > this.reachDistance) { state.digTask = null; return 'FAILURE' }

        if (!state.digTask) {
            bot.pathfinder.setGoal(null)
            await equipBestWeapon(bot, config[this.tools] || [])
            
            // DODANO; nije mi radilo kopanje pumpkina
            await bot.lookAt(block.position.offset(0.5, 0.5, 0.5))
            state.digTask = bot.dig(block)
                .then(() => { 
                    state.digTask = null 
                })
                .catch(err => { 
                    console.log("Dig error:", err.message)
                    state.digTask = null 
                })

            return 'RUNNING'
        }

        if (block.name === 'air') {
            state.digTask = null
            state[this.stateKey] = null
            return 'SUCCESS'
        }
        return 'RUNNING'
    }
}

module.exports = BreakBlockNode
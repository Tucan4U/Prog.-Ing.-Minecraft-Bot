const { Node } = require('../behaviorTree')
const { goals } = require('mineflayer-pathfinder')

class EnterEndPortalNode extends Node {
    constructor(maxDistance = 12) {
        super('EnterEndPortal')
        this.maxDistance = maxDistance
        this.lastGoal = null
    }

    async tick(bot, state, config) {
        const portalId = bot.registry.blocksByName.end_portal?.id
        if (!portalId) return 'FAILURE'

        const positions = bot.findBlocks({
            matching: portalId,
            maxDistance: this.maxDistance,
            count: 9,
        })

        if (!positions.length) {
            return 'FAILURE'
        }

        const portalBlock = bot.blockAt(positions[0])
        if (!portalBlock) return 'FAILURE'

        const dist = bot.entity.position.distanceTo(portalBlock.position)

        if (dist < 1.2) {
            state.enteredEndPortal = true
            return 'SUCCESS'
        }

        const key = `${portalBlock.position.x}:${portalBlock.position.y}:${portalBlock.position.z}`

        if (this.lastGoal !== key || bot.pathfinder.goal === null) {
            bot.pathfinder.setGoal(new goals.GoalBlock(
                portalBlock.position.x,
                portalBlock.position.y,
                portalBlock.position.z
            ))
            this.lastGoal = key
        }

        return 'RUNNING'
    }
}

module.exports = EnterEndPortalNode
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

        const targetX = portalBlock.position.x + 0.5
        const targetY = portalBlock.position.y
        const targetZ = portalBlock.position.z + 0.5

        const dx = bot.entity.position.x - targetX
        const dz = bot.entity.position.z - targetZ
        const horizontalDist = Math.sqrt(dx * dx + dz * dz)

        if (horizontalDist < 1.2) {
            bot.pathfinder.setGoal(null)
            await bot.lookAt(portalBlock.position.offset(0.5, 0.2, 0.5), true)
            bot.setControlState('forward', true)
            await bot.waitForTicks(20)
            bot.setControlState('forward', false)

            state.enteredEndPortal = true
            return 'SUCCESS'
        }

        const key = `${portalBlock.position.x}:${portalBlock.position.y}:${portalBlock.position.z}`

        if (this.lastGoal !== key || bot.pathfinder.goal === null) {
            bot.pathfinder.setGoal(new goals.GoalNear(
                targetX,
                targetY,
                targetZ,
                1
            ))
            this.lastGoal = key
        }

        return 'RUNNING'
    }
}

module.exports = EnterEndPortalNode
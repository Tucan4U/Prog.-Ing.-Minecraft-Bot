const { Node } = require('../behaviorTree')
const { goals } = require('mineflayer-pathfinder')
const { chatThrottled } = require('../../utils/throttle')

class MoveToVisibleBlockNode extends Node {
    constructor(stateKey = 'blockTarget', nearDistance = 1, successDistance = 4, statusThrottleMs = 3000) {
        super('MoveToVisibleBlock')
        this.stateKey = stateKey
        this.nearDistance = nearDistance
        this.successDistance = successDistance
        this.statusThrottleMs = statusThrottleMs
        this.lastGoal = null
        // FIKS ZA PLIVANJE 
        this.startedAt = null
        this.timeoutMs = 15000
    }

    async tick(bot, state) {
        const target = state[this.stateKey]
        if (!target) {
            console.log('[MoveToVisibleBlock] no target:', this.stateKey)
            this.lastGoal = null
            return 'FAILURE'
        }

        if (this.startedAt === null) {
        this.startedAt = Date.now()
        }   

        const block = bot.blockAt(target.position)
        if (!block || block.name === 'air') {
            console.log('[MoveToVisibleBlock] invalid block:', {
                stateKey: this.stateKey,
                targetPos: target.position,
                block: block?.name,
            })

            state[this.stateKey] = null
            this.lastGoal = null
            return 'FAILURE'
        }

        const dist = bot.entity.position.distanceTo(block.position)
        const canSee = bot.canSeeBlock(block)

        if (Date.now() - this.startedAt > this.timeoutMs) {
            console.log('[MoveToVisibleBlock] stuck, clearing target:', this.stateKey)
            state[this.stateKey] = null
            this.lastGoal = null
            this.startedAt = null
            bot.pathfinder.setGoal(null)
            return 'FAILURE'
        }

        if (dist <= this.successDistance && canSee) {
            return 'SUCCESS'
        }

        const goal = `${Math.floor(block.position.x)}:${Math.floor(block.position.y)}:${Math.floor(block.position.z)}`

        if (this.lastGoal !== goal || bot.pathfinder.goal === null) {
            bot.pathfinder.setGoal(new goals.GoalNear(
                block.position.x,
                block.position.y,
                block.position.z,
                this.nearDistance
            ))
            this.lastGoal = goal
        }

        chatThrottled(
            bot,
            `movevisible:${goal}`,
            `Moving to visible ${block.name} @ ${Math.round(dist)}b`,
            this.statusThrottleMs
        )

        return 'RUNNING'
    }
}

module.exports = MoveToVisibleBlockNode
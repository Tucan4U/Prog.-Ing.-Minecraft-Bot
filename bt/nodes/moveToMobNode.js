const { Node } = require('../behaviorTree')
const { goals } = require('mineflayer-pathfinder')
const { chatThrottled } = require('../../utils/throttle')

class MoveToMobNode extends Node {
    constructor(stateKey = 'currentTarget', nearDistance = 2, successDistance = 3, statusThrottleMs = 3000) {
        super('MoveToMob')
        this.stateKey = stateKey
        this.nearDistance = nearDistance
        this.successDistance = successDistance
        this.statusThrottleMs = statusThrottleMs
        this.lastGoal = null
    }

    async tick(bot, state) {
        const target = state[this.stateKey]

        if (!target || !bot.entities[target.id]) {
            state[this.stateKey] = null
            this.lastGoal = null
            return 'FAILURE'
        }

        const dist = bot.entity.position.distanceTo(target.position)
        if (dist < this.successDistance) return 'SUCCESS'

        const goal = `${Math.floor(target.position.x)}:${Math.floor(target.position.y)}:${Math.floor(target.position.z)}`

        if (this.lastGoal !== goal || bot.pathfinder.goal === null) {
            bot.pathfinder.setGoal(new goals.GoalNear(
                target.position.x, target.position.y, target.position.z,
                this.nearDistance
            ))
            this.lastGoal = goal
        }

        chatThrottled(bot, `move:${target.id}`, `Moving to ${target.name} @ ${Math.round(dist)}b`, this.statusThrottleMs)
        return 'RUNNING'
    }
}

module.exports = MoveToMobNode
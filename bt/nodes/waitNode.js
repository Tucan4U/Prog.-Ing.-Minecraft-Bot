const { Node } = require('../behaviorTree')

class WaitNode extends Node {
    constructor(durationMs = 500) {
        super('Wait')
        this.durationMs = durationMs
        this.startTime = null
    }

    async tick(bot, state, config) {
        if (this.startTime === null) {
            this.startTime = Date.now()
            return 'RUNNING'
        }

        if (Date.now() - this.startTime >= this.durationMs) {
            this.startTime = null
            return 'SUCCESS'
        }

        return 'RUNNING'
    }
}

module.exports = WaitNode
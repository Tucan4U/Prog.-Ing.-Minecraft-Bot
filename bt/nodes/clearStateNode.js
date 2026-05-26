const { Node } = require('../behaviorTree')

class ClearStateNode extends Node {
    constructor(stateKey) {
        super('ClearState')
        this.stateKey = stateKey
    }

    async tick(bot, state, config) {
        state[this.stateKey] = null
        return 'SUCCESS'
    }
}

module.exports = ClearStateNode
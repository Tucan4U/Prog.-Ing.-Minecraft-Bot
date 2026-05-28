const { Node } = require('../behaviorTree')

class MarkStateNode extends Node {
    constructor(path, value = true) {
        super('MarkState')
        this.path = path
        this.value = value
    }

    async tick(bot, state, config) {
        let target = state

        for (let i = 0; i < this.path.length - 1; i++) {
            const key = this.path[i]
            target[key] ??= {}
            target = target[key]
        }

        target[this.path[this.path.length - 1]] = this.value
        return 'SUCCESS'
    }
}

module.exports = MarkStateNode
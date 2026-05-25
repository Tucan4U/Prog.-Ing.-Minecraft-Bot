const { Node } = require('../behaviorTree')
const { equipBestWeapon } = require('../../utils/inventory')

class AttackNode extends Node {
    constructor() {
        super("Attack")
    }

    async tick(bot, state, config) {
        const target = state.currentTarget
        if (!target) return 'FAILURE'

        // Ghost target check
        if (!bot.entities[target.id]) {
            state.currentTarget = null
            return 'FAILURE'
        }

        const dist = bot.entity.position.distanceTo(target.position)
        const attackRange = config?.BT?.ATTACK_RANGE ?? 4

        if (dist > attackRange) return 'FAILURE'

        await equipBestWeapon(bot, config.WEAPONS)
        await bot.lookAt(target.position, true)
        bot.attack(target, true)

        return 'RUNNING'
    }
}

module.exports = AttackNode
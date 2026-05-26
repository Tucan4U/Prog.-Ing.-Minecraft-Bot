const { Node } = require('../behaviorTree')
const { equipBestWeapon } = require('../../utils/inventory')

class AttackNode extends Node {
    constructor(stateKey = 'currentTarget') {
        super("Attack")
        this.stateKey = stateKey
    }

    async tick(bot, state, config) {
        const target = state[this.stateKey]
        if (!target) return 'FAILURE'

        // Ako je mob umro / nestao / despawnao, attack je gotov
        if (!bot.entities[target.id]) {
            state[this.stateKey] = null
            return 'SUCCESS'
        }

        const dist = bot.entity.position.distanceTo(target.position)
        const attackRange = config?.BT?.ATTACK_RANGE ?? 4

        if (dist > attackRange) return 'FAILURE'

        await equipBestWeapon(bot, config.WEAPONS)

        //Drugacije, ako je mob u rangu, ali nije direktno ispred nas, okreni se prema njemu
        //Uglavnom drobim
        const lookPosition = target.position.offset(0, target.height ?? 1, 0)
        await bot.lookAt(lookPosition, true)

        bot.attack(target, true)

        return 'RUNNING'
    }
}

module.exports = AttackNode
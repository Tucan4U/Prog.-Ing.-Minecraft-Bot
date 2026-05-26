const { Node } = require('../behaviorTree')
const { goals } = require('mineflayer-pathfinder')
const { findItem } = require('../../behaviors/loot')

class PickUpItemNode extends Node {
    constructor(configKeyOrItems) {
        super("PickUpItemNode")
        this.configKeyOrItems = configKeyOrItems
    }

    async tick(bot, state, config) {
        await new Promise(r => setTimeout(r, 500))
        const items = Array.isArray(this.configKeyOrItems)
            ? this.configKeyOrItems
            : config?.[this.configKeyOrItems]

        //VEZANO UZ POKSUAJ 2 za findItem, provjerava i state.sensors.items (ako postoji) i bot.entities

        //const item = findItem(bot, items, state.sensors?.items)
        const item = findItem(bot, items)
        
        if (!item) { state.lootTarget = null; return 'FAILURE' }

        state.lootTarget = item
        bot.pathfinder.setGoal(new goals.GoalBlock(item.position.x, item.position.y, item.position.z))

        const dist = bot.entity.position.distanceTo(item.position)
        if (dist < 1.5) { state.lootTarget = null; return 'SUCCESS' }

        return 'RUNNING'
    }
}

module.exports = PickUpItemNode
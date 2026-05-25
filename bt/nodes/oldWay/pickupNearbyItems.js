const { goals } = require('mineflayer-pathfinder')
const GoalNear = goals.GoalNear

/**
 * Picks up all nearby dropped items.
 * The bot will continuously move to the closest item entity
 * until no more items are detected or stop is requested.
 */
async function pickupNearbyItems(bot, shouldStop) {
    while (true) {
        if (shouldStop()) return

        const item = bot.nearestEntity(e => e.name === 'item')

        if (!item) return

        const pos = item.position

        bot.pathfinder.setGoal(null)

        const goal = new GoalNear(pos.x, pos.y, pos.z, 1)
        bot.pathfinder.setGoal(goal)

        await new Promise(resolve => bot.once('goal_reached', resolve))

        // Allow time for pickup registration
        await new Promise(resolve => setTimeout(resolve, 300))
    }
}

module.exports = {pickupNearbyItems}
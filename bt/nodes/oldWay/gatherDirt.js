const { goals } = require('mineflayer-pathfinder')
const GoalNear = goals.GoalNear

//const pickupNearbyItems = require('./pickupNearbyItems')
const { pickupNearbyItems } = require('./pickupNearbyItems')

/**
 * Gathers a specified amount of dirt blocks.
 * The bot will search for nearby dirt, walk to it, mine it,
 * and collect the dropped items until the target amount is reached.
 */
async function gatherDirt(bot, targetAmount, mcData, shouldStop) {
    while (true) {
        if (shouldStop()) {
            bot.chat("Stopping dirt gathering.")
            return
        }

        //Checking if it already has enough dirt blocks
        const dirtCount = bot.inventory.count(mcData.itemsByName.dirt.id)

        
        if (dirtCount >= targetAmount) {
            bot.chat(`Collected ${dirtCount} dirt blocks.`)
            return
        }

        // Find nearest reachable dirt block with air anywhere around it 
        // or a grass block above it
        const dirtBlock = bot.findBlock({
            matching: mcData.blocksByName.dirt.id,
            maxDistance: 48,
            useExtraInfo: (block) => {
                const pos = block.position

                // --- 1. Check if ANY side has air (exposed dirt)
                const directions = [
                    [0, 1, 0],
                    [1, 0, 0],
                    [-1, 0, 0],
                    [0, 0, 1],
                    [0, 0, -1]
                ]

                const hasAirNearby = directions.some(([x, y, z]) => {
                    const neighbor = bot.blockAt(pos.offset(x, y, z))
                    return neighbor && neighbor.type === 0
                })

                if (hasAirNearby) return true

                // --- 2. Check if dirt is under grass block (very common surface case)
                const above = bot.blockAt(pos.offset(0, 1, 0))

                if (above && above.type === mcData.blocksByName.grass_block.id) {
                    return true
                }

                return false
            }
        })

        if (!dirtBlock) {
            bot.chat("No dirt found nearby.")
            return
        }

        // Reset pathfinding goal before assigning a new one
        bot.pathfinder.setGoal(null)

        const goal = new GoalNear(
            dirtBlock.position.x,
            dirtBlock.position.y,
            dirtBlock.position.z,
            1
        )

        bot.pathfinder.setGoal(goal)

        await new Promise(resolve => bot.once('goal_reached', resolve))

        if (shouldStop()) {
            bot.chat("Stopped before mining.")
            return
        }

        try {
            await bot.dig(dirtBlock)

            // Wait for item to spawn
            await new Promise(resolve => setTimeout(resolve, 200))

            // Collect dropped items
            await pickupNearbyItems(bot, shouldStop)

        } catch (err) {
            console.log("Dig error:", err)
        }

        await new Promise(resolve => setTimeout(resolve, 200))
    }
}

module.exports = {gatherDirt}
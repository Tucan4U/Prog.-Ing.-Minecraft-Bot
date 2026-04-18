const {
    goals: { GoalNear },
} = require("mineflayer-pathfinder");


//Main function to find and travel to a fortress
async function findNetherFortress(bot) {
    // 1. Check if we are actually in the nether
    if (!bot.game.dimension.includes('nether')) {
        bot.chat("I need to be in the Nether to find a fortress!");
        return;
    }

    bot.chat("Locating nearest fortress...");
    
    // 2. "Wait" for the server to reply to our /locate command
    const coordinates = await locateFortress(bot);

    if (!coordinates) {
        bot.chat("I couldn't find the coordinates for a fortress.");
        return;
    }

    bot.chat(`Coordinates received: ${coordinates.x}, ${coordinates.z}. Starting travel...`);

    // 3. Start the incremental travel loop
    await travelLongDistance(bot, coordinates.x, coordinates.z);

    bot.chat("I arrived at the fortress!");
}

// Sends /locate command and parses the chat response
function locateFortress(bot) {
    return new Promise((resolve) => {
        // Send command
        bot.chat("/locate structure minecraft:fortress");

        // Temporary listener to catch the server's reply
        const messageListener = (jsonMsg) => {
            const message = jsonMsg.toString();

            // Using Regex to pull numbers (coordinates x, y, z) out of the string
            const coords = message.match(/\[?(-?\d+),\s*~?,\s*(-?\d+)\]?/);

            if (coords) {
                bot.removeListener('message', messageListener);
                resolve({
                    x: parseInt(coords[1]),
                    z: parseInt(coords[2])
                });
            }
        };

        bot.on('message', messageListener);

        // Timeout after 10 seconds if no message is found
        setTimeout(() => {
            bot.removeListener('message', messageListener);
            resolve(null);
        }, 10000);
    });
}

// Moves the bot in steps of 400 blocks to avoid pathfinding crashes
async function travelLongDistance(bot, targetX, targetZ) {
    const MOVE_STEP = 400; // Under 512 to avoid crash risks

    while (true) {
        const currentPos = bot.entity.position;
        
        // Calculate distance to final target
        const dx = targetX - currentPos.x;
        const dz = targetZ - currentPos.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        // Within 5 block = SUCCESS
        if (distance <= 5) break;

        let nextX, nextZ;

        if (distance > MOVE_STEP) {
            // Scaling the coordinates down
            const ratio = MOVE_STEP / distance;
            nextX = currentPos.x + dx * ratio;
            nextZ = currentPos.z + dz * ratio;
            console.log(`Relay step: Heading toward ${Math.round(nextX)}, ${Math.round(nextZ)}`);
        } else {
            // Close enough to go to the final destination
            nextX = targetX;
            nextZ = targetZ;
        }

        try {
            // Set goal to the next intermediate point
            await bot.pathfinder.goto(new GoalNear(nextX, currentPos.y, nextZ, 2));
            // Small pause to let the bot "breathe" between relay points and let server know Bot still present
            await bot.waitForTicks(20);
        } catch (err) {
            console.log("Travel error:", err);
            break;
        }
    }
}

module.exports = { findNetherFortress };
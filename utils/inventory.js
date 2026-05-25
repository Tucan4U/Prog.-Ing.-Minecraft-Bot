// Equipa najbolje oružje koje bot ima (po prioritetu iz liste)
async function equipBestWeapon(bot, weapons) {
    const currentItem = bot.heldItem?.name

    for (const weapon of weapons) {
        const item = bot.inventory.items().find(i => i.name === weapon)
        if (!item) continue

        try {
            await bot.equip(item, "hand")
            if (currentItem !== weapon) {
                bot.chat(`Equipped ${weapon}`)
            }
            return
        } catch (err) {
            console.log(`Couldn't equip ${weapon}:`, err.message)
        }
    }

    console.log("No weapons available")
}

// Provjerava ima li bot dovoljno hrane (manje od 32 = treba još)
function needsFood(bot, state, config) {
    const foodCount = bot.inventory
        .items()
        .filter(i => config.FOOD.includes(i.name))
        .reduce((sum, i) => sum + i.count, 0)

    return foodCount < 32
}

// Broji koliko ima bot blokova određene vrste (npr. logova)
function numOfBlocks(bot, state, config, blocksKey) {
    const blockCount = bot.inventory
        .items()
        .filter(item => config.BLOCKS[blocksKey]?.names.includes(item.name))
        .reduce((count, item) => count + item.count, 0)
    return blockCount || 0
}

module.exports = { equipBestWeapon, needsFood, numOfBlocks }

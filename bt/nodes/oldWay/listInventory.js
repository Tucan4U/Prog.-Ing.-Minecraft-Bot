/**
 * Lists all items currently in the bot's inventory.
 * Outputs each item with its quantity via chat.
 */
function listInventory(bot) {
    const items = bot.inventory.items()

    //Checks if its' inventory is empty
    if (items.length === 0) {
        bot.chat("Inventory is empty.")
        return
    }

    bot.chat("Inventory contents:")

    items.forEach(item => {
        bot.chat(`${item.name} x${item.count}`)
    })
}

module.exports = {listInventory}
// Score funkcija koja procjenjuje treba li bot ići po pumpkin helmet
function getPumpkinHelmetScore(bot, state, config) {
    const helmetSlot = bot.inventory.slots[5]

    // ako ima pumpkin helmet, nema potrebe da ga traži
    if (helmetSlot && helmetSlot.name === 'carved_pumpkin') {
        return 0
    }

    // ako nema pumpkin helmet, ali ima carved_pumpkin u inventoryju, treba ga obuci
    const hasPumpkinInInventory = bot.inventory.items().some(item =>
        item.name === 'carved_pumpkin'
    )

    if (hasPumpkinInInventory) {
        return 50
    }

    //inace treba ići po pumpkin
    return 50
}

module.exports = { getPumpkinHelmetScore }
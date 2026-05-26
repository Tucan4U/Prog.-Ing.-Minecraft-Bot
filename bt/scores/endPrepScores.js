const { numOfItems } = require('../../utils/inventory')

const FEATHER_GOAL = 64
const STRING_GOAL = 64

const GATHER_BLOCKS_GOAL = 3 * 64
/*
function hasDroppedItem(bot, state, itemNames) {
    const entities = Array.isArray(state.sensors?.items)
        ? state.sensors.items
        : Object.values(bot.entities)

    return entities.some(entity => {
        if (!entity || entity.name !== 'item') return false

        const item = entity.getDroppedItem?.()
        if (!item) return false

        return itemNames.includes(item.name)
    })
}
*/
//POKUSAJ 2 za hasDroppedItem, provjerava i state.sensors.items (ako postoji) i bot.entities
function hasDroppedItem(bot, state, itemNames) {
    const entities = Object.values(bot.entities)

    return entities.some(entity => {
        if (!entity || entity.name !== 'item') return false

        const item = entity.getDroppedItem?.()
        if (!item) return false

        return itemNames.includes(item.name)
    })
}

function pickUpEndPrepLootScore(bot, state, config) {
    const importantLoot = [
        'feather', 'chicken', 'cooked_chicken', 'string', 'dirt', 'cobblestone', 'cobbled_deepslate', 'oak_log',
        'birch_log', 'spruce_log', 'jungle_log', 'acacia_log', 'dark_oak_log', 'netherrack', 'carved_pumpkin'
    ]

    if (hasDroppedItem(bot, state, importantLoot)) {
        return 200
    }

    return 0
}

function collectFeathersScore(bot, state, config) {
    const featherCount = numOfItems(bot, ['feather'])

    if (featherCount >= FEATHER_GOAL) {
        return 0
    }

    if (state.chickenTarget) {
        return 160
    }

    return 160
}

function collectStringScore(bot, state, config) {
    const stringCount = numOfItems(bot, ['string'])

    if (stringCount >= STRING_GOAL) {
        return 0
    }

    if (state.spiderTarget) {
        return 150
    }

    return 150
}

function gatherBlocksScore(bot, state, config) {
    const gatherBlockCount = numOfItems(bot, config.GATHER_BLOCK_ITEMS ?? [])

    if (gatherBlockCount >= GATHER_BLOCKS_GOAL) {
        return 0
    }

    return 100
}

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
        return 140
    }

    //inace treba ići po pumpkin
    return 140
}

module.exports = { pickUpEndPrepLootScore, collectFeathersScore, collectStringScore, gatherBlocksScore, getPumpkinHelmetScore }
const { numOfItems } = require('../../utils/inventory')

const FEATHER_GOAL = 64
const STRING_GOAL = 64

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

function pickUpEndPrepLootScore(bot, state, config) {
    const importantLoot = [
        'feather',
        'chicken',
        'cooked_chicken',
        'string'
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

module.exports = { pickUpEndPrepLootScore, collectFeathersScore, collectStringScore, }
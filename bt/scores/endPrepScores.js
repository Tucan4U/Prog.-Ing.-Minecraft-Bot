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
        'feather', 'string', 'carved_pumpkin', 'ender_eye',
    ]

    if (hasDroppedItem(bot, state, importantLoot)) {
        console.log("[LOOT] Loot detected")
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

    return 30
}
function hasItem(bot, itemName) {
    return bot.inventory.items().some(item => item.name === itemName)
}
function hasDroppedItemNearby(bot, itemName) {
    return Object.values(bot.entities).some(entity => {
        if (!entity || entity.name !== 'item') return false

        const item = entity.getDroppedItem?.()
        return item?.name === itemName
    })
}

function hasNearbyBlock(bot, blockName, maxDistance = 64) {
    const blockId = bot.registry.blocksByName[blockName]?.id
    if (!blockId) return false

    const blocks = bot.findBlocks({
        matching: blockId,
        maxDistance,
        count: 1,
    })

    return blocks.length > 0
}

// Score funkcija koja procjenjuje treba li bot ići po pumpkin helmet
function getPumpkinHelmetScore(bot, state, config) {
    const helmetSlot = bot.inventory.slots[5]

    if (helmetSlot && helmetSlot.name === 'carved_pumpkin') {
        return 0
    }

    if (hasItem(bot, 'carved_pumpkin')) {
        return 140
    }

    if (hasDroppedItemNearby(bot, 'carved_pumpkin')) {
        return 140
    }

    if (hasNearbyBlock(bot, 'carved_pumpkin', config.BLOCKS.CARVED_PUMPKINS.maxBlockDistance)) {
        return 140
    }

    if (!hasItem(bot, 'shears')) {
        return 0
    }

    if (hasNearbyBlock(bot, 'pumpkin', config.BLOCKS.PUMPKINS.maxBlockDistance)) {
        return 140
    }

    return 0
}

function hasEquippedArmor(bot) {
    const helmet = bot.inventory.slots[5]
    const chestplate = bot.inventory.slots[6]
    const leggings = bot.inventory.slots[7]
    const boots = bot.inventory.slots[8]

    const hasHelmet = helmet && (
        helmet.name.endsWith('_helmet') ||
        helmet.name === 'carved_pumpkin'
    )

    const hasChestplate = chestplate && chestplate.name.endsWith('_chestplate')
    const hasLeggings = leggings && leggings.name.endsWith('_leggings')
    const hasBoots = boots && boots.name.endsWith('_boots')

    return hasHelmet && hasChestplate && hasLeggings && hasBoots
}

function hasAnyInventoryItem(bot, itemNames) {
    return bot.inventory.items().some(item =>
        itemNames.includes(item.name)
    )
}

function hasStrongholdTools(bot, config) {
    return hasAnyInventoryItem(bot, config.WEAPONS ?? []) &&
        hasAnyInventoryItem(bot, config.PICKAXES ?? [])
}


/*
let lastStrongholdMissingChatAt = 0
function chatStrongholdMissing(bot, message) {
    if (Date.now() - lastStrongholdMissingChatAt < 5000) return

    bot.chat(message)
    lastStrongholdMissingChatAt = Date.now()
}
*/
function hasNearbyEndPortalFrame(bot, maxDistance = 200) {
    const frameId = bot.registry.blocksByName.end_portal_frame?.id
    if (!frameId) return false

    const positions = bot.findBlocks({
        matching: frameId,
        maxDistance,
        count: 1,
    })

    return positions.length > 0
}


function locateStrongholdScore(bot, state, config) {
    if (state.strongholdSearch?.found) {
        return 0
    }
    if (hasNearbyEndPortalFrame(bot, 200)) {
        state.strongholdSearch ??= {}
        state.strongholdSearch.found = true
        return 0
    }

    const hasEyeOfEnder = bot.inventory.items().some(item =>
        item.name === 'ender_eye'
    )

    if (!hasEyeOfEnder) {
        //chatStrongholdMissing(bot, 'I need eyes of ender to find the stronghold.')
        return 0
    }

    if (!hasEquippedArmor(bot)) {
        //chatStrongholdMissing(bot, 'Missing armor to explore the stronghold.')
        return 0
    }

    if (!hasStrongholdTools(bot, config)) {
        //chatStrongholdMissing(bot, 'Missing stronghold tools to explore the stronghold.')
        return 0
    }

    return 90
}

function hasGearToEquip(bot) {
    const armorSlots = [
        { suffix: '_helmet', slot: 5 },
        { suffix: '_chestplate', slot: 6 },
        { suffix: '_leggings', slot: 7 },
        { suffix: '_boots', slot: 8 },
    ]

    for (const armorSlot of armorSlots) {
        const equipped = bot.inventory.slots[armorSlot.slot]

        if (armorSlot.slot === 5 && equipped?.name === 'carved_pumpkin') {
            continue
        }

        const hasArmor = bot.inventory.items().some(item =>
            item.name.endsWith(armorSlot.suffix)
        )

        if (hasArmor && !equipped) {
            return true
        }
    }

    const offhand = bot.inventory.slots[45]
    const hasShield = bot.inventory.items().some(item => item.name === 'shield')

    return hasShield && offhand?.name !== 'shield'
}

function equipGearScore(bot, state, config) {
    return hasGearToEquip(bot) ? 180 : 0
}

function findEndPortalScore(bot, state, config) {
    if (!state.strongholdSearch?.found) {
        return 0
    }

    if (state.endPortal?.found) {
        return 0
    }

    return 100
}
function hasEmptyEndPortalFrame(bot, maxDistance = 8) {
    const frameId = bot.registry.blocksByName.end_portal_frame?.id
    if (!frameId) return false

    const positions = bot.findBlocks({
        matching: frameId,
        maxDistance,
        count: 12,
    })

    return positions.some(pos => {
        const block = bot.blockAt(pos)
        if (!block || block.name !== 'end_portal_frame') return false

        const props = block.getProperties?.()
        return props?.eye === false
    })
}


function activateEndPortalScore(bot, state, config) {
    if (!state.endPortal?.found) {
        return 0
    }

    const hasEyeOfEnder = bot.inventory.items().some(item =>
        item.name === 'ender_eye'
    )

    if (!hasEyeOfEnder) {
        return 0
    }

    if (!hasEmptyEndPortalFrame(bot, 8)) {
        return 0
    }

    return 120
}

function hasEndPortalBlock(bot, maxDistance = 12) {
    const portalId = bot.registry.blocksByName.end_portal?.id
    if (!portalId) return false

    const positions = bot.findBlocks({
        matching: portalId,
        maxDistance,
        count: 1,
    })

    return positions.length > 0
}

function enterEndPortalScore(bot, state, config) {
    if (!state.endPortal?.found) {
        return 0
    }

    if (state.enteredEndPortal) {
        return 0
    }

    if (!hasEndPortalBlock(bot, 12)) {
        return 0
    }

    return 130
}

function defendSelfScore(bot, state, config) {
    const target = state.attackerTarget

    if (!target) return 0

    if (!bot.entities[target.id]) {
        state.attackerTarget = null
        return 0
    }

    return 500
}

module.exports = { pickUpEndPrepLootScore, collectFeathersScore, collectStringScore, gatherBlocksScore, 
                    getPumpkinHelmetScore, locateStrongholdScore, equipGearScore,  findEndPortalScore, 
                    activateEndPortalScore, enterEndPortalScore, defendSelfScore }
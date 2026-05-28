const { Node } = require('../behaviorTree')

const ARMOR_RANK = {
    leather: 1, golden: 2, chainmail: 3, 
    iron: 4, diamond: 5, netherite: 6,
}

const ARMOR_SLOTS = [
    { suffix: '_helmet', destination: 'head', slot: 5 },
    { suffix: '_chestplate', destination: 'torso', slot: 6 },
    { suffix: '_leggings', destination: 'legs', slot: 7 },
    { suffix: '_boots', destination: 'feet', slot: 8 },
]

function armorValue(itemName) {
    if (!itemName) return 0

    for (const [material, value] of Object.entries(ARMOR_RANK)) {
        if (itemName.startsWith(material + '_')) {
            return value
        }
    }

    return 0
}

function findBestArmor(bot, suffix) {
    return bot.inventory.items()
        .filter(item => item.name.endsWith(suffix))
        .sort((a, b) => armorValue(b.name) - armorValue(a.name))[0]
}

class EquipGearNode extends Node {
    constructor() {
        super('EquipGear')
    }

    async tick(bot, state, config) {
        try {
            for (const armorSlot of ARMOR_SLOTS) {
                const equipped = bot.inventory.slots[armorSlot.slot]
                const best = findBestArmor(bot, armorSlot.suffix)

                if (!best) continue

                // Ako već ima carved pumpkin, ne skidamo ga automatski.
                if (armorSlot.destination === 'head' && equipped?.name === 'carved_pumpkin') {
                    continue
                }

                const equippedValue = armorValue(equipped?.name)
                const bestValue = armorValue(best.name)

                if (!equipped || bestValue > equippedValue) {
                    await bot.equip(best, armorSlot.destination)
                    return 'SUCCESS'
                }
            }

            const offhand = bot.inventory.slots[45]
            const shield = bot.inventory.items().find(item => item.name === 'shield')

            if (shield && offhand?.name !== 'shield') {
                await bot.equip(shield, 'off-hand')
                return 'SUCCESS'
            }

            return 'FAILURE'
        } catch (err) {
            console.log('[EquipGear] error:', err.message)
            return 'FAILURE'
        }
    }
}

module.exports = EquipGearNode
const { Node } = require('../behaviorTree')

class EquipPumpkinNode extends Node {
    constructor() {
        super('EquipPumpkin')
    }

    async tick(bot, state, config) {
        // Provjeri ima li već pumpkin na glavi - gotovo
        const helmetSlot = bot.inventory.slots[5]
        if (helmetSlot && helmetSlot.name === 'carved_pumpkin') {
            return 'SUCCESS'
        }

        // Nađi carved pumpkin u inventaru
        const carvedPumpkin = bot.inventory.items().find(item => item.name === 'carved_pumpkin')
        if (!carvedPumpkin) {
            return 'FAILURE'
        }

        try {
            // Skini sa glave ako nešto već nosi
            if (helmetSlot) {
                bot.chat(`Skidam ${helmetSlot.name} sa glave...`)
                await bot.unequip('head')
            }

            // Stavi pumpkin na glavu
            await bot.equip(carvedPumpkin, 'head')
            bot.chat("Do I look sexy?!")
            return 'SUCCESS'
        } catch (err) {
            console.log("Equip pumpkin error:", err.message)
            return 'FAILURE'
        }
    }
}

module.exports = EquipPumpkinNode
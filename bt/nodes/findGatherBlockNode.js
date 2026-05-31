const { Node } = require('../behaviorTree')
const mcDataLoader = require('minecraft-data')

function hasAnyItem(bot, itemNames) {
    return bot.inventory.items().some(item => itemNames.includes(item.name))
}

async function equipAnyItem(bot, itemNames) {
    const item = bot.inventory.items().find(item => itemNames.includes(item.name))

    if (!item) {
        return false
    }

    await bot.equip(item, 'hand')
    return true
}



class FindGatherBlockNode extends Node {
    constructor(stateKey = 'gatherBlockTarget', maxBlockDistance = 32) {
        super('FindGatherBlock')
        this.stateKey = stateKey
        this.maxBlockDistance = maxBlockDistance
        this.mcData = null
    }

    

    async tick(bot, state, config) {
        if (!this.mcData) this.mcData = mcDataLoader(bot.version)

        const existingTarget = state[this.stateKey]

        if (existingTarget) {
            const currentBlock = bot.blockAt(existingTarget.position)

            if (currentBlock && currentBlock.name !== 'air') {
                return 'SUCCESS'
            }

            state[this.stateKey] = null
        }

        const blockConfig = config.BLOCKS.GATHER_BLOCKS

        if (!blockConfig || !Array.isArray(blockConfig.names)) {
            console.log('[FindGatherBlock] Missing config.BLOCKS.GATHER_BLOCKS.names')
            return 'FAILURE'
        }

        const matchingIds = blockConfig.names
            .map(name => this.mcData.blocksByName[name]?.id)
            .filter(Boolean)

        if (!matchingIds.length) {
            return 'FAILURE'
        }

        const positions = bot.findBlocks({
            matching: matchingIds,
            maxDistance: this.maxBlockDistance,
            count: 64,
        })

        if (!positions.length) {
            return 'FAILURE'
        }

        const hasPickaxe = hasAnyItem(bot, config.PICKAXES ?? [])

        for (const pos of positions) {
            const block = bot.blockAt(pos)
            if (!block || block.name === 'air') continue

            const needsPickaxe = [
                'stone',
                'cobblestone',
                'cobbled_deepslate',
            ].includes(block.name)

            if (needsPickaxe) {
                if (!hasPickaxe) {
                    continue
                }

                try {
                    await equipAnyItem(bot, config.PICKAXES ?? [])
                } catch (err) {
                    console.log('[FindGatherBlock] Failed to equip pickaxe:', err.message)
                    continue
                }
            }

            state[this.stateKey] = block
            return 'SUCCESS'
        }

        return 'FAILURE'
    }
}

module.exports = FindGatherBlockNode
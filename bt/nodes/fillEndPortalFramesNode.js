const { Node } = require('../behaviorTree')

class FillEndPortalFramesNode extends Node {
    constructor(maxDistance = 8) {
        super('FillEndPortalFrames')
        this.maxDistance = maxDistance
    }

    async tick(bot, state, config) {
        const eye = bot.inventory.items().find(item => item.name === 'ender_eye')
        if (!eye) {
            bot.chat('I need Eye of Ender to activate the portal.')
            return 'FAILURE'
        }

        const frameId = bot.registry.blocksByName.end_portal_frame?.id
        if (!frameId) return 'FAILURE'

        const positions = bot.findBlocks({
            matching: frameId,
            maxDistance: this.maxDistance,
            count: 12,
        })

        if (!positions.length) {
            return 'FAILURE'
        }

        const emptyFrames = positions
            .map(pos => bot.blockAt(pos))
            .filter(block => {
                if (!block || block.name !== 'end_portal_frame') return false

                const props = block.getProperties?.()
                return props?.eye === false
            })

        if (!emptyFrames.length) {
            return 'SUCCESS'
        }

        const frame = emptyFrames[0]

        try {
            await bot.equip(eye, 'hand')
            await bot.lookAt(frame.position.offset(0.5, 0.5, 0.5), true)
            await bot.activateBlock(frame)
            await bot.waitForTicks(10)

            return 'RUNNING'
        } catch (err) {
            console.log('[FillEndPortalFrames] error:', err.message)
            return 'FAILURE'
        }
    }
}

module.exports = FillEndPortalFramesNode
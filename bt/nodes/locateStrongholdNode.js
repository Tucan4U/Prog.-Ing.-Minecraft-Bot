const { Node } = require('../behaviorTree')
const { goals } = require('mineflayer-pathfinder')

class LocateStrongholdNode extends Node {
    constructor() {
        super('LocateStronghold')
        this.isThrowing = false
        this.currentGoalKey = null
    }

    async tick(bot, state, config) {
        if (!state.strongholdSearch) {
            state.strongholdSearch = {
                found: false,
                targetX: null,
                targetZ: null,
                lastThrowAt: 0,
            }
        }

        const search = state.strongholdSearch

        if (search.found) {
            bot.chat('Stronghold should be below/near us.')
            return 'SUCCESS'
        }

        if (search.targetX !== null && search.targetZ !== null) {
            const dx = bot.entity.position.x - search.targetX
            const dz = bot.entity.position.z - search.targetZ
            const dist = Math.sqrt(dx * dx + dz * dz)

            if (dist > 10) {
                const key = `${Math.floor(search.targetX)}:${Math.floor(search.targetZ)}`

                if (this.currentGoalKey !== key || bot.pathfinder.goal === null) {
                    bot.pathfinder.setGoal(new goals.GoalNearXZ(search.targetX, search.targetZ, 6))
                    this.currentGoalKey = key
                }

                return 'RUNNING'
            }

            search.targetX = null
            search.targetZ = null
            this.currentGoalKey = null
        }

        if (Date.now() - search.lastThrowAt < 3000 || this.isThrowing) {
            return 'RUNNING'
        }

        const eye = bot.inventory.items().find(item => item.name === 'ender_eye')
        if (!eye) {
            bot.chat('I need Eye of Ender.')
            return 'FAILURE'
        }

        this.isThrowing = true
        search.lastThrowAt = Date.now()

        try {
            const result = await this.throwEyeAndTrack(bot)

            if (!result) {
                bot.chat('Could not track Eye of Ender.')
                return 'FAILURE'
            }

            if (result.divingDown) {
                search.found = true
                bot.pathfinder.setGoal(null)
                bot.chat('Eye went down. Stronghold should be here!')
                return 'SUCCESS'
            }

            search.targetX = bot.entity.position.x + result.dirX * 80
            search.targetZ = bot.entity.position.z + result.dirZ * 80

            bot.chat(`Stronghold direction found. Moving ${Math.round(result.dirX * 80)}, ${Math.round(result.dirZ * 80)}`)
            return 'RUNNING'
        } catch (err) {
            console.log('[LocateStronghold] error:', err.message)
            return 'FAILURE'
        } finally {
            this.isThrowing = false
        }
    }

    async throwEyeAndTrack(bot) {
        const eye = bot.inventory.items().find(item => item.name === 'ender_eye')
        if (!eye) return null

        const start = bot.entity.position.clone()
        const positions = []

        const onMove = (entity) => {
            if (entity.name === 'eye_of_ender') {
                positions.push(entity.position.clone())
            }
        }

        const onSpawn = (entity) => {
            if (entity.name === 'eye_of_ender') {
                positions.push(entity.position.clone())
            }
        }

        bot.on('entitySpawn', onSpawn)
        bot.on('entityMoved', onMove)

        try {
            await bot.equip(eye, 'hand')
            await bot.lookAt(bot.entity.position.offset(0, 1, 0), true)
            bot.activateItem()

            await new Promise(resolve => setTimeout(resolve, 3500))
        } finally {
            bot.removeListener('entitySpawn', onSpawn)
            bot.removeListener('entityMoved', onMove)
        }

        if (positions.length < 2) return null

        const first = positions[0]
        const last = positions[positions.length - 1]

        const dx = last.x - start.x
        const dz = last.z - start.z
        const len = Math.sqrt(dx * dx + dz * dz)

        if (len < 0.1) return null

        return {
            dirX: dx / len,
            dirZ: dz / len,
            divingDown: last.y < first.y - 2,
        }
    }
}

module.exports = LocateStrongholdNode
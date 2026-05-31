// Filtrira entitete po tipu i imenima iz config-a (npr. ANIMALS, HOSTILES)
function findMobs(bot, filter, entitiesOverride) {
    if (!filter || !filter.type || !Array.isArray(filter.names)) {
        return []
    }

    const allowedNames = new Set(filter.names)
    const entities = Array.isArray(entitiesOverride)
        ? entitiesOverride
        : Object.values(bot.entities)


    // Filtriraj entitete koji su tipa mob/animal i imaju dozvoljeno ime (npr. "chicken", "cow", "pig" za ANIMALS, ili "zombie", "skeleton" za HOSTILES)
    return entities
        .filter(entity => {
            if (!entity) return false
            if (!entity.position) return false
            if (entity === bot.entity) return false

            return allowedNames.has(entity.name)
        })
        .sort((a, b) => {
            const distA = bot.entity.position.distanceTo(a.position)
            const distB = bot.entity.position.distanceTo(b.position)
            return distA - distB
        })
}

module.exports = { findMobs }
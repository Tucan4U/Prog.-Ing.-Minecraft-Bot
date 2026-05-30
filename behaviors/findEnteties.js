function findMobs(bot, filter, entitiesOverride) {
  if (!filter || !filter.type || !Array.isArray(filter.names)) {
    return [];
  }

  const allowedNames = new Set(filter.names);
  const entities = Array.isArray(entitiesOverride)
    ? entitiesOverride
    : Object.values(bot.entities);

  return entities.filter((entity) =>
    entity && entity.type === filter.type && allowedNames.has(entity.name)
  );
} 

function isBabyMob(entity) {
  const meta = entity?.metadata;
  if (!meta) return false;

  return Boolean(meta[17]); // 17 is only for piglins
}

module.exports = { findMobs, isBabyMob };
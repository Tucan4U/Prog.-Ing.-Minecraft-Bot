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

module.exports = { findMobs };
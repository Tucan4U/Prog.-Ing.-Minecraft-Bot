function getClosestEntity(bot, entities) {
  return entities.reduce((closest, e) => {
    if (!closest) return e;

    const dist = bot.entity.position.distanceTo(e.position);
    const closestDist = bot.entity.position.distanceTo(closest.position);

    return dist < closestDist ? e : closest;
  }, null);
}

module.exports = { getClosestEntity };
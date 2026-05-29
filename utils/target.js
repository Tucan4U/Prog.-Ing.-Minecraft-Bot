// Floating Blazes
const { Vec3 } = require('vec3');

function getClosestEntity(bot, entities) {
  return entities.reduce((closest, e) => {
    if (!closest) return e;

    const dist = bot.entity.position.distanceTo(e.position);
    const closestDist = bot.entity.position.distanceTo(closest.position);

    return dist < closestDist ? e : closest;
  }, null);
}

function isDangerousTerrain(blockName) {
  return [
    'lava',
    'air',
    'cave_air',
    'void_air'
  ].includes(blockName);
}

// Checks if the target is floating in the air with no solid ground beneath it, which would indicate that melee combat is unsafe and we should switch to ranged attacks.
function isTargetFloating(bot, target) {
  if (!target) return false;

  const pos = target.position.floored();

  let dangerousBlocks = 0;

  // Check 3x3 area below target
  for (let x = -1; x <= 1; x++) {
    for (let z = -1; z <= 1; z++) {

      const block = bot.blockAt(
        new Vec3(pos.x + x, pos.y - 1, pos.z + z)
      );

      if (!block || isDangerousTerrain(block.name)) {
        dangerousBlocks++;
      }
    }
  }

  // If majority unsafe => ranged
  return dangerousBlocks >= 7;
}

module.exports = { getClosestEntity, isTargetFloating };
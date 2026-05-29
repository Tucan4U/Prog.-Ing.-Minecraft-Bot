// Utility: checks whether the bot has a clear line of sight to a target entity.
// Uses ray-style sampling between bot eye position and target eye position.

const { Vec3 } = require('vec3');

function hasLineOfSight(bot, target) {
  // Return false if no target is provided
  if (!target) return false;

  // Starting point: bot eye position
  const from = bot.entity.position.offset(0, bot.entity.height, 0);

  // End point: target eye/head position
  const to = target.position.offset(0, target.height || 1.6, 0);

  // Normalized direction vector from bot to target
  const direction = to.minus(from).normalize();

  // Total distance between bot and target
  const distance = from.distanceTo(to);

  // Step through the path in small increments
  for (let i = 0; i < distance; i += 0.5) {
    // Current sampled position along the ray
    const pos = from.plus(direction.scaled(i));

    // Get block at sampled position
    const block = bot.blockAt(pos);

    // If a solid block is detected, line of sight is blocked
    if (
      block &&
      block.boundingBox === 'block' &&
      block.name !== 'air'
    ) {
      return false;
    }
  }

  // No obstacles found → target is visible
  return true;
}

module.exports = { hasLineOfSight };
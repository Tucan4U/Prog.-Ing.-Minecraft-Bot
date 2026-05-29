function attackTarget(bot, target) {
  // If there is no target, stop attacking and return early
  if (!target) {
    if (bot.pvp.target) {
      bot.pvp.stop();
    }
    return;
  }

  const dist = bot.entity.position.distanceTo(target.position);

  // Begin PvP attack if not already attacking this target
  if (bot.pvp.target !== target) {
    bot.pvp.attack(target);
  }
}

module.exports = { attackTarget };
function attackTarget(bot, target) {
  if (!target) return;

  const dist = bot.entity.position.distanceTo(target.position);

  if (dist < 4) {
    bot.lookAt(target.position);
    bot.attack(target, true); // koristi cooldown
  }
}

module.exports = { attackTarget };
function findAnimals(bot, ANIMALS) {
  return Object.values(bot.entities).filter(e =>
    e.type === 'animal' && ANIMALS.includes(e.name)
  );
}

module.exports = { findAnimals };
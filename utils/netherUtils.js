// Function to check if we have enough ender eyes to exit the Nether. Returns the count of ender eyes.
function checkEnderEyesPosession(bot, state, config) {
  // In manual mode, the number of ender eyes is not important
  if (state.mission?.netherMode === config.NETHER_MODES.MANUAL) return true;

  const enderEyesNum = bot.registry.itemsByName['ender_eye'];
  const enderEyesCount = enderEyesNum ? bot.inventory.count(enderEyesNum.id, null) : 0;

  //bot.chat(`Ender eyes in posession: ${enderEyesCount}`);
  return enderEyesCount >= 12;
}

function hasRequiredNetherItem(bot, state, config, itemName) {
  const item = bot.registry.itemsByName[itemName];
  return item ? bot.inventory.count(item.id, null) : 0;
}

module.exports = { checkEnderEyesPosession, hasRequiredNetherItem };